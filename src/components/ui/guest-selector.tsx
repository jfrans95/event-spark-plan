import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuestSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  variant?: "button" | "inline";
}

export const GuestSelector = ({ 
  value, 
  onChange, 
  placeholder = "Cantidad de invitados",
  className,
  variant = "button"
}: GuestSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStep = (currentValue: number) => {
    if (currentValue <= 100) return 20;
    if (currentValue <= 300) return 50;
    return 100;
  };

  const getNextValue = (currentValue: number, direction: 'up' | 'down') => {
    const step = getStep(currentValue);
    
    if (direction === 'up') {
      const next = currentValue + step;
      return Math.min(500, next);
    } else {
      const next = currentValue - step;
      return Math.max(20, next);
    }
  };

  const increment = () => {
    const currentValue = value || 20;
    onChange(getNextValue(currentValue, 'up'));
  };

  const decrement = () => {
    const currentValue = value || 20;
    onChange(getNextValue(currentValue, 'down'));
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    return `${value} invitados`;
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={decrement}
          disabled={!value || value <= 20}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[120px] text-center text-sm font-medium">
          {getDisplayValue()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={increment}
          disabled={!value || value >= 500}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Button 
        variant="outline" 
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>👥 {getDisplayValue()}</span>
        {isOpen ? 
          <ChevronUp className="w-4 h-4" /> : 
          <ChevronDown className="w-4 h-4" />
        }
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-lg shadow-lg p-4">
          <div className="space-y-4">
            <div className="text-center text-sm font-medium">
              {value ? `${value} invitados` : placeholder}
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={decrement}
                disabled={!value || value <= 20}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="min-w-[100px] text-center">
                <div className="text-lg font-semibold">{value || 20}</div>
                <div className="text-xs text-muted-foreground">
                  Saltos de {getStep(value || 20)}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={increment}
                disabled={!value || value >= 500}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: 20</span>
              <span>Max: 500</span>
            </div>
            
            <Button 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Confirmar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};