// Mapping between EventDesigner display values and database enum values

export const mapSpaceTypeToDatabase = (displayValue: string): string => {
  const mapping: Record<string, string> = {
    // Espacios Abiertos / Aire libre
    'Parques públicos': 'parques_publicos',
    'Jardín Botánico': 'jardines_botanicos',
    'Miradores Naturales': 'miradores_naturales',
    'Playas': 'playas',
    'Plazoletas': 'plazoletas',
    'Calles Barrios': 'calles_barrios',
    
    // Espacios Cerrados
    'Salón de Eventos': 'salones_eventos',
    'Teatros': 'teatros',
    'Auditorios': 'auditorios',
    'Centros convenciones': 'centros_convenciones',
    'Discotecas': 'discotecas',
    'Restaurantes privados': 'restaurantes_privados',
    'Iglesias templos': 'iglesias_templos',
    'Galerías museos': 'galerias_museos',
    
    // Espacios No Convencionales
    'Bodegas': 'bodegas',
    'Casas Patrimoniales': 'casas_patrimoniales',
    'Rooftops': 'rooftops',
    'Locales en desuso': 'locales_en_desuso',
    'Estudios': 'estudios',
    'Fincas privadas': 'fincas_privadas',
    
    // Casas Familiares
    'Casas familiares': 'casas_familiares',
    'Unidades Residenciales': 'unidades_residenciales',
    'Casas patio jardín': 'casas_patio_jardin',
    'Viviendas adecuadas': 'viviendas_adecuadas',
    
    // Espacios Móviles / Temporales
    'Carpas': 'carpas',
    'Contenedores': 'contenedores'
  };
  
  return mapping[displayValue] || displayValue;
};

export const mapEventTypeToDatabase = (displayValue: string): string => {
  const mapping: Record<string, string> = {
    // Eventos Corporativos
    'Celebraciones internas': 'celebraciones_internas',
    'Activaciones de marca': 'activaciones_marca',
    'Team building': 'team_building',
    'Cierre de año': 'cierre_ano',
    
    // Eventos Sociales
    'Cumpleaños': 'cumpleanos',
    'Día madre padre': 'dia_madre_padre',
    'Fechas religiosas': 'fechas_religiosas',
    'Graduaciones': 'graduaciones',
    'Reuniones especiales': 'reuniones_especiales',
    
    // Eventos Culturales (Institucionales)
    'Eventos pequeños': 'eventos_pequenos',
    'Eventos medios': 'eventos_medios',
    'Eventos institucionales': 'eventos_institucionales',
    'Encuentros públicos': 'encuentros_publicos',
    'Lanzamientos aniversarios': 'lanzamientos_aniversarios'
  };
  
  return mapping[displayValue] || displayValue;
};

export const mapPlanToDatabase = (displayValue: string): string => {
  const mapping: Record<string, string> = {
    'Básico': 'basico',
    'Pro': 'pro',
    'Premium': 'premium'
  };
  
  return mapping[displayValue] || displayValue.toLowerCase();
};