# Women Section — Editorial and Implementation Contract

## Scope and immutable inventory
The canonical topic inventory is `data/women-topics.json`. It records 100 English/Urdu pairs (200 language-specific article routes) extracted in category/card order from the two existing landing pages. Do not silently drop, rename, merge or reorder a topic. Changes to topic titles, category assignments or pairings require an explicit inventory update and a review note.

## URL and language policy
- English routes use `/women/{english-category-slug}/{english-topic-slug}/`.
- Urdu routes use `/ur/women/{same-english-category-slug}/{same-english-topic-slug}/`.
- The identical stable slug is intentional: the language relationship is explicit in inventory and cannot break when Urdu wording changes.
- Every generated page must be a real static `index.html` route, not a client-only route, popup or query-string page.
- Set one self-referencing canonical per language page. Add reciprocal `hreflang="en"`, `hreflang="ur"` and `hreflang="x-default"` only when both equivalent pages are published and crawlable. Never point an alternate to a missing page.
- Sitemap inclusion happens only after a page is generated and validated.

## Content source of truth
- Topic identity, title, category and paired URL: `data/women-topics.json`.
- Full article content: one structured JSON record per topic and language, validated against `schemas/women-article.schema.json`.
- Page presentation: shared static HTML template and shared stylesheet. The build step renders HTML so search engines and users receive article text in the initial response.
- The existing landing pages remain the category directory and should link to published pages only. During staged production, do not replace working expandable summaries with links to pages that do not yet exist.

## Evidence and references
Use current, directly relevant guidelines and systematic reviews before individual studies. Record source title, organization/authors, year, stable DOI/PMID when available, direct URL, access date, and the exact claims supported. Distinguish evidence, association, plausible mechanisms and uncertainty. Never fabricate references or statistics. Prefer original official documents and primary research over secondary summaries.

## Article completeness
A published article must explain the topic in context, contributing factors, meaningful classifications where relevant, life impacts, clearly fictional illustrative scenarios, evidence and limitations, myths/facts, safe practical steps, warning signs, when to seek help, useful FAQs, key takeaways and topic-specific references. Omit sections that genuinely do not apply rather than filling them with generic prose. Editorial length is guided by complexity, not word-count padding.

## Medical, psychological, legal and safeguarding review
- Educational content must not diagnose, prescribe, direct a reader to stop treatment, or substitute for individual care.
- Articles involving clinical advice, reproductive health, violence, abuse, self-harm, exploitation, legal rights or safeguarding must carry `qualified_review_required` until a real qualified reviewer has reviewed and approved that exact article.
- Never display a reviewer name, credential or “medically reviewed” label without documented approval.
- For Pakistan-specific legal or emergency guidance, verify current primary government/legal sources and jurisdiction before publication. Do not invent helpline numbers or referral providers.

## Urdu-English equivalence
Both languages must preserve the same core evidence, risk information, practical steps, limitations and referral thresholds. Urdu should be authored or professionally edited in natural Pakistani Urdu, not mechanically translated. Track both language pages independently through editorial review.

## SEO and accessibility
Each static page needs a unique title, description, H1, canonical, reciprocal language metadata (only for complete pairs), Open Graph metadata, breadcrumb links, descriptive internal links, semantic headings, accessible link names, keyboard-visible focus, RTL layout for Urdu, and appropriate Article/BreadcrumbList structured data. Do not add fake ratings, reviews, expert endorsements or author credentials.

## Release gates
A page may be included in the production sitemap and linked from its topic card only after:
1. Schema validation passes.
2. Both language records are present and substantively equivalent.
3. Every material claim has a traceable reference.
4. Link and metadata checks pass.
5. Editorial review is complete.
6. Required qualified review is recorded, or the page is clearly held from publication.
7. Static output is checked for mobile, desktop, keyboard, RTL and direct-load/refresh behavior.

## Current state
This is the architecture and policy contract. It is not evidence that any full articles, generated routes, sitemap changes, production links, professional reviews or deployment have been completed.
