-- Restaurar base de datos al estado original (antes de las cotizaciones y eventos)
-- Eliminar tablas que fueron agregadas en commits recientes

-- Deshabilitar RLS temporalmente para evitar conflictos
ALTER TABLE IF EXISTS public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.provider_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quote_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quotes DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas RLS
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
DROP POLICY IF EXISTS "Users can create their own events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can view their own events" ON public.events;

DROP POLICY IF EXISTS "Providers can update their requests" ON public.provider_requests;
DROP POLICY IF EXISTS "Providers can view their requests" ON public.provider_requests;
DROP POLICY IF EXISTS "Users can update their provider requests" ON public.provider_requests;
DROP POLICY IF EXISTS "Users can view their provider requests" ON public.provider_requests;

DROP POLICY IF EXISTS "Admins can view all quote items" ON public.quote_items;
DROP POLICY IF EXISTS "Users can create quote items for owned quotes only" ON public.quote_items;
DROP POLICY IF EXISTS "Users can view quote items for owned quotes only" ON public.quote_items;

DROP POLICY IF EXISTS "Admins can view all quotes" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated users can create quotes only" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated users can view own quotes only" ON public.quotes;
DROP POLICY IF EXISTS "Users can create their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can update their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can view their own quotes" ON public.quotes;

-- Eliminar triggers de las tablas que vamos a eliminar
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
DROP TRIGGER IF EXISTS update_provider_requests_updated_at ON public.provider_requests;
DROP TRIGGER IF EXISTS update_quotes_updated_at ON public.quotes;

-- Eliminar tablas en orden de dependencias
DROP TABLE IF EXISTS public.provider_requests CASCADE;
DROP TABLE IF EXISTS public.quote_items CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;

-- Eliminar tipos enum que fueron agregados
DROP TYPE IF EXISTS public.event_status CASCADE;
DROP TYPE IF EXISTS public.quote_status CASCADE; 
DROP TYPE IF EXISTS public.request_status CASCADE;

-- Verificar que las tablas originales siguen intactas
-- Las siguientes tablas deben permanecer:
-- - profiles
-- - provider_applications  
-- - provider_profiles
-- - products

-- Verificar que los tipos enum originales siguen intactos:
-- - app_role
-- - category_type
-- - event_type
-- - plan_type
-- - space_type