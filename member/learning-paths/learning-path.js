(function(){window.ODLearningPath={
async start(path){
 const s=await ODMember.session();if(!s)return false;
 const db=await ODMember.client(),now=new Date().toISOString();
 const r=await db.from("learning_progress").upsert({user_id:s.user.id,resource_type:"learning_path",resource_path:path,status:"started",started_at:now,updated_at:now},{onConflict:"user_id,resource_type,resource_path"});
 if(!r.error&&window.ODAnalytics)ODAnalytics.track("learning_path_start",{path:path});
 return !r.error;
},
async complete(path){
 const s=await ODMember.session();if(!s)return false;
 const db=await ODMember.client(),now=new Date().toISOString();
 const r=await db.from("learning_progress").upsert({user_id:s.user.id,resource_type:"learning_path",resource_path:path,status:"completed",started_at:now,completed_at:now,updated_at:now},{onConflict:"user_id,resource_type,resource_path"});
 if(!r.error&&window.ODAnalytics)ODAnalytics.track("learning_path_complete",{path:path});
 return !r.error;
}
}})();