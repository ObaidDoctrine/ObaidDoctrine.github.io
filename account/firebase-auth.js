/* OBAID DOCTRINE — Firebase Authentication client foundation
 * Firebase Web SDK via official Google CDN.
 * No Supabase Auth calls. No secrets are stored here.
 */
(function(){
"use strict";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDGfC8IJE-sNTHkiRXQF4ZH45Jc1xzK4HQ",
  authDomain: "obaid-doctrine.firebaseapp.com",
  projectId: "obaid-doctrine",
  storageBucket: "obaid-doctrine.firebasestorage.app",
  messagingSenderId: "656326883060",
  appId: "1:656326883060:web:a09a97fc2d0089ac7410a1",
  measurementId: "G-CVCPRME9FG"
};

const SDK = "https://www.gstatic.com/firebasejs/12.19.0/";
let ready;

async function load(){
  if(ready) return ready;
  ready = import(SDK + "firebase-app.js").then(async ({initializeApp,getApps})=>{
    const [{getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence,
      createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
      sendPasswordResetEmail, updatePassword, sendEmailVerification},
      appMod] = await Promise.all([
      import(SDK + "firebase-auth.js"),
      Promise.resolve({initializeApp,getApps})
    ]);
    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    await setPersistence(auth, browserLocalPersistence);
    return {app,auth,onAuthStateChanged,createUserWithEmailAndPassword,
      signInWithEmailAndPassword,signOut,sendPasswordResetEmail,
      updatePassword,sendEmailVerification};
  });
  return ready;
}

window.ODFirebaseAuth = {
  async auth(){ return (await load()).auth; },
  async signIn(email,password){
    const x=await load();
    return x.signInWithEmailAndPassword(x.auth,email,password);
  },
  async signUp(email,password){
    const x=await load();
    return x.createUserWithEmailAndPassword(x.auth,email,password);
  },
  async resetPassword(email){
    const x=await load();
    return x.sendPasswordResetEmail(x.auth,email);
  },
  async logout(){
    const x=await load();
    return x.signOut(x.auth);
  },
  async currentUser(){
    const x=await load();
    return x.auth.currentUser;
  },
  async idToken(forceRefresh=false){
    const x=await load();
    const user=x.auth.currentUser;
    return user ? user.getIdToken(forceRefresh) : null;
  },
  async changePassword(newPassword){
    const x=await load();
    const user=x.auth.currentUser;
    if(!user) throw new Error("Not signed in.");
    return x.updatePassword(user,newPassword);
  },
  async sendVerification(){
    const x=await load();
    const user=x.auth.currentUser;
    if(!user) throw new Error("Not signed in.");
    return x.sendEmailVerification(user);
  },
  async onStateChanged(callback){
    const x=await load();
    return x.onAuthStateChanged(x.auth,callback);
  }
};
})();
