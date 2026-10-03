package com.obaiddoctrine.app;

import android.util.Base64;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;

final class Pkce {
    private Pkce() {}
    static String newVerifier() {
        byte[] b=new byte[32]; new SecureRandom().nextBytes(b);
        return Base64.encodeToString(b,Base64.URL_SAFE|Base64.NO_WRAP|Base64.NO_PADDING);
    }
    static String challenge(String verifier)throws Exception {
        byte[] d=MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.US_ASCII));
        return Base64.encodeToString(d,Base64.URL_SAFE|Base64.NO_WRAP|Base64.NO_PADDING);
    }
}