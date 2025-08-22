import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = 'new' | 'in_progress' | 'done' | 'suspended' | 'pending' | 'approved' | 'declined';

interface StatusPillProps {
  status: Status;
  className?: string;
}

export const StatusPill = ({ status, className }: StatusPillProps) => {
  const getStatusConfig = (status: Status) => {
    const configs = {
      new: { label: 'Nuevo', variant: 'default' as const },
      in_progress: { label: 'En Progreso', variant: 'secondary' as const },
      done: { label: 'Completado', variant: 'default' as const },
      suspended: { label: 'Suspendido', variant: 'destructive' as const },
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      approved: { label: 'Aprobado', variant: 'default' as const },
      declined: { label: 'Rechazado', variant: 'destructive' as const }
    };
    
    return configs[status] || { label: status, variant: 'outline' as const };
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  );
};