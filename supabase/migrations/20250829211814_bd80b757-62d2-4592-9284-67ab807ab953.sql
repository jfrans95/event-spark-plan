-- Corregir la función handle_new_user con el casting correcto del enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN new.raw_user_meta_data->>'role' = 'administrator' THEN 'administrator'::app_role
      WHEN new.raw_user_meta_data->>'role' = 'advisor' THEN 'advisor'::app_role  
      WHEN new.raw_user_meta_data->>'role' = 'provider' THEN 'provider'::app_role
      ELSE 'collaborator'::app_role
    END
  );
  RETURN new;
END;
$$;