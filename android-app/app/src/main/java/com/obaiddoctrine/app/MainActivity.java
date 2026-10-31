package com.obaiddoctrine.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
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
        webView.setBackgroundColor(Color.rgb(16, 16, 16));

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setLoadWithOverviewMode(false);
        settings.setUseWideViewPort(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

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

            @Override
            public void onReceivedSslError(
                    WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel();
            }
        });

        setContentView(webView, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        webView.clearHistory();
        Uri verificationLink = getVerificationLink(getIntent());
        webView.loadUrl(verificationLink != null
                ? verificationLink.toString()
                : HOME_URL);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);

        Uri verificationLink = getVerificationLink(intent);
        if (verificationLink != null && webView != null) {
            authenticated = false;
            webView.stopLoading();
            webView.clearHistory();
            webView.loadUrl(verificationLink.toString());
        }
    }

    // Accept only the site's own email-verification URL and require an auth code.
    // Loading it in this WebView preserves the PKCE verifier stored during signup.
    private Uri getVerificationLink(Intent intent) {
        if (intent == null || intent.getData() == null) return null;

        Uri uri = intent.getData();
        if (!"https".equalsIgnoreCase(uri.getScheme())
                || !SITE_HOST.equalsIgnoreCase(uri.getHost())
                || !("/auth/verify/".equals(uri.getPath())
                    || "/auth/reset-password/".equals(uri.getPath()))
                || uri.getQueryParameter("code") == null
                || uri.getQueryParameter("code").isEmpty()) {
            return null;
        }

        if ("1".equals(uri.getQueryParameter("app"))) return uri;
        return uri.buildUpon().appendQueryParameter("app", "1").build();
    }

    private boolean handleNavigation(WebView view, Uri uri) {
        if (uri == null) return true;

        String scheme = uri.getScheme();
        String host = uri.getHost();

        if (APP_SCHEME.equalsIgnoreCase(scheme)) {
            String currentUrl = view.getUrl();
            boolean fromAuthPage = currentUrl != null
                    && currentUrl.startsWith("https://" + SITE_HOST + "/auth/");

            if (!fromAuthPage) return true;

            if (AUTH_SUCCESS_HOST.equalsIgnoreCase(host)) {
                authenticated = true;
                String destination = uri.getQueryParameter("returnTo");
                Uri safeDestination = destination == null ? null : Uri.parse(destination);
                if (safeDestination == null
                        || !"https".equalsIgnoreCase(safeDestination.getScheme())
                        || !SITE_HOST.equalsIgnoreCase(safeDestination.getHost())) {
                    safeDestination = Uri.parse(HOME_URL);
                }
                view.clearHistory();
                view.loadUrl(safeDestination.toString());
                return true;
            }

            if (LOGOUT_HOST.equalsIgnoreCase(host)) {
                authenticated = false;
                lockWebView();
                return true;
            }
            return true;
        }

        if ("https".equalsIgnoreCase(scheme) && SITE_HOST.equalsIgnoreCase(host)) {
            if (authenticated) return false;

            String path = uri.getPath() == null ? "/" : uri.getPath();
            boolean authPage = path.equals("/auth/")
                    || path.startsWith("/auth/signup/")
                    || path.startsWith("/auth/verify/")
                    || path.startsWith("/auth/recovery/")
                    || path.startsWith("/auth/reset-password/");
            // Only the public landing page is available without authentication.
            if (authPage || path.equals("/") || path.isEmpty()) return false;

            view.stopLoading();
            Uri loginUrl = Uri.parse(AUTH_URL).buildUpon()
                    .appendQueryParameter("returnTo", uri.toString())
                    .build();
            view.loadUrl(loginUrl.toString());
            return true;
        }

        if ("https".equalsIgnoreCase(scheme)
                || "http".equalsIgnoreCase(scheme)
                || "mailto".equalsIgnoreCase(scheme)
                || "tel".equalsIgnoreCase(scheme)) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (Exception ignored) {
                // No compatible external handler is installed.
            }
        }
        return true;
    }

    private void lockWebView() {
        if (webView == null) return;
        webView.stopLoading();
        webView.clearHistory();
        webView.clearCache(true);
        webView.loadUrl(AUTH_URL);
    }

    @Override
    public void onBackPressed() {
        if (!authenticated) {
            if (webView != null) {
                webView.clearHistory();
                webView.loadUrl(HOME_URL);
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
            if (parent != null) parent.removeView(webView);
            webView.stopLoading();
            webView.clearHistory();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
