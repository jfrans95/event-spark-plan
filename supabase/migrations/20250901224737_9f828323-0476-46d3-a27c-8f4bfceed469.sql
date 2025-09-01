-- Eliminar TODAS las políticas de profiles para empezar limpio
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles (safe)" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Crear función security definer CORRECTA que no cause recursión
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE 
SET search_path = public
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

-- Recrear políticas básicas sin recursión
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política especial para administradores SIN recursión
CREATE POLICY "Admins view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Primero verificar si es su propio perfil
  auth.uid() = user_id 
  OR 
  -- Si no, verificar si es admin usando auth metadata
  (auth.jwt() ->> 'role')::text = 'admin'
  OR
  -- O verificar directamente en user_metadata
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'administrator'
);