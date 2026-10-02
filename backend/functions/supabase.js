const { defineSecret } = require("firebase-functions/params");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = defineSecret("SUPABASE_URL");
const supabaseSecretKey = defineSecret("SUPABASE_SECRET_KEY");

function supabaseAdmin() {
  return createClient(supabaseUrl.value(), supabaseSecretKey.value(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

module.exports = { supabaseAdmin, supabaseUrl, supabaseSecretKey };
