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

import { SPACE_TYPES, EVENT_TYPES, PLAN_TYPES, getAllSpaceTypes, getAllEventTypes } from "@/constants/productTags";

const FEATURED_SPACES = getAllSpaceTypes().slice(0, 5);

const FEATURED_EVENT_CATEGORIES = {
  "Corporativo": getAllEventTypes().filter(e => e.value.includes('celebraciones_internas') || e.value.includes('activaciones_marca') || e.value.includes('team_building')),
  "Social": getAllEventTypes().filter(e => e.value.includes('cumpleanos') || e.value.includes('graduaciones') || e.value.includes('reuniones_especiales')),
  "Cultural": getAllEventTypes().filter(e => e.value.includes('eventos_pequenos') || e.value.includes('eventos_medios') || e.value.includes('eventos_institucionales'))
};

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
            {FEATURED_SPACES.map((space) => (
              <Button
                key={space.value}
                variant={filters.spaceType === space.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter("spaceType", space.value)}
                className="justify-start text-xs h-auto py-2"
              >
                <span className="mr-1">{space.icon}</span>
                {space.label}
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
            {Object.entries(FEATURED_EVENT_CATEGORIES).map(([category, events]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {events.map((event) => (
                    <Badge
                      key={event.value}
                      variant={filters.eventType === event.value ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => updateFilter("eventType", event.value)}
                    >
                      {event.icon} {event.label}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Star className="h-4 w-4" />
            Nivel de Servicio
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PLAN_TYPES.map((plan) => (
              <Button
                key={plan.value}
                variant={filters.plan === plan.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter("plan", plan.value)}
                className="h-auto py-3"
              >
                {plan.label}
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