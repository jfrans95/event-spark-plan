-- Create default administrator profile
-- Note: The actual auth user needs to be created through signup, this just ensures the profile exists with admin role

INSERT INTO public.profiles (user_id, email, full_name, role) 
VALUES (
  gen_random_uuid(), 
  'frans.corporativo@gmail.com',
  'Jonathan Franswa Cardona',
  'administrator'
) 
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;