import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mapSpaceTypeToDatabase, mapEventTypeToDatabase, mapPlanToDatabase } from "@/utils/eventDesignerMapping";

interface EventDesignerData {
  spaceType: string;
  guestCount: number;
  eventType: string;
  plan: string;
}

export const EventDesigner = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventDesignerData>({
    spaceType: "",
    guestCount: 0, // No default value
    eventType: "",
    plan: ""
  });

  const spaceTypes = [
    {
      category: "🌿 Espacios Abiertos / Aire libre",
      options: ["Parques públicos", "Jardín Botánico", "Miradores Naturales", "Playas", "Plazoletas", "Calles Barrios"]
    },
    {
      category: "🏢 Espacios Cerrados",
      options: ["Salón de Eventos", "Teatros", "Auditorios", "Centros convenciones", "Discotecas", "Restaurantes privados", "Iglesias templos", "Galerías museos"]
    },
    {
      category: "🔀 Espacios No Convencionales",
      options: ["Bodegas", "Casas Patrimoniales", "Rooftops", "Locales en desuso", "Estudios", "Fincas privadas"]
    },
    {
      category: "🏠 Casas Familiares",
      options: ["Casas familiares", "Unidades Residenciales", "Casas patio jardín", "Viviendas adecuadas"]
    },
    {
      category: "🚚 Espacios Móviles / Temporales",
      options: ["Carpas", "Contenedores"]
    }
  ];

  const eventTypes = [
    {
      category: "📊 Eventos Corporativos",
      options: ["Celebraciones internas", "Activaciones de marca", "Team building", "Cierre de año"]
    },
    {
      category: "🥂 Eventos Sociales",
      options: ["Cumpleaños", "Día madre padre", "Fechas religiosas", "Graduaciones", "Reuniones especiales"]
    },
    {
      category: "🎭 Eventos Culturales (Institucionales)",
      options: ["Eventos pequeños", "Eventos medios", "Eventos institucionales", "Encuentros públicos", "Lanzamientos aniversarios"]
    }
  ];

const plans = ["Básico", "Pro", "Premium"];
  const navigate = useNavigate();

  const toggleFilter = (filterName: string) => {
    setActiveFilter(activeFilter === filterName ? null : filterName);
  };

  const selectOption = (field: keyof EventDesignerData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setActiveFilter(null);
  };

  const updateGuestCount = (value: number[]) => {
    setFormData(prev => ({ ...prev, guestCount: value[0] }));
  };

  const getGuestCountMarks = () => {
    const marks = [];
    // 20 en 20 hasta 100
    for (let i = 20; i <= 100; i += 20) {
      marks.push(i);
    }
    // 50 en 50 hasta 300
    for (let i = 150; i <= 300; i += 50) {
      marks.push(i);
    }
    // 100 en 100 hasta 500
    for (let i = 400; i <= 500; i += 100) {
      marks.push(i);
    }
    return marks;
  };

  const getDisplayValue = (field: keyof EventDesignerData) => {
    const value = formData[field];
    
    switch (field) {
      case 'spaceType':
        return value || "Tipo de lugar";
      case 'guestCount':
        return formData.guestCount > 0 ? `${value} invitados` : "Cantidad de invitados";
      case 'eventType':
        return value || "Tipo de eventos";
      case 'plan':
        return value || "Plan";
      default:
        return "";
    }
  };

  const isFormComplete = () => {
    return formData.spaceType && formData.guestCount > 0 && formData.eventType && formData.plan;
  };

  return (
    <Card className="p-6 bg-background/95 backdrop-blur border-2 rounded-2xl shadow-xl">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Vamos a planear tu evento</h3>
        <p className="text-sm text-muted-foreground">
          Completa estos datos para ver opciones personalizadas
        </p>
        
        <div className="space-y-3">
          {/* Tipo de espacio */}
          <div className="relative">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => toggleFilter('spaceType')}
            >
              <span>📍 {getDisplayValue('spaceType')}</span>
              {activeFilter === 'spaceType' ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
            
            {activeFilter === 'spaceType' && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {spaceTypes.map((group, groupIndex) => (
                  <div key={groupIndex} className="p-2">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                      {group.category}
                    </div>
                    {group.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                        onClick={() => selectOption('spaceType', option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Número de invitados */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => toggleFilter('guestCount')}
            >
              <span>👥 {getDisplayValue('guestCount')}</span>
              {activeFilter === 'guestCount' ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
            
            {activeFilter === 'guestCount' && (
              <div className="p-4 border rounded-lg bg-background">
                <div className="space-y-4">
                  <div className="text-center text-sm font-medium">
                    {formData.guestCount > 0 ? `${formData.guestCount} invitados` : "Selecciona cantidad de invitados"}
                  </div>
                  <Slider
                    value={[formData.guestCount]}
                    onValueChange={updateGuestCount}
                    max={500}
                    min={20}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>20</span>
                    <span>500</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tipo de evento */}
          <div className="relative">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => toggleFilter('eventType')}
            >
              <span>🎉 {getDisplayValue('eventType')}</span>
              {activeFilter === 'eventType' ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
            
            {activeFilter === 'eventType' && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {eventTypes.map((group, groupIndex) => (
                  <div key={groupIndex} className="p-2">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                      {group.category}
                    </div>
                    {group.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                        onClick={() => selectOption('eventType', option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tipo de plan */}
          <div className="relative">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => toggleFilter('plan')}
            >
              <span>💎 {getDisplayValue('plan')}</span>
              {activeFilter === 'plan' ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
            
            {activeFilter === 'plan' && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-lg shadow-lg">
                <div className="p-2">
                  {plans.map((plan, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-muted rounded transition-colors flex items-center justify-between"
                      onClick={() => selectOption('plan', plan)}
                    >
                      <span>{plan}</span>
                      {plan === 'Premium' && <Badge variant="secondary" className="text-xs">Recomendado</Badge>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Button 
          className="w-full mt-4" 
          disabled={!isFormComplete()}
          onClick={() => {
            const params = new URLSearchParams({
              espacio: mapSpaceTypeToDatabase(formData.spaceType),
              evento: mapEventTypeToDatabase(formData.eventType),
              plan: mapPlanToDatabase(formData.plan),
              aforo: String(formData.guestCount),
            });
            navigate(`/catalog?${params.toString()}`);
          }}
        >
          Diseñar Mi Evento
        </Button>
      </div>
    </Card>
  );
};