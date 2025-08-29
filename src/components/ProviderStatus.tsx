import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CheckCircle, XCircle, Building, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ProviderApplicationForm from "./ProviderApplicationForm";

interface ProviderStatusProps {
  userId: string;
  onApplicationSubmitted: () => void;
}

type ApplicationStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface Application {
  id: string;
  status: string;
  created_at: string;
  admin_observations?: string;
  company_name: string;
}

const ProviderStatus = ({ userId, onApplicationSubmitted }: ProviderStatusProps) => {
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('none');
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    checkApplicationStatus();
  }, [userId]);

  const checkApplicationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_applications')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No application found
          setApplicationStatus('none');
        } else {
          console.error('Error checking application status:', error);
        }
      } else if (data) {
        setApplication(data);
        setApplicationStatus(data.status as ApplicationStatus);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSuccess = () => {
    setApplicationStatus('pending');
    onApplicationSubmitted();
    checkApplicationStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p>Verificando estado de aplicación...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show application form if no application exists
  if (applicationStatus === 'none') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <ProviderApplicationForm 
          userId={userId}
          onSuccess={handleApplicationSuccess}
        />
      </div>
    );
  }

  // Show status based on application state
  const getStatusIcon = () => {
    switch (applicationStatus) {
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />;
      case 'approved':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />;
      case 'rejected':
        return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
      default:
        return <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />;
    }
  };

  const getStatusMessage = () => {
    switch (applicationStatus) {
      case 'pending':
        return {
          title: "Solicitud en revisión",
          description: `Tu solicitud para ${application?.company_name} está siendo revisada por nuestro equipo. Te notificaremos por email cuando tengamos una respuesta.`,
          color: "text-yellow-600"
        };
      case 'approved':
        return {
          title: "¡Solicitud aprobada!",
          description: `Felicitaciones, tu solicitud para ${application?.company_name} ha sido aprobada. Ahora puedes acceder a tu dashboard de proveedor.`,
          color: "text-green-600"
        };
      case 'rejected':
        return {
          title: "Solicitud rechazada",
          description: `Lamentablemente, tu solicitud para ${application?.company_name} no pudo ser aprobada en este momento.`,
          color: "text-red-600"
        };
      default:
        return {
          title: "Estado desconocido",
          description: "No se pudo determinar el estado de tu solicitud.",
          color: "text-muted-foreground"
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building className="w-7 h-7 text-white" />
          </div>
          <CardTitle>Estado de Aplicación - Proveedor</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {getStatusIcon()}
          
          <div className="space-y-2">
            <h3 className={`text-xl font-semibold ${statusInfo.color}`}>
              {statusInfo.title}
            </h3>
            <p className="text-muted-foreground">
              {statusInfo.description}
            </p>
          </div>

          {application && (
            <div className="bg-muted/50 p-4 rounded-lg text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Empresa:</span>
                  <p className="text-muted-foreground">{application.company_name}</p>
                </div>
                <div>
                  <span className="font-medium">Fecha de solicitud:</span>
                  <p className="text-muted-foreground">
                    {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {application.admin_observations && (
                <div className="mt-4 pt-4 border-t">
                  <span className="font-medium">Observaciones del administrador:</span>
                  <p className="text-muted-foreground mt-1">{application.admin_observations}</p>
                </div>
              )}
            </div>
          )}

          {applicationStatus === 'approved' && (
            <Button 
              onClick={() => window.location.href = '/dashboard/proveedor'}
              className="w-full"
              size="lg"
            >
              Ir a Dashboard de Proveedor
            </Button>
          )}

          {applicationStatus === 'rejected' && (
            <div className="space-y-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setApplicationStatus('none');
                  setApplication(null);
                }}
                className="w-full"
              >
                Enviar nueva solicitud
              </Button>
              <Button 
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Volver al inicio
              </Button>
            </div>
          )}

          {applicationStatus === 'pending' && (
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Volver al inicio
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderStatus;