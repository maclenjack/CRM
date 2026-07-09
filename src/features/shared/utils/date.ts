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
