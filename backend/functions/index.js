const { onRequest } = require("firebase-functions/v2/https");
const { verifyFirebaseRequest } = require("./authMiddleware");
const { resolveIdentity, requireRole } = require("./identity");
const { supabaseAdmin, supabaseUrl, supabaseSecretKey } = require("./supabase");

const ALLOWED_ORIGINS = [
  "https://www.obaiddoctrine.com",
  "https://obaiddoctrine.com"
];

const PROFILE_FIELDS = ["display_name", "avatar_url", "preferred_language", "content_preferences"];
const TEST_FIELDS = [
  "test_id", "test_version", "language", "question_count", "answers",
  "dimension_scores", "strongest_dimension", "strongest_label",
  "strongest_description", "score", "completed_at"
];

function pick(source, fields) {
  const out = {};
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(source || {}, field)) out[field] = source[field];
  }
  return out;
}

function sendError(res, error) {
  if (error && error.code === "not-authorized") return res.status(403).json({ error: error.message });
  if (error && error.code === "forbidden") return res.status(403).json({ error: error.message });
  console.error("[OD API]", error);
  return res.status(500).json({ error: "Server error." });
}

exports.api = onRequest(
  {
    region: "asia-southeast1",
    cors: ALLOWED_ORIGINS,
    secrets: [supabaseUrl, supabaseSecretKey]
  },
  async (req, res) => {
    if (req.path === "/health" && req.method === "GET") {
      return res.status(200).json({ ok: true, service: "obaid-doctrine-api" });
    }

    return verifyFirebaseRequest(req, res, async () => {
      try {
        const identity = await resolveIdentity(req.firebaseUser);
        const db = supabaseAdmin();
        const uid = identity.supabase_user_id;

        if (req.path === "/me" && req.method === "GET") {
          const { data: profile, error } = await db
            .from("profiles")
            .select("id,display_name,avatar_url,preferred_language,content_preferences,created_at,updated_at")
            .eq("id", uid)
            .maybeSingle();
          if (error) throw error;
          return res.status(200).json({ identity: { role: identity.role, status: identity.status }, profile });
        }

        if (req.path === "/profile" && req.method === "PATCH") {
          const updates = pick(req.body, PROFILE_FIELDS);
          updates.updated_at = new Date().toISOString();
          const { data, error } = await db.from("profiles").update(updates).eq("id", uid)
            .select("id,display_name,avatar_url,preferred_language,content_preferences,created_at,updated_at").single();
          if (error) throw error;
          return res.status(200).json({ profile: data });
        }

        if (req.path === "/stats" && req.method === "GET") {
          const tables = [
            ["test_results", "test_results"],
            ["saved_articles", "saved_articles"],
            ["learning_progress", "learning_progress"],
            ["reflection_journal_entries", "reflection_journal_entries"]
          ];
          const counts = {};
          for (const [key, table] of tables) {
            const { count, error } = await db.from(table).select("*", { count: "exact", head: true }).eq("user_id", uid);
            if (error) throw error;
            counts[key] = count || 0;
          }
          return res.status(200).json({ counts });
        }

        if (req.path === "/test-results" && req.method === "GET") {
          const { data, error } = await db.from("test_results")
            .select("*").eq("user_id", uid).order("completed_at", { ascending: false });
          if (error) throw error;
          return res.status(200).json({ results: data || [] });
        }

        if (req.path === "/test-results" && req.method === "POST") {
          const payload = pick(req.body, TEST_FIELDS);
          payload.user_id = uid;
          const { data, error } = await db.from("test_results").insert(payload).select("*").single();
          if (error) throw error;
          return res.status(201).json({ result: data });
        }

        if (req.path === "/progress" && req.method === "GET") {
          const { data, error } = await db.from("learning_progress")
            .select("*").eq("user_id", uid).order("updated_at", { ascending: false });
          if (error) throw error;
          return res.status(200).json({ progress: data || [] });
        }

        if (req.path === "/progress" && req.method === "POST") {
          const allowed = pick(req.body, ["resource_type", "resource_path", "status", "started_at", "completed_at"]);
          allowed.user_id = uid;
          allowed.updated_at = new Date().toISOString();
          const { data, error } = await db.from("learning_progress")
            .upsert(allowed, { onConflict: "user_id,resource_type,resource_path" })
            .select("*").single();
          if (error) throw error;
          return res.status(200).json({ progress: data });
        }

        if (req.path === "/saved-articles" && req.method === "GET") {
          const { data, error } = await db.from("saved_articles")
            .select("*").eq("user_id", uid).order("created_at", { ascending: false });
          if (error) throw error;
          return res.status(200).json({ articles: data || [] });
        }

        if (req.path === "/saved-articles" && req.method === "POST") {
          const article_path = String(req.body?.article_path || "");
          const { data, error } = await db.from("saved_articles")
            .upsert({ user_id: uid, article_path }, { onConflict: "user_id,article_path" })
            .select("*").single();
          if (error) throw error;
          return res.status(201).json({ article: data });
        }

        if (req.path === "/saved-articles" && req.method === "DELETE") {
          const article_path = String(req.body?.article_path || "");
          const { error } = await db.from("saved_articles").delete().eq("user_id", uid).eq("article_path", article_path);
          if (error) throw error;
          return res.status(204).send("");
        }

        if (req.path === "/journal" && req.method === "GET") {
          const { data, error } = await db.from("reflection_journal_entries")
            .select("*").eq("user_id", uid).order("updated_at", { ascending: false });
          if (error) throw error;
          return res.status(200).json({ entries: data || [] });
        }

        if (req.path === "/journal" && req.method === "POST") {
          const payload = pick(req.body, ["title", "body", "language", "prompt"]);
          payload.user_id = uid;
          const { data, error } = await db.from("reflection_journal_entries").insert(payload).select("*").single();
          if (error) throw error;
          return res.status(201).json({ entry: data });
        }

        const journalMatch = req.path.match(/^\/journal\/(\d+)$/);
        if (journalMatch) {
          const id = Number(journalMatch[1]);
          if (req.method === "PATCH") {
            const payload = pick(req.body, ["title", "body", "language", "prompt"]);
            payload.updated_at = new Date().toISOString();
            const { data, error } = await db.from("reflection_journal_entries")
              .update(payload).eq("id", id).eq("user_id", uid).select("*").single();
            if (error) throw error;
            return res.status(200).json({ entry: data });
          }
          if (req.method === "DELETE") {
            const { error } = await db.from("reflection_journal_entries").delete().eq("id", id).eq("user_id", uid);
            if (error) throw error;
            return res.status(204).send("");
          }
        }

        if (req.path === "/member-content" && req.method === "GET") {
          const language = req.query.language ? String(req.query.language) : null;
          let query = db.from("member_content").select("*").eq("is_published", true);
          if (language === "en" || language === "ur") query = query.eq("language", language);
          const { data, error } = await query.order("updated_at", { ascending: false });
          if (error) throw error;
          return res.status(200).json({ content: data || [] });
        }

        if (req.path === "/admin/content" && req.method === "GET") {
          requireRole(identity, "admin");
          const { data, error } = await db.from("member_content").select("*").order("updated_at", { ascending: false });
          if (error) throw error;
          return res.status(200).json({ content: data || [] });
        }

        if (req.path === "/admin/content" && req.method === "POST") {
          requireRole(identity, "admin");
          const payload = pick(req.body, ["slug", "language", "category", "title", "summary", "content", "sources", "is_published"]);
          const { data, error } = await db.from("member_content").insert(payload).select("*").single();
          if (error) throw error;
          return res.status(201).json({ content: data });
        }

        const adminContentMatch = req.path.match(/^\/admin\/content\/(\d+)$/);
        if (adminContentMatch) {
          requireRole(identity, "admin");
          const id = Number(adminContentMatch[1]);
          if (req.method === "PATCH") {
            const payload = pick(req.body, ["slug", "language", "category", "title", "summary", "content", "sources", "is_published"]);
            payload.updated_at = new Date().toISOString();
            const { data, error } = await db.from("member_content").update(payload).eq("id", id).select("*").single();
            if (error) throw error;
            return res.status(200).json({ content: data });
          }
          if (req.method === "DELETE") {
            const { error } = await db.from("member_content").delete().eq("id", id);
            if (error) throw error;
            return res.status(204).send("");
          }
        }

        return res.status(404).json({ error: "Endpoint not found." });
      } catch (error) {
        return sendError(res, error);
      }
    });
  }
);
