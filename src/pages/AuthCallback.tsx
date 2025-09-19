import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/user';

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast({
            title: "Error de autenticación",
            description: "Hubo un problema confirmando tu cuenta. Inténtalo de nuevo.",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        if (data.session) {
          toast({
            title: "¡Cuenta confirmada!",
            description: "Tu cuenta ha sido confirmada exitosamente.",
          });
          
          // If going to user dashboard, trigger quote claiming
          if (next === '/user') {
            try {
              const { data: claimData } = await supabase.functions.invoke('quote-claim');
              if (claimData?.claimedQuotes > 0) {
                toast({
                  title: "Cotizaciones asignadas",
                  description: `Se asignaron ${claimData.claimedQuotes} cotizaciones a tu cuenta.`
                });
              }
            } catch (error) {
              console.error("Quote claiming error:", error);
              // Don't fail the whole process
            }
          }
          
          navigate(next);
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, next]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Confirmando tu cuenta...</p>
      </div>
    </div>
  );
};

export default AuthCallback;