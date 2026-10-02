/* OBAID DOCTRINE — Firebase-authenticated backend API client
 * Firebase is the authentication provider.
 * The API is hosted as a Supabase Edge Function; no Supabase Auth session is used.
 */
(function(){
"use strict";
const DEFAULT_BACKEND_URL="https://nrckrzgxpxfwuyodbylg.supabase.co/functions/v1/firebase-api";
const BACKEND_URL=window.OD_BACKEND_URL||DEFAULT_BACKEND_URL;
window.ODBackend={
  baseUrl:BACKEND_URL.replace(/\/$/,""),
  async request(path,options={}){
    const token=window.ODFirebaseAuth?await window.ODFirebaseAuth.idToken():null;
    if(!token)throw new Error("Authentication required.");
    const headers=new Headers(options.headers||{});
    headers.set("Authorization","Bearer "+token);
    if(options.body&&!headers.has("Content-Type"))headers.set("Content-Type","application/json");
    const response=await fetch(this.baseUrl+path,{...options,headers});
    const text=await response.text();
    let data=null;
    try{data=text?JSON.parse(text):null}catch{data={raw:text}}
    if(!response.ok){const e=new Error(data&&data.error?data.error:"Backend request failed.");e.status=response.status;e.data=data;throw e}
    return data;
  },
  async migrateLogin(email,password){
    const response=await fetch(this.baseUrl+"/migrate-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
    const text=await response.text();let data=null;try{data=text?JSON.parse(text):null}catch{data={raw:text}}
    if(!response.ok){const e=new Error(data&&data.error?data.error:"Account migration failed.");e.status=response.status;e.data=data;throw e}
    return data;
  },
  me(){return this.request("/me")},
  stats(){return this.request("/stats")},
  profile(){return this.request("/me")},
  updateProfile(payload){return this.request("/profile",{method:"PATCH",body:JSON.stringify(payload)})},
  testResults(){return this.request("/test-results")},
  saveTestResult(payload){return this.request("/test-results",{method:"POST",body:JSON.stringify(payload)})},
  progress(){return this.request("/progress")},
  saveProgress(payload){return this.request("/progress",{method:"POST",body:JSON.stringify(payload)})},
  savedArticles(){return this.request("/saved-articles")},
  saveArticle(article_path){return this.request("/saved-articles",{method:"POST",body:JSON.stringify({article_path})})},
  removeArticle(article_path){return this.request("/saved-articles",{method:"DELETE",body:JSON.stringify({article_path})})},
  journal(){return this.request("/journal")},
  createJournal(payload){return this.request("/journal",{method:"POST",body:JSON.stringify(payload)})},
  updateJournal(id,payload){return this.request("/journal/"+encodeURIComponent(id),{method:"PATCH",body:JSON.stringify(payload)})},
  deleteJournal(id){return this.request("/journal/"+encodeURIComponent(id),{method:"DELETE"})},
  memberContent(language){return this.request("/member-content"+(language?"?language="+encodeURIComponent(language):""))},
  adminContent(){return this.request("/admin/content")},
  createAdminContent(payload){return this.request("/admin/content",{method:"POST",body:JSON.stringify(payload)})},
  updateAdminContent(id,payload){return this.request("/admin/content/"+encodeURIComponent(id),{method:"PATCH",body:JSON.stringify(payload)})},
  deleteAdminContent(id){return this.request("/admin/content/"+encodeURIComponent(id),{method:"DELETE"})}
};
})();