/* OBAID DOCTRINE — Member learning-progress tracker
 * Records only authenticated member activity. RLS remains the authorization boundary.
 */
(function(){
"use strict";
const SUPABASE_URL="https://nrckrzgxpxfwuyodbylg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_3_4_B6bd6RplwmOZ81sNiQ_vkiIEKlw";
let clientPromise=null;
function load(){if(clientPromise)return clientPromise;clientPromise=new Promise((resolve,reject)=>{if(window.supabase&&window.supabase.createClient)return resolve(window.supabase);const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";s.async=true;s.onload=()=>resolve(window.supabase);s.onerror=reject;document.head.appendChild(s)});return clientPromise}
async function db(){const sdk=await load();return sdk.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY)}
window.ODProgress={
 async complete(type,path){
  try{
   if(!["article","test","learning_path"].includes(type)||typeof path!=="string"||!path.startsWith("/")||path.startsWith("//"))return {saved:false,reason:"invalid"};
   const supabase=await db();const s=(await supabase.auth.getSession()).data.session;
   if(!s||!s.user)return {saved:false,reason:"visitor"};
   const now=new Date().toISOString();
   const r=await supabase.from("learning_progress").upsert({user_id:s.user.id,resource_type:type,resource_path:path,status:"completed",completed_at:now,updated_at:now},{onConflict:"user_id,resource_type,resource_path"}).select("id").single();
   if(r.error){console.warn("[Obaid Doctrine] Progress not saved:",r.error.message);return {saved:false,reason:"database_error"}}
   if(window.ODAnalytics){ODAnalytics.track("content_complete",{resource_type:type})}
   return {saved:true,id:r.data&&r.data.id};
  }catch(e){console.warn("[Obaid Doctrine] Progress tracker unavailable:",e);return {saved:false,reason:"connector_error"}}
 }
};
})();