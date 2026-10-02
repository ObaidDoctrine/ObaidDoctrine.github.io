const { supabaseAdmin } = require("./supabase");

async function resolveIdentity(firebaseUser) {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("firebase_identities")
    .select("firebase_uid,supabase_user_id,role,status")
    .eq("firebase_uid", firebaseUser.uid)
    .maybeSingle();

  if (error) throw new Error("Identity lookup failed.");
  if (!data || data.status !== "active") {
    const error = new Error("Account is not authorized.");
    error.code = "not-authorized";
    throw error;
  }

  return data;
}

function requireRole(identity, role) {
  if (identity.role !== role) {
    const error = new Error("Insufficient permissions.");
    error.code = "forbidden";
    throw error;
  }
}

module.exports = { resolveIdentity, requireRole };
