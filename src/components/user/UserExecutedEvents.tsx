import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Calendar, Repeat, CheckCircle, Star } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProviderRequest {
  id: string;
  rating?: number;
  rating_comment?: string;
  provider_profiles: {
    provider_applications: {
      company_name: string;
    };
  };
  quote_items: {
    products: {
      id: string;
      name: string;
    };
    quantity: number;
    unit_price: number;
  };
}

interface ExecutedEvent {
  id: string;
  tracking_code: string;
  event_date?: string;
  event_time?: string;
  event_location?: string;
  created_at: string;
  provider_requests: ProviderRequest[];
  quotes: {
    total_amount: number;
    contact_name: string;
  };
}

export const UserExecutedEvents = () => {
  const [events, setEvents] = useState<ExecutedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulingAgain, setSchedulingAgain] = useState<string | null>(null);

  useEffect(() => {
    fetchExecutedEvents();
  }, []);

  const fetchExecutedEvents = async () => {
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
        .from('events')
        .select(`
          id,
          tracking_code,
          event_date,
          event_time,
          event_location,
          created_at,
          quotes (
            total_amount,
            contact_name
          ),
          provider_requests (
            id,
            rating,
            rating_comment,
            provider_profiles (
              provider_applications (
                company_name
              )
            ),
            quote_items (
              quantity,
              unit_price,
              products (
                id,
                name
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'ejecutado')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching executed events:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los eventos ejecutados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleAgain = async (eventId: string, newDate: string, newTime: string, newLocation: string) => {
    setSchedulingAgain(eventId);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) throw userError;

      // Find the original event
      const originalEvent = events.find(e => e.id === eventId);
      if (!originalEvent) throw new Error('Evento no encontrado');

      // Create new quote with same products
      const { data: newQuote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
          contact_name: originalEvent.quotes.contact_name,
          contact_email: user.email!, // Using user's email
          event_date: newDate,
          event_time: newTime,
          event_location: newLocation,
          total_amount: originalEvent.quotes.total_amount,
          status: 'enviada'
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create quote items from the original event
      const quoteItems = originalEvent.provider_requests.map(req => ({
        quote_id: newQuote.id,
        product_id: req.quote_items.products.id,
        quantity: req.quote_items.quantity,
        unit_price: req.quote_items.unit_price,
        subtotal: req.quote_items.quantity * req.quote_items.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Nueva cotización creada",
        description: "Se ha creado una nueva cotización con los mismos productos. Puedes ejecutarla desde la pestaña 'Mis Cotizaciones'.",
      });

      // Close dialog
      setSchedulingAgain(null);
    } catch (error: any) {
      console.error('Error scheduling again:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo programar nuevamente",
        variant: "destructive",
      });
    } finally {
      setSchedulingAgain(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando eventos ejecutados...</span>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eventos Ejecutados</CardTitle>
          <CardDescription>
            Aquí aparecerán los eventos que ya han sido completados
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No tienes eventos ejecutados</h3>
          <p className="text-muted-foreground">
            Los eventos completados aparecerán aquí con toda su información
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Evento {event.tracking_code}</CardTitle>
                <CardDescription>
                  Para {event.quotes.contact_name} • 
                  {event.event_date && event.event_time ? (
                    <>
                      {' '}{format(new Date(event.event_date), 'dd/MM/yyyy', { locale: es })} a las {event.event_time}
                      {event.event_location && ` en ${event.event_location}`}
                    </>
                  ) : (
                    ' Fecha por confirmar'
                  )}{' '}•{' '}
                  Total: ${event.quotes.total_amount.toLocaleString('es-CO')}
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Ejecutado
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Provider Ratings Summary */}
            <div className="grid gap-3">
              <h4 className="font-medium">Calificaciones de Proveedores</h4>
              {event.provider_requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {request.provider_profiles.provider_applications.company_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.quote_items.products.name} x{request.quote_items.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.rating ? (
                      <>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= request.rating!
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{request.rating}/5</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin calificar</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <ScheduleAgainDialog
                event={event}
                onSchedule={handleScheduleAgain}
                loading={schedulingAgain === event.id}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              Ejecutado el {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface ScheduleAgainDialogProps {
  event: ExecutedEvent;
  onSchedule: (eventId: string, date: string, time: string, location: string) => void;
  loading: boolean;
}

const ScheduleAgainDialog = ({ event, onSchedule, loading }: ScheduleAgainDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: event.event_location || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "La fecha y hora son obligatorias",
        variant: "destructive",
      });
      return;
    }

    onSchedule(event.id, formData.date, formData.time, formData.location);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Repeat className="w-4 h-4 mr-2" />
          Programar Nuevamente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programar Nuevamente</DialogTitle>
          <DialogDescription>
            Crea una nueva cotización con los mismos productos para una nueva fecha
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Nueva Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ubicación del evento"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Crear Nueva Cotización
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};