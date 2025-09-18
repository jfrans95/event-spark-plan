-- Crear políticas RLS mejoradas para productos
-- Primero eliminamos las políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Public can view approved products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Providers can view their own products" ON public.products;

-- Crear política pública para productos activos de proveedores aprobados
CREATE POLICY "Public can view active products from approved providers"
ON public.products
FOR SELECT
TO anon, authenticated
USING (
  activo = true AND
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    INNER JOIN public.provider_applications pa ON pa.id = pp.application_id
    WHERE pp.id = products.provider_id 
      AND pa.status = 'approved'
  )
);

-- Crear política para administradores
CREATE POLICY "Admins can view all products"
ON public.products  
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() 
      AND role = 'administrator'::app_role
  )
);