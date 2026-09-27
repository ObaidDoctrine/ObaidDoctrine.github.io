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

    summary.setAttribute("aria-expanded", details.open ? "true" : "false");
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
    nav.setAttribute("aria-hidden", "true");
    header.insertBefore(button, nav);

    const setOpen = open => {
      nav.classList.toggle("od-mobile-nav-open", open);
      button.classList.toggle("od-mobile-nav-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      nav.setAttribute("aria-hidden", open ? "false" : "true");
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
    });
  }

  function init() {
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