-- Crear función RPC para obtener productos filtrados de manera más eficiente
CREATE OR REPLACE FUNCTION public.get_products_by_filters(
  p_categoria text DEFAULT NULL,
  p_espacio text DEFAULT NULL,
  p_aforo integer DEFAULT NULL,
  p_evento text DEFAULT NULL,
  p_plan text DEFAULT NULL,
  p_show_all boolean DEFAULT false
)
RETURNS TABLE (
  id uuid,
  provider_id uuid,
  name text,
  description text,
  price numeric,
  categoria category_type,
  space_types space_type[],
  capacity_min integer,
  capacity_max integer,
  event_types event_type[],
  plan plan_type,
  activo boolean,
  images text[],
  created_at timestamptz,
  updated_at timestamptz,
  provider_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    p.id,
    p.provider_id,
    p.name,
    p.description,
    p.price,
    p.categoria,
    p.space_types,
    p.capacity_min,
    p.capacity_max,
    p.event_types,
    p.plan,
    p.activo,
    p.images,
    p.created_at,
    p.updated_at,
    pa.company_name as provider_name
  FROM public.products p
  INNER JOIN public.provider_profiles pp ON pp.id = p.provider_id
  INNER JOIN public.provider_applications pa ON pa.id = pp.application_id
  WHERE p.activo = true 
    AND pa.status = 'approved'
    AND (p_categoria IS NULL OR p.categoria::text = p_categoria)
    AND (p_show_all = true OR (
      (p_espacio IS NULL OR p_espacio = ANY(p.space_types::text[]))
      AND (p_aforo IS NULL OR (p.capacity_min <= p_aforo AND p.capacity_max >= p_aforo))
      AND (p_evento IS NULL OR p_evento = ANY(p.event_types::text[]))
      AND (p_plan IS NULL OR (
        (p_plan = 'basico' AND p.plan = 'basico') OR
        (p_plan = 'pro' AND p.plan IN ('basico', 'pro')) OR  
        (p_plan = 'premium' AND p.plan IN ('basico', 'pro', 'premium'))
      ))
    ))
  ORDER BY p.created_at DESC;
$$;