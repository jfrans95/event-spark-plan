-- Fix search_path for get_quote_tracking function
CREATE OR REPLACE FUNCTION public.get_quote_tracking(_code uuid)
RETURNS table (
  quote_id uuid,
  created_at timestamptz,
  status text
)
SECURITY DEFINER
STABLE
SET search_path = 'public'
LANGUAGE sql AS $$
  SELECT q.id, q.created_at, q.status
  FROM public.quotes q
  WHERE q.tracking_code = _code
$$;