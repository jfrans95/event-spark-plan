import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuestSlider } from "@/components/ui/guest-slider";
import { getAllSpaceTypes, getAllEventTypes, PLAN_TYPES } from "@/constants/productTags";

interface Filters {
  espacio?: string;
  aforo?: number;
  evento?: string;
  plan?: string;
}

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onApply: (filters: Filters) => void;
}

const EditEventModal = ({ 
  open, 
  onOpenChange, 
  filters, 
  onFiltersChange, 
  onApply 
}: EditEventModalProps) => {
  const handleApply = () => {
    onApply(filters);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Filtros del Evento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Tipo de Espacio */}
          <div className="space-y-2">
            <Label>Tipo de Espacio</Label>
            <Select 
              value={filters.espacio || ""} 
              onValueChange={(value) => onFiltersChange({ ...filters, espacio: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo de espacio" />
              </SelectTrigger>
              <SelectContent>
                {getAllSpaceTypes().map((space) => (
                  <SelectItem key={space.value} value={space.value}>
                    {space.icon} {space.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cantidad de Invitados */}
          <div className="space-y-2">
            <Label>Cantidad de Invitados</Label>
            <GuestSlider
              value={filters.aforo || null}
              onChange={(value) => onFiltersChange({ ...filters, aforo: value })}
            />
          </div>

          {/* Tipo de Evento */}
          <div className="space-y-2">
            <Label>Tipo de Evento</Label>
            <Select 
              value={filters.evento || ""} 
              onValueChange={(value) => onFiltersChange({ ...filters, evento: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                {getAllEventTypes().map((event) => (
                  <SelectItem key={event.value} value={event.value}>
                    {event.icon} {event.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plan */}
          <div className="space-y-2">
            <Label>Nivel de Servicio</Label>
            <Select 
              value={filters.plan || ""} 
              onValueChange={(value) => onFiltersChange({ ...filters, plan: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un plan" />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleApply}>
            Aplicar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventModal;