import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, MessageSquare, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const InventarioGeneral = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [comment, setComment] = useState("");

  // Mock data
  const products = [
    {
      id: 1,
      name: "Mesa redonda premium",
      provider: "Mobiliario Elegante",
      category: "Mobiliario",
      price: 50000,
      description: "Mesa redonda para 8 personas",
      images: ["image1.jpg"],
      tags: ["interior", "8-personas", "corporativo"],
      comments: ["Excelente calidad", "Muy resistente"]
    },
    {
      id: 2,
      name: "Sistema de sonido profesional",
      provider: "Sonido Pro",
      category: "Audiovisuales",
      price: 300000,
      description: "Sistema completo con micrófonos y amplificadores",
      images: ["image2.jpg"],
      tags: ["exterior", "gran-evento", "conferencia"],
      comments: []
    },
    {
      id: 3,
      name: "Servicio de catering gourmet",
      provider: "Delicias Premium",
      category: "Catering",
      price: 45000,
      description: "Menú completo para eventos corporativos",
      images: ["image3.jpg"],
      tags: ["interior", "corporativo", "completo"],
      comments: ["Muy sabroso", "Presentación impecable"]
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddComment = () => {
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Debe escribir un comentario.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Comentario Agregado",
      description: `Comentario añadido al producto ${selectedProduct.name}`,
    });
    setSelectedProduct(null);
    setComment("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Inventario General</h2>
        <p className="text-muted-foreground">
          Vista completa de todos los productos y servicios disponibles
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos, proveedores o categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>
                    {product.provider} • {product.category}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  ${product.price.toLocaleString('es-CO')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Comments indicator */}
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4" />
                <span>{product.comments.length} comentarios</span>
              </div>

              {/* Comments preview */}
              {product.comments.length > 0 && (
                <div className="space-y-1">
                  {product.comments.slice(0, 2).map((comment, index) => (
                    <div key={index} className="text-xs p-2 bg-muted rounded">
                      "{comment}"
                    </div>
                  ))}
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedProduct(product)}
                className="w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Agregar Comentario
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No se encontraron productos que coincidan con tu búsqueda.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Comment Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Comentario</DialogTitle>
            <DialogDescription>
              Añade un comentario al producto "{selectedProduct?.name}" de {selectedProduct?.provider}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Escribe tu comentario sobre este producto..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAddComment}>
              Agregar Comentario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventarioGeneral;