(() => {
  "use strict";

  const MOBILE_BREAKPOINT = 760;

  function isMobile() {
    return window.matchMedia("(max-width:" + MOBILE_BREAKPOINT + "px)").matches;
  }

  function setBodyLock(locked) {
    if (!isMobile()) {
      document.documentElement.classList.remove("od-mobile-menu-open");
      document.body.classList.remove("od-mobile-menu-open");
      return;
    }
    document.documentElement.classList.toggle("od-mobile-menu-open", locked);
    document.body.classList.toggle("od-mobile-menu-open", locked);
  }

  function closeDetails(details) {
    if (!details) return;
    details.removeAttribute("open");
    const summary = details.querySelector(":scope > summary");
    if (summary) summary.setAttribute("aria-expanded", "false");
    setBodyLock(false);
  }

  function initExistingMobile(details) {
    const summary = details.querySelector(":scope > summary");
    if (!summary) return;

    // Never allow a server-rendered/open <details> menu to cover the page on mobile.
    if (isMobile() && details.open) {
      details.removeAttribute("open");
    }
    summary.setAttribute("aria-expanded", details.open ? "true" : "false");
    setBodyLock(false);

    summary.addEventListener("click", () => {
      requestAnimationFrame(() => {
        summary.setAttribute("aria-expanded", details.open ? "true" : "false");
        setBodyLock(details.open);
      });
    });

    details.addEventListener("toggle", () => {
      summary.setAttribute("aria-expanded", details.open ? "true" : "false");
      setBodyLock(details.open);
    });

    details.querySelectorAll(".mobile-panel a").forEach(link => {
      link.addEventListener("click", () => closeDetails(details));
    });
  }

  function initLegacyNav(header, nav) {
    if (header.querySelector(":scope > .od-mobile-nav-toggle")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "od-mobile-nav-toggle";
    button.setAttribute("aria-label", "Open navigation menu");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

    nav.classList.add("od-legacy-mobile-nav");
    nav.setAttribute("aria-hidden", isMobile() ? "true" : "false");
    header.insertBefore(button, nav);

    const setOpen = open => {
      nav.classList.toggle("od-mobile-nav-open", open);
      button.classList.toggle("od-mobile-nav-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      nav.setAttribute("aria-hidden", open || !isMobile() ? "false" : "true");
      setBodyLock(open);
    };

    button.addEventListener("click", () => setOpen(!nav.classList.contains("od-mobile-nav-open")));

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("click", event => {
      if (!isMobile() || !nav.classList.contains("od-mobile-nav-open")) return;
      if (!header.contains(event.target)) setOpen(false);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") setOpen(false);
    });

    window.addEventListener("resize", () => {
      if (!isMobile()) setOpen(false);
      else if (!nav.classList.contains("od-mobile-nav-open")) nav.setAttribute("aria-hidden", "true");
    });
  }

  function initLanguageSwitch() {
    if (document.querySelector(".od-floating-language-switch")) return;

    const path = window.location.pathname || "/";
    const isUrdu = path === "/ur" || path.startsWith("/ur/");
    let englishPath = path;
    let urduPath = path;

    if (isUrdu) {
      englishPath = path.replace(/^\/ur(?=\/|$)/, "") || "/";
      urduPath = path;
    } else {
      urduPath = path === "/" ? "/ur/" : "/ur" + path;
    }

    const switcher = document.createElement("nav");
    switcher.className = "od-floating-language-switch";
    switcher.setAttribute("aria-label", "Language / زبان");
    switcher.innerHTML =
      '<a href="' + englishPath + '"' + (!isUrdu ? ' aria-current="page"' : "") + '>English</a>' +
      '<span aria-hidden="true">|</span>' +
      '<a href="' + urduPath + '"' + (isUrdu ? ' aria-current="page"' : "") + '>اردو</a>';

    const style = document.createElement("style");
    style.textContent = `
      .od-floating-language-switch {
        position: fixed !important;
        z-index: 2147483000 !important;
        top: max(10px, env(safe-area-inset-top)) !important;
        right: 12px !important;
        display: flex !important;
        align-items: center !important;
        gap: 9px !important;
        padding: 9px 12px !important;
        border: 1px solid rgba(49,84,58,.2) !important;
        border-radius: 999px !important;
        background: #fff !important;
        box-shadow: 0 3px 14px rgba(0,0,0,.14) !important;
        color: #31543A !important;
        font: 700 13px/1.2 system-ui, sans-serif !important;
        direction: ltr !important;
      }
      .od-floating-language-switch a {
        color: #31543A !important;
        text-decoration: none !important;
        white-space: nowrap !important;
      }
      .od-floating-language-switch a[aria-current="page"] {
        text-decoration: underline !important;
        text-underline-offset: 3px !important;
      }
      .od-floating-language-switch span { opacity: .55 !important; }
      @media (max-width: 760px) {
        .od-floating-language-switch { top: max(8px, env(safe-area-inset-top)) !important; right: 8px !important; padding: 8px 10px !important; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(switcher);
  }


  function init() {
    initLanguageSwitch();
    document.querySelectorAll(".site-header").forEach(header => {
      const details = header.querySelector(":scope > details.mobile");
      if (details) {
        initExistingMobile(details);
        return;
      }

      const nav = header.querySelector(":scope > nav");
      if (nav) initLegacyNav(header, nav);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();