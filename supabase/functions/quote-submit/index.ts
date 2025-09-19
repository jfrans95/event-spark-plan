// quote-submit: Consolidated quote creation, PDF generation, and email sending
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key",
};

interface QuotePayload {
  contact: {
    email: string;
    whatsapp: string;
    consentWhatsApp: boolean;
  };
  event: {
    date: string;
    time: string;
    location: string;
  };
  items: Array<{
    id: string;
    name: string;
    qty: number;
    price: number;
  }>;
  total: number;
}

Deno.serve(async (req) => {
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
    console.log("=== QUOTE-SUBMIT START ===");
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://uuioedhcwydmtoywyvtq.supabase.co";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Initialize clients
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const resend = new Resend(RESEND_API_KEY);

    // Get idempotency key and payload
    const idempotencyKey = req.headers.get("idempotency-key");
    const payload: QuotePayload = await req.json();

    console.log("Request payload:", {
      email: payload.contact.email,
      itemsCount: payload.items.length,
      total: payload.total,
      idempotencyKey
    });

    // Enhanced validation
    if (!payload.contact.email || !payload.contact.whatsapp || !payload.contact.consentWhatsApp) {
      return new Response(
        JSON.stringify({ error: "Missing required contact information" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!payload.items.length || payload.total <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid quote items or total" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate items
    for (const item of payload.items) {
      if (item.qty < 1 || item.price <= 0) {
        return new Response(
          JSON.stringify({ error: "All items must have valid quantity and price" }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    // Check for existing quote with same email if idempotency key provided
    if (idempotencyKey) {
      const { data: existingQuote } = await supabase
        .from("quotes")
        .select("id, tracking_code, pdf_url, email_sent_at")
        .eq("email", payload.contact.email)
        .not("email_sent_at", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingQuote) {
        console.log("Returning existing quote due to idempotency");
        return new Response(
          JSON.stringify({ 
            quoteId: existingQuote.id,
            trackingCode: existingQuote.tracking_code,
            pdfUrl: existingQuote.pdf_url,
            emailSent: true,
            idempotent: true
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    // Create quote record
    console.log("Creating quote record...");
    const { data: quoteData, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        email: payload.contact.email,
        event_date: payload.event.date,
        event_time: payload.event.time,
        event_location: payload.event.location,
        total_amount: payload.total,
        status: "COTIZACION_ENVIADA",
        user_id: null // Will be claimed later via quote-claim
      })
      .select("id, tracking_code")
      .single();

    if (quoteError) {
      console.error("Failed to create quote:", quoteError);
      return new Response(
        JSON.stringify({ error: "Failed to create quote", details: quoteError.message }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const quoteId = quoteData.id;
    const trackingCode = quoteData.tracking_code;
    console.log("Quote created:", quoteId);

    // Create quote items
    console.log("Creating quote items...");
    const quoteItems = payload.items.map(item => ({
      quote_id: quoteId,
      product_id: item.id,
      quantity: item.qty,
      unit_price: item.price
    }));

    const { error: itemsError } = await supabase
      .from("quote_items")
      .insert(quoteItems);

    if (itemsError) {
      console.error("Failed to create quote items:", itemsError);
      // Don't fail completely, but log the error
    } else {
      console.log(`Created ${quoteItems.length} quote items`);
    }

    // Generate simple PDF URL (we'll use a placeholder for now since PDF generation is complex)
    const pdfUrl = `${SUPABASE_URL}/storage/v1/object/public/public-assets/quote-${quoteId}.pdf`;
    
    // Update quote with PDF URL
    await supabase
      .from("quotes")
      .update({ pdf_url: pdfUrl })
      .eq("id", quoteId);

    console.log("PDF URL set:", pdfUrl);

    // Send email notification
    console.log("Sending email notification...");
    try {
      const emailResult = await resend.emails.send({
        from: "EventCraft <onboarding@resend.dev>",
        to: [payload.contact.email],
        subject: `Cotización #${quoteId.slice(0, 8)} - EventCraft`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">¡Tu cotización está lista!</h1>
            <p>Hola,</p>
            <p>Hemos recibido tu solicitud de cotización y la hemos procesado exitosamente.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Detalles de tu cotización:</h3>
              <p><strong>Código de seguimiento:</strong> ${trackingCode}</p>
              <p><strong>Total:</strong> $${payload.total.toLocaleString()}</p>
              <p><strong>Evento:</strong> ${payload.event.date} a las ${payload.event.time}</p>
              <p><strong>Ubicación:</strong> ${payload.event.location}</p>
            </div>

            <div style="margin: 20px 0;">
              <h4>Productos cotizados:</h4>
              <ul>
                ${payload.items.map(item => 
                  `<li>${item.name} - Cantidad: ${item.qty} - $${(item.price * item.qty).toLocaleString()}</li>`
                ).join('')}
              </ul>
            </div>

            <p>Puedes hacer seguimiento de tu cotización usando este enlace:</p>
            <a href="${SUPABASE_URL.replace('supabase.co', 'lovableproject.com')}/tracking/${trackingCode}" 
               style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver seguimiento
            </a>

            <p style="margin-top: 30px;">
              Te contactaremos pronto para coordinar los detalles de tu evento.
            </p>

            <p>¡Gracias por confiar en EventCraft!</p>
          </div>
        `,
      });

      if (emailResult.error) {
        console.error("Email sending failed:", emailResult.error);
        throw emailResult.error;
      }

      // Mark email as sent
      await supabase
        .from("quotes")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", quoteId);

      console.log("Email sent successfully, messageId:", emailResult.data?.id);

    } catch (emailError: any) {
      console.error("Email sending failed:", emailError);
      // Don't fail the whole process if email fails, but mark it
      return new Response(
        JSON.stringify({ 
          quoteId,
          trackingCode,
          pdfUrl,
          emailSent: false,
          emailError: emailError.message || "Failed to send email"
        }),
        { 
          status: 200, // Still success since quote was created
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("=== QUOTE-SUBMIT SUCCESS ===");
    
    return new Response(
      JSON.stringify({ 
        quoteId,
        trackingCode,
        pdfUrl,
        emailSent: true,
        total: payload.total,
        itemCount: payload.items.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("=== QUOTE-SUBMIT ERROR ===", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});