/*
  Fix: Add partial unique index for primary contact email/phone
  Ensures only one primary email and one primary phone per person
*/

-- Partial unique index for primary email per person
CREATE UNIQUE INDEX IF NOT EXISTS "person_emails_person_id_is_primary_key" 
ON "person_emails"("person_id") 
WHERE "is_primary" = true;

-- Partial unique index for primary phone per person
CREATE UNIQUE INDEX IF NOT EXISTS "person_phones_person_id_is_primary_key" 
ON "person_phones"("person_id") 
WHERE "is_primary" = true;