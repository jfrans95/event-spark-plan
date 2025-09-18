import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, ImageIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getSpaceTypeLabel, getEventTypeLabel, getPlanLabel, getCapacityLabel } from "@/constants/productTags";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  plan: 'basico' | 'pro' | 'premium';
  space_types: string[];
  event_types: string[];
  capacity_min: number;
  capacity_max: number;
  images: string[];
  created_at: string;
}

const Inventario = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: providerProfile } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!providerProfile) return;

      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .eq('provider_id', providerProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos.",
          variant: "destructive"
        });
        return;
      }

      setProducts(productsData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw error;
      }

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente."
      });

      fetchProducts(); // Refresh list
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive"
      });
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    const { data } = supabase.storage.from('product-images').getPublicUrl(imagePath);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mi Inventario</h2>
        <Button onClick={() => navigate('/dashboard/proveedor/agregar-producto')}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No tienes productos en tu inventario aún.
            </p>
            <Button onClick={() => navigate('/dashboard/proveedor/agregar-producto')}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar tu primer producto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={getImageUrl(product.images[0]) || ''}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2" variant="secondary">
                  {getPlanLabel(product.plan)}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">
                    ${product.price.toLocaleString('es-CO')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getCapacityLabel(product.capacity_min, product.capacity_max)}
                  </span>
                </div>
                
                {/* Space Types */}
                {product.space_types && product.space_types.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Espacios:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.space_types.slice(0, 2).map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {getSpaceTypeLabel(type)}
                        </Badge>
                      ))}
                      {product.space_types.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.space_types.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Event Types */}
                {product.event_types && product.event_types.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Eventos:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.event_types.slice(0, 2).map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {getEventTypeLabel(type)}
                        </Badge>
                      ))}
                      {product.event_types.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.event_types.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inventario;