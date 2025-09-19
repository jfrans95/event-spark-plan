-- Core quotes and quote_items structure with improved design
-- First ensure we have the update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure quotes table has all required columns
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'event_date') THEN
    ALTER TABLE public.quotes ADD COLUMN event_date timestamptz NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'event_time') THEN
    ALTER TABLE public.quotes ADD COLUMN event_time text NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'event_location') THEN
    ALTER TABLE public.quotes ADD COLUMN event_location text NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'email_sent_at') THEN
    ALTER TABLE public.quotes ADD COLUMN email_sent_at timestamptz NULL;
  END IF;
END$$;

-- Ensure quote_items table has all required columns including subtotal
DO $$
BEGIN
  -- Add subtotal column as computed if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quote_items' AND column_name = 'subtotal') THEN
    ALTER TABLE public.quote_items ADD COLUMN subtotal numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED;
  END IF;
END$$;

-- Create/update updated_at triggers
DROP TRIGGER IF EXISTS trg_quotes_updated_at ON public.quotes;
CREATE TRIGGER trg_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure RLS is enabled
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for better access control
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS quotes_select_owner ON public.quotes;
DROP POLICY IF EXISTS quotes_insert_owner ON public.quotes;
DROP POLICY IF EXISTS quote_items_select_owner ON public.quote_items;
DROP POLICY IF EXISTS quote_items_insert_owner ON public.quote_items;

-- Quotes policies
CREATE POLICY quotes_select_owner ON public.quotes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY quotes_insert_anonymous ON public.quotes
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY quotes_insert_authenticated ON public.quotes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY quotes_update_owner ON public.quotes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Quote items policies  
CREATE POLICY quote_items_select_owner ON public.quote_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quotes q 
    WHERE q.id = quote_id AND q.user_id = auth.uid()
  ));

CREATE POLICY quote_items_insert_anonymous ON public.quote_items
  FOR INSERT TO anon
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quotes q 
    WHERE q.id = quote_id AND q.user_id IS NULL
  ));

CREATE POLICY quote_items_insert_authenticated ON public.quote_items
  FOR INSERT TO authenticated  
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quotes q 
    WHERE q.id = quote_id AND (q.user_id = auth.uid() OR q.user_id IS NULL)
  ));

-- Admin policies for both tables
CREATE POLICY quotes_admin_all ON public.quotes
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'administrator'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'administrator'
  ));

CREATE POLICY quote_items_admin_all ON public.quote_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'administrator'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'administrator'
  ));

-- Public tracking function (updated)
CREATE OR REPLACE FUNCTION public.get_quote_tracking(_code uuid)
RETURNS TABLE (quote_id uuid, created_at timestamptz, status text)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql AS $$
  SELECT q.id, q.created_at, q.status
  FROM public.quotes q
  WHERE q.tracking_code = _code
$$;

-- Grant execute permissions for tracking
REVOKE ALL ON FUNCTION public.get_quote_tracking(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_quote_tracking(uuid) TO anon, authenticated;