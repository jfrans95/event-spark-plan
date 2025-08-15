import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, ArrowRight, Star, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFiltrosStore } from "@/stores/filtrosStore";
import { TipoEspacioFilter } from "@/features/filters/TipoEspacioFilter";
import { CapacidadFilter } from "@/features/filters/CapacidadFilter";
import { TipoEventoFilter } from "@/features/filters/TipoEventoFilter";
import { PlanFilter } from "@/features/filters/PlanFilter";
import heroImage from "@/assets/hero-events.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { filters } = useFiltrosStore();

  const handlePlanearEvento = () => {
    navigate('/catalogo');
  };

  const isFormComplete = () => {
    return filters.tipoEspacio && filters.tipoEvento && filters.plan && filters.capacidad;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Content */}
            <div className="text-white space-y-6">
              <Badge variant="secondary" className="w-fit">
                <Sparkles className="w-4 h-4 mr-2" />
                Smart Planning
              </Badge>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Planifica tu próximo{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    evento
                  </span>
                </h1>
                <p className="text-lg text-white/90 max-w-lg">
                  Diseña y cotiza eventos únicos con nuestra plataforma inteligente. 
                  Conectamos con los mejores proveedores para hacer realidad tu visión.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {[
                  "Cotizaciones en tiempo real",
                  "Paquetes personalizables",
                  "Red de proveedores verificados",
                  "Seguimiento completo del evento"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                  onClick={handlePlanearEvento}
                >
                  Diseñar Evento
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                  Ver Paquetes Prediseñados
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-white/70">Eventos realizados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">150+</div>
                  <div className="text-sm text-white/70">Proveedores aliados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.9</div>
                  <div className="text-sm text-white/70">Calificación promedio</div>
                </div>
              </div>
            </div>

            {/* Right Column - Event Designer */}
            <div className="lg:max-w-md mx-auto w-full">
              <Card className="p-6 bg-background/95 backdrop-blur border-2 rounded-2xl shadow-2xl">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      Diseñador de Eventos
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Personaliza tu evento en 4 simples pasos
                    </p>
                  </div>

                  <div className="space-y-6">
                    <TipoEspacioFilter />
                    <CapacidadFilter />
                    <TipoEventoFilter />
                    <PlanFilter />
                  </div>

                  <Button 
                    onClick={handlePlanearEvento}
                    className={`w-full ${
                      isFormComplete() 
                        ? "bg-gradient-to-r from-primary to-accent hover:opacity-90" 
                        : "bg-muted text-muted-foreground"
                    } transition-all`}
                    size="lg"
                    disabled={!isFormComplete()}
                  >
                    {isFormComplete() ? "Planear Mi Evento" : "Completa los filtros"}
                    {isFormComplete() && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>

                  {isFormComplete() && (
                    <div className="text-center text-xs text-muted-foreground">
                      ✓ Filtros completos - Listo para continuar
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Planificación Inteligente</h3>
              <p className="text-muted-foreground">
                Algoritmos avanzados que optimizan tu presupuesto y tiempo
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Red de Expertos</h3>
              <p className="text-muted-foreground">
                Proveedores verificados y calificados por nuestra comunidad
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Experiencia Premium</h3>
              <p className="text-muted-foreground">
                Atención personalizada desde la idea hasta la ejecución
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
