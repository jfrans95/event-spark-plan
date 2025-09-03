import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Phone, Star, Save } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProviderRequest {
  id: string;
  status: 'recibida' | 'aceptada' | 'rechazada';
  meeting_1_date?: string;
  meeting_1_completed: boolean;
  meeting_2_date?: string;
  meeting_2_completed: boolean;
  meeting_3_date?: string;
  meeting_3_completed: boolean;
  shared_notes?: string;
  rating?: number;
  rating_comment?: string;
  provider_profiles: {
    provider_applications: {
      company_name: string;
      contact_phone: string;
    };
  };
  quote_items: {
    products: {
      name: string;
    };
    quantity: number;
  };
}

interface RunningEvent {
  id: string;
  tracking_code: string;
  event_date?: string;
  event_time?: string;
  event_location?: string;
  provider_requests: ProviderRequest[];
}

export const UserRunningEvents = () => {
  const [events, setEvents] = useState<RunningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState<string | null>(null);
  const [savingRating, setSavingRating] = useState<string | null>(null);

  useEffect(() => {
    fetchRunningEvents();
  }, []);

  const fetchRunningEvents = async () => {
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
          provider_requests (
            id,
            status,
            meeting_1_date,
            meeting_1_completed,
            meeting_2_date,
            meeting_2_completed,
            meeting_3_date,
            meeting_3_completed,
            shared_notes,
            rating,
            rating_comment,
            provider_profiles (
              provider_applications (
                company_name,
                contact_phone
              )
            ),
            quote_items (
              quantity,
              products (
                name
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'en_ejecucion');

      if (error) throw error;

      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching running events:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los eventos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMeeting = async (requestId: string, meetingNumber: 1 | 2 | 3, completed: boolean) => {
    try {
      const updates = {
        [`meeting_${meetingNumber}_completed`]: completed,
        [`meeting_${meetingNumber}_date`]: completed ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from('provider_requests')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setEvents(prev => prev.map(event => ({
        ...event,
        provider_requests: event.provider_requests.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                [`meeting_${meetingNumber}_completed`]: completed,
                [`meeting_${meetingNumber}_date`]: completed ? new Date().toISOString() : null,
              }
            : req
        )
      })));

      toast({
        title: completed ? "Reunión marcada como completada" : "Reunión desmarcada",
        description: `Reunión ${meetingNumber} actualizada`,
      });
    } catch (error: any) {
      console.error('Error updating meeting:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la reunión",
        variant: "destructive",
      });
    }
  };

  const saveNotes = async (requestId: string, notes: string) => {
    setSavingNotes(requestId);
    try {
      const { error } = await supabase
        .from('provider_requests')
        .update({ shared_notes: notes })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setEvents(prev => prev.map(event => ({
        ...event,
        provider_requests: event.provider_requests.map(req => 
          req.id === requestId ? { ...req, shared_notes: notes } : req
        )
      })));

      toast({
        title: "Notas guardadas",
        description: "Las notas han sido actualizadas",
      });
    } catch (error: any) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron guardar las notas",
        variant: "destructive",
      });
    } finally {
      setSavingNotes(null);
    }
  };

  const saveRating = async (requestId: string, rating: number, comment: string) => {
    setSavingRating(requestId);
    try {
      const { error } = await supabase
        .from('provider_requests')
        .update({ rating, rating_comment: comment })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setEvents(prev => prev.map(event => ({
        ...event,
        provider_requests: event.provider_requests.map(req => 
          req.id === requestId ? { ...req, rating, rating_comment: comment } : req
        )
      })));

      toast({
        title: "Calificación guardada",
        description: "La calificación del proveedor ha sido registrada",
      });

      // Check if all providers are rated to auto-close event
      checkEventCompletion(requestId);
    } catch (error: any) {
      console.error('Error saving rating:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la calificación",
        variant: "destructive",
      });
    } finally {
      setSavingRating(null);
    }
  };

  const checkEventCompletion = async (requestId: string) => {
    const event = events.find(e => e.provider_requests.some(r => r.id === requestId));
    if (!event) return;

    const allRated = event.provider_requests.every(req => 
      req.id === requestId ? true : req.rating !== null && req.rating !== undefined
    );

    if (allRated) {
      // Auto-close event
      try {
        const { error } = await supabase
          .from('events')
          .update({ status: 'ejecutado' })
          .eq('id', event.id);

        if (error) throw error;

        toast({
          title: "Evento completado",
          description: "El evento ha sido marcado como ejecutado automáticamente",
        });

        // Refresh the list
        fetchRunningEvents();
      } catch (error: any) {
        console.error('Error completing event:', error);
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando eventos en ejecución...</span>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eventos en Ejecución</CardTitle>
          <CardDescription>
            Aquí aparecerán los eventos que estén siendo ejecutados
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No tienes eventos en ejecución</h3>
          <p className="text-muted-foreground">
            Los eventos aparecerán aquí una vez que los ejecutes desde tus cotizaciones
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
                  {event.event_date && event.event_time ? (
                    <>
                      {format(new Date(event.event_date), 'dd/MM/yyyy', { locale: es })} a las {event.event_time}
                      {event.event_location && ` en ${event.event_location}`}
                    </>
                  ) : (
                    'Fecha y ubicación por confirmar'
                  )}
                </CardDescription>
              </div>
              <Badge>En Ejecución</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {event.provider_requests.map((request, index) => {
              const allMeetingsCompleted = request.meeting_1_completed && 
                                         request.meeting_2_completed && 
                                         request.meeting_3_completed;
              const isRated = request.rating !== null && request.rating !== undefined;

              return (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium">
                        {request.provider_profiles.provider_applications.company_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {request.quote_items.products.name} x{request.quote_items.quantity}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">
                          {request.provider_profiles.provider_applications.contact_phone}
                        </span>
                      </div>
                    </div>
                    <Badge variant={request.status === 'aceptada' ? 'default' : 'secondary'}>
                      {request.status === 'aceptada' ? 'Aceptada' : 
                       request.status === 'rechazada' ? 'Rechazada' : 'Pendiente'}
                    </Badge>
                  </div>

                  {/* Meetings */}
                  <div className="space-y-2 mb-4">
                    <Label className="text-sm font-medium">Reuniones de Coordinación</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((num) => {
                        const completed = request[`meeting_${num}_completed` as keyof ProviderRequest] as boolean;
                        const date = request[`meeting_${num}_date` as keyof ProviderRequest] as string;
                        
                        return (
                          <div key={num} className="flex items-center space-x-2">
                            <Checkbox
                              id={`meeting-${request.id}-${num}`}
                              checked={completed}
                              onCheckedChange={(checked) => 
                                updateMeeting(request.id, num as 1 | 2 | 3, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`meeting-${request.id}-${num}`}
                              className="text-sm"
                            >
                              Reunión {num}
                              {completed && date && (
                                <span className="block text-xs text-muted-foreground">
                                  {format(new Date(date), 'dd/MM HH:mm', { locale: es })}
                                </span>
                              )}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shared Notes */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor={`notes-${request.id}`}>Notas Compartidas</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id={`notes-${request.id}`}
                        placeholder="Escribe notas que serán visibles para el proveedor..."
                        defaultValue={request.shared_notes || ''}
                        className="min-h-[80px]"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const textarea = document.getElementById(`notes-${request.id}`) as HTMLTextAreaElement;
                          saveNotes(request.id, textarea.value);
                        }}
                        disabled={savingNotes === request.id}
                      >
                        {savingNotes === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Rating */}
                  {allMeetingsCompleted && (
                    <div className="space-y-3 pt-4 border-t">
                      <Label>Calificación del Proveedor</Label>
                      {isRated ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= (request.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{request.rating}/5</span>
                          {request.rating_comment && (
                            <span className="text-sm text-muted-foreground">
                              - {request.rating_comment}
                            </span>
                          )}
                        </div>
                      ) : (
                        <RatingComponent
                          requestId={request.id}
                          onSave={saveRating}
                          saving={savingRating === request.id}
                        />
                      )}
                    </div>
                  )}

                  {index < event.provider_requests.length - 1 && <Separator className="mt-6" />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface RatingComponentProps {
  requestId: string;
  onSave: (requestId: string, rating: number, comment: string) => void;
  saving: boolean;
}

const RatingComponent = ({ requestId, onSave, saving }: RatingComponentProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const ratingLabels = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              />
            </button>
          ))}
        </div>
        {(hoveredRating || rating) > 0 && (
          <span className="text-sm font-medium">
            {ratingLabels[hoveredRating || rating]}
          </span>
        )}
      </div>

      <Textarea
        placeholder="Comentarios adicionales (opcional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[60px]"
      />

      <Button
        onClick={() => onSave(requestId, rating, comment)}
        disabled={rating === 0 || saving}
        size="sm"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : null}
        Guardar Calificación
      </Button>
    </div>
  );
};