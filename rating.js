/* OBAID DOCTRINE — lightweight 1–5 star rating system */
(() => {
  const API = "https://ep-raspy-haze-b4bugly0.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1";
  const path = window.location.pathname.replace(/index\.html$/, "") || "/";
  const key = "od_rating_" + path;
  const visitorKey = "od_rating_visitor_id";
  const isArticle = path === "/" || path === "/ur/" || ((path.startsWith("/articles/") || path.startsWith("/ur/articles/")) && path !== "/articles/" && path !== "/ur/articles/" && !!document.querySelector("main article"));
  if (!isArticle || document.querySelector("[data-od-rating]")) return;

  const css = document.createElement("style");
  css.textContent = `
    .od-rating{margin:34px 0 8px;padding:24px;border:1px solid rgba(49,84,58,.12);border-radius:22px;background:#fff;box-shadow:0 10px 28px rgba(49,84,58,.06);text-align:center}
    .od-rating h3{margin:0 0 7px;color:#31543A;font:800 22px/1.2 Arial,sans-serif}
    .od-rating p{margin:0 0 14px;color:#6F756F;font:600 13px/1.45 Arial,sans-serif}
    .od-stars{display:flex;justify-content:center;gap:7px;margin:8px 0 12px}
    .od-star{appearance:none;border:0;background:transparent;color:#B7D84B;font-size:32px;line-height:1;padding:3px;cursor:pointer;transition:transform .15s ease,opacity .15s ease}
    .od-star:hover,.od-star:focus-visible{transform:scale(1.12);outline:none}
    .od-star[aria-pressed="false"]{opacity:.34}
    .od-summary{font:800 12px/1.4 Arial,sans-serif;color:#31543A}
    @media(max-width:600px){.od-rating{padding:20px 14px;border-radius:18px}.od-rating h3{font-size:19px}.od-star{font-size:29px}}
  `;
  document.head.appendChild(css);

  let visitorId = localStorage.getItem(visitorKey);

  // Keep the rating system compatible with older mobile browsers that do not
  // expose crypto.randomUUID(), while still using cryptographically random
  // values when getRandomValues() is available.
  const makeVisitorId = () => {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
      return hex.slice(0,8) + "-" + hex.slice(8,12) + "-" + hex.slice(12,16) + "-" + hex.slice(16,20) + "-" + hex.slice(20);
    }
    return "od-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2) + "-" + Math.random().toString(36).slice(2);
  };

  if (!visitorId) {
    visitorId = makeVisitorId();
    try { localStorage.setItem(visitorKey, visitorId); } catch {}
  }

  const box = document.createElement("section");
  box.className = "od-rating";
  box.dataset.odRating = "true";
  box.setAttribute("aria-label", "Rate this page");
  box.innerHTML = `
    <h3>Was this page helpful?</h3>
    <p>Your 1–5 star rating helps OBAID DOCTRINE improve its educational content.</p>
    <div class="od-stars" role="group" aria-label="Choose a rating from 1 to 5">
      ${[1,2,3,4,5].map(n => `<button class="od-star" type="button" data-rating="${n}" aria-label="${n} out of 5 stars" aria-pressed="false">★</button>`).join("")}
    </div>
    <div class="od-summary">Loading rating data…</div>
  `;

  const footer = document.querySelector("footer");
  if (footer) footer.parentNode.insertBefore(box, footer);
  else document.body.appendChild(box);

  const stars = [...box.querySelectorAll(".od-star")];
  const summary = box.querySelector(".od-summary");
  const saved = localStorage.getItem(key);

  const apiGet = async () => {
    const u = API + "/article_rating_summary?select=average_rating,rating_count&page_path=eq." + encodeURIComponent(path);
    const res = await fetch(u, {
      method: "GET",
      headers: {"Accept":"application/json","Accept-Profile":"public"}
    });
    if (!res.ok) throw new Error("summary " + res.status);
    const rows = await res.json();
    return rows[0] || null;
  };

  const refresh = async () => {
    try {
      const row = await apiGet();
      if (row && row.average_rating !== null && row.average_rating !== undefined) {
        summary.textContent = Number(row.average_rating).toFixed(1) + " / 5 · " + Number(row.rating_count) + " ratings";
      } else {
        summary.textContent = "No ratings yet — be the first.";
      }
    } catch {
      summary.textContent = "Rate this page to help us improve.";
    }
  };

  const setSelected = value => stars.forEach(s => s.setAttribute("aria-pressed", Number(s.dataset.rating) === value ? "true" : "false"));

  if (saved) {
    const value = Number(saved);
    setSelected(value);
    summary.textContent = "Thank you — you rated this page " + value + "/5.";
  } else {
    stars.forEach(star => star.addEventListener("click", async () => {
      const rating = Number(star.dataset.rating);
      stars.forEach(s => s.disabled = true);
      try {
        const res = await fetch(API + "/article_ratings", {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
            "Accept":"application/json",
            "Content-Profile":"public",
            "Accept-Profile":"public",
            "Prefer":"return=minimal"
          },
          body:JSON.stringify({page_path:path,rating,visitor_id:visitorId})
        });
        if (!res.ok && res.status !== 409) {
          const detail = await res.text().catch(() => "");
          console.error("[OBAID DOCTRINE rating] POST failed:", res.status, detail);
          throw new Error("rating " + res.status + " " + detail);
        }

        // A 409 means this browser/visitor already has a rating for this page.
        // Treat it as an already-recorded rating instead of showing a failure.
        try { localStorage.setItem(key, String(rating)); } catch {}
        setSelected(rating);
        summary.textContent = "Thank you — your " + rating + "/5 rating was recorded.";
        if (typeof window.gtag === "function") window.gtag("event","content_rating",{page_path:path,rating:rating});
        await refresh();
      } catch {
        stars.forEach(s => s.disabled = false);
        summary.textContent = "We couldn't save the rating right now. Please try again.";
      }
    }));
    refresh();
  }
})();