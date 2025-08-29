-- Add logo_url column to provider_applications table
ALTER TABLE public.provider_applications 
ADD COLUMN logo_url text;