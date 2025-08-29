import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Heart, ArrowLeft } from "lucide-react";
import ProviderApplicationForm from "@/components/ProviderApplicationForm";

const ProviderRegistration = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/aliados');
        return;
      }

      // Check if user is a provider
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role !== 'provider') {
        navigate('/dashboard');
        return;
      }

      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/aliados');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmitted = () => {
    navigate('/proveedor/solicitud-enviada');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-lg">Verificando usuario...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">EventCraft</h1>
              <p className="text-sm text-muted-foreground">Registro de Proveedor</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Inicio
          </Button>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitud de Registro como Proveedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ProviderApplicationForm 
              userId={user.id}
              onSuccess={handleApplicationSubmitted}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderRegistration;