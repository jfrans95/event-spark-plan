-- Seed productos para probar filtros y categorías
-- Crear más proveedores si hace falta
INSERT INTO provider_profiles (id, user_id, application_id) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO provider_applications (id, user_id, company_name, nit, contact_phone, product_category, experience_description, specialization, years_experience, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Decoraciones Elite', '900123456-7', '+57 300 123 4567', 'Decoración/Ambientación', 'Especialistas en decoración de eventos', 'Bodas y eventos corporativos', 8, 'approved'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Catering Premium', '900234567-8', '+57 301 234 5678', 'Catering', 'Expertos en catering y banquetes', 'Eventos masivos', 12, 'approved')
ON CONFLICT (id) DO NOTHING;

-- Productos variados por categoría para probar filtros
INSERT INTO products (
  id, provider_id, name, description, price, categoria, plan, 
  space_types, event_types, capacity_min, capacity_max, activo
) VALUES 
-- Decoración/Ambientación
('prod-deco-001', '550e8400-e29b-41d4-a716-446655440000', 'Decoración Elegante Bodas', 'Decoración completa para bodas con flores naturales y centros de mesa', 2500000, 'decoracion_ambientacion', 'premium', 
 '{jardines_botanicos,salones_eventos,casas_patrimoniales}', '{bodas,celebraciones_internas}', 50, 200, true),

('prod-deco-002', '550e8400-e29b-41d4-a716-446655440000', 'Ambientación Corporativa', 'Decoración moderna para eventos empresariales', 1800000, 'decoracion_ambientacion', 'pro',
 '{auditorios,salones_eventos,rooftops}', '{eventos_institucionales,lanzamientos_aniversarios}', 30, 150, true),

-- Catering
('prod-cater-001', '550e8400-e29b-41d4-a716-446655440002', 'Menú Ejecutivo Premium', 'Catering completo para eventos corporativos con opciones vegetarianas', 85000, 'catering', 'premium',
 '{auditorios,salones_eventos,casas_patrimoniales}', '{eventos_institucionales,graduaciones}', 20, 300, true),

('prod-cater-002', '550e8400-e29b-41d4-a716-446655440002', 'Cóctel de Bienvenida', 'Servicio de cóctel con canapes y bebidas', 45000, 'catering', 'pro',
 '{rooftops,jardines_botanicos,salones_eventos}', '{lanzamientos_aniversarios,celebraciones_internas}', 15, 100, true),

-- Mixología/Coctelería  
('prod-mixo-001', '579fa480-0720-4c4f-bb7c-43d76dd1de6a', 'Barra de Cócteles Clásicos', 'Servicio completo de coctelería con bartender profesional', 650000, 'cocteleria', 'pro',
 '{rooftops,jardines_botanicos,salones_eventos}', '{bodas,celebraciones_internas,lanzamientos_aniversarios}', 30, 120, true),

-- Arte/Cultura
('prod-arte-001', 'd17ef70e-c6f5-431e-8ec9-483b9e2176fa', 'Show Musical en Vivo', 'Presentación musical acústica para eventos', 1200000, 'arte_cultura', 'premium',
 '{jardines_botanicos,teatros,auditorios}', '{bodas,graduaciones,eventos_medios}', 40, 200, true),

-- Audiovisuales
('prod-audio-001', 'd17ef70e-c6f5-431e-8ec9-483b9e2176fa', 'Sistema de Audio Profesional', 'Equipos de sonido para eventos medianos', 800000, 'registros_audiovisuales', 'pro',
 '{auditorios,teatros,salones_eventos}', '{graduaciones,eventos_institucionales,eventos_medios}', 50, 300, true),

-- Mobiliario
('prod-mobil-001', '579fa480-0720-4c4f-bb7c-43d76dd1de6a', 'Mobiliario Lounge VIP', 'Sillas y mesas elegantes para áreas VIP', 1500000, 'mobiliario', 'premium',
 '{rooftops,jardines_botanicos,salones_eventos}', '{bodas,lanzamientos_aniversarios}', 20, 80, true),

-- Más productos para filtros específicos del usuario actual
('prod-parques-001', '550e8400-e29b-41d4-a716-446655440000', 'Carpa Eventos Pequeños', 'Carpa resistente para eventos al aire libre', 850000, 'montaje_tecnico', 'basico',
 '{parques_publicos}', '{eventos_pequenos}', 60, 100, true),

('prod-parques-002', '579fa480-0720-4c4f-bb7c-43d76dd1de6a', 'Sonido Parques Públicos', 'Sistema de audio portátil para eventos al aire libre', 450000, 'registros_audiovisuales', 'basico',
 '{parques_publicos}', '{eventos_pequenos}', 50, 120, true)

ON CONFLICT (id) DO NOTHING;