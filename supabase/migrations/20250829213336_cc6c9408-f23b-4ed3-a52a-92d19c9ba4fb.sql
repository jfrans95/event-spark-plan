-- Asegurar que solo existe un administrador y es el usuario especificado
UPDATE profiles 
SET role = 'administrator'::app_role 
WHERE email = 'frans.corporativo@gmail.com';

-- Asegurar que no hay otros administradores
UPDATE profiles 
SET role = 'collaborator'::app_role 
WHERE role = 'administrator'::app_role 
AND email != 'frans.corporativo@gmail.com';