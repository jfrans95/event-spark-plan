import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Package, Calendar, MapPin, DollarSign, ExternalLink, LogOut } from "lucide-react";

interface Quote {
  id: string;
  tracking_code: string;
  email: string;
  event_date: string | null;
  event_time: string | null;
  event_location: string | null;
  total_amount: number;
  pdf_url: string | null;
  status: string;
  created_at: string;
}

const UserDashboard = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Mis Cotizaciones | EventCraft";
    
    const checkAuthAndLoadQuotes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Claim quotes first
      await claimQuotes();
      // Then load all quotes
      await loadQuotes();
    };

    checkAuthAndLoadQuotes();
  }, [navigate]);

  const claimQuotes = async () => {
    setClaiming(true);
    try {
      const { data, error } = await supabase.functions.invoke('quote-claim');
      
      if (error) {
        console.error("Quote claim error:", error);
        return;
      }

      if (data?.claimedQuotes > 0) {
        toast({
          title: "Cotizaciones asignadas",
          description: `Se asignaron ${data.claimedQuotes} cotizaciones a tu cuenta.`
        });
      }
    } catch (error) {
      console.error("Failed to claim quotes:", error);
    } finally {
      setClaiming(false);
    }
  };

  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Failed to load quotes:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las cotizaciones",
          variant: "destructive"
        });
        return;
      }

      setQuotes(data || []);
    } catch (error) {
      console.error("Load quotes error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COTIZACION_ENVIADA':
        return 'default';
      case 'GANADA':
        return 'secondary'; // Using secondary instead of success
      case 'PERDIDA':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COTIZACION_ENVIADA':
        return 'Cotización Enviada';
      case 'GANADA':
        return 'Cotización Ganada';
      case 'PERDIDA':
        return 'Cotización Perdida';
      default:
        return status;
    }
  };

  if (loading || claiming) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{claiming ? "Asignando cotizaciones..." : "Cargando cotizaciones..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mis Cotizaciones</h1>
            <p className="text-muted-foreground">Gestiona y revisa tus cotizaciones de eventos</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>

        {quotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes cotizaciones</h3>
              <p className="text-muted-foreground mb-4">
                Aún no has creado ninguna cotización. ¡Comienza explorando nuestro catálogo!
              </p>
              <Button onClick={() => navigate('/catalog')}>
                Explorar Catálogo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {quotes.map((quote) => (
              <Card key={quote.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Cotización #{quote.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription>
                        Creada el {new Date(quote.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(quote.status)}>
                      {getStatusLabel(quote.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">${quote.total_amount.toLocaleString()}</span>
                    </div>
                    
                    {quote.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(quote.event_date).toLocaleDateString('es-ES')}
                          {quote.event_time && ` ${quote.event_time}`}
                        </span>
                      </div>
                    )}
                    
                    {quote.event_location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{quote.event_location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {quote.pdf_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(quote.pdf_url!, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver PDF
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/tracking/${quote.tracking_code}`)}
                      className="flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      Seguimiento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;