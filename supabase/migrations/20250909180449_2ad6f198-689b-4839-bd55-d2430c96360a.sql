-- Arreglar search_path para la nueva función
ALTER FUNCTION public.check_auth_config() SET search_path = public, pg_temp;