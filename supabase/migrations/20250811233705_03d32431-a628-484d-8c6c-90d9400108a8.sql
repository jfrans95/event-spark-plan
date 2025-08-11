-- Fix handle_new_user trigger and ensure 'admin' role exists

-- 1) Ensure enum has 'admin' value
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

-- 2) Create or replace handle_new_user with correct search_path and casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::public.app_role,
      'collaborator'::public.app_role
    )
  );
  RETURN NEW;
END;
$$;

-- 3) Recreate the trigger (single trigger on auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
