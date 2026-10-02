/* OBAID DOCTRINE — Protected member-page helper
 * Firebase is the authentication provider. Private data is accessed only through ODBackend.
 */
(function(){
"use strict";
window.ODMember={
  async user(){ return window.ODFirebaseAuth ? window.ODFirebaseAuth.currentUser() : null; },
  async session(){
    const user=await this.user();
    return user ? {user} : null;
  },
  async requireSession(){
    const user=await this.user();
    if(!user){ location.href="/account/login/"; return null; }
    try{
      const me=await window.ODBackend.me();
      return {user, identity:me};
    }catch(error){
      console.error("[OD Member]",error);
      await window.ODFirebaseAuth.logout();
      location.href="/account/login/";
      return null;
    }
  },
  async logout(){
    return window.ODFirebaseAuth.logout();
  }
};
})();