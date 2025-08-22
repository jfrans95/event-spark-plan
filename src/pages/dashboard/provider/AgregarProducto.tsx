import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const AgregarProducto = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Producto agregado",
      description: "El producto ha sido agregado a tu inventario.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Agregar Nuevo Producto</h2>
        <p className="text-muted-foreground">Completa la información del producto</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input id="name" placeholder="Ej: Mesa redonda premium" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="images">Fotos (hasta 3)</Label>
              <Input id="images" type="file" multiple accept="image/*" />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="space">Tipo de Espacio</Label>
                <Input id="space" placeholder="Interior/Exterior" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Cantidad de Personas</Label>
                <Input id="capacity" placeholder="Ej: 8 personas" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event">Tipo de Evento</Label>
                <Input id="event" placeholder="Corporativo/Social" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Input id="plan" placeholder="Básico/Premium/Completo" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" placeholder="Describe tu producto o servicio..." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Precio (COP)</Label>
              <Input id="price" type="number" placeholder="50000" required />
            </div>
            
            <Button type="submit" className="w-full">
              Agregar Producto
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgregarProducto;