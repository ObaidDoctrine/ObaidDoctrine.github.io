import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://nrckrzgxpxfwuyodbylg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_3_4_B6bd6RplwmOZ81sNiQ_vkiIEKlw";
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const $ = (s) => document.querySelector(s);
const state = { posts: [], editingId: null };

const fields = [
  "day_number","slot","publish_date","publish_time","pillar","topic","subtopic",
  "hook","core_idea","lesson","message","storyline","scenario","metaphor",
  "visual_concept","script","caption","cta","media_url","content_type","status","scheduled_at"
];

function setStatus(message, type="") {
  const el = $("#admin-status");
  el.textContent = message;
  el.dataset.type = type;
}

function normalize(value) {
  return String(value || "").toLowerCase().trim()
    .replace(/\s+/g," ")
    .replace(/[“”‘’'".,!?;:()[\]{}]/g,"");
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2,"0")).join("");
}

function conceptText(post) {
  return [
    post.topic,post.subtopic,post.hook,post.core_idea,post.lesson,post.message,
    post.storyline,post.scenario,post.metaphor,post.visual_concept
  ].map(normalize).filter(Boolean).join(" ");
}

function tokenSet(text) {
  return new Set(text.split(/\s+/).filter(Boolean));
}

function jaccard(a,b) {
  const A=tokenSet(a), B=tokenSet(b);
  if (!A.size || !B.size) return 0;
  let inter=0; for (const x of A) if (B.has(x)) inter++;
  return inter/(A.size+B.size-inter);
}

function findDuplicateCandidate(candidate) {
  const c = conceptText(candidate);
  for (const p of state.posts) {
    if (p.id === state.editingId) continue;
    if (normalize(p.topic) && normalize(p.topic) === normalize(candidate.topic)) {
      return {post:p, reason:"same topic"};
    }
    if (c && jaccard(c, conceptText(p)) >= 0.72) {
      return {post:p, reason:"high concept similarity"};
    }
  }
  return null;
}

function emptyForm() {
  for (const key of fields) {
    const el = document.querySelector(`[name="${key}"]`);
    if (el) el.value = "";
  }
  $("#day_number").value = "1";
  $("#slot").value = "morning";
  $("#content_type").value = "reel";
  $("#status").value = "draft";
  $("#form-title").textContent = "New content item";
  state.editingId = null;
}

function readForm() {
  const post = {};
  for (const key of fields) {
    const el = document.querySelector(`[name="${key}"]`);
    post[key] = el?.value?.trim() || null;
  }
  post.day_number = Number(post.day_number);
  post.id = state.editingId || crypto.randomUUID();
  post.idempotency_key = state.editingId
    ? (state.posts.find(p=>p.id===state.editingId)?.idempotency_key || `facebook-90d:${post.id}`)
    : `facebook-90d:${post.id}`;
  post.content_hash = null;
  return post;
}

async function prepare(post) {
  const hashSource = JSON.stringify({
    day_number:post.day_number,slot:post.slot,pillar:post.pillar,topic:post.topic,
    subtopic:post.subtopic,hook:post.hook,core_idea:post.core_idea,lesson:post.lesson,
    message:post.message,storyline:post.storyline,scenario:post.scenario,metaphor:post.metaphor,
    visual_concept:post.visual_concept,script:post.script,caption:post.caption,cta:post.cta,
    media_url:post.media_url,content_type:post.content_type
  });
  post.content_hash = await sha256(hashSource);
  if (!post.scheduled_at && post.publish_date && post.publish_time) {
    post.scheduled_at = `${post.publish_date}T${post.publish_time}:00+05:00`;
  }
  return post;
}

async function loadPosts() {
  const {data,error}=await db.from("facebook_content_posts").select("*").order("day_number").order("slot");
  if(error) throw error;
  state.posts=data||[];
  render();
}

function stats() {
  const total=state.posts.length;
  const count=s=>state.posts.filter(p=>p.status===s).length;
  $("#stat-total").textContent=total;
  $("#stat-scheduled").textContent=count("scheduled")+count("schedule_pending");
  $("#stat-published").textContent=count("published");
  $("#stat-failed").textContent=count("failed");
  $("#stat-pending").textContent=count("draft")+count("retry_pending")+count("publishing");
  $("#stat-remaining").textContent=Math.max(0,270-total);
}

