package com.obaiddoctrine.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private static final String SITE_HOST = "www.obaiddoctrine.com";
    private static final String AUTH_URL =
            "https://www.obaiddoctrine.com/auth/?app=1";
    private static final String HOME_URL =
            "https://www.obaiddoctrine.com/";

    private static final String APP_SCHEME = "obaiddoctrine";
    private static final String AUTH_SUCCESS_HOST = "auth-success";
    private static final String LOGOUT_HOST = "logout";

    private WebView webView;
    private boolean authenticated = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(250, 250, 245));

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setLoadWithOverviewMode(false);
        settings.setUseWideViewPort(false);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(
                    WebView view, WebResourceRequest request) {
                return handleNavigation(view, request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleNavigation(view, Uri.parse(url));
            }
        });

        setContentView(webView, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // Never restore a previous WebView navigation stack here.
        // Every activity start must pass through the authentication gate.
        webView.clearHistory();
        webView.loadUrl(AUTH_URL);
    }

    private boolean handleNavigation(WebView view, Uri uri) {
        if (uri == null) {
            return true;
        }

        String scheme = uri.getScheme();
        String host = uri.getHost();

        // Authentication callback generated only by our own auth page.
        if (APP_SCHEME.equalsIgnoreCase(scheme)) {
            String currentUrl = view.getUrl();
            boolean fromAuthPage =
                    currentUrl != null &&
                    currentUrl.startsWith("https://" + SITE_HOST + "/auth/");

            if (!fromAuthPage) {
                return true;
            }

            if (AUTH_SUCCESS_HOST.equalsIgnoreCase(host)) {
                authenticated = true;
                view.clearHistory();
                view.loadUrl(HOME_URL);
                return true;
            }

            if (LOGOUT_HOST.equalsIgnoreCase(host)) {
                authenticated = false;
                lockWebView();
                return true;
            }

            return true;
        }

        // Only our HTTPS website is allowed to remain inside the WebView.
        if ("https".equalsIgnoreCase(scheme) &&
                SITE_HOST.equalsIgnoreCase(host)) {

            if (authenticated) {
                return false;
            }

            // Before authentication, only authentication pages may load.
            String path = uri.getPath() == null ? "/" : uri.getPath();
            boolean authPage =
                    path.equals("/auth/") ||
                    path.startsWith("/auth/signup/") ||
                    path.startsWith("/auth/verify/");

            if (authPage) {
                return false;
            }

            // Any attempt to open site content before authentication
            // is redirected back to the authentication gate.
            view.stopLoading();
            view.loadUrl(AUTH_URL);
            return true;
        }

        // Do not let external sites execute inside our trusted WebView.
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            startActivity(intent);
        } catch (Exception ignored) {
            // No external handler available; keep the app locked down.
        }

        return true;
    }

    private void lockWebView() {
        if (webView == null) {
            return;
        }

        webView.stopLoading();
        webView.clearHistory();
        webView.clearCache(true);
        webView.loadUrl(AUTH_URL);
    }

    @Override
    public void onBackPressed() {
        if (!authenticated) {
            // The authentication gate is the only allowed unauthenticated
            // destination. Back cannot reveal protected content.
            if (webView != null) {
                webView.clearHistory();
                webView.loadUrl(AUTH_URL);
            }
            return;
        }

        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            ViewGroup parent = (ViewGroup) webView.getParent();
            if (parent != null) {
                parent.removeView(webView);
            }
            webView.stopLoading();
            webView.clearHistory();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
