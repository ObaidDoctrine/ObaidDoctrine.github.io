#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, posix } from "node:path";

const root = process.cwd();
const ignored = new Set([".git", "node_modules", ".next", "dist", "coverage"]);
const htmlFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) walk(join(dir, entry.name));
      continue;
    }
    if (entry.isFile() && /\.html?$/i.test(entry.name)) htmlFiles.push(join(dir, entry.name));
  }
}
function attr(tag, name) {
  const match = tag.match(new RegExp("\\b" + name + "\\s*=\\s*(['\"])(.*?)\\1", "i"));
  return match?.[2]?.trim() ?? "";
}
function getTag(source, regex) { return source.match(regex)?.[0] ?? ""; }
function localFileForUrl(value) {
  let url;
  try { url = new URL(value); } catch { return null; }
  if (url.protocol !== "https:" || !["www.obaiddoctrine.com"].includes(url.hostname)) return null;
  let path = decodeURIComponent(url.pathname);
  if (path.endsWith("/")) path += "index.html";
  else if (!/\.[a-z0-9]+$/i.test(path)) path += "/index.html";
  const normalized = posix.normalize(path).replace(/^\/+/, "");
  if (normalized.startsWith("../")) return null;
  return join(root, ...normalized.split("/"));
}
walk(root);

const errors = [];
const warnings = [];
const titleOwners = new Map();
const descriptionOwners = new Map();
const pages = new Map();

for (const file of htmlFiles) {
  const source = readFileSync(file, "utf8");
  const rel = relative(root, file).split("\\").join("/");
  const metaTags = [...source.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]);
  const linkTags = [...source.matchAll(/<link\b[^>]*>/gi)].map(m => m[0]);
  const robots = metaTags.find(tag => attr(tag, "name").toLowerCase() === "robots");
  const isNoindex = /noindex/i.test(attr(robots ?? "", "content"));
  const is404 = /(^|\/)404\.html$/i.test(rel);
  const canonicalTags = linkTags.filter(tag => attr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical"));
  const alternateTags = linkTags.filter(tag => attr(tag, "rel").toLowerCase().split(/\s+/).includes("alternate") && attr(tag, "hreflang"));
  const title = getTag(source, /<title\b[^>]*>[\s\S]*?<\/title>/i).replace(/<[^>]+>/g, "").trim();
  const descriptionTag = metaTags.find(tag => attr(tag, "name").toLowerCase() === "description");
  const description = attr(descriptionTag ?? "", "content");
  const lang = attr(getTag(source, /<html\b[^>]*>/i), "lang").toLowerCase();
  const canonical = canonicalTags.length === 1 ? attr(canonicalTags[0], "href") : "";
  const alternates = alternateTags.map(tag => ({ lang: attr(tag, "hreflang").toLowerCase(), href: attr(tag, "href") }));
  const indexable = !isNoindex && !is404;
  pages.set(file, { source, indexable, canonical, alternates, lang });
  if (!indexable) continue;

  if (canonicalTags.length !== 1) errors.push(rel + ": expected exactly one canonical link, found " + canonicalTags.length);
  if (!canonical) errors.push(rel + ": canonical href is missing or empty");
  else {
    let url;
    try { url = new URL(canonical); } catch {}
    if (!url || url.protocol !== "https:" || !["www.obaiddoctrine.com"].includes(url.hostname)) {
      errors.push(rel + ": canonical must be an absolute HTTPS URL on the production domain");
    } else if (url.pathname !== "/" && !url.pathname.endsWith("/") && !/\.[a-z0-9]+$/i.test(url.pathname)) {
      errors.push(rel + ": canonical path should use the site's trailing-slash convention: " + canonical);
    }
  }
  if (!title) errors.push(rel + ": missing title");
  else {
    const key = title.toLowerCase();
    if (titleOwners.has(key)) warnings.push("duplicate title: " + titleOwners.get(key) + " and " + rel);
    else titleOwners.set(key, rel);
  }
  if (!description) errors.push(rel + ": missing meta description");
  else {
    const key = description.toLowerCase();
    if (descriptionOwners.has(key)) warnings.push("duplicate description: " + descriptionOwners.get(key) + " and " + rel);
    else descriptionOwners.set(key, rel);
  }
  if (!["en", "ur"].includes(lang)) errors.push(rel + ': expected html lang="en" or lang="ur", found "' + (lang || "missing") + '"');

  const seenLangs = new Set();
  for (const alternate of alternates) {
    if (!alternate.href) {
      errors.push(rel + ": empty hreflang URL for " + (alternate.lang || "unknown language"));
      continue;
    }
    if (seenLangs.has(alternate.lang)) errors.push(rel + ': duplicate hreflang value "' + alternate.lang + '"');
    seenLangs.add(alternate.lang);
    const targetFile = localFileForUrl(alternate.href);
    if (!targetFile) {
      errors.push(rel + ": invalid or non-production hreflang URL: " + alternate.href);
      continue;
    }
    let targetSource;
    try { targetSource = readFileSync(targetFile, "utf8"); } catch {
      errors.push(rel + ": hreflang target file does not exist: " + alternate.href);
      continue;
    }
    if (alternate.lang === "x-default") continue;
    const targetLinks = [...targetSource.matchAll(/<link\b[^>]*>/gi)].map(m => m[0])
      .filter(tag => attr(tag, "rel").toLowerCase().split(/\s+/).includes("alternate") && attr(tag, "hreflang").toLowerCase() === lang);
    if (canonical && !targetLinks.some(tag => attr(tag, "href") === canonical)) {
      errors.push(rel + ": hreflang " + alternate.lang + " target is not reciprocal back to " + canonical);
    }
  }
  if (alternates.length && !alternates.some(a => a.lang === lang && a.href === canonical)) {
    errors.push(rel + ": missing self-referencing hreflang for " + lang + " to its canonical URL");
  }
}


