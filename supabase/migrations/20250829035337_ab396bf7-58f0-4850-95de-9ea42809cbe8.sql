-- Actualizar la tabla provider_applications para manejar el flujo completo de solicitud
ALTER TABLE provider_applications 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_last_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS social_networks TEXT;

-- Actualizar el trigger para crear perfil automáticamente cuando se aprueba una aplicación
CREATE OR REPLACE FUNCTION handle_provider_application_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear perfil si el status cambió a 'approved' 
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    -- Actualizar el perfil del usuario para que sea proveedor
    UPDATE profiles 
    SET role = 'provider'
    WHERE user_id = NEW.user_id;
    
    -- Crear el perfil de proveedor
    INSERT INTO provider_profiles (user_id, application_id)
    VALUES (NEW.user_id, NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para manejar aprobaciones
DROP TRIGGER IF EXISTS on_provider_application_approved ON provider_applications;
CREATE TRIGGER on_provider_application_approved
  AFTER UPDATE ON provider_applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_provider_application_approval();