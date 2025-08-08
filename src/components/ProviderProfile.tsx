import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Building2, Package, Plus, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProviderProfile {
  id: string;
  user_id: string;
  application_id: string;
  logo_url?: string;
  created_at: string;
  provider_applications: {
    company_name: string;
    nit: string;
    contact_phone: string;
    product_category: string;
    years_experience: number;
    experience_description: string;
    specialization: string;
    status: string;
  };
}

const ProviderProfile = () => {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProviderProfile();
  }, []);

  const fetchProviderProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('provider_profiles')
        .select(`
          *,
          provider_applications (
            company_name,
            nit,
            contact_phone,
            product_category,
            years_experience,
            experience_description,
            specialization,
            status
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - user might not be approved yet
          setProfile(null);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching provider profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      // TODO: Implement file upload when storage is configured
      toast({
        title: "Funcionalidad pendiente",
        description: "La subida de archivos se implementará próximamente",
        variant: "default",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Perfil de Proveedor</CardTitle>
            <CardDescription>
              Tu solicitud de alianza está siendo revisada o aún no has sido aprobado como proveedor.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Una vez que el administrador apruebe tu solicitud, podrás acceder a todas las funcionalidades del perfil de proveedor.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const application = profile.provider_applications;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Perfil de Proveedor</h1>
        <p className="text-muted-foreground">Gestiona tu información y productos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Información de la Empresa
              </CardTitle>
              <Badge variant="outline" className="w-fit text-green-600">
                Alianza Aprobada
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Empresa</Label>
                  <p>{application.company_name}</p>
                </div>
                <div>
                  <Label className="font-medium">NIT</Label>
                  <p>{application.nit}</p>
                </div>
                <div>
                  <Label className="font-medium">Teléfono</Label>
                  <p>{application.contact_phone}</p>
                </div>
                <div>
                  <Label className="font-medium">Categoría</Label>
                  <p>{application.product_category}</p>
                </div>
                <div>
                  <Label className="font-medium">Experiencia</Label>
                  <p>{application.years_experience} años</p>
                </div>
              </div>
              
              <div>
                <Label className="font-medium">Descripción de experiencia</Label>
                <p className="text-sm text-muted-foreground mt-1">{application.experience_description}</p>
              </div>
              
              <div>
                <Label className="font-medium">Especialización</Label>
                <p className="text-sm text-muted-foreground mt-1">{application.specialization}</p>
              </div>
            </CardContent>
          </Card>

          {/* Products Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Productos y Servicios
                </CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aún no has agregado productos</p>
                <p className="text-sm">Comienza agregando tus primeros productos y servicios</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logo Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Logo de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {profile.logo_url ? (
                <div className="mb-4">
                  <img 
                    src={profile.logo_url} 
                    alt="Logo de la empresa"
                    className="w-32 h-32 mx-auto object-contain border rounded-lg"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <div className="w-32 h-32 mx-auto bg-muted border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    <Upload className="w-4 h-4" />
                    {profile.logo_url ? 'Cambiar Logo' : 'Subir Logo'}
                  </div>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">
                  Formatos: JPG, PNG. Máximo 2MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                Gestionar Productos
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;