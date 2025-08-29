export const SPACE_TYPES = {
  "🌿 Espacios Abiertos / Aire libre": [
    { value: "parques_publicos", label: "Parques públicos", icon: "🌳" },
    { value: "jardines_botanicos", label: "Jardines botánicos", icon: "🌺" },
    { value: "miradores_naturales", label: "Miradores naturales", icon: "🏔️" },
    { value: "playas", label: "Playas", icon: "🏖️" },
    { value: "plazoletas", label: "Plazoletas", icon: "🏛️" },
    { value: "calles_barrios", label: "Calles/Barrios", icon: "🏘️" }
  ],
  "🏢 Espacios Cerrados": [
    { value: "salones_eventos", label: "Salones de eventos", icon: "🏛️" },
    { value: "teatros", label: "Teatros", icon: "🎭" },
    { value: "auditorios", label: "Auditorios", icon: "🎪" },
    { value: "centros_convenciones", label: "Centros de convenciones", icon: "🏢" },
    { value: "discotecas", label: "Discotecas", icon: "🕺" },
    { value: "restaurantes_privados", label: "Restaurantes privados", icon: "🍽️" },
    { value: "iglesias_templos", label: "Iglesias/Templos", icon: "⛪" },
    { value: "galerias_museos", label: "Galerías/Museos", icon: "🎨" }
  ],
  "🔀 Espacios No Convencionales": [
    { value: "bodegas", label: "Bodegas", icon: "🏭" },
    { value: "casas_patrimoniales", label: "Casas patrimoniales", icon: "🏛️" },
    { value: "rooftops", label: "Rooftops", icon: "🏙️" },
    { value: "locales_en_desuso", label: "Locales en desuso", icon: "🏚️" },
    { value: "estudios", label: "Estudios", icon: "🎬" },
    { value: "fincas_privadas", label: "Fincas privadas", icon: "🏡" }
  ],
  "🏠 Casas Familiares": [
    { value: "casas_familiares", label: "Casas familiares", icon: "🏠" },
    { value: "unidades_residenciales", label: "Unidades residenciales", icon: "🏘️" },
    { value: "casas_patio_jardin", label: "Casas con patio/jardín", icon: "🏡" },
    { value: "viviendas_adecuadas", label: "Viviendas adecuadas", icon: "🏠" }
  ],
  "🚚 Espacios Móviles / Temporales": [
    { value: "carpas", label: "Carpas", icon: "⛺" },
    { value: "contenedores", label: "Contenedores", icon: "📦" }
  ]
};

export const EVENT_TYPES = {
  "📊 Eventos Corporativos": [
    { value: "celebraciones_internas", label: "Celebraciones internas", icon: "🎉" },
    { value: "activaciones_marca", label: "Activaciones de marca", icon: "📢" },
    { value: "team_building", label: "Team building", icon: "🤝" },
    { value: "cierre_ano", label: "Cierre de año", icon: "🎆" }
  ],
  "🥂 Eventos Sociales": [
    { value: "cumpleanos", label: "Cumpleaños", icon: "🎂" },
    { value: "dia_madre_padre", label: "Día madre/padre", icon: "💐" },
    { value: "fechas_religiosas", label: "Fechas religiosas", icon: "🙏" },
    { value: "graduaciones", label: "Graduaciones", icon: "🎓" },
    { value: "reuniones_especiales", label: "Reuniones especiales", icon: "🥳" }
  ],
  "🎭 Eventos Culturales (Institucionales)": [
    { value: "eventos_pequenos", label: "Eventos pequeños", icon: "🎪" },
    { value: "eventos_medios", label: "Eventos medios", icon: "🎭" },
    { value: "eventos_institucionales", label: "Eventos institucionales", icon: "🏛️" },
    { value: "encuentros_publicos", label: "Encuentros públicos", icon: "👥" },
    { value: "lanzamientos_aniversarios", label: "Lanzamientos/Aniversarios", icon: "🚀" }
  ]
};

export const PLAN_TYPES = [
  { value: "basico", label: "Básico", description: "Plan básico", color: "bg-secondary" },
  { value: "pro", label: "Pro", description: "Plan profesional", color: "bg-primary" },
  { value: "premium", label: "Premium", description: "Plan premium", color: "bg-accent" }
];

// Helper functions
export const getAllSpaceTypes = () => {
  return Object.values(SPACE_TYPES).flat();
};

export const getAllEventTypes = () => {
  return Object.values(EVENT_TYPES).flat();
};

export const getSpaceTypeLabel = (value: string) => {
  return getAllSpaceTypes().find(type => type.value === value)?.label || value;
};

export const getEventTypeLabel = (value: string) => {
  return getAllEventTypes().find(type => type.value === value)?.label || value;
};

export const getPlanLabel = (value: string) => {
  return PLAN_TYPES.find(plan => plan.value === value)?.label || value;
};

// Capacity ranges
export const getCapacityFromValue = (value: number): [number, number] => {
  if (value <= 100) {
    const min = Math.max(20, value - (value % 20));
    const max = min + 20;
    return [min, max];
  } else if (value <= 300) {
    const min = Math.max(100, value - (value % 50));
    const max = min + 50;
    return [min, max];
  } else {
    const min = Math.max(300, value - (value % 100));
    const max = min + 100;
    return [min, max];
  }
};

export const getCapacityLabel = (min: number, max: number) => {
  if (min === max) return `${min} personas`;
  return `${min}-${max} personas`;
};