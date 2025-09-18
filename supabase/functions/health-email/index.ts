// Health check for email configuration
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== HEALTH-EMAIL CHECK ===");
    
    // Check environment variables
    const checks = {
      RESEND_API_KEY: !!Deno.env.get("RESEND_API_KEY"),
      SUPABASE_URL: !!Deno.env.get("SUPABASE_URL"),
      SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    };

    const allConfigured = Object.values(checks).every(Boolean);

    console.log("Configuration check:", checks);

    const response = {
      ok: allConfigured,
      timestamp: new Date().toISOString(),
      checks: checks,
      message: allConfigured 
        ? "All email configuration is ready" 
        : "Some configuration is missing",
      required_actions: allConfigured ? [] : [
        !checks.RESEND_API_KEY && "Add RESEND_API_KEY secret in Supabase",
        !checks.SUPABASE_URL && "Set SUPABASE_URL environment variable", 
        !checks.SUPABASE_SERVICE_ROLE_KEY && "Add SUPABASE_SERVICE_ROLE_KEY secret"
      ].filter(Boolean)
    };

    return new Response(
      JSON.stringify(response, null, 2),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("=== HEALTH-EMAIL ERROR ===", error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message || "Health check failed",
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);