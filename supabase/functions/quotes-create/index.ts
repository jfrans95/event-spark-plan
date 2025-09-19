// Enhanced quotes-create function with proper security and validation
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting: Simple in-memory store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRateLimitKey(req: Request): string {
  // Use IP address for anonymous users, user ID for authenticated
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  return forwardedFor?.split(',')[0] || realIP || 'unknown';
}

function checkRateLimit(key: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

interface QuotePayload {
  contact: {
    email: string;
    whatsapp?: string;
    consentWhatsApp?: boolean;
  };
  event: {
    date?: string;
    time?: string;
    location?: string;
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
    console.log("=== QUOTES-CREATE START ===");
    
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(req);
    if (!checkRateLimit(rateLimitKey)) {
      console.warn("Rate limit exceeded for:", rateLimitKey);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
        { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const body: QuotePayload = await req.json();
    console.log("Request payload:", {
      email: body?.contact?.email,
      itemsCount: body?.items?.length,
      total: body?.total
    });

    // Enhanced validation with proper email format check
    if (!body?.contact?.email) {
      console.error("Missing email");
      return new Response(
        JSON.stringify({ error: "Email is required" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(body.contact.email)) {
      console.error("Invalid email format:", body.contact.email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!body?.items?.length) {
      console.error("Missing items");
      return new Response(
        JSON.stringify({ error: "At least one item is required" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!body?.total || body.total <= 0) {
      console.error("Invalid total:", body?.total);
      return new Response(
        JSON.stringify({ error: "Total amount must be greater than 0" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate items
    for (const item of body.items) {
      if (!item.id || !item.name || item.qty < 1 || item.price < 0) {
        console.error("Invalid item:", item);
        return new Response(
          JSON.stringify({ error: "All items must have valid id, name, quantity >= 1, and price >= 0" }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://uuioedhcwydmtoywyvtq.supabase.co";
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SERVICE_ROLE) {
      console.error("Missing SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Get current user if authenticated
    const authHeader = req.headers.get("authorization");
    let userId = null;
    
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
        console.log("User ID from token:", userId);
      } catch (authError) {
        console.log("No valid auth token, proceeding as anonymous");
      }
    }

    // Parse event date/time
    let eventDate = null;
    if (body.event?.date && body.event?.time) {
      try {
        eventDate = new Date(`${body.event.date}T${body.event.time}`).toISOString();
      } catch (dateError) {
        console.warn("Invalid date/time format:", body.event);
      }
    }

    // Create quote record
    console.log("Creating quote record...");
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        user_id: userId,
        email: body.contact.email,
        event_date: eventDate,
        event_time: body.event?.time,
        event_location: body.event?.location,
        total_amount: body.total,
        pdf_url: null, // Will be generated later
      })
      .select()
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

    console.log("Quote created:", quote.id);

    // Create quote items
    console.log("Creating quote items...");
    const quoteItems = body.items.map(item => ({
      quote_id: quote.id,
      product_id: item.id,
      quantity: item.qty,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("quote_items")
      .insert(quoteItems);

    if (itemsError) {
      console.error("Failed to create quote items:", itemsError);
      // Try to clean up the quote if items failed
      await supabase.from("quotes").delete().eq("id", quote.id);
      return new Response(
        JSON.stringify({ error: "Failed to create quote items", details: itemsError.message }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Created ${quoteItems.length} quote items`);

    // Generate mock PDF URL (in production, this would be a real PDF generation service)
    const pdfUrl = `https://uuioedhcwydmtoywyvtq.supabase.co/storage/v1/object/public/public-assets/quote-${quote.id}.pdf`;
    
    // Update quote with PDF URL
    const { error: updateError } = await supabase
      .from("quotes")
      .update({ pdf_url: pdfUrl })
      .eq("id", quote.id);

    if (updateError) {
      console.error("Failed to update quote with PDF URL:", updateError);
    }

    console.log("=== QUOTES-CREATE SUCCESS ===");
    
    return new Response(
      JSON.stringify({ 
        quoteId: quote.id, 
        pdfUrl: pdfUrl,
        total: body.total,
        itemCount: body.items.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("=== QUOTES-CREATE ERROR ===", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
