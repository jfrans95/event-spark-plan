-- Eliminar la política problemática que causa recursión infinita
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Crear función security definer para obtener el rol del usuario actual sin recursión
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE 
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Crear nueva política que usa la función para evitar recursión
CREATE POLICY "Admins can view all profiles (safe)" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_current_user_role() = 'administrator' 
  OR auth.uid() = user_id
);