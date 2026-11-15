# OBAID DOCTRINE implementation log

Last updated: 2026-11-15
Branch: `feat/brand-system-future-roadmap`
Production branch: `main` (not modified)
Deployment: Not performed

## Completed in this development branch

- Added a documented permanent brand palette: Signature Orange `#E8752A`, Warm Cream `#FFF7ED`, Deep Brown `#49382D`, Pale Orange `#FCE8D8`, Warm Beige `#E8D8C5`.
- Updated shared `styles.css` brand tokens and existing orange/cream color references.
- Added bilingual brand directory pages: `/brands/` and `/ur/brands/`.
- Added bilingual roadmap pages: `/future/` and `/ur/future/`.
- Linked the new destinations from both homepage footers.
- Added a bilingual brand-network section to both homepages, highlighting the central platform, WOMAN DOCTRINE, FACTS and the existing separate Assessment destination; future divisions are clearly labelled planned.
- Simplified desktop navigation to six primary destinations and expanded mobile menus with Research, Mind Tests, Learning Lab, Assessment, Our Brands and Future Projects.
- Normalized English and Urdu homepage theme colors to the official orange.
- Added the four new URLs to `sitemap.xml`.
- Updated Women pages to use the approved WOMAN DOCTRINE name while preserving existing `/women/` and `/ur/women/` routes and topic content.
- Updated the English and Urdu Women pages, Mind Tests pages, and main-site Assessment landing page stylesheet to the permanent orange/cream palette.
- Updated the browser theme color on both main-site Assessment landing pages.
- Kept the separate `assess.obaiddoctrine.com` platform untouched.

## Checks performed

- Re-fetched changed files from the development branch after edits.
- Confirmed the old primary green palette tokens are absent from Women, Mind Tests and main-site Assessment landing pages.
- Confirmed both Women routes retain their original paths and use the WOMAN DOCTRINE identity.
- Confirmed all four new pages include canonical URLs.
- Confirmed English/Urdu alternate hreflang links on the new brand and roadmap pages.
- Confirmed the sitemap includes all four new URLs, with 172 total URLs and no duplicate `<loc>` entries.
- Confirmed 18 key English/Urdu routes exist in the development branch, including the newly added brand and roadmap pages.
- Re-fetched all four updated directory/research pages and confirmed CollectionPage JSON-LD is present.
- Confirmed the main-site Assessment stylesheet no longer contains the previously identified green palette values.
- Completed a representative 12-page bilingual article-template audit: all sampled pages had canonical URLs, three hreflang alternates, parseable Article and BreadcrumbList JSON-LD, and author metadata.
- Recorded a publication-date consistency gap: sampled Urdu Article schemas include `datePublished`, while sampled English Article schemas include `dateModified` only. No publication dates were invented.
- Added `docs/article-audit-2026-11-15.md` documenting scope, evidence and remaining audit limitations.
- Confirmed no root `package.json` or expected GitHub Actions workflow file was present at the checked paths; build and browser QA therefore remain unverified.
- Confirmed no production branch change and no deployment was made.

## Not yet verified

- Full build/test pipeline: repository root has no `package.json`; full workflow inventory remains outstanding.
- Browser-level visual QA on mobile and desktop.
- Accessibility and performance audits.
- Complete site-wide legacy palette audit beyond the pages updated above.
- Current Google Search Console coverage and performance.

## Next work

- Complete repository-wide route and asset inventory.
- Resolve all local links across all 80 article pages and verify every destination exists.
- Confirm original publication dates before adding `datePublished` to English Article schemas.
- Review citation quality and image relevance/availability page by page.
- Review research pages and all page-level color overrides.
- Verify preview deployment and run browser-level desktop/mobile checks when a preview URL is available.
- Run available checks/builds once the actual workflow and tooling are identified.
- Prepare a review-ready PR only after preview and route checks.


## Article directory reconciliation — 2026-11-15

- Compared all 40 English and 40 Urdu article topic folders against the visible directory cards.
- Found three omitted directory entries: English `why-do-we-overthink`; Urdu `why-do-we-overthink` and `self-regulation-in-psychology`.
- Added the missing English and Urdu cards using each article's own title and description context; no article body or route was changed.
- Synchronized both Article CollectionPage ItemList schemas with the visible cards: 40 links, 40 schema items, 40 unique URLs in each language.
- Rechecked Research Insights CollectionPage schemas: each language page lists the same three unique article destinations as its visible content cards (each destination appears twice in markup due to separate card link elements).
- Full local-link destination resolution across all 80 article pages remains outstanding.
