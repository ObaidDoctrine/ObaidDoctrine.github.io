/* OBAID DOCTRINE — Protected member-page helper
 * Firebase authentication + backend data facade.
 * Existing member pages can keep their data-access shape while no browser page uses Supabase Auth.
 */
(function(){
"use strict";

function result(data=null,error=null,extra={}){return {data,error,...extra}}

class Query{
 constructor(table){this.table=table;this.action="select";this.payload=null;this.filters=[];this.opts={};this.card=null;this.orderBy=null;this.limitN=null}
 select(columns="*",opts={}){this.action="select";this.opts=opts||{};this.columns=columns;return this}
 eq(field,value){this.filters.push([field,value]);return this}
 order(field,opts={}){this.orderBy={field,opts};return this}
 limit(n){this.limitN=n;return this}
 maybeSingle(){this.card="maybeSingle";return this.exec()}
 single(){this.card="single";return this.exec()}
 insert(payload){this.action="insert";this.payload=payload;return this}
 update(payload){this.action="update";this.payload=payload;return this}
 upsert(payload,opts={}){this.action="upsert";this.payload=payload;this.opts=opts||{};return this}
 delete(){this.action="delete";return this}
 then(resolve,reject){return this.exec().then(resolve,reject)}
 async exec(){
  try{
   const api=window.ODBackend;
   if(!api)throw new Error("Backend API is unavailable.");
   const filter=(name)=>this.filters.find(x=>x[0]===name)?.[1];
   let data=null;

   if(this.table==="profiles"){
    if(this.action==="select"){
      const me=await api.me();data=me.profile;
    }else if(this.action==="update"||this.action==="upsert"){
      const changes={...(this.payload||{})};delete changes.id;delete changes.updated_at;
      const r=await api.updateProfile(changes);data=r.profile;
    }
   }else if(this.table==="test_results"){
    if(this.action==="select")data=await api.testResults();
    else if(this.action==="insert")data=await api.saveTestResult(this.payload);
   }else if(this.table==="learning_progress"){
    if(this.action==="select")data=await api.progress();
    else if(this.action==="insert"||this.action==="upsert")data=await api.saveProgress(this.payload);
   }else if(this.table==="saved_articles"){
    if(this.action==="select")data=await api.savedArticles();
    else if(this.action==="insert"||this.action==="upsert")data=await api.saveArticle(this.payload.article_path);
    else if(this.action==="delete"){
      let path=this.payload?.article_path;
      if(!path){const rows=await api.savedArticles();const id=filter("id");path=(rows||[]).find(x=>String(x.id)===String(id))?.article_path}
      if(!path)throw new Error("Saved article could not be identified.");
      data=await api.removeArticle(path);
    }
   }else if(this.table==="reflection_journal_entries"){
    if(this.action==="select"){
      data=await api.journal();
    }else if(this.action==="insert")data=await api.createJournal(this.payload);
    else if(this.action==="update")data=await api.updateJournal(filter("id"),this.payload);
    else if(this.action==="delete")data=await api.deleteJournal(filter("id"));
   }else if(this.table==="member_content"){
    if(this.action==="select")data=await api.memberContent(filter("language"));
   }else{
    throw new Error("Unsupported member data table: "+this.table);
   }

   if(Array.isArray(data)){
    for(const [field,value] of this.filters){
      if(field==="user_id")continue;
      data=data.filter(x=>String(x?.[field])===String(value));
    }
    if(this.orderBy){
      const field=this.orderBy.field,asc=this.orderBy.opts?.ascending!==false;
      data=[...data].sort((a,b)=>{const av=a?.[field]??"",bv=b?.[field]??"";if(av===bv)return 0;return (av>bv?1:-1)*(asc?1:-1)});
    }
    if(this.limitN)data=data.slice(0,this.limitN);
    if(this.opts?.head&&this.opts?.count==="exact")return result(null,null,{count:data.length,status:200,statusText:"OK"});
    if(this.card==="single")data=data.length===1?data[0]:null;
    if(this.card==="maybeSingle")data=data.length?data[0]:null;
   }
   if(this.action==="select" && this.card==="single" && !data)throw new Error("Requested record was not found.");
   return result(data,null,{status:200,statusText:"OK"});
  }catch(error){return result(null,error)}
 }
}

window.ODMember={
 async user(){return window.ODFirebaseAuth?window.ODFirebaseAuth.currentUser():null},
 async session(){const user=await this.user();return user?{user}:null},
 async requireSession(){
  const user=await this.user();
  if(!user){location.href="/account/login/";return null}
  try{return {user,identity:await window.ODBackend.me()}}
  catch(error){console.error("[OD Member]",error);await window.ODFirebaseAuth.logout();location.href="/account/login/";return null}
 },
 async client(){
  return {
   auth:{
    getUser:async()=>{const user=await window.ODFirebaseAuth.currentUser();return result(user,null)},
    getSession:async()=>{const user=await window.ODFirebaseAuth.currentUser();return result(user?{user}:null,null)},
    updateUser:async(payload)=>{try{return result(await window.ODFirebaseAuth.changePassword(payload.password),null)}catch(e){return result(null,e)}},
    signOut:async()=>{try{return result(await window.ODFirebaseAuth.logout(),null)}catch(e){return result(null,e)}}
   },
   from:(table)=>new Query(table),
   rpc:async(name)=>{if(name==="is_admin"){const me=await window.ODBackend.me();return result(me.role==="admin",null)}throw new Error("Unsupported RPC: "+name)}
  }
 },
 async logout(){return window.ODFirebaseAuth.logout()}
};
})();