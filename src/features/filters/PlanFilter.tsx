import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useFiltrosStore } from "@/stores/filtrosStore";

const PLANES = [
  { id: "basico", name: "Básico" },
  { id: "pro", name: "Pro" },
  { id: "premium", name: "Premium" }
];

export const PlanFilter = () => {
  const { filters, setFilter } = useFiltrosStore();

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Star className="h-4 w-4" />
        Plan
      </label>
      <div className="grid grid-cols-3 gap-2">
        {PLANES.map((plan) => (
          <Button
            key={plan.id}
            variant={filters.plan === plan.id ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("plan", plan.id)}
          >
            {plan.name}
          </Button>
        ))}
      </div>
    </div>
  );
};