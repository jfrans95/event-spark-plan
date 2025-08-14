import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExecuteEventRequest {
  quoteId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user is authenticated and is an advisor
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user role is advisor or admin
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile || !["advisor", "administrator"].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { quoteId }: ExecuteEventRequest = await req.json();

    if (!quoteId) {
      return new Response(
        JSON.stringify({ error: "Missing quoteId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate tracking code
    const trackingCode = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Create event record (you'll need to create this table)
    const { data: event, error: eventError } = await supabaseClient
      .from("events")
      .insert({
        quote_id: quoteId,
        tracking_code: trackingCode,
        status: "in_progress",
        advisor_id: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (eventError) {
      console.error("Error creating event:", eventError);
      return new Response(
        JSON.stringify({ error: "Failed to create event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get quote details to create provider requests
    const { data: quote, error: quoteError } = await supabaseClient
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      console.error("Error fetching quote:", quoteError);
      return new Response(
        JSON.stringify({ error: "Quote not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create provider requests for each item in the quote
    const items = quote.items || [];
    const providerRequests = [];

    for (const item of items) {
      // Find providers for this category (you'll need to implement provider matching logic)
      const { data: providers, error: providerError } = await supabaseClient
        .from("provider_profiles")
        .select(`
          *,
          provider_applications!inner(product_category)
        `)
        .eq("provider_applications.product_category", item.category)
        .limit(3); // Get up to 3 providers per category

      if (!providerError && providers && providers.length > 0) {
        for (const provider of providers) {
          const requestData = {
            event_id: event.id,
            provider_id: provider.user_id,
            product_name: item.name,
            product_category: item.category,
            quantity: item.qty,
            status: "requested",
            created_at: new Date().toISOString()
          };

          providerRequests.push(requestData);
        }
      }
    }

    // Insert all provider requests
    if (providerRequests.length > 0) {
      const { error: requestError } = await supabaseClient
        .from("provider_requests")
        .insert(providerRequests);

      if (requestError) {
        console.error("Error creating provider requests:", requestError);
      }
    }

    // Create event tasks for tracking
    const tasks = [
      { name: "Coordinación inicial", status: "pending" },
      { name: "Confirmación de proveedores", status: "pending" },
      { name: "Preparación del evento", status: "pending" },
      { name: "Ejecución del evento", status: "pending" },
      { name: "Cierre y evaluación", status: "pending" }
    ];

    const eventTasks = tasks.map(task => ({
      event_id: event.id,
      task_name: task.name,
      status: task.status,
      created_at: new Date().toISOString()
    }));

    const { error: tasksError } = await supabaseClient
      .from("event_tasks")
      .insert(eventTasks);

    if (tasksError) {
      console.error("Error creating event tasks:", tasksError);
    }

    return new Response(
      JSON.stringify({
        eventId: event.id,
        trackingCode: trackingCode,
        message: "Event execution started successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in execute-event function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);