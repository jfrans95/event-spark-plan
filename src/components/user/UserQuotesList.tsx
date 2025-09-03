import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Edit, Play, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Quote {
  id: string;
  contact_name: string;
  contact_email: string;
  event_date?: string;
  event_time?: string;
  event_location?: string;
  total_amount: number;
  status: 'enviada' | 'ganada' | 'perdida';
  pdf_url?: string;
  created_at: string;
}

export const UserQuotesList = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuotes(data || []);
    } catch (error: any) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar las cotizaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteEvent = async (quoteId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres ejecutar este evento? Esto creará solicitudes para todos los proveedores.')) {
      return;
    }

    setExecuting(quoteId);
    try {
      const { data, error } = await supabase.functions.invoke('execute-event', {
        body: { quoteId }
      });

      if (error) throw error;

      toast({
        title: "Evento ejecutado",
        description: `El evento ha sido creado. Código de seguimiento: ${data.trackingCode}`,
      });

      // Refresh quotes to update status
      fetchQuotes();
    } catch (error: any) {
      console.error('Error executing event:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo ejecutar el evento",
        variant: "destructive",
      });
    } finally {
      setExecuting(null);
    }
  };

  const getStatusBadge = (status: Quote['status']) => {
    const variants = {
      enviada: 'default' as const,
      ganada: 'default' as const,
      perdida: 'destructive' as const,
    };

    const labels = {
      enviada: 'Enviada',
      ganada: 'Ganada',
      perdida: 'Perdida',
    };

    return (
      <Badge variant={variants[status]} className={
        status === 'ganada' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''
      }>
        {labels[status]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando cotizaciones...</span>
        </CardContent>
      </Card>
    );
  }

  if (quotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Cotizaciones</CardTitle>
          <CardDescription>
            Aquí aparecerán todas tus cotizaciones de eventos
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No tienes cotizaciones</h3>
          <p className="text-muted-foreground mb-6">
            Crea tu primera cotización desde el catálogo de productos
          </p>
          <Button onClick={() => window.location.href = '/catalog'}>
            Ver Catálogo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Cotizaciones</h2>
          <p className="text-muted-foreground">
            {quotes.length} cotización{quotes.length !== 1 ? 'es' : ''} en total
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {quotes.map((quote) => (
          <Card key={quote.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Evento para {quote.contact_name}
                  </CardTitle>
                  <CardDescription>
                    {quote.event_date && quote.event_time ? (
                      <>
                        {format(new Date(quote.event_date), 'dd/MM/yyyy', { locale: es })} a las {quote.event_time}
                        {quote.event_location && ` en ${quote.event_location}`}
                      </>
                    ) : (
                      'Fecha y hora pendientes por definir'
                    )}
                  </CardDescription>
                </div>
                {getStatusBadge(quote.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email de contacto</p>
                  <p className="font-medium">{quote.contact_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-medium text-lg">
                    ${quote.total_amount.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {quote.pdf_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={quote.pdf_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-2" />
                      Ver PDF
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                )}
                
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>

                {quote.event_date && quote.event_time && quote.status === 'enviada' && (
                  <Button
                    size="sm"
                    onClick={() => handleExecuteEvent(quote.id)}
                    disabled={executing === quote.id}
                  >
                    {executing === quote.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Ejecutar Evento
                  </Button>
                )}
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                Creada el {format(new Date(quote.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};