import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendConfirmationRequest {
  email: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  try {
    const { email }: ResendConfirmationRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing required field: email" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!SUPABASE_URL || !SERVICE_ROLE || !RESEND_API_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const resend = new Resend(RESEND_API_KEY);

    console.log('Generating confirmation link for:', email);

    // Generate confirmation link using Supabase Auth Admin
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: `${req.headers.get('origin') || 'https://uuioedhcwydmtoywyvtq.supabase.co'}/auth/callback?next=${encodeURIComponent('/user')}`
      }
    });

    if (error) {
      console.error('Error generating confirmation link:', error);
      throw new Error(`Failed to generate confirmation link: ${error.message}`);
    }

    if (!data.properties?.action_link) {
      throw new Error('No confirmation link generated');
    }

    console.log('Sending confirmation email to:', email);

    // Send confirmation email using Resend
    const emailResponse = await resend.emails.send({
      from: "EventCraft <noreply@eventcraft.app>",
      to: [email],
      subject: "Confirma tu cuenta en EventCraft",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a EventCraft!</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Confirma tu cuenta</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              Hemos recibido tu solicitud de registro en EventCraft. Para completar tu cuenta y comenzar a usar nuestros servicios, necesitamos que confirmes tu dirección de correo electrónico.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${data.properties.action_link}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                Confirmar mi cuenta
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:
            </p>
            <p style="color: #667eea; font-size: 14px; word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
              ${data.properties.action_link}
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Este enlace expira en 24 horas por seguridad. Si necesitas un nuevo enlace, puedes solicitarlo desde la página de inicio de sesión.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>EventCraft - Tu plataforma de gestión de eventos</p>
            <p>Si no te registraste en EventCraft, puedes ignorar este correo.</p>
          </div>
        </div>
      `,
    });

    console.log('Confirmation email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Confirmation email sent successfully",
        email,
        messageId: emailResponse.data?.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('Error in resend-confirmation-email:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});