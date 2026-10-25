#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve, sep, posix } from "node:path";

const root = process.cwd();
const ignored = new Set([".git", "node_modules", ".next", "dist", "coverage"]);
const htmlFiles = [];
const errors = [];
const checked = new Set();

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
  return match?.[2]?.trim().replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"') ?? "";
}
function localHtmlPath(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); } catch { return null; }
  if (decoded.includes("\0")) return null;
  let path = posix.normalize(decoded);
  if (!path.startsWith("/")) path = "/" + path;
  if (path === "/") path = "/index.html";
  else if (path.endsWith("/")) path += "index.html";
  else if (!/\.[a-z0-9]+$/i.test(path)) path += "/index.html";
  if (!/\.html?$/i.test(path)) return { skip: true };
  const absolute = resolve(root, "." + path);
  if (absolute !== root && !absolute.startsWith(root + sep)) return null;
  return absolute;
}

walk(root);
for (const file of htmlFiles) {
  const source = readFileSync(file, "utf8");
  const rel = relative(root, file).split(sep).join("/");
  if (/https?:\/\/obaiddoctrine\.com(?=[:/?#\s"'<>])/i.test(source)) {
    errors.push(rel + ": non-www absolute URL found; use https://www.obaiddoctrine.com");
  }
  const base = new URL("https://www.obaiddoctrine.com/" + rel);
  const anchorTags = [...source.matchAll(/<a\b[^>]*>/gi)].map(m => m[0]);
  for (const tag of anchorTags) {
    const href = attr(tag, "href");
    if (!href || href.startsWith("#") || /^(?:mailto:|tel:|javascript:|data:|blob:)/i.test(href)) continue;
    let url;
    try { url = new URL(href, base); } catch {
      errors.push(rel + ": invalid anchor href: " + href);
      continue;
    }
    if (!["www.obaiddoctrine.com", "obaiddoctrine.com"].includes(url.hostname)) continue;
    if (!["https:", "http:"].includes(url.protocol)) continue;
    const target = localHtmlPath(url.pathname);
    if (target?.skip) continue;
    if (!target) {
      errors.push(rel + ": unsafe or invalid internal link: " + href);
      continue;
    }
    const key = target + (url.hash || "");
    if (checked.has(key)) continue;
    checked.add(key);
    if (!existsSync(target)) errors.push(rel + ": internal page target does not exist: " + href + " -> " + url.pathname);
  }
}
console.log("Scanned " + htmlFiles.length + " HTML files and checked " + checked.size + " unique internal HTML targets.");
if (errors.length) {
  console.error("\nInternal link validation failed (" + errors.length + " broken or invalid targets):");
  for (const error of errors.slice(0, 200)) console.error("- " + error);
  if (errors.length > 200) console.error("- ... " + (errors.length - 200) + " more not shown");
  process.exitCode = 1;
} else {
  console.log("Internal link validation passed: all checked local HTML targets exist.");
}
