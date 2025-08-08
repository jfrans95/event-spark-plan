import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, Building2, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProviderApplication {
  id: string;
  user_id: string;
  company_name: string;
  nit: string;
  contact_phone: string;
  product_category: string;
  years_experience: number;
  experience_description: string;
  specialization: string;
  evidence_photos: string[];
  status: string;
  admin_observations?: string;
  created_at: string;
  profiles?: any;
}

const AdminDashboard = () => {
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ProviderApplication | null>(null);
  const [observations, setObservations] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_applications')
        .select(`
          *,
          profiles!provider_applications_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplication = async (applicationId: string, status: 'approved' | 'declined') => {
    setProcessing(true);
    try {
      const { error: updateError } = await supabase
        .from('provider_applications')
        .update({
          status,
          admin_observations: observations,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // If approved, create provider profile
      if (status === 'approved' && selectedApplication) {
        const { error: profileError } = await supabase
          .from('provider_profiles')
          .insert({
            user_id: selectedApplication.user_id,
            application_id: applicationId
          });

        if (profileError) throw profileError;
      }

      toast({
        title: status === 'approved' ? "Solicitud aprobada" : "Solicitud rechazada",
        description: `La solicitud ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`,
      });

      setSelectedApplication(null);
      setObservations("");
      await fetchApplications();
    } catch (error) {
      console.error('Error processing application:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-600"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Aprobada</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Rechazada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando solicitudes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard de Administrador</h1>
        <p className="text-muted-foreground">Gestiona las solicitudes de alianza de proveedores</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pendientes ({applications.filter(app => app.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Aprobadas ({applications.filter(app => app.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="declined">Rechazadas ({applications.filter(app => app.status === 'declined').length})</TabsTrigger>
        </TabsList>

        {['pending', 'approved', 'declined'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {applications.filter(app => app.status === status).map((application) => (
              <Card key={application.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {application.company_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {application.profiles?.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {application.contact_phone}
                        </span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">NIT:</span> {application.nit}
                    </div>
                    <div>
                      <span className="font-medium">Categoría:</span> {application.product_category}
                    </div>
                    <div>
                      <span className="font-medium">Experiencia:</span> {application.years_experience} años
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span> {new Date(application.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {status === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                      >
                        Ver detalles
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Application Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Revisión de Solicitud - {selectedApplication.company_name}</CardTitle>
              <CardDescription>
                Solicitud de {selectedApplication.profiles?.full_name} ({selectedApplication.profiles?.email})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Empresa</Label>
                    <p>{selectedApplication.company_name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">NIT</Label>
                    <p>{selectedApplication.nit}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Teléfono</Label>
                    <p>{selectedApplication.contact_phone}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Categoría</Label>
                    <p>{selectedApplication.product_category}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Años de experiencia</Label>
                    <p>{selectedApplication.years_experience} años</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Descripción de experiencia</Label>
                    <p className="text-sm text-muted-foreground">{selectedApplication.experience_description}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Especialización</Label>
                    <p className="text-sm text-muted-foreground">{selectedApplication.specialization}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Agrega observaciones sobre esta solicitud..."
                  className="mt-2"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedApplication(null);
                    setObservations("");
                  }}
                  disabled={processing}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApplication(selectedApplication.id, 'declined')}
                  disabled={processing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Declinar alianza
                </Button>
                <Button
                  onClick={() => handleApplication(selectedApplication.id, 'approved')}
                  disabled={processing}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aceptar alianza
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;