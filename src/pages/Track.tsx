import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TrackingData {
  quote_id: string;
  created_at: string;
  status: string;
}

const Track = () => {
  const { code } = useParams<{ code: string }>();
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Seguimiento de Cotización | EventCraft`;
    
    if (!code) {
      setError("Código de seguimiento no válido");
      setLoading(false);
      return;
    }

    const fetchTracking = async () => {
      try {
        const { data, error: rpcError } = await supabase
          .rpc('get_quote_tracking', { _code: code });

        if (rpcError) {
          console.error("RPC Error:", rpcError);
          setError("Error al consultar el seguimiento");
          return;
        }

        if (!data || data.length === 0) {
          setError("Código de seguimiento no encontrado");
          return;
        }

        setTracking(data[0]);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [code]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COTIZACION_ENVIADA':
        return 'default';
      case 'GANADA':
        return 'secondary'; // Using secondary instead of success  
      case 'PERDIDA':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COTIZACION_ENVIADA':
        return 'Cotización Enviada';
      case 'GANADA':
        return 'Cotización Ganada';
      case 'PERDIDA':
        return 'Cotización Perdida';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Consultando seguimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Seguimiento de Cotización
            </CardTitle>
            <CardDescription>
              Código: <code className="bg-muted px-2 py-1 rounded">{code}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : tracking ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estado actual:</span>
                  <Badge variant={getStatusColor(tracking.status)}>
                    {getStatusLabel(tracking.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Creada el {new Date(tracking.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Cronología</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-sm">Cotización creada y enviada por email</span>
                    </div>
                    {tracking.status === 'GANADA' && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Cotización aceptada</span>
                      </div>
                    )}
                    {tracking.status === 'PERDIDA' && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Cotización no aceptada</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    ¿Tienes alguna pregunta sobre tu cotización? Contacta a nuestro equipo de soporte.
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Track;