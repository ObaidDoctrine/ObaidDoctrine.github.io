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
    if (document.querySelector(".od-side-menu")) return;

    const path = window.location.pathname || "/";
    const isUrdu = path === "/ur" || path.startsWith("/ur/");
    const prefix = isUrdu ? "/ur" : "";
    const label = isUrdu ? {
      menu: "مینو کھولیں", close: "مینو بند کریں", home: "ہوم", psychology: "نفسیات",
      behaviour: "انسانی رویّے", relationships: "تعلقات", family: "شادی اور خاندان",
      articles: "مضامین", tests: "مائنڈ ٹیسٹس", research: "تحقیق", about: "ہمارے بارے میں",
      contact: "رابطہ", privacy: "پرائیویسی پالیسی", terms: "شرائط و ضوابط",
      language: "زبان تبدیل کریں", other: "English"
    } : {
      menu: "Open menu", close: "Close menu", home: "Home", psychology: "Psychology",
      behaviour: "Human Behaviour", relationships: "Relationships", family: "Marriage & Family",
      articles: "Articles", tests: "Mind Tests", research: "Research Insights", about: "About",
      contact: "Contact", privacy: "Privacy Policy", terms: "Terms & Conditions",
      language: "Language", other: "اردو"
    };

    const englishPath = isUrdu ? path.replace(/^\/ur(?=\/|$)/, "") || "/" : path;
    const urduPath = isUrdu ? path : (path === "/" ? "/ur/" : "/ur" + path);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "od-side-menu-toggle";
    button.setAttribute("aria-label", label.menu);
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = '<span aria-hidden="true">☰</span><small>' + (isUrdu ? "مینو" : "Menu") + '</small>';

    const languageBar = document.createElement("div");
    languageBar.className = "od-visible-language-switch";
    languageBar.setAttribute("aria-label", "Choose language");
    languageBar.innerHTML = '<a href="' + englishPath + '"' + (!isUrdu ? ' aria-current="page"' : '') + '>English</a><a href="' + urduPath + '"' + (isUrdu ? ' aria-current="page"' : '') + '>اردو</a>';

    const overlay = document.createElement("div");
    overlay.className = "od-side-menu-overlay";
    overlay.hidden = true;

    const panel = document.createElement("aside");
    panel.className = "od-side-menu";
    panel.setAttribute("aria-label", "OBAID DOCTRINE navigation");
    panel.hidden = true;
    const links = [
      ["home", prefix + "/"], ["psychology", prefix + "/psychology/"],
      ["behaviour", prefix + "/human-behaviour/"], ["relationships", prefix + "/relationships/"],
      ["family", prefix + "/marriage-family/"], ["articles", prefix + "/articles/"],
      ["tests", prefix + "/mind-tests/"], ["research", prefix + "/research-insights/"],
      ["about", prefix + "/about/"], ["contact", prefix + "/contact/"],
      ["privacy", prefix + "/privacy-policy/"], ["terms", prefix + "/terms-and-conditions/"]
    ];
    panel.innerHTML = '<div class="od-side-menu-heading"><strong>OBAID DOCTRINE</strong><button type="button" class="od-side-menu-close" aria-label="' + label.close + '">×</button></div>' +
      '<nav>' + links.map(item => '<a href="' + item[1] + '">' + label[item[0]] + '</a>').join("") + '</nav>' +
      '<div class="od-side-menu-languages"><span>' + label.language + '</span><a href="' + englishPath + '">English</a><a href="' + urduPath + '">اردو</a></div>';

    const style = document.createElement("style");
    style.textContent = `
      .od-side-menu-toggle {
        position:fixed!important; right:12px!important; top:12px!important; z-index:2147483000!important;
        display:flex!important; flex-direction:column!important; align-items:center!important; justify-content:center!important;
        gap:3px!important; width:52px!important; min-height:54px!important; padding:7px 5px!important;
        border:1px solid rgba(49,84,58,.25)!important; border-radius:16px!important; background:#fff!important;
        color:#31543A!important; box-shadow:0 4px 18px rgba(0,0,0,.18)!important; cursor:pointer!important;
        font:700 20px/1 system-ui,sans-serif!important;
      }
      .od-side-menu-toggle small { font-size:10px!important; line-height:1.2!important; }
      .od-visible-language-switch {
        position:fixed!important; top:18px!important; right:72px!important; z-index:2147483000!important;
        display:flex!important; align-items:center!important; gap:4px!important; padding:4px!important;
        border:1px solid rgba(49,84,58,.22)!important; border-radius:13px!important;
        background:#fff!important; box-shadow:0 4px 18px rgba(0,0,0,.14)!important;
        font:700 12px/1.2 system-ui,sans-serif!important;
      }
      .od-visible-language-switch a {
        display:block!important; padding:8px 9px!important; border-radius:9px!important;
        color:#31543A!important; text-decoration:none!important; white-space:nowrap!important;
      }
      .od-visible-language-switch a[aria-current="page"] { background:#dce8b5!important; }

      .od-side-menu-overlay { position:fixed!important; inset:0!important; z-index:2147483001!important; background:rgba(12,24,17,.45)!important; }
      .od-side-menu {
        position:fixed!important; z-index:2147483002!important; top:0!important; right:0!important; bottom:0!important;
        width:min(330px,86vw)!important; max-height:100dvh!important; overflow-y:auto!important; box-sizing:border-box!important;
        padding:18px!important; background:#FAFAF5!important; color:#243128!important; box-shadow:-12px 0 35px rgba(0,0,0,.2)!important;
        font:500 15px/1.5 system-ui,sans-serif!important; direction:ltr!important;
      }
      .od-side-menu[hidden], .od-side-menu-overlay[hidden] { display:none!important; }
      .od-side-menu-heading { display:flex!important; justify-content:space-between!important; align-items:center!important; gap:12px!important; padding:4px 0 16px!important; border-bottom:1px solid #dce5d8!important; color:#31543A!important; }
      .od-side-menu-close { width:38px!important; height:38px!important; border:0!important; border-radius:10px!important; background:#eaf0e5!important; color:#31543A!important; font-size:28px!important; cursor:pointer!important; }
      .od-side-menu nav { display:flex!important; flex-direction:column!important; gap:5px!important; padding:14px 0!important; }
      .od-side-menu nav a { display:block!important; padding:10px 12px!important; border-radius:10px!important; color:#31543A!important; background:#fff!important; text-decoration:none!important; font-size:14px!important; font-weight:700!important; }
      .od-side-menu nav a:hover { background:#eaf0d9!important; }
      .od-side-menu-languages { display:flex!important; flex-wrap:wrap!important; align-items:center!important; gap:8px!important; padding-top:14px!important; border-top:1px solid #dce5d8!important; font-size:13px!important; }
      .od-side-menu-languages span { flex-basis:100%!important; font-weight:800!important; }
      .od-side-menu-languages a { padding:8px 11px!important; border-radius:9px!important; background:#dce8b5!important; color:#31543A!important; text-decoration:none!important; font-weight:800!important; }
      @media(max-width:760px){ .od-side-menu-toggle { right:8px!important; top:12px!important; width:46px!important; min-height:50px!important; border-radius:14px!important; } .od-visible-language-switch { right:62px!important; top:17px!important; } .od-visible-language-switch a { padding:8px 7px!important; } }
    `;
    document.head.appendChild(style);
    document.body.appendChild(button);
    document.body.appendChild(languageBar);
    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    const setOpen = open => {
      panel.hidden = !open;
      overlay.hidden = !open;
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.setAttribute("aria-label", open ? label.close : label.menu);
      button.innerHTML = open ? '<span aria-hidden="true">×</span><small>' + (isUrdu ? "بند" : "Close") + '</small>' : '<span aria-hidden="true">☰</span><small>' + (isUrdu ? "مینو" : "Menu") + '</small>';
      document.body.style.overflow = open ? "hidden" : "";
    };
    button.addEventListener("click", () => setOpen(panel.hidden));
    panel.querySelector(".od-side-menu-close").addEventListener("click", () => setOpen(false));
    overlay.addEventListener("click", () => setOpen(false));
    panel.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", event => { if (event.key === "Escape") setOpen(false); });
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