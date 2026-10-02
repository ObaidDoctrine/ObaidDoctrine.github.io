const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { createClient } = require("@supabase/supabase-js");
const { verifyFirebaseRequest } = require("./authMiddleware");

const supabaseUrl = defineSecret("SUPABASE_URL");
const supabaseServiceRoleKey = defineSecret("SUPABASE_SECRET_KEY");

function supabaseAdmin() {
  return createClient(supabaseUrl.value(), supabaseServiceRoleKey.value(), {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

exports.api = onRequest(
  {
    region: "asia-southeast1",
    cors: true,
    secrets: [supabaseUrl, supabaseServiceRoleKey]
  },
  async (req, res) => {
    if (req.method === "OPTIONS") return res.status(204).send("");

    if (req.path === "/health") {
      return res.status(200).json({ ok: true, service: "obaid-doctrine-api" });
    }

    return verifyFirebaseRequest(req, res, async () => {
      if (req.method === "GET" && req.path === "/me") {
        const firebaseUid = req.firebaseUser.uid;
        const db = supabaseAdmin();

        const { data, error } = await db
          .from("firebase_identities")
          .select("firebase_uid,supabase_user_id,role,status")
          .eq("firebase_uid", firebaseUid)
          .maybeSingle();

        if (error) {
          console.error("[OD API] Identity lookup failed:", error);
          return res.status(500).json({ error: "Identity lookup failed." });
        }

        if (!data || data.status !== "active") {
          return res.status(403).json({ error: "Account is not authorized." });
        }

        return res.status(200).json({
          firebase_uid: data.firebase_uid,
          role: data.role,
          status: data.status
        });
      }

      return res.status(404).json({ error: "Endpoint not found." });
    });
  }
);
