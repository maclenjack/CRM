export function findNextOccurringDate<T, K extends keyof T>(
  items: T[],
  key: K
): T[K] | null {
  const now = new Date().getTime();

  let closestDate: T[K] | null = null;
  let closestDistance = Infinity;

  for (const item of items) {
    const date = item[key];

    if (
      date instanceof Date ||
      typeof date === 'string' ||
      typeof date === 'number'
    ) {
      const itemTime = new Date(date).getTime();

      if (isNaN(itemTime) || itemTime < now) {
        continue;
      }

      const distance = itemTime - now;

      if (distance < closestDistance) {
        closestDistance = distance;
        closestDate = date;
      }
    }
  }

  return closestDate;
}

export function formatDuration(
  startDate: Date | string,
  endDate: Date | string
): string {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  // Guard against invalid date inputs
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return '—';
  }

  const diffInMs = end - start;

  if (diffInMs <= 0) {
    return '0m';
  }

  const totalMinutes = Math.floor(diffInMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours}h`);
  }
  parts.push(`${minutes}m`);

  return parts.join(' ');
}

export function getTypedDateFieldValue(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  return new Date(value as string);
}
