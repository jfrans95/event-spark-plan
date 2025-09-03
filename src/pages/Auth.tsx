import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, LogIn, UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import ProviderStatus from "@/components/ProviderStatus";

type UserRole = 'administrator' | 'collaborator' | 'provider' | 'usuario';

const Auth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [pendingProviderUser, setPendingProviderUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Check if user is already authenticated when component mounts
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('User already authenticated, showing notification and redirecting...');
        toast({
          title: "Ya tienes sesión activa",
          description: "Redirigiendo al dashboard...",
        });
        
        // Wait a moment so user can see the message
        setTimeout(async () => {
          await handleUserRedirection(session.user);
        }, 1500);
        return;
      }
      
      // No existing session, user can proceed with login
      setLoading(false);
    };
    
    // Start with loading true to prevent showing login form immediately
    setLoading(true);
    checkExistingSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserRedirection(session.user);
        } else if (event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Helper function to handle user redirection based on role
  const handleUserRedirection = async (user: any) => {
    // Add a small delay to prevent flickering
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role) {
        // For providers, check their application status
        if (profile.role === 'provider') {
          const { data: application } = await supabase
            .from('provider_applications')
            .select('status')
            .eq('user_id', user.id)
            .single();

          if (!application) {
            // No application, redirect to registration
            navigate('/proveedor/registro');
            return;
          } else if (application.status === 'pending') {
            // Application pending, show pending page
            navigate('/proveedor/solicitud-enviada');
            return;
          } else if (application.status === 'approved') {
            // Approved, go to dashboard
            navigate('/dashboard/proveedor');
            return;
          } else {
            // Rejected, back to registration
            navigate('/proveedor/registro');
            return;
          }
        } else if (profile.role === 'collaborator' && user.user_metadata?.role === 'usuario') {
          // Users registered as 'usuario' but mapped to 'collaborator' role
          navigate('/user');
        } else {
          // Other roles, redirect to appropriate dashboard
          const roleRoutes = {
            administrator: '/dashboard/admin',
            admin: '/dashboard/admin',
            advisor: '/dashboard/asesor', 
            asesor: '/dashboard/asesor',
            collaborator: '/dashboard/colaborador',
            colaborador: '/dashboard/colaborador'
          };
          
          const targetRoute = roleRoutes[profile.role as keyof typeof roleRoutes] || '/dashboard';
          navigate(targetRoute);
        }
        
        toast({
          title: "Bienvenido",
          description: "Has iniciado sesión correctamente",
        });
      } else {
        // Fallback to general dashboard
        navigate("/dashboard");
        toast({
          title: "Bienvenido", 
          description: "Has iniciado sesión correctamente",
        });
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      navigate("/dashboard");
    }
  };

  const handleSignIn = async (formData: FormData) => {
    setLoading(true);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Error de autenticación",
            description: "Credenciales incorrectas. Verifica tu email y contraseña.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (formData: FormData) => {
    setLoading(true);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as UserRole;

    try {
      // First check if user already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (existingUser.user) {
        // User exists and password is correct, redirect them
        toast({
          title: "Usuario ya registrado",
          description: "Ya tienes una cuenta activa. Te redirigiremos a tu dashboard.",
        });
        return;
      }
    } catch (authError: any) {
      // If sign in fails, continue with signup process
      console.log('User does not exist or password incorrect, proceeding with signup');
    }

    try {
      // Set redirect URL based on role
      const redirectUrl = role === 'usuario' 
        ? `${window.location.origin}/user`
        : `${window.location.origin}/proveedor/registro`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          // User exists but hasn't confirmed email
          toast({
            title: "Email ya registrado",
            description: "Ya existe una cuenta con este email. Si no has confirmado tu email, revisa tu bandeja de entrada.",
            variant: "destructive",
          });
          
          // Try to resend confirmation
          try {
            await supabase.auth.resend({
              type: 'signup',
              email: email,
              options: {
                emailRedirectTo: redirectUrl
              }
            });
            
            toast({
              title: "Email de confirmación reenviado",
              description: "Hemos reenviado el correo de confirmación. Revisa tu bandeja de entrada y carpeta de spam.",
            });
          } catch (resendError) {
            console.error('Resend error:', resendError);
          }
        } else if (error.message.includes('Email rate limit exceeded')) {
          toast({
            title: "Límite de emails excedido",
            description: "Has solicitado demasiados emails. Espera unos minutos antes de intentar nuevamente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        if (data.user && !data.session) {
          // Usuario creado pero necesita confirmar email
          toast({
            title: "¡Registro exitoso!",
            description: "Te hemos enviado un correo de confirmación. Revisa tu bandeja de entrada y carpeta de spam. El enlace expira en 24 horas.",
          });
          setAuthMode('signin');
        } else if (data.user && data.session) {
          // Usuario creado y autenticado directamente
          toast({
            title: "Cuenta creada exitosamente",
            description: "Tu cuenta ha sido creada y activada correctamente.",
          });
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  // If user is loading or already authenticated, show loading screen
  if (loading || session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-lg">
            {session ? 'Ya tienes sesión activa, redirigiendo...' : 'Verificando autenticación...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">EventCraft</h1>
            <p className="text-sm text-muted-foreground">Acceso para aliados</p>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Acceso al Sistema</CardTitle>
            <CardDescription>
              Inicia sesión o regístrate como aliado de EventCraft
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSignIn(formData);
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Contraseña</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Iniciar Sesión
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSignUp(formData);
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nombre completo</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Tu nombre completo"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Tipo de aliado</Label>
                    <Select name="role" required disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu rol" />
                      </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usuario">Usuario</SelectItem>
                          <SelectItem value="collaborator">Colaborador</SelectItem>
                          <SelectItem value="provider">Proveedor</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Registrarse
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;