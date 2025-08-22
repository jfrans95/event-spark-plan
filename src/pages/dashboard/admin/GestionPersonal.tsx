import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/common/StatusPill";
import { RoleBadge } from "@/components/common/RoleBadge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, UserPlus, UserX, UserCheck } from "lucide-react";

const GestionPersonal = () => {
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  // Mock data
  const providerApplications = [
    {
      id: 1,
      companyName: "Eventos Premium",
      contactName: "Juan Pérez",
      email: "juan@eventospremium.com",
      phone: "301-555-0123",
      category: "Catering",
      status: "pending",
      submittedDate: "2024-01-10"
    },
    {
      id: 2,
      companyName: "Sonido Pro",
      contactName: "María García",
      email: "maria@sonidopro.com",
      phone: "302-555-0456",
      category: "Audiovisuales",
      status: "pending",
      submittedDate: "2024-01-12"
    }
  ];

  const profiles = [
    {
      id: 1,
      name: "Ana Martínez",
      email: "ana.martinez@company.com",
      role: "advisor",
      status: "active",
      createdDate: "2023-12-01"
    },
    {
      id: 2,
      name: "Carlos López",
      email: "carlos.lopez@company.com",
      role: "collaborator",
      status: "active",
      createdDate: "2023-11-15"
    },
    {
      id: 3,
      name: "Laura Rodríguez",
      email: "laura.rodriguez@company.com",
      role: "provider",
      status: "suspended",
      createdDate: "2023-10-20"
    }
  ];

  const handleApproveApplication = (application: any) => {
    toast({
      title: "Solicitud Aprobada",
      description: `${application.companyName} ha sido aprobado como proveedor.`,
    });
    setSelectedApplication(null);
  };

  const handleRejectApplication = (application: any) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Debe proporcionar un motivo de rechazo.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Solicitud Rechazada",
      description: `${application.companyName} ha sido rechazado.`,
    });
    setSelectedApplication(null);
    setRejectionReason("");
  };

  const handleToggleProfileStatus = (profile: any) => {
    if (!suspensionReason.trim() && profile.status === "active") {
      toast({
        title: "Error",
        description: "Debe proporcionar una justificación para suspender al usuario.",
        variant: "destructive",
      });
      return;
    }

    const newStatus = profile.status === "active" ? "suspended" : "active";
    const action = newStatus === "suspended" ? "suspendido" : "habilitado";
    
    toast({
      title: `Usuario ${action}`,
      description: `${profile.name} ha sido ${action}.`,
    });
    setSelectedProfile(null);
    setSuspensionReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestión de Personal</h2>
        <p className="text-muted-foreground">
          Administra solicitudes de alianza y cuentas de usuarios
        </p>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Solicitudes de Alianza</TabsTrigger>
          <TabsTrigger value="accounts">Gestión de Cuentas</TabsTrigger>
          <TabsTrigger value="create">Crear Perfiles</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Proveedores</CardTitle>
              <CardDescription>
                Revisa y aprueba nuevas solicitudes de alianza
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{app.companyName}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.contactName} • {app.category} • {app.submittedDate}
                      </p>
                      <p className="text-sm text-muted-foreground">{app.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveApplication(app)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aceptar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cuentas de Usuario</CardTitle>
              <CardDescription>
                Gestiona el estado de las cuentas de usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.name}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={profile.role as any} />
                      </TableCell>
                      <TableCell>
                        <StatusPill status={profile.status === "active" ? "done" : "suspended"} />
                      </TableCell>
                      <TableCell>{profile.createdDate}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={profile.status === "active" ? "destructive" : "default"}
                          onClick={() => setSelectedProfile(profile)}
                        >
                          {profile.status === "active" ? (
                            <>
                              <UserX className="w-4 h-4 mr-1" />
                              Suspender
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Habilitar
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Perfil</CardTitle>
              <CardDescription>
                Registra manualmente nuevos asesores y administradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" placeholder="Ingresa el nombre" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" placeholder="Ingresa el apellido" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula</Label>
                  <Input id="cedula" placeholder="Número de cédula" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Celular</Label>
                  <Input id="phone" placeholder="Número de teléfono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Edad</Label>
                  <Input id="age" type="number" placeholder="Edad" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input id="city" placeholder="Ciudad de residencia" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="correo@ejemplo.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" placeholder="Contraseña temporal" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="resume">Hoja de Vida</Label>
                  <Input id="resume" type="file" accept=".pdf,.doc,.docx" />
                </div>
              </div>
              <div className="mt-6">
                <Button className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Registrar Nuevo Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud</DialogTitle>
            <DialogDescription>
              Proporciona un motivo para rechazar la solicitud de {selectedApplication?.companyName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Motivo del rechazo (requerido)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApplication(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleRejectApplication(selectedApplication)}
            >
              Confirmar Rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspension Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProfile?.status === "active" ? "Suspender" : "Habilitar"} Usuario
            </DialogTitle>
            <DialogDescription>
              {selectedProfile?.status === "active" 
                ? `Proporciona una justificación para suspender a ${selectedProfile?.name}`
                : `¿Estás seguro de que deseas habilitar a ${selectedProfile?.name}?`
              }
            </DialogDescription>
          </DialogHeader>
          {selectedProfile?.status === "active" && (
            <div className="space-y-4">
              <Textarea
                placeholder="Justificación de la suspensión (requerido)"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProfile(null)}>
              Cancelar
            </Button>
            <Button 
              variant={selectedProfile?.status === "active" ? "destructive" : "default"}
              onClick={() => handleToggleProfileStatus(selectedProfile)}
            >
              {selectedProfile?.status === "active" ? "Suspender" : "Habilitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GestionPersonal;