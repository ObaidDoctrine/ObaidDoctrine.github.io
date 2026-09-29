/* OBAID DOCTRINE — privacy-safe activity analytics */
(function(){"use strict";
window.ODAnalytics={track:function(name,params){try{if(typeof window.gtag!=="function")return false;var safe={};Object.keys(params||{}).forEach(function(k){var v=params[k];if(typeof v==="string"&&v.length<=100)safe[k]=v;else if(typeof v==="number"&&isFinite(v))safe[k]=v});window.gtag("event",name,safe);return true}catch(e){return false}}};
})();