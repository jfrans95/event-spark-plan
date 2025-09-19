-- Fix hardcoded admin user ID in RLS policies and enhance security
-- Remove hardcoded UUID and use proper role-based access

-- Drop the existing policy with hardcoded UUID
DROP POLICY IF EXISTS "Admin access to all profiles" ON public.profiles;

-- Create proper admin access policy using role check
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (public.get_current_user_role() = 'administrator')
);

-- Fix search_path issues in database functions
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

-- Enhance get_current_user_role function security
DROP FUNCTION IF EXISTS public.get_current_user_role();

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

-- Add audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  details jsonb
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.security_audit_log
FOR SELECT 
USING (public.get_current_user_role() = 'administrator');

-- Add function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  );
END;
$$;

-- Add trigger to log role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    PERFORM public.log_security_event(
      'role_change',
      'profiles',
      NEW.user_id::text,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.profiles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();

-- Add data retention policy function
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Delete audit logs older than 1 year
  DELETE FROM public.security_audit_log 
  WHERE created_at < (now() - interval '1 year');
END;
$$;