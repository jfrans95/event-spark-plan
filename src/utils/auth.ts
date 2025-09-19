import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type Role = 'usuario' | 'administrator' | 'advisor' | 'collaborator' | 'provider';

export interface UserProfile {
  id: string;
  user_id: string;
  role: string;
  email: string;
  full_name?: string;
}

export interface SessionAndProfile {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
}

export const mapRole = (role: string): Role => {
  const roleMap: Record<string, Role> = {
    'admin': 'administrator',
    'administrator': 'administrator',
    'advisor': 'advisor',
    'asesor': 'advisor',
    'collaborator': 'collaborator',
    'colaborador': 'collaborator',
    'provider': 'provider',
    'proveedor': 'provider',
    'usuario': 'usuario'
  };
  
  return roleMap[role.toLowerCase()] || 'usuario';  // Default to 'usuario' instead of 'collaborator'
};

export const getSessionAndProfile = async (): Promise<SessionAndProfile> => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return { session: null, user: null, profile: null };
    }

    // Verify the user still exists in the database
    const { data: authUser, error: userError } = await supabase.auth.getUser();
    
    if (userError || !authUser.user) {
      // Invalid session, clear it
      await supabase.auth.signOut();
      return { session: null, user: null, profile: null };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // If user exists but no profile, clear session and let them re-register
      if (profileError.code === 'PGRST116') {
        await supabase.auth.signOut();
        return { session: null, user: null, profile: null };
      }
      return { session, user: session.user, profile: null };
    }

    return { session, user: session.user, profile };
  } catch (error) {
    console.error('Error in getSessionAndProfile:', error);
    // Clear invalid session
    await supabase.auth.signOut();
    return { session: null, user: null, profile: null };
  }
};

export const getRoleDashboardPath = (role: Role): string => {
  const paths: Record<Role, string> = {
    administrator: '/dashboard/admin',
    advisor: '/dashboard/asesor',
    collaborator: '/dashboard/colaborador',
    provider: '/dashboard/proveedor',
    usuario: '/user'  // Regular users go to /user
  };
  
  return paths[role] || '/user';  // Default to /user instead of /dashboard/colaborador
};