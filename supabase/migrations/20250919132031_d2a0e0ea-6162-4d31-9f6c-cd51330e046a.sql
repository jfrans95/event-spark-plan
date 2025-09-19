-- Add missing fields to quotes table for tracking and status
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS tracking_code uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'COTIZACION_ENVIADA';

-- Add unique constraint for tracking_code
ALTER TABLE public.quotes ADD CONSTRAINT IF NOT EXISTS uq_quotes_tracking UNIQUE (tracking_code);

-- Create RPC for public tracking (security definer - doesn't expose sensitive data)
CREATE OR REPLACE FUNCTION public.get_quote_tracking(_code uuid)
RETURNS table (
  quote_id uuid,
  created_at timestamptz,
  status text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql AS $$
  SELECT q.id, q.created_at, q.status
  FROM public.quotes q
  WHERE q.tracking_code = _code
$$;

-- Grant execute permissions to anon and authenticated users
REVOKE ALL ON FUNCTION public.get_quote_tracking(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_quote_tracking(uuid) TO anon, authenticated;