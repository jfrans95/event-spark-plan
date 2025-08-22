import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusPill } from "@/components/common/StatusPill";
import { toast } from "@/hooks/use-toast";
import { User, FileText, TrendingUp, XCircle, Play, Eye } from "lucide-react";

const AdvisorDashboard = () => {
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);

  // Mock data
  const stats = {
    newQuotes: 3,
    inProgress: 5,
    approved: 12,
    notConcluded: 2
  };

  const quotes = {
    new: [
      {
        id: 1,
        client: "Empresa ABC",
        eventType: "Conferencia",
        date: "2024-02-15",
        total: 15000000,
        items: [
          { name: "Salón de conferencias", qty: 1, price: 5000000 },
          { name: "Sistema audiovisual", qty: 1, price: 3000000 },
          { name: "Catering para 50 personas", qty: 50, price: 140000 }
        ]
      },
      {
        id: 2,
        client: "Hotel Premium",
        eventType: "Boda",
        date: "2024-02-20",
        total: 25000000,
        items: [
          { name: "Decoración floral", qty: 1, price: 8000000 },
          { name: "Banquete para 100 personas", qty: 100, price: 150000 },
          { name: "Fotografía profesional", qty: 1, price: 2000000 }
        ]
      }
    ],
    inProgress: [
      {
        id: 3,
        client: "Fundación XYZ",
        eventType: "Gala benéfica",
        date: "2024-01-25",
        total: 18000000,
        status: "in_progress"
      }
    ],
    approved: [
      {
        id: 4,
        client: "Corporación 123",
        eventType: "Lanzamiento de producto",
        date: "2024-01-10",
        total: 12000000,
        status: "approved"
      }
    ],
    notConcluded: [
      {
        id: 5,
        client: "Startup Tech",
        eventType: "Networking",
        date: "2024-01-05",
        total: 8000000,
        status: "not_concluded",
        reason: "Presupuesto insuficiente"
      }
    ]
  };

  const handleExecuteEvent = (quote: any) => {
    setSelectedQuote(quote);
    setShowExecuteDialog(true);
  };

  const confirmExecuteEvent = () => {
    toast({
      title: "Evento en Ejecución",
      description: `El evento para ${selectedQuote.client} ha sido programado y asignado al equipo.`,
    });
    
    // Simulate orchestration
    console.log("🎯 Orquestación iniciada:");
    console.log("• Evento agregado al dashboard del administrador");
    console.log("• Evento asignado al colaborador");
    console.log("• Solicitudes enviadas a proveedores");
    
    setShowExecuteDialog(false);
    setSelectedQuote(null);
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Mi Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input id="name" defaultValue="Pedro Sánchez" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="pedro.sanchez@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" defaultValue="301-555-0789" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="territory">Territorio</Label>
              <Input id="territory" defaultValue="Bogotá y alrededores" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline">Editar Información</Button>
            <Button variant="outline">Cambiar Contraseña</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevas Solicitudes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newQuotes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Seguimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Concretadas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notConcluded}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">Nuevas Solicitudes</TabsTrigger>
          <TabsTrigger value="progress">Seguimiento</TabsTrigger>
          <TabsTrigger value="approved">Aprobadas</TabsTrigger>
          <TabsTrigger value="not-concluded">No Concretadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nuevas Solicitudes de Cotización</CardTitle>
              <CardDescription>
                Cotizaciones pendientes de revisión y ejecución
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotes.new.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{quote.client}</p>
                      <p className="text-sm text-muted-foreground">
                        {quote.eventType} • {quote.date}
                      </p>
                      <p className="font-medium text-primary">
                        ${quote.total.toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedQuote(quote)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalle
                      </Button>
                      <Button size="sm" onClick={() => handleExecuteEvent(quote)}>
                        <Play className="w-4 h-4 mr-1" />
                        Ejecutar Evento
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos en Seguimiento</CardTitle>
              <CardDescription>
                Eventos aprobados en proceso de ejecución
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotes.inProgress.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{quote.client}</p>
                      <p className="text-sm text-muted-foreground">
                        {quote.eventType} • {quote.date}
                      </p>
                    </div>
                    <StatusPill status="in_progress" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Aprobados</CardTitle>
              <CardDescription>
                Historial de eventos completados exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotes.approved.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{quote.client}</p>
                      <p className="text-sm text-muted-foreground">
                        {quote.eventType} • {quote.date}
                      </p>
                    </div>
                    <StatusPill status="done" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="not-concluded" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cotizaciones No Concretadas</CardTitle>
              <CardDescription>
                Eventos que no se pudieron concretar con comentarios de análisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotes.notConcluded.map((quote) => (
                  <div key={quote.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{quote.client}</p>
                        <p className="text-sm text-muted-foreground">
                          {quote.eventType} • {quote.date}
                        </p>
                      </div>
                      <StatusPill status="suspended" />
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm">
                        <strong>Motivo:</strong> {quote.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quote Detail Dialog */}
      <Dialog open={!!selectedQuote && !showExecuteDialog} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Cotización</DialogTitle>
            <DialogDescription>
              {selectedQuote?.client} • {selectedQuote?.eventType}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <p><strong>Fecha del evento:</strong> {selectedQuote?.date}</p>
              <p><strong>Total:</strong> ${selectedQuote?.total?.toLocaleString('es-CO')}</p>
            </div>
            
            {selectedQuote?.items && (
              <div>
                <h4 className="font-medium mb-2">Productos/Servicios:</h4>
                <div className="space-y-2">
                  {selectedQuote.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>{item.name} (x{item.qty})</span>
                      <span>${(item.price * item.qty).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedQuote(null)}>
              Cerrar
            </Button>
            <Button onClick={() => handleExecuteEvent(selectedQuote)}>
              <Play className="w-4 h-4 mr-2" />
              Ejecutar Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Event Dialog */}
      <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ejecutar Evento</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas ejecutar el evento para {selectedQuote?.client}?
              Esto iniciará la orquestación del evento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• El evento aparecerá en el dashboard del administrador</p>
            <p>• Se asignará automáticamente a un colaborador</p>
            <p>• Se enviarán solicitudes a los proveedores correspondientes</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExecuteDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmExecuteEvent}>
              Confirmar Ejecución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvisorDashboard;