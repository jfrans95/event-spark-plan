import { PrivateLayout } from "./PrivateLayout";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { User, FileText, Package, Plus } from "lucide-react";

interface ProviderLayoutProps {
  children: React.ReactNode;
}

export const ProviderLayout = ({ children }: ProviderLayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { href: "/dashboard/proveedor", label: "Dashboard", icon: User },
    { href: "/dashboard/proveedor/perfil", label: "Perfil", icon: User },
    { href: "/dashboard/proveedor/solicitudes", label: "Solicitudes", icon: FileText },
    { href: "/dashboard/proveedor/inventario", label: "Inventario", icon: Package },
    { href: "/dashboard/proveedor/agregar-producto", label: "Agregar Producto", icon: Plus },
  ];

  return (
    <PrivateLayout title="Panel de Proveedor" subtitle="Gestiona tu negocio y productos">
      <div className="mb-6">
        <NavigationMenu>
          <NavigationMenuList className="flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavigationMenuItem key={item.href}>
                  <Link to={item.href}>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActive(item.href) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {children}
    </PrivateLayout>
  );
};