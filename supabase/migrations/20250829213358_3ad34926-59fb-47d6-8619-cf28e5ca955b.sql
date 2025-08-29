-- Corregir el rol del administrador (estaba como 'admin' en lugar de 'administrator')
UPDATE profiles 
SET role = 'administrator'::app_role 
WHERE email = 'frans.corporativo@gmail.com' AND role = 'admin'::app_role;