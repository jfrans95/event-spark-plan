-- Fix the search_path warning for database function
CREATE OR REPLACE FUNCTION public.get_quote_tracking(_code uuid)
RETURNS TABLE(quote_id uuid, created_at timestamp with time zone, status text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT q.id, q.created_at, q.status
  FROM public.quotes q
  WHERE q.tracking_code = _code
$$;