import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Eye, Check, X, Building, Phone, Mail, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Application {
  id: string;
  user_id: string;
  company_name: string;
  contact_name?: string;
  contact_last_name?: string;
  contact_phone: string;
  contact_email?: string;
  product_category: string;
  specialization: string;
  experience_description: string;
  years_experience: number;
  status: string;
  created_at: string;
  logo_url?: string;
}

const ProviderApplicationsList = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [processLoading, setProcessLoading] = useState<string | null>(null);
  const [observations, setObservations] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las solicitudes",
          variant: "destructive",
        });
      } else {
        setApplications(data || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    setProcessLoading(applicationId);
    try {
      const { error } = await supabase
        .from('provider_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          admin_observations: observations
        })
        .eq('id', applicationId);

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo aprobar la solicitud",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Solicitud aprobada",
          description: "La solicitud ha sido aprobada exitosamente",
        });
        fetchApplications();
        setSelectedApplication(null);
        setObservations("");
      }
    } catch (error) {
      console.error('Error approving application:', error);
    } finally {
      setProcessLoading(null);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    setProcessLoading(applicationId);
    try {
      const { error } = await supabase
        .from('provider_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          admin_observations: observations
        })
        .eq('id', applicationId);

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo rechazar la solicitud",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Solicitud rechazada",
          description: "La solicitud ha sido rechazada",
        });
        fetchApplications();
        setSelectedApplication(null);
        setObservations("");
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
    } finally {
      setProcessLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes de Alianza - Proveedores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No hay solicitudes de proveedores
            </div>
          ) : (
            applications.map((application) => (
              <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <p className="font-medium">{application.company_name}</p>
                    <Badge className={getStatusColor(application.status)}>
                      {getStatusText(application.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {application.product_category} • {application.specialization}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {application.contact_phone}
                    </span>
                    {application.contact_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {application.contact_email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{application.company_name}</DialogTitle>
                        <DialogDescription>
                          Solicitud de alianza como proveedor
                        </DialogDescription>
                      </DialogHeader>
                      {selectedApplication && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Empresa</Label>
                              <p className="font-medium">{selectedApplication.company_name}</p>
                            </div>
                            <div>
                              <Label>Categoría</Label>
                              <p>{selectedApplication.product_category}</p>
                            </div>
                            <div>
                              <Label>Especialización</Label>
                              <p>{selectedApplication.specialization}</p>
                            </div>
                            <div>
                              <Label>Años de experiencia</Label>
                              <p>{selectedApplication.years_experience}</p>
                            </div>
                            <div>
                              <Label>Teléfono</Label>
                              <p>{selectedApplication.contact_phone}</p>
                            </div>
                            <div>
                              <Label>Correo</Label>
                              <p>{selectedApplication.contact_email || 'No especificado'}</p>
                            </div>
                          </div>
                          <div>
                            <Label>Descripción de experiencia</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {selectedApplication.experience_description}
                            </p>
                          </div>
                          
                          {selectedApplication.status === 'pending' && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="observations">Observaciones (opcional)</Label>
                                <Textarea
                                  id="observations"
                                  value={observations}
                                  onChange={(e) => setObservations(e.target.value)}
                                  placeholder="Observaciones para el proveedor..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleApproveApplication(selectedApplication.id)}
                                  disabled={processLoading === selectedApplication.id}
                                  className="flex-1"
                                >
                                  {processLoading === selectedApplication.id ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4 mr-2" />
                                  )}
                                  Aprobar
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleRejectApplication(selectedApplication.id)}
                                  disabled={processLoading === selectedApplication.id}
                                  className="flex-1"
                                >
                                  {processLoading === selectedApplication.id ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <X className="w-4 h-4 mr-2" />
                                  )}
                                  Rechazar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderApplicationsList;