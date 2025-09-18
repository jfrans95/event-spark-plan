// Public function: quotes-create
// Accepts quote payload and returns { quoteId, pdfUrl } (mock)

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  try {
    const body = await req.json();
    // Minimal validation
    if (!body?.contact?.email || !body?.items?.length) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Example of using client if needed later (not used now)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://uuioedhcwydmtoywyvtq.supabase.co";
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = SERVICE_ROLE ? createClient(SUPABASE_URL, SERVICE_ROLE) : null;

    const quoteId = crypto.randomUUID();
    const pdfUrl = `https://uuioedhcwydmtoywyvtq.supabase.co/storage/v1/object/public/public-assets/sample-quote.pdf`;

    return new Response(
      JSON.stringify({ quoteId, pdfUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
