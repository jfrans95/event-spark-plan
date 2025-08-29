import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const spaceTypes = {
  "🌿 Espacios Abiertos / Aire libre": [
    { value: "parques_publicos", label: "Parques públicos" },
    { value: "jardines_botanicos", label: "Jardines botánicos" },
    { value: "miradores_naturales", label: "Miradores naturales" },
    { value: "playas", label: "Playas" },
    { value: "plazoletas", label: "Plazoletas" },
    { value: "calles_barrios", label: "Calles/Barrios" }
  ],
  "🏢 Espacios Cerrados": [
    { value: "salones_eventos", label: "Salones de eventos" },
    { value: "teatros", label: "Teatros" },
    { value: "auditorios", label: "Auditorios" },
    { value: "centros_convenciones", label: "Centros de convenciones" },
    { value: "discotecas", label: "Discotecas" },
    { value: "restaurantes_privados", label: "Restaurantes privados" },
    { value: "iglesias_templos", label: "Iglesias/Templos" },
    { value: "galerias_museos", label: "Galerías/Museos" }
  ],
  "🔀 Espacios No Convencionales": [
    { value: "bodegas", label: "Bodegas" },
    { value: "casas_patrimoniales", label: "Casas patrimoniales" },
    { value: "rooftops", label: "Rooftops" },
    { value: "locales_en_desuso", label: "Locales en desuso" },
    { value: "estudios", label: "Estudios" },
    { value: "fincas_privadas", label: "Fincas privadas" }
  ],
  "🏠 Casas Familiares": [
    { value: "casas_familiares", label: "Casas familiares" },
    { value: "unidades_residenciales", label: "Unidades residenciales" },
    { value: "casas_patio_jardin", label: "Casas con patio/jardín" },
    { value: "viviendas_adecuadas", label: "Viviendas adecuadas" }
  ],
  "🚚 Espacios Móviles / Temporales": [
    { value: "carpas", label: "Carpas" },
    { value: "contenedores", label: "Contenedores" }
  ]
};

const eventTypes = {
  "📊 Eventos Corporativos": [
    { value: "celebraciones_internas", label: "Celebraciones internas" },
    { value: "activaciones_marca", label: "Activaciones de marca" },
    { value: "team_building", label: "Team building" },
    { value: "cierre_ano", label: "Cierre de año" }
  ],
  "🥂 Eventos Sociales": [
    { value: "cumpleanos", label: "Cumpleaños" },
    { value: "dia_madre_padre", label: "Día madre/padre" },
    { value: "fechas_religiosas", label: "Fechas religiosas" },
    { value: "graduaciones", label: "Graduaciones" },
    { value: "reuniones_especiales", label: "Reuniones especiales" }
  ],
  "🎭 Eventos Culturales (Institucionales)": [
    { value: "eventos_pequenos", label: "Eventos pequeños" },
    { value: "eventos_medios", label: "Eventos medios" },
    { value: "eventos_institucionales", label: "Eventos institucionales" },
    { value: "encuentros_publicos", label: "Encuentros públicos" },
    { value: "lanzamientos_aniversarios", label: "Lanzamientos/Aniversarios" }
  ]
};

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  plan: 'basico' | 'pro' | 'premium';
  space_types: string[];
  event_types: string[];
  capacity_min: number;
  capacity_max: number;
  images: FileList | null;
}

