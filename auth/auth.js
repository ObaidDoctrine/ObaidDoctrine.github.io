import { createClient } from "https://esm.sh/@nhost/nhost-js@4.8.0";
import { generatePKCEPair } from "https://esm.sh/@nhost/nhost-js@4.8.0/auth";

const nhost = createClient({
  subdomain: "ctwtjtbtbujomdskcktc",
  region: "eu-central-1"
});

const APP_MODE = new URLSearchParams(window.location.search).get("app") === "1";
const APP_CALLBACK = "obaiddoctrine://auth-success";
const LOGOUT_CALLBACK = "obaiddoctrine://logout";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const statusEl = document.getElementById("auth-status");
const formPanel = document.getElementById("login-panel");
const sessionPanel = document.getElementById("session-panel");
const userEmailEl = document.getElementById("user-email");
const logoutButton = document.getElementById("logout-button");
const submitButton = document.getElementById("login-button");

function setStatus(message, type = "") {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.type = type;
}

function redirectIntoAndroidApp(callback) {
  if (APP_MODE) {
    const returnTo = new URLSearchParams(window.location.search).get("returnTo");
    const target = new URL(callback);
    if (returnTo) target.searchParams.set("returnTo", returnTo);
    window.location.replace(target.toString());
  }
}

function renderSession(session) {
  const user = session?.user;

  if (user) {
    if (formPanel) formPanel.hidden = true;
    if (sessionPanel) sessionPanel.hidden = false;
    if (userEmailEl) userEmailEl.textContent = user.email || "Authenticated user";
    setStatus("Session verified.", "success");
    redirectIntoAndroidApp(APP_CALLBACK);
    return;
  }

  if (formPanel) formPanel.hidden = false;
  if (sessionPanel) sessionPanel.hidden = true;
  if (userEmailEl) userEmailEl.textContent = "";
  setStatus("Not signed in.");
}

async function restoreSession() {
  try {
    const session = await nhost.refreshSession(60);
    renderSession(session);
  } catch (error) {
    console.error("Nhost session restore failed:", error);
    renderSession(null);
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      setStatus("Please enter your email and password.", "error");
      return;
    }

    submitButton.disabled = true;
    setStatus("Signing in…");

    try {
      const response = await nhost.auth.signInEmailPassword({ email, password });
      const session = response.body?.session || nhost.getUserSession();

      if (!session) {
        throw new Error(
          "Nhost did not return an active session. If MFA is enabled, complete the MFA challenge."
        );
      }

      renderSession(session);
      form.reset();
    } catch (error) {
      console.error("Nhost sign-in failed:", error);
      const message =
        error?.body?.message ||
        error?.message ||
        "Sign-in failed. Check your email and password.";
      setStatus(message, "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    setStatus("Signing out…");

    try {
      const session = nhost.getUserSession();

      if (session?.refreshTokenId) {
        await nhost.auth.signOut({ refreshToken: session.refreshTokenId });
      }

      nhost.clearSession();

      if (APP_MODE) {
        window.location.replace(LOGOUT_CALLBACK);
        return;
      }

      renderSession(null);
    } catch (error) {
      console.error("Nhost sign-out failed:", error);
      setStatus(
        error?.body?.message ||
          error?.message ||
          "Sign-out failed. Please try again.",
        "error"
      );
    } finally {
      logoutButton.disabled = false;
    }
  });
}

if (form) restoreSession();

export async function signUpWithEmail(email, password, displayName = "") {
  const { verifier, challenge } = await generatePKCEPair();

  localStorage.setItem("nhost_pkce_verifier", verifier);

  const options = {
    redirectTo: `${window.location.origin}/auth/verify/${APP_MODE ? "?app=1" : ""}`,
  };
  if (displayName.trim()) {
    options.displayName = displayName.trim().slice(0, 32);
  }

  return nhost.auth.signUpEmailPassword({
    email,
    password,
    options,
    codeChallenge: challenge,
  });
}


export async function requestPasswordReset(email) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error("Enter your email address.");
  const { verifier, challenge } = await generatePKCEPair();
  localStorage.setItem("nhost_pkce_verifier_password_reset", verifier);
  const redirectTo = new URL("/auth/reset-password/", window.location.origin);
  if (APP_MODE) redirectTo.searchParams.set("app", "1");
  try {
    return await nhost.auth.userPasswordReset({
      email: normalizedEmail,
      options: { redirectTo: redirectTo.toString() },
      codeChallenge: challenge,
    });
  } catch (error) {
    localStorage.removeItem("nhost_pkce_verifier_password_reset");
    throw error;
  }
}

export async function resendVerificationEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error("Enter your email address.");
  const { verifier, challenge } = await generatePKCEPair();
  localStorage.setItem("nhost_pkce_verifier", verifier);
  const redirectTo = new URL("/auth/verify/", window.location.origin);
  if (APP_MODE) redirectTo.searchParams.set("app", "1");
  try {
    return await nhost.auth.userEmailSendVerificationEmail({
      email: normalizedEmail,
      options: { redirectTo: redirectTo.toString() },
      codeChallenge: challenge,
    });
  } catch (error) {
    localStorage.removeItem("nhost_pkce_verifier");
    throw error;
  }
}

export async function completePasswordReset(newPassword) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const verifier = localStorage.getItem("nhost_pkce_verifier_password_reset");
  if (!code || !verifier) {
    throw new Error("This reset link is incomplete or expired. Request a new password reset email.");
  }
  await nhost.auth.tokenExchange({ code, codeVerifier: verifier });
  localStorage.removeItem("nhost_pkce_verifier_password_reset");
  await nhost.auth.changePassword({ newPassword });
  // Nhost revokes all existing sessions after a password change.
  nhost.clearSession();
}
}
