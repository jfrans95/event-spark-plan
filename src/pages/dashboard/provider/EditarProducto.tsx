import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SPACE_TYPES, EVENT_TYPES, PLAN_TYPES, getCapacityFromValue } from "@/constants/productTags";

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

const EditarProducto = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [selectedSpaceTypes, setSelectedSpaceTypes] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [capacityRange, setCapacityRange] = useState([20]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ProductFormData>();

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoadingProduct(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: providerProfile } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!providerProfile) return;

      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('provider_id', providerProfile.id)
        .single();

      if (error || !product) {
        toast({
          title: "Error",
          description: "Producto no encontrado.",
          variant: "destructive"
        });
        navigate('/dashboard/proveedor/inventario');
        return;
      }

      // Populate form fields
      setValue('name', product.name);
      setValue('description', product.description);
      setValue('price', product.price);
      setValue('plan', product.plan);
      
      setSelectedSpaceTypes(product.space_types as any || []);
      setSelectedEventTypes(product.event_types as any || []);
      setExistingImages(product.images || []);

      // Calculate capacity slider value
      const avgCapacity = (product.capacity_min + product.capacity_max) / 2;
      setCapacityRange([avgCapacity]);

    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el producto.",
        variant: "destructive"
      });
    } finally {
      setLoadingProduct(false);
    }
  };

  const getCapacityRangeFromValue = (value: number): [number, number] => {
    return getCapacityFromValue(value);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalImages = selectedImages.length + existingImages.length;
    
    if (files.length + totalImages > 3) {
      toast({
        title: "Máximo 3 imágenes",
        description: "Solo puedes tener hasta 3 imágenes por producto.",
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

  const removeNewImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
  };

  const removeExistingImage = (index: number) => {
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExistingImages);
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

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    const { data } = supabase.storage.from('product-images').getPublicUrl(imagePath);
    return data.publicUrl;
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    
    try {
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

      // Upload new images to storage
      const newImageUrls: string[] = [];
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
          newImageUrls.push(uploadData.path);
        }
      }

      // Combine existing images with new ones
      const allImageUrls = [...existingImages, ...newImageUrls];

      // Get capacity range
      const [capacityMin, capacityMax] = getCapacityRangeFromValue(capacityRange[0]);

      // Update product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          plan: data.plan,
          space_types: selectedSpaceTypes as any,
          event_types: selectedEventTypes as any,
          capacity_min: capacityMin,
          capacity_max: capacityMax,
          images: allImageUrls
        })
        .eq('id', productId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado exitosamente.",
      });

      navigate('/dashboard/proveedor/inventario');
      
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al actualizar el producto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando producto...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Editar Producto</h2>
          <p className="text-muted-foreground">Actualiza la información del producto</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/proveedor/inventario')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inventario
        </Button>
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
              <Label>Fotos del Producto (máximo 3)</Label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Imágenes actuales:</p>
                  <div className="grid grid-cols-3 gap-4">
                    {existingImages.map((imagePath, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={getImageUrl(imagePath) || ''}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 w-6 h-6 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground mb-2">
                    Arrastra archivos aquí o haz clic para agregar más imágenes
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="images"
                    onChange={handleImageUpload}
                    disabled={selectedImages.length + existingImages.length >= 3}
                  />
                  <Label 
                    htmlFor="images" 
                    className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
                  >
                    Agregar imágenes
                  </Label>
                </div>
                
                {/* Preview de nuevas imágenes */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={url} 
                          alt={`Nueva imagen ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
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
              {Object.entries(SPACE_TYPES).map(([category, spaces]) => (
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
                          {space.icon} {space.label}
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
                    {getCapacityRangeFromValue(capacityRange[0])[0]} - {getCapacityRangeFromValue(capacityRange[0])[1]} personas
                  </span>
                  <span>500</span>
                </div>
              </div>
            </div>

            {/* Tipos de eventos */}
            <div className="space-y-4">
              <Label>Tipos de Eventos *</Label>
              {Object.entries(EVENT_TYPES).map(([category, events]) => (
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
                          {event.icon} {event.label}
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
                  {PLAN_TYPES.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      {plan.label}
                    </SelectItem>
                  ))}
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
                  Actualizando producto...
                </>
              ) : (
                "Actualizar Producto"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarProducto;
