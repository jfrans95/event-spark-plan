import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-events.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">Planificación Inteligente</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Planea tu
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  próximo evento
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-md">
                Diseña y cotiza eventos únicos en minutos. Desde bodas íntimas hasta conferencias corporativas, 
                tenemos todo lo que necesitas.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Cotización en tiempo real",
                "Paquetes personalizables",
                "Proveedores verificados",
                "Soporte especializado"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg"
              >
                Diseñar Evento
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button variant="outline" size="lg">
                Ver Paquetes Prediseñados
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Eventos realizados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Proveedores aliados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">4.9</div>
                <div className="text-sm text-muted-foreground">Calificación promedio</div>
              </div>
            </div>
          </div>

          {/* Right Content - Quick Filter Card */}
          <div className="lg:justify-self-end w-full max-w-md">
            <Card className="p-6 bg-background/95 backdrop-blur border-2 rounded-2xl shadow-xl">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Inicio Rápido</h3>
                <p className="text-sm text-muted-foreground">
                  Completa estos datos para ver opciones personalizadas
                </p>
                
                {/* Quick filters would go here - simplified for now */}
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    📍 Tipo de espacio
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    👥 Número de invitados
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    🎉 Tipo de evento
                  </Button>
                </div>
                
                <Button className="w-full mt-4">
                  Ver Opciones
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};