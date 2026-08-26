import { revalidatePath } from 'next/cache';

export interface EntityIdentifiers {
  dealId?: string | null;
  personId?: string | null;
  organizationId?: string | null;
  activityId?: string | null;
  /** Primary list view routes to revalidate */
  lists?: Array<'activities' | 'deals' | 'contacts' | 'organizations'>;
}

/**
 * Centralized utility to revalidate Next.js cache paths for affected CRM entities.
 */
export function revalidateEntities(entities: EntityIdentifiers) {
  // Revalidate specific entity detail pages
  if (entities.dealId) revalidatePath(`/deals/${entities.dealId}`);
  if (entities.personId) revalidatePath(`/contacts/${entities.personId}`);
  if (entities.organizationId)
    revalidatePath(`/organizations/${entities.organizationId}`);
  if (entities.activityId) revalidatePath(`/activities/${entities.activityId}`);

  // Revalidate list views
  if (entities.lists) {
    for (const list of entities.lists) {
      revalidatePath(`/${list}`);
    }
  }
}
