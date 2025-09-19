import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePackage } from "@/context/PackageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import QuoteSuccess from "./QuoteSuccess";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuoteModal = ({ open, onOpenChange }: Props) => {
  const { items, total, clear } = usePackage();
  const [loading, setLoading] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState<{
    quoteId: string;
    trackingCode: string;
    pdfUrl: string | null;
    email: string;
    total: number;
  } | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Build payload matching the new structure
    const payload = {
      contact: {
        email: formData.get("email") as string,
        whatsapp: formData.get("whatsapp") as string,
        consentWhatsApp: formData.get("consent") === "on",
      },
      event: {
        date: formData.get("date") as string,
        time: formData.get("time") as string,
        location: formData.get("location") as string,
      },
      items: items.map((i) => ({ 
        id: i.product.id, 
        name: i.product.name, 
        qty: i.quantity, 
        price: i.product.price 
      })),
      total,
    };

    // Enhanced validation
    if (!payload.contact.email || !payload.contact.whatsapp) {
      toast({ 
        title: "Datos incompletos", 
        description: "Email y WhatsApp son obligatorios", 
        variant: "destructive" 
      });
      return;
    }

    if (!payload.contact.consentWhatsApp) {
      toast({ 
        title: "Consentimiento requerido", 
        description: "Debes aceptar recibir contacto por WhatsApp", 
        variant: "destructive" 
      });
      return;
    }

    if (!payload.items.length) {
      toast({ 
        title: "Sin productos", 
        description: "Agrega al menos un producto para cotizar", 
        variant: "destructive" 
      });
      return;
    }

    // Validate items
    for (const item of payload.items) {
      if (item.qty < 1 || item.price <= 0) {
        toast({ 
          title: "Error en productos", 
          description: "Todos los productos deben tener cantidad y precio válidos", 
          variant: "destructive" 
        });
        return;
      }
    }

    if (payload.total <= 0) {
      toast({ 
        title: "Total inválido", 
        description: "El total debe ser mayor a cero", 
        variant: "destructive" 
      });
      return;
    }

    console.log("=== CREATING QUOTE ===");
    console.log("Payload:", {
      email: payload.contact.email,
      itemsCount: payload.items.length,
      total: payload.total
    });

    setLoading(true);
    try {
      // Create quote
      const { data: quoteData, error: quoteError } = await supabase.functions.invoke("quotes-create", {
        body: payload,
      });

      if (quoteError) {
        console.error("Quote creation error:", quoteError);
        throw quoteError;
      }

      console.log("Quote created successfully:", quoteData);

      const { quoteId, trackingCode, pdfUrl } = quoteData;

      if (!quoteId) {
        throw new Error("No quote ID received");
      }

      // Send email notification with retry logic
      const sendEmailWithRetry = async (retryCount = 0): Promise<void> => {
        const maxRetries = 3;
        
        try {
          console.log(`Attempting to send email (attempt ${retryCount + 1})`);
          
          const { error: emailError } = await supabase.functions.invoke("send-quote-email", {
            body: {
              quoteId,
              email: payload.contact.email,
              pdfUrl,
              customerName: payload.contact.email // You could add a name field to the form
            },
          });

          if (emailError) {
            console.error("Email error:", emailError);
            
            if (retryCount < maxRetries - 1) {
              console.log("Retrying email send...");
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
              return sendEmailWithRetry(retryCount + 1);
            } else {
              throw emailError;
            }
          }

          console.log("Email sent successfully");
        } catch (error) {
          console.error("Email send failed after retries:", error);
          // Don't fail the whole process if email fails
          toast({
            title: "Cotización creada",
            description: "Tu cotización se ha creado, pero hubo un problema enviando el email. Contacta a soporte.",
            variant: "destructive"
          });
          return;
        }
      };

      // Send email notification
      await sendEmailWithRetry();

      // Success
      setQuoteSuccess({
        quoteId,
        trackingCode,
        pdfUrl,
        email: payload.contact.email,
        total: payload.total
      });

      toast({ 
        title: "¡Cotización enviada!", 
        description: `Cotización ${quoteId} creada. Revisa tu email para el PDF.`
      });

      clear();
      form.reset();

    } catch (e: any) {
      console.error("=== QUOTE CREATION ERROR ===", e);
      const errorMsg = e?.message || "No se pudo crear la cotización";
      toast({ 
        title: "Error", 
        description: errorMsg, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuoteSuccess(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {quoteSuccess ? "¡Cotización Enviada!" : "Solicitar Cotización"}
          </DialogTitle>
        </DialogHeader>
        
        {quoteSuccess ? (
          <QuoteSuccess {...quoteSuccess} />
        ) : (
          <>
            {/* Summary */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Resumen del pedido</h4>
              <div className="space-y-1 text-sm">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>${(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                <span>Total:</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha del evento *</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div>
                  <Label htmlFor="time">Hora *</Label>
                  <Input id="time" name="time" type="time" required />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Lugar del evento *</Label>
                <Input id="location" name="location" placeholder="Dirección o lugar del evento" required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input id="whatsapp" name="whatsapp" type="tel" placeholder="+57 300 123 4567" required />
                </div>
              </div>
              
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="consent" required /> 
                Acepto ser contactado por WhatsApp para coordinar mi evento *
              </label>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Procesando..." : "Enviar Cotización"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuoteModal;
