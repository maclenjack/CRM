import { type BaseMeta, createEnumHelpers } from '@/features/shared/utils/enum';
import { ContactCategory as PrismaContactCategory } from '@/generated/prisma/enums';

export type ContactCategoryMetadata = BaseMeta;

export const CONTACT_CATEGORY_METADATA = {
  [PrismaContactCategory.WORK]: {},
  [PrismaContactCategory.PERSONAL]: {},
  [PrismaContactCategory.OTHER]: {},
} satisfies Record<
  PrismaContactCategory,
  Omit<ContactCategoryMetadata, 'label'> & { label?: string }
>;

export const ContactCategory = {
  ...PrismaContactCategory,

  ...createEnumHelpers<PrismaContactCategory, ContactCategoryMetadata>(
    CONTACT_CATEGORY_METADATA
  ),
};
