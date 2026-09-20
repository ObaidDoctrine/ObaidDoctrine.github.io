export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "https://obaiddoctrine.github.io";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors });

    try {
      const body = await request.json();
      const text = typeof body.text === "string" ? body.text.trim() : "";
      const language = body.language === "ur" ? "ur" : "en";

      if (!text) return new Response("Text is required", { status: 400, headers: cors });
      if (text.length > 8000) return new Response("Text is too long", { status: 413, headers: cors });
      if (!env.ELEVENLABS_API_KEY || !env.ELEVENLABS_VOICE_ID) {
        return new Response("TTS service is not configured", { status: 503, headers: cors });
      }

      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/" +
          encodeURIComponent(env.ELEVENLABS_VOICE_ID) +
          "?output_format=mp3_44100_128",
        {
          method: "POST",
          headers: {
            "xi-api-key": env.ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_v3",
            language_code: language
          })
        }
      );

      if (!response.ok) {
        const detail = await response.text();
        return new Response(detail || "TTS provider error", {
          status: response.status,
          headers: cors
        });
      }

      const headers = new Headers(cors);
      headers.set("Content-Type", "audio/mpeg");
      headers.set("Cache-Control", "public, max-age=86400");
      return new Response(response.body, { status: 200, headers });
    } catch {
      return new Response("Invalid request", { status: 400, headers: cors });
    }
  }
};
