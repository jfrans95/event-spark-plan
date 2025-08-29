import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, MapPin, Heart, ArrowRight } from "lucide-react";

const PREDEFINED_PACKAGES = [
  {
    id: 1,
    name: "Boda Romántica",
    type: "Social",
    plan: "Premium",
    guestCount: "80-120",
    venue: "Jardín al aire libre",
    price: 25000000,
    rating: 4.9,
    reviews: 45,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop",
    features: ["Coordinador premium", "Catering gourmet", "Decoración floral", "Fotografía profesional"],
    highlight: "Más Popular"
  },
  {
    id: 2,
    name: "Evento Corporativo",
    type: "Corporativo", 
    plan: "Pro",
    guestCount: "100-200",
    venue: "Salón de conferencias",
    price: 18000000,
    rating: 4.8,
    reviews: 32,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=250&fit=crop",
    features: ["Coordinador pro", "AV profesional", "Coffee breaks", "Networking setup"],
    highlight: null
  },
  {
    id: 3,
    name: "Quinceañera Elegante",
    type: "Social",
    plan: "Premium",
    guestCount: "60-100",
    venue: "Salón de eventos",
    price: 22000000,
    rating: 4.9,
    reviews: 28,
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=250&fit=crop",
    features: ["Coordinador premium", "DJ especializado", "Decoración temática", "Fotografía + video"],
    highlight: "Nuevo"
  },
  {
    id: 4,
    name: "Cóctel Networking",
    type: "Corporativo",
    plan: "Básico", 
    guestCount: "40-80",
    venue: "Terraza urbana",
    price: 12000000,
    rating: 4.7,
    reviews: 18,
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=250&fit=crop",
    features: ["Coordinador básico", "Coctelería", "Música ambiental", "Canapés"],
    highlight: null
  }
];

export const PackageCarousel = () => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0 
    }).format(price);
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Paquetes Prediseñados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestros paquetes más populares o úsalos como punto de partida para crear tu evento ideal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PREDEFINED_PACKAGES.map((pkg) => (
            <Card key={pkg.id} className="group hover:shadow-lg transition-all duration-300 border-2 rounded-2xl overflow-hidden">
              {pkg.highlight && (
                <div className="bg-accent text-accent-foreground text-xs font-medium px-3 py-1 text-center">
                  {pkg.highlight}
                </div>
              )}
              
              <div className="relative">
                <img 
                  src={pkg.image} 
                  alt={pkg.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Button size="icon" variant="secondary" className="rounded-full h-8 w-8">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{pkg.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {pkg.type}
                      </Badge>
                      <Badge 
                        variant={pkg.plan === "Premium" ? "default" : pkg.plan === "Pro" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {pkg.plan}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium">{pkg.rating}</span>
                  <span className="text-muted-foreground">({pkg.reviews})</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{pkg.guestCount} invitados</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{pkg.venue}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Incluye:</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {pkg.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                    {pkg.features.length > 3 && (
                      <li className="text-primary">+{pkg.features.length - 3} más</li>
                    )}
                  </ul>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground">Desde</span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(pkg.price)}
                    </span>
                  </div>
                  
                  <Button className="w-full group" size="sm" asChild>
                    <a href="/catalog">
                      Personalizar
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <a href="/catalog">
              Ver Todos los Paquetes
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};