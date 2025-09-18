import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/context/PackageContext";

interface ProductFilters {
  espacio?: string;
  aforo?: number;
  evento?: string;
  plan?: string;
  categoria?: string;
}

// Map database category enum to display category
const categoryMap: Record<string, string> = {
  'montaje_tecnico': 'Montaje técnico',
  'decoracion_ambientacion': 'Decoración/ambientación',
  'catering': 'Catering',
  'mixologia_cocteleria': 'Mixología/coctelería',
  'arte_cultura': 'Arte/cultura',
  'audiovisuales': 'Audiovisuales',
  'mobiliario': 'Mobiliario'
};

const mapDbProductToProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description,
  price: Number(dbProduct.price),
  category: categoryMap[dbProduct.categoria] || dbProduct.categoria,
  images: dbProduct.images || [],
  space_types: dbProduct.space_types,
  capacity_min: dbProduct.capacity_min,
  capacity_max: dbProduct.capacity_max,
  event_types: dbProduct.event_types,
  plan: dbProduct.plan,
  activo: dbProduct.activo,
  provider_name: dbProduct.provider_name || dbProduct.provider_profiles?.provider_applications?.company_name || "Proveedor"
});

export const useProducts = (filters?: ProductFilters, mode: 'filtered' | 'all' = 'filtered') => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debounce to prevent excessive requests
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters?.espacio, filters?.aforo, filters?.evento, filters?.plan, filters?.categoria, mode]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

        console.log('=== QUERY DEBUG ===');
        console.log('Mode:', mode);
        console.log('Filters received:', filters);
        
        // Convert display category to database enum
        const dbCategoria = filters?.categoria ? 
          Object.entries(categoryMap).find(([_, displayName]) => displayName === filters.categoria)?.[0] : 
          null;
          
        console.log('Using RPC function with params:', {
          categoria: dbCategoria,
          espacio: mode === 'filtered' ? filters?.espacio : null,
          aforo: mode === 'filtered' ? filters?.aforo : null, 
          evento: mode === 'filtered' ? filters?.evento : null,
          plan: mode === 'filtered' ? filters?.plan : null,
          showAll: mode === 'all'
        });

        // Use RPC function for better performance and reliability
        const { data, error: fetchError } = await supabase.rpc('get_products_by_filters', {
          p_categoria: dbCategoria,
          p_espacio: mode === 'filtered' ? filters?.espacio : null,
          p_aforo: mode === 'filtered' ? filters?.aforo : null,
          p_evento: mode === 'filtered' ? filters?.evento : null,
          p_plan: mode === 'filtered' ? filters?.plan : null,
          p_show_all: mode === 'all'
        });
        console.log('Query executed. Data:', data);
        console.log('Query executed. Error:', fetchError);

        if (fetchError) {
          console.error('Supabase query error:', fetchError);
          throw fetchError;
        }

        const mappedProducts = (data || []).map(mapDbProductToProduct);
        setProducts(mappedProducts);
        
        // Log for debugging in dev mode
        if (process.env.NODE_ENV === 'development') {
          console.log(`Products fetched (${mode} mode):`, {
            filters,
            count: mappedProducts.length,
            category: filters?.categoria
          });
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        
        // Show toast with real error message
        if (typeof window !== 'undefined') {
          import('@/hooks/use-toast').then(({ toast }) => {
            toast({
              title: "Error al cargar productos",
              description: `${errorMessage}`,
              variant: "destructive"
            });
          });
        }
      } finally {
        setLoading(false);
      }
    };

  return { products, loading, error };
};