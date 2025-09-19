import { useMemo, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePackage, Product, Category } from "@/context/PackageContext";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/catalog/ProductCard";
import PackageSidebar from "@/components/catalog/PackageSidebar";
import QuoteModal from "@/components/catalog/QuoteModal";
import EditEventModal from "@/components/catalog/EditEventModal";
import { Loader2, AlertCircle, Edit, Package, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { getSpaceTypeLabel, getEventTypeLabel, getPlanLabel } from "@/constants/productTags";

const CATEGORIES: Category[] = [
  "Montaje Técnico",
  "Decoración/Ambientación", 
  "Catering",
  "Mixología/coctelería",
  "Arte/Cultura",
  "Audiovisuales",
  "Mobiliario",
];

interface Filters {
  espacio?: string;
  aforo?: number;
  evento?: string;
  plan?: string;
}

const Catalog = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>("Montaje Técnico");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const { addItem } = usePackage();

  // Applied filters (used for actual queries)
  const appliedFilters = useMemo<Filters>(() => ({
    espacio: params.get("espacio") || undefined,
    aforo: params.get("aforo") ? parseInt(params.get("aforo")!) : undefined,
    evento: params.get("evento") || undefined,
    plan: params.get("plan") || undefined,
  }), [params]);

  // Draft filters (used for editing)
  const [draftFilters, setDraftFilters] = useState<Filters>(appliedFilters);

  // Update draft filters when applied filters change
  useEffect(() => {
    setDraftFilters(appliedFilters);
  }, [appliedFilters]);

  const mode = showAllProducts ? 'all' : 'filtered';
  const { products, loading, error } = useProducts({
    ...appliedFilters,
    categoria: activeCategory
  }, mode);

  // SEO basic
  if (typeof document !== "undefined") document.title = "Catálogo de productos | EventCraft";

  const applyFilters = (newFilters: Filters) => {
    const newParams = new URLSearchParams();
    if (newFilters.espacio) newParams.set("espacio", newFilters.espacio);
    if (newFilters.aforo) newParams.set("aforo", newFilters.aforo.toString());
    if (newFilters.evento) newParams.set("evento", newFilters.evento);
    if (newFilters.plan) newParams.set("plan", newFilters.plan);
    
    setParams(newParams);
    setShowAllProducts(false);
    setEditEventOpen(false);
  };

  const hasActiveFilters = !!(appliedFilters.espacio || appliedFilters.evento || appliedFilters.plan || appliedFilters.aforo);

  // Products are already filtered by category in useProducts hook
  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Applied Filters Display */}
          {hasActiveFilters && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Filtros aplicados</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditEventOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar evento
                  </Button>
                </div>
                
                 <div className="flex flex-wrap gap-2">
                   {appliedFilters.espacio && (
                     <Badge variant="secondary">📍 {getSpaceTypeLabel(appliedFilters.espacio)}</Badge>
                   )}
                   {appliedFilters.evento && (
                     <Badge variant="secondary">🎉 {getEventTypeLabel(appliedFilters.evento)}</Badge>
                   )}
                   {appliedFilters.plan && (
                     <Badge variant="secondary">💎 {getPlanLabel(appliedFilters.plan)}</Badge>
                   )}
                   {appliedFilters.aforo && (
                     <Badge variant="secondary">👥 {appliedFilters.aforo} invitados</Badge>
                   )}
                 </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Catálogo</CardTitle>
                  <CardDescription>
                    {showAllProducts ? 
                      `Todos los productos de ${activeCategory}` :
                      hasActiveFilters ? 
                        "Productos filtrados según tu selección" : 
                        "Selecciona productos y arma tu paquete"
                    }
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio
                </Button>
              </div>
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
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {showAllProducts ? 
                            `No hay productos en ${cat}` : 
                            "No hay productos con estos filtros"
                          }
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {showAllProducts ? 
                            `Aún no hay productos registrados en la categoría "${cat}".` :
                            `No encontramos productos en "${cat}" que coincidan con tus filtros.`
                          }
                        </p>
                        <div className="flex gap-2 justify-center">
                          {!showAllProducts && (
                            <Button 
                              variant="outline" 
                              onClick={() => setShowAllProducts(true)}
                            >
                              Ver todos los productos
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            onClick={() => setEditEventOpen(true)}
                          >
                            Editar evento
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {showAllProducts && (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              Mostrando todos los productos ({filteredProducts.length})
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowAllProducts(false)}
                            >
                              Aplicar filtros
                            </Button>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {filteredProducts.map((p) => (
                            <ProductCard key={p.id} product={p} onAdd={() => addItem(p)} />
                          ))}
                        </div>
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
      <EditEventModal 
        open={editEventOpen} 
        onOpenChange={setEditEventOpen}
        filters={draftFilters}
        onFiltersChange={setDraftFilters}
        onApply={applyFilters}
      />
    </div>
  );
};

export default Catalog;
