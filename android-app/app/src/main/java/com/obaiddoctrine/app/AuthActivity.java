package com.obaiddoctrine.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.InputType;
import android.util.Patterns;
import android.view.View;
import android.widget.*;
import org.json.JSONObject;

public class AuthActivity extends Activity {
    private final Handler ui=new Handler(Looper.getMainLooper());
    private NhostApi api; private SecureSessionStore store;
    private LinearLayout box; private TextView msg; private EditText email,password,confirm; private Button primary;
    private String pendingEmail=""; private String resetToken;
    private static final int FOREST=0xFF173D2A,LIME=0xFFB7D84B,IVORY=0xFFFAFAF5,MUTED=0xFF6F756F;

    @Override public void onCreate(Bundle b){
        super.onCreate(b); api=new NhostApi(); store=new SecureSessionStore(this);
        if(!NhostConfig.isConfigured()){screen("Nhost setup required","Add the public Nhost subdomain and region in NhostConfig.java.");return;}
        handle(getIntent()); if(getIntent().getData()==null) restore();
    }
    @Override protected void onNewIntent(Intent i){super.onNewIntent(i);setIntent(i);handle(i);}
    private void restore(){
        try{NhostApi.Session s=store.loadSession();if(s==null){login(null);return;}
            if(s.accessTokenExpiresAt>System.currentTimeMillis()+60000){openApp();return;}
            busy(true);api.refresh(s.refreshToken,new NhostApi.Callback<NhostApi.Session>(){
                public void onSuccess(NhostApi.Session n){ui.post(()->{try{store.saveSession(n);openApp();}catch(Exception e){store.clearSession();login("Secure session storage failed.");}});}
                public void onError(NhostApi.ApiException e){ui.post(()->{store.clearSession();login(null);});}
            });
        }catch(Exception e){store.clearSession();login(null);}
    }
    private void handle(Intent i){
        Uri d=i==null?null:i.getData();if(d==null)return;
        String code=d.getQueryParameter("code"),path=d.getPath();
        if(code==null||(!"/verify".equals(path)&&!"/reset".equals(path))){login("The authentication link is incomplete or expired.");return;}
        try{String v=store.consumePkceVerifier();if(v==null){login("This link must be opened on the same device where the request was started.");return;}
            busy(true);api.tokenExchange(code,v,new NhostApi.Callback<NhostApi.Session>(){
                public void onSuccess(NhostApi.Session s){ui.post(()->{
                    if("/reset".equals(path)){try{store.saveSession(s);resetToken=s.accessToken;reset();}catch(Exception e){login("Secure session storage failed.");}}
                    else{api.signOut(s.refreshToken,new NhostApi.Callback<String>(){
                        public void onSuccess(String x){ui.post(()->verified());}
                        public void onError(NhostApi.ApiException e){ui.post(()->{store.clearSession();verified();});}
                    });}
                });}
                public void onError(NhostApi.ApiException e){ui.post(()->{store.clearSession();login(user(e));});}
            });
        }catch(Exception e){login("Unable to process the authentication link.");}
    }

    private void login(String error){screen("Welcome back","Sign in to continue to OBAID DOCTRINE.");
        email=field("Email",InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);password=field("Password",InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD);
        primary=button("Login",v->doLogin());box.addView(primary);link("Create Account",v->registerScreen());link("Forgot Password",v->forgot());if(error!=null)message(error,true);}
    private void registerScreen(){screen("Create your account","Nhost email verification is required before app access.");
        email=field("Email",InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);password=field("Password",InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD);confirm=field("Confirm Password",InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD);
        primary=button("Create Account",v->doRegister());box.addView(primary);link("Back to Login",v->login(null));}
    private void verifyScreen(String text){screen("Check your email",text);link("Resend Verification Email",v->resend());link("Back to Login",v->login(null));}
    private void verified(){screen("Email verified","Your email has been verified successfully. Please log in with your email and password to enter the app.");link("Back to Login",v->login(null));}
    private void forgot(){screen("Reset password","Enter your email. Nhost will send a secure password-reset email.");
        email=field("Email",InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);primary=button("Send Reset Email",v->doForgot());box.addView(primary);link("Back to Login",v->login(null));}
    private void reset(){screen("Choose a new password","Set a new password. Nhost revokes existing sessions after a successful password change.");
        password=field("New Password",InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD);confirm=field("Confirm New Password",InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD);primary=button("Change Password",v->doReset());box.addView(primary);}
    private void doLogin(){String e=email.getText().toString().trim(),p=password.getText().toString();if(!valid(e)){message("Please enter a valid email address.",true);return;}if(p.isEmpty()){message("Please enter your password.",true);return;}busy(true);
        api.signIn(e,p,new NhostApi.Callback<NhostApi.Session>(){
            public void onSuccess(NhostApi.Session s){ui.post(()->{if(!s.user.optBoolean("emailVerified",false)){store.clearSession();verifyScreen("Please verify your email before logging in.");return;}try{store.saveSession(s);openApp();}catch(Exception x){store.clearSession();login("Secure session storage failed.");}});}
            public void onError(NhostApi.ApiException x){ui.post(()->{busy(false);message(user(x),true);});}
        });}
    private void doRegister(){String e=email.getText().toString().trim(),p=password.getText().toString(),c=confirm.getText().toString();if(!valid(e)){message("Please enter a valid email address.",true);return;}if(p.length()<9){message("Password must be at least 9 characters.",true);return;}if(!p.equals(c)){message("Passwords do not match.",true);return;}
        try{String v=Pkce.newVerifier();store.savePkceVerifier(v);pendingEmail=e;busy(true);api.signUp(e,p,Pkce.challenge(v),new NhostApi.Callback<JSONObject>(){
            public void onSuccess(JSONObject r){ui.post(()->verifyScreen("Account created. Nhost has sent a verification email. Open it, tap the verification link, then return here and log in."));}
            public void onError(NhostApi.ApiException x){ui.post(()->{busy(false);message(user(x),true);});}
        });}catch(Exception x){busy(false);message("Unable to start secure verification. Please try again.",true);}}
    private void resend(){
        if(!valid(pendingEmail)){login("Please enter your email again.");return;}
        try{String v=Pkce.newVerifier();store.savePkceVerifier(v);busy(true);api.resendVerification(pendingEmail,Pkce.challenge(v),new NhostApi.Callback<String>(){
            public void onSuccess(String x){ui.post(()->verifyScreen("A new verification email has been sent. Check your inbox and spam folder."));}
            public void onError(NhostApi.ApiException x){ui.post(()->{busy(false);message(user(x),true);});}
        });}catch(Exception x){busy(false);message("Unable to resend the verification email securely.",true);}
    }
    private void doForgot(){String e=email.getText().toString().trim();if(!valid(e)){message("Please enter a valid email address.",true);return;}try{String v=Pkce.newVerifier();store.savePkceVerifier(v);busy(true);api.requestPasswordReset(e,Pkce.challenge(v),new NhostApi.Callback<String>(){
        public void onSuccess(String x){ui.post(()->verifyScreen("If an account exists for this email, Nhost has sent a password-reset email. Open it on this device."));}
        public void onError(NhostApi.ApiException x){ui.post(()->{busy(false);message(user(x),true);});}
    });}catch(Exception x){busy(false);message("Unable to start the password reset securely.",true);}}
    private void doReset(){String p=password.getText().toString(),c=confirm.getText().toString();if(p.length()<9){message("Password must be at least 9 characters.",true);return;}if(!p.equals(c)){message("Passwords do not match.",true);return;}if(resetToken==null){login("Password reset session is no longer valid.");return;}busy(true);api.changePassword(resetToken,p,new NhostApi.Callback<String>(){
        public void onSuccess(String x){ui.post(()->{store.clearSession();resetToken=null;login("Password changed. Please log in with your new password.");});}
        public void onError(NhostApi.ApiException x){ui.post(()->{busy(false);message(user(x),true);});}
    });}

