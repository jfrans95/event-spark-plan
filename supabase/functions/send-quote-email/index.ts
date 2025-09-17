import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

interface QuoteEmailRequest {
  quoteId: string;
  email: string;
  name: string;
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
    const { quoteId, email, name }: QuoteEmailRequest = await req.json();

    console.log('Processing quote email request for quote:', quoteId, 'email:', email);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch quote details with items
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        quote_items (
          *,
          products (
            name,
            description,
            price
          )
        )
      `)
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      console.error('Quote not found:', quoteError?.message);
      throw new Error(`Quote not found: ${quoteError?.message}`);
    }

    // Idempotency check: if email already sent, return success without resending
    if (quote.email_sent_at) {
      console.log('Email already sent for quote:', quoteId, 'at:', quote.email_sent_at);
      return new Response(JSON.stringify({ 
        success: true,
        message: "Email already sent",
        alreadySent: true,
        sentAt: quote.email_sent_at
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Verify PDF URL exists (blocking requirement)
    if (!quote.pdf_url) {
      console.error('PDF URL missing for quote:', quoteId);
      throw new Error(`PDF not ready for quote ${quoteId}. Please try again later.`);
    }

    // Format quote items for email
    const itemsHtml = quote.quote_items.map((item: any, index: number) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 15px 10px; text-align: left; font-weight: 500;">
          ${item.products?.name || 'Producto'}
        </td>
        <td style="padding: 15px 10px; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 15px 10px; text-align: right;">
          $${item.unit_price.toLocaleString('es-CO')}
        </td>
        <td style="padding: 15px 10px; text-align: right; font-weight: 600;">
          $${item.subtotal.toLocaleString('es-CO')}
        </td>
      </tr>
    `).join('');

    const eventDetails = `
      ${quote.event_date ? `<p><strong>📅 Fecha:</strong> ${new Date(quote.event_date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
      ${quote.event_time ? `<p><strong>🕐 Hora:</strong> ${quote.event_time}</p>` : ''}
      ${quote.event_location ? `<p><strong>📍 Ubicación:</strong> ${quote.event_location}</p>` : ''}
    `;

    const emailResponse = await resend.emails.send({
      from: "Eventix <cotizaciones@resend.dev>",
      to: [email],
      subject: `Tu cotización #${quote.id.substring(0, 8).toUpperCase()} está lista`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Tu cotización está lista</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">💜 Tu Cotización Está Lista</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Cotización #${quote.id.substring(0, 8).toUpperCase()}</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <h2 style="color: #667eea; margin-top: 0;">Hola ${name},</h2>
              <p>¡Gracias por confiar en Eventix para tu evento! Hemos preparado tu cotización personalizada con todos los servicios que necesitas.</p>
              
              <!-- Event Details -->
              ${eventDetails ? `
                <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 25px 0;">
                  <h3 style="color: #667eea; margin-top: 0; margin-bottom: 15px;">📋 Detalles del Evento</h3>
                  ${eventDetails}
                </div>
              ` : ''}
              
              <!-- Quote Items Table -->
              <div style="margin: 30px 0;">
                <h3 style="color: #667eea; margin-bottom: 15px;">🛍️ Servicios Cotizados</h3>
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <thead>
                    <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                      <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Servicio</th>
                      <th style="padding: 15px 10px; text-align: center; font-weight: 600;">Cantidad</th>
                      <th style="padding: 15px 10px; text-align: right; font-weight: 600;">Precio Unit.</th>
                      <th style="padding: 15px 10px; text-align: right; font-weight: 600;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr style="background: #f8f9ff;">
                      <td colspan="3" style="padding: 20px 10px; text-align: right; font-size: 18px; font-weight: 600; color: #667eea;">
                        TOTAL:
                      </td>
                      <td style="padding: 20px 10px; text-align: right; font-size: 20px; font-weight: 700; color: #667eea;">
                        $${quote.total_amount.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <!-- Next Steps -->
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; margin: 25px 0;">
                <h3 style="color: #4caf50; margin-top: 0; margin-bottom: 15px;">✅ Próximos Pasos</h3>
                <ol style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Revisa los servicios incluidos en tu cotización</li>
                  <li style="margin-bottom: 8px;">Si tienes preguntas, responde a este correo</li>
                  <li style="margin-bottom: 8px;">Para confirmar tu evento, uno de nuestros asesores se contactará contigo</li>
                </ol>
              </div>
              
              <!-- Contact Info -->
              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 25px 0;">
                <h3 style="color: #ff6f00; margin-top: 0; margin-bottom: 15px;">📞 ¿Necesitas Ayuda?</h3>
                <p style="margin: 0;">Nuestro equipo está listo para ayudarte:</p>
                <p style="margin: 10px 0 0 0;">
                  📧 <strong>Email:</strong> soporte@eventix.com<br>
                  📱 <strong>WhatsApp:</strong> +57 300 123 4567<br>
                  📞 <strong>Teléfono:</strong> +57 1 234 5678
                </p>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">
                Esta cotización es válida por 30 días. Los precios pueden variar según disponibilidad y fechas del evento.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px 0;">© 2025 Eventix. Todos los derechos reservados.</p>
              <p style="margin: 0;">Gracias por elegir Eventix para hacer realidad tu evento perfecto ✨</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Quote email sent successfully:", emailResponse);

    // Update quote with email_sent_at timestamp
    const { error: updateError } = await supabase
      .from('quotes')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', quoteId);

    if (updateError) {
      console.error('Failed to update email_sent_at:', updateError);
      // Continue anyway since email was sent successfully
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Quote email sent successfully",
      messageId: emailResponse.data?.id,
      sentAt: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending quote email:", error);
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