-- Update the handle_new_user function to automatically assign admin role to the specified email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    CASE 
      WHEN NEW.email = 'frans.corporativo@gmail.com' THEN 'administrator'::app_role
      ELSE COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'collaborator'::app_role)
    END
  );
  RETURN NEW;
END;
$$;