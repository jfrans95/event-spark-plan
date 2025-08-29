-- Create storage buckets for provider photos and product images
INSERT INTO storage.buckets (id, name, public) VALUES ('provider-evidence', 'provider-evidence', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create RLS policies for provider evidence bucket (private)
CREATE POLICY "Providers can view their own evidence"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'provider-evidence' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Providers can upload their own evidence"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'provider-evidence' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all provider evidence"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'provider-evidence' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'administrator'::app_role
  )
);

-- Create RLS policies for product images bucket (public)
CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Providers can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    WHERE pp.user_id = auth.uid()
  )
);

CREATE POLICY "Providers can update their own product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    WHERE pp.user_id = auth.uid()
  )
);

CREATE POLICY "Providers can delete their own product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    WHERE pp.user_id = auth.uid()
  )
);