-- Allow null user_id for anonymous quotes
ALTER TABLE public.quotes 
ALTER COLUMN user_id DROP NOT NULL;

-- Create RLS policy for anonymous quotes
CREATE POLICY "Allow anonymous quotes creation" 
ON public.quotes 
FOR INSERT 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Create RLS policy for viewing anonymous quotes by email
CREATE POLICY "Allow viewing anonymous quotes by email" 
ON public.quotes 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);