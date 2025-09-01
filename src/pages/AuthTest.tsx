import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserCheck } from "lucide-react";

// Página de prueba para login directo del administrador
const AuthTest = () => {
  const [loading, setLoading] = useState(false);

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      // Login directo con las credenciales del administrador existente
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'frans.corporativo@gmail.com',
        password: 'admin123' // Contraseña que debe usar
      });

      if (error) {
        toast({
          title: "Error de login",
          description: error.message,
          variant: "destructive"
        });
        console.error('Login error:', error);
      } else {
        toast({
          title: "✅ Login exitoso",
          description: "Redirigiendo al dashboard..."
        });
        // La redirección se maneja automáticamente por Auth.tsx
        window.location.href = '/dashboard/admin';
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Error inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error de login",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Login exitoso",
          description: "Redirigiendo..."
        });
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Error inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Test Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Login de Prueba
            </CardTitle>
            <CardDescription>
              Login directo con admin existente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Login Admin (frans.corporativo@gmail.com)'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Login Manual</CardTitle>
            <CardDescription>
              Ingresa tus credenciales manualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Usuarios disponibles:<br/>
            • Administrator: frans.corporativo@gmail.com<br/>
            • Provider: paula.avelezm@gmail.com<br/>
            • Provider: oasislive77@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;