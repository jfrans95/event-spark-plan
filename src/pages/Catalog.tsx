import { useMemo, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { usePackage, Product, Category } from "@/context/PackageContext";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/catalog/ProductCard";
import PackageSidebar from "@/components/catalog/PackageSidebar";
import QuoteModal from "@/components/catalog/QuoteModal";
import FilterBar from "@/components/catalog/FilterBar";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CATEGORIES: Category[] = [
  "Montaje técnico",
  "Decoración/ambientación",
  "Catering",
  "Mixología/coctelería",
  "Arte/cultura",
  "Audiovisuales",
  "Mobiliario",
];

const Catalog = () => {
  const [params] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>("Montaje técnico");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { addItem } = usePackage();

  // Get filters from URL params
  const filters = useMemo(() => ({
    espacio: params.get("espacio") || undefined,
    aforo: params.get("aforo") ? parseInt(params.get("aforo")!) : undefined,
    evento: params.get("evento") || undefined,
    plan: params.get("plan") || undefined,
    categoria: activeCategory
  }), [params, activeCategory]);

  const { products, loading, error } = useProducts(filters);

  // SEO basic
  if (typeof document !== "undefined") document.title = "Catálogo de productos | EventCraft";

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <FilterBar />
          <Card>
            <CardHeader>
              <CardTitle>Catálogo</CardTitle>
              <CardDescription>
                {params.get("espacio") || params.get("evento") || params.get("plan") ? 
                  "Productos filtrados según tu selección" : 
                  "Selecciona productos y arma tu paquete"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as Category)}>
                <TabsList className="w-full flex flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {CATEGORIES.map((cat) => (
                  <TabsContent key={cat} value={cat} className="mt-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Cargando productos...</span>
                      </div>
                    ) : error ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Error al cargar productos: {error}
                        </AlertDescription>
                      </Alert>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No hay productos disponibles</h3>
                        <p className="text-muted-foreground mb-4">
                          No encontramos productos en la categoría "{cat}" que coincidan con tus filtros.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => window.location.href = '/catalog'}
                        >
                          Ver todos los productos
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredProducts.map((p) => (
                          <ProductCard key={p.id} product={p} onAdd={() => addItem(p)} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <PackageSidebar onQuote={() => setQuoteOpen(true)} />
        </div>
      </div>

      <QuoteModal open={quoteOpen} onOpenChange={setQuoteOpen} />
    </div>
  );
};

export default Catalog;
