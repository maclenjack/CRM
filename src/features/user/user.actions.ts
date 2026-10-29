'use server';

import { revalidatePath } from 'next/cache';

import { actionPipeline } from '@/features/shared/actions/action-pipeline';
import { createSearchAction } from '@/features/shared/actions/search-factory';
import { DeleteUserSchema } from '@/features/user/user.validation';
import type { UserModel } from '@/generated/prisma/models';
import prisma from '@/lib/prisma';

export async function hardDeleteUser(id: string) {
  return actionPipeline({
    schema: DeleteUserSchema,
    rawInput: { id },
    actionName: 'DeleteOrganization',
    handler: async ({ id: userId }) => {
      const startTime = Date.now();

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });

      if (!user) {
        console.warn(
          `[E2E CLEANUP] ⚠️ Deletion skipped. No user found with id: ${userId}`
        );
        return { success: false, reason: 'User not found' };
      }

      console.log(
        `[E2E CLEANUP] Starting hard-delete process for: ${user.email}`
      );

      const summary = await prisma.$transaction(async (tx) => {
        // 1. Delete deeply nested dependencies first
        const notes = await tx.note.deleteMany({
          where: { createdById: userId },
        });
        const personEmails = await tx.personEmail.deleteMany({
          where: { person: { ownerId: userId } },
        });
        const personPhones = await tx.personPhone.deleteMany({
          where: { person: { ownerId: userId } },
        });

        // 2. Delete main entity tables dependent on the user
        const activities = await tx.activity.deleteMany({
          where: { ownerId: userId },
        });
        const deals = await tx.deal.deleteMany({ where: { ownerId: userId } });
        const people = await tx.person.deleteMany({
          where: { ownerId: userId },
        });
        const organizations = await tx.organization.deleteMany({
          where: { ownerId: userId },
        });
        const labels = await tx.label.deleteMany({
          where: { createdById: userId },
        });

        // 3. Delete Import Sessions (and their records cascade)
        const importSessions = await tx.importSession.deleteMany({
          where: { createdById: userId },
        });

        // 4. Delete NextAuth data
        const accounts = await tx.account.deleteMany({ where: { userId } });
        const sessions = await tx.session.deleteMany({ where: { userId } });

        // 5. Finally, delete the user safely
        await tx.user.delete({ where: { id: userId } });

        return {
          notes: notes.count,
          contactDetails: personEmails.count + personPhones.count,
          activities: activities.count,
          deals: deals.count,
          people: people.count,
          organizations: organizations.count,
          labels: labels.count,
          importSessions: importSessions.count,
          authSessions: accounts.count + sessions.count,
        };
      });

      const duration = Date.now() - startTime;

      // 3. Print a clean, readable diagnostic report to your server console
      console.log(
        `[E2E CLEANUP] ✅ Successfully purged user "${user.name}" (${userId}) in ${duration}ms.`
      );
      console.table(summary); // Displays your metrics as a clean tabular grid

      revalidatePath('/users');

      return { success: true, summary, duration };
    },
  });
}

export async function deleteAllUserData() {
  return actionPipeline({
    schema: DeleteUserSchema,
    rawInput: { id: 'all' },
    actionName: 'DeleteAllUserData',
    handler: async () => {
      const startTime = Date.now();

      console.log('[E2E CLEANUP] Starting delete all user data process');

      const summary = await prisma.$transaction(async (tx) => {
        // Delete in order of dependencies
        const notes = await tx.note.deleteMany({});
        const personEmails = await tx.personEmail.deleteMany({});
        const personPhones = await tx.personPhone.deleteMany({});
        const activities = await tx.activity.deleteMany({});
        const deals = await tx.deal.deleteMany({});
        const people = await tx.person.deleteMany({});
        const organizations = await tx.organization.deleteMany({});
        const labels = await tx.label.deleteMany({});
        const importRecords = await tx.importRecord.deleteMany({});
        const importSessions = await tx.importSession.deleteMany({});

        return {
          notes: notes.count,
          contactDetails: personEmails.count + personPhones.count,
          activities: activities.count,
          deals: deals.count,
          people: people.count,
          organizations: organizations.count,
          labels: labels.count,
          importRecords: importRecords.count,
          importSessions: importSessions.count,
        };
      });

      const duration = Date.now() - startTime;

      console.log(
        `[E2E CLEANUP] ✅ Successfully purged all user data in ${duration}ms.`
      );
      console.table(summary);

      revalidatePath('/users');
      revalidatePath('/deals');
      revalidatePath('/contacts');
      revalidatePath('/organizations');
      revalidatePath('/activities');

      return { success: true, summary, duration };
    },
  });
}

export const searchUsers = createSearchAction<UserModel, typeof prisma.user>(
  prisma.user,
  {
    searchField: 'name',
    selectFields: { id: true, name: true, email: true },
    limit: 15,
    ownerField: null,
  }
);
