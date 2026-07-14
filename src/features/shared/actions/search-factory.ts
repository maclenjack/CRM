import { z } from 'zod';

import { auth } from '@/auth';

const SearchQuerySchema = z
  .string()
  .trim()
  .min(2, { message: 'Search query must be at least 2 characters' })
  .max(100, { message: 'Search query too long' })
  .transform((val) => val.replace(/[%_\\]/g, '\\$&'));

export function createSearchAction<TModel>(
  prismaModel: { findMany: (args: any) => Promise<TModel[]> },
  options: {
    searchField: keyof TModel;
    selectFields: Record<keyof TModel, boolean>;
    limit?: number;
  }
) {
  return async function search(rawQuery: string) {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized: You must be logged in.' };
    }

    const trimmedQuery = rawQuery?.trim() || '';

    try {
      if (trimmedQuery.length < 2) {
        const defaultResults = await prismaModel.findMany({
          where: {
            ownerId: session.user.id,
          },
          select: options.selectFields,
          take: options.limit || 15,
          orderBy: {
            createdAt: 'desc',
          },
        });
        return {
          success: true,
          data: defaultResults,
          isDefaultData: true,
        };
      }

      const validated = SearchQuerySchema.safeParse(trimmedQuery);
      if (!validated.success) {
        return {
          success: false,
          error: validated.error.issues[0].message,
          data: [],
        };
      }

      const results = await prismaModel.findMany({
        where: {
          ownerId: session.user.id,
          [options.searchField]: {
            contains: validated.data,
            mode: 'insensitive',
          },
        },
        select: options.selectFields,
        take: options.limit || 15,
        orderBy: { [options.searchField]: 'asc' },
      });

      return { success: true, data: results, isDefaultData: false };
    } catch (error) {
      console.error(`CRITICAL: Generic search action failed:`, error);
      return {
        success: false,
        error: 'An internal error occurred during search.',
        data: [] as TModel[],
      };
    }
  };
}
