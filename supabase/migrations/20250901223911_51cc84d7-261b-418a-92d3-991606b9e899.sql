-- Crear usuario administrador de prueba para resolver problemas de autenticación
-- Primero, asegurar que existe el perfil de administrador
INSERT INTO public.profiles (user_id, email, full_name, role)
VALUES (
  'admin-demo-uuid-12345',
  'admin@eventcraft.demo', 
  'Administrador Demo',
  'administrator'
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'administrator',
  full_name = 'Administrador Demo';

-- También insertar en auth.users simulado para pruebas locales
-- Nota: Esto es solo para referencia - la inserción real debe hacerse via Supabase Auth