import { z } from 'zod';

import { auth } from '@/auth';

const SearchQuerySchema = z
  .string()
  .trim()
  .min(2, { message: 'Search query must be at least 2 characters' })
  .max(100, { message: 'Search query too long' })
  .transform((val) => val.replace(/[%_\\]/g, '\\$&'));

type PrismaDelegate = { findMany: (args: any) => Promise<any> };

export interface SearchActionResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
  isDefaultData?: boolean;
}

type CreateSearchActionOptions = {
  searchField: string;
  selectFields: Record<string, any>;
  limit?: number;
  ownerField?: string | null; // Optional field name for ownership filtering (e.g., 'ownerId', 'userId')
};

export function createSearchAction<
  TModel extends Record<string, unknown>,
  TDelegate extends PrismaDelegate,
>(prismaModel: TDelegate, options: CreateSearchActionOptions) {
  return async function search(
    rawQuery: string
  ): Promise<SearchActionResult<TModel>> {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized: You must be logged in.' };
    }

    const {
      searchField,
      selectFields,
      limit,
      ownerField = 'ownerId',
    } = options;

    const trimmedQuery = rawQuery?.trim() || '';

    try {
      if (trimmedQuery.length < 2) {
        const whereClause: Record<string, any> = {};
        if (ownerField) {
          whereClause[ownerField] = session.user.id;
        }

        const defaultResults = await (prismaModel as any).findMany({
          where: whereClause,
          select: selectFields,
          take: limit || 15,
          orderBy: { createdAt: 'desc' },
        });

        return {
          success: true,
          data: defaultResults as TModel[],
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

      const whereClause: Record<string, any> = {};
      if (ownerField) {
        whereClause[ownerField] = session.user.id;
      }
      whereClause[searchField] = {
        contains: validated.data,
        mode: 'insensitive',
      };

      const results = await (prismaModel as any).findMany({
        where: whereClause,
        select: selectFields,
        take: limit || 15,
        orderBy: { [searchField]: 'asc' },
      });

      return { success: true, data: results as TModel[], isDefaultData: false };
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
