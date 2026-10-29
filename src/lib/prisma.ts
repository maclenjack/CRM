import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma/client';

const softDeleteModels = [
  'Organization',
  'Person',
  'Deal',
  'Activity',
] as const;

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
  });

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (model && softDeleteModels.includes(model as any)) {
            const readOperations = [
              'findMany',
              'findFirst',
              'findUnique',
              'findUniqueOrThrow',
              'findFirstOrThrow',
              'count',
              'aggregate',
              'groupBy',
            ];

            if (readOperations.includes(operation)) {
              const typedArgs = args as { where?: Record<string, any> };
              typedArgs.where = {
                ...typedArgs.where,
                deletedAt: null,
              };
            }
          }
          return query(args);
        },
      },
    },
    result: {
      deal: {
        numericValue: {
          needs: { value: true },
          compute(deal) {
            return deal.value.toNumber();
          },
        },
      },
    },
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
