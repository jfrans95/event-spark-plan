-- Verificar que el trigger existe para crear el perfil del proveedor cuando se aprueba
CREATE OR REPLACE TRIGGER trigger_handle_provider_application_approval
  AFTER UPDATE ON provider_applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_provider_application_approval();