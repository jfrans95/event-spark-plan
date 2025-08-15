import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useFiltrosStore } from "@/stores/filtrosStore";

// Rangos: 20-100 (paso 20), 100-300 (paso 50), 300-500 (paso 100)
const getCapacityOptions = () => {
  const options = [];
  
  // 20-100 paso 20
  for (let i = 20; i <= 100; i += 20) {
    options.push(i);
  }
  
  // 100-300 paso 50
  for (let i = 150; i <= 300; i += 50) {
    options.push(i);
  }
  
  // 300-500 paso 100
  for (let i = 400; i <= 500; i += 100) {
    options.push(i);
  }
  
  return options;
};

const CAPACITY_OPTIONS = getCapacityOptions();

const getDisplayValue = (value: number) => {
  if (value >= 500) return "500+";
  return value.toString();
};

const getNearestOption = (value: number) => {
  return CAPACITY_OPTIONS.reduce((prev, curr) => 
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
};

export const CapacidadFilter = () => {
  const { filters, setFilter } = useFiltrosStore();

  const handleSliderChange = (values: number[]) => {
    const nearestValue = getNearestOption(values[0]);
    setFilter("capacidad", nearestValue);
  };

  const handleQuickSelect = (capacity: number) => {
    setFilter("capacidad", capacity);
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Users className="h-4 w-4" />
        Capacidad: {getDisplayValue(filters.capacidad)} personas
      </label>
      
      <Slider
        value={[filters.capacidad]}
        onValueChange={handleSliderChange}
        max={500}
        min={20}
        step={20}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>20</span>
        <span>500+</span>
      </div>

      {/* Quick select buttons */}
      <div className="flex flex-wrap gap-2">
        {[50, 100, 200, 300, 500].map((capacity) => (
          <Badge
            key={capacity}
            variant={filters.capacidad === capacity ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleQuickSelect(capacity)}
          >
            {getDisplayValue(capacity)}
          </Badge>
        ))}
      </div>
    </div>
  );
};