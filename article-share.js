/* OBAID DOCTRINE — Article Sharing
   Real share actions: Facebook, WhatsApp, LinkedIn, X, Copy Link, Native Web Share.
   English/Urdu UI. No fake counters or backend.
*/
(function () {
  "use strict";
  function ready() {
    if (!document.getElementById("od-article-share-style")) {
      const s = document.createElement("style");
      s.id = "od-article-share-style";
      s.textContent = ".od-article-share{margin:1.25rem 0;padding:1rem 1.1rem;border:1px solid #dce8b5;border-radius:16px;background:#fafaf5}.od-share-heading{font-weight:700;margin-bottom:.7rem}.od-share-actions{display:flex;flex-wrap:wrap;gap:.55rem}.od-share-actions a,.od-share-actions button{font:inherit;text-decoration:none;cursor:pointer;border:1px solid #31543a;border-radius:999px;padding:.55rem .8rem;background:#fff;color:#31543a}.od-share-actions a:hover,.od-share-actions button:hover{background:#dce8b5}.od-share-status{display:block;margin-top:.55rem;font-size:.9rem;color:#6f756f}";
      document.head.appendChild(s);
    }
    const article = document.querySelector(".article-body, article.content-wrap");
    if (!article || document.querySelector("[data-od-article-share]")) return;
    const title = (document.querySelector("h1") || document.querySelector("title"))?.textContent?.trim() || document.title;
    const url = window.location.href.split("#")[0];
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const isUrdu = (document.documentElement.lang || "").toLowerCase().startsWith("ur");
    const t = isUrdu
      ? {heading:"یہ مضمون شیئر کریں", share:"شیئر کریں", facebook:"فیس بک", whatsapp:"واٹس ایپ", linkedin:"لنکڈ اِن", x:"X", copy:"لنک کاپی کریں", copied:"لنک کاپی ہو گیا۔", shareFail:"شیئر مکمل نہیں ہو سکا۔", copyFail:"لنک کاپی نہیں ہو سکا۔ براہِ کرم براؤزر سے URL کاپی کریں۔"}
      : {heading:"Share this article", share:"Share", facebook:"Facebook", whatsapp:"WhatsApp", linkedin:"LinkedIn", x:"X", copy:"Copy Link", copied:"Link copied.", shareFail:"Share was not completed.", copyFail:"Copy failed. Please copy the URL from your browser."};
    const wrap = document.createElement("div");
    wrap.className = "od-article-share";
    wrap.setAttribute("data-od-article-share", "true");
    wrap.setAttribute("aria-label", t.heading);
    wrap.innerHTML =
      '<div class="od-share-heading">' + t.heading + '</div>' +
      '<div class="od-share-actions">' +
      '<button type="button" data-share="native" hidden>' + t.share + '</button>' +
      '<a target="_blank" rel="noopener noreferrer" data-share="facebook" href="https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl + '">' + t.facebook + '</a>' +
      '<a target="_blank" rel="noopener noreferrer" data-share="whatsapp" href="https://api.whatsapp.com/send?text=' + encodedTitle + '%20' + encodedUrl + '">' + t.whatsapp + '</a>' +
      '<a target="_blank" rel="noopener noreferrer" data-share="linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodedUrl + '">' + t.linkedin + '</a>' +
      '<a target="_blank" rel="noopener noreferrer" data-share="x" href="https://x.com/intent/post?text=' + encodedTitle + '&url=' + encodedUrl + '">' + t.x + '</a>' +
      '<button type="button" data-share="copy">' + t.copy + '</button>' +
      '</div><span class="od-share-status" role="status" aria-live="polite"></span>';
    article.parentNode.insertBefore(wrap, article);
    const native = wrap.querySelector('[data-share="native"]');
    const status = wrap.querySelector(".od-share-status");
    if (navigator.share) {
      native.hidden = false;
      native.addEventListener("click", async function () {
        try { await navigator.share({ title, text: title, url }); }
        catch (e) { if (e && e.name !== "AbortError") status.textContent = t.shareFail; }
      });
    }
    wrap.querySelector('[data-share="copy"]').addEventListener("click", async function () {
      try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(url);
        else {
          const ta = document.createElement("textarea");
          ta.value = url; ta.setAttribute("readonly", "");
          ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); ta.remove();
        }
        status.textContent = t.copied;
      } catch (e) { status.textContent = t.copyFail; }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
