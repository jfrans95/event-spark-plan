import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { useFiltrosStore } from "@/stores/filtrosStore";

const EVENTOS = ["Bodas", "Corporativo", "Quinceañeras", "Cumpleaños"];

export const TipoEventoFilter = () => {
  const { filters, setFilter } = useFiltrosStore();

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="h-4 w-4" />
        Tipo de Evento
      </label>
      <div className="flex flex-wrap gap-2">
        {EVENTOS.map((evento) => (
          <Badge
            key={evento}
            variant={filters.tipoEvento === evento ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("tipoEvento", evento)}
          >
            {evento}
          </Badge>
        ))}
      </div>
    </div>
  );
};