const AgregarProducto = () => {
  const [loading, setLoading] = useState(false);
  const [selectedSpaceTypes, setSelectedSpaceTypes] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [capacityRange, setCapacityRange] = useState([20]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ProductFormData>();

  const getCapacityFromValue = (value: number): [number, number] => {
    if (value <= 100) {
      const min = Math.max(20, value - (value % 20));
      const max = min + 20;
      return [min, max];
    } else if (value <= 300) {
      const min = Math.max(100, value - (value % 50));
      const max = min + 50;
      return [min, max];
    } else {
      const min = Math.max(300, value - (value % 100));
      const max = min + 100;
      return [min, max];
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedImages.length > 3) {
      toast({
        title: "Máximo 3 imágenes",
        description: "Solo puedes subir hasta 3 imágenes por producto.",
        variant: "destructive"
      });
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleSpaceTypeChange = (spaceType: string, checked: boolean) => {
    if (checked) {
      setSelectedSpaceTypes(prev => [...prev, spaceType]);
    } else {
      setSelectedSpaceTypes(prev => prev.filter(type => type !== spaceType));
    }
  };

  const handleEventTypeChange = (eventType: string, checked: boolean) => {
    if (checked) {
      setSelectedEventTypes(prev => [...prev, eventType]);
    } else {
      setSelectedEventTypes(prev => prev.filter(type => type !== eventType));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    
    try {
      // Get current user's provider profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const { data: providerProfile } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!providerProfile) {
        throw new Error("Perfil de proveedor no encontrado");
      }

      // Upload images to storage
      const imageUrls: string[] = [];
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${providerProfile.id}/${Date.now()}-${i}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
        } else if (uploadData) {
          imageUrls.push(uploadData.path);
        }
      }

      // Get capacity range
      const [capacityMin, capacityMax] = getCapacityFromValue(capacityRange[0]);

      // Insert product
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          provider_id: providerProfile.id,
          name: data.name,
          description: data.description,
          price: data.price,
          plan: data.plan,
          space_types: selectedSpaceTypes,
          event_types: selectedEventTypes,
          capacity_min: capacityMin,
          capacity_max: capacityMax,
          images: imageUrls
        } as any); // Temporary any cast until types are regenerated

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Producto agregado",
        description: "El producto ha sido agregado exitosamente a tu inventario.",
      });

      navigate('/dashboard/proveedor/inventario');
      
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al agregar el producto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre del producto */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input 
                id="name" 
                {...register("name", { required: "El nombre es requerido" })}
                placeholder="Ej: Mesa redonda premium" 
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            
            {/* Fotos del producto */}
            <div className="space-y-2">
              <Label>Fotos del Producto (máximo 3) *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground mb-2">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="images"
                    onChange={handleImageUpload}
                    disabled={selectedImages.length >= 3}
                  />
                  <Label 
                    htmlFor="images" 
                    className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
                  >
                    Seleccionar imágenes
                  </Label>
                </div>
                
                {/* Preview de imágenes */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={url} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 w-6 h-6 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tipos de espacios */}
            <div className="space-y-4">
              <Label>Tipos de Espacios *</Label>
              {Object.entries(spaceTypes).map(([category, spaces]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm">{category}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {spaces.map((space) => (
                      <div key={space.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={space.value}
                          checked={selectedSpaceTypes.includes(space.value)}
                          onCheckedChange={(checked) => 
                            handleSpaceTypeChange(space.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={space.value} className="text-sm">
                          {space.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Cantidad de personas */}
            <div className="space-y-4">
              <Label>Cantidad de Personas</Label>
              <div className="space-y-2">
                <Slider
                  value={capacityRange}
                  onValueChange={setCapacityRange}
                  max={500}
                  min={20}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>20</span>
                  <span className="font-medium">
                    {getCapacityFromValue(capacityRange[0])[0]} - {getCapacityFromValue(capacityRange[0])[1]} personas
                  </span>
                  <span>500</span>
                </div>
              </div>
            </div>

            {/* Tipos de eventos */}
            <div className="space-y-4">
              <Label>Tipos de Eventos *</Label>
              {Object.entries(eventTypes).map(([category, events]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm">{category}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {events.map((event) => (
                      <div key={event.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={event.value}
                          checked={selectedEventTypes.includes(event.value)}
                          onCheckedChange={(checked) => 
                            handleEventTypeChange(event.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={event.value} className="text-sm">
                          {event.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Plan */}
            <div className="space-y-2">
              <Label htmlFor="plan">Plan *</Label>
              <Select onValueChange={(value) => setValue("plan", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea 
                id="description" 
                {...register("description", { required: "La descripción es requerida" })}
                placeholder="Describe tu producto o servicio..."
                className="min-h-[100px]"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
            
            {/* Precio */}
            <div className="space-y-2">
              <Label htmlFor="price">Precio (COP) *</Label>
              <Input 
                id="price" 
                type="number" 
                {...register("price", { 
                  required: "El precio es requerido",
                  min: { value: 1, message: "El precio debe ser mayor a 0" }
                })}
                placeholder="50000" 
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Agregando producto...
                </>
              ) : (
                "Agregar Producto"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgregarProducto;