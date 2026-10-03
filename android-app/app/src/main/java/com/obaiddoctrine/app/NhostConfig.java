package com.obaiddoctrine.app;

public final class NhostConfig {
    private NhostConfig() {}
    public static final String SUBDOMAIN = "REPLACE_WITH_NHOST_SUBDOMAIN";
    public static final String REGION = "REPLACE_WITH_NHOST_REGION";
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