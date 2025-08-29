import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Edit, Save, X } from "lucide-react";

interface ProviderApplication {
  id: string;
  company_name: string;
  contact_phone: string;
  contact_email: string;
  experience_description: string;
  product_category: string;
  specialization: string;
}

const Perfil = () => {
  const [application, setApplication] = useState<ProviderApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ProviderApplication>>({});

  useEffect(() => {
    fetchProviderProfile();
  }, []);

  const fetchProviderProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('provider_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del perfil",
          variant: "destructive",
        });
      } else {
        setApplication(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(application || {});
  };

  const handleSave = async () => {
    if (!application) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('provider_applications')
        .update({
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          experience_description: formData.experience_description,
        })
        .eq('id', application.id);

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar la información",
          variant: "destructive",
        });
      } else {
        setApplication({ ...application, ...formData });
        setEditing(false);
        toast({
          title: "Éxito",
          description: "Información actualizada correctamente",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProviderApplication, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No se encontró información del perfil</p>
      </div>
    );
  }

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
              <Input 
                id="company" 
                value={application.company_name} 
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input 
                id="category" 
                value={application.product_category} 
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input 
                id="phone" 
                value={editing ? formData.contact_phone || '' : application.contact_phone}
                disabled={!editing}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input 
                id="email" 
                value={editing ? formData.contact_email || '' : application.contact_email}
                disabled={!editing}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción de experiencia</Label>
            <Textarea 
              id="description" 
              value={editing ? formData.experience_description || '' : application.experience_description}
              disabled={!editing}
              onChange={(e) => handleInputChange('experience_description', e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar Información
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Perfil;