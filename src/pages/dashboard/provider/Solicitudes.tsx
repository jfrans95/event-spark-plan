import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/common/StatusPill";

const Solicitudes = () => {
  const requests = {
    new: [
      { id: 1, product: "Mesa redonda", client: "Empresa ABC", date: "2024-01-15", location: "Hotel Bogotá" }
    ],
    inProgress: [
      { id: 2, product: "Catering", client: "Corp 123", date: "2024-01-20", collaborator: "Ana García" }
    ],
    completed: [
      { id: 3, product: "Decoración", client: "Fundación XYZ", date: "2024-01-10", rating: 4.5 }
    ]
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">Nuevas</TabsTrigger>
          <TabsTrigger value="progress">En Ejecución</TabsTrigger>
          <TabsTrigger value="completed">Ejecutadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Nuevas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.new.map((req) => (
                  <div key={req.id} className="flex justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{req.product}</p>
                      <p className="text-sm text-muted-foreground">{req.client} • {req.date}</p>
                    </div>
                    <StatusPill status="new" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>En Ejecución</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.inProgress.map((req) => (
                  <div key={req.id} className="flex justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{req.product}</p>
                      <p className="text-sm text-muted-foreground">
                        {req.client} • Colaborador: {req.collaborator}
                      </p>
                    </div>
                    <StatusPill status="in_progress" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Ejecutadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.completed.map((req) => (
                  <div key={req.id} className="flex justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{req.product}</p>
                      <p className="text-sm text-muted-foreground">{req.client}</p>
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

export default Solicitudes;