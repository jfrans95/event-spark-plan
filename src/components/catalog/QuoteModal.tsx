import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      contact: {
        email: formData.get("email"),
        whatsapp: formData.get("whatsapp"),
        consentWhatsApp: formData.get("consent") === "on",
      },
      event: {
        date: formData.get("date"),
        time: formData.get("time"),
        location: formData.get("location"),
      },
      items: items.map((i) => ({ id: i.product.id, name: i.product.name, qty: i.qty, price: i.product.price })),
      total,
    };

    if (!payload.contact.email || !payload.contact.whatsapp) {
      toast({ title: "Datos incompletos", description: "Email y WhatsApp son obligatorios", variant: "destructive" });
      return;
    }

    if (!payload.contact.consentWhatsApp) {
      toast({ title: "Consentimiento requerido", description: "Debes aceptar recibir contacto por WhatsApp", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("quotes-create", {
        body: payload,
      });
      if (error) throw error;
      toast({ title: "Cotización enviada", description: `Te enviamos el PDF: ${data?.pdfUrl ?? ""}` });
      clear();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo crear la cotización", variant: "destructive" });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="time">Hora</Label>
              <Input id="time" name="time" type="time" required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="location">Lugar</Label>
            <Input id="location" name="location" placeholder="Dirección o lugar del evento" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" name="whatsapp" type="tel" required />
            </div>
          </div>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" name="consent" /> Acepto ser contactado por WhatsApp
          </label>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando…" : "Enviar cotización"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteModal;
