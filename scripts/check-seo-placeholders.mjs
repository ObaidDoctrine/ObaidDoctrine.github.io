#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const ignored = new Set([".git", "node_modules", ".next", "dist", "coverage"]);
const htmlFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) walk(join(dir, entry.name));
      continue;
    }
    if (entry.isFile() && /\.html?$/i.test(entry.name)) {
      htmlFiles.push(join(dir, entry.name));
    }
  }
}

walk(root);

const placeholderPattern = /turn\d+(?:search|news|reddit|image|youtube)\d+|cite[^]*/i;
const findings = [];

for (const file of htmlFiles) {
  const source = readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (placeholderPattern.test(line)) {
      findings.push(`${relative(root, file)}:${index + 1}: internal citation placeholder detected`);
    }
  });
}

if (findings.length) {
  console.error("SEO placeholder check failed:");
  console.error(findings.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`SEO placeholder check passed: scanned ${htmlFiles.length} HTML files; no internal citation placeholders found.`);
}
