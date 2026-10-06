#!/usr/bin/env node
/**
 * OBAID DOCTRINE Facebook 90-day scheduler.
 * Safe defaults:
 * - uses the existing FB_PAGE_ACCESS_TOKEN secret as the Meta user token
 * - derives a Page token at runtime
 * - refuses to publish link posts unless a preflight Page-feed read can prove
 *   the idempotency marker is absent/present
 * - Reels are feature-gated behind ENABLE_REELS=true
 */
const required = ["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","FB_PAGE_ACCESS_TOKEN","FB_PAGE_ID","FB_GRAPH_VERSION"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required secret: ${key}`);
}
const SUPABASE_URL = process.env.SUPABASE_URL.replace(/\/$/,"");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const PAGE_ID = process.env.FB_PAGE_ID;
const GRAPH_VERSION = process.env.FB_GRAPH_VERSION;
const ENABLE_REELS = process.env.ENABLE_REELS === "true";
const MAX_ITEMS = Math.max(1, Math.min(Number(process.env.FB_AUTOMATION_BATCH_SIZE || 3), 20));

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function supabase(path, options = {}) {
  const headers = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    ...options.headers,
  };
  const res = await fetch(`${SUPABASE_URL}${path}`, {...options, headers});
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(`Supabase ${res.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function graph(path, options = {}) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}${path}`;
  const res = await fetch(url, options);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return {status: res.status, ok: res.ok, data};
}

async function getPageToken() {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/me/accounts?fields=id,name,tasks,access_token&access_token=${encodeURIComponent(USER_TOKEN)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(`Meta token/account lookup failed (${res.status}).`);
  const page = (data.data || []).find(x => x.id === PAGE_ID);
  if (!page?.access_token) throw new Error("Meta token cannot provide the configured Page access token.");
  return page.access_token;
}

function marker(post) {
  return `OD-AUTO:${post.idempotency_key}`;
}

function messageFor(post) {
  const parts = [];
  if (post.caption) parts.push(post.caption);
  if (post.cta) parts.push(post.cta);
  if (post.media_url && post.content_type === "link") parts.push(post.media_url);
  parts.push(`— Obaid Doctrine\n${marker(post)}`);
  return parts.filter(Boolean).join("\n\n");
}

async function preflightExistingPagePost(pageToken, post) {
  const fields = encodeURIComponent("id,message,created_time");
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PAGE_ID}/posts?fields=${fields}&limit=100&access_token=${encodeURIComponent(pageToken)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(`NOT_VERIFIED: Page feed preflight failed (${res.status}). Refusing to publish to avoid an unprovable duplicate.`);
  const found = (data.data || []).find(x => typeof x.message === "string" && x.message.includes(marker(post)));
  return found || null;
}

async function logAttempt(post, status, extra = {}) {
  return supabase("/rest/v1/facebook_publication_logs", {
    method: "POST",
    headers: {"Prefer":"return=minimal"},
    body: JSON.stringify({
      content_post_id: post.id,
      platform: "facebook",
      attempt_number: post.retry_count,
      status,
      external_post_id: extra.external_post_id || null,
      response_status: extra.response_status ?? null,
      error_message: extra.error_message || null,
      idempotency_key: post.idempotency_key,
      attempted_at: new Date().toISOString(),
      published_at: status === "published" ? new Date().toISOString() : null,
    })
  });
}

async function updatePost(id, patch) {
  await supabase(`/rest/v1/facebook_content_posts?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {"Prefer":"return=minimal"},
    body: JSON.stringify(patch)
  });
}

async function publishLink(pageToken, post) {
  const message = messageFor(post);
  const params = new URLSearchParams({message, access_token: pageToken});
  const result = await graph(`/${PAGE_ID}/feed`, {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:params});
  if (!result.ok || !result.data?.id) {
    const err = new Error(`Facebook link publication failed (${result.status}).`);
    err.status = result.status;
    err.meta = result.data;
    throw err;
  }
  return result.data.id;
}

