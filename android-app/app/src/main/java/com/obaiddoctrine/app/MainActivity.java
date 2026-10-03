package com.obaiddoctrine.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    private static final String HOME_URL="https://obaiddoctrine.com/";
    private SecureSessionStore store; private WebView webView; private boolean refreshing;

    @SuppressLint("SetJavaScriptEnabled")
    @Override protected void onCreate(Bundle b){
        super.onCreate(b);store=new SecureSessionStore(this);
        if(!hasUsableSession()){redirectToAuth();return;}
        buildUi();
        if(b==null)webView.loadUrl(HOME_URL);else webView.restoreState(b);
    }

    private void buildUi(){
        FrameLayout frame=new FrameLayout(this);webView=new WebView(this);webView.setBackgroundColor(Color.rgb(250,250,245));
        WebSettings s=webView.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setDatabaseEnabled(true);s.setBuiltInZoomControls(false);s.setDisplayZoomControls(false);s.setLoadWithOverviewMode(false);s.setUseWideViewPort(false);s.setMediaPlaybackRequiresUserGesture(false);
        webView.setWebChromeClient(new WebChromeClient());webView.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return false;}
            @Override public boolean shouldOverrideUrlLoading(WebView v,String u){return false;}
        });
        frame.addView(webView,new FrameLayout.LayoutParams(-1,-1));
        Button logout=new Button(this);logout.setText("Log out");logout.setAllCaps(false);logout.setTextSize(11);logout.setTextColor(Color.rgb(23,61,42));logout.setBackgroundColor(Color.rgb(183,216,75));logout.setOnClickListener(v->logout());
        FrameLayout.LayoutParams lp=new FrameLayout.LayoutParams(dp(92),dp(42),Gravity.TOP|Gravity.END);lp.topMargin=dp(12);lp.rightMargin=dp(12);frame.addView(logout,lp);
        setContentView(frame);
    }

    @Override protected void onResume(){
        super.onResume();
        if(store==null)return;
        try{
            NhostApi.Session s=store.loadSession();
            if(s==null){redirectToAuth();return;}
            if(s.accessTokenExpiresAt>System.currentTimeMillis()+60000)return;
            if(refreshing)return;
            refreshing=true;
            NhostApi api=new NhostApi();
            api.refresh(s.refreshToken,new NhostApi.Callback<NhostApi.Session>(){
                public void onSuccess(NhostApi.Session n){runOnUiThread(()->{refreshing=false;api.shutdown();try{store.saveSession(n);}catch(Exception e){store.clearSession();redirectToAuth();}});}
                public void onError(NhostApi.ApiException e){runOnUiThread(()->{refreshing=false;api.shutdown();store.clearSession();redirectToAuth();});}
            });
        }catch(Exception e){store.clearSession();redirectToAuth();}
    }

    private boolean hasUsableSession(){try{NhostApi.Session s=store.loadSession();return s!=null&&s.accessTokenExpiresAt>System.currentTimeMillis();}catch(Exception e){store.clearSession();return false;}}
    private void logout(){try{NhostApi.Session s=store.loadSession();store.clearSession();if(s==null){redirectToAuth();return;}NhostApi a=new NhostApi();a.signOut(s.refreshToken,new NhostApi.Callback<String>(){
        public void onSuccess(String x){a.shutdown();runOnUiThread(MainActivity.this::redirectToAuth);}
        public void onError(NhostApi.ApiException e){a.shutdown();runOnUiThread(MainActivity.this::redirectToAuth);}
    });}catch(Exception e){store.clearSession();redirectToAuth();}}
    private void redirectToAuth(){startActivity(new Intent(this,AuthActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP));finish();}
    @Override protected void onSaveInstanceState(Bundle o){if(webView!=null)webView.saveState(o);super.onSaveInstanceState(o);}
    @Override public void onBackPressed(){if(webView!=null&&webView.canGoBack())webView.goBack();else super.onBackPressed();}
    @Override protected void onDestroy(){if(webView!=null){webView.destroy();webView=null;}super.onDestroy();}
    private int dp(int v){return Math.round(v*getResources().getDisplayMetrics().density);}
}