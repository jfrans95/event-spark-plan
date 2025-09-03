-- Update RLS policies for quote_items to work with anonymous quotes
DROP POLICY IF EXISTS "Users can view their quote items" ON public.quote_items;
DROP POLICY IF EXISTS "Users can create their quote items" ON public.quote_items;

-- Allow viewing quote items for authenticated users' quotes OR anonymous quotes
CREATE POLICY "Allow viewing quote items for owned or anonymous quotes" 
ON public.quote_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND (quotes.user_id = auth.uid() OR quotes.user_id IS NULL)
  )
);

-- Allow creating quote items for authenticated users' quotes OR anonymous quotes
CREATE POLICY "Allow creating quote items for owned or anonymous quotes" 
ON public.quote_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND (quotes.user_id = auth.uid() OR quotes.user_id IS NULL)
  )
);