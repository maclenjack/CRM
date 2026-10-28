import { Prisma } from '@/generated/prisma/client';

export default function convertDecimalsToStrings(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (Prisma.Decimal.isDecimal(obj)) {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDecimalsToStrings);
  }

  if (typeof obj === 'object') {
    if (obj instanceof Date) return obj;

    const clone: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      clone[key] = convertDecimalsToStrings(obj[key]);
    }
    return clone;
  }

  return obj;
}
