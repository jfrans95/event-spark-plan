import { usePackage } from "@/context/PackageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Props {
  onQuote: () => void;
}

const PackageSidebar = ({ onQuote }: Props) => {
  const { groupedByCategory, removeItem, updateQty, total, items } = usePackage();

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Tu Paquete</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedByCategory).every(([, arr]) => arr.length === 0) ? (
          <p className="text-sm text-muted-foreground">Aún no has agregado ítems.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByCategory).map(([cat, items]) => (
              items.length > 0 && (
                <div key={cat}>
                  <h4 className="text-sm font-medium mb-2">{cat}</h4>
                  <div className="space-y-2">
                    {items.map((i) => (
                      <div key={i.product.id} className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm truncate">{i.product.name}</p>
                          <p className="text-xs text-muted-foreground">${(i.product.price * i.quantity).toLocaleString("es-CO")} COP</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            aria-label={`Cantidad de ${i.product.name}`}
                            type="number"
                            min={1}
                            value={i.quantity}
                            onChange={(e) => updateQty(i.product.id, parseInt(e.target.value || "1", 10))}
                            className="w-16 rounded-md border bg-background px-2 py-1 text-sm"
                          />
                          <Button variant="ghost" size="sm" onClick={() => removeItem(i.product.id)}>Quitar</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                </div>
              )
            ))}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total estimado</span>
              <strong>${total.toLocaleString("es-CO")} COP</strong>
            </div>
          <Button 
            className="w-full" 
            onClick={onQuote}
            disabled={items.length === 0}
          >
            Hacer cotización
          </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PackageSidebar;
