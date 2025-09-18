import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import AdminDashboard from "@/components/AdminDashboard";
import ProviderProfile from "@/components/ProviderProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User2 } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('No authenticated user, redirecting to auth');
        navigate("/auth");
        return;
      }

      console.log('User authenticated:', user.email);
      setUser(user);

      // Get user role from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Error de perfil",
          description: "No se pudo cargar el perfil de usuario. Inicia sesión de nuevo.",
          variant: "destructive",
        });
        // Sign out user if profile cannot be loaded
        await supabase.auth.signOut();
        navigate("/auth");
        return;
      }

      console.log('User role:', profile.role);
      setUserRole(profile.role);
      
      // Redirect to appropriate dashboard if not already there
      const roleRoutes = {
        administrator: '/dashboard/admin',
        advisor: '/dashboard/asesor', 
        collaborator: '/dashboard/colaborador',
        provider: '/dashboard/proveedor'
      };
      
      const targetRoute = roleRoutes[profile.role as keyof typeof roleRoutes];
      const currentPath = window.location.pathname;
      
      if (targetRoute && currentPath === '/dashboard') {
        console.log('Redirecting to role-specific dashboard:', targetRoute);
        navigate(targetRoute, { replace: true });
      }
    } catch (error) {
      console.error('Error checking user:', error);
      toast({
        title: "Error de autenticación",
        description: "Problema de autenticación. Inicia sesión de nuevo.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all user state
      setUser(null);
      setUserRole(null);
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      navigate("/");
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user || !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para acceder a esta página
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <User2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {userRole === 'administrator' ? 'Administrador' : 
                   userRole === 'provider' ? 'Proveedor' : 'Colaborador'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/logout")}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        {userRole === 'administrator' && <AdminDashboard />}
        {userRole === 'provider' && <ProviderProfile />}
        {userRole === 'collaborator' && (
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Dashboard de Colaborador</CardTitle>
                <CardDescription>
                  Funcionalidades de colaborador en desarrollo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Las funcionalidades específicas para colaboradores se implementarán próximamente.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;