import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendQuoteEmailRequest {
  quoteId: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  try {
    const { quoteId }: ResendQuoteEmailRequest = await req.json();

    if (!quoteId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: quoteId" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Fetch quote details first
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('id, contact_email, contact_name, pdf_url, email_sent_at')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      console.error('Quote not found:', quoteError?.message);
      return new Response(
        JSON.stringify({ error: `Quote not found: ${quoteId}` }), 
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Manually resending quote email for:', quoteId, 'to:', quote.contact_email);

    // Reset email_sent_at to allow resending
    await supabase
      .from('quotes')
      .update({ email_sent_at: null })
      .eq('id', quoteId);

    // Invoke send-quote-email function
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-quote-email', {
      body: {
        quoteId: quote.id,
        email: quote.contact_email,
        name: quote.contact_name || 'Cliente'
      }
    });

    if (emailError) {
      console.error('Error resending quote email:', emailError);
      throw new Error(`Failed to resend email: ${emailError.message}`);
    }

    console.log('Quote email resent successfully:', emailData);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Quote email resent successfully",
        quoteId,
        emailData
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('Error in resend-quote-email:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});