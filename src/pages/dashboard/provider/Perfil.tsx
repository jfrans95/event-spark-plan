import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Perfil = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Proveedor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" defaultValue="Eventos Premium" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input id="category" defaultValue="Catering" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" defaultValue="301-555-0123" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" defaultValue="info@eventospremium.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción de experiencia</Label>
            <Textarea id="description" defaultValue="Más de 10 años de experiencia en catering para eventos corporativos..." />
          </div>
          <div className="flex gap-2">
            <Button>Editar Información</Button>
            <Button variant="outline">Cambiar Contraseña</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Perfil;