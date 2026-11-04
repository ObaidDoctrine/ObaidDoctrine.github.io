package com.obaiddoctrine.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

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
    private Button accountButton;
    private boolean authenticated = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(16, 16, 16));

        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setPadding(dp(16), dp(10), dp(16), dp(10));
        toolbar.setBackgroundColor(Color.rgb(23, 23, 23));

        TextView brand = new TextView(this);
        brand.setText("OBAID DOCTRINE");
        brand.setTextColor(Color.WHITE);
        brand.setTextSize(15);
        brand.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        brand.setLetterSpacing(0.06f);
        toolbar.addView(brand, new LinearLayout.LayoutParams(
                0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        accountButton = new Button(this);
        accountButton.setText("Log In");
        accountButton.setTextColor(Color.rgb(23, 17, 11));
        accountButton.setTextSize(13);
        accountButton.setAllCaps(false);
        accountButton.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        accountButton.setPadding(dp(16), dp(4), dp(16), dp(4));
        GradientDrawable buttonBackground = new GradientDrawable();
        buttonBackground.setColor(Color.rgb(255, 122, 26));
        buttonBackground.setCornerRadius(dp(12));
        accountButton.setBackground(buttonBackground);
        accountButton.setOnClickListener(v -> {
            String accountUrl = authenticated ? AUTH_URL + "&manage=1" : AUTH_URL;
            webView.loadUrl(accountUrl);
        });
        toolbar.addView(accountButton, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, dp(44)));

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

        root.addView(toolbar, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        root.addView(webView, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        setContentView(root);

        // The public home page is available without an account.
        // Protected pages are gated by the Nhost sign-in flow.
        webView.loadUrl(HOME_URL);
    }

    private int dp(float value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }

    private void updateAccountButton() {
        if (accountButton != null) {
            accountButton.setText(authenticated ? "Account" : "Log In");
        }
    }

    private String safeInternalDestination(String value) {
        if (value == null || !value.startsWith("/") || value.startsWith("//")) {
            return null;
        }
        Uri parsed = Uri.parse(value);
        if (parsed.getScheme() != null || parsed.getAuthority() != null) {
            return null;
        }
        String path = parsed.getPath();
        if (path == null || path.startsWith("/auth/")) {
            return null;
        }
        return "https://" + SITE_HOST + value;
    }

    private boolean handleNavigation(WebView view, Uri uri) {
        if (uri == null) {
            return true;
        }

        String scheme = uri.getScheme();
        String host = uri.getHost();

        if (APP_SCHEME.equalsIgnoreCase(scheme)) {
            String currentUrl = view.getUrl();
            boolean fromAuthPage = currentUrl != null
                    && currentUrl.startsWith("https://" + SITE_HOST + "/auth/");

            if (!fromAuthPage) {
                return true;
            }

            if (AUTH_SUCCESS_HOST.equalsIgnoreCase(host)) {
                authenticated = true;
                updateAccountButton();
                String destination = safeInternalDestination(uri.getQueryParameter("returnTo"));
                view.clearHistory();
                view.loadUrl(destination != null ? destination : HOME_URL);
                return true;
            }

            if (LOGOUT_HOST.equalsIgnoreCase(host)) {
                authenticated = false;
                updateAccountButton();
                view.stopLoading();
                view.clearHistory();
                view.loadUrl(HOME_URL);
                return true;
            }

            return true;
        }

        if ("https".equalsIgnoreCase(scheme) && SITE_HOST.equalsIgnoreCase(host)) {
            String path = uri.getPath() == null ? "/" : uri.getPath();
            boolean authPage = path.equals("/auth/")
                    || path.startsWith("/auth/signup/")
                    || path.startsWith("/auth/verify/");

            if (authenticated || authPage || path.equals("/")) {
                return false;
            }

            String returnTo = uri.getEncodedPath() == null ? "/" : uri.getEncodedPath();
            if (uri.getEncodedQuery() != null) {
                returnTo += "?" + uri.getEncodedQuery();
            }
            if (uri.getEncodedFragment() != null) {
                returnTo += "#" + uri.getEncodedFragment();
            }

            view.stopLoading();
            view.loadUrl(AUTH_URL + "&returnTo=" + Uri.encode(returnTo));
            return true;
        }

        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            startActivity(intent);
        } catch (Exception ignored) {
            // No external handler available; keep the trusted WebView unchanged.
        }
        return true;
    }

    @Override
    public void onBackPressed() {
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
