import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ResendConfirmationButton = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email requerido",
        description: "Por favor ingresa tu email para reenviar la confirmación.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Try native Supabase resend first
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/user')}`
        }
      });

      if (resendError) {
        console.log('Native resend failed, trying fallback function:', resendError.message);
        
        // Fallback to custom Edge Function for better control
        const { data, error: functionError } = await supabase.functions.invoke('resend-confirmation-email', {
          body: { email }
        });

        if (functionError) {
          throw new Error(functionError.message);
        }

        toast({
          title: "Email de confirmación enviado",
          description: "Hemos reenviado el correo de confirmación usando nuestro sistema alternativo. Revisa tu bandeja de entrada y carpeta de spam.",
        });
      } else {
        toast({
          title: "Email de confirmación enviado",
          description: "Hemos reenviado el correo de confirmación. Revisa tu bandeja de entrada y carpeta de spam.",
        });
      }

      setShowForm(false);
      setEmail("");
    } catch (error: any) {
      console.error('Error resending confirmation:', error);
      toast({
        title: "Error al reenviar confirmación",
        description: error.message || "No se pudo reenviar el correo de confirmación. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="text-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowForm(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Mail className="w-4 h-4 mr-2" />
          ¿No recibiste el correo de confirmación?
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Reenviar confirmación
        </CardTitle>
        <CardDescription className="text-xs">
          Te enviaremos nuevamente el correo de confirmación
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleResendConfirmation} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="resend-email" className="text-xs">Email</Label>
            <Input
              id="resend-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              size="sm" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-3 h-3 mr-2" />
                  Enviar
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowForm(false);
                setEmail("");
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResendConfirmationButton;