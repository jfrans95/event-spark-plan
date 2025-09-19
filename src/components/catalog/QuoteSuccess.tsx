import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Copy, ExternalLink, Mail, User, Lock, CheckCircle } from "lucide-react";

interface QuoteSuccessProps {
  quoteId: string;
  trackingCode: string;
  pdfUrl: string | null;
  email: string;
  total: number;
}

const QuoteSuccess = ({ quoteId, trackingCode, pdfUrl, email, total }: QuoteSuccessProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const navigate = useNavigate();

  const copyTrackingCode = () => {
    navigator.clipboard.writeText(trackingCode);
    toast({
      title: "Código copiado",
      description: "El código de seguimiento se copió al portapapeles"
    });
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error", 
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingAccount(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/user`
        }
      });

      if (error) {
        console.error("Sign up error:", error);
        toast({
          title: "Error al crear cuenta",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setAccountCreated(true);
      toast({
        title: "¡Cuenta creada!",
        description: "Revisa tu correo para confirmar tu cuenta. Después podrás ver todas tus cotizaciones.",
      });
    } catch (error: any) {
      console.error("Account creation error:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la cuenta. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quote Success Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            ¡Cotización enviada exitosamente!
          </CardTitle>
          <CardDescription className="text-green-700">
            Cotización #{quoteId.slice(0, 8)} por ${total.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-green-800">
                Código de seguimiento
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">
                  {trackingCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyTrackingCode}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-green-800">
                Acciones
              </Label>
              <div className="flex gap-2 mt-1">
                {pdfUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(pdfUrl, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver PDF
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/tracking/${trackingCode}`)}
                >
                  Seguimiento
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Creation Card */}
      {!accountCreated ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Crea tu cuenta para gestionar tus cotizaciones
            </CardTitle>
            <CardDescription>
              Guarda todas tus cotizaciones en un solo lugar y haz seguimiento fácilmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tu email se usará para asignar esta cotización a tu cuenta
                </p>
              </div>
              
              <div>
                <Label htmlFor="signup-password">Contraseña</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu contraseña"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCreatingAccount}
              >
                {isCreatingAccount ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Crear mi cuenta
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                ¡Revisa tu correo!
              </h3>
              <p className="text-blue-700 mb-4">
                Te enviamos un enlace de confirmación a <strong>{email}</strong>
              </p>
              <p className="text-sm text-blue-600">
                Una vez confirmes tu cuenta, podrás ver todas tus cotizaciones en tu panel personal.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuoteSuccess;