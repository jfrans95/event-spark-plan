import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { useFiltrosStore } from "@/stores/filtrosStore";

const TIPOS_EVENTO = [
  { 
    categoria: "Corporativo", 
    items: ["Conferencias", "Lanzamientos", "Team Building", "Seminarios"] 
  },
  { 
    categoria: "Social", 
    items: ["Bodas", "Quinceañeras", "Aniversarios", "Cumpleaños"] 
  },
  { 
    categoria: "Cultural", 
    items: ["Conciertos", "Exposiciones", "Festivales", "Ferias"] 
  }
];

export const TipoEventoFilter = () => {
  const { filters, setFilter } = useFiltrosStore();

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="h-4 w-4" />
        Tipo de Evento
      </label>
      
      <div className="space-y-4">
        {TIPOS_EVENTO.map((categoria) => (
          <div key={categoria.categoria} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {categoria.categoria}
            </h4>
            <div className="flex flex-wrap gap-2">
              {categoria.items.map((item) => (
                <Badge
                  key={item}
                  variant={filters.tipoEvento === item ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilter("tipoEvento", item)}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};