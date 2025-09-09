import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener los parámetros de la URL
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const next = searchParams.get('next') || '/user';

        if (token_hash && type) {
          // Verificar el token con Supabase
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            console.error('Error verifying email:', error);
            toast({
              title: "Error de confirmación",
              description: "El enlace de confirmación ha expirado o es inválido. Por favor, intenta registrarte nuevamente.",
              variant: "destructive",
            });
            navigate('/auth');
            return;
          }

          if (data.user) {
            toast({
              title: "¡Email confirmado!",
              description: "Tu cuenta ha sido activada correctamente. Bienvenido a EventCraft.",
            });
            
            // Redirigir según el tipo de usuario
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('user_id', data.user.id)
              .single();

            if (profile?.role === 'provider') {
              navigate('/proveedor/registro');
            } else if (profile?.role === 'collaborator') {
              navigate('/user');
            } else {
              navigate(next);
            }
          }
        } else {
          // Si no hay parámetros válidos, redirigir a auth
          toast({
            title: "Enlace inválido",
            description: "El enlace de confirmación no es válido.",
            variant: "destructive",
          });
          navigate('/auth');
        }
      } catch (error) {
        console.error('Callback error:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al confirmar tu email.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <div className="text-lg">Confirmando tu email...</div>
        <div className="text-sm text-muted-foreground mt-2">
          Por favor espera mientras verificamos tu cuenta
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;