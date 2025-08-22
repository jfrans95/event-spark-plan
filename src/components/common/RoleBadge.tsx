import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/roles";

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export const RoleBadge = ({ role, className }: RoleBadgeProps) => {
  const getRoleConfig = (role: Role) => {
    const configs = {
      administrator: { label: 'Administrador', variant: 'destructive' as const },
      advisor: { label: 'Asesor', variant: 'default' as const },
      collaborator: { label: 'Colaborador', variant: 'secondary' as const },
      provider: { label: 'Proveedor', variant: 'outline' as const }
    };
    
    return configs[role];
  };

  const config = getRoleConfig(role);

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  );
};