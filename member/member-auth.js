/* OBAID DOCTRINE — Protected member-page helper */
(function(){
"use strict";
const URL="https://nrckrzgxpxfwuyodbylg.supabase.co";
const KEY="sb_publishable_3_4_B6bd6RplwmOZ81sNiQ_vkiIEKlw";
let ready;
function load(){if(ready)return ready;ready=new Promise((resolve,reject)=>{if(window.supabase)return resolve(window.supabase);const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";s.async=true;s.onload=()=>resolve(window.supabase);s.onerror=reject;document.head.appendChild(s)});return ready}
window.ODMember={
 async client(){const sdk=await load();return sdk.createClient(URL,KEY)},
 async requireSession(){const db=await this.client();const r=await db.auth.getSession();if(!r.data.session){location.href="/account/login/";return null}return r.data.session},
 async logout(){const db=await this.client();return db.auth.signOut()}
};
})();