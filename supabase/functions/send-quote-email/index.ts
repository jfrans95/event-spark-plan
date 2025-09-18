import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  quoteId: string;
  email: string;
  pdfUrl?: string;
  customerName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log("=== SEND-QUOTE-EMAIL START ===");
    
    const { quoteId, email, pdfUrl, customerName }: EmailRequest = await req.json();
    
    console.log("Request payload:", { quoteId, email, pdfUrl: !!pdfUrl, customerName });
    
    if (!quoteId || !email) {
      console.error("Missing required fields:", { quoteId: !!quoteId, email: !!email });
      return new Response(
        JSON.stringify({ error: "Missing required fields: quoteId and email" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Prepare email content
    const emailSubject = "Tu cotización de Eventix está lista";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">¡Tu cotización está lista!</h2>
        <p>Hola${customerName ? ` ${customerName}` : ''},</p>
        <p>Hemos procesado tu solicitud de cotización con el ID: <strong>${quoteId}</strong></p>
        ${pdfUrl ? `
        <div style="margin: 20px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
          <p><strong>📄 Tu cotización en PDF:</strong></p>
          <a href="${pdfUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
            Descargar Cotización PDF
          </a>
        </div>
        ` : `
        <div style="margin: 20px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
          <p><strong>⏳ Tu PDF se está generando...</strong></p>
          <p>Te enviaremos un email adicional cuando esté listo para descargar.</p>
        </div>
        `}
        <p>Si tienes alguna pregunta sobre tu cotización, no dudes en contactarnos.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Gracias por confiar en Eventix para tu evento especial.<br>
          <strong>Equipo Eventix</strong>
        </p>
      </div>
    `;

    console.log("Sending email via Resend...");
    
    const emailResponse = await resend.emails.send({
      from: "Eventix <onboarding@resend.dev>",
      to: [email],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Resend response:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailResponse.error }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Update quote to mark email as sent
    if (emailResponse.data) {
      console.log("Updating quote email_sent_at...");
      const { error: updateError } = await supabase
        .from("quotes")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", quoteId);

      if (updateError) {
        console.error("Failed to update quote:", updateError);
      } else {
        console.log("Quote updated successfully");
      }
    }

    console.log("=== SEND-QUOTE-EMAIL SUCCESS ===");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: "Email sent successfully" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("=== SEND-QUOTE-EMAIL ERROR ===", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);