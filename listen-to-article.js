(function(){
"use strict";
if(!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
const synth=window.speechSynthesis;
function pickVoice(lang){
  const voices=synth.getVoices();
  const base=lang.toLowerCase().split("-")[0];
  return voices.find(v=>v.lang.toLowerCase()===lang.toLowerCase())
    || voices.find(v=>v.lang.toLowerCase().startsWith(base+"-"))
    || voices.find(v=>v.lang.toLowerCase()===base)
    || voices.find(v=>v.default);
}
function getArticle(){
  const a=document.querySelector("article.article-body")||document.querySelector("main article");
  if(!a) return null;
  const copy=a.cloneNode(true);
  copy.querySelectorAll(".source-box,.article-source-list,.listen-to-article").forEach(e=>e.remove());
  const parts=[];
  copy.querySelectorAll("h1,h2,h3,p,li").forEach(el=>{
    const t=(el.textContent||"").replace(/\s+/g," ").trim();
    if(t) parts.push(t);
  });
  return parts.join(". ");
}
function init(){
  const article=document.querySelector("article.article-body")||document.querySelector("main article");
  if(!article || article.querySelector(".listen-to-article")) return;
  const rtl=(document.documentElement.lang||"").toLowerCase().startsWith("ur") || document.documentElement.dir==="rtl";
  const box=document.createElement("div");
  box.className="listen-to-article";
  box.setAttribute("role","region");
  box.setAttribute("aria-label",rtl?"مضمون سنیں":"Listen to Article");
  box.innerHTML=
    '<div class="listen-title"><span class="listen-icon" aria-hidden="true">🔊</span><strong>'+(rtl?"مضمون سنیں":"Listen to Article")+'</strong><span class="listen-status"></span></div>'+
    '<div class="listen-controls">'+
      '<button type="button" class="listen-play">'+(rtl?"▶ شروع کریں":"▶ Play")+'</button>'+
      '<button type="button" class="listen-pause">'+(rtl?"⏸ روکیں":"⏸ Pause")+'</button>'+
      '<button type="button" class="listen-stop">'+(rtl?"■ بند کریں":"■ Stop")+'</button>'+
      '<label class="listen-speed"><span>'+(rtl?"رفتار":"Speed")+'</span><select><option value="0.8">0.8×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option><option value="1.5">1.5×</option></select></label>'+
    '</div>';
  const anchor=article.querySelector(".notice")||article.querySelector(".article-meta")||article.firstElementChild;
  (anchor?anchor.before.bind(anchor):article.prepend.bind(article))(box);
  const play=box.querySelector(".listen-play"), pause=box.querySelector(".listen-pause"), stop=box.querySelector(".listen-stop"), speed=box.querySelector("select"), status=box.querySelector(".listen-status");
  let chunks=[], index=0, active=false;
  function text(){return getArticle()||"";}
  function setStatus(t){status.textContent=t;}
  function speakNext(){
    if(!active || index>=chunks.length){active=false;setStatus("");play.disabled=false;return;}
    const u=new SpeechSynthesisUtterance(chunks[index++]);
    const lang=rtl?"ur-PK":"en-US"; u.lang=lang; u.rate=parseFloat(speed.value); u.pitch=1; u.volume=1;
    const v=pickVoice(lang); if(v) u.voice=v;
    u.onstart=()=>{play.disabled=true;setStatus(rtl?"چل رہا ہے…":"Playing…");};
    u.onend=()=>speakNext();
    u.onerror=()=>{active=false;setStatus(rtl?"آواز دستیاب نہیں":"Voice unavailable");play.disabled=false;};
    synth.speak(u);
  }
  play.addEventListener("click",()=>{
    synth.cancel(); const t=text(); if(!t) return;
    chunks=t.match(/[^.!?۔！？]+[.!?۔！？]*/g)||[t];
    index=0; active=true; speakNext();
  });
  pause.addEventListener("click",()=>{if(synth.speaking&&!synth.paused)synth.pause();else if(synth.paused)synth.resume();});
  stop.addEventListener("click",()=>{active=false;index=0;synth.cancel();setStatus("");play.disabled=false;});
  speed.addEventListener("change",()=>{if(synth.speaking){synth.cancel();active=true;speakNext();}});
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
if("onvoiceschanged" in synth) synth.addEventListener("voiceschanged",()=>{});
})();