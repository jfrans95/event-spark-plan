-- Fix remaining search_path issues in all database functions
-- Address security warnings from the linter

-- Fix search_path in all existing functions
DROP FUNCTION IF EXISTS public.get_products_by_filters(text, text, integer, text, text, boolean);

CREATE OR REPLACE FUNCTION public.get_products_by_filters(
  p_categoria text DEFAULT NULL::text, 
  p_espacio text DEFAULT NULL::text, 
  p_aforo integer DEFAULT NULL::integer, 
  p_evento text DEFAULT NULL::text, 
  p_plan text DEFAULT NULL::text, 
  p_show_all boolean DEFAULT false
)
RETURNS TABLE(
  id uuid, provider_id uuid, name text, description text, price numeric, 
  categoria category_type, space_types space_type[], capacity_min integer, 
  capacity_max integer, event_types event_type[], plan plan_type, 
  activo boolean, images text[], created_at timestamp with time zone, 
  updated_at timestamp with time zone, provider_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    p.id, p.provider_id, p.name, p.description, p.price, p.categoria, p.space_types,
    p.capacity_min, p.capacity_max, p.event_types, p.plan, p.activo, p.images,
    p.created_at, p.updated_at, pa.company_name as provider_name
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

-- Fix other functions search_path
DROP FUNCTION IF EXISTS public.check_auth_config();

CREATE OR REPLACE FUNCTION public.check_auth_config()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  config_result json;
BEGIN
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

-- Fix update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN new.raw_user_meta_data->>'role' = 'administrator' THEN 'administrator'::public.app_role
      WHEN new.raw_user_meta_data->>'role' = 'advisor' THEN 'advisor'::public.app_role  
      WHEN new.raw_user_meta_data->>'role' = 'provider' THEN 'provider'::public.app_role
      WHEN new.raw_user_meta_data->>'role' = 'collaborator' THEN 'collaborator'::public.app_role
      ELSE 'usuario'::public.app_role
    END
  );
  RETURN new;
END;
$$;

-- Fix other trigger functions
DROP FUNCTION IF EXISTS public.auto_approve_provider_application();
DROP FUNCTION IF EXISTS public.create_provider_profile_on_approval();
DROP FUNCTION IF EXISTS public.handle_provider_application_approval();

CREATE OR REPLACE FUNCTION public.handle_provider_application_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Solo crear perfil si el status cambió a 'approved' 
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    -- Actualizar el perfil del usuario para que sea proveedor
    UPDATE profiles 
    SET role = 'provider'
    WHERE user_id = NEW.user_id;
    
    -- Crear el perfil de proveedor
    INSERT INTO provider_profiles (user_id, application_id)
    VALUES (NEW.user_id, NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;