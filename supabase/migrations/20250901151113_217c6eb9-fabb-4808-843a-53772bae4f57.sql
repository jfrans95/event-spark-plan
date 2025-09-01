-- Create comprehensive seed data for testing
-- First, clear existing test data
DELETE FROM products WHERE provider_id IN (
  SELECT id FROM provider_profiles WHERE user_id IN (
    SELECT user_id FROM profiles WHERE email LIKE '%seed%' OR full_name LIKE '%Test%'
  )
);

DELETE FROM provider_profiles WHERE user_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%seed%' OR full_name LIKE '%Test%'
);

DELETE FROM provider_applications WHERE user_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%seed%' OR full_name LIKE '%Test%'
);

DELETE FROM profiles WHERE email LIKE '%seed%' OR full_name LIKE '%Test%';

-- Create test users and profiles (21 providers across 7 categories, 3 per category)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
-- Montaje técnico (3 providers)
('11111111-1111-1111-1111-111111111111', 'montaje1@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Montaje 1"}'),
('11111111-1111-1111-1111-111111111112', 'montaje2@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Montaje 2"}'),
('11111111-1111-1111-1111-111111111113', 'montaje3@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Montaje 3"}'),

-- Decoración/ambientación (3 providers)
('22222222-2222-2222-2222-222222222221', 'decoracion1@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Decoración 1"}'),
('22222222-2222-2222-2222-222222222222', 'decoracion2@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Decoración 2"}'),
('22222222-2222-2222-2222-222222222223', 'decoracion3@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Decoración 3"}'),

-- Catering (3 providers)
('33333333-3333-3333-3333-333333333331', 'catering1@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Catering 1"}'),
('33333333-3333-3333-3333-333333333332', 'catering2@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Catering 2"}'),
('33333333-3333-3333-3333-333333333333', 'catering3@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Catering 3"}'),

-- Mixología/coctelería (3 providers)
('44444444-4444-4444-4444-444444444441', 'mixologia1@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Mixología 1"}'),
('44444444-4444-4444-4444-444444444442', 'mixologia2@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Mixología 2"}'),
('44444444-4444-4444-4444-444444444443', 'mixologia3@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Mixología 3"}'),

-- Arte/cultura (3 providers)
('55555555-5555-5555-5555-555555555551', 'arte1@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Arte 1"}'),
('55555555-5555-5555-5555-555555555552', 'arte2@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Arte 2"}'),
('55555555-5555-5555-5555-555555555553', 'arte3@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Arte 3"}'),

-- Audiovisuales (3 providers)
('66666666-6666-6666-6666-666666666661', 'audiovisuales1@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Audiovisuales 1"}'),
('66666666-6666-6666-6666-666666666662', 'audiovisuales2@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Audiovisuales 2"}'),
('66666666-6666-6666-6666-666666666663', 'audiovisuales3@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Audiovisuales 3"}'),

-- Mobiliario (3 providers)
('77777777-7777-7777-7777-777777777771', 'mobiliario1@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Mobiliario 1"}'),
('77777777-7777-7777-7777-777777777772', 'mobiliario2@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Mobiliario 2"}'),
('77777777-7777-7777-7777-777777777773', 'mobiliario3@seed.test', now(), now(), now(), '{"role": "provider", "full_name": "Test Mobiliario 3"}')

ON CONFLICT (id) DO NOTHING;

