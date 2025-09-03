import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
console.log('RESEND_API_KEY configured:', !!resendApiKey);

if (!resendApiKey) {
  console.error('RESEND_API_KEY is not configured');
}

const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  name: string;
  confirmationUrl: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { email, name, confirmationUrl, role }: ConfirmationEmailRequest = await req.json();

    console.log('Sending confirmation email to:', email);

    const emailResponse = await resend.emails.send({
      from: "Eventix <noreply@resend.dev>",
      to: [email],
      subject: "¡Confirma tu cuenta en Eventix!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Confirma tu cuenta</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">¡Bienvenido a Eventix!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">La plataforma líder en eventos</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">Hola ${name},</h2>
            <p>¡Gracias por registrarte en Eventix! Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
            
            <p>Para completar tu registro como <strong>${role === 'usuario' ? 'Cliente' : role === 'provider' ? 'Proveedor' : 'Usuario'}</strong>, necesitas confirmar tu dirección de correo electrónico.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        transition: all 0.3s ease;">
                ✓ Confirmar mi cuenta
              </a>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Importante:</strong> Este enlace expira en 24 horas. Si no confirmas tu cuenta dentro de este tiempo, tendrás que registrarte nuevamente.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>© 2025 Eventix. Todos los derechos reservados.</p>
              <p>¿Problemas con el enlace? Copia y pega esta URL en tu navegador:</p>
              <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 4px; font-family: monospace;">
                ${confirmationUrl}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Confirmation email sent successfully",
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);