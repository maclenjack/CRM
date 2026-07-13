import { formatScreamingSnake } from '@/features/shared/utils/string';

export interface BaseMeta {
  readonly label: string;
}

export type EnumConfigInput<M extends BaseMeta> = Omit<M, 'label'> & {
  label?: string;
};

export function createEnumHelpers<T extends string, M extends BaseMeta>(
  rawConfig: Record<T, EnumConfigInput<M>>
) {
  const metadataMap = Object.fromEntries(
    Object.entries(rawConfig).map(([key, config]) => {
      const castConfig = config as any;
      return [
        key,
        {
          ...castConfig,
          label: castConfig.label ?? formatScreamingSnake(key),
        },
      ];
    })
  ) as Record<T, M>;

  return {
    meta(value: T): M {
      return metadataMap[value];
    },

    values(): (M & { value: T })[] {
      return Object.entries(metadataMap).map(([value, meta]) => ({
        value: value as T,
        ...(meta as M),
      }));
    },

    fromValue(value: string): M & { value: T } {
      const match = metadataMap[value as T];
      if (!match) throw new Error(`Unknown enum value: ${value}`);
      return { value: value as T, ...match };
    },

    isEnum(value: string): boolean {
      const match = metadataMap[value as T];
      return match != null;
    },
  };
}
