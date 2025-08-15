import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useFiltrosStore } from "@/stores/filtrosStore";

const PLANES = [
  { 
    id: "basico", 
    name: "Básico", 
    description: "Lo esencial para tu evento",
    features: ["Cotización básica", "3 proveedores"],
    color: "bg-secondary"
  },
  { 
    id: "pro", 
    name: "Pro", 
    description: "Más opciones y personalización",
    features: ["Cotización detallada", "6 proveedores", "Asesoramiento"],
    color: "bg-primary"
  },
  { 
    id: "premium", 
    name: "Premium", 
    description: "Experiencia completa VIP",
    features: ["Cotización premium", "10+ proveedores", "Asesor dedicado", "Seguimiento 24/7"],
    color: "bg-accent"
  }
];

export const PlanFilter = () => {
  const { filters, setFilter } = useFiltrosStore();

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Star className="h-4 w-4" />
        Plan de Servicio
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PLANES.map((plan) => (
          <div
            key={plan.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              filters.plan === plan.id 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => setFilter("plan", plan.id)}
          >
            <div className="space-y-2">
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="text-xs text-muted-foreground">{plan.description}</p>
              <ul className="space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-xs flex items-center gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};