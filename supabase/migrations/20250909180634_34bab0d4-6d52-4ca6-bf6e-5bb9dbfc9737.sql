-- Arreglar issues de seguridad de la función check_auth_config
CREATE OR REPLACE FUNCTION public.check_auth_config()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  config_result json;
BEGIN
  -- Esta función ayuda a verificar que la configuración esté correcta
  -- La configuración real se maneja en Supabase Dashboard
  SELECT json_build_object(
    'message', 'Auth configuration should be checked in Supabase Dashboard',
    'steps', json_build_array(
      'Go to Authentication > Settings',
      'Enable "Enable email confirmations"',
      'Set Site URL to your domain',
      'Configure redirect URLs',
      'Check email templates are active'
    )
  ) INTO config_result;
  
  RETURN config_result;
END;
$$;