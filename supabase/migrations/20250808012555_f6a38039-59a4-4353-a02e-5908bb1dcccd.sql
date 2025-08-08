-- Create provider applications table
CREATE TABLE public.provider_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  nit TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  product_category TEXT NOT NULL CHECK (product_category IN ('Montaje técnico', 'Catering', 'Coctelería', 'Artistas', 'Decoración y ambientación', 'Mobiliarios', 'Registros audiovisuales')),
  years_experience INTEGER NOT NULL,
  experience_description TEXT NOT NULL,
  specialization TEXT NOT NULL,
  evidence_photos TEXT[], -- Will store file paths/URLs
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  admin_observations TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.provider_applications ENABLE ROW LEVEL SECURITY;

-- Policies for provider applications
CREATE POLICY "Users can view their own applications" 
ON public.provider_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" 
ON public.provider_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
ON public.provider_applications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can view and update all applications
CREATE POLICY "Admins can view all applications" 
ON public.provider_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'administrator'
  )
);

CREATE POLICY "Admins can update all applications" 
ON public.provider_applications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'administrator'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_provider_applications_updated_at
BEFORE UPDATE ON public.provider_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create provider profiles table for approved providers
CREATE TABLE public.provider_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  application_id UUID NOT NULL REFERENCES public.provider_applications(id) ON DELETE CASCADE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for provider profiles
CREATE POLICY "Providers can view their own profile" 
ON public.provider_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Providers can update their own profile" 
ON public.provider_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can view all provider profiles
CREATE POLICY "Admins can view all provider profiles" 
ON public.provider_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'administrator'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_provider_profiles_updated_at
BEFORE UPDATE ON public.provider_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();