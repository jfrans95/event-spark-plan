-- QUOTES TABLE
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  event_date timestamptz NULL,
  event_time text NULL,
  event_location text NULL,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  pdf_url text NULL,
  email_sent_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- QUOTE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- TRIGGERS
CREATE TRIGGER IF NOT EXISTS update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS POLICIES
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- Quotes policies
CREATE POLICY IF NOT EXISTS "Users can read own quotes"
  ON public.quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create quotes"
  ON public.quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Quote items policies  
CREATE POLICY IF NOT EXISTS "Users can read own quote items"
  ON public.quote_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.quotes q WHERE q.id = quote_id AND q.user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "Users can create quote items"
  ON public.quote_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.quotes q WHERE q.id = quote_id AND q.user_id = auth.uid()));

-- Admin policies for quotes management
CREATE POLICY IF NOT EXISTS "Admins can view all quotes"
  ON public.quotes FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'administrator'));

CREATE POLICY IF NOT EXISTS "Admins can view all quote items"
  ON public.quote_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'administrator'));