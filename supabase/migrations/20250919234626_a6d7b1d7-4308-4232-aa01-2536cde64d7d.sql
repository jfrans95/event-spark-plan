-- Fix hardcoded admin user ID in RLS policies and enhance security
-- Handle function dependencies properly

-- First, drop policies that depend on get_current_user_role function
DROP POLICY IF EXISTS "Admin access to all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;

-- Recreate enhanced get_current_user_role function with better security
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role::text INTO user_role 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'usuario');
END;
$$;

-- Create proper admin access policy using role check (no hardcoded UUID)
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (public.get_current_user_role() = 'administrator')
);

-- Fix search_path in get_quote_tracking function
DROP FUNCTION IF EXISTS public.get_quote_tracking(uuid);

CREATE OR REPLACE FUNCTION public.get_quote_tracking(_code uuid)
RETURNS TABLE(quote_id uuid, created_at timestamp with time zone, status text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT q.id, q.created_at, q.status
  FROM public.quotes q
  WHERE q.tracking_code = _code;
$$;