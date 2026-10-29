import { config } from '@dotenvx/dotenvx';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma/client';

config({ path: ['.env.local', '.env'] });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function main() {
  console.log('🌱 Starting seed...');

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Smith',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Johnson',
      role: 'USER',
    },
  });

  console.log('✓ Created users');

  // Create organizations
  const org1 = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
      ownerId: user1.id,
      createdById: user1.id,
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'TechStart Inc',
      ownerId: user2.id,
      createdById: user2.id,
    },
  });

  console.log('✓ Created organizations');

  // Create people
  const person1 = await prisma.person.create({
    data: {
      name: 'John Doe',
      organizationId: org1.id,
      ownerId: user1.id,
      createdById: user1.id,
      emails: {
        create: [
          { email: 'john@acme.com', category: 'WORK' },
          { email: 'john.doe@personal.com', category: 'PERSONAL' },
        ],
      },
      phones: {
        create: [{ phone: '+1 555 0100', category: 'WORK' }],
      },
    },
  });

  const person2 = await prisma.person.create({
    data: {
      name: 'Jane Wilson',
      organizationId: org2.id,
      ownerId: user2.id,
      createdById: user2.id,
      emails: {
        create: [{ email: 'jane@techstart.com', category: 'WORK' }],
      },
      phones: {
        create: [{ phone: '+1 555 0200', category: 'WORK' }],
      },
    },
  });

  console.log('✓ Created people with emails and phones');

  // Create labels
  const labelSales = await prisma.label.create({
    data: {
      name: 'Sales',
      createdById: user1.id,
    },
  });

  const labelHotLead = await prisma.label.create({
    data: {
      name: 'Hot Lead',
      createdById: user1.id,
    },
  });

  console.log('✓ Created labels');

  // Create deals
  const deal1 = await prisma.deal.create({
    data: {
      title: 'Enterprise Software License',
      value: 15000.0,
      currency: 'NZD',
      stage: 'PROPOSAL_MADE',
      status: 'OPEN',
      priority: 'HIGH',
      personId: person1.id,
      organizationId: org1.id,
      ownerId: user1.id,
      createdById: user1.id,
      expectedCloseDate: new Date('2026-07-31'),
      labels: {
        connect: [{ id: labelSales.id }, { id: labelHotLead.id }],
      },
    },
  });

  const deal2 = await prisma.deal.create({
    data: {
      title: 'Custom Development Project',
      value: 45000.0,
      currency: 'NZD',
      stage: 'CONTACT_MADE',
      status: 'OPEN',
      priority: 'MEDIUM',
      personId: person2.id,
      organizationId: org2.id,
      ownerId: user2.id,
      createdById: user2.id,
      expectedCloseDate: new Date('2026-08-15'),
      labels: {
        connect: [{ id: labelSales.id }],
      },
    },
  });

  console.log('✓ Created deals');

  // Create activities
  const activity1 = await prisma.activity.create({
    data: {
      subject: 'Follow up on proposal',
      type: 'CALL',
      isDone: false,
      priority: 'HIGH',
      startDate: new Date('2026-06-15T15:30:00Z'),
      endDate: new Date('2026-06-15T16:30:00Z'),
      dealId: deal1.id,
      personId: person1.id,
      organizationId: org1.id,
      ownerId: user1.id,
      createdById: user1.id,
      description: 'Call to discuss proposal details and timeline',
    },
  });

  const activity2 = await prisma.activity.create({
    data: {
      subject: 'Schedule demo meeting',
      type: 'MEETING',
      isDone: true,
      priority: 'MEDIUM',
      startDate: new Date('2026-06-10T10:30:00Z'),
      endDate: new Date('2026-06-10T14:30:00Z'),
      dealId: deal2.id,
      personId: person2.id,
      organizationId: org2.id,
      ownerId: user2.id,
      createdById: user2.id,
      description: 'Demo presentation for custom development features',
    },
  });

  console.log('✓ Created activities');

  // Create notes
  await prisma.note.create({
    data: {
      content:
        'Client seemed interested in the proposal. Need to send pricing breakdown.',
      dealId: deal1.id,
      createdById: user1.id,
    },
  });

  await prisma.note.create({
    data: {
      content:
        'Demo went well. Client wants to discuss timeline and team resources.',
      activityId: activity2.id,
      createdById: user2.id,
    },
  });

  console.log('✓ Created notes');
  console.log('✨ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
