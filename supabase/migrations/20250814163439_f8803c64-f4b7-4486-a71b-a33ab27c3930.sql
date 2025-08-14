-- Update the app_role enum to include advisor and provider
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'advisor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'provider';