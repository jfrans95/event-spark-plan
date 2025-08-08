-- Simply insert the admin profile with a specific UUID that we can reference
-- The user will need to sign up normally, but when they do, we can update their profile to admin role
INSERT INTO public.profiles (user_id, email, full_name, role) 
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, 
  'frans.corporativo@gmail.com',
  'Jonathan Franswa Cardona',
  'administrator'
);