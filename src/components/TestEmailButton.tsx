import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail } from "lucide-react";

const TestEmailButton = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("oasislive77@gmail.com");

  const testEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Ingresa un email para probar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-email', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      console.log('Test email response:', data);

      if (data.success) {
        toast({
          title: "✅ Email enviado",
          description: `Test enviado a ${email}. ID: ${data.messageId}`,
        });
      } else {
        toast({
          title: "❌ Error de envío",
          description: data.error || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error testing email:', error);
      toast({
        title: "Error de función",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/50">
      <h3 className="font-semibold mb-2">🧪 Test de Email</h3>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={testEmail} 
          disabled={loading}
          variant="outline"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          Test
        </Button>
      </div>
    </div>
  );
};

export default TestEmailButton;