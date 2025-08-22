import { PrivateLayout } from "./PrivateLayout";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { User, FileText, TrendingUp, XCircle } from "lucide-react";

interface AdvisorLayoutProps {
  children: React.ReactNode;
}

export const AdvisorLayout = ({ children }: AdvisorLayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <PrivateLayout title="Panel de Asesor" subtitle="Gestiona tus cotizaciones y clientes">
      <div className="mb-6">
        <NavigationMenu>
          <NavigationMenuList className="flex-wrap gap-2">
            <NavigationMenuItem>
              <Link to="/dashboard/asesor">
                <NavigationMenuLink
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                    isActive("/dashboard/asesor") && "bg-accent text-accent-foreground"
                  )}
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
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