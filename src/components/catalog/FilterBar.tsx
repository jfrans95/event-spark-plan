import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  return (
    <Card>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label htmlFor="space">Tipo de espacio</Label>
          <Input id="space" placeholder="salon_eventos, playas..." value={params.get("space") || ""} onChange={(e) => onChange("space", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="event">Tipo de evento</Label>
          <Input id="event" placeholder="Bodas, Conferencias..." value={params.get("event") || ""} onChange={(e) => onChange("event", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Plan</Label>
          <Select value={params.get("plan") || ""} onValueChange={(v) => onChange("plan", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basico">Básico</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="guests">Nº personas</Label>
          <Input id="guests" type="number" min={20} max={500} step={10} value={params.get("guests") || "50"} onChange={(e) => onChange("guests", e.target.value)} />
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
