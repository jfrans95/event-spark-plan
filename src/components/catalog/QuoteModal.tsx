import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePackage } from "@/context/PackageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuoteModal = ({ open, onOpenChange }: Props) => {
  const { items, total, clear } = usePackage();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [needsRegistration, setNeedsRegistration] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setIsLoggedIn(true);
      setUserEmail(session.user.email || "");
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const whatsapp = formData.get("whatsapp") as string;

    if (!email || !whatsapp) {
      toast({ title: "Datos incompletos", description: "Email y WhatsApp son obligatorios", variant: "destructive" });
      return;
    }

    if (!formData.get("consent")) {
      toast({ title: "Consentimiento requerido", description: "Debes aceptar recibir contacto por WhatsApp", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // If user is not logged in and wants to register
      if (!isLoggedIn && needsRegistration && name && password) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/user`,
            data: {
              full_name: name,
              role: 'usuario'
            }
          }
        });

        if (signUpError) {
          console.error('Signup error:', signUpError);
          // Handle specific signup errors
          if (signUpError.message?.includes('already registered')) {
            toast({ 
              title: "Email ya registrado", 
              description: "Este email ya está registrado. Revisa tu bandeja para el correo de confirmación o intenta iniciar sesión.", 
              variant: "destructive" 
            });
          } else if (signUpError.message?.includes('rate limit')) {
            toast({ 
              title: "Límite de intentos excedido", 
              description: "Espera unos minutos antes de intentar de nuevo.", 
              variant: "destructive" 
            });
          } else {
            toast({ 
              title: "Error de registro", 
              description: `No se pudo crear la cuenta: ${signUpError.message}`, 
              variant: "destructive" 
            });
          }
          return;
        }

        toast({ 
          title: "¡Registro exitoso!", 
          description: "Te hemos enviado un email de confirmación personalizado. Procederemos con tu cotización." 
        });
      }

      // Create the quote
      const payload = {
        contact: {
          name: name || "",
          email,
          whatsapp,
        },
        event: {
          date: formData.get("date") as string,
          time: formData.get("time") as string,
          location: formData.get("location") as string,
        },
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
        total,
      };

      const { data, error } = await supabase.functions.invoke("quotes-create", {
        body: payload,
      });

      if (error) {
        console.error('Quote creation error:', error);
        const errorMessage = error.message || 'Error desconocido al crear la cotización';
        toast({ 
          title: "Error al procesar cotización", 
          description: errorMessage, 
          variant: "destructive" 
        });
        return;
      }

      console.log('Quote creation response:', data);

      // Check if quote was created successfully
      if (data?.quoteId) {
        toast({ 
          title: "¡Cotización creada exitosamente!", 
          description: `Tu cotización ${data.quoteId.substring(0, 8).toUpperCase()} ha sido enviada a ${email}. Si no recibes el correo en unos minutos, revisa tu carpeta de spam.` 
        });
      } else {
        toast({
          title: "Cotización procesada",
          description: "Tu cotización fue creada pero puede haber un problema con el envío del email. Te contactaremos por WhatsApp.",
          variant: "destructive"
        });
      }
      
      clear();
      onOpenChange(false);
      
      // If user just registered, redirect to profile after a moment
      if (!isLoggedIn && needsRegistration) {
        setTimeout(() => {
          window.location.href = '/user';
        }, 2000);
      }

    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo procesar la solicitud", variant: "destructive" });
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalles para la cotización</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          {/* Datos del evento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="date">Fecha del evento</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="time">Hora del evento</Label>
              <Input id="time" name="time" type="time" required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="location">Lugar del evento</Label>
            <Input id="location" name="location" placeholder="Dirección o lugar del evento" required />
          </div>

          <Separator />

          {/* Datos de contacto */}
          {!isLoggedIn && (
            <>
              <div className="space-y-3">
                <h4 className="font-medium">Datos de contacto</h4>
                <div className="space-y-1">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" name="name" placeholder="Tu nombre completo" required={needsRegistration} />
                </div>
              </div>
              
              {needsRegistration && (
                <div className="space-y-1">
                  <Label htmlFor="password">Contraseña (para crear tu cuenta)</Label>
                  <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required 
                disabled={isLoggedIn}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" name="whatsapp" type="tel" placeholder="Número de WhatsApp" required />
            </div>
          </div>

          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" name="consent" /> 
            Acepto ser contactado por WhatsApp para coordinar mi evento
          </label>

          {!isLoggedIn && (
            <div className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                id="register" 
                checked={needsRegistration}
                onChange={(e) => setNeedsRegistration(e.target.checked)}
              />
              <label htmlFor="register">Quiero crear una cuenta para gestionar mis eventos</label>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Procesando…" : 
             isLoggedIn ? "Enviar cotización" :
             needsRegistration ? "Registrarme y enviar cotización" : "Enviar cotización"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteModal;