const sitemapPath = join(root, "sitemap.xml");
try {
  const sitemap = readFileSync(sitemapPath, "utf8");
  const entries = [...sitemap.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].map(m => m[1]);
  const locs = [];
  const seenLocs = new Set();
  for (const entry of entries) {
    const loc = entry.match(/<loc>\s*([^<]+?)\s*<\/loc>/i)?.[1]?.trim() ?? "";
    const lastmod = entry.match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/i)?.[1]?.trim() ?? "";
    if (!loc) { errors.push("sitemap.xml: URL entry is missing <loc>"); continue; }
    if (seenLocs.has(loc)) errors.push("sitemap.xml: duplicate URL: " + loc);
    seenLocs.add(loc);
    locs.push(loc);
    let url;
    try { url = new URL(loc); } catch {}
    if (!url || url.protocol !== "https:" || !["www.obaiddoctrine.com"].includes(url.hostname) || url.search || url.hash) {
      errors.push("sitemap.xml: URL must be a clean absolute HTTPS production URL: " + loc);
      continue;
    }
    const targetFile = localFileForUrl(loc);
    if (!targetFile) { errors.push("sitemap.xml: URL cannot be mapped to a local page: " + loc); continue; }
    let targetSource;
    try { targetSource = readFileSync(targetFile, "utf8"); } catch {
      errors.push("sitemap.xml: target file does not exist: " + loc);
      continue;
    }
    const tags = [...targetSource.matchAll(/<link\b[^>]*>/gi)].map(m => m[0]);
    const canonicals = tags.filter(tag => attr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical"));
    if (canonicals.length !== 1 || attr(canonicals[0] ?? "", "href") !== loc) {
      errors.push("sitemap.xml: URL must match the page's single canonical URL: " + loc);
    }
    const robotsTag = [...targetSource.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0])
      .find(tag => attr(tag, "name").toLowerCase() === "robots");
    if (/noindex/i.test(attr(robotsTag ?? "", "content"))) {
      errors.push("sitemap.xml: noindex page must not be included: " + loc);
    }
    if (lastmod) {
      const dateMatch = lastmod.match(/^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/);
      const calendarDate = dateMatch ? new Date(Date.UTC(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]))) : null;
      const validCalendarDate = Boolean(dateMatch && calendarDate &&
        calendarDate.getUTCFullYear() === Number(dateMatch[1]) &&
        calendarDate.getUTCMonth() === Number(dateMatch[2]) - 1 &&
        calendarDate.getUTCDate() === Number(dateMatch[3]));
      if (!validCalendarDate) errors.push("sitemap.xml: invalid lastmod date/time for " + loc + ": " + lastmod);
    }
  }
  if (!entries.length) errors.push("sitemap.xml: no <url> entries found");
  const sitemapSet = new Set(locs);
  for (const [file, page] of pages) {
    if (page.indexable && page.canonical && !sitemapSet.has(page.canonical)) {
      errors.push(relative(root, file).split("\\\\").join("/") + ": indexable canonical URL is missing from sitemap.xml: " + page.canonical);
    }
  }
  console.log("Sitemap validation: " + locs.length + " URLs checked.");
} catch (error) {
  errors.push("sitemap.xml: could not read sitemap.xml (" + error.message + ")");
}

try {
  const robots = readFileSync(join(root, "robots.txt"), "utf8");
  if (!/^\s*Sitemap:\s*https:\/\/www\.obaiddoctrine\.com\/sitemap\.xml\s*$/im.test(robots)) {
    errors.push("robots.txt: missing Sitemap directive for https://www.obaiddoctrine.com/sitemap.xml");
  }
  if (!/^User-agent:\s*\*\s*\n(?:[^\n]*\n)*?Allow:\s*\/\s*$/im.test(robots)) {
    warnings.push("robots.txt: could not confirm an Allow: / rule for all crawlers; review directives manually");
  }
} catch (error) {
  errors.push("robots.txt: could not read robots.txt (" + error.message + ")");
}

console.log("Scanned " + htmlFiles.length + " HTML files; " + [...pages.values()].filter(p => p.indexable).length + " indexable pages.");
if (warnings.length) {
  console.warn("\nWarnings (" + warnings.length + "):");
  for (const warning of warnings) console.warn("- " + warning);
}
if (errors.length) {
  console.error("\nSEO metadata validation failed (" + errors.length + " issues):");
  for (const error of errors) console.error("- " + error);
  process.exitCode = 1;
} else {
  console.log("SEO metadata validation passed: canonical, title, description, language, and hreflang checks.");
}
