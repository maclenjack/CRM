// Integration test setup - uses real database with transaction rollback
// Adjust if needed
import { config } from '@dotenvx/dotenvx';
import { PrismaPg } from '@prisma/adapter-pg';

import { Prisma, PrismaClient } from '@/generated/prisma/client';

config({ path: ['.env.local', '.env'] });

// Create a test Prisma client
const testPrisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

export const db = testPrisma;

// Test user ID - created once and reused across tests
let testUserId: string | null = null;

/**
 * Get or create a test user for integration tests
 */
export async function getTestUserId(
  client: PrismaClient | Prisma.TransactionClient = testPrisma
): Promise<string> {
  if (testUserId) return testUserId;

  // Try to find existing test user
  const existingUser = await client.user.findFirst({
    where: { email: 'test@integration.test' },
  });

  if (existingUser) {
    testUserId = existingUser.id;
    return testUserId;
  }

  // Create test user
  const user = await client.user.create({
    data: {
      email: 'test@integration.test',
      name: 'Integration Test User',
      role: 'USER',
    },
  });

  testUserId = user.id;
  return testUserId;
}

// 1. Notice the Type change to Prisma.TransactionClient
export async function withTestTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await testPrisma
    .$transaction(async (tx) => {
      await fn(tx);
      // Force rollback by throwing an error
      throw new Error('TEST_ROLLBACK');
    })
    .catch((e) => {
      if (e.message === 'TEST_ROLLBACK') {
        return undefined as any;
      }
      throw e;
    });
}

// 2. Accept either the main client OR a transaction client
export async function cleanupTestData(
  client: PrismaClient | Prisma.TransactionClient = testPrisma
) {
  // 1. Find all parent test sessions first using standard querying
  const testSessions = await client.importSession.findMany({
    where: {
      fileName: { startsWith: 'test-' },
    },
    select: { id: true }, // Replace 'id' with your actual primary key field name if different
  });

  const sessionIds = testSessions.map((s) => s.id);

  // If no test files exist, bypass to avoid empty IN clause syntax issues
  if (sessionIds.length === 0) return;

  // 2. Clear out children (importRecords) using the direct scalar foreign key ID array
  await client.importRecord.deleteMany({
    where: {
      sessionId: { in: sessionIds }, // 💡 Replace 'sessionId' with your actual foreign key field name
    },
  });

  // 3. Clear out parents (importSessions)
  await client.importSession.deleteMany({
    where: {
      id: { in: sessionIds },
    },
  });
}

export async function setupIntegrationTests() {
  // Uses default testPrisma (outside transaction)
  await testPrisma.$connect();
  await cleanupTestData();
  // Create test user
  await getTestUserId();
}

export async function teardownIntegrationTests() {
  await cleanupTestData();
  await testPrisma.$disconnect();
}
