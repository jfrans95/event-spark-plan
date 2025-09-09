-- Configurar settings de auth para habilitar confirmación de email
-- Estos settings se manejan a través de auth.config, pero podemos verificar que estén correctamente

-- Crear una función para verificar configuración de auth
CREATE OR REPLACE FUNCTION public.check_auth_config()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Asegurar que tenemos triggers correctos para nuevos usuarios
-- Verificar que el trigger handle_new_user esté activo
DO $$
BEGIN
  -- El trigger ya existe, solo verificamos que esté activo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    -- Recrear el trigger si no existe
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;