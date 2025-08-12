// Public function: tracking-get
// Accepts { code } and returns a simple timeline and contact

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  try {
    const { code } = await req.json();
    if (!code) {
      return new Response(JSON.stringify({ error: "Missing code" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const timeline = [
      { title: "Solicitud recibida", status: "done" },
      { title: "Proveedor contactado", status: "in_progress" },
      { title: "Servicio ejecutado", status: "pending" },
    ];

    const contact = { collaboratorName: "Coordinador Asignado", phone: "+57 300 123 4567" };

    return new Response(
      JSON.stringify({ code, timeline, contact }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
