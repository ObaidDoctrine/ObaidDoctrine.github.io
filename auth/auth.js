import { createClient } from "https://esm.sh/@nhost/nhost-js@4.8.0";
import { generatePKCEPair } from "https://esm.sh/@nhost/nhost-js@4.8.0/auth";

const nhost = createClient({
  subdomain: "ctwtjtbtbujomdskcktc",
  region: "eu-central-1"
});

const params = new URLSearchParams(window.location.search);
const APP_MODE = params.get("app") === "1";
const APP_MANAGE_MODE = APP_MODE && params.get("manage") === "1";
const APP_CALLBACK = "obaiddoctrine://auth-success";
const LOGOUT_CALLBACK = "obaiddoctrine://logout";

function getSafeReturnTo(value = params.get("returnTo")) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    if (url.pathname.startsWith("/auth/")) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

function continueAfterLogin() {
  if (APP_MODE) {
    // Keep the native Account screen visible so the user can sign out.
    if (APP_MANAGE_MODE) return;
    const destination = getSafeReturnTo();
    const callback = APP_CALLBACK + (destination
      ? "?returnTo=" + encodeURIComponent(destination)
      : "");
    window.location.replace(callback);
    return;
  }
  const destination = getSafeReturnTo();
  if (destination) window.location.replace(destination);
}

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const statusEl = document.getElementById("auth-status");
const formPanel = document.getElementById("login-panel");
const sessionPanel = document.getElementById("session-panel");
const userEmailEl = document.getElementById("user-email");
const logoutButton = document.getElementById("logout-button");
const submitButton = document.getElementById("login-button");
const signupLink = document.getElementById("signup-link");

function setStatus(message, type = "") {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.type = type;
}

function renderSession(session) {
  const user = session?.user;

  if (user) {
    if (formPanel) formPanel.hidden = true;
    if (sessionPanel) sessionPanel.hidden = false;
    if (userEmailEl) userEmailEl.textContent = user.email || "Authenticated user";
    if (signupLink) signupLink.hidden = true;
    setStatus("Session verified.", "success");
    continueAfterLogin();
    return;
  }

  if (formPanel) formPanel.hidden = false;
  if (sessionPanel) sessionPanel.hidden = true;
  if (userEmailEl) userEmailEl.textContent = "";
  if (signupLink) signupLink.hidden = false;
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

    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";

    if (!email || !password) {
      setStatus("Please enter your email and password.", "error");
      return;
    }

    if (submitButton) submitButton.disabled = true;
    setStatus("Signing in…");

    try {
      const response = await nhost.auth.signInEmailPassword({ email, password });
      const session = response.body?.session || nhost.getUserSession();

      if (!session?.user) {
        throw new Error(
          "No active session was returned. If multi-factor authentication is enabled, complete its verification step."
        );
      }

      renderSession(session);
      form.reset();
    } catch (error) {
      console.error("Nhost sign-in failed:", error);
      setStatus(
        error?.body?.message || error?.message || "Sign-in failed. Check your email and password.",
        "error"
      );
    } finally {
      if (submitButton) submitButton.disabled = false;
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
        error?.body?.message || error?.message || "Sign-out failed. Please try again.",
        "error"
      );
    } finally {
      logoutButton.disabled = false;
    }
  });
}

restoreSession();

export async function signUpWithEmail(email, password, displayName) {
  const { verifier, challenge } = await generatePKCEPair();
  localStorage.setItem("nhost_pkce_verifier", verifier);

  const redirectParams = new URLSearchParams();
  if (APP_MODE) redirectParams.set("app", "1");
  const returnTo = getSafeReturnTo();
  if (returnTo) redirectParams.set("returnTo", returnTo);

  const redirectUrl = new URL("/auth/verify/", window.location.origin);
  if (redirectParams.toString()) redirectUrl.search = redirectParams.toString();

  try {
    return await nhost.auth.signUpEmailPassword({
      email,
      password,
      options: {
        displayName: displayName?.trim().slice(0, 32),
        locale: "en",
        redirectTo: redirectUrl.toString()
      },
      codeChallenge: challenge
    });
  } catch (error) {
    localStorage.removeItem("nhost_pkce_verifier");
    throw error;
  }
}
