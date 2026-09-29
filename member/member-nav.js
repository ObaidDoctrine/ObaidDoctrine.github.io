(function(){
"use strict";
const ur=document.documentElement.lang==="ur"||location.pathname.startsWith("/ur/");
const items=[["Dashboard","/member/dashboard/"],["Profile","/member/profile/"],["My Tests","/member/my-tests/"],["Progress","/member/progress/"],["My Library","/member/library/"],["Reflection Journal","/member/journal/"],["Learning Paths","/member/learning-paths/"],["Member Knowledge","/member/knowledge/"],["Recommendations","/member/recommendations/"],["Settings","/member/settings/"],["Privacy","/member/privacy/"],["Log Out","/member/logout/"]];
const labels=ur?{"Dashboard":"ڈیش بورڈ","Profile":"پروفائل","My Tests":"میرے ٹیسٹس","Progress":"پیش رفت","My Library":"میری لائبریری","Reflection Journal":"ریفلیکشن جرنل","Learning Paths":"سیکھنے کے راستے","Member Knowledge":"ممبر نالج","Recommendations":"تجاویز","Settings":"سیٹنگز","Privacy":"پرائیویسی","Log Out":"لاگ آؤٹ"}:Object.fromEntries(items);
const top=document.querySelector(".top");if(!top)return;
let n=top.querySelector("nav");
if(!n){n=document.createElement("nav");n.className="member-nav";top.appendChild(n)}
n.replaceChildren();
n.setAttribute("aria-label",ur?"ممبر نیویگیشن":"Member navigation");
for(const [key,href] of items){
 const a=document.createElement("a");a.href=href;a.textContent=labels[key]||key;
 const current=location.pathname===new URL(href,location.origin).pathname;
 a.setAttribute("aria-current",current?"page":"false");
 a.style.cssText="color:#31543a;font-weight:750;text-decoration:none;padding:8px 9px;border-radius:10px;display:inline-block;white-space:nowrap";
 if(current){a.style.background="#dce8b5";a.style.fontWeight="850"}
 n.appendChild(a);
}
n.style.cssText="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:14px;overflow-x:auto;padding-bottom:2px";
})();