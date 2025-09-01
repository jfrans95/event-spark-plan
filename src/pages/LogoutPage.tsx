import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut } from "lucide-react";

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await supabase.auth.signOut();
        console.log('Logged out successfully');
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      } catch (error) {
        console.error('Error during logout:', error);
        navigate("/", { replace: true });
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <LogOut className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle>Cerrando Sesión</CardTitle>
          <CardDescription>
            Limpiando datos de autenticación...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Serás redirigido al inicio en un momento
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogoutPage;