(function(){
"use strict";
function getArticle(){
  const a=document.querySelector("article.article-body")||document.querySelector("main article");
  if(!a) return null;
  const copy=a.cloneNode(true);
  copy.querySelectorAll(".source-box,.article-source-list,.listen-to-article,script,style,nav").forEach(e=>e.remove());
  const parts=[];
  copy.querySelectorAll("h1,h2,h3,p,li").forEach(el=>{
    const t=(el.textContent||"").replace(/\s+/g," ").trim();
    if(t) parts.push(t);
  });
  return parts.join(" ");
}
function init(){
  const article=document.querySelector("article.article-body")||document.querySelector("main article");
  if(!article || article.querySelector(".listen-to-article")) return;
  const rtl=(document.documentElement.lang||"").toLowerCase().startsWith("ur") || document.documentElement.dir==="rtl";
  const synth=("speechSynthesis" in window)&&("SpeechSynthesisUtterance" in window)?window.speechSynthesis:null;
  const box=document.createElement("div");
  box.className="listen-to-article";
  box.setAttribute("role","region");
  box.setAttribute("aria-label",rtl?"مضمون سنیں":"Listen to Article");
  box.innerHTML='<div class="listen-title"><span class="listen-icon" aria-hidden="true">🔊</span><strong>'+(rtl?"مضمون سنیں":"Listen to Article")+'</strong><span class="listen-status"></span></div><div class="listen-controls"><button type="button" class="listen-play">'+(rtl?"▶ شروع کریں":"▶ Play")+'</button><button type="button" class="listen-pause">'+(rtl?"⏸ روکیں":"⏸ Pause")+'</button><button type="button" class="listen-stop">'+(rtl?"■ بند کریں":"■ Stop")+'</button><label class="listen-speed"><span>'+(rtl?"رفتار":"Speed")+'</span><select><option value="0.8">0.8×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option><option value="1.5">1.5×</select></label></div>';
  const anchor=article.querySelector(".notice")||article.querySelector(".article-meta")||article.firstElementChild;
  (anchor?anchor.before.bind(anchor):article.prepend.bind(article))(box);
  const play=box.querySelector(".listen-play"),pause=box.querySelector(".listen-pause"),stop=box.querySelector(".listen-stop"),speed=box.querySelector("select"),status=box.querySelector(".listen-status");
  let chunks=[],index=0,active=false,audio=null;
  function setStatus(t){status.textContent=t;}
  function splitText(t){return t.match(/[^.!?۔！？]+[.!?۔！？]*/g)||[t];}
  function getAudioUrl(){
    const match=location.pathname.match(/^\/(ur\/)?articles\/([^/]+)\/?$/);
    if(!match) return null;
    return "/audio/"+(match[1]?"ur/":"en/")+match[2]+".mp3";
  }
  async function speakAudio(){
    const src=getAudioUrl();
    if(!src||!active){if(active)setStatus(rtl?"آڈیو دستیاب نہیں":"Audio unavailable");return;}
    try{
      if(audio){audio.pause();audio.src="";}
      audio=new Audio(src);
      audio.preload="auto";
      audio.playbackRate=parseFloat(speed.value);
      audio.onloadeddata=()=>setStatus(rtl?"چل رہا ہے…":"Playing…");
      audio.onended=()=>{active=false;setStatus("");play.disabled=false;};
      audio.onerror=()=>{active=false;setStatus(rtl?"آڈیو دستیاب نہیں":"Audio unavailable");play.disabled=false;};
      play.disabled=true;
      await audio.play();
    }catch(e){
      active=false;
      setStatus("آڈیو دستیاب نہیں");
      play.disabled=false;
    }
  }
  function speakEnglish(){
    if(!synth){setStatus("Voice unavailable");return;}
    if(!active||index>=chunks.length){active=false;setStatus("");play.disabled=false;return;}
    const u=new SpeechSynthesisUtterance(chunks[index++]);u.lang="en-US";u.rate=parseFloat(speed.value);u.pitch=1;u.volume=1;
    u.onstart=()=>{play.disabled=true;setStatus("Playing…");};
    u.onend=()=>speakEnglish();
    u.onerror=()=>{active=false;setStatus("Voice unavailable");play.disabled=false;};
    synth.speak(u);
  }
  play.addEventListener("click",()=>{
    const t=getArticle()||"";if(!t)return;
    if(synth)synth.cancel();if(audio){audio.pause();audio.src="";}
    chunks=splitText(t);index=0;active=true;
    speakAudio();
  });
  pause.addEventListener("click",()=>{
    if(audio){if(audio.paused)audio.play();else audio.pause();}
    else if(synth&&synth.speaking){if(synth.paused)synth.resume();else synth.pause();}
  });
  stop.addEventListener("click",()=>{
    active=false;index=0;if(synth)synth.cancel();if(audio){audio.pause();audio.src="";audio=null;}setStatus("");play.disabled=false;
  });
  speed.addEventListener("change",()=>{if(usingPiper&&audio)audio.playbackRate=parseFloat(speed.value);});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();