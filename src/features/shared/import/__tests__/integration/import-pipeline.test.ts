// Integration tests for the import pipeline using real database
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { importActivities } from '@/features/shared/import/import-activities';
import { importDeals } from '@/features/shared/import/import-deals';
import { importOrganizations } from '@/features/shared/import/import-organizations';
import { importPeople } from '@/features/shared/import/import-people';
import { runImportPipeline } from '@/features/shared/import/orchestrator';
import { ImportSessionStatus, ImportSource } from '@/generated/prisma/enums';

import {
  db,
  getTestUserId,
  setupIntegrationTests,
  teardownIntegrationTests,
  withTestTransaction,
} from './setup';

describe('Import Pipeline Integration Tests', () => {
  beforeAll(async () => {
    await setupIntegrationTests();
  });

  afterAll(async () => {
    await teardownIntegrationTests();
  });

  describe('importOrganizations', () => {
    it('should import organizations from CSV', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        // Create import session first
        await tx.importSession.create({
          data: {
            id: 'test-session-orgs',
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-orgs.csv',
            fileSize: 100,
            createdById: userId,
            status: ImportSessionStatus.RUNNING,
          },
        });

        const csvContent = `Organization - ID,Organization - Name
test-org-1,Test Org 1
test-org-2,Test Org 2`;

        const result = await importOrganizations(
          'test-session-orgs',
          userId,
          csvContent,
          false,
          undefined,
          tx
        );

        expect(result.created).toBe(2);
        expect(result.updated).toBe(0);
        expect(result.failed).toBe(0);

        // Verify in database
        const orgs = await tx.organization.findMany({
          where: { name: { in: ['Test Org 1', 'Test Org 2'] } },
        });
        expect(orgs).toHaveLength(2);
      });
    });

    it('should deduplicate organizations by name against existing database records', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        // Create import session first
        await tx.importSession.create({
          data: {
            id: 'test-session-dedup',
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-dedup.csv',
            fileSize: 100,
            createdById: userId,
            status: ImportSessionStatus.RUNNING,
          },
        });

        // Pre-create an organization with the same name
        await tx.organization.create({
          data: {
            name: 'Duplicate Org',
            ownerId: userId,
            createdById: userId,
            updatedById: userId,
          },
        });

        const csvContent = `Organization - ID,Organization - Name
test-org-3,Duplicate Org
test-org-4,Another Org`;

        const result = await importOrganizations(
          'test-session-dedup',
          userId,
          csvContent,
          false,
          undefined,
          tx
        );

        // First org should be updated (exists in DB), second should be created
        expect(result.created).toBe(1);
        expect(result.updated).toBe(1);
        expect(result.failed).toBe(0);

        // Should have two orgs in DB (one pre-existing, one new)
        const orgs = await tx.organization.findMany({
          where: { name: { in: ['Duplicate Org', 'Another Org'] } },
        });
        expect(orgs).toHaveLength(2);
      });
    });

    it('should handle invalid rows', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        // Create import session first
        await tx.importSession.create({
          data: {
            id: 'test-session-invalid',
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-invalid.csv',
            fileSize: 100,
            createdById: userId,
            status: ImportSessionStatus.RUNNING,
          },
        });

        const csvContent = `Organization - ID,Organization - Name
test-org-5,Valid Org
,Invalid Org`;

        const result = await importOrganizations(
          'test-session-invalid',
          userId,
          csvContent,
          false,
          undefined,
          tx
        );

        expect(result.created).toBe(1);
        expect(result.failed).toBe(1);
      });
    });
  });

  describe('importPeople', () => {
    it('should import people with organization references', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        // Create import session first
        await tx.importSession.create({
          data: {
            id: 'test-session-people',
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-people.csv',
            fileSize: 100,
            createdById: userId,
            status: ImportSessionStatus.RUNNING,
          },
        });

        // First create an org with external ID matching CSV
        const org = await tx.organization.create({
          data: {
            name: 'Test Org for People',
            ownerId: userId,
            createdById: userId,
            updatedById: userId,
          },
        });

        const csvContent = `Person - ID,Person - Name,Person - Email - Work,Person - Email - Home,Person - Email - Other,Person - Phone - Work,Person - Phone - Home,Person - Phone - Mobile,Person - Phone - Other,Person - Organization,Person - Organization ID,Person - Owner
test-person-1,John Doe,john@test.com,,,+1234567890,,,,org-001,org-001,`;

        // orgIdMap maps external ID (from CSV) to internal database ID
        const result = await importPeople(
          'test-session-people',
          userId,
          csvContent,
          new Map([['org-001', org.id]]), // orgIdMap
          false,
          undefined,
          tx
        );

        expect(result.created).toBe(1);
        expect(result.failed).toBe(0);

        const people = await tx.person.findMany({
          where: { emails: { some: { email: 'john@test.com' } } },
          include: { emails: true, phones: true },
        });
        expect(people).toHaveLength(1);
        expect(people[0].organizationId).toBe(org.id);
      });
    });

    it('should deduplicate people by email against existing database records', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        // Create import session first
        await tx.importSession.create({
          data: {
            id: 'test-session-people-dedup',
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-people-dedup.csv',
            fileSize: 100,
            createdById: userId,
            status: ImportSessionStatus.RUNNING,
          },
        });

        // Pre-create a person with the same email
        await tx.person.create({
          data: {
            name: 'Existing Person',
            ownerId: userId,
            createdById: userId,
            updatedById: userId,
            emails: {
              create: { email: 'john@dedup.com', category: 'WORK' },
            },
          },
        });

        const csvContent = `Person - ID,Person - Name,Person - Email - Work,Person - Email - Home,Person - Email - Other,Person - Phone - Work,Person - Phone - Home,Person - Phone - Mobile,Person - Phone - Other,Person - Organization,Person - Organization ID,Person - Owner
test-person-2,John Doe,john@dedup.com,,,+1234567890,,,,,,
test-person-3,Jane Smith,jane@dedup.com,,,+1234567891,,,,,,`;

        const result = await importPeople(
          'test-session-people-dedup',
          userId,
          csvContent,
          new Map(),
          false,
          undefined,
          tx
        );

        // First person should be updated (exists in DB), second should be created
        expect(result.created).toBe(1);
        expect(result.updated).toBe(1);
        expect(result.failed).toBe(0);
      });
    });
  });

  describe('importDeals', () => {
    it('should import deals with person and org references', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        // Create import session first
        await tx.importSession.create({
          data: {
            id: 'test-session-deals',
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-deals.csv',
            fileSize: 100,
            createdById: userId,
            status: ImportSessionStatus.RUNNING,
          },
        });

        // Create person and org with external IDs matching CSV
        const org = await tx.organization.create({
          data: {
            name: 'Deal Test Org',
            ownerId: userId,
            createdById: userId,
            updatedById: userId,
          },
        });
        const person = await tx.person.create({
          data: {
            name: 'Deal Test Person',
            ownerId: userId,
            createdById: userId,
            updatedById: userId,
          },
        });

        const csvContent = `Deal - ID,Deal - Title,Deal - Value,Deal - Currency of Value,Deal - Stage,Deal - Status,Deal - Expected close date,Deal - Contact person ID,Deal - Organization ID,Deal - Owner
test-deal-1,Test Deal Import,10000,USD,Qualified,Open,2026-12-31,person-001,org-001,`;

        // Maps use external IDs from CSV to internal database IDs
        const result = await importDeals(
          'test-session-deals',
          userId,
          csvContent,
          new Map([['person-001', person.id]]), // personIdMap
          new Map([['org-001', org.id]]), // orgIdMap
          false,
          undefined,
          tx
        );

        expect(result.created).toBe(1);
        expect(result.failed).toBe(0);

        const deals = await tx.deal.findMany({
          where: { title: 'Test Deal Import' },
        });
        expect(deals).toHaveLength(1);
        expect(deals[0].personId).toBe(person.id);
        expect(deals[0].organizationId).toBe(org.id);
      });
    });
  });

  describe('importActivities', () => {
    it('should import activities with references', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        // Create import session first
        await tx.importSession.create({
          data: {
            id: 'test-session-activities',
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-activities.csv',
            fileSize: 100,
            createdById: userId,
            status: ImportSessionStatus.RUNNING,
          },
        });

        const org = await tx.organization.create({
          data: {
            name: 'Activity Test Org',
            ownerId: userId,
            createdById: userId,
            updatedById: userId,
          },
        });
        const person = await tx.person.create({
          data: {
            name: 'Activity Test Person',
            ownerId: userId,
            createdById: userId,
            updatedById: userId,
          },
        });
        const deal = await tx.deal.create({
          data: {
            title: 'Activity Test Deal',
            value: 1000,
            currency: 'USD',
            stage: 'QUALIFIED',
            status: 'OPEN',
            expectedCloseDate: new Date('2026-12-31'),
            personId: person.id,
            organizationId: org.id,
            ownerId: userId,
            createdById: userId,
            updatedById: userId,
          },
        });

        const csvContent = `Activity - ID,Activity - Subject,Activity - Type,Activity - Done,Activity - Deal ID,Activity - Contact person ID,Activity - Organization ID,Activity - Assigned to user,Activity - Due date,Activity - Due time,Activity - Duration,Activity - Note
test-activity-1,Test Activity,Call,0,deal-001,person-001,org-001,,2026-01-15,10:00,30,`;

        // Maps use external IDs from CSV to internal database IDs
        const result = await importActivities(
          'test-session-activities',
          userId,
          csvContent,
          new Map([['deal-001', deal.id]]), // dealIdMap
          new Map([['person-001', person.id]]), // personIdMap
          new Map([['org-001', org.id]]), // orgIdMap
          false,
          undefined,
          tx
        );

        expect(result.created).toBe(1);
        expect(result.failed).toBe(0);

        const activities = await tx.activity.findMany({
          where: { subject: 'Test Activity' },
        });
        expect(activities).toHaveLength(1);
        expect(activities[0].dealId).toBe(deal.id);
      });
    });
  });

  describe('Full Pipeline', () => {
    it('should run complete import pipeline', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        const orgsCsv = `Organization - ID,Organization - Name,Organization - Owner
pipeline-org-1,Pipeline Org 1,
pipeline-org-2,Pipeline Org 2,`;

        const peopleCsv = `Person - ID,Person - Name,Person - Email - Work,Person - Email - Home,Person - Email - Other,Person - Phone - Work,Person - Phone - Home,Person - Phone - Mobile,Person - Phone - Other,Person - Organization,Person - Organization ID,Person - Owner
pipeline-person-1,Pipeline Person 1,person1@test.com,,,+1111111111,,,,pipeline-org-1,pipeline-org-1,
pipeline-person-2,Pipeline Person 2,person2@test.com,,,+2222222222,,,,pipeline-org-2,pipeline-org-2,`;

        const dealsCsv = `Deal - ID,Deal - Title,Deal - Value,Deal - Currency of Value,Deal - Stage,Deal - Status,Deal - Expected close date,Deal - Contact person ID,Deal - Organization ID,Deal - Owner
pipeline-deal-1,Pipeline Deal 1,50000,USD,Qualified,Open,2026-12-31,pipeline-person-1,pipeline-org-1,
pipeline-deal-2,Pipeline Deal 2,75000,USD,Proposal,Open,2027-01-31,pipeline-person-2,pipeline-org-2,`;

        const activitiesCsv = `Activity - ID,Activity - Subject,Activity - Type,Activity - Done,Activity - Deal ID,Activity - Contact person ID,Activity - Organization ID,Activity - Assigned to user,Activity - Due date,Activity - Due time,Activity - Duration,Activity - Note
pipeline-activity-1,Pipeline Activity 1,Call,0,,pipeline-person-1,pipeline-org-1,,2026-01-15,10:00,30,`;

        const sessionId = 'test-pipeline-full';

        // Create import session
        const session = await tx.importSession.create({
          data: {
            id: sessionId,
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-pipeline.csv',
            fileSize: 1000,
            createdById: userId,
            status: ImportSessionStatus.PENDING,
          },
        });

        const result = await runImportPipeline({
          sessionId,
          userId,
          organizationsCsv: orgsCsv,
          peopleCsv: peopleCsv,
          dealsCsv: dealsCsv,
          activitiesCsv: activitiesCsv,
          debug: true,
          tx,
        });

        expect(result.organizations.created).toBe(2);
        expect(result.people.created).toBe(2);
        expect(result.deals.created).toBe(2);
        expect(result.activities.created).toBe(1);
        expect(result.totalErrors).toBe(0);

        // Verify session completed
        const sessionResult = await tx.importSession.findUnique({
          where: { id: sessionId },
        });
        expect(sessionResult?.status).toBe(ImportSessionStatus.COMPLETED);
      });
    });
  });

  describe('Progress Tracking', () => {
    it('should update currentPhase correctly through all phases', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        const sessionId = 'test-progress-phases';

        // Create import session
        await tx.importSession.create({
          data: {
            id: sessionId,
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-progress.csv',
            fileSize: 1000,
            createdById: userId,
            status: ImportSessionStatus.PENDING,
          },
        });

        const orgsCsv = `Organization - ID,Organization - Name,Organization - Owner
prog-org-1,Progress Org 1,
prog-org-2,Progress Org 2,`;

        const peopleCsv = `Person - ID,Person - Name,Person - Email - Work,Person - Email - Home,Person - Email - Other,Person - Phone - Work,Person - Phone - Home,Person - Phone - Mobile,Person - Phone - Other,Person - Organization,Person - Organization ID,Person - Owner
prog-person-1,Progress Person 1,person1@test.com,,,+1111111111,,,,prog-org-1,prog-org-1,
prog-person-2,Progress Person 2,person2@test.com,,,+2222222222,,,,prog-org-2,prog-org-2,`;

        const dealsCsv = `Deal - ID,Deal - Title,Deal - Value,Deal - Currency of Value,Deal - Stage,Deal - Status,Deal - Expected close date,Deal - Contact person ID,Deal - Organization ID,Deal - Owner
prog-deal-1,Progress Deal 1,50000,USD,Qualified,Open,2026-12-31,prog-person-1,prog-org-1,
prog-deal-2,Progress Deal 2,75000,USD,Proposal,Open,2027-01-31,prog-person-2,prog-org-2,`;

        const activitiesCsv = `Activity - ID,Activity - Subject,Activity - Type,Activity - Done,Activity - Deal ID,Activity - Contact person ID,Activity - Organization ID,Activity - Assigned to user,Activity - Due date,Activity - Due time,Activity - Duration,Activity - Note
prog-activity-1,Progress Activity 1,Call,0,,prog-person-1,prog-org-1,,2026-01-15,10:00,30,`;

        // Track progress updates
        const progressUpdates: Array<{ phase: string; entityType: string }> =
          [];

        const result = await runImportPipeline({
          sessionId,
          userId,
          organizationsCsv: orgsCsv,
          peopleCsv: peopleCsv,
          dealsCsv: dealsCsv,
          activitiesCsv: activitiesCsv,
          debug: true,
          tx,
          onProgress: (progress) => {
            progressUpdates.push({
              phase: progress.phase,
              entityType: progress.currentEntityType || '',
            });
          },
        });

        // Verify all phases were executed
        expect(result.organizations.created).toBe(2);
        expect(result.people.created).toBe(2);
        expect(result.deals.created).toBe(2);
        expect(result.activities.created).toBe(1);

        // Verify progress updates were called for each phase
        const phases = progressUpdates.map((p) => p.phase);
        expect(phases).toContain('organizations');
        expect(phases).toContain('people');
        expect(phases).toContain('deals');
        expect(phases).toContain('activities');
        expect(phases).toContain('complete');

        // Verify entity types were tracked
        const entityTypes = progressUpdates
          .map((p) => p.entityType)
          .filter(Boolean);
        expect(entityTypes).toContain('ORGANIZATION');
        expect(entityTypes).toContain('PERSON');
        expect(entityTypes).toContain('DEAL');
        expect(entityTypes).toContain('ACTIVITY');
      });
    });

    it('should maintain correct entity statistics during phase transitions', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        const sessionId = 'test-stats-transition';

        // Create import session
        await tx.importSession.create({
          data: {
            id: sessionId,
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-stats.csv',
            fileSize: 1000,
            createdById: userId,
            status: ImportSessionStatus.PENDING,
          },
        });

        const orgsCsv = `Organization - ID,Organization - Name,Organization - Owner
stat-org-1,Stats Org 1,
stat-org-2,Stats Org 2,`;

        const peopleCsv = `Person - ID,Person - Name,Person - Email - Work,Person - Email - Home,Person - Email - Other,Person - Phone - Work,Person - Phone - Home,Person - Phone - Mobile,Person - Phone - Other,Person - Organization,Person - Organization ID,Person - Owner
stat-person-1,Stats Person 1,person1@test.com,,,+1111111111,,,,stat-org-1,stat-org-1,
stat-person-2,Stats Person 2,person2@test.com,,,+2222222222,,,,stat-org-2,stat-org-2,`;

        // Run only organizations and people phases
        const result = await runImportPipeline({
          sessionId,
          userId,
          organizationsCsv: orgsCsv,
          peopleCsv: peopleCsv,
          debug: true,
          tx,
        });

        // Verify organization stats are correct after organizations phase
        expect(result.organizations.created).toBe(2);
        expect(result.organizations.updated).toBe(0);
        expect(result.organizations.failed).toBe(0);

        // Verify people stats are correct
        expect(result.people.created).toBe(2);
        expect(result.people.updated).toBe(0);
        expect(result.people.failed).toBe(0);

        // Verify database has correct counts
        const orgRecords = await tx.importRecord.findMany({
          where: { sessionId, entityType: 'ORGANIZATION' },
        });
        const peopleRecords = await tx.importRecord.findMany({
          where: { sessionId, entityType: 'PERSON' },
        });

        const orgCreated = orgRecords.filter(
          (r) => r.status === 'CREATED'
        ).length;
        const peopleCreated = peopleRecords.filter(
          (r) => r.status === 'CREATED'
        ).length;

        expect(orgCreated).toBe(2);
        expect(peopleCreated).toBe(2);
      });
    });

    it('should update in-memory progress store with real-time entity progress', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        const sessionId = 'test-memory-progress';

        // Create import session
        await tx.importSession.create({
          data: {
            id: sessionId,
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-memory.csv',
            fileSize: 1000,
            createdById: userId,
            status: ImportSessionStatus.PENDING,
          },
        });

        const orgsCsv = `Organization - ID,Organization - Name,Organization - Owner
mem-org-1,Memory Org 1,
mem-org-2,Memory Org 2,
mem-org-3,Memory Org 3,`;

        await runImportPipeline({
          sessionId,
          userId,
          organizationsCsv: orgsCsv,
          debug: true,
          tx,
        });

        // Check database progress - after completion it should show 'complete' phase
        const session = await tx.importSession.findUnique({
          where: { id: sessionId },
        });
        expect(session).not.toBeNull();
        expect(session?.currentPhase).toBe('complete');
        expect(session?.processedRecords).toBe(3);
      });
    });

    it('should persist progress to database periodically', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        const sessionId = 'test-persist-progress';

        // Create import session
        await tx.importSession.create({
          data: {
            id: sessionId,
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-persist.csv',
            fileSize: 1000,
            createdById: userId,
            status: ImportSessionStatus.PENDING,
          },
        });

        const orgsCsv = `Organization - ID,Organization - Name,Organization - Owner
persist-org-1,Persist Org 1,
persist-org-2,Persist Org 2,`;

        await runImportPipeline({
          sessionId,
          userId,
          organizationsCsv: orgsCsv,
          debug: true,
          tx,
        });

        // Check database has progress persisted
        const session = await tx.importSession.findUnique({
          where: { id: sessionId },
        });

        expect(session?.currentEntityType).toBe('ORGANIZATION');
        expect(session?.currentEntityTotal).toBe(2);
        expect(session?.currentEntityProcessed).toBe(2);
        expect(session?.processedRecords).toBe(2);
      });
    });

    it('should not show wrong statistics when transitioning between phases', async () => {
      await withTestTransaction(async (tx) => {
        const userId = await getTestUserId(tx);
        const sessionId = 'test-no-stats-leak';

        // Create import session
        await tx.importSession.create({
          data: {
            id: sessionId,
            source: ImportSource.PIPEDRIVE,
            fileName: 'test-no-leak.csv',
            fileSize: 1000,
            createdById: userId,
            status: ImportSessionStatus.PENDING,
          },
        });

        const orgsCsv = `Organization - ID,Organization - Name,Organization - Owner
leak-org-1,Leak Org 1,
leak-org-2,Leak Org 2,`;

        const peopleCsv = `Person - ID,Person - Name,Person - Email - Work,Person - Email - Home,Person - Email - Other,Person - Phone - Work,Person - Phone - Home,Person - Phone - Mobile,Person - Phone - Other,Person - Organization,Person - Organization ID,Person - Owner
leak-person-1,Leak Person 1,person1@test.com,,,+1111111111,,,,leak-org-1,leak-org-1,
leak-person-2,Leak Person 2,person2@test.com,,,+2222222222,,,,leak-org-2,leak-org-2,`;

        // Run full pipeline
        await runImportPipeline({
          sessionId,
          userId,
          organizationsCsv: orgsCsv,
          peopleCsv: peopleCsv,
          debug: true,
          tx,
        });

        // Verify organization stats are NOT affected by people phase
        const orgRecords = await tx.importRecord.findMany({
          where: { sessionId, entityType: 'ORGANIZATION' },
        });
        const peopleRecords = await tx.importRecord.findMany({
          where: { sessionId, entityType: 'PERSON' },
        });

        const orgCreated = orgRecords.filter(
          (r) => r.status === 'CREATED'
        ).length;
        const orgUpdated = orgRecords.filter(
          (r) => r.status === 'UPDATED'
        ).length;
        const orgFailed = orgRecords.filter(
          (r) => r.status === 'FAILED'
        ).length;

        const peopleCreated = peopleRecords.filter(
          (r) => r.status === 'CREATED'
        ).length;
        const peopleUpdated = peopleRecords.filter(
          (r) => r.status === 'UPDATED'
        ).length;
        const peopleFailed = peopleRecords.filter(
          (r) => r.status === 'FAILED'
        ).length;

        // Organizations should only have their own stats
        expect(orgCreated).toBe(2);
        expect(orgUpdated).toBe(0);
        expect(orgFailed).toBe(0);

        // People should only have their own stats
        expect(peopleCreated).toBe(2);
        expect(peopleUpdated).toBe(0);
        expect(peopleFailed).toBe(0);

        // Total records should match
        expect(orgRecords.length).toBe(2);
        expect(peopleRecords.length).toBe(2);
      });
    });
  });
});
