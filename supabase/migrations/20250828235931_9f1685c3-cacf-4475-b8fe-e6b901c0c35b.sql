-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.auto_approve_provider_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-approve the application
  NEW.status = 'approved';
  NEW.reviewed_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'pg_temp';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'pg_temp';