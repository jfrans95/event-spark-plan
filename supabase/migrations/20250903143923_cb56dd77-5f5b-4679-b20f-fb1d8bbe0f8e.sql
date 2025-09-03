-- Create necessary tables for user profile system

-- Status enums
CREATE TYPE public.quote_status AS ENUM ('enviada', 'ganada', 'perdida');
CREATE TYPE public.event_status AS ENUM ('creado', 'en_ejecucion', 'ejecutado', 'cancelado');
CREATE TYPE public.request_status AS ENUM ('recibida', 'aceptada', 'rechazada');

-- Quotes table
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  contact_whatsapp text,
  event_date date,
  event_time time,
  event_location text,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status quote_status NOT NULL DEFAULT 'enviada',
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Quote items (products in each quote)
CREATE TABLE public.quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Events (when quotes are executed)
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quote_id uuid NOT NULL REFERENCES public.quotes(id),
  tracking_code text UNIQUE NOT NULL,
  status event_status NOT NULL DEFAULT 'creado',
  event_date date,
  event_time time,
  event_location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Provider requests (one per quote item)
CREATE TABLE public.provider_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.provider_profiles(id),
  quote_item_id uuid NOT NULL REFERENCES public.quote_items(id),
  status request_status NOT NULL DEFAULT 'recibida',
  meeting_1_date timestamptz,
  meeting_1_completed boolean DEFAULT false,
  meeting_2_date timestamptz,
  meeting_2_completed boolean DEFAULT false,
  meeting_3_date timestamptz,
  meeting_3_completed boolean DEFAULT false,
  shared_notes text,
  rating integer CHECK (rating >= 0 AND rating <= 5),
  rating_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotes
CREATE POLICY "Users can view their own quotes" ON public.quotes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quotes" ON public.quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes" ON public.quotes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quotes" ON public.quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'administrator'
    )
  );

-- RLS Policies for quote_items
CREATE POLICY "Users can view their quote items" ON public.quote_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quotes 
      WHERE id = quote_items.quote_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their quote items" ON public.quote_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quotes 
      WHERE id = quote_items.quote_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for events
CREATE POLICY "Users can view their own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all events" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'administrator'
    )
  );

-- RLS Policies for provider_requests
CREATE POLICY "Users can view their provider requests" ON public.provider_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = provider_requests.event_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view their requests" ON public.provider_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.provider_profiles 
      WHERE id = provider_requests.provider_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their provider requests" ON public.provider_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = provider_requests.event_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update their requests" ON public.provider_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.provider_profiles 
      WHERE id = provider_requests.provider_id AND user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_tracking_code ON public.events(tracking_code);
CREATE INDEX idx_provider_requests_event_id ON public.provider_requests(event_id);
CREATE INDEX idx_provider_requests_provider_id ON public.provider_requests(provider_id);

-- Create trigger for updated_at
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_requests_updated_at
  BEFORE UPDATE ON public.provider_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();