import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
import path from "node:path";
import { existsSync } from "node:fs";

const root = process.cwd();
const inventory = JSON.parse(await readFile(path.join(root, "data/women-topics.json"), "utf8"));
const schema = JSON.parse(await readFile(path.join(root, "schemas/women-article.schema.json"), "utf8"));
const rows = inventory.records;
assert.equal(rows.length, 100, "Expected 100 bilingual topic records");
assert.equal(inventory.verifiedCounts.englishTopics, 100);
assert.equal(inventory.verifiedCounts.urduTopics, 100);
assert.equal(inventory.verifiedCounts.pairedTopics, 100);
assert.equal(schema.properties.language.enum.join(","), "en,ur");

const ids = new Set(), routes = new Set(), categoryCounts = new Map();
for (const row of rows) {
  assert.match(row.id, /^WOM-\d{3}$/);
  assert.ok(!ids.has(row.id), `Duplicate topic ID: ${row.id}`);
  ids.add(row.id);
  assert.ok(row.title?.en && row.title?.ur, `Missing bilingual title: ${row.id}`);
  assert.ok(row.category?.en && row.category?.ur, `Missing bilingual category: ${row.id}`);
  for (const [lang, prefix] of [["en", "/women/"], ["ur", "/ur/women/"]]) {
    const route = row.paths?.[lang];
    assert.ok(typeof route === "string" && route.startsWith(prefix) && route.endsWith("/") && !route.includes(".."), `Invalid ${lang} route: ${row.id}`);
    assert.ok(!routes.has(route), `Duplicate route: ${route}`);
    routes.add(route);
  }
  categoryCounts.set(row.categoryId, (categoryCounts.get(row.categoryId) || 0) + 1);
}
assert.equal(categoryCounts.size, 10, "Expected 10 categories");
for (const [categoryId, count] of categoryCounts) assert.equal(count, 10, `${categoryId} should contain 10 topics`);

const contentDir = path.join(root, "content/women");
const articleFiles = existsSync(contentDir) ? (await readdir(contentDir)).filter((name) => name.endsWith(".json")) : [];
const seen = new Set();
let published = 0;
for (const file of articleFiles) {
  const article = JSON.parse(await readFile(path.join(contentDir, file), "utf8"));
  assert.ok(rows.some((row) => row.id === article.topicId), `Unknown topicId in ${file}`);
  assert.ok(["en", "ur"].includes(article.language), `Invalid language in ${file}`);
  assert.equal(file, `${article.topicId}.${article.language}.json`, `Unexpected filename: ${file}`);
  const key = `${article.topicId}:${article.language}`;
  assert.ok(!seen.has(key), `Duplicate article record: ${key}`);
  seen.add(key);
  assert.ok(article.title?.trim().length >= 12, `Title too short: ${file}`);
  assert.ok(article.description?.trim().length >= 80, `Description too short: ${file}`);
  assert.ok(Array.isArray(article.content) && article.content.length >= 5, `At least five sections required: ${file}`);
  assert.ok(Array.isArray(article.references) && article.references.length >= 2, `At least two references required: ${file}`);
  for (const ref of article.references) assert.ok(ref.organization && ref.title && /^https?:\/\//.test(ref.url || ""), `Incomplete reference in ${file}`);
  assert.ok(["draft", "editorial_review", "qualified_review_required", "qualified_reviewed", "published"].includes(article.reviewStatus), `Invalid review status: ${file}`);
  if (article.reviewStatus === "published") {
    assert.ok(article.publicationDate && article.canonicalPath && article.alternatePath, `Published record missing release metadata: ${file}`);
    assert.ok(!/placeholder|lorem ipsum|coming soon/i.test(JSON.stringify(article.content)), `Placeholder content in published record: ${file}`);
    published++;
  }
}
const required = new Set(rows.flatMap((row) => [`${row.id}:en`, `${row.id}:ur`]));
const missing = [...required].filter((key) => !seen.has(key));
if (process.argv.includes("--release")) {
  assert.equal(seen.size, 200, "Release requires 200 article records");
  assert.equal(missing.length, 0, "Release requires every bilingual record");
  assert.equal(published, 200, "Release requires all records marked published");
}
console.log(`Women checks passed: 100 bilingual topic pairs, 10 categories, 200 unique routes, ${articleFiles.length} article records, ${published} marked published.`);
if (missing.length) console.log(`Pending content records: ${missing.length}; missing records are not generated or published.`);
