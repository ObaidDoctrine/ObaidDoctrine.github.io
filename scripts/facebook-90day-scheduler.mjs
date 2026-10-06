#!/usr/bin/env node
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";

const execFileAsync = promisify(execFile);

/**
 * OBAID DOCTRINE Facebook 90-day scheduler.
 * Safe defaults:
 * - accepts FB_PAGE_ACCESS_TOKEN as either a Page token or a User token
 * - validates the token without exposing it
 * - derives a Page token from /me/accounts only when needed
 * - refuses to publish link posts unless a preflight Page-feed read can prove
 *   the idempotency marker is absent/present
 * - Reels are feature-gated behind ENABLE_REELS=true
 * - SVG image URLs are rasterized to PNG before Facebook photo upload
 */
const required = ["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","FB_PAGE_ACCESS_TOKEN","FB_PAGE_ID","FB_GRAPH_VERSION"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required secret: ${key}`);
}
const SUPABASE_URL = process.env.SUPABASE_URL.replace(/\/$/,"");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const PAGE_ID = process.env.FB_PAGE_ID;
const GRAPH_VERSION = process.env.FB_GRAPH_VERSION;
const ENABLE_REELS = process.env.ENABLE_REELS === "true";
const MAX_ITEMS = Math.max(1, Math.min(Number(process.env.FB_AUTOMATION_BATCH_SIZE || 3), 20));
const IMAGE_CONVERTER = process.env.IMAGE_CONVERTER || (process.platform === "win32" ? "magick" : "convert");

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
  try { data = text ? JSON.parse(text) : text; } catch { data = text; }
  return {status: res.status, ok: res.ok, data};
}

function metaDiagnostic(prefix, status, data) {
  const e = data?.error;
  const parts = [
    `${prefix} (${status})`,
    e?.message ? `message=${e.message}` : null,
    e?.code != null ? `code=${e.code}` : null,
    e?.error_subcode != null ? `subcode=${e.error_subcode}` : null,
    e?.type ? `type=${e.type}` : null,
    e?.fbtrace_id ? `fbtrace_id=${e.fbtrace_id}` : null,
  ].filter(Boolean);
  return parts.join(" | ");
}

async function resolvePageToken() {
  // Prefer /me/accounts first. A User token can also resolve the Page node
  // directly, so checking the Page node first can falsely classify a User
  // token as a Page token. For New Page Experience APIs, that can later fail
  // with Meta error 190/subcode 2069032 because the call requires a Page token.
  const accounts = await graph(`/me/accounts?fields=id,name,tasks,access_token`, {
    headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
  });
  if (accounts.ok) {
    const page = (accounts.data?.data || []).find(x => String(x.id) === String(PAGE_ID));
    if (!page?.access_token) {
      throw new Error("Meta token validation failed: User token is valid, but it cannot provide the configured Page access token.");
    }
    console.log(`Meta token validation: derived Page token for Page ${PAGE_ID} from the configured User token.`);
    return page.access_token;
  }

  // If /me/accounts is not available, test whether the configured secret is
  // itself a usable Page token.
  const direct = await graph(`/${PAGE_ID}?fields=id,name`, {
    headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
  });
  if (direct.ok && String(direct.data?.id) === String(PAGE_ID)) {
    console.log("Meta token validation: configured token works directly as the Page token.");
    return ACCESS_TOKEN;
  }

  throw new Error(metaDiagnostic("Meta token validation failed: configured secret is neither a usable User token for the Page nor a usable Page token", direct.status, direct.data));
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
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PAGE_ID}/posts?fields=${fields}&limit=100`;
  const res = await fetch(url, {headers:{Authorization:`Bearer ${pageToken}`}});
  const data = await res.json();
  if (!res.ok) throw new Error(`NOT_VERIFIED: Page feed preflight failed: ${metaDiagnostic("Meta Page feed read failed", res.status, data)}. Refusing to publish to avoid an unprovable duplicate.`);
  const found = (data.data || []).find(x => typeof x.message === "string" && x.message.includes(marker(post)));
  return found || null;
}

async function preflightExistingPhotoPost(pageToken, post) {
  const fields = encodeURIComponent("id,message,created_time");
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PAGE_ID}/posts?fields=${fields}&limit=100`;
  const res = await fetch(url, {headers:{Authorization:`Bearer ${pageToken}`}});
  const data = await res.json();
  if (!res.ok) throw new Error(`NOT_VERIFIED: Page feed preflight failed: ${metaDiagnostic("Meta Page feed read failed", res.status, data)}. Refusing to publish to avoid an unprovable duplicate.`);
  return (data.data || []).find(x => typeof x.message === "string" && x.message.includes(marker(post))) || null;
}

async function preparePhotoSource(mediaUrl) {
  const response = await fetch(mediaUrl, {headers:{"User-Agent":"OBAID-DOCTRINE-Facebook-Automation/1.0"}});
  if (!response.ok) {
    throw new Error(`NOT_VERIFIED: media_url returned HTTP ${response.status}.`);
  }

  const contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw new Error("NOT_VERIFIED: media_url returned an empty file.");
  if (bytes.length > 4 * 1024 * 1024) throw new Error("NOT_VERIFIED: image exceeds Facebook's 4 MB photo limit.");

  const isSvg = contentType === "image/svg+xml" || /\\.svg(?:$|[?#])/i.test(mediaUrl);
  if (!isSvg) {
    const allowed = new Set(["image/jpeg","image/png","image/gif","image/tiff","image/heic","image/heif","image/webp"]);
    if (!allowed.has(contentType)) {
      throw new Error(`NOT_VERIFIED: unsupported image Content-Type ${contentType || "unknown"}.`);
    }
    return {buffer:bytes, contentType:contentType === "image/jpeg" ? "image/jpeg" : contentType, filename:"facebook-post-image"};
  }

  const dir = await mkdtemp(join(tmpdir(), "obaid-facebook-image-"));
  const input = join(dir, "source.svg");
  const output = join(dir, "source.png");
  try {
    await writeFile(input, bytes);
    await execFileAsync(IMAGE_CONVERTER, [input, "-background", "white", output], {timeout:30000});
    const png = await readFile(output);
    if (!png.length) throw new Error("NOT_VERIFIED: SVG conversion produced an empty PNG.");
    if (png.length > 4 * 1024 * 1024) throw new Error("NOT_VERIFIED: converted PNG exceeds Facebook's 4 MB photo limit.");
    return {buffer:png, contentType:"image/png", filename:"facebook-post-image.png"};
  } catch (error) {
    const detail = error?.stderr?.trim() || error?.message || String(error);
    throw new Error(`NOT_VERIFIED: SVG-to-PNG conversion failed: ${detail}`);
  } finally {
    await rm(dir, {recursive:true, force:true});
  }
}

async function publishPhoto(pageToken, post) {
  if (!post.media_url) throw new Error("NOT_VERIFIED: Image post requires a publicly reachable media_url before publication.");
  const source = await preparePhotoSource(post.media_url);
  const form = new FormData();
  form.append("source", new Blob([source.buffer], {type:source.contentType}), source.filename);
  form.append("caption", messageFor(post));
  const result = await graph(`/${PAGE_ID}/photos`, {
    method:"POST",
    headers:{Authorization:`Bearer ${pageToken}`},
    body:form
  });
  if (!result.ok || !result.data?.id) {
    const err = new Error(metaDiagnostic("Facebook image publication failed", result.status, result.data));
    err.status = result.status; err.meta = result.data; throw err;
  }
  return result.data.post_id || result.data.id;
}

async function verifyPublishedPost(pageToken, externalId) {
  if (!externalId) throw new Error("NOT_VERIFIED: Meta returned no external publication ID.");
  const result = await graph(`/${encodeURIComponent(externalId)}?fields=id,message,created_time`, {
    headers:{Authorization:`Bearer ${pageToken}`}
  });
  if (!result.ok || String(result.data?.id || "") !== String(externalId)) {
    const err = new Error(metaDiagnostic("NOT_VERIFIED: Facebook external post verification failed", result.status, result.data));
    err.status = result.status; err.meta = result.data; throw err;
  }
  return result.data;
}

async function logAttempt(post, status, extra = {}) {
  const attemptedAt = new Date().toISOString();
  return supabase("/rest/v1/facebook_publication_logs?on_conflict=content_post_id,platform,attempt_number", {
    method: "POST",
    headers: {"Prefer":"resolution=merge-duplicates,return=minimal"},
    body: JSON.stringify({
      content_post_id: post.id,
      platform: "facebook",
      attempt_number: post.retry_count,
      status,
      external_post_id: extra.external_post_id || null,
      response_status: extra.response_status ?? null,
      error_message: extra.error_message || null,
      idempotency_key: post.idempotency_key,
      attempted_at: attemptedAt,
      published_at: status === "published" ? attemptedAt : null,
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
  const params = new URLSearchParams({message});
  const result = await graph(`/${PAGE_ID}/feed`, {
    method:"POST",
    headers:{
      "Content-Type":"application/x-www-form-urlencoded",
      Authorization:`Bearer ${pageToken}`
    },
    body:params
  });
  if (!result.ok || !result.data?.id) {
    const err = new Error(metaDiagnostic("Facebook link publication failed", result.status, result.data));
    err.status = result.status;
    err.meta = result.data;
    throw err;
  }
  return result.data.id;
}

async function publishReel(pageToken, post) {
  if (!ENABLE_REELS) throw new Error("NOT_VERIFIED: Reel publishing is feature-gated. ENABLE_REELS is false.");
  if (!post.media_url) throw new Error("NOT_VERIFIED: Reel requires a publicly reachable media_url before publication.");

  const start = await graph(`/${PAGE_ID}/video_reels`, {
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({upload_phase:"start",access_token:pageToken})
  });
  if (!start.ok || !start.data?.video_id || !start.data?.upload_url) {
    const err = new Error(metaDiagnostic("Reel upload initialization failed", start.status, start.data));
    err.status = start.status; err.meta = start.data; throw err;
  }
  const upload = await fetch(start.data.upload_url, {
    method:"POST",
    headers:{Authorization:`OAuth ${pageToken}`, file_url:post.media_url}
  });
  await upload.text();
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
    const err = new Error(metaDiagnostic("Reel publish/finish failed", finish.status, finish.data));
    err.status = finish.status; err.meta = finish.data; throw err;
  }

  // Meta's Reel publish/encoding flow is asynchronous. Verify the returned
  // video object is reachable before marking the database row published.
  const videoId = finish.data?.video_id || start.data.video_id;
  const verify = await graph(`/${videoId}?fields=id,status`, {
    headers:{Authorization:`Bearer ${pageToken}`}
  });
  if (!verify.ok || String(verify.data?.id || "") !== String(videoId)) {
    const err = new Error(metaDiagnostic("NOT_VERIFIED: Reel publish accepted but video verification failed", verify.status, verify.data));
    err.status = verify.status; err.meta = verify.data; throw err;
  }

  return finish.data?.post_id || videoId;
}

async function main() {
  const pageToken = await resolvePageToken();
  const posts = await supabase("/rest/v1/rpc/claim_due_facebook_posts", {
    method:"POST",
    headers:{"Prefer":"return=representation"},
    body:JSON.stringify({p_limit: MAX_ITEMS})
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
      } else if (post.content_type === "image") {
        const existing = await preflightExistingPhotoPost(pageToken, post);
        if (existing?.id) {
          externalId = existing.id;
          await updatePost(post.id, {status:"published", facebook_post_id:externalId, published_at:existing.created_time || new Date().toISOString(), error_message:null});
          await logAttempt(post, "published", {external_post_id:externalId});
          console.log(`Recovered existing image publication for ${post.id}: ${externalId}`);
          continue;
        }
        externalId = await publishPhoto(pageToken, post);
      } else if (post.content_type === "reel") {
        externalId = await publishReel(pageToken, post);
      } else {
        throw new Error(`Content type ${post.content_type} is not enabled by this production scheduler yet.`);
      }

      await verifyPublishedPost(pageToken, externalId);
      await updatePost(post.id, {status:"published", facebook_post_id:externalId, published_at:new Date().toISOString(), error_message:null});
      await logAttempt(post, "published", {external_post_id:externalId, response_status:200});
      console.log(`Published ${post.id} -> ${externalId} (verified)`);
    } catch (error) {
      const message = error?.message || String(error);
      const retryable = error?.status === 408 || error?.status === 429 || (error?.status >= 500 && error?.status <= 599);
      const nextStatus = retryable && post.retry_count < 3 ? "retry_pending" : "failed";
      await updatePost(post.id, {status:nextStatus, error_message:message});
      try { await logAttempt(post, "failed", {response_status:error?.status || null, error_message:message}); } catch {}
      console.error(`Failed ${post.id}: ${message}`);
    }
    await new Promise(r => setTimeout(r, 250));
  }
}

main().catch(error => {
  console.error(error?.stack || error);
  process.exit(1);
});
