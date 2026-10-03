# OBAIDMIND — NHOST AUTHENTICATION IMPLEMENTATION

## Architecture

The current Android project is a small Java WebView shell around https://obaiddoctrine.com/. The existing WebView behavior and application ID were preserved. Authentication is implemented natively in the Android shell so credentials and Nhost session tokens are not placed in the website JavaScript layer.

### Flow

Create Account → Nhost verification email → email verification → explicit Login → existing WebView app → Logout → Login again.

Password reset uses Nhost PKCE and a native obaidmind://auth/reset callback.

## Nhost configuration

Required public project values:

- Nhost subdomain
- Nhost region

They belong in:
android-app/app/src/main/java/com/obaiddoctrine/app/NhostConfig.java

No Nhost admin secret, service-role key, database password, or privileged credential belongs in the Android app.

Nhost Cloud service URLs follow the documented pattern:
https://<subdomain>.auth.<region>.nhost.run/v1

## Required Nhost Dashboard settings

Configure Email + Password authentication and keep Require Verified Emails enabled.

Add these two Allowed Redirect URLs:

- obaidmind://auth/verify
- obaidmind://auth/reset

The Nhost documentation states that email verification is enabled by default and that PKCE can securely exchange the authorization code returned after verification. The implementation exchanges the verification code and immediately signs the user out so email verification itself does not grant normal app access; the user must explicitly log in afterward.

Keep sign-up enabled.

The current Nhost default password minimum is 9 characters. The Android validation therefore requires at least 9 characters.

## Session security

The access token and refresh token are encrypted at rest using Android Keystore-backed AES-GCM. Plaintext passwords are never stored.

The access token lifetime is handled using the expiration returned by Nhost. If it expires, the app attempts a refresh with the stored refresh token.

Logout sends the refresh token to Nhost's sign-out endpoint and clears the local encrypted session.

## Files changed

- android-app/app/src/main/AndroidManifest.xml
- android-app/app/src/main/java/com/obaiddoctrine/app/MainActivity.java
- android-app/app/src/main/java/com/obaiddoctrine/app/AuthActivity.java
- android-app/app/src/main/java/com/obaiddoctrine/app/NhostApi.java
- android-app/app/src/main/java/com/obaiddoctrine/app/NhostConfig.java
- android-app/app/src/main/java/com/obaiddoctrine/app/Pkce.java
- android-app/app/src/main/java/com/obaiddoctrine/app/SecureSessionStore.java

No Firebase, Auth0, Clerk, or other paid authentication dependency was added.

## Manual steps still required

1. Create or select the Nhost project.
2. Copy its public subdomain and region into NhostConfig.java.
3. In Nhost Authentication, enable Email + Password and keep verified-email requirement enabled.
4. Add the two obaidmind:// redirect URLs.
5. Build and install the APK.
6. Run the complete end-to-end test matrix with a real test mailbox.

## Free-tier notes

Nhost currently documents a free Starter plan. Free projects have shared compute limits and do not include daily database backups. Nhost also documents an authentication email-sending limit of 10 emails/hour for projects without custom SMTP settings. These are service limits, not unlimited usage.

## Security boundary

The Nhost subdomain and region are public client configuration. An Nhost admin/service-role secret must never be added to this project or APK.
