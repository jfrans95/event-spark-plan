import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">EventCraft</h1>
              <p className="text-xs text-muted-foreground">Diseña eventos únicos</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#inicio" className="text-sm font-medium hover:text-primary transition-colors">
              Inicio
            </a>
            <a href="#paquetes" className="text-sm font-medium hover:text-primary transition-colors">
              Paquetes
            </a>
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
  );
};