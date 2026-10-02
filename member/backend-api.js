/* OBAID DOCTRINE — Firebase-authenticated backend API client foundation
 * Sends Firebase ID tokens as Authorization: Bearer <token>.
 * Never sends client-controlled user IDs or roles for authorization.
 */
(function(){
"use strict";

const DEFAULT_BACKEND_URL = window.OD_BACKEND_URL || "";
window.ODBackend = {
  baseUrl: DEFAULT_BACKEND_URL.replace(/\\/$/,""),

  async request(path, options={}){
    if(!this.baseUrl) throw new Error("Backend URL is not configured yet.");
    const token = window.ODFirebaseAuth ? await window.ODFirebaseAuth.idToken() : null;
    if(!token) throw new Error("Authentication required.");

    const headers = new Headers(options.headers || {});
    headers.set("Authorization","Bearer " + token);
    if(options.body && !headers.has("Content-Type")) headers.set("Content-Type","application/json");

    const response = await fetch(this.baseUrl + path,{...options,headers});
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = {raw:text}; }
    if(!response.ok){
      const error = new Error(data && data.error ? data.error : "Backend request failed.");
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  },

  me(){ return this.request("/me"); },
  stats(){ return this.request("/stats"); },
  profile(){ return this.request("/me"); },
  updateProfile(payload){ return this.request("/profile",{method:"PATCH",body:JSON.stringify(payload)}); },
  testResults(){ return this.request("/test-results"); },
  progress(){ return this.request("/progress"); },
  savedArticles(){ return this.request("/saved-articles"); },
  saveArticle(article_path){ return this.request("/saved-articles",{method:"POST",body:JSON.stringify({article_path})}); },
  removeArticle(article_path){ return this.request("/saved-articles",{method:"DELETE",body:JSON.stringify({article_path})}); },
  journal(){ return this.request("/journal"); },
  createJournal(payload){ return this.request("/journal",{method:"POST",body:JSON.stringify(payload)}); },
  memberContent(language){ return this.request("/member-content"+(language ? "?language="+encodeURIComponent(language) : "")); }
};
})();
