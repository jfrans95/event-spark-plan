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
  activo: dbProduct.activo
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

        let query = supabase
          .from('products')
          .select(`
            *,
            provider_profiles!inner(
              user_id,
              provider_applications!inner(
                status
              )
            )
          `)
          .eq('activo', true)
          .eq('provider_profiles.provider_applications.status', 'approved');

        // Apply filters only in 'filtered' mode
        if (mode === 'filtered') {
          if (filters?.espacio) {
            query = query.contains('space_types', [filters.espacio]);
          }

          if (filters?.aforo) {
            query = query
              .lte('capacity_min', filters.aforo)
              .gte('capacity_max', filters.aforo);
          }

          if (filters?.evento) {
            query = query.contains('event_types', [filters.evento]);
          }

          if (filters?.plan && ['basico', 'pro', 'premium'].includes(filters.plan)) {
            query = query.eq('plan', filters.plan as 'basico' | 'pro' | 'premium');
          }
        }

        if (filters?.categoria) {
          // Convert display category back to db enum
          const dbCategoria = Object.entries(categoryMap)
            .find(([_, displayName]) => displayName === filters.categoria)?.[0];
          if (dbCategoria) {
            query = query.eq('categoria', dbCategoria as 'montaje_tecnico' | 'decoracion_ambientacion' | 'catering' | 'mixologia_cocteleria' | 'arte_cultura' | 'audiovisuales' | 'mobiliario');
          }
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
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
              description: errorMessage,
              variant: "destructive"
            });
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters?.espacio, filters?.aforo, filters?.evento, filters?.plan, filters?.categoria, mode]);

  return { products, loading, error };
};