import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { RoleBadge } from "@/components/common/RoleBadge";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  provider_info?: {
    company_name: string;
    status: string;
    reviewed_at: string | null;
  };
}

const GestionPersonal = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Fetch provider applications for providers
      const { data: providerApps, error: providerError } = await supabase
        .from('provider_applications')
        .select(`
          user_id,
          company_name,
          status,
          reviewed_at
        `);

      if (providerError) throw providerError;

      // Combine data
      const mappedUsers = profiles.map(profile => {
        const providerInfo = providerApps.find(app => app.user_id === profile.id);
        
        return {
          id: profile.id,
          full_name: profile.full_name || 'Sin nombre',
          email: profile.email,
          role: profile.role,
          created_at: profile.created_at,
          provider_info: providerInfo ? {
            company_name: providerInfo.company_name,
            status: providerInfo.status,
            reviewed_at: providerInfo.reviewed_at
          } : undefined
        };
      });

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error al cargar personal",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.provider_info?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "approved" && user.provider_info?.status === "approved") ||
                         (statusFilter === "pending" && user.provider_info?.status === "pending") ||
                         (statusFilter === "rejected" && user.provider_info?.status === "rejected") ||
                         (statusFilter === "no_application" && !user.provider_info);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Calculate stats
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const providerStats = users.filter(u => u.role === 'provider').reduce((acc, user) => {
    if (user.provider_info) {
      acc[user.provider_info.status] = (acc[user.provider_info.status] || 0) + 1;
    } else {
      acc['no_application'] = (acc['no_application'] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando personal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCounts.provider || 0}</div>
            <p className="text-xs text-muted-foreground">
              {providerStats.approved || 0} aprobados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCounts.collaborator || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Asesores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCounts.advisor || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestión de Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="administrator">Admin ({roleCounts.administrator || 0})</SelectItem>
                <SelectItem value="advisor">Asesor ({roleCounts.advisor || 0})</SelectItem>
                <SelectItem value="collaborator">Colaborador ({roleCounts.collaborator || 0})</SelectItem>
                <SelectItem value="provider">Proveedor ({roleCounts.provider || 0})</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
                <SelectItem value="no_application">Sin aplicación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Empresa/Estado</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role as any} />
                    </TableCell>
                    <TableCell>
                      {user.provider_info ? (
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{user.provider_info.company_name}</div>
                          <Badge 
                            variant={user.provider_info.status === 'approved' ? 'default' : 
                                   user.provider_info.status === 'pending' ? 'secondary' : 'destructive'}
                          >
                            {user.provider_info.status === 'approved' ? 'Aprobado' :
                             user.provider_info.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('es-CO')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GestionPersonal;