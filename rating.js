(function () {
  "use strict";

  const SUPABASE_URL = "https://nrckrzgxpxfwuyodbylg.supabase.co";
  const SUPABASE_KEY = "sb_publishable_3_4_B6bd6RplwmOZ81sNiQ_vkiIEKlw";
  const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1";

  function text(en, ur) {
    return document.documentElement.lang === "ur" ? ur : en;
  }

  function visitorId() {
    const key = "od_rating_visitor_id";
    try {
      let id = localStorage.getItem(key);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(key, id);
      }
      return id;
    } catch (_) {
      return crypto.randomUUID();
    }
  }

  function injectStyles() {
    if (document.getElementById("od-rating-styles")) return;
    const style = document.createElement("style");
    style.id = "od-rating-styles";
    style.textContent = `
      .od-rating-box{margin:2rem 0;padding:1.25rem;border:1px solid #dce8b5;border-radius:18px;background:#fafaf5;text-align:center}
      .od-rating-title{margin:0 0 .35rem;color:#31543a;font-size:1.08rem;font-weight:700}
      .od-rating-subtitle{margin:0 0 .9rem;color:#6f756f;font-size:.92rem}
      .od-rating-stars{display:flex;justify-content:center;gap:.35rem;flex-wrap:wrap}
      .od-rating-star{border:1px solid #dce8b5;background:#fff;color:#31543a;border-radius:999px;padding:.55rem .75rem;cursor:pointer;font-size:1.05rem;transition:transform .15s ease,background .15s ease}
      .od-rating-star:hover{transform:translateY(-1px);background:#dce8b5}
      .od-rating-star[aria-pressed="true"]{background:#b7d84b;border-color:#31543a}
      .od-rating-result{margin:.8rem 0 0;color:#31543a;font-size:.9rem}
      .od-rating-status{margin:.7rem 0 0;color:#6f756f;font-size:.85rem}
      @media(max-width:600px){.od-rating-box{padding:1rem}.od-rating-star{padding:.5rem .65rem}}
    `;
    document.head.appendChild(style);
  }

  function addBox(target) {
    if (!target || document.querySelector(".od-rating-box")) return;
    injectStyles();
    const box = document.createElement("section");
    box.className = "od-rating-box";
    box.setAttribute("aria-label", text("Article rating", "مضمون کی ریٹنگ"));
    box.innerHTML = `
      <p class="od-rating-title">${text("How useful was this page?", "یہ صفحہ آپ کے لیے کتنا مفید تھا؟")}</p>
      <p class="od-rating-subtitle">${text("Rate from 1 to 5 stars.", "1 سے 5 ستاروں میں ریٹنگ دیں۔")}</p>
      <div class="od-rating-stars" role="group" aria-label="${text("Rate this page", "اس صفحے کو ریٹ کریں")}">
        ${[1,2,3,4,5].map(n => `<button type="button" class="od-rating-star" data-rating="${n}" aria-label="${n} ${text("stars","ستارے")}" aria-pressed="false">★ ${n}</button>`).join("")}
      </div>
      <p class="od-rating-result" aria-live="polite"></p>
      <p class="od-rating-status" aria-live="polite"></p>
    `;
    target.appendChild(box);
    return box;
  }

  function loadSdk() {
    return new Promise((resolve, reject) => {
      if (window.supabase && typeof window.supabase.createClient === "function") return resolve();
      const script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function init() {
    const article = document.querySelector(".article-body, article.content-wrap");
    const test = document.querySelector("#test, .mind-test, [data-mind-test]");
    const target = article || (test && test.closest(".content-wrap")) || test;
    if (!target || document.querySelector(".od-rating-box")) return;

    const box = addBox(target);
    if (!box) return;

    const result = box.querySelector(".od-rating-result");
    const status = box.querySelector(".od-rating-status");
    const path = location.pathname.replace(/index\.html$/, "");
    let client;

    try {
      await loadSdk();
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (_) {
      status.textContent = text("Rating service is temporarily unavailable.", "ریٹنگ سروس فی الحال دستیاب نہیں۔");
      return;
    }

    async function refresh() {
      const { data, error } = await client.rpc("get_content_rating", { p_resource_path: path });
      if (error) {
        status.textContent = text("Rating could not be loaded.", "ریٹنگ لوڈ نہیں ہو سکی۔");
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (row && Number(row.rating_count) > 0) {
        result.textContent = text(
          `Average ${Number(row.average_rating).toFixed(2)} / 5 · ${row.rating_count} rating${Number(row.rating_count) === 1 ? "" : "s"}`,
          `اوسط ${Number(row.average_rating).toFixed(2)} / 5 · ${row.rating_count} ریٹنگز`
        );
      } else {
        result.textContent = text("No ratings yet.", "ابھی کوئی ریٹنگ نہیں۔");
      }
    }

    box.querySelectorAll(".od-rating-star").forEach(button => {
      button.addEventListener("click", async () => {
        const rating = Number(button.dataset.rating);
        box.querySelectorAll(".od-rating-star").forEach(b => {
          b.disabled = true;
          b.setAttribute("aria-pressed", Number(b.dataset.rating) === rating ? "true" : "false");
        });
        status.textContent = text("Saving your rating…", "آپ کی ریٹنگ محفوظ ہو رہی ہے…");
        const { error } = await client.rpc("submit_content_rating", {
          p_resource_path: path,
          p_rating: rating,
          p_visitor_id: visitorId()
        });
        if (error) {
          status.textContent = text("Rating could not be saved. Please try again.", "ریٹنگ محفوظ نہیں ہو سکی۔ دوبارہ کوشش کریں۔");
          box.querySelectorAll(".od-rating-star").forEach(b => { b.disabled = false; });
          return;
        }
        status.textContent = text("Thank you for rating this page.", "اس صفحے کو ریٹ کرنے کا شکریہ۔");
        await refresh();
      });
    });

    await refresh();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();