import { test } from "@playwright/test";

const routes = [
  { name: "home-en-desktop", path: "/", width: 1365, height: 900 },
  { name: "home-en-mobile", path: "/", width: 390, height: 844, mobile: true },
  { name: "home-ur-desktop", path: "/ur/", width: 1365, height: 900 },
  { name: "home-ur-mobile", path: "/ur/", width: 390, height: 844, mobile: true },
];

function observerScript() {
  window.__odLayoutShiftEntries = [];
  if (!("PerformanceObserver" in window) ||
      !PerformanceObserver.supportedEntryTypes?.includes("layout-shift")) return;
  const selectorFor = (node) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;
    const parts = [];
    let current = node;
    while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
      let part = current.tagName.toLowerCase();
      if (current.id) {
        part += "#" + current.id;
        parts.unshift(part);
        break;
      }
      if (current.classList?.length) {
        part += "." + [...current.classList].slice(0, 3).join(".");
      }
      parts.unshift(part);
      current = current.parentElement;
    }
    return parts.join(" > ");
  };
  const rect = (value) => value ? {
    x: Math.round(value.x * 10) / 10,
    y: Math.round(value.y * 10) / 10,
    width: Math.round(value.width * 10) / 10,
    height: Math.round(value.height * 10) / 10,
  } : null;
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__odLayoutShiftEntries.push({
        value: entry.value,
        startTime: Math.round(entry.startTime),
        hadRecentInput: entry.hadRecentInput,
        sources: (entry.sources || []).map((source) => ({
          selector: selectorFor(source.node),
          previousRect: rect(source.previousRect),
          currentRect: rect(source.currentRect),
        })),
      });
    }
  });
  observer.observe({ type: "layout-shift", buffered: true });
}

for (const route of routes) {
  test(`diagnostic: layout shifts — ${route.name}`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      viewport: { width: route.width, height: route.height },
      isMobile: Boolean(route.mobile),
      hasTouch: Boolean(route.mobile),
      deviceScaleFactor: route.mobile ? 1 : 1,
    });
    const page = await context.newPage();
    await page.addInitScript(observerScript);
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    try {
      const response = await page.goto(route.path, { waitUntil: "load" });
      await page.waitForTimeout(4000);
      const report = await page.evaluate(() => {
        const entries = window.__odLayoutShiftEntries || [];
        const clsEntries = entries.filter((entry) => !entry.hadRecentInput);
        const top = [...clsEntries].sort((a, b) => b.value - a.value).slice(0, 12);
        const images = [...document.images].map((image) => ({
          src: image.currentSrc || image.src,
          complete: image.complete,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          renderedWidth: Math.round(image.getBoundingClientRect().width),
          renderedHeight: Math.round(image.getBoundingClientRect().height),
          widthAttribute: image.getAttribute("width"),
          heightAttribute: image.getAttribute("height"),
          loading: image.loading,
          fetchPriority: image.fetchPriority,
        }));
        return {
          url: location.href,
          viewport: { width: innerWidth, height: innerHeight },
          document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
          title: document.title,
          fontStatus: document.fonts?.status || "unsupported",
          interReady: document.fonts?.check?.('16px Inter') ?? null,
          layoutShiftEntryCount: entries.length,
          cls: clsEntries.reduce((sum, entry) => sum + entry.value, 0),
          topLayoutShifts: top,
          images,
          resources: performance.getEntriesByType("resource")
            .map((entry) => ({
              name: entry.name,
              initiatorType: entry.initiatorType,
              durationMs: Math.round(entry.duration),
              transferSize: entry.transferSize,
              decodedBodySize: entry.decodedBodySize,
              redirectTimeMs: Math.round(Math.max(0, entry.redirectEnd - entry.redirectStart)),
              responseTimeMs: Math.round(Math.max(0, entry.responseEnd - entry.responseStart)),
            }))
            .sort((a, b) => b.durationMs - a.durationMs)
            .slice(0, 25),
        };
      });
      const result = {
        route: route.name,
        httpStatus: response?.status() ?? null,
        pageErrors,
        ...report,
      };
      console.log("OD_LAYOUT_SHIFT_DIAGNOSTIC " + JSON.stringify(result));
      await testInfo.attach(`${route.name}-layout-shifts.json`, {
        body: JSON.stringify(result, null, 2),
        contentType: "application/json",
      });
    } finally {
      await context.close();
    }
  });
}
