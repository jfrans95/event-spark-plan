import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const createDemoSeed = async () => {
  try {
    console.log('Calling seed-demo function...');
    
    const { data, error } = await supabase.functions.invoke('seed-demo', {
      body: {}
    });

    if (error) {
      throw error;
    }

    console.log('Seed demo created:', data);
    
    toast({
      title: "Demo data created",
      description: `Created ${data.providers_created} providers and ${data.products_created} products`,
    });

    return data;
  } catch (error) {
    console.error('Error creating seed demo:', error);
    
    toast({
      title: "Error creating demo data",
      description: error.message || "Unknown error occurred",
      variant: "destructive"
    });
    
    throw error;
  }
};