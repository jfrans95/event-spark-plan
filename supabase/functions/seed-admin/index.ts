// Supabase Edge Function: seed-admin (idempotent)
// Creates or promotes a default administrator using the Service Role key
// Protected via SEED_SECRET header

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-seed-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const providedSecret = req.headers.get("x-seed-secret");
  const seedSecret = Deno.env.get("SEED_SECRET");
  if (!seedSecret || providedSecret !== seedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://uuioedhcwydmtoywyvtq.supabase.co";
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SERVICE_ROLE) {
    return new Response(JSON.stringify({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  const ADMIN = {
    email: "frans.corporativo@gmail.com",
    password: "Kivaje24",
    full_name: "Jonathan Franswa Cardona Gamas",
  } as const;

  try {
    // 1) Try to create the user (idempotent)
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: ADMIN.email,
      password: ADMIN.password,
      email_confirm: true,
      user_metadata: { full_name: ADMIN.full_name },
      app_metadata: { role: "admin" },
    });

    // 2) Find existing if creation failed
    const user = created?.user ?? (await findUserByEmail(supabase, ADMIN.email));
    if (!user) {
      throw new Error(createErr?.message || "No se pudo obtener/crear el usuario admin");
    }

    // 3) Ensure role and metadata
    const { error: promoteErr } = await supabase.auth.admin.updateUserById(user.id, {
      app_metadata: { role: "admin" },
      user_metadata: { full_name: ADMIN.full_name },
    });
    if (promoteErr) throw promoteErr;

    // 4) Upsert profile with role admin
    const { error: upsertErr } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          email: ADMIN.email,
          full_name: ADMIN.full_name,
          role: "admin",
        },
        { onConflict: "user_id" }
      );
    if (upsertErr) throw upsertErr;

    return new Response(
      JSON.stringify({ ok: true, user_id: user.id, email: ADMIN.email }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e?.message || String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function findUserByEmail(supabase: ReturnType<typeof createClient>, email: string) {
  let page = 1;
  const perPage = 200;
  // Iterate pages until found or exhausted
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) break;
    page++;
  }
  return null;
}
