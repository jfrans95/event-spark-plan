-- Seed productos para probar filtros - usando proveedores existentes
INSERT INTO products (
  provider_id, name, description, price, categoria, plan, 
  space_types, event_types, capacity_min, capacity_max, activo
) VALUES 
-- Decoración/Ambientación
('579fa480-0720-4c4f-bb7c-43d76dd1de6a', 'Decoración Elegante Bodas', 'Decoración completa para bodas con flores naturales y centros de mesa', 2500000, 'decoracion_ambientacion', 'premium', 
 '{jardines_botanicos,salones_eventos,casas_patrimoniales}', '{bodas,celebraciones_internas}', 50, 200, true),

('d17ef70e-c6f5-431e-8ec9-483b9e2176fa', 'Ambientación Corporativa', 'Decoración moderna para eventos empresariales', 1800000, 'decoracion_ambientacion', 'pro',
 '{auditorios,salones_eventos,rooftops}', '{eventos_institucionales,lanzamientos_aniversarios}', 30, 150, true),

-- Catering
('579fa480-0720-4c4f-bb7c-43d76dd1de6a', 'Menú Ejecutivo Premium', 'Catering completo para eventos corporativos con opciones vegetarianas', 85000, 'catering', 'premium',
 '{auditorios,salones_eventos,casas_patrimoniales}', '{eventos_institucionales,graduaciones}', 20, 300, true),

('d17ef70e-c6f5-431e-8ec9-483b9e2176fa', 'Cóctel de Bienvenida', 'Servicio de cóctel con canapes y bebidas', 45000, 'catering', 'pro',
 '{rooftops,jardines_botanicos,salones_eventos}', '{lanzamientos_aniversarios,celebraciones_internas}', 15, 100, true),

-- Mixología/Coctelería  
('579fa480-0720-4c4f-bb7c-43d76dd1de6a', 'Barra de Cócteles Clásicos', 'Servicio completo de coctelería con bartender profesional', 650000, 'cocteleria', 'pro',
 '{rooftops,jardines_botanicos,salones_eventos}', '{bodas,celebraciones_internas,lanzamientos_aniversarios}', 30, 120, true),

-- Arte/Cultura
('d17ef70e-c6f5-431e-8ec9-483b9e2176fa', 'Show Musical en Vivo', 'Presentación musical acústica para eventos', 1200000, 'arte_cultura', 'premium',
 '{jardines_botanicos,teatros,auditorios}', '{bodas,graduaciones,eventos_medios}', 40, 200, true),

-- Audiovisuales
('d17ef70e-c6f5-431e-8ec9-483b9e2176fa', 'Sistema de Audio Profesional', 'Equipos de sonido para eventos medianos', 800000, 'registros_audiovisuales', 'pro',
 '{auditorios,teatros,salones_eventos}', '{graduaciones,eventos_institucionales,eventos_medios}', 50, 300, true),

-- Mobiliario
('579fa480-0720-4c4f-bb7c-43d76dd1de6a', 'Mobiliario Lounge VIP', 'Sillas y mesas elegantes para áreas VIP', 1500000, 'mobiliario', 'premium',
 '{rooftops,jardines_botanicos,salones_eventos}', '{bodas,lanzamientos_aniversarios}', 20, 80, true),

-- Productos específicos para filtros actuales del usuario (parques_publicos + eventos_pequenos + basico)
('579fa480-0720-4c4f-bb7c-43d76dd1de6a', 'Carpa Eventos Pequeños', 'Carpa resistente para eventos al aire libre', 850000, 'montaje_tecnico', 'basico',
 '{parques_publicos}', '{eventos_pequenos}', 60, 100, true),

('d17ef70e-c6f5-431e-8ec9-483b9e2176fa', 'Sonido Parques Públicos', 'Sistema de audio portátil para eventos al aire libre', 450000, 'registros_audiovisuales', 'basico',
 '{parques_publicos}', '{eventos_pequenos}', 50, 120, true),

-- Más productos que matchean los filtros actuales
('579fa480-0720-4c4f-bb7c-43d76dd1de6a', 'Mesa de DJ Básica', 'Equipo básico de DJ para eventos pequeños', 320000, 'registros_audiovisuales', 'basico',
 '{parques_publicos,jardines_botanicos}', '{eventos_pequenos}', 40, 100, true);