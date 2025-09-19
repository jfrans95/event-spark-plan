// health-email: Check email configuration and secrets
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== EMAIL HEALTH CHECK START ===");
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const health: any = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      checks: {}
    };

    // Check Supabase URL
    health.checks.supabase_url = {
      present: !!SUPABASE_URL,
      value: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 20)}...` : null
    };

    // Check Service Role Key
    health.checks.service_role_key = {
      present: !!SUPABASE_SERVICE_ROLE_KEY,
      value: SUPABASE_SERVICE_ROLE_KEY ? `${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : null
    };

    // Check Resend API Key
    health.checks.resend_api_key = {
      present: !!RESEND_API_KEY,
      value: RESEND_API_KEY ? `${RESEND_API_KEY.substring(0, 10)}...` : null
    };

    // Test Supabase connection if keys are present
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data, error } = await supabase
          .from("quotes")
          .select("count")
          .limit(1);
        
        health.checks.supabase_connection = {
          status: error ? "error" : "success",
          error: error?.message
        };
      } catch (error: any) {
        health.checks.supabase_connection = {
          status: "error",
          error: error.message
        };
      }
    }

    // Test Resend API if key is present
    if (RESEND_API_KEY) {
      try {
        const response = await fetch("https://api.resend.com/domains", {
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
          }
        });
        
        health.checks.resend_connection = {
          status: response.ok ? "success" : "error",
          status_code: response.status,
          error: response.ok ? null : "Invalid API key or connection failed"
        };
      } catch (error: any) {
        health.checks.resend_connection = {
          status: "error",
          error: error.message
        };
      }
    }

    // Determine overall status
    const hasErrors = Object.values(health.checks).some((check: any) => 
      check.status === "error" || !check.present
    );
    
    if (hasErrors) {
      health.status = "unhealthy";
    }

    console.log("Health check completed:", health.status);
    console.log("=== EMAIL HEALTH CHECK END ===");

    return new Response(
      JSON.stringify(health),
      { 
        status: health.status === "healthy" ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("=== EMAIL HEALTH CHECK ERROR ===", error);
    return new Response(
      JSON.stringify({ 
        status: "error", 
        error: error?.message || "Health check failed",
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});