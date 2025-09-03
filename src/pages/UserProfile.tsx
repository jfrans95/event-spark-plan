import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfileCard } from '@/components/user/UserProfileCard';
import { UserQuotesList } from '@/components/user/UserQuotesList';
import { UserRunningEvents } from '@/components/user/UserRunningEvents';
import { UserExecutedEvents } from '@/components/user/UserExecutedEvents';
import { Loader2, User } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: string;
}

const UserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para ver tu perfil",
          variant: "destructive",
        });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil",
          variant: "destructive",
        });
        return;
      }

      setProfile(profile);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando perfil...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Perfil no encontrado</CardTitle>
            <CardDescription>
              No se pudo cargar tu perfil de usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'} className="w-full">
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
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Mi Perfil</h1>
                <p className="text-sm text-muted-foreground">
                  {profile.full_name || profile.email}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Mis Datos</TabsTrigger>
            <TabsTrigger value="quotes">Mis Cotizaciones</TabsTrigger>
            <TabsTrigger value="running">En Ejecución</TabsTrigger>
            <TabsTrigger value="executed">Ejecutados</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <UserProfileCard profile={profile} onProfileUpdate={setProfile} />
          </TabsContent>

          <TabsContent value="quotes" className="mt-6">
            <UserQuotesList />
          </TabsContent>

          <TabsContent value="running" className="mt-6">
            <UserRunningEvents />
          </TabsContent>

          <TabsContent value="executed" className="mt-6">
            <UserExecutedEvents />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserProfile;