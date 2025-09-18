import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const createDemoSeed = async () => {
  try {
    console.log('Calling seed-demo function...');
    
    const { data, error } = await supabase.functions.invoke('seed-demo', {
      body: {}
    });

    if (error) {
      console.error('Seed function error:', error);
      throw error;
    }

    console.log('Seed demo created successfully:', data);
    
    toast({
      title: "Demo data creado exitosamente",
      description: `Creados ${data.providers_created} proveedores y ${data.products_created} productos`,
    });

    return data;
  } catch (error) {
    console.error('Error creating seed demo:', error);
    
    const errorMessage = error?.message || error?.details || error?.hint || "Error desconocido";
    
    toast({
      title: "Error creando datos de prueba",
      description: errorMessage,
      variant: "destructive"
    });
    
    throw error;
  }
};