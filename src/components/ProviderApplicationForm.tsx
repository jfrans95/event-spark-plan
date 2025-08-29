import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProviderApplicationFormProps {
  userId: string;
  onSuccess?: () => void;
}

const productCategories = [
  "Montaje técnico",
  "Catering", 
  "Coctelería",
  "Artistas",
  "Decoración y ambientación",
  "Mobiliarios",
  "Registros audiovisuales"
];

const ProviderApplicationForm = ({ userId, onSuccess }: ProviderApplicationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    contactName: '',
    contactLastName: '',
    companyName: '',
    nit: '',
    contactPhone: '',
    contactEmail: '',
    socialNetworks: '',
    productCategory: '',
    yearsExperience: '',
    experienceDescription: '',
    specialization: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      let evidenceUrls: string[] = [];
      let logoUrl: string | null = null;

      // Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const logoFileName = `${userId}/logo-${Date.now()}.${fileExt}`;
        
        const { error: logoUploadError } = await supabase.storage
          .from('provider-evidence')
          .upload(logoFileName, logoFile);
        
        if (logoUploadError) {
          throw logoUploadError;
        }
        
        logoUrl = logoFileName;
      }

      // Upload evidence photos if any
      if (files && files.length > 0) {
        const uploadPromises = Array.from(files).map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('provider-evidence')
            .upload(fileName, file);
          
          if (uploadError) {
            throw uploadError;
          }
          
          return fileName;
        });

        evidenceUrls = await Promise.all(uploadPromises);
      }
      
      const applicationData = {
        user_id: userId,
        contact_name: formData.get('contactName') as string,
        contact_last_name: formData.get('contactLastName') as string,
        contact_email: formData.get('contactEmail') as string,
        social_networks: formData.get('socialNetworks') as string,
        company_name: formData.get('companyName') as string,
        nit: formData.get('nit') as string,
        contact_phone: formData.get('contactPhone') as string,
        product_category: formData.get('productCategory') as string,
        years_experience: parseInt(formData.get('yearsExperience') as string),
        experience_description: formData.get('experienceDescription') as string,
        specialization: formData.get('specialization') as string,
        evidence_photos: evidenceUrls.length > 0 ? evidenceUrls : null,
        logo_url: logoUrl,
        status: 'pending'
      };

      const { error } = await supabase
        .from('provider_applications')
        .insert([applicationData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Solicitud enviada correctamente",
        description: "Tu solicitud ha sido enviada al administrador. Te notificaremos cuando sea revisada.",
      });

      onSuccess?.();
      
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
          <Building className="w-7 h-7 text-white" />
        </div>
        <CardTitle>Solicitud de Alianza - Proveedor</CardTitle>
        <CardDescription>
          Completa la información para solicitar ser proveedor. Un administrador revisará tu solicitud.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Nombre del contacto *</Label>
              <Input
                id="contactName"
                name="contactName"
                required
                placeholder="Ej. María"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactLastName">Apellido del contacto *</Label>
              <Input
                id="contactLastName"
                name="contactLastName"
                required
                placeholder="Ej. García"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nombre de la empresa *</Label>
              <Input
                id="companyName"
                name="companyName"
                required
                placeholder="Ej. Eventos Creativos SAS"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nit">NIT de registro *</Label>
              <Input
                id="nit"
                name="nit"
                required
                placeholder="Ej. 900123456-7"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Teléfono de contacto *</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                required
                placeholder="Ej. +57 300 123 4567"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Correo electrónico *</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                required
                placeholder="Ej. contacto@empresa.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="socialNetworks">Redes sociales</Label>
              <Input
                id="socialNetworks"
                name="socialNetworks"
                placeholder="Ej. @empresa, facebook.com/empresa"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Años de experiencia *</Label>
              <Input
                id="yearsExperience"
                name="yearsExperience"
                type="number"
                min="0"
                max="50"
                required
                placeholder="Ej. 5"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productCategory">Categoría de producto *</Label>
            <Select name="productCategory" required disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceDescription">Descripción de experiencia *</Label>
            <Textarea
              id="experienceDescription"
              name="experienceDescription"
              required
              placeholder="Describe tu experiencia en el sector de eventos..."
              className="min-h-[100px]"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Especialización *</Label>
            <Textarea
              id="specialization"
              name="specialization"
              required
              placeholder="Describe tu especialización específica..."
              className="min-h-[80px]"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo de la empresa (opcional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <Building className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm text-muted-foreground mb-2">
                Sube el logo de tu empresa
              </div>
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                disabled={loading}
              />
              <Label 
                htmlFor="logo" 
                className="inline-block px-4 py-2 bg-secondary text-secondary-foreground rounded-md cursor-pointer hover:bg-secondary/90"
              >
                Seleccionar logo
              </Label>
              {logoFile && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {logoFile.name}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidencePhotos">Fotos de evidencia</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm text-muted-foreground mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </div>
              <Input
                id="evidencePhotos"
                name="evidencePhotos"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setFiles(e.target.files)}
                disabled={loading}
              />
              <Label 
                htmlFor="evidencePhotos" 
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
              >
                Seleccionar archivos
              </Label>
              {files && files.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {files.length} archivo(s) seleccionado(s)
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando solicitud...
              </>
            ) : (
              "Enviar solicitud"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProviderApplicationForm;