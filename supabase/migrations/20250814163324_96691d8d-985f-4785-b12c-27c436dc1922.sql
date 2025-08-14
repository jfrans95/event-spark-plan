-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  tracking_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  advisor_id UUID NOT NULL,
  collaborator_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_date DATE,
  event_location TEXT,
  notes TEXT
);

-- Create provider_requests table
CREATE TABLE public.provider_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'requested',
  provider_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  contacted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create event_tasks table for tracking
CREATE TABLE public.event_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID,
  completed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  provider_request_id UUID REFERENCES public.provider_requests(id) ON DELETE CASCADE,
  rated_by UUID NOT NULL,
  rated_user UUID NOT NULL,
  scope TEXT NOT NULL, -- 'provider', 'collaborator', 'event'
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotes table for storing quote data
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date DATE NOT NULL,
  event_time TIME,
  event_location TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_whatsapp TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Advisors and admins can view all events" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('advisor', 'administrator')
    )
  );

CREATE POLICY "Advisors and admins can create events" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('advisor', 'administrator')
    )
  );

CREATE POLICY "Advisors and admins can update events" ON public.events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('advisor', 'administrator')
    )
  );

-- Collaborators can view events assigned to them
CREATE POLICY "Collaborators can view assigned events" ON public.events
  FOR SELECT USING (
    collaborator_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'collaborator'
    )
  );

-- RLS Policies for provider_requests
CREATE POLICY "Providers can view their requests" ON public.provider_requests
  FOR SELECT USING (
    provider_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'provider'
    )
  );

CREATE POLICY "Providers can update their requests" ON public.provider_requests
  FOR UPDATE USING (
    provider_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'provider'
    )
  );

CREATE POLICY "Advisors and admins can view all provider requests" ON public.provider_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('advisor', 'administrator')
    )
  );

CREATE POLICY "Advisors and admins can create provider requests" ON public.provider_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('advisor', 'administrator')
    )
  );

-- RLS Policies for event_tasks (public read for tracking)
CREATE POLICY "Anyone can view event tasks for tracking" ON public.event_tasks
  FOR SELECT USING (true);

CREATE POLICY "Advisors and admins can manage event tasks" ON public.event_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('advisor', 'administrator')
    )
  );

-- RLS Policies for ratings
CREATE POLICY "Users can view ratings" ON public.ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create ratings for their events" ON public.ratings
  FOR INSERT WITH CHECK (
    rated_by = auth.uid()
  );

-- RLS Policies for quotes (public read for advisors)
CREATE POLICY "Advisors and admins can view all quotes" ON public.quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('advisor', 'administrator')
    )
  );

CREATE POLICY "Anyone can create quotes" ON public.quotes
  FOR INSERT WITH CHECK (true);

-- Add update triggers
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_requests_updated_at
  BEFORE UPDATE ON public.provider_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_tasks_updated_at
  BEFORE UPDATE ON public.event_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();