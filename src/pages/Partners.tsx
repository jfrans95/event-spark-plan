import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, MapPin, Phone, Mail, ExternalLink } from "lucide-react";

const Partners = () => {
  const partners = [
    {
      id: 1,
      name: "Catering Gourmet Elite",
      category: "Catering",
      rating: 4.9,
      location: "Bogotá, Colombia",
      phone: "+57 300 123 4567",
      email: "info@gourmetelite.com",
      description: "Servicio de catering premium con más de 15 años de experiencia en eventos corporativos y sociales.",
      specialties: ["Cocina Internacional", "Eventos Corporativos", "Servicio Premium"],
      verified: true
    },
    {
      id: 2,
      name: "Sonido & Luces Pro",
      category: "Audiovisuales",
      rating: 4.8,
      location: "Medellín, Colombia", 
      phone: "+57 310 987 6543",
      email: "contacto@sonidolucespro.com",
      description: "Especialistas en montaje técnico audiovisual para todo tipo de eventos y producciones.",
      specialties: ["Sonido Profesional", "Iluminación LED", "Pantallas Gigantes"],
      verified: true
    },
    {
      id: 3,
      name: "Flores & Decoración Bella",
      category: "Decoración",
      rating: 4.7,
      location: "Cali, Colombia",
      phone: "+57 320 456 7890", 
      email: "hello@floresbella.com",
      description: "Creamos ambientes únicos con decoración floral y temática personalizada para cada ocasión.",
      specialties: ["Decoración Floral", "Ambientación Temática", "Bodas & XV Años"],
      verified: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Nuestros Aliados</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conectamos con los mejores proveedores para hacer realidad eventos extraordinarios. 
            Cada aliado está verificado y comprometido con la excelencia.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">150+</div>
              <p className="text-muted-foreground">Aliados Verificados</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">8</div>
              <p className="text-muted-foreground">Categorías de Servicio</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">4.8</div>
              <p className="text-muted-foreground">Calificación Promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Partners Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Aliados Destacados</h2>
            <Button variant="outline">Ver Todos los Aliados</Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {partner.name}
                        {partner.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verificado
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Badge variant="outline">{partner.category}</Badge>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{partner.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {partner.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {partner.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{partner.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{partner.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{partner.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Perfil
                    </Button>
                    <Button size="sm" className="flex-1 gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Contactar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 py-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">¿Quieres ser nuestro aliado?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Únete a nuestra red de proveedores y haz parte de eventos extraordinarios
          </p>
          <Button size="lg" className="gap-2">
            <Users className="w-5 h-5" />
            Aplicar como Aliado
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Partners;