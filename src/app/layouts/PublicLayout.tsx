import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Users, MessageCircle, Phone, Mail, MapPin, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

export const PublicLayout = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatForm, setChatForm] = useState({
    whatsapp: "",
    consulta: ""
  });

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatForm.whatsapp.trim() || !chatForm.consulta.trim()) return;
    
    // Simular envío
    console.log("Chat enviado:", chatForm);
    setChatForm({ whatsapp: "", consulta: "" });
    setChatOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">EventCraft</h1>
                <p className="text-xs text-muted-foreground">Diseña eventos únicos</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link to="/catalogo" className="text-sm font-medium hover:text-primary transition-colors">
                Catálogo
              </Link>
            </nav>

            {/* Auth Button */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="hidden sm:flex">
                MVP v1.0
              </Badge>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link to="/aliados">
                  <Users className="w-4 h-4" />
                  Aliados
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          {/* CTA Section */}
          <div className="py-12 text-center border-b border-border">
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="text-2xl font-bold">¿Necesitas ayuda planificando tu evento?</h3>
              <p className="text-muted-foreground">
                Nuestros asesores especializados están listos para ayudarte a crear el evento perfecto
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Chatear con asesor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Contactar asesor</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleChatSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">WhatsApp</label>
                        <Input
                          placeholder="+57 300 123 4567"
                          value={chatForm.whatsapp}
                          onChange={(e) => setChatForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Consulta</label>
                        <Textarea
                          placeholder="Cuéntanos sobre tu evento..."
                          value={chatForm.consulta}
                          onChange={(e) => setChatForm(prev => ({ ...prev, consulta: e.target.value }))}
                          required
                          rows={3}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Enviar consulta
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>+57 (301) 234-5678</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Content */}
          <div className="py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">EventCraft</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Transformamos tus ideas en eventos inolvidables con la mejor tecnología y proveedores especializados.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Bogotá, Colombia</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Diseño de eventos</li>
                <li>Cotizaciones en tiempo real</li>
                <li>Gestión de proveedores</li>
                <li>Seguimiento de eventos</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Nosotros</li>
                <li>Aliados</li>
                <li>Testimonios</li>
                <li>Blog</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+57 (301) 234-5678</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>hola@eventcraft.co</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2024 EventCraft. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6 mt-4 sm:mt-0">
              <span>Términos</span>
              <span>Privacidad</span>
              <span>Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};