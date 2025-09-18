import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { GuestSelector } from "@/components/ui/guest-selector";
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

  // Remove default guest count assignment
  useEffect(() => {
    const next = new URLSearchParams(params);
    // Don't set default aforo anymore
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  const onGuestCountChange = (value: number) => {
    const next = new URLSearchParams(params);
    next.set("aforo", String(value));
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

  const currentSpaceTypes = params.get("espacio")?.split(',') || [];
  const currentEventTypes = params.get("evento")?.split(',') || [];
  
  // Check if we have active filters from EventDesigner
  const hasActiveFilters = !!(params.get("espacio") || params.get("evento") || params.get("plan"));
  
  const clearAllFilters = () => {
    setParams(new URLSearchParams());
  };
  
  const removeFilter = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value && key === "espacio") {
      const current = next.get(key)?.split(',').filter(v => v !== value) || [];
      if (current.length > 0) {
        next.set(key, current.join(','));
      } else {
        next.delete(key);
      }
    } else if (value && key === "evento") {
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
    const espacio = params.get("espacio");
    const evento = params.get("evento");
    const plan = params.get("plan");
    const aforo = params.get("aforo") || "50";
    
    const designParams = new URLSearchParams({
      espacio: espacio || "",
      evento: evento || "",
      plan: plan || "",
      aforo: aforo,
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
            {params.get("espacio") && (
              <Badge variant="secondary" className="flex items-center gap-1">
                📍 {params.get("espacio")}
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-muted rounded" 
                  onClick={() => removeFilter("espacio")}
                />
              </Badge>
            )}
            {params.get("evento") && (
              <Badge variant="secondary" className="flex items-center gap-1">
                🎉 {params.get("evento")}
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-muted rounded" 
                  onClick={() => removeFilter("evento")}
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
            {params.get("aforo") && (
              <Badge variant="secondary" className="flex items-center gap-1">
                👥 {params.get("aforo")} invitados
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-muted rounded" 
                  onClick={() => removeFilter("aforo")}
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
          <Label>Cantidad de invitados</Label>
          <GuestSelector
            value={params.get("aforo") ? parseInt(params.get("aforo")!) : null}
            onChange={onGuestCountChange}
            variant="inline"
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
                    onMultipleChange("espacio", space.value, checked as boolean)
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
                    onMultipleChange("evento", event.value, checked as boolean)
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