    private void openApp(){busy(false);startActivity(new Intent(this,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP));finish();}
    private void screen(String title,String subtitle){box=new LinearLayout(this);box.setOrientation(LinearLayout.VERTICAL);box.setPadding(dp(24),dp(28),dp(24),dp(28));box.setBackgroundColor(IVORY);ScrollView s=new ScrollView(this);s.setFillViewport(true);s.addView(box);setContentView(s);
        TextView brand=label("OBAID DOCTRINE");brand.setTextSize(12);brand.setTypeface(Typeface.DEFAULT,Typeface.BOLD);brand.setTextColor(FOREST);box.addView(brand);TextView h=label(title);h.setTextSize(30);h.setTypeface(Typeface.DEFAULT,Typeface.BOLD);h.setTextColor(FOREST);box.addView(h,lp(28));TextView sub=label(subtitle);sub.setTextSize(15);box.addView(sub,lp(8));msg=label("");box.addView(msg,lp(8));}
    private EditText field(String hint,int type){EditText e=new EditText(this);e.setHint(hint);e.setInputType(type);e.setSingleLine(true);e.setTextSize(16);e.setPadding(dp(14),0,dp(14),0);e.setBackgroundColor(Color.WHITE);box.addView(e,lp(14,dp(54)));return e;}
    private Button button(String text,View.OnClickListener l){Button b=new Button(this);b.setText(text);b.setAllCaps(false);b.setTextColor(FOREST);b.setBackgroundColor(LIME);b.setOnClickListener(l);return b;}
    private void link(String text,View.OnClickListener l){Button b=new Button(this);b.setText(text);b.setAllCaps(false);b.setTextColor(FOREST);b.setBackgroundColor(Color.TRANSPARENT);b.setOnClickListener(l);box.addView(b,lp(4,dp(48)));}
    private LinearLayout.LayoutParams lp(int top){LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.topMargin=dp(top);return p;}
    private LinearLayout.LayoutParams lp(int top,int height){LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,height);p.topMargin=dp(top);return p;}
    private TextView label(String t){TextView v=new TextView(this);v.setText(t);v.setTextColor(MUTED);return v;}
    private void message(String t,boolean error){if(msg!=null){msg.setText(t);msg.setTextColor(error?0xFF964637:FOREST);}}
    private void busy(boolean b){if(primary!=null)primary.setEnabled(!b);}
    private boolean valid(String e){return e!=null&&Patterns.EMAIL_ADDRESS.matcher(e).matches();}
    private String user(NhostApi.ApiException e){if(e==null)return "Authentication failed. Please try again.";if("invalid-email-password".equals(e.code))return "Email or password is incorrect.";if("unverified-user".equals(e.code))return "Please verify your email before logging in.";if("user-already-exists".equals(e.code))return "An account with this email already exists.";if("password-too-short".equals(e.code))return "Password is too short. Use at least 9 characters.";if("redirectTo-not-allowed".equals(e.code))return "Nhost redirect configuration is incomplete.";if("network-error".equals(e.code))return "Unable to connect. Please check your internet connection and try again.";return e.getMessage();}
    private int dp(int v){return Math.round(v*getResources().getDisplayMetrics().density);}
    @Override protected void onDestroy(){if(api!=null)api.shutdown();super.onDestroy();}
}