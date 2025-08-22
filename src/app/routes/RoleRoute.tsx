import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSessionAndProfile, mapRole, getRoleDashboardPath, type SessionAndProfile, type Role } from '@/lib/auth';

interface RoleRouteProps {
  children: React.ReactNode;
  allowed: Role[];
}

export const RoleRoute = ({ children, allowed }: RoleRouteProps) => {
  const [sessionData, setSessionData] = useState<SessionAndProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const data = await getSessionAndProfile();
      setSessionData(data);
      setLoading(false);
    };

    checkRole();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-lg">Verificando permisos...</div>
      </div>
    );
  }

  if (!sessionData?.session) {
    return <Navigate to="/aliados" replace />;
  }

  if (!sessionData.profile) {
    return <Navigate to="/dashboard" replace />;
  }

  const userRole = mapRole(sessionData.profile.role);
  
  if (!allowed.includes(userRole)) {
    const correctPath = getRoleDashboardPath(userRole);
    return <Navigate to={correctPath} replace />;
  }

  return <>{children}</>;
};