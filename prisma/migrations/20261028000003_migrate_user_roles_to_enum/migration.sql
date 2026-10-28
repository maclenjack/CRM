/*
  Fix: Migrate existing user roles to enum values
  Existing users have lowercase roles ('user', 'admin', 'manager') 
  but the Role enum expects uppercase ('USER', 'ADMIN', 'MANAGER')
  
  This migration handles the case where the Role enum already exists
  and the column is already of enum type. We need to use a temporary
  text column to migrate the data.
*/

-- First, ensure the Role enum exists
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Check if users.role is already an enum type
DO $$ 
DECLARE
    col_type text;
BEGIN
    SELECT data_type INTO col_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role';
    
    IF col_type = 'USER-DEFINED' THEN
        -- Column is already enum type, need to use temp column approach
        -- Add temporary text column
        ALTER TABLE "users" ADD COLUMN "role_temp" TEXT;
        
        -- Copy enum values to text (they'll be uppercase already if valid)
        UPDATE "users" SET "role_temp" = "role"::text;
        
        -- Drop the enum column
        ALTER TABLE "users" DROP COLUMN "role";
        
        -- Recreate as text
        ALTER TABLE "users" ADD COLUMN "role" TEXT;
        
        -- Copy back
        UPDATE "users" SET "role" = "role_temp";
        
        -- Drop temp column
        ALTER TABLE "users" DROP COLUMN "role_temp";
        
        -- Now update lowercase to uppercase
        UPDATE "users" 
        SET role = UPPER(role) 
        WHERE role IN ('user', 'admin', 'manager');
        
        -- Convert to enum
        ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
        ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING UPPER("role")::"Role";
        ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
    ELSE
        -- Column is still text, just update and convert
        UPDATE "users" 
        SET role = UPPER(role) 
        WHERE role IN ('user', 'admin', 'manager');
        
        ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
        ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING UPPER("role")::"Role";
        ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
    END IF;
END $$;