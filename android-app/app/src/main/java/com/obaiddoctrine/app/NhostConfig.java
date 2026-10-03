package com.obaiddoctrine.app;

public final class NhostConfig {
    private NhostConfig() {}
    public static final String SUBDOMAIN = "twttbujomdakckte";
    public static final String REGION = "eu-central-1";
    public static final String VERIFICATION_REDIRECT = "obaidmind://auth/verify";
    public static final String PASSWORD_RESET_REDIRECT = "obaidmind://auth/reset";

    public static boolean isConfigured() {
        return !SUBDOMAIN.startsWith("REPLACE_") && !REGION.startsWith("REPLACE_")
                && !SUBDOMAIN.trim().isEmpty() && !REGION.trim().isEmpty();
    }

    public static String authBaseUrl() {
        return "https://" + SUBDOMAIN + ".auth." + REGION + ".nhost.run/v1";
    }
}