(function(){
"use strict";
window.ODLearningPath={
 async start(path){
  const db=await ODMember.client(),auth=await db.auth.getUser(),user=auth.data&&auth.data.user;
  if(auth.error||!user||typeof path!=="string"||!path.startsWith("/member/learning-paths/?path="))return false;
  const now=new Date().toISOString();
  const r=await db.from("learning_progress").upsert({user_id:user.id,resource_type:"learning_path",resource_path:path,status:"started",started_at:now,updated_at:now},{onConflict:"user_id,resource_type,resource_path"});
  if(!r.error&&window.ODAnalytics)ODAnalytics.track("learning_path_start",{path:path});
  return !r.error;
 },
 async complete(path){
  const db=await ODMember.client(),auth=await db.auth.getUser(),user=auth.data&&auth.data.user;
  if(auth.error||!user||typeof path!=="string"||!path.startsWith("/member/learning-paths/?path="))return false;
  const now=new Date().toISOString();
  const r=await db.from("learning_progress").upsert({user_id:user.id,resource_type:"learning_path",resource_path:path,status:"completed",started_at:now,completed_at:now,updated_at:now},{onConflict:"user_id,resource_type,resource_path"});
  if(!r.error&&window.ODAnalytics)ODAnalytics.track("learning_path_complete",{path:path});
  return !r.error;
 }
};
})();