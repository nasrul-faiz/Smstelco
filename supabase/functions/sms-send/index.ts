import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // GET /sms-send/status/:textId
    if (req.method === "GET" && url.pathname.includes("/status/")) {
      const parts = url.pathname.split("/status/");
      const textId = parts[parts.length - 1];
      if (!textId) {
        return new Response(
          JSON.stringify({ error: "textId diperlukan" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const res = await fetch(`https://textbelt.com/status/${encodeURIComponent(textId)}`);
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /sms-send/quota/:key
    if (req.method === "GET" && url.pathname.includes("/quota/")) {
      const parts = url.pathname.split("/quota/");
      const key = parts[parts.length - 1];
      if (!key) {
        return new Response(
          JSON.stringify({ error: "key diperlukan" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const res = await fetch(`https://textbelt.com/quota/${encodeURIComponent(key)}`);
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /sms-send — send SMS
    if (req.method === "POST") {
      const { phone, message, key } = await req.json();

      if (!phone || !message || !key) {
        return new Response(
          JSON.stringify({ success: false, error: "Parameter phone, message dan key diperlukan." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Textbelt requires application/x-www-form-urlencoded
      const body = new URLSearchParams({ phone, message, key });
      const res = await fetch("https://textbelt.com/text", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Kaedah tidak disokong" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_err) {
    return new Response(
      JSON.stringify({ success: false, error: "Ralat pelayan dalaman." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
