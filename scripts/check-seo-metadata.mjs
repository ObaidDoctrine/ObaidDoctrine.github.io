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
  if (url.protocol !== "https:" || !["www.obaiddoctrine.com", "obaiddoctrine.com"].includes(url.hostname)) return null;
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
    if (!url || url.protocol !== "https:" || !["www.obaiddoctrine.com", "obaiddoctrine.com"].includes(url.hostname)) {
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
