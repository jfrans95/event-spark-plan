import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Clock, Heart, Home } from "lucide-react";

const ProviderApplicationPending = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">EventCraft</h1>
            <p className="text-sm text-muted-foreground">Tu solicitud está en proceso</p>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">Solicitud en Proceso de Aprobación</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Tu solicitud para convertirte en proveedor ha sido enviada exitosamente y está siendo revisada por nuestro equipo administrativo.
            </p>
            <p className="text-sm text-muted-foreground">
              Te notificaremos por correo electrónico una vez que tu solicitud sea aprobada.
            </p>
            <div className="pt-4">
              <Button onClick={() => navigate('/')} className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Ir a Página Principal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderApplicationPending;