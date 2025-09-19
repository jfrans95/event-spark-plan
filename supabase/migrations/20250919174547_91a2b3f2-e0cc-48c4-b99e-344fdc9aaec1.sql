-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role::text INTO user_role 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  RETURN user_role;
END;
$$;