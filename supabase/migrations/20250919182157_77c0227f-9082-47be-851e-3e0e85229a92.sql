-- Fix database structure and create quote-pdfs bucket

-- 1. Ensure public.app_role enum has all necessary values
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('usuario', 'provider', 'administrator', 'advisor', 'collaborator');
    ELSE
        -- Add missing enum values if they don't exist
        BEGIN
            ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'usuario';
        EXCEPTION WHEN duplicate_object THEN
            -- Value already exists, continue
        END;
    END IF;
END $$;

-- 2. Update handle_new_user function to set correct default role and search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN new.raw_user_meta_data->>'role' = 'administrator' THEN 'administrator'::public.app_role
      WHEN new.raw_user_meta_data->>'role' = 'advisor' THEN 'advisor'::public.app_role  
      WHEN new.raw_user_meta_data->>'role' = 'provider' THEN 'provider'::public.app_role
      WHEN new.raw_user_meta_data->>'role' = 'collaborator' THEN 'collaborator'::public.app_role
      ELSE 'usuario'::public.app_role  -- Default to 'usuario' instead of 'collaborator'
    END
  );
  RETURN new;
END;
$$;

-- 3. Create quote-pdfs storage bucket (public access for simplicity)
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES ('quote-pdfs', 'quote-pdfs', true, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 4. Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "public_read_pdfs" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_upload_pdfs" ON storage.objects;

-- 5. Create new policies for quote-pdfs bucket
CREATE POLICY "public_read_pdfs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'quote-pdfs');

CREATE POLICY "authenticated_upload_pdfs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quote-pdfs');

-- 6. Update quotes table to use pdf_path instead of pdf_url
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS pdf_path TEXT;

-- 7. Update existing quotes.pdf_url to quotes.pdf_path if needed
UPDATE public.quotes 
SET pdf_path = CASE 
  WHEN pdf_url IS NOT NULL THEN 'quote-pdfs/quote-' || id || '.pdf'
  ELSE NULL
END
WHERE pdf_path IS NULL AND pdf_url IS NOT NULL;