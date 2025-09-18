import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/context/PackageContext";
import { toast } from "@/hooks/use-toast";

interface ProductFilters {
  espacio?: string;
  aforo?: number;
  evento?: string;
  plan?: string;
  categoria?: string;
}

// Map database category enum to display category (CORRECTED to match actual DB)
const categoryMap: Record<string, string> = {
  'montaje_tecnico': 'Montaje Técnico',
  'decoracion_ambientacion': 'Decoración/Ambientación',
  'mobiliario': 'Mobiliario',
  'cocteleria': 'Coctelería',
  'catering': 'Catering',
  'arte_cultura': 'Arte/Cultura',
  'registros_audiovisuales': 'Audiovisuales'
};

// Reverse mapping from display names to database enums
const displayToDbMap: Record<string, string> = {
  'Montaje Técnico': 'montaje_tecnico',
  'montaje técnico': 'montaje_tecnico',
  'Decoración/Ambientación': 'decoracion_ambientacion',
  'decoración/ambientación': 'decoracion_ambientacion',
  'Mobiliario': 'mobiliario',
  'mobiliario': 'mobiliario',
  'Coctelería': 'cocteleria',
  'coctelería': 'cocteleria',
  'mixología/coctelería': 'cocteleria', // Legacy mapping
  'Catering': 'catering',
  'catering': 'catering',
  'Arte/Cultura': 'arte_cultura',
  'arte/cultura': 'arte_cultura',
  'Audiovisuales': 'registros_audiovisuales',
  'audiovisuales': 'registros_audiovisuales'
};

const mapDbProductToProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description || "",
  price: Number(dbProduct.price),
  category: categoryMap[dbProduct.categoria] || dbProduct.categoria,
  images: dbProduct.images || [],
  space_types: dbProduct.space_types || [],
  capacity_min: dbProduct.capacity_min || 0,
  capacity_max: dbProduct.capacity_max || 0,
  event_types: dbProduct.event_types || [],
  plan: dbProduct.plan || 'basico',
  activo: dbProduct.activo !== false,
  provider_name: dbProduct.provider_name || "Proveedor"
});

export const useProducts = (filters?: ProductFilters, mode: 'filtered' | 'all' = 'filtered') => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('=== PRODUCTS FETCH DEBUG ===');
        console.log('Mode:', mode);
        console.log('Filters received:', filters);
        
        // Convert display category to database enum using improved mapping
        let dbCategoria = null;
        if (filters?.categoria) {
          dbCategoria = displayToDbMap[filters.categoria] || 
                      displayToDbMap[filters.categoria.toLowerCase()] ||
                      null;
          
          if (!dbCategoria) {
            console.warn('Unknown category:', filters.categoria);
            console.warn('Available categories:', Object.keys(displayToDbMap));
          }
        }
        
        const rpcParams = {
          p_categoria: dbCategoria,
          p_espacio: mode === 'filtered' ? filters?.espacio : null,
          p_aforo: mode === 'filtered' ? filters?.aforo : null, 
          p_evento: mode === 'filtered' ? filters?.evento : null,
          p_plan: mode === 'filtered' ? filters?.plan : null,
          p_show_all: mode === 'all'
        };
          
        console.log('Calling RPC with params:', rpcParams);

        // Use RPC function for better performance and reliability
        const { data, error: fetchError } = await supabase.rpc('get_products_by_filters', rpcParams);
        
        console.log('RPC Response - Data count:', data?.length || 0);
        console.log('RPC Response - Error:', fetchError);

        if (fetchError) {
          console.error('Supabase RPC error:', fetchError);
          throw new Error(`Database query failed: ${fetchError.message}`);
        }

        if (!data) {
          console.warn('No data returned from RPC');
          setProducts([]);
          return;
        }

        const mappedProducts = data.map(mapDbProductToProduct);
        console.log('Products mapped successfully:', mappedProducts.length);
        
        // Log sample product for debugging
        if (mappedProducts.length > 0) {
          console.log('Sample product:', {
            id: mappedProducts[0].id,
            name: mappedProducts[0].name,
            category: mappedProducts[0].category,
            plan: mappedProducts[0].plan
          });
        }
        
        setProducts(mappedProducts);
        
      } catch (err) {
        console.error('=== PRODUCTS FETCH ERROR ===');
        console.error('Error details:', err);
        
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar productos';
        setError(errorMessage);
        
        // Show user-friendly error
        toast({
          title: "Error al cargar productos",
          description: errorMessage,
          variant: "destructive"
        });
        
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters?.espacio, filters?.aforo, filters?.evento, filters?.plan, filters?.categoria, mode]);

  return { products, loading, error };
};