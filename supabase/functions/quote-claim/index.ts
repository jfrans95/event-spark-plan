// quote-claim: Assigns quotes to user after registration
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    console.log("=== QUOTE-CLAIM START ===");
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://uuioedhcwydmtoywyvtq.supabase.co";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!SUPABASE_ANON_KEY) {
      console.error("Missing SUPABASE_ANON_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get auth token from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Failed to get user:", userError);
      return new Response(
        JSON.stringify({ error: "Authentication required" }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("User ID:", user.id, "Email:", user.email);

    // Claim quotes with matching email that don't have a user_id
    const { data: updatedQuotes, error: claimError } = await supabase
      .from("quotes")
      .update({ user_id: user.id })
      .eq("email", user.email)
      .is("user_id", null)
      .select("id, tracking_code, total_amount, created_at");

    if (claimError) {
      console.error("Failed to claim quotes:", claimError);
      return new Response(
        JSON.stringify({ error: "Failed to claim quotes", details: claimError.message }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const claimedCount = updatedQuotes?.length || 0;
    console.log(`Claimed ${claimedCount} quotes for user ${user.email}`);

    console.log("=== QUOTE-CLAIM SUCCESS ===");
    
    return new Response(
      JSON.stringify({ 
        claimedQuotes: claimedCount,
        quotes: updatedQuotes || []
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("=== QUOTE-CLAIM ERROR ===", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});