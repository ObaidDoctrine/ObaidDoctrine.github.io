(function(){
"use strict";
const form=document.getElementById("od-signup-form");
if(!form)return;
const msg=document.getElementById("od-signup-msg");
const password=form.elements.namedItem("password"),confirm=form.elements.namedItem("confirm"),email=form.elements.namedItem("email"),name=form.elements.namedItem("name"),language=form.elements.namedItem("language"),submit=form.querySelector('button[type="submit"]'),status=document.getElementById("od-password-status"),ur=document.documentElement.lang==="ur";
const t=(en,urdu)=>ur?urdu:en;
function show(message){msg.textContent=message;msg.hidden=false}
function clear(){msg.textContent="";msg.hidden=true}
function update(){if(!confirm.value){status.textContent="";return true}const ok=password.value===confirm.value;status.textContent=ok?t("Passwords match.","پاس ورڈ ایک جیسے ہیں۔"):t("Passwords do not match.","پاس ورڈ ایک جیسے نہیں ہیں۔");status.style.color=ok?"#31543a":"#8a3d2f";return ok}
password.addEventListener("input",update);confirm.addEventListener("input",update);
form.addEventListener("submit",async e=>{
 e.preventDefault();clear();
 if(!form.checkValidity()){form.reportValidity();return}
 if(!update()){show(t("Passwords do not match. Please enter exactly the same password in both fields.","دونوں پاس ورڈ بالکل ایک جیسے درج کریں۔"));confirm.focus();return}
 submit.disabled=true;submit.setAttribute("aria-busy","true");
 try{
   await ODAuth.signup(email.value.trim().toLowerCase(),password.value);
   const me=await ODBackend.me();
   await ODBackend.updateProfile({display_name:name.value.trim(),preferred_language:language.value});
   if(window.ODAnalytics&&typeof window.ODAnalytics.track==="function")window.ODAnalytics.track("sign_up",{method:"firebase-password"});
   show(t("Account created successfully. You are now signed in.","اکاؤنٹ کامیابی سے بن گیا ہے۔ آپ لاگ اِن ہو چکے ہیں۔"));
   form.reset();status.textContent="";
   setTimeout(()=>location.href="/member/dashboard/",900);
 }catch(error){
   console.error("[OD Signup]",error);
   show(error&&error.code==="auth/email-already-in-use"?t("This email is already registered. Please log in.","یہ ای میل پہلے سے رجسٹرڈ ہے۔ براہِ کرم لاگ اِن کریں۔"):t("Account creation failed. Please try again.","اکاؤنٹ نہیں بن سکا۔ دوبارہ کوشش کریں۔"));
 }finally{submit.disabled=false;submit.removeAttribute("aria-busy")}
});
})();