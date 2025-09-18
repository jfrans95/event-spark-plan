import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProductWithProvider {
  id: string;
  name: string;
  categoria: string;
  price: number;
  activo: boolean;
  created_at: string;
  provider_name: string;
  provider_id: string;
}

const CATEGORIES = [
  "montaje_tecnico",
  "decoracion_ambientacion", 
  "catering",
  "mixologia_cocteleria",
  "arte_cultura",
  "audiovisuales",
  "mobiliario"
];

const CATEGORY_DISPLAY = {
  "montaje_tecnico": "Montaje técnico",
  "decoracion_ambientacion": "Decoración/ambientación",
  "catering": "Catering", 
  "mixologia_cocteleria": "Mixología/coctelería",
  "arte_cultura": "Arte/cultura",
  "audiovisuales": "Audiovisuales",
  "mobiliario": "Mobiliario"
};

const InventarioGeneral = () => {
  const [products, setProducts] = useState<ProductWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          categoria,
          price,
          activo,
          created_at,
          provider_profiles!inner(
            id,
            provider_applications!inner(
              company_name
            )
          )
        `);

      if (error) throw error;

      const mappedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        categoria: product.categoria,
        price: Number(product.price),
        activo: product.activo,
        created_at: product.created_at,
        provider_name: product.provider_profiles.provider_applications.company_name,
        provider_id: product.provider_profiles.id
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error al cargar productos",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.provider_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.categoria === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && product.activo) ||
                         (statusFilter === "inactive" && !product.activo);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const activeCount = products.filter(p => p.activo).length;
  const inactiveCount = products.filter(p => !p.activo).length;
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.categoria === cat).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando inventario...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CATEGORIES.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventario Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por producto o proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_DISPLAY[cat as keyof typeof CATEGORY_DISPLAY]} ({categoryCounts[cat]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CATEGORY_DISPLAY[product.categoria as keyof typeof CATEGORY_DISPLAY]}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.provider_name}</TableCell>
                    <TableCell>${product.price.toLocaleString('es-CO')}</TableCell>
                    <TableCell>
                      <Badge variant={product.activo ? "default" : "secondary"}>
                        {product.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(product.created_at).toLocaleDateString('es-CO')}
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
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredProducts.length)} de {filteredProducts.length} productos
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

export default InventarioGeneral;