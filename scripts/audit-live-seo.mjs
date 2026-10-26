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

const failures = [];
const results = [];
function report(level, message) {
  const line = `[${level}] ${message}`;
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
  return {
    value: tags[0].match(/\bhref\s*=\s*(['"])(.*?)\1/i)?.[2] ?? "",
    count: 1
  };
}
async function fetchFollowing(startUrl) {
  let current = startUrl;
  const chain = [];
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    let response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "user-agent": "ObaidDoctrine-LiveSEO-Audit/1.0" }
      });
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
      try { body = await response.text(); } catch (error) {
        return { ok: false, error: "response body read failed: " + String(error), chain, finalUrl: current, status: response.status, body: "" };
      }
    }
    return { ok: true, chain, finalUrl: current, status: response.status, body };
  }
  return { ok: false, error: "redirect limit exceeded", chain, finalUrl: current, status: 0, body: "" };
}
function expectedCanonical(url) {
  return BASE + url.pathname + url.search;
}
async function auditPage(pageUrl) {
  const expected = new URL(pageUrl);
  const canonical = await fetchFollowing(pageUrl);
  if (!canonical.ok || canonical.status !== 200) {
    report("FAIL", `sitemap page did not return HTTP 200: ${pageUrl}; status=${canonical.status}; ${canonical.error ?? ""}`);
  } else {
    if (new URL(canonical.finalUrl).hostname !== "www.obaiddoctrine.com" || new URL(canonical.finalUrl).protocol !== "https:") {
      report("FAIL", `sitemap page ended at non-canonical host/protocol: ${pageUrl} -> ${canonical.finalUrl}`);
    }
    const actualCanonical = canonicalFrom(canonical.body);
    if (actualCanonical.count !== 1 || actualCanonical.value !== expectedCanonical(expected)) {
      report("FAIL", `canonical mismatch: ${pageUrl}; count=${actualCanonical.count}; canonical=${actualCanonical.value || "(missing)"}; expected=${expectedCanonical(expected)}`);
    }
  }

  const variants = [
    "http://www.obaiddoctrine.com" + expected.pathname + expected.search,
    "https://obaiddoctrine.com" + expected.pathname + expected.search,
    "http://obaiddoctrine.com" + expected.pathname + expected.search
  ];
  for (const alias of variants) {
    const result = await fetchFollowing(alias);
    const target = expectedCanonical(expected);
    if (!result.ok || result.status !== 200 || result.finalUrl !== target) {
      report("FAIL", `alias redirect mismatch: ${alias} -> ${result.finalUrl} (status=${result.status}); expected final URL ${target}; ${result.error ?? ""}`);
    }
  }
  results.push({ pageUrl, canonicalStatus: canonical.status, finalUrl: canonical.finalUrl });
}
async function runPool(items, worker, limit) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      await worker(items[index]);
    }
  }));
}
const sitemapResult = await fetchFollowing(SITEMAP);
if (!sitemapResult.ok || sitemapResult.status !== 200) {
  console.error(`Could not read sitemap ${SITEMAP}: status=${sitemapResult.status}; ${sitemapResult.error ?? ""}`);
  process.exit(2);
}
const urls = [...sitemapResult.body.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gis)].map((m) => m[1].trim());
if (!urls.length) {
  console.error("Sitemap contained no <loc> URLs.");
  process.exit(2);
}
const unique = [...new Set(urls)];
if (unique.length !== urls.length) report("FAIL", `sitemap contains duplicate URLs: ${urls.length - unique.length}`);
for (const url of unique) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "www.obaiddoctrine.com" || parsed.search || parsed.hash) {
      report("FAIL", `non-canonical or dirty sitemap URL: ${url}`);
    }
  } catch {
    report("FAIL", `invalid sitemap URL: ${url}`);
  }
}
console.log(`Read-only live SEO audit: ${unique.length} unique sitemap URLs; testing HTTP/www aliases and canonical tags with concurrency ${CONCURRENCY}.`);
await runPool(unique, auditPage, CONCURRENCY);
console.log(`\nAudited ${results.length} sitemap pages; failures: ${failures.length}.`);
if (failures.length) process.exit(1);
console.log("PASS: sitemap pages, canonical tags, and HTTP/non-www redirects matched the www HTTPS URL.");
