/* OBAID DOCTRINE — Mind Tests Engine
 * Version 2026-10-03
 * Educational self-reflection only. No diagnosis, clinical scoring or fabricated norms.
 */
(function(){
"use strict";
var source=typeof questions!=="undefined"?questions:(typeof Q!=="undefined"?Q:null);
if(!Array.isArray(source)||!source.length){console.error("Mind Test: no questions");return;}
var dimensionData=typeof dimensions!=="undefined"?dimensions:(typeof D!=="undefined"?D:null);
var labelData=typeof labels!=="undefined"?labels:null;
var descriptionData=typeof desc!=="undefined"?desc:null;
var slug=(location.pathname.split("/").filter(Boolean).pop()||"").toLowerCase();
var meta=(window.OD_TEST_META&&window.OD_TEST_META[slug])||{};
var lang=document.documentElement.dir==="rtl"?"ur":"en";
var copy=meta[lang]||{};
var isRTL=lang==="ur";
var items=source.slice(0,10);
var pathKey=location.pathname.replace(/\/+$/,"")||"/";
var storageKey="od-test-state-v2:"+pathKey;
var state={index:0,answers:[],locked:false,completed:false};
try{var saved=JSON.parse(sessionStorage.getItem(storageKey)||"null");if(saved&&Array.isArray(saved.answers)&&Number.isInteger(saved.index)&&saved.index>=0&&saved.index<=items.length){state.index=saved.index;state.answers=saved.answers.slice(0,items.length);state.completed=state.index>=items.length;}}catch(_){}
function save(){try{sessionStorage.setItem(storageKey,JSON.stringify({index:state.index,answers:state.answers}));}catch(_){}}
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
function getQuestion(q){return{text:q[0],options:Array.isArray(q[1])?q[1]:[],scores:Array.isArray(q[2])?q[2]:null,values:Array.isArray(q[3])?q[3]:null};}
function dimensionsCount(){return dimensionData&&dimensionData.length?dimensionData.length:(labelData&&labelData.length?labelData.length:5);}
function scoreAnswers(){
 var n=dimensionsCount(),scores=Array(n).fill(0),maxes=Array(n).fill(0);
 // Add each question's maximum available value once per dimension, not every option value.
 items.forEach(function(item){
  var q=getQuestion(item),questionMaxes=Array(n).fill(0);
  q.options.forEach(function(_,i){
   var d=q.scores?q.scores[i]:i;
   var raw=q.values?q.values[i]:1;
   var v=Number(raw);
   if(!Number.isFinite(v))v=1;
   if(Number.isInteger(d)&&d>=0&&d<n)questionMaxes[d]=Math.max(questionMaxes[d],v);
  });
  questionMaxes.forEach(function(v,d){maxes[d]+=v;});
 });
 state.answers.forEach(function(answer,index){
  var q=getQuestion(items[index]);
  if(!q||!Number.isInteger(answer)||answer<0||answer>=q.options.length)return;
  var d=q.scores?q.scores[answer]:answer;
  var raw=q.values?q.values[answer]:1;
  var v=Number(raw);
  if(!Number.isFinite(v))v=1;
  if(Number.isInteger(d)&&d>=0&&d<n)scores[d]+=v;
 });
 return{scores:scores,maxes:maxes};
}
function labelAt(i){if(dimensionData&&dimensionData[i])return dimensionData[i][0];if(labelData&&labelData[i])return labelData[i];return isRTL?"نمایاں رجحان":"Response pattern";}
function descAt(i){if(dimensionData&&dimensionData[i])return dimensionData[i][1];if(descriptionData&&descriptionData[i])return descriptionData[i];return isRTL?"یہ آپ کے جوابات میں ایک نمایاں رجحان کی تعلیمی وضاحت ہے۔":"This describes a response tendency represented in your answers.";}
function intro(){var lead=document.querySelector(".lead");if(lead&&meta.intro){lead.textContent=isRTL?(meta.intro.ur||lead.textContent):(meta.intro.en||lead.textContent);}}
function injectStyles(){
 if(document.getElementById("od-test-engine-styles"))return;
 var s=document.createElement("style");s.id="od-test-engine-styles";
 s.textContent=`
.od-test-progress{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px;font-weight:800;color:#21324d;font-size:14px}
.od-test-progress-bar{height:9px;background:#e8edf5;border-radius:999px;overflow:hidden;margin:0 0 28px}.od-test-progress-bar>span{display:block;height:100%;background:linear-gradient(90deg,#ff9a42,#f47721);border-radius:inherit;transition:width .25s ease;box-shadow:0 0 12px rgba(244,119,33,.24)}
.od-test-option{position:relative;display:flex;align-items:center;gap:14px;width:100%;min-height:68px;padding:16px 18px!important;border:1px solid #dfe5ef!important;border-radius:17px!important;background:#fff!important;color:#1b2942!important;text-align:start!important;font-family:inherit!important;font-size:16px!important;font-weight:600!important;line-height:1.75!important;box-shadow:0 3px 8px rgba(20,37,66,.025)!important;cursor:pointer;scroll-margin-top:110px;transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease!important}
.od-test-option:before{content:"";width:21px;height:21px;flex:0 0 21px;border:2px solid #aab5c8;border-radius:50%;background:#fff;box-shadow:inset 0 0 0 4px #fff;order:-1}
.od-test-option:hover:not(:disabled){transform:translateY(-2px);border-color:#f47721!important;background:#fffaf6!important;box-shadow:0 9px 22px rgba(22,36,65,.07)!important}
.od-test-option.od-selected{background:#fff1e4!important;border-color:#f47721!important;color:#18243a!important;box-shadow:0 0 0 2px rgba(244,119,33,.12)!important}.od-test-option.od-selected:before{border-color:#f47721;background:#f47721}.od-test-option.od-locked{cursor:not-allowed;opacity:1}.od-test-option.od-locked:not(.od-selected){background:#fbfcfe!important;color:#68758a!important;box-shadow:none!important}
.od-result-grid{display:grid;gap:12px;margin:22px 0}.od-result-row{padding:13px 15px;border:1px solid #e4eaf3;border-radius:14px;background:#f8faff}.od-result-row strong{display:flex;justify-content:space-between;gap:12px}.od-result-track{height:6px;background:#e9edf5;border-radius:99px;overflow:hidden;margin-top:9px}.od-result-track span{display:block;height:100%;background:linear-gradient(90deg,#ff9a42,#f47721);border-radius:inherit}
.od-evidence{margin-top:22px;padding:16px;border:1px solid #e4eaf3;border-radius:16px;background:#f8faff}.od-evidence ul{margin:.5rem 0 0;padding-inline-start:1.2rem}.od-evidence a{color:#c85a0b;font-weight:700}
.od-test-note{margin-top:18px;padding:14px 16px;border-inline-start:4px solid #f47721;background:#fff8f2;border-radius:14px;color:#59655c;line-height:1.7}.od-test-share{display:flex;flex-wrap:wrap;gap:9px;margin-top:22px}.od-test-share button,.od-test-share a{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:9px 13px;border:1px solid #f1c7a8;border-radius:999px;background:#fff8f2;color:#a84908;text-decoration:none;font:700 12px/1.4 Inter,Arial,sans-serif;cursor:pointer}
body:has(#test){background:radial-gradient(ellipse at 85% 12%,rgba(244,119,33,.08),transparent 32%),#f7f8fc;color:#111b32}
.site-header{background:rgba(255,255,255,.94);border-bottom:1px solid #e5e9f2;box-shadow:0 6px 24px rgba(16,30,58,.06)}
.page-hero{position:relative;isolation:isolate;overflow:hidden;width:min(1240px,calc(100% - 32px));margin:24px auto 0;padding:clamp(28px,5vw,62px);border:0!important;border-radius:28px!important;background:radial-gradient(circle at 12% 18%,rgba(244,119,33,.24),transparent 27%),linear-gradient(125deg,#07172f 0%,#102d53 60%,#173a63 100%)!important;color:#fff!important;box-shadow:0 22px 52px rgba(12,31,60,.16)}
.page-hero:after{content:"";position:absolute;z-index:-1;width:240px;height:240px;right:-90px;bottom:-140px;border:1px solid rgba(255,255,255,.18);border-radius:50%;box-shadow:0 0 0 28px rgba(255,255,255,.035),0 0 0 58px rgba(255,255,255,.025)}
.page-hero .eyebrow{color:#ffb16e;letter-spacing:.13em}.page-hero h1{max-width:900px;color:#fff!important;font-size:clamp(32px,5.2vw,58px)!important;line-height:1.16!important;letter-spacing:-.035em}.page-hero .lead{max-width:760px;color:#e1e9f6!important;font-size:clamp(16px,2vw,20px);line-height:1.85}
.content-wrap{width:min(980px,calc(100% - 32px));margin:0 auto;padding:30px 0 64px}.test-note{padding:16px 18px;border:1px solid #f5d6bd;border-inline-start:4px solid #f47721;border-radius:16px;background:#fff8f2;color:#5c514b;box-shadow:0 5px 18px rgba(22,34,55,.035)}
#test{margin:28px 0 22px;padding:clamp(18px,3.5vw,34px);border:1px solid #e5e9f2;border-radius:26px;background:rgba(255,255,255,.96);box-shadow:0 18px 48px rgba(22,36,65,.085)}
.test-question{display:grid;gap:12px}.test-question h2{margin:0 0 12px;padding:clamp(18px,3vw,30px);border-radius:20px;background:linear-gradient(120deg,#fff1e4,#fff8f2);color:#101d36;font-size:clamp(21px,3vw,32px);line-height:1.65;letter-spacing:-.02em;border:1px solid #ffead9}
.mind-result{padding:clamp(20px,4vw,38px);border:1px solid #e3e8f1;border-radius:26px;background:#fff;box-shadow:0 18px 48px rgba(22,36,65,.08)}.mind-result h2,.mind-result h3{color:#122443}
html[dir=rtl] .od-test-share{justify-content:flex-start}html[dir=rtl] .page-hero{text-align:right}html[dir=rtl] .od-test-option{direction:rtl}html[dir=rtl] .test-question h2{line-height:1.85}html[dir=rtl] .od-test-note{border-radius:14px}
@media(max-width:640px){.page-hero{width:calc(100% - 20px);margin-top:12px;padding:26px 22px;border-radius:22px!important}.page-hero h1{font-size:clamp(28px,8vw,38px)!important}.content-wrap{width:calc(100% - 20px);padding-top:20px}#test{margin:20px 0;padding:14px;border-radius:20px}.test-question{gap:10px}.test-question h2{padding:17px 15px;font-size:21px;border-radius:16px}.od-test-option{min-height:62px;padding:13px 14px!important;font-size:15px!important;border-radius:14px!important;gap:10px}.od-test-option:before{width:19px;height:19px;flex-basis:19px}.od-test-progress{font-size:12px}.od-test-progress-bar{margin-bottom:20px}.od-test-share{display:grid;grid-template-columns:1fr 1fr}.od-test-share button,.od-test-share a{width:100%}}
@media(prefers-reduced-motion:reduce){.od-test-option,.od-test-progress-bar>span{transition:none!important}}
`;
 document.head.appendChild(s);
}
function render(){
 var host=document.getElementById("test");if(!host)return;if(state.index>=items.length){showResult();return;}
 var q=getQuestion(items[state.index]);state.locked=false;host.hidden=false;
 host.innerHTML='<div class="od-test-progress"><span>'+ (isRTL?"سوال ":"Question ")+(state.index+1)+(isRTL?" از ":" of ")+items.length+'</span><span>'+Math.round(((state.index)/items.length)*100)+'%</span></div><div class="od-test-progress-bar" aria-hidden="true"><span style="width:'+Math.round((state.index/items.length)*100)+'%"></span></div><div class="test-question"><h2>'+esc(q.text)+'</h2>'+q.options.map(function(o,j){return'<button type="button" class="test-option od-test-option" data-answer="'+j+'" aria-label="'+esc(o)+'">'+esc(o)+'</button>';}).join("")+'</div>';
 host.querySelectorAll(".od-test-option").forEach(function(b){b.addEventListener("click",function(){choose(Number(b.dataset.answer),b);});});
}
function choose(i,button){
 if(state.locked||state.index>=items.length)return;var q=getQuestion(items[state.index]);if(!q.options[i])return;state.locked=true;state.answers[state.index]=i;save();
 document.querySelectorAll(".od-test-option").forEach(function(b){b.disabled=true;b.classList.add("od-locked");});button.classList.add("od-selected");button.setAttribute("aria-pressed","true");
 setTimeout(function(){state.index++;save();render();var t=document.getElementById("test");if(t){var header=document.querySelector(".site-header");var headerHeight=header?header.getBoundingClientRect().height:0;var targetTop=t.getBoundingClientRect().top+window.scrollY-headerHeight-24;window.scrollTo({top:Math.max(0,targetTop),behavior:"auto"});}},180);
}
function shareButtons(){
 var title=document.querySelector("main h1")?.textContent.trim()||document.title,url=location.href;
 var text=isRTL?"میں نے OBAID DOCTRINE کا تعلیمی خود شناسی ٹیسٹ مکمل کیا۔":"I completed an OBAID DOCTRINE educational self-reflection test.";
 var wrap=document.createElement("div");wrap.className="od-test-share";wrap.setAttribute("aria-label",isRTL?"نتیجہ شیئر کریں":"Share result");
 var native=document.createElement("button");native.type="button";native.textContent=isRTL?"شیئر کریں":"Share";native.onclick=function(){if(navigator.share)navigator.share({title:title,text:text,url:url}).catch(function(){});else navigator.clipboard?.writeText(url);};wrap.appendChild(native);
 [["Facebook","https://www.facebook.com/sharer/sharer.php?u="],[ "WhatsApp","https://wa.me/?text="],[ "LinkedIn","https://www.linkedin.com/sharing/share-offsite/?url="]].forEach(function(x){var a=document.createElement("a");a.href=x[1]+encodeURIComponent(url);a.target="_blank";a.rel="noopener noreferrer";a.textContent=x[0];wrap.appendChild(a);});
 return wrap;
}
function showResult(){
 var host=document.getElementById("test"),result=document.getElementById("result");if(!host||!result)return;state.completed=true;state.locked=true;save();
 var out=scoreAnswers(),scores=out.scores,maxes=out.maxes;
 var ranked=scores.map(function(s,i){return{i:i,s:s,max:maxes[i]||0};}).sort(function(a,b){return b.s-a.s;});
 var top=ranked[0],topLabel=labelAt(top.i);
 var introText=isRTL?"آپ کے جوابات میں یہ رجحان سب سے زیادہ نمایاں رہا۔":"This was the most represented response tendency in your answers.";
 var html='<p class="eyebrow">'+(isRTL?"آپ کا تعلیمی خود شناسی نتیجہ":"YOUR EDUCATIONAL REFLECTION RESULT")+'</p><h2>'+esc(topLabel)+'</h2><p>'+esc(descAt(top.i))+'</p>';
 html+='<div class="od-test-note"><strong>'+(isRTL?"اس نتیجے کو کیسے سمجھیں:":"How to read this result:")+'</strong> '+esc(introText+" "+(meta.evidence||"This is an original educational self-reflection tool, not a validated clinical instrument."))+'</div>';
 html+='<h3 style="margin-top:28px">'+(isRTL?"آپ کا مکمل جواب پروفائل":"Your response profile")+'</h3><div class="od-result-grid">';
 ranked.forEach(function(r){var pct=r.max?Math.round((r.s/r.max)*100):0;html+='<div class="od-result-row"><strong><span>'+esc(labelAt(r.i))+'</span><span>'+r.s+(r.max?" / "+r.max:"")+'</span></strong><div class="od-result-track"><span style="width:'+pct+'%"></span></div></div>';});
 html+='</div>';
 if(copy.recommendations&&copy.recommendations.length){html+='<h3>'+(isRTL?"عملی اگلے قدم":"Evidence-informed next steps")+'</h3><ul>'+copy.recommendations.map(function(x){return'<li>'+esc(x)+'</li>';}).join("")+'</ul>';}
 if(copy.reflection&&copy.reflection.length){html+='<h3 style="margin-top:24px">'+(isRTL?"غور کے سوالات":"Reflection questions")+'</h3><ul>'+copy.reflection.map(function(x){return'<li>'+esc(x)+'</li>';}).join("")+'</ul>';}
 html+='<div class="od-evidence"><strong>'+(isRTL?"تحقیقی بنیاد":"Evidence basis")+'</strong><p>'+esc(meta.evidence||"Original educational questionnaire informed by psychological literature.")+'</p><p><strong>'+(isRTL?"اہم حدود:":"Important limitations:")+'</strong> '+esc(meta.limitations||"Self-report results depend on context and should not be treated as diagnosis.")+'</p>';
 if(meta.refs&&meta.refs.length){html+='<p><strong>'+(isRTL?"حوالہ جات:":"Research references:")+'</strong></p><ul>'+meta.refs.map(function(r){return'<li><a href="'+esc(r[1])+'" target="_blank" rel="noopener noreferrer">'+esc(r[0])+'</a></li>';}).join("")+'</ul>';}
 html+='</div>';
 if(["stress-response","emotional-intelligence","resilience-adaptability"].indexOf(slug)>=0){html+='<div class="od-test-note"><strong>'+(isRTL?"پیشہ ورانہ مدد:":"Professional support:")+'</strong> '+(isRTL?"اگر یہ موضوع آپ کو مسلسل شدید پریشانی دے رہا ہے یا روزمرہ زندگی، کام، تعلیم یا تعلقات پر نمایاں اثر ڈال رہا ہے تو کسی qualified mental health professional سے بات کرنا مناسب ہو سکتا ہے۔":"If this topic is causing persistent significant distress or is interfering with daily life, work, study or relationships, consider speaking with a qualified mental health professional.")+'</div>';}
 result.hidden=false;host.hidden=true;result.innerHTML=html;
 var actions=document.createElement("div");actions.className="mind-test-actions";var retry=document.createElement("button");retry.type="button";retry.className="btn primary";retry.textContent=isRTL?"دوبارہ ٹیسٹ دیں":"Take Again";retry.onclick=function(){sessionStorage.removeItem(storageKey);state={index:0,answers:[],locked:false,completed:false};result.hidden=true;render();};actions.appendChild(retry);result.appendChild(actions);result.appendChild(shareButtons());
}
injectStyles();intro();render();
(function(){if(document.querySelector('script[data-od-rating-loader]'))return;var s=document.createElement("script");s.src="/rating.js?v=20260927";s.defer=true;s.setAttribute("data-od-rating-loader","true");document.head.appendChild(s);})();
})();