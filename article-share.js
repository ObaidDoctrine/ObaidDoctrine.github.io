/* OBAID DOCTRINE — Article Sharing
   Real share actions: Facebook, WhatsApp, LinkedIn, X, Copy Link, Native Web Share.
   No fake counters, no external SDK required.
*/
(function () {
  "use strict";
  function ready() {
    if (!document.querySelector(".article-body") || document.querySelector("[data-od-article-share]")) return;
    const title = (document.querySelector("h1") || document.querySelector("title"))?.textContent?.trim() || document.title;
    const url = window.location.href.split("#")[0];
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const wrap = document.createElement("div");
    wrap.className = "od-article-share";
    wrap.setAttribute("data-od-article-share", "true");
    wrap.setAttribute("aria-label", "Share this article");
    wrap.innerHTML =
      '<div class="od-share-heading">Share this article</div>' +
      '<div class="od-share-actions">' +
      '<button type="button" data-share="native" hidden>Share</button>' +
      '<a target="_blank" rel="noopener noreferrer" data-share="facebook" href="https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl + '">Facebook</a>' +
      '<a target="_blank" rel="noopener noreferrer" data-share="whatsapp" href="https://api.whatsapp.com/send?text=' + encodedTitle + '%20' + encodedUrl + '">WhatsApp</a>' +
      '<a target="_blank" rel="noopener noreferrer" data-share="linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodedUrl + '">LinkedIn</a>' +
      '<a target="_blank" rel="noopener noreferrer" data-share="x" href="https://x.com/intent/post?text=' + encodedTitle + '&url=' + encodedUrl + '">X</a>' +
      '<button type="button" data-share="copy">Copy Link</button>' +
      '</div><span class="od-share-status" role="status" aria-live="polite"></span>';
    const article = document.querySelector(".article-body");
    article.parentNode.insertBefore(wrap, article);
    const native = wrap.querySelector('[data-share="native"]');
    const status = wrap.querySelector(".od-share-status");
    if (navigator.share) {
      native.hidden = false;
      native.addEventListener("click", async function () {
        try { await navigator.share({ title, text: title, url }); }
        catch (e) { if (e && e.name !== "AbortError") status.textContent = "Share was not completed."; }
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
        status.textContent = "Link copied.";
      } catch (e) { status.textContent = "Copy failed. Please copy the URL from your browser."; }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();