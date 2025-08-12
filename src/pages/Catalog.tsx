import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { usePackage, Product, Category } from "@/context/PackageContext";
import ProductCard from "@/components/catalog/ProductCard";
import PackageSidebar from "@/components/catalog/PackageSidebar";
import QuoteModal from "@/components/catalog/QuoteModal";

const CATEGORIES: Category[] = [
  "Montaje técnico",
  "Decoración/ambientación",
  "Catering",
  "Mixología/coctelería",
  "Arte/cultura",
  "Audiovisuales",
  "Mobiliario",
];

// Demo dataset (mock)
const PRODUCTS: Product[] = [
  { id: "coord-1", name: "Coordinador de evento", description: "Coordinación integral del evento", price: 350000, category: "Montaje técnico", isCoordinator: true },
  { id: "mont-1", name: "Tarima básica", description: "Tarima 4x3m", price: 420000, category: "Montaje técnico" },
  { id: "deco-1", name: "Arco floral", description: "Arco con flores naturales", price: 280000, category: "Decoración/ambientación" },
  { id: "cat-1", name: "Catering estándar", description: "Menú 3 tiempos", price: 95000, category: "Catering" },
  { id: "mix-1", name: "Bar de cocteles", description: "Mixología clásica", price: 180000, category: "Mixología/coctelería" },
  { id: "art-1", name: "DJ set", description: "Música ambiente y baile", price: 400000, category: "Arte/cultura" },
  { id: "av-1", name: "Iluminación básica", description: "Luces LED", price: 220000, category: "Audiovisuales" },
  { id: "mob-1", name: "Sillas Tiffany", description: "Pack de 20", price: 160000, category: "Mobiliario" },
];

const Catalog = () => {
  const [params] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>("Montaje técnico");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { addItem } = usePackage();

  // SEO basic
  if (typeof document !== "undefined") document.title = "Catálogo de productos | EventCraft";

  const filteredProducts = useMemo(() => {
    // In a real case, filter PRODUCTS using params (spaceType, guestCount, eventType, plan)
    return PRODUCTS;
  }, [params]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Catálogo</CardTitle>
              <CardDescription>Selecciona productos y arma tu paquete</CardDescription>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredProducts
                        .filter((p) => p.category === cat)
                        .map((p) => (
                          <ProductCard key={p.id} product={p} onAdd={() => addItem(p)} />
                        ))}
                    </div>
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
