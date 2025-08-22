import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSessionAndProfile, type SessionAndProfile } from '@/lib/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const [sessionData, setSessionData] = useState<SessionAndProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const data = await getSessionAndProfile();
      setSessionData(data);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-lg">Verificando autenticación...</div>
      </div>
    );
  }

  if (!sessionData?.session) {
    return <Navigate to="/aliados" replace />;
  }

  return <>{children}</>;
};