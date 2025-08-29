import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SPACE_TYPES, EVENT_TYPES, PLAN_TYPES, getAllSpaceTypes, getAllEventTypes } from "@/constants/productTags";

const FilterBar = () => {
  const [params, setParams] = useSearchParams();

  // Ensure default params exist
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (!next.get("guests")) next.set("guests", "50");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  const onMultipleChange = (key: string, value: string, checked: boolean) => {
    const next = new URLSearchParams(params);
    const current = next.get(key)?.split(',').filter(Boolean) || [];
    
    if (checked && !current.includes(value)) {
      current.push(value);
    } else if (!checked) {
      const index = current.indexOf(value);
      if (index > -1) current.splice(index, 1);
    }
    
    if (current.length > 0) {
      next.set(key, current.join(','));
    } else {
      next.delete(key);
    }
    setParams(next);
  };

  const currentSpaceTypes = params.get("space")?.split(',') || [];
  const currentEventTypes = params.get("event")?.split(',') || [];

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Guest Count */}
        <div className="space-y-1">
          <Label htmlFor="guests">Nº personas</Label>
          <Input 
            id="guests" 
            type="number" 
            min={20} 
            max={500} 
            step={10} 
            value={params.get("guests") || "50"} 
            onChange={(e) => onChange("guests", e.target.value)} 
          />
        </div>

        {/* Plan */}
        <div className="space-y-1">
          <Label>Plan</Label>
          <Select value={params.get("plan") || ""} onValueChange={(v) => onChange("plan", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona" />
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

        {/* Space Types */}
        <div className="space-y-2">
          <Label>Tipo de espacio</Label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {getAllSpaceTypes().map((space) => (
              <div key={space.value} className="flex items-center space-x-2">
                <Checkbox
                  id={space.value}
                  checked={currentSpaceTypes.includes(space.value)}
                  onCheckedChange={(checked) => 
                    onMultipleChange("space", space.value, checked as boolean)
                  }
                />
                <Label htmlFor={space.value} className="text-sm">
                  {space.icon} {space.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Event Types */}
        <div className="space-y-2">
          <Label>Tipo de evento</Label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {getAllEventTypes().map((event) => (
              <div key={event.value} className="flex items-center space-x-2">
                <Checkbox
                  id={event.value}
                  checked={currentEventTypes.includes(event.value)}
                  onCheckedChange={(checked) => 
                    onMultipleChange("event", event.value, checked as boolean)
                  }
                />
                <Label htmlFor={event.value} className="text-sm">
                  {event.icon} {event.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