-- Insert profiles for test users
INSERT INTO profiles (user_id, email, full_name, role)
VALUES 
-- Montaje técnico
('11111111-1111-1111-1111-111111111111', 'montaje1@seed.test', 'Test Montaje 1', 'provider'),
('11111111-1111-1111-1111-111111111112', 'montaje2@seed.test', 'Test Montaje 2', 'provider'),
('11111111-1111-1111-1111-111111111113', 'montaje3@seed.test', 'Test Montaje 3', 'provider'),
-- Decoración
('22222222-2222-2222-2222-222222222221', 'decoracion1@seed.test', 'Test Decoración 1', 'provider'),
('22222222-2222-2222-2222-222222222222', 'decoracion2@seed.test', 'Test Decoración 2', 'provider'),
('22222222-2222-2222-2222-222222222223', 'decoracion3@seed.test', 'Test Decoración 3', 'provider'),
-- Catering
('33333333-3333-3333-3333-333333333331', 'catering1@seed.test', 'Test Catering 1', 'provider'),
('33333333-3333-3333-3333-333333333332', 'catering2@seed.test', 'Test Catering 2', 'provider'),
('33333333-3333-3333-3333-333333333333', 'catering3@seed.test', 'Test Catering 3', 'provider'),
-- Mixología
('44444444-4444-4444-4444-444444444441', 'mixologia1@seed.test', 'Test Mixología 1', 'provider'),
('44444444-4444-4444-4444-444444444442', 'mixologia2@seed.test', 'Test Mixología 2', 'provider'),
('44444444-4444-4444-4444-444444444443', 'mixologia3@seed.test', 'Test Mixología 3', 'provider'),
-- Arte
('55555555-5555-5555-5555-555555555551', 'arte1@seed.test', 'Test Arte 1', 'provider'),
('55555555-5555-5555-5555-555555555552', 'arte2@seed.test', 'Test Arte 2', 'provider'),
('55555555-5555-5555-5555-555555555553', 'arte3@seed.test', 'Test Arte 3', 'provider'),
-- Audiovisuales
('66666666-6666-6666-6666-666666666661', 'audiovisuales1@seed.test', 'Test Audiovisuales 1', 'provider'),
('66666666-6666-6666-6666-666666666662', 'audiovisuales2@seed.test', 'Test Audiovisuales 2', 'provider'),
('66666666-6666-6666-6666-666666666663', 'audiovisuales3@seed.test', 'Test Audiovisuales 3', 'provider'),
-- Mobiliario
('77777777-7777-7777-7777-777777777771', 'mobiliario1@seed.test', 'Test Mobiliario 1', 'provider'),
('77777777-7777-7777-7777-777777777772', 'mobiliario2@seed.test', 'Test Mobiliario 2', 'provider'),
('77777777-7777-7777-7777-777777777773', 'mobiliario3@seed.test', 'Test Mobiliario 3', 'provider')

ON CONFLICT (user_id) DO NOTHING;

-- Create provider applications (all approved)
INSERT INTO provider_applications (
  user_id, company_name, nit, contact_name, contact_last_name, 
  contact_email, contact_phone, product_category, years_experience,
  experience_description, specialization, status, reviewed_at
)
VALUES 
-- Montaje técnico
('11111111-1111-1111-1111-111111111111', 'Montaje Pro 1', '900123456-1', 'Juan', 'Pérez', 'montaje1@seed.test', '3001234567', 'montaje_tecnico', 5, 'Especialistas en montaje técnico', 'Eventos corporativos', 'approved', now()),
('11111111-1111-1111-1111-111111111112', 'Montaje Pro 2', '900123456-2', 'María', 'González', 'montaje2@seed.test', '3001234568', 'montaje_tecnico', 8, 'Expertos en montaje', 'Eventos grandes', 'approved', now()),
('11111111-1111-1111-1111-111111111113', 'Montaje Pro 3', '900123456-3', 'Carlos', 'López', 'montaje3@seed.test', '3001234569', 'montaje_tecnico', 3, 'Montaje especializado', 'Eventos médicos', 'approved', now()),

-- Continue for all categories...
('22222222-2222-2222-2222-222222222221', 'Decoración Elite 1', '900234567-1', 'Ana', 'Martín', 'decoracion1@seed.test', '3002345671', 'decoracion_ambientacion', 7, 'Decoración exclusiva', 'Bodas', 'approved', now()),
('22222222-2222-2222-2222-222222222222', 'Decoración Elite 2', '900234567-2', 'Luis', 'Rodríguez', 'decoracion2@seed.test', '3002345672', 'decoracion_ambientacion', 4, 'Ambientación temática', 'Eventos corporativos', 'approved', now()),
('22222222-2222-2222-2222-222222222223', 'Decoración Elite 3', '900234567-3', 'Carmen', 'Díaz', 'decoracion3@seed.test', '3002345673', 'decoracion_ambientacion', 6, 'Decoración moderna', 'Cumpleaños', 'approved', now())

ON CONFLICT (user_id) DO NOTHING;