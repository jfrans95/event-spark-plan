import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Phone, Mail, Heart, MapPin, Clock } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-background border-t py-16">
      <div className="container mx-auto px-4">
        {/* Contact Advisor Section */}
        <div className="mb-12">
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-2 rounded-2xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold">¿Necesitas ayuda personalizada?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nuestros asesores especializados están listos para ayudarte a planificar el evento perfecto. 
                Contacta sin compromiso.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Chat con Asesor
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <Phone className="w-5 h-5" />
                  Llamar Ahora
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold">EventCraft</h4>
                <p className="text-xs text-muted-foreground">Diseña eventos únicos</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              La plataforma líder para planificar eventos memorables en Colombia. 
              Conectamos clientes con los mejores proveedores del país.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold">Servicios</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Planificación de Bodas</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Eventos Corporativos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Celebraciones Sociales</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Eventos Culturales</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Sobre Nosotros</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Únete como Proveedor</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Trabajar con Nosotros</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contacto</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+57 (1) 234-5678</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>hola@eventcraft.co</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Bogotá, Colombia</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Lun - Vie: 8:00 - 18:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 EventCraft. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};