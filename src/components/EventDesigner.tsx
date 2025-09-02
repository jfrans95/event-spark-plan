import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SPACE_TYPES, EVENT_TYPES, PLAN_TYPES } from "@/constants/productTags";

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

  // Use the same constants as the rest of the app for consistency
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
                {Object.entries(SPACE_TYPES).map(([category, options]) => (
                  <div key={category} className="p-2">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                      {category}
                    </div>
                    {options.map((option) => (
                      <button
                        key={option.value}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                        onClick={() => selectOption('spaceType', option.value)}
                      >
                        {option.icon} {option.label}
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
                    <span>100</span>
                    <span>300</span>
                    <span>500</span>
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    Pasos: 20-100 (cada 20) • 100-300 (cada 50) • 300-500 (cada 100)
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
                {Object.entries(EVENT_TYPES).map(([category, options]) => (
                  <div key={category} className="p-2">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                      {category}
                    </div>
                    {options.map((option) => (
                      <button
                        key={option.value}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                        onClick={() => selectOption('eventType', option.value)}
                      >
                        {option.icon} {option.label}
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
                  {PLAN_TYPES.map((plan) => (
                    <button
                      key={plan.value}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-muted rounded transition-colors flex items-center justify-between"
                      onClick={() => selectOption('plan', plan.value)}
                    >
                      <span>{plan.label}</span>
                      {plan.value === 'premium' && <Badge variant="secondary" className="text-xs">Recomendado</Badge>}
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
              espacio: formData.spaceType,
              evento: formData.eventType,
              plan: formData.plan,
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