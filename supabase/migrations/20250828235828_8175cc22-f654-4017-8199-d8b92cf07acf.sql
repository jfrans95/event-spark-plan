-- Create enums for product categories
CREATE TYPE public.space_type AS ENUM (
  'parques_publicos',
  'jardines_botanicos', 
  'miradores_naturales',
  'playas',
  'plazoletas',
  'calles_barrios',
  'salones_eventos',
  'teatros',
  'auditorios',
  'centros_convenciones',
  'discotecas',
  'restaurantes_privados',
  'iglesias_templos',
  'galerias_museos',
  'bodegas',
  'casas_patrimoniales',
  'rooftops',
  'locales_en_desuso',
  'estudios',
  'fincas_privadas',
  'casas_familiares',
  'unidades_residenciales',
  'casas_patio_jardin',
  'viviendas_adecuadas',
  'carpas',
  'contenedores'
);

CREATE TYPE public.event_type AS ENUM (
  'celebraciones_internas',
  'activaciones_marca',
  'team_building',
  'cierre_ano',
  'cumpleanos',
  'dia_madre_padre',
  'fechas_religiosas',
  'graduaciones',
  'reuniones_especiales',
  'eventos_pequenos',
  'eventos_medios',
  'eventos_institucionales',
  'encuentros_publicos',
  'lanzamientos_aniversarios'
);

CREATE TYPE public.plan_type AS ENUM ('basico', 'pro', 'premium');

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  name TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  space_types public.space_type[] DEFAULT '{}',
  capacity_min INTEGER NOT NULL DEFAULT 20,
  capacity_max INTEGER NOT NULL DEFAULT 20,
  event_types public.event_type[] DEFAULT '{}',
  plan public.plan_type NOT NULL DEFAULT 'basico',
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_products_provider FOREIGN KEY (provider_id) REFERENCES public.provider_profiles(id) ON DELETE CASCADE
);

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products
CREATE POLICY "Providers can view their own products"
ON public.products
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    WHERE pp.id = products.provider_id
    AND pp.user_id = auth.uid()
  )
);

CREATE POLICY "Providers can insert their own products"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    WHERE pp.id = products.provider_id
    AND pp.user_id = auth.uid()
  )
);

CREATE POLICY "Providers can update their own products"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    WHERE pp.id = products.provider_id
    AND pp.user_id = auth.uid()
  )
);

CREATE POLICY "Providers can delete their own products"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    WHERE pp.id = products.provider_id
    AND pp.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'administrator'::app_role
  )
);

CREATE POLICY "Public can view approved products"
ON public.products
FOR SELECT
USING (true);

-- Create trigger for automatic timestamp updates on products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-approve provider applications and create provider profiles
CREATE OR REPLACE FUNCTION public.auto_approve_provider_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-approve the application
  NEW.status = 'approved';
  NEW.reviewed_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-approve provider applications
CREATE TRIGGER auto_approve_provider_applications
BEFORE INSERT ON public.provider_applications
FOR EACH ROW
EXECUTE FUNCTION public.auto_approve_provider_application();

-- Create function to create provider profile after application approval
CREATE OR REPLACE FUNCTION public.create_provider_profile_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if status changed to approved and no profile exists yet
  IF NEW.status = 'approved' AND (OLD IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO public.provider_profiles (user_id, application_id)
    VALUES (NEW.user_id, NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create provider profile after approval
CREATE TRIGGER create_provider_profile_after_approval
AFTER INSERT OR UPDATE ON public.provider_applications
FOR EACH ROW
EXECUTE FUNCTION public.create_provider_profile_on_approval();

-- Add index for better performance
CREATE INDEX idx_products_provider_id ON public.products(provider_id);
CREATE INDEX idx_products_space_types ON public.products USING GIN(space_types);
CREATE INDEX idx_products_event_types ON public.products USING GIN(event_types);
CREATE INDEX idx_products_capacity ON public.products(capacity_min, capacity_max);
CREATE INDEX idx_products_plan ON public.products(plan);
CREATE INDEX idx_products_price ON public.products(price);