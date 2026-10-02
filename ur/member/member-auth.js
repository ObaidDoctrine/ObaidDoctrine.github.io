/* OBAID DOCTRINE — Urdu member helper
 * Uses the same Firebase authentication + backend data facade as English member pages.
 */
(function(){
"use strict";
if(window.ODMember)return;
const s=document.createElement("script");
s.src="/member/member-auth.js?v=20261002";
s.onload=()=>{};
s.onerror=()=>console.error("[OD Urdu Member] Shared member authentication failed to load.");
document.head.appendChild(s);
})();
