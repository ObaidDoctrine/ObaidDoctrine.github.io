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
 var n=dimensionsCount(), scores=Array(n).fill(0), maxes=Array(n).fill(0);
 items.forEach(function(item){var q=getQuestion(item);q.options.forEach(function(_,i){var d=q.scores?q.scores[i]:i;var v=q.values?q.values[i]:1;if(Number.isInteger(d)&&d>=0&&d<n)maxes[d]+=Number(v)||0;});});
 state.answers.forEach(function(answer,index){var q=getQuestion(items[index]);var d=q.scores?q.scores[answer]:answer;var v=q.values?q.values[answer]:1;if(Number.isInteger(d)&&d>=0&&d<n)scores[d]+=Number(v)||0;});
 return{scores:scores,maxes:maxes};
}
function labelAt(i){if(dimensionData&&dimensionData[i])return dimensionData[i][0];if(labelData&&labelData[i])return labelData[i];return isRTL?"نمایاں رجحان":"Response pattern";}
function descAt(i){if(dimensionData&&dimensionData[i])return dimensionData[i][1];if(descriptionData&&descriptionData[i])return descriptionData[i];return isRTL?"یہ آپ کے جوابات میں ایک نمایاں رجحان کی تعلیمی وضاحت ہے۔":"This describes a response tendency represented in your answers.";}
function intro(){var lead=document.querySelector(".lead");if(lead&&meta.intro){lead.textContent=isRTL?(meta.intro.ur||lead.textContent):(meta.intro.en||lead.textContent);}}
function injectStyles(){
 if(document.getElementById("od-test-engine-styles"))return;
 var s=document.createElement("style");s.id="od-test-engine-styles";s.textContent=[
".od-test-progress{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px;font-weight:800;color:#31543A;font-size:13px}",
".od-test-progress-bar{height:7px;background:#DCE8B5;border-radius:999px;overflow:hidden;margin:0 0 26px}.od-test-progress-bar>span{display:block;height:100%;background:#B7D84B;border-radius:inherit;transition:width .25s ease}",
".od-test-option{position:relative;display:block;width:100%;text-align:start;cursor:pointer}.od-test-option.od-selected{background:#31543A!important;border-color:#31543A!important;color:#fff!important;box-shadow:0 8px 22px rgba(49,84,58,.16)!important}.od-test-option.od-locked{cursor:not-allowed;opacity:.92}",
".od-result-grid{display:grid;gap:12px;margin:22px 0}.od-result-row{padding:13px 15px;border:1px solid rgba(49,84,58,.12);border-radius:14px;background:#FAFAF5}.od-result-row strong{display:flex;justify-content:space-between;gap:12px}.od-result-track{height:6px;background:#DCE8B5;border-radius:99px;overflow:hidden;margin-top:9px}.od-result-track span{display:block;height:100%;background:#B7D84B;border-radius:inherit}",
".od-evidence{margin-top:22px;padding:16px;border:1px solid rgba(49,84,58,.12);border-radius:16px;background:#FAFAF5}.od-evidence ul{margin:.5rem 0 0;padding-inline-start:1.2rem}.od-evidence a{color:#31543A;font-weight:700}",
".od-test-note{margin-top:18px;padding:14px 16px;border-left:4px solid #B7D84B;background:#F8FAF0;border-radius:0 12px 12px 0;color:#59655c;line-height:1.7}.od-test-share{display:flex;flex-wrap:wrap;gap:9px;margin-top:22px}.od-test-share button,.od-test-share a{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:9px 13px;border:1px solid rgba(49,84,58,.16);border-radius:999px;background:#fff;color:#31543A;text-decoration:none;font:700 12px/1 Inter,Arial,sans-serif;cursor:pointer}",
"html[dir=rtl] .od-test-share{justify-content:flex-start}@media(max-width:600px){.od-test-share{display:grid;grid-template-columns:1fr 1fr}.od-test-share button,.od-test-share a{width:100%}}"
].join("");document.head.appendChild(s);
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
 setTimeout(function(){state.index++;save();render();var t=document.getElementById("test");if(t)window.scrollTo({top:Math.max(0,t.offsetTop-24),behavior:"smooth"});},180);
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