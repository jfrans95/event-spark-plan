import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, X } from "lucide-react";
import { SPACE_TYPES, EVENT_TYPES, PLAN_TYPES, getAllSpaceTypes, getAllEventTypes } from "@/constants/productTags";

const FilterBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // Ensure default params exist
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (!next.get("guests")) next.set("guests", "50");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  const onMultipleChange = (key: string, value: string, checked: boolean) => {
    const next = new URLSearchParams(params);
    const current = next.get(key)?.split(',').filter(Boolean) || [];
    
    if (checked && !current.includes(value)) {
      current.push(value);
    } else if (!checked) {
      const index = current.indexOf(value);
      if (index > -1) current.splice(index, 1);
    }
    
    if (current.length > 0) {
      next.set(key, current.join(','));
    } else {
      next.delete(key);
    }
    setParams(next);
  };

  const currentSpaceTypes = params.get("space")?.split(',') || [];
  const currentEventTypes = params.get("event")?.split(',') || [];
  
  // Check if we have active filters from EventDesigner
  const hasActiveFilters = !!(params.get("space") || params.get("event") || params.get("plan"));
  
  const clearAllFilters = () => {
    setParams(new URLSearchParams());
  };
  
  const removeFilter = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value && key === "space") {
      const current = next.get(key)?.split(',').filter(v => v !== value) || [];
      if (current.length > 0) {
        next.set(key, current.join(','));
      } else {
        next.delete(key);
      }
    } else if (value && key === "event") {
      const current = next.get(key)?.split(',').filter(v => v !== value) || [];
      if (current.length > 0) {
        next.set(key, current.join(','));
      } else {
        next.delete(key);
      }
    } else {
      next.delete(key);
    }
    setParams(next);
  };

  const designEvent = () => {
    const space = params.get("space");
    const event = params.get("event");
    const plan = params.get("plan");
    const guests = params.get("guests") || "50";
    
    const designParams = new URLSearchParams({
      space: space || "",
      event: event || "",
      plan: plan || "",
      guests: guests,
    });
    navigate(`/catalog?${designParams.toString()}`);
    setIsExpanded(false);
  };

  // Compact view when filters are applied from EventDesigner
  if (hasActiveFilters && !isExpanded) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Filtros aplicados</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar filtros
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {params.get("space") && (
              <Badge variant="secondary" className="flex items-center gap-1">
                📍 {params.get("space")}
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-muted rounded" 
                  onClick={() => removeFilter("space")}
                />
              </Badge>
            )}
            {params.get("event") && (
              <Badge variant="secondary" className="flex items-center gap-1">
                🎉 {params.get("event")}
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-muted rounded" 
                  onClick={() => removeFilter("event")}
                />
              </Badge>
            )}
            {params.get("plan") && (
              <Badge variant="secondary" className="flex items-center gap-1">
                💎 {params.get("plan")}
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-muted rounded" 
                  onClick={() => removeFilter("plan")}
                />
              </Badge>
            )}
            {params.get("guests") && (
              <Badge variant="secondary" className="flex items-center gap-1">
                👥 {params.get("guests")} invitados
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-muted rounded" 
                  onClick={() => removeFilter("guests")}
                />
              </Badge>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            className="w-full"
          >
            Limpiar todos los filtros
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Guest Count */}
        <div className="space-y-1">
          <Label htmlFor="guests">Nº personas</Label>
          <Input 
            id="guests" 
            type="number" 
            min={20} 
            max={500} 
            step={10} 
            value={params.get("guests") || "50"} 
            onChange={(e) => onChange("guests", e.target.value)} 
          />
        </div>

        {/* Plan */}
        <div className="space-y-1">
          <Label>Plan</Label>
          <Select value={params.get("plan") || ""} onValueChange={(v) => onChange("plan", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {PLAN_TYPES.map((plan) => (
                <SelectItem key={plan.value} value={plan.value}>
                  {plan.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Space Types */}
        <div className="space-y-2">
          <Label>Tipo de espacio</Label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {getAllSpaceTypes().map((space) => (
              <div key={space.value} className="flex items-center space-x-2">
                <Checkbox
                  id={space.value}
                  checked={currentSpaceTypes.includes(space.value)}
                  onCheckedChange={(checked) => 
                    onMultipleChange("space", space.value, checked as boolean)
                  }
                />
                <Label htmlFor={space.value} className="text-sm">
                  {space.icon} {space.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Event Types */}
        <div className="space-y-2">
          <Label>Tipo de evento</Label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {getAllEventTypes().map((event) => (
              <div key={event.value} className="flex items-center space-x-2">
                <Checkbox
                  id={event.value}
                  checked={currentEventTypes.includes(event.value)}
                  onCheckedChange={(checked) => 
                    onMultipleChange("event", event.value, checked as boolean)
                  }
                />
                <Label htmlFor={event.value} className="text-sm">
                  {event.icon} {event.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {hasActiveFilters && (
          <Button 
            className="w-full"
            onClick={designEvent}
          >
            Diseñar Mi Evento
          </Button>
        )}
        
        {hasActiveFilters && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsExpanded(false)}
              className="flex-1"
            >
              Ocultar filtros
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllFilters}
              className="flex-1"
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterBar;
