#!/usr/bin/env node
/**
 * Read-only live SEO audit for Obaid Doctrine.
 * Checks every sitemap URL and its HTTP/non-www aliases. Never writes to production.
 */
const BASE = "https://www.obaiddoctrine.com";
const SITEMAP = BASE + "/sitemap.xml";
const TIMEOUT_MS = 12000;
const MAX_REDIRECTS = 10;
const CONCURRENCY = 8;
const CONTENT_MARKERS = new Map([
  [BASE + "/articles/what-is-learning-in-psychology/", "What counts as learning?"],
  [BASE + "/articles/what-is-personality-in-psychology/", "Definition of personality in psychology"],
  [BASE + "/articles/what-is-memory-in-psychology/", "Definition of memory in psychology"],
]);
const failures = [];
const results = [];
function report(level, message) {
  const line = "[" + level + "] " + message;
  console.log(line);
  if (level === "FAIL") failures.push(line);
}
function canonicalFrom(html) {
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const tags = links.filter((tag) => {
    const rel = tag.match(/\brel\s*=\s*(['"])(.*?)\1/i)?.[2] ?? "";
    return rel.toLowerCase().split(/\s+/).includes("canonical");
  });
  if (tags.length !== 1) return { value: "", count: tags.length };
  return { value: tags[0].match(/\bhref\s*=\s*(['"])(.*?)\1/i)?.[2] ?? "", count: 1 };
}
async function fetchFollowing(startUrl) {
  let current = startUrl;
  const chain = [];
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    let response;
    try {
      response = await fetch(current, { redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS), headers: { "user-agent": "ObaidDoctrine-LiveSEO-Audit/1.0" } });
    } catch (error) {
      return { ok: false, error: String(error), chain, finalUrl: current, status: 0, body: "" };
    }
    chain.push({ url: current, status: response.status });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) return { ok: false, error: "redirect has no Location header", chain, finalUrl: current, status: response.status, body: "" };
      current = new URL(location, current).href;
      continue;
    }
    let body = "";
    if (response.status === 200) {
      try { body = await response.text(); } catch (error) { return { ok: false, error: "response body read failed: " + String(error), chain, finalUrl: current, status: response.status, body: "" }; }
    }
    return { ok: true, chain, finalUrl: current, status: response.status, body, headers: response.headers };
  }
  return { ok: false, error: "redirect limit exceeded", chain, finalUrl: current, status: 0, body: "" };
}
function expectedCanonical(url) { return BASE + url.pathname + url.search; }
async function auditPage(pageUrl) {
  const expected = new URL(pageUrl);
  const canonical = await fetchFollowing(pageUrl);
  if (!canonical.ok || canonical.status !== 200) report("FAIL", "sitemap page did not return HTTP 200: " + pageUrl + "; status=" + canonical.status + "; " + (canonical.error ?? ""));
  else {
    const expectedMarker = CONTENT_MARKERS.get(pageUrl);
    if (expectedMarker && !canonical.body.includes(expectedMarker)) report("FAIL", "live content marker missing: " + pageUrl + "; expected text=" + expectedMarker + "; server=" + (canonical.headers?.get("server") ?? "(none)") + "; cf-cache-status=" + (canonical.headers?.get("cf-cache-status") ?? "(none)") + "; age=" + (canonical.headers?.get("age") ?? "(none)") + "; cache-control=" + (canonical.headers?.get("cache-control") ?? "(none)") + "; last-modified=" + (canonical.headers?.get("last-modified") ?? "(none)") + "; etag=" + (canonical.headers?.get("etag") ?? "(none)"));
    if (canonical.finalUrl !== pageUrl) report("FAIL", "sitemap URL redirected to a different URL: " + pageUrl + " -> " + canonical.finalUrl + "; sitemap URLs should resolve directly to their canonical destination.");
    if (new URL(canonical.finalUrl).hostname !== "www.obaiddoctrine.com" || new URL(canonical.finalUrl).protocol !== "https:") report("FAIL", "sitemap page ended at non-canonical host/protocol: " + pageUrl + " -> " + canonical.finalUrl);
    const actualCanonical = canonicalFrom(canonical.body);
    if (actualCanonical.count !== 1 || actualCanonical.value !== expectedCanonical(expected)) report("FAIL", "canonical mismatch: " + pageUrl + "; count=" + actualCanonical.count + "; canonical=" + (actualCanonical.value || "(missing)") + "; expected=" + expectedCanonical(expected));
    const xRobotsTag = canonical.headers?.get("x-robots-tag") ?? "";
    if (/\bnoindex\b/i.test(xRobotsTag)) report("FAIL", "sitemap page sends X-Robots-Tag noindex: " + pageUrl + "; header=" + xRobotsTag);
    const robotMetaTags = [...canonical.body.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).filter((tag) => {
      const name = tag.match(/\bname\s*=\s*(['"])(.*?)\1/i)?.[2]?.toLowerCase() ?? "";
      return ["robots", "googlebot", "bingbot"].includes(name);
    });
    for (const tag of robotMetaTags) {
      const directives = tag.match(/\bcontent\s*=\s*(['"])(.*?)\1/i)?.[2] ?? "";
      if (/\bnoindex\b/i.test(directives)) report("FAIL", "sitemap page has a noindex meta directive: " + pageUrl + "; " + tag);
    }
  }
  const variants = ["http://www.obaiddoctrine.com" + expected.pathname + expected.search, "https://obaiddoctrine.com" + expected.pathname + expected.search, "http://obaiddoctrine.com" + expected.pathname + expected.search];
  for (const alias of variants) {
    const result = await fetchFollowing(alias);
    const target = expectedCanonical(expected);
    const redirectStatuses = result.chain.slice(0, -1).map((hop) => hop.status);
    const hasTemporaryRedirect = redirectStatuses.some((status) => ![301, 308].includes(status));
    if (!result.ok || result.status !== 200 || result.finalUrl !== target || redirectStatuses.length === 0 || hasTemporaryRedirect) {
      report("FAIL", "alias redirect mismatch: " + alias + " -> " + result.finalUrl + "; chain=" + result.chain.map((hop) => hop.status + " " + hop.url).join(" -> ") + "; expected a permanent 301/308 redirect chain ending at " + target + " with HTTP 200; " + (result.error ?? ""));
    }
  }
  results.push({ pageUrl, canonicalStatus: canonical.status, finalUrl: canonical.finalUrl });
}
async function runPool(items, worker, limit) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => { while (next < items.length) { const index = next++; await worker(items[index]); } }));
}
const robotsUrl = BASE + "/robots.txt";
const robotsResult = await fetchFollowing(robotsUrl);
if (!robotsResult.ok || robotsResult.status !== 200 || robotsResult.finalUrl !== robotsUrl) {
  report("FAIL", "robots.txt must resolve directly to HTTP 200: " + robotsUrl + "; status=" + robotsResult.status + "; final=" + robotsResult.finalUrl + "; " + (robotsResult.error ?? ""));
} else if (!/^\s*Sitemap:\s*https:\/\/www\.obaiddoctrine\.com\/sitemap\.xml\s*$/im.test(robotsResult.body)) {
  report("FAIL", "live robots.txt is missing the canonical sitemap directive: " + SITEMAP);
}
const sitemapResult = await fetchFollowing(SITEMAP);
if (!sitemapResult.ok || sitemapResult.status !== 200 || sitemapResult.finalUrl !== SITEMAP) { console.error("Could not read sitemap " + SITEMAP + ": status=" + sitemapResult.status + "; final=" + sitemapResult.finalUrl + "; " + (sitemapResult.error ?? "")); process.exit(2); }
const urls = [...sitemapResult.body.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gis)].map((m) => m[1].trim());
if (!urls.length) { console.error("Sitemap contained no <loc> URLs."); process.exit(2); }
const unique = [...new Set(urls)];
if (unique.length !== urls.length) report("FAIL", "sitemap contains duplicate URLs: " + (urls.length - unique.length));
for (const url of unique) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "www.obaiddoctrine.com" || parsed.search || parsed.hash) report("FAIL", "non-canonical or dirty sitemap URL: " + url);
  } catch { report("FAIL", "invalid sitemap URL: " + url); }
}
console.log("Read-only live SEO audit: " + unique.length + " unique sitemap URLs; testing HTTP/www aliases and canonical tags with concurrency " + CONCURRENCY + ".");
await runPool(unique, auditPage, CONCURRENCY);
console.log("\nAudited " + results.length + " sitemap pages; failures: " + failures.length + ".");
if (failures.length) process.exit(1);
console.log("PASS: robots.txt, sitemap URLs, indexability directives, canonical tags, and HTTP/non-www redirects matched the www HTTPS URL.");
