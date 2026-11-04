import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const inventory = JSON.parse(await readFile(new URL("../data/women-topics.json", import.meta.url), "utf8"));
const rows = inventory.records;
assert.equal(rows.length, 100, "Expected 100 bilingual topic records");
assert.equal(inventory.verifiedCounts.englishTopics, 100);
assert.equal(inventory.verifiedCounts.urduTopics, 100);
assert.equal(inventory.verifiedCounts.pairedTopics, 100);

const ids = new Set();
const englishPaths = new Set();
const urduPaths = new Set();
const categoryCounts = new Map();
for (const row of rows) {
  assert.match(row.id, /^WOM-\d{3}$/);
  assert.ok(!ids.has(row.id), `Duplicate topic ID: ${row.id}`);
  ids.add(row.id);
  assert.ok(row.title.en && row.title.ur, `Missing bilingual title: ${row.id}`);
  assert.ok(row.category.en && row.category.ur, `Missing bilingual category: ${row.id}`);
  assert.match(row.paths.en, /^\/women\/[a-z0-9-]+\/[a-z0-9-]+\/$/);
  assert.match(row.paths.ur, /^\/ur\/women\/[a-z0-9-]+\/[a-z0-9-]+\/$/);
  assert.ok(!englishPaths.has(row.paths.en), `Duplicate English path: ${row.paths.en}`);
  assert.ok(!urduPaths.has(row.paths.ur), `Duplicate Urdu path: ${row.paths.ur}`);
  englishPaths.add(row.paths.en);
  urduPaths.add(row.paths.ur);
  categoryCounts.set(row.categoryId, (categoryCounts.get(row.categoryId) || 0) + 1);
}
assert.equal(categoryCounts.size, 10, "Expected 10 categories");
for (const [categoryId, count] of categoryCounts) {
  assert.equal(count, 10, `${categoryId} should contain 10 topics`);
}
console.log("Women inventory checks passed: 100 unique bilingual pairs, 200 unique language routes, 10 categories × 10 topics.");
