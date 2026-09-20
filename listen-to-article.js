(function(){
"use strict";
const neuralUrdu="ur_PK-fasih-medium";
let piperPromise=null;
async function piper(){
  if(!piperPromise) piperPromise=import("https://esm.sh/@mintplex-labs/piper-tts-web").then(m=>m).catch(()=>null);
  return piperPromise;
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
  const synth=("speechSynthesis" in window)&&("SpeechSynthesisUtterance" in window)?window.speechSynthesis:null;
  const box=document.createElement("div");
  box.className="listen-to-article";
  box.setAttribute("role","region");
  box.setAttribute("aria-label",rtl?"مضمون سنیں":"Listen to Article");
  box.innerHTML='<div class="listen-title"><span class="listen-icon" aria-hidden="true">🔊</span><strong>'+(rtl?"مضمون سنیں":"Listen to Article")+'</strong><span class="listen-status"></span></div><div class="listen-controls"><button type="button" class="listen-play">'+(rtl?"▶ شروع کریں":"▶ Play")+'</button><button type="button" class="listen-pause">'+(rtl?"⏸ روکیں":"⏸ Pause")+'</button><button type="button" class="listen-stop">'+(rtl?"■ بند کریں":"■ Stop")+'</button><label class="listen-speed"><span>'+(rtl?"رفتار":"Speed")+'</span><select><option value="0.8">0.8×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option><option value="1.5">1.5×</select></label></div>';
  const anchor=article.querySelector(".notice")||article.querySelector(".article-meta")||article.firstElementChild;
  (anchor?anchor.before.bind(anchor):article.prepend.bind(article))(box);
  const play=box.querySelector(".listen-play"),pause=box.querySelector(".listen-pause"),stop=box.querySelector(".listen-stop"),speed=box.querySelector("select"),status=box.querySelector(".listen-status");
  let chunks=[],index=0,active=false,audio=null,usingPiper=false;
  function setStatus(t){status.textContent=t;}
  function splitText(t){return t.match(/[^.!?۔！？]+[.!?۔！？]*/g)||[t];}
  async function speakUrdu(){
    const mod=await piper();
    if(!mod||!active){if(active)setStatus("آواز دستیاب نہیں");return;}
    try{
      setStatus("اردو آواز کا ماڈل تیار ہو رہا ہے…");
      if (typeof mod.download === "function") await mod.download(neuralUrdu, ()=>{});
      setStatus("اردو آواز تیار ہو رہی ہے…");
      const wav=await mod.predict({text:chunks[index++],voiceId:neuralUrdu});
      if(!active)return;
      audio=new Audio(URL.createObjectURL(wav));
      audio.playbackRate=parseFloat(speed.value);
      audio.onended=()=>{if(active&&index<chunks.length)speakUrdu();else{active=false;setStatus("");play.disabled=false;}};
      audio.onerror=()=>{active=false;setStatus("آواز دستیاب نہیں");play.disabled=false;};
      play.disabled=true;
      setStatus("چل رہا ہے…");
      await audio.play();
    }catch(e){
      if(synth){
        index=0;
        chunks=splitText(getArticle()||"");
        setStatus("براؤزر کی اردو آواز استعمال ہو رہی ہے…");
        speakUrduFallback();
      }else{index=0;chunks=splitText(getArticle()||"");speakUrduGoogle();}
    }
  }
  function pickVoice(lang){
    const voices=synth?synth.getVoices():[];
    const base=lang.toLowerCase().split("-")[0];
    return voices.find(v=>v.lang.toLowerCase()===lang.toLowerCase())||voices.find(v=>v.lang.toLowerCase().startsWith(base+"-"))||voices.find(v=>v.lang.toLowerCase()===base)||voices.find(v=>v.default);
  }
  function speakUrduGoogle(){
    if(!active||index>=chunks.length){active=false;setStatus("");play.disabled=false;return;}
    const text=encodeURIComponent(chunks[index++]);
    audio=new Audio("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ur&q="+text);
    audio.playbackRate=parseFloat(speed.value);
    audio.onended=()=>speakUrduGoogle();
    audio.onerror=()=>{index=0;chunks=splitText(getArticle()||"");speakUrduFallback();};
    play.disabled=true;setStatus("اردو آواز چل رہی ہے…");
    audio.play().catch(()=>{index=0;chunks=splitText(getArticle()||"");speakUrduFallback();});
  }
  function speakUrduFallback(){
    if(!synth){active=false;setStatus("آواز دستیاب نہیں");play.disabled=false;return;}
    if(!active||index>=chunks.length){active=false;setStatus("");play.disabled=false;return;}
    const u=new SpeechSynthesisUtterance(chunks[index++]);u.lang="ur-PK";u.rate=parseFloat(speed.value);u.pitch=1;u.volume=1;
    const v=pickVoice("ur-PK");if(v)u.voice=v;
    u.onstart=()=>{play.disabled=true;setStatus("چل رہا ہے…");};
    u.onend=()=>speakUrduFallback();
    u.onerror=()=>{active=false;setStatus("آواز دستیاب نہیں");play.disabled=false;};
    synth.speak(u);
  }
  function speakEnglish(){
    if(!synth){setStatus("Voice unavailable");return;}
    if(!active||index>=chunks.length){active=false;setStatus("");play.disabled=false;return;}
    const u=new SpeechSynthesisUtterance(chunks[index++]);u.lang="en-US";u.rate=parseFloat(speed.value);u.pitch=1;u.volume=1;
    const v=pickVoice("en-US");if(v)u.voice=v;
    u.onstart=()=>{play.disabled=true;setStatus("Playing…");};
    u.onend=()=>speakEnglish();
    u.onerror=()=>{active=false;setStatus("Voice unavailable");play.disabled=false;};
    synth.speak(u);
  }
  play.addEventListener("click",()=>{
    const t=getArticle()||"";if(!t)return;
    if(synth)synth.cancel();if(audio){audio.pause();audio.src="";}
    chunks=splitText(t);index=0;active=true;usingPiper=rtl;
    if(rtl)speakUrdu();else speakEnglish();
  });
  pause.addEventListener("click",()=>{
    if(usingPiper&&audio){if(audio.paused)audio.play();else audio.pause();}
    else if(synth&&synth.speaking){if(synth.paused)synth.resume();else synth.pause();}
  });
  stop.addEventListener("click",()=>{
    active=false;index=0;if(synth)synth.cancel();if(audio){audio.pause();audio.src="";audio=null;}setStatus("");play.disabled=false;
  });
  speed.addEventListener("change",()=>{if(usingPiper&&audio)audio.playbackRate=parseFloat(speed.value);});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();