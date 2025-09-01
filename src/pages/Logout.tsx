import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente",
        });
        
        // Esperar un momento y redirigir a login
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 1000);
        
      } catch (error) {
        console.error('Error during logout:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cerrar sesión",
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">Cerrando sesión...</p>
      </div>
    </div>
  );
};

export default Logout;