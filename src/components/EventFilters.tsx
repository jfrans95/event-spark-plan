import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, Star } from "lucide-react";

interface EventFilters {
  spaceType: string;
  guestCount: number;
  eventType: string;
  plan: string;
}

interface EventFiltersProps {
  onFiltersChange: (filters: EventFilters) => void;
  onStartDesign: () => void;
}

const SPACE_TYPES = [
  { id: "salon_eventos", name: "Salones de Eventos", icon: "🏛️" },
  { id: "playas", name: "Playas", icon: "🏖️" },
  { id: "jardines", name: "Jardines", icon: "🌺" },
  { id: "hoteles", name: "Hoteles", icon: "🏨" },
  { id: "espacios_al_aire_libre", name: "Espacios al Aire Libre", icon: "🌳" }
];

const EVENT_TYPES = [
  { category: "Corporativo", items: ["Conferencias", "Lanzamientos", "Team Building"] },
  { category: "Social", items: ["Bodas", "Quinceañeras", "Aniversarios"] },
  { category: "Cultural", items: ["Conciertos", "Exposiciones", "Festivales"] }
];

const PLANS = [
  { id: "basico", name: "Básico", color: "bg-secondary" },
  { id: "pro", name: "Pro", color: "bg-primary" },
  { id: "premium", name: "Premium", color: "bg-accent" }
];

export const EventFilters = ({ onFiltersChange, onStartDesign }: EventFiltersProps) => {
  const [filters, setFilters] = useState<EventFilters>({
    spaceType: "",
    guestCount: 50,
    eventType: "",
    plan: ""
  });

  const updateFilter = (key: keyof EventFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <Card className="p-6 border-2 rounded-2xl shadow-lg">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Personaliza tu evento
        </h3>

        {/* Tipo de Espacio */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4" />
            Tipo de Espacio
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SPACE_TYPES.map((space) => (
              <Button
                key={space.id}
                variant={filters.spaceType === space.id ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter("spaceType", space.id)}
                className="justify-start text-xs h-auto py-2"
              >
                <span className="mr-1">{space.icon}</span>
                {space.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Número de Invitados */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            Número de Invitados: {filters.guestCount}
          </label>
          <Slider
            value={[filters.guestCount]}
            onValueChange={([value]) => updateFilter("guestCount", value)}
            max={500}
            min={20}
            step={20}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>20</span>
            <span>500+</span>
          </div>
        </div>

        {/* Tipo de Evento */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Tipo de Evento
          </label>
          <div className="space-y-3">
            {EVENT_TYPES.map((category) => (
              <div key={category.category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">{category.category}</h4>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <Badge
                      key={item}
                      variant={filters.eventType === item ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => updateFilter("eventType", item)}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Plan</label>
          <div className="grid grid-cols-3 gap-2">
            {PLANS.map((plan) => (
              <Button
                key={plan.id}
                variant={filters.plan === plan.id ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter("plan", plan.id)}
                className="h-auto py-3"
              >
                {plan.name}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={onStartDesign}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          size="lg"
        >
          Diseñar Mi Evento
        </Button>
      </div>
    </Card>
  );
};