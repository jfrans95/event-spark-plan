-- Add email tracking column to quotes table
ALTER TABLE public.quotes 
ADD COLUMN email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add an index for better performance when querying email status
CREATE INDEX idx_quotes_email_sent_at ON public.quotes(email_sent_at);

-- Add a comment to document the column
COMMENT ON COLUMN public.quotes.email_sent_at IS 'Timestamp when the quote email was successfully sent to the customer';