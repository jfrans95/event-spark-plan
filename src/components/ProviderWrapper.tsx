import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import ProviderStatus from "./ProviderStatus";
import ProviderDashboard from "@/pages/dashboard/provider/ProviderDashboard";

type ApplicationStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface Application {
  id: string;
  status: string;
  created_at: string;
  admin_observations?: string;
  company_name: string;
}

interface ProviderWrapperProps {
  children?: React.ReactNode;
}

const ProviderWrapper = ({ children }: ProviderWrapperProps) => {
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('none');
  const [application, setApplication] = useState<Application | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkProviderStatus();
  }, []);

  const checkProviderStatus = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting user:', userError);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Check if there's a provider application
      const { data: applicationData, error: applicationError } = await supabase
        .from('provider_applications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (applicationError) {
        if (applicationError.code === 'PGRST116') {
          // No application found
          setApplicationStatus('none');
        } else {
          console.error('Error checking application status:', applicationError);
          setApplicationStatus('none');
        }
      } else if (applicationData) {
        setApplication(applicationData);
        setApplicationStatus(applicationData.status as ApplicationStatus);
      }

    } catch (error) {
      console.error('Error:', error);
      setApplicationStatus('none');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmitted = () => {
    checkProviderStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Verificando estado del proveedor...</span>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error de autenticación</h2>
          <p className="text-muted-foreground">No se pudo verificar tu identidad.</p>
        </div>
      </div>
    );
  }

  // If application is approved, show the dashboard or children
  if (applicationStatus === 'approved') {
    return children || <ProviderDashboard />;
  }

  // For all other states (none, pending, rejected), redirect to appropriate page
  if (applicationStatus === 'none') {
    // No application, should redirect to registration page  
    window.location.href = '/proveedor/registro';
    return null;
  } else if (applicationStatus === 'pending') {
    // Application pending, should redirect to pending page
    window.location.href = '/proveedor/solicitud-enviada';
    return null;
  }

  // For rejected or other states, show ProviderStatus
  return (
    <ProviderStatus 
      userId={userId}
      onApplicationSubmitted={handleApplicationSubmitted}
    />
  );
};

export default ProviderWrapper;