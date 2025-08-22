import { PrivateLayout } from "./PrivateLayout";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar, Clock, CheckCircle } from "lucide-react";

interface CollaboratorLayoutProps {
  children: React.ReactNode;
}

export const CollaboratorLayout = ({ children }: CollaboratorLayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <PrivateLayout title="Panel de Colaborador" subtitle="Gestiona los eventos asignados">
      <div className="mb-6">
        <NavigationMenu>
          <NavigationMenuList className="flex-wrap gap-2">
            <NavigationMenuItem>
              <Link to="/dashboard/colaborador">
                <NavigationMenuLink
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                    isActive("/dashboard/colaborador") && "bg-accent text-accent-foreground"
                  )}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Cronograma
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {children}
    </PrivateLayout>
  );
};