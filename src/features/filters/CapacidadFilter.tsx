import { Slider } from "@/components/ui/slider";
import { Users } from "lucide-react";
import { useFiltrosStore } from "@/stores/filtrosStore";

export const CapacidadFilter = () => {
  const { filters, setFilter } = useFiltrosStore();

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Users className="h-4 w-4" />
        Capacidad: {filters.capacidad} personas
      </label>
      <Slider
        value={[filters.capacidad]}
        onValueChange={([value]) => setFilter("capacidad", value)}
        max={500}
        min={20}
        step={20}
        className="w-full"
      />
    </div>
  );
};