import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useFiltrosStore } from "@/stores/filtrosStore";

const ESPACIOS = [
  { id: "salon_eventos", name: "Salones", icon: "🏛️" },
  { id: "playas", name: "Playas", icon: "🏖️" },
  { id: "jardines", name: "Jardines", icon: "🌺" },
  { id: "hoteles", name: "Hoteles", icon: "🏨" },
  { id: "aire_libre", name: "Aire Libre", icon: "🌳" }
];

export const TipoEspacioFilter = () => {
  const { filters, setFilter } = useFiltrosStore();

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <MapPin className="h-4 w-4" />
        Tipo de Espacio
      </label>
      <div className="grid grid-cols-2 gap-2">
        {ESPACIOS.map((espacio) => (
          <Button
            key={espacio.id}
            variant={filters.tipoEspacio === espacio.id ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("tipoEspacio", espacio.id)}
            className="justify-start text-xs h-auto py-2"
          >
            <span className="mr-1">{espacio.icon}</span>
            {espacio.name}
          </Button>
        ))}
      </div>
    </div>
  );
};