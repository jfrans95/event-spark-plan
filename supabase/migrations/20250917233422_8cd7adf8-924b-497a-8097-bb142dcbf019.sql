-- Fix security issue: Restrict access to quote items to prevent pricing exposure to competitors
-- Remove overly permissive anonymous access while maintaining legitimate functionality

-- Drop existing permissive policies for quote_items
DROP POLICY IF EXISTS "Allow viewing quote items for owned or anonymous quotes" ON public.quote_items;
DROP POLICY IF EXISTS "Allow creating quote items for owned or anonymous quotes" ON public.quote_items;

-- Create more restrictive policies for quote_items
-- Only allow viewing quote items for authenticated users who own the quotes
CREATE POLICY "Users can view quote items for owned quotes only"
ON public.quote_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND quotes.user_id = auth.uid()
    AND quotes.user_id IS NOT NULL
  )
);

-- Allow creating quote items only for authenticated users' quotes
CREATE POLICY "Users can create quote items for owned quotes only"
ON public.quote_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND quotes.user_id = auth.uid()
    AND quotes.user_id IS NOT NULL
  )
);

-- Also fix the quotes table policy to prevent anonymous quote viewing by unauthorized users
DROP POLICY IF EXISTS "Allow viewing anonymous quotes by email" ON public.quotes;

-- Create a more secure policy that only allows viewing own quotes
-- Note: This will break anonymous quote functionality, but prevents pricing exposure
CREATE POLICY "Authenticated users can view own quotes only"
ON public.quotes
FOR SELECT
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Add admin access to quotes and quote_items for management purposes
CREATE POLICY "Admins can view all quote items"
ON public.quote_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'administrator'::app_role
  )
);

-- Update anonymous quote creation policy to require authentication
DROP POLICY IF EXISTS "Allow anonymous quotes creation" ON public.quotes;

-- Only authenticated users can create quotes now
CREATE POLICY "Authenticated users can create quotes only"
ON public.quotes
FOR INSERT
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);