async function publishReel(pageToken, post) {
  if (!ENABLE_REELS) throw new Error("NOT_VERIFIED: Reel publishing is feature-gated. ENABLE_REELS is false until current Meta permissions/API behavior are verified with the live Page credentials.");
  if (!post.media_url) throw new Error("Reel requires media_url.");
  const start = await graph(`/${PAGE_ID}/video_reels`, {
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({upload_phase:"start",access_token:pageToken})
  });
  if (!start.ok || !start.data?.video_id || !start.data?.upload_url) {
    const err = new Error(`Reel upload initialization failed (${start.status}).`);
    err.status = start.status; err.meta = start.data; throw err;
  }
  const upload = await fetch(start.data.upload_url, {
    method:"POST",
    headers:{Authorization:`OAuth ${pageToken}`, file_url:post.media_url}
  });
  const uploadText = await upload.text();
  if (!upload.ok) throw new Error(`Reel media upload failed (${upload.status}).`);
  const finishParams = new URLSearchParams({
    upload_phase:"finish",
    video_id:start.data.video_id,
    video_state:"PUBLISHED",
    access_token:pageToken,
  });
  if (post.caption) finishParams.set("description", post.caption);
  if (post.topic) finishParams.set("title", post.topic.slice(0,100));
  const finish = await graph(`/${PAGE_ID}/video_reels`, {
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:finishParams
  });
  if (!finish.ok) {
    const err = new Error(`Reel publish/finish failed (${finish.status}).`);
    err.status = finish.status; err.meta = finish.data; throw err;
  }
  return finish.data?.post_id || finish.data?.video_id || start.data.video_id;
}

async function main() {
  const pageToken = await getPageToken();
  const posts = await supabase(`/rest/v1/rpc/claim_due_facebook_posts?select=*&p_limit=${MAX_ITEMS}`, {
    method:"POST",
    headers:{"Prefer":"return=representation"},
    body:"{}"
  });
  if (!Array.isArray(posts) || posts.length === 0) {
    console.log("No due Facebook automation items.");
    return;
  }

  for (const post of posts) {
    try {
      await logAttempt(post, "started");
      if (post.facebook_post_id) {
        await updatePost(post.id, {status:"published", published_at:post.published_at || new Date().toISOString(), error_message:null});
        await logAttempt(post, "skipped", {external_post_id:post.facebook_post_id});
        continue;
      }

      let externalId;
      if (post.content_type === "link") {
        const existing = await preflightExistingPagePost(pageToken, post);
        if (existing?.id) {
          externalId = existing.id;
          await updatePost(post.id, {status:"published", facebook_post_id:externalId, published_at:existing.created_time || new Date().toISOString(), error_message:null});
          await logAttempt(post, "published", {external_post_id:externalId});
          console.log(`Recovered existing publication for ${post.id}: ${externalId}`);
          continue;
        }
        externalId = await publishLink(pageToken, post);
      } else if (post.content_type === "reel") {
        externalId = await publishReel(pageToken, post);
      } else {
        throw new Error(`Content type ${post.content_type} is not enabled by this production scheduler yet.`);
      }

      await updatePost(post.id, {status:"published", facebook_post_id:externalId, published_at:new Date().toISOString(), error_message:null});
      await logAttempt(post, "published", {external_post_id:externalId, response_status:200});
      console.log(`Published ${post.id} -> ${externalId}`);
    } catch (error) {
      const message = error?.message || String(error);
      const retryable = error?.status === 408 || error?.status === 429 || (error?.status >= 500 && error?.status <= 599);
      const nextStatus = retryable && post.retry_count < 3 ? "retry_pending" : "failed";
      await updatePost(post.id, {status:nextStatus, error_message:message});
      try { await logAttempt(post, "failed", {response_status:error?.status || null, error_message:message}); } catch {}
      console.error(`Failed ${post.id}: ${message}`);
    }
    await sleep(250);
  }
}

main().catch(error => {
  console.error(error?.stack || error);
  process.exit(1);
});
