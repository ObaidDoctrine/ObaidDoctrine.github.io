/* OBAID DOCTRINE — Firebase Auth client
 * Authentication is handled by Firebase. Supabase Auth is not used in the browser.
 */
(function(){
"use strict";
window.ODAuth={
  async user(){ return window.ODFirebaseAuth ? window.ODFirebaseAuth.currentUser() : null; },
  async session(){
    const u=await this.user();
    return u ? {user:u} : null;
  },
  async client(){
    if(window.ODMember&&window.ODMember.client)return window.ODMember.client();
    await new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="/member/member-auth.js?v=20261002";s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
    return window.ODMember.client();
  },
  async login(email,password){ return window.ODFirebaseAuth.signIn(email,password); },
  async signup(email,password){ return window.ODFirebaseAuth.signUp(email,password); },
  async resetPassword(email){ return window.ODFirebaseAuth.resetPassword(email); },
  async logout(){ return window.ODFirebaseAuth.logout(); }
};
})();