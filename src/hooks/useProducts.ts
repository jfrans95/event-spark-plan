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
  provider_name: dbProduct.provider_profiles?.provider_applications?.company_name || "Proveedor"
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

        console.log('=== QUERY DEBUG ===');
        console.log('Mode:', mode);
        console.log('Filters received:', filters);
        
        let query = supabase
          .from('products')
          .select(`
            *,
            provider_profiles!inner(
              user_id,
              provider_applications!inner(
                status,
                company_name
              )
            )
          `)
          .eq('activo', true)
          .eq('provider_profiles.provider_applications.status', 'approved');

        console.log('Base query created');

        // Apply category filter always (even in 'all' mode we filter by category)
        if (filters?.categoria) {
          console.log('Adding categoria filter:', filters.categoria);
          // Convert display category back to db enum
          const dbCategoria = Object.entries(categoryMap)
            .find(([_, displayName]) => displayName === filters.categoria)?.[0];
          console.log('DB categoria:', dbCategoria);
          if (dbCategoria) {
            query = query.eq('categoria', dbCategoria as 'montaje_tecnico' | 'decoracion_ambientacion' | 'catering' | 'mixologia_cocteleria' | 'arte_cultura' | 'audiovisuales' | 'mobiliario');
          }
        }

        // Apply filters only in 'filtered' mode - strict AND logic
        if (mode === 'filtered') {
          console.log('Applying filters in filtered mode...');
          
          // Espacio filter: product must support this space type
          if (filters?.espacio) {
            console.log('Adding espacio filter:', filters.espacio);
            query = query.contains('space_types', [filters.espacio]);
          }

          // Aforo filter: product capacity range must include the guest count
          if (filters?.aforo) {
            console.log('Adding aforo filter:', filters.aforo);
            query = query
              .lte('capacity_min', filters.aforo)  // min capacity <= guest count
              .gte('capacity_max', filters.aforo); // max capacity >= guest count
          }

          // Evento filter: product must support this event type
          if (filters?.evento) {
            console.log('Adding evento filter:', filters.evento);
            query = query.contains('event_types', [filters.evento]);
          }

          // Plan filter: inclusive hierarchy (premium > pro > basico)
          if (filters?.plan && ['basico', 'pro', 'premium'].includes(filters.plan)) {
            console.log('Adding plan filter:', filters.plan);
            if (filters.plan === 'basico') {
              query = query.eq('plan', 'basico');
            } else if (filters.plan === 'pro') {
              query = query.in('plan', ['basico', 'pro']);
            } else if (filters.plan === 'premium') {
              query = query.in('plan', ['basico', 'pro', 'premium']);
            }
          }
        }

        console.log('About to execute query...');
        const { data, error: fetchError } = await query;
        console.log('Query executed. Data:', data);
        console.log('Query executed. Error:', fetchError);

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
              description: `${errorMessage}`,
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