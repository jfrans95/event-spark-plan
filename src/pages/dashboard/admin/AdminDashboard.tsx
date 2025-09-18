import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, FileText, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { StatusPill } from "@/components/common/StatusPill";
import ProviderApplicationsList from "@/components/admin/ProviderApplicationsList";
import InventarioGeneral from "@/pages/dashboard/admin/InventarioGeneral";
import GestionPersonal from "@/pages/dashboard/admin/GestionPersonal";

const AdminDashboard = () => {
  // Mock data
  const stats = {
    totalEvents: 12,
    activeProviders: 8,
    pendingQuotes: 5,
    monthlyRevenue: 45000000
  };

  const recentEvents = [
    { id: 1, name: "Boda Empresarial", status: "in_progress", date: "2024-01-15", responsible: "Ana García" },
    { id: 2, name: "Conferencia Tech", status: "new", date: "2024-01-20", responsible: "Carlos López" },
    { id: 3, name: "Cumpleaños Corporativo", status: "done", date: "2024-01-10", responsible: "María Rodríguez" },
  ];

  const pendingQuotes = [
    { id: 1, client: "Empresa ABC", total: 15000000, date: "2024-01-12", advisor: "Pedro Sánchez" },
    { id: 2, client: "Hotel Premium", total: 8500000, date: "2024-01-13", advisor: "Laura Martín" },
    { id: 3, client: "Fundación XYZ", total: 12000000, date: "2024-01-14", advisor: "Diego Morales" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProviders}</div>
            <p className="text-xs text-muted-foreground">+2 este mes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cotizaciones Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthlyRevenue.toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-muted-foreground">+15% vs mes anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Eventos en Ejecución</TabsTrigger>
          <TabsTrigger value="quotes">Nuevas Solicitudes</TabsTrigger>
          <TabsTrigger value="providers">Solicitudes Alianzas</TabsTrigger>
          <TabsTrigger value="inventory">Inventario Global</TabsTrigger>
          <TabsTrigger value="personnel">Personal Global</TabsTrigger>
          <TabsTrigger value="analytics">Análisis y Reportes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos en Ejecución</CardTitle>
              <CardDescription>
                Vista general de eventos activos y su estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Responsable: {event.responsible} • {event.date}
                      </p>
                    </div>
                    <StatusPill status={event.status as any} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nuevas Solicitudes de Cotización</CardTitle>
              <CardDescription>
                Cotizaciones recientes que requieren revisión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{quote.client}</p>
                      <p className="text-sm text-muted-foreground">
                        Asesor: {quote.advisor} • {quote.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${quote.total.toLocaleString('es-CO')}</p>
                      <StatusPill status="pending" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="providers" className="space-y-4">
          <ProviderApplicationsList />
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <InventarioGeneral />
        </TabsContent>
        
        <TabsContent value="personnel" className="space-y-4">
          <GestionPersonal />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Ventas</CardTitle>
                <CardDescription>Rendimiento de ventas por periodo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Gráfico de ventas (placeholder)</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Valoraciones del Equipo</CardTitle>
                <CardDescription>Desempeño promedio por rol</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Asesores</span>
                    <span className="font-medium">4.2/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Colaboradores</span>
                    <span className="font-medium">4.5/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proveedores</span>
                    <span className="font-medium">4.1/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;