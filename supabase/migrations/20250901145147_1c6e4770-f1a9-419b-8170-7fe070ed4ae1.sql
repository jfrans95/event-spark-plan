-- Add category enum and missing fields to products table
CREATE TYPE category_type AS ENUM (
  'montaje_tecnico',
  'decoracion_ambientacion', 
  'catering',
  'mixologia_cocteleria',
  'arte_cultura',
  'audiovisuales',
  'mobiliario'
);

-- Add missing fields to products table
ALTER TABLE products ADD COLUMN categoria category_type NOT NULL DEFAULT 'montaje_tecnico';
ALTER TABLE products ADD COLUMN activo boolean NOT NULL DEFAULT true;

-- Insert some sample products for testing the filter functionality
INSERT INTO products (provider_id, name, description, price, categoria, space_types, capacity_min, capacity_max, event_types, plan, activo) 
SELECT 
  pp.id as provider_id,
  'Coordinador de evento',
  'Coordinación integral del evento desde inicio hasta fin',
  350000,
  'montaje_tecnico',
  ARRAY['salones_eventos', 'auditorios', 'centros_convenciones']::space_type[],
  20,
  500,
  ARRAY['celebraciones_internas', 'cumpleanos', 'eventos_institucionales']::event_type[],
  'pro',
  true
FROM provider_profiles pp LIMIT 1;

INSERT INTO products (provider_id, name, description, price, categoria, space_types, capacity_min, capacity_max, event_types, plan, activo) 
SELECT 
  pp.id as provider_id,
  'Tarima básica 4x3m',
  'Tarima profesional para eventos con capacidad para 50 personas',
  420000,
  'montaje_tecnico',
  ARRAY['salones_eventos', 'plazoletas', 'parques_publicos']::space_type[],
  40,
  100,
  ARRAY['celebraciones_internas', 'cumpleanos', 'eventos_medios']::event_type[],
  'basico',
  true
FROM provider_profiles pp LIMIT 1;

INSERT INTO products (provider_id, name, description, price, categoria, space_types, capacity_min, capacity_max, event_types, plan, activo) 
SELECT 
  pp.id as provider_id,
  'Arco floral natural',
  'Arco decorativo con flores naturales de temporada',
  280000,
  'decoracion_ambientacion',
  ARRAY['jardines_botanicos', 'salones_eventos', 'iglesias_templos']::space_type[],
  20,
  200,
  ARRAY['cumpleanos', 'graduaciones', 'fechas_religiosas']::event_type[],
  'pro',
  true
FROM provider_profiles pp LIMIT 1;

INSERT INTO products (provider_id, name, description, price, categoria, space_types, capacity_min, capacity_max, event_types, plan, activo) 
SELECT 
  pp.id as provider_id,
  'Catering menú 3 tiempos',
  'Menú completo con entrada, plato fuerte y postre',
  95000,
  'catering',
  ARRAY['salones_eventos', 'auditorios', 'centros_convenciones', 'restaurantes_privados']::space_type[],
  50,
  300,
  ARRAY['celebraciones_internas', 'cumpleanos', 'graduaciones', 'eventos_institucionales']::event_type[],
  'basico',
  true
FROM provider_profiles pp LIMIT 1;

INSERT INTO products (provider_id, name, description, price, categoria, space_types, capacity_min, capacity_max, event_types, plan, activo) 
SELECT 
  pp.id as provider_id,
  'Bar de cocteles premium',
  'Servicio de mixología con cocteles clásicos y signature',
  180000,
  'mixologia_cocteleria',
  ARRAY['salones_eventos', 'rooftops', 'discotecas', 'restaurantes_privados']::space_type[],
  40,
  200,
  ARRAY['celebraciones_internas', 'cumpleanos', 'reuniones_especiales']::event_type[],
  'premium',
  true
FROM provider_profiles pp LIMIT 1;

INSERT INTO products (provider_id, name, description, price, categoria, space_types, capacity_min, capacity_max, event_types, plan, activo) 
SELECT 
  pp.id as provider_id,
  'DJ Set completo',
  'Servicio de DJ con equipo de sonido y luces básicas',
  400000,
  'arte_cultura',
  ARRAY['salones_eventos', 'discotecas', 'plazoletas', 'rooftops']::space_type[],
  60,
  400,
  ARRAY['celebraciones_internas', 'cumpleanos', 'reuniones_especiales', 'eventos_medios']::event_type[],
  'pro',
  true
FROM provider_profiles pp LIMIT 1;

INSERT INTO products (provider_id, name, description, price, categoria, space_types, capacity_min, capacity_max, event_types, plan, activo) 
SELECT 
  pp.id as provider_id,
  'Iluminación LED profesional',
  'Sistema de iluminación LED con efectos y colores',
  220000,
  'audiovisuales',
  ARRAY['salones_eventos', 'teatros', 'auditorios', 'discotecas']::space_type[],
  30,
  300,
  ARRAY['celebraciones_internas', 'eventos_institucionales', 'eventos_medios', 'lanzamientos_aniversarios']::event_type[],
  'pro',
  true
FROM provider_profiles pp LIMIT 1;

INSERT INTO products (provider_id, name, description, price, categoria, space_types, capacity_min, capacity_max, event_types, plan, activo) 
SELECT 
  pp.id as provider_id,
  'Sillas Tiffany (pack 20)',
  'Pack de 20 sillas Tiffany transparentes',
  160000,
  'mobiliario',
  ARRAY['salones_eventos', 'jardines_botanicos', 'casas_patrimoniales', 'auditorios']::space_type[],
  20,
  100,
  ARRAY['cumpleanos', 'graduaciones', 'fechas_religiosas', 'eventos_institucionales']::event_type[],
  'basico',
  true
FROM provider_profiles pp LIMIT 1;