-- Step A: Create public-assets bucket for PDFs and policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create public read policy for public-assets bucket
CREATE POLICY "public read public assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public-assets');