import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteRequest {
  contact: {
    name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
  };
  event: {
    date?: string;
    time?: string;
    location?: string;
  };
  items: QuoteItem[];
  total: number;
  userId?: string; // For authenticated users
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  try {
    const body: QuoteRequest = await req.json();
    
    // Validate required fields
    if (!body?.contact?.email || !body?.items?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: contact.email and items are required" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Get the Authorization header to check if user is authenticated
    const authHeader = req.headers.get('Authorization');
    let userId = body.userId;

    if (authHeader && !userId) {
      // Try to get user from JWT token
      const { data: { user }, error: userError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      
      if (!userError && user) {
        userId = user.id;
      }
    }

    // Allow anonymous quotes for new registrations - we'll store contact info instead
    // If no userId, we'll create a pending quote with contact information

    const quoteData = {
      user_id: userId || null, // Allow null for anonymous quotes
      contact_name: body.contact.name || "",
      contact_email: body.contact.email,
      contact_phone: body.contact.phone || null,
      contact_whatsapp: body.contact.whatsapp || null,
      event_date: body.event.date || null,
      event_time: body.event.time || null,
      event_location: body.event.location || null,
      total_amount: body.total,
      status: 'enviada' as const
    };

    // Create the quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert(quoteData)
      .select()
      .single();

    if (quoteError) {
      console.error('Error creating quote:', quoteError);
      throw new Error(`Failed to create quote: ${quoteError.message}`);
    }

    // Create quote items
    const quoteItems = body.items.map(item => ({
      quote_id: quote.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.quantity * item.unitPrice
    }));

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(quoteItems);

    if (itemsError) {
      console.error('Error creating quote items:', itemsError);
      // Clean up the quote if items creation failed
      await supabase.from('quotes').delete().eq('id', quote.id);
      throw new Error(`Failed to create quote items: ${itemsError.message}`);
    }

    // Generate a mock PDF URL for now
    // In production, you'd generate an actual PDF here
    const pdfUrl = `https://uuioedhcwydmtoywyvtq.supabase.co/storage/v1/object/public/public-assets/sample-quote.pdf`;

    // Update quote with PDF URL BEFORE sending email
    const { error: pdfUpdateError } = await supabase
      .from('quotes')
      .update({ pdf_url: pdfUrl })
      .eq('id', quote.id);

    if (pdfUpdateError) {
      console.error('Error updating PDF URL:', pdfUpdateError);
      throw new Error(`Failed to set PDF URL: ${pdfUpdateError.message}`);
    }

    console.log('Quote created successfully with PDF:', quote.id);

    // Send quote email after PDF is ready
    try {
      console.log('Invoking send-quote-email for quote:', quote.id);
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-quote-email', {
        body: {
          quoteId: quote.id,
          email: body.contact.email,
          name: body.contact.name
        }
      });

      if (emailError) {
        console.error('Error sending quote email:', emailError);
        // Don't fail the quote creation, just log the email issue
      } else if (emailData?.success) {
        console.log('Quote email sent successfully, messageId:', emailData.messageId);
      } else {
        console.error('Quote email failed with response:', emailData);
      }
    } catch (emailError) {
      console.error('Error calling send-quote-email function:', emailError);
      // Don't fail the quote creation, just log the email issue
    }

    return new Response(
      JSON.stringify({ 
        quoteId: quote.id, 
        pdfUrl,
        message: "Quote created successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('Error in quotes-create:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});