function renderCalendar() {
  const root=$("#calendar");
  root.innerHTML="";
  for(let day=1;day<=90;day++){
    const card=document.createElement("section");
    card.className="day-card";
    const items=state.posts.filter(p=>p.day_number===day);
    const bySlot=Object.fromEntries(items.map(p=>[p.slot,p]));
    card.innerHTML=`<div class="day-head"><strong>DAY ${day}</strong><span>${items.length}/3</span></div>`;
    for(const slot of ["morning","afternoon","evening"]){
      const p=bySlot[slot];
      const label=slot==="morning"?"Human Behaviour":slot==="afternoon"?"Life Reality / Human Nature":"Self-Awareness / Character";
      const row=document.createElement("button");
      row.type="button"; row.className="slot-row";
      row.innerHTML=p
        ? `<span><b>${slot}</b><small>${escapeHtml(p.topic||"Untitled")}</small></span><em class="status-${p.status}">${p.status}</em>`
        : `<span><b>${slot}</b><small>${label}</small></span><em>EMPTY</em>`;
      if(p) row.onclick=()=>editPost(p.id);
      else row.onclick=()=>{emptyForm();$("#day_number").value=String(day);$("#slot").value=slot;scrollToForm();};
      card.appendChild(row);
    }
    root.appendChild(card);
  }
}

function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

function renderHistory() {
  const root=$("#history");
  const rows=state.posts.filter(p=>p.published_at||p.error_message).slice().sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at)).slice(0,100);
  root.innerHTML=rows.length?rows.map(p=>`<tr><td>Day ${p.day_number} / ${p.slot}</td><td>${escapeHtml(p.topic)}</td><td>${p.published_at?new Date(p.published_at).toLocaleString():"—"}</td><td>${escapeHtml(p.facebook_post_id||"—")}</td><td>${p.status}</td><td>${escapeHtml(p.error_message||"—")}</td></tr>`).join(""):"<tr><td colspan='6'>No publication history yet.</td></tr>";
}

function render(){stats();renderCalendar();renderHistory();}

function editPost(id){
  const p=state.posts.find(x=>x.id===id); if(!p)return;
  state.editingId=id;
  for(const key of fields){const el=document.querySelector(`[name="${key}"]`);if(el)el.value=p[key]??"";}
  $("#form-title").textContent=`Edit Day ${p.day_number} / ${p.slot}`;
  scrollToForm();
}
function scrollToForm(){document.getElementById("editor").scrollIntoView({behavior:"smooth",block:"start"});}

async function savePost(e){
  e.preventDefault();
  try{
    setStatus("Checking duplicate risk…");
    const post=await prepare(readForm());
    if(!post.topic||!post.pillar||!post.day_number||!post.slot) throw new Error("Day, slot, pillar and topic are required.");
    if(post.day_number<1||post.day_number>90) throw new Error("Day must be 1–90.");
    const dup=findDuplicateCandidate(post);
    if(dup) throw new Error(`Duplicate protection blocked this item: ${dup.reason} with Day ${dup.post.day_number} / ${dup.post.slot}.`);
    const payload={...post};
    delete payload.id;
    if(state.editingId){
      const {error}=await db.from("facebook_content_posts").update(payload).eq("id",state.editingId);
      if(error)throw error;
    }else{
      payload.id=post.id;
      const {error}=await db.from("facebook_content_posts").insert(payload);
      if(error)throw error;
    }
    setStatus("Saved.", "success"); emptyForm(); await loadPosts();
  }catch(err){console.error(err);setStatus(err.message||"Save failed.","error");}
}

async function signIn(e){
  e.preventDefault();
  setStatus("Signing in…");
  const {error}=await db.auth.signInWithPassword({email:$("#login-email").value.trim(),password:$("#login-password").value});
  if(error){setStatus(error.message,"error");return;}
  await bootstrap();
}

async function bootstrap(){
  const {data:{session}}=await db.auth.getSession();
  if(!session){$("#login").hidden=false;$("#app").hidden=true;return;}
  const {data:admin,error}=await db.from("facebook_admin_users").select("user_id").eq("user_id",session.user.id).maybeSingle();
  if(error||!admin){await db.auth.signOut();$("#login").hidden=false;$("#app").hidden=true;setStatus("This account is not authorized for Facebook automation.","error");return;}
  $("#login").hidden=true;$("#app").hidden=false;setStatus("Admin session verified.","success");
  await loadPosts();
}

$("#login-form").addEventListener("submit",signIn);
$("#editor-form").addEventListener("submit",savePost);
$("#new-post").addEventListener("click",()=>{emptyForm();scrollToForm();});
$("#cancel-edit").addEventListener("click",emptyForm);
$("#logout").addEventListener("click",async()=>{await db.auth.signOut();location.reload();});
bootstrap();
