-- Arreglar la política problemática de seguridad
-- Eliminar la política que usa user_metadata inseguramente
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;

-- Crear política segura usando solo el user_id
CREATE POLICY "Admin access to all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Los usuarios pueden ver su propio perfil
  auth.uid() = user_id 
  OR 
  -- O si su user_id está en la lista de administradores conocidos
  auth.uid() = '60b2305b-9582-4b0e-bc0b-2e504230353b'::uuid
);