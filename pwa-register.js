/* OBAID DOCTRINE — PWA registration */
(function(){
"use strict";
if(!("serviceWorker" in navigator))return;
window.addEventListener("load",function(){
 navigator.serviceWorker.register("/sw.js",{scope:"/"})
  .catch(function(error){console.warn("[OD PWA] Service worker registration failed:",error)});
},{once:true});
})();
