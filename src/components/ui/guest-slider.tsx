import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface GuestSliderProps {
  value: number | null;
  onChange: (value: number) => void;
  className?: string;
  showLabels?: boolean;
}

export const GuestSlider = ({ 
  value, 
  onChange, 
  className,
  showLabels = true 
}: GuestSliderProps) => {
  const currentValue = value || 20;

  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  const getStepInfo = (value: number) => {
    if (value <= 100) return "Saltos de 20";
    if (value <= 300) return "Saltos de 50"; 
    return "Saltos de 100";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Slider
          value={[currentValue]}
          onValueChange={handleSliderChange}
          max={500}
          min={20}
          step={20}
          className="w-full"
        />
        
        {/* Marcadores visuales */}
        <div className="relative mt-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="relative">
              20
              <div className="absolute -top-6 left-0 w-0.5 h-4 bg-muted-foreground/30"></div>
            </span>
            <span className="relative">
              100
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-muted-foreground/30"></div>
            </span>
            <span className="relative">
              300
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-muted-foreground/30"></div>
            </span>
            <span className="relative">
              500
              <div className="absolute -top-6 right-0 w-0.5 h-4 bg-muted-foreground/30"></div>
            </span>
          </div>
        </div>
      </div>

      {showLabels && (
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">{currentValue} invitados</span>
          <span className="text-muted-foreground text-xs">
            {getStepInfo(currentValue)}
          </span>
        </div>
      )}
    </div>
  );
};