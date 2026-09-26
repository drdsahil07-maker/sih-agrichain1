-- Migration: Add government_admin role

DO $$
BEGIN
  -- We don't know the exact constraint name if it was auto-generated, but usually it's profiles_role_check
  -- We can drop all constraints on the column 'role' and add the new one.
  DECLARE
    constraint_record RECORD;
  BEGIN
    FOR constraint_record IN 
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'public.profiles'::regclass 
      AND contype = 'c' 
      AND pg_get_constraintdef(oid) LIKE '%role%'
    LOOP
      EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT ' || quote_ident(constraint_record.conname);
    END LOOP;
  END;

  -- Add the new constraint
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('farmer', 'distributor', 'transporter', 'consumer', 'government_admin'));
END $$;
