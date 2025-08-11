import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const SeedAdmin = () => {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);

  // SEO basics
  if (typeof document !== "undefined") {
    document.title = "Seed Admin | Panel de herramientas"; // Title tag under 60 chars
  }

  const runSeed = async () => {
    if (!secret) {
      toast({ title: "Falta el secreto", description: "Ingresa el SEED_SECRET para continuar", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-admin", {
        body: {},
        headers: { "x-seed-secret": secret },
      });
      if (error) throw error;
      toast({ title: "Listo", description: `Admin creado/actualizado: ${data?.email || "ok"}` });
    } catch (e: any) {
      const message = e?.message || e?.error?.message || "Error al ejecutar seed";
      toast({ title: "Error", description: message, variant: "destructive" });
      console.error("seed-admin error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Semilla de Admin</CardTitle>
          <CardDescription>
            Ejecuta la función protegida para crear/promover el usuario administrador por defecto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="secret">SEED_SECRET</Label>
              <Input id="secret" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Ingresa el secreto" />
            </div>
            <Button onClick={runSeed} disabled={loading} className="w-full">
              {loading ? "Ejecutando…" : "Ejecutar seed-admin"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeedAdmin;
