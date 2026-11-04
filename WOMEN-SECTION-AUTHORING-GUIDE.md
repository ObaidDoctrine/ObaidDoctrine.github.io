# Women Section — Article Authoring and Release Rules

## Content record location
Create one JSON record per language and topic:
- `content/women/WOM-001.en.json`
- `content/women/WOM-001.ur.json`

Use the exact topic ID, language and route mapping in `data/women-topics.json`. Do not invent or alter IDs or routes without an explicit migration.

## Editorial minimum
Each language record needs a descriptive title, an 80+ character search description, at least five substantive sections, and at least two traceable references with organization, source title and direct HTTPS URL. References must support the claims they accompany. Use natural Pakistani Urdu with comparable depth to English; avoid literal translation where it harms clarity.

Set review status honestly. Clinical, reproductive, legal, abuse, safeguarding and other specialist topics must remain `qualified_review_required` until an appropriately qualified reviewer has actually reviewed them. Never invent reviewer names or credentials.

## Publication gate
The regular quality check validates the inventory and any authored records. Missing records remain pending and are never auto-created. A release requires all 200 language records and every record marked `published`; run:
`node scripts/check-women-inventory.mjs --release`

Do not mark a record published until editorial checks, reference verification, specialist safety review where required, canonical/alternate route checks and static HTML output checks pass. Do not add incomplete pages to the sitemap or expose broken landing-page links.

## Safety
Educational content is not diagnosis, treatment, legal advice or emergency support. For immediate danger, abuse, coercion, threats or self-harm risk, provide context-appropriate routes to trusted local emergency or specialist support. Avoid victim-blaming, guarantees, sensational claims and unsafe instructions.
