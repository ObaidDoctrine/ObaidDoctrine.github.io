/* OBAID DOCTRINE — privacy-safe activity analytics */
(function(){
"use strict";
const MEASUREMENT_ID="G-L4T240RQDK";
const ALLOWED={sign_up:1,login:1,test_start:1,test_complete:1,article_save:1,learning_path_start:1,learning_path_complete:1,content_complete:1};
let ready=null;
function load(){
  if(typeof window.gtag==="function")return Promise.resolve(true);
  if(ready)return ready;
  ready=new Promise(function(resolve){
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
    const s=document.createElement("script");
    s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+MEASUREMENT_ID;
    s.onload=function(){window.gtag("js",new Date());window.gtag("config",MEASUREMENT_ID,{send_page_view:false});resolve(true)};
    s.onerror=function(){resolve(false)};
    document.head.appendChild(s);
  });
  return ready;
}
window.ODAnalytics={track:async function(name,params){
  try{if(!ALLOWED[name])return false;const ok=await load();if(!ok||typeof window.gtag!=="function")return false;
  const safe={};Object.keys(params||{}).forEach(function(k){const v=params[k];if(typeof v==="string"&&v.length<=100)safe[k]=v;else if(typeof v==="number"&&isFinite(v))safe[k]=v});
  window.gtag("event",name,safe);return true}catch(e){return false}
}};
})();