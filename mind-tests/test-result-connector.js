/* OBAID DOCTRINE — Mind Test Result Connector
 * Browser-safe Supabase client. Never place a service/secret key here.
 * Visitors can complete tests normally; only authenticated members are saved.
 */
(function () {
  "use strict";

  const SUPABASE_URL = "https://nrckrzgxpxfwuyodbylg.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_3_4_B6bd6RplwmOZ81sNiQ_vkiIEKlw";

  let clientPromise = null;

  function loadSupabase() {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      return Promise.resolve(window.supabase);
    }
    if (clientPromise) return clientPromise;

    clientPromise = new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[data-od-supabase="true"]');
      if (existing) {
        existing.addEventListener("load", function () { resolve(window.supabase); }, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.dataset.odSupabase = "true";
      script.onload = function () { resolve(window.supabase); };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return clientPromise;
  }

  window.saveMindTestResult = async function (result) {
    try {
      const sdk = await loadSupabase();
      if (!sdk || typeof sdk.createClient !== "function") return { saved: false, reason: "client_unavailable" };

      const supabase = sdk.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
      const sessionResponse = await supabase.auth.getSession();
      const session = sessionResponse && sessionResponse.data && sessionResponse.data.session;

      if (!session || !session.user) {
        return { saved: false, reason: "visitor" };
      }

      const payload = Object.assign({}, result, {
        user_id: session.user.id
      });

      const response = await supabase.from("test_results").insert(payload).select("id").single();

      if (response.error) {
        console.warn("[Obaid Doctrine] Test result was not saved:", response.error.message);
        return { saved: false, reason: "database_error" };
      }

      return { saved: true, id: response.data && response.data.id };
    } catch (error) {
      console.warn("[Obaid Doctrine] Test result connector unavailable:", error);
      return { saved: false, reason: "connector_error" };
    }
  };
})();