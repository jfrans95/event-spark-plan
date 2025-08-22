import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/common/StatusPill";
import { Calendar, Clock, CheckCircle, Phone, Star } from "lucide-react";

const CollaboratorDashboard = () => {
  const events = {
    new: [
      { id: 1, name: "Boda Empresarial", client: "Empresa ABC", date: "2024-01-15", status: "new" }
    ],
    inProgress: [
      { id: 2, name: "Conferencia Tech", client: "Hotel Premium", date: "2024-01-20", status: "in_progress", providersContacted: 2, providersTotal: 4 }
    ],
    completed: [
      { id: 3, name: "Cumpleaños Corporativo", client: "Fundación XYZ", date: "2024-01-10", status: "done", rating: 4.5 }
    ]
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Cronograma de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gestiona los eventos asignados</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">Nuevas</TabsTrigger>
          <TabsTrigger value="progress">En Ejecución</TabsTrigger>
          <TabsTrigger value="completed">Ejecutadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Nuevas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.new.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">{event.client} • {event.date}</p>
                    </div>
                    <StatusPill status="new" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos en Ejecución</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.inProgress.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{event.name}</p>
                        <p className="text-sm text-muted-foreground">{event.client} • {event.date}</p>
                      </div>
                      <StatusPill status="in_progress" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-1" />
                        Contactar Proveedores
                      </Button>
                      <Button size="sm" disabled>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Evento Ejecutado
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Ejecutados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.completed.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">{event.client} • {event.date}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{event.rating}/5</span>
                      </div>
                    </div>
                    <StatusPill status="done" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaboratorDashboard;