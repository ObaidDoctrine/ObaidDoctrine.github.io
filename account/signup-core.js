(function(){
"use strict";
const form=document.getElementById("od-signup-form");
if(!form)return;
const msg=document.getElementById("od-signup-msg");
const password=form.elements.namedItem("password");
const confirm=form.elements.namedItem("confirm");
const email=form.elements.namedItem("email");
const name=form.elements.namedItem("name");
const language=form.elements.namedItem("language");
const submit=form.querySelector('button[type="submit"]');
const status=document.getElementById("od-password-status");
const ur=document.documentElement.lang==="ur";
const t=(en,urdu)=>ur?urdu:en;

function show(message){
  msg.textContent=message;
  msg.hidden=false;
}
function clear(){msg.textContent="";msg.hidden=true}
function update(){
  if(!confirm.value){status.textContent="";return true}
  const ok=password.value===confirm.value;
  status.textContent=ok?t("Passwords match.","پاس ورڈ ایک جیسے ہیں۔"):t("Passwords do not match.","پاس ورڈ ایک جیسے نہیں ہیں۔");
  status.style.color=ok?"#31543a":"#8a3d2f";
  return ok;
}
password.addEventListener("input",update);
confirm.addEventListener("input",update);
form.addEventListener("submit",async function(e){
  e.preventDefault();
  clear();
  if(!form.checkValidity()){form.reportValidity();return}
  if(!update()){
    show(t("Passwords do not match. Please enter exactly the same password in both fields.","دونوں پاس ورڈ بالکل ایک جیسے درج کریں۔"));
    confirm.focus();
    return;
  }
  submit.disabled=true;
  submit.setAttribute("aria-busy","true");
  try{
    const db=await window.ODAuth.client();
    const result=await db.auth.signUp({
      email:email.value.trim(),
      password:password.value,
      options:{data:{display_name:name.value.trim(),preferred_language:language.value}}
    });
    if(result.error)throw result.error;
    if(window.ODAnalytics&&typeof window.ODAnalytics.track==="function")window.ODAnalytics.track("sign_up",{method:"password"});
    show(result.data&&result.data.session
      ?t("Account created successfully.","اکاؤنٹ کامیابی سے بن گیا ہے۔")
      :t("Account created. Please check your email to verify your address.","اکاؤنٹ بن گیا ہے۔ تصدیق کے لیے اپنی ای میل چیک کریں۔"));
    form.reset();
    status.textContent="";
  }catch(error){
    console.error("[OD Signup]",error);
    show(error&&error.message?t(error.message,error.message):t("Account creation failed. Please try again.","اکاؤنٹ نہیں بن سکا۔ دوبارہ کوشش کریں۔"));
  }finally{
    submit.disabled=false;
    submit.removeAttribute("aria-busy");
  }
});
})();