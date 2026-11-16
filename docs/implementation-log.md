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


## Full local HTML link and asset-path audit — 2026-11-15

- Enumerated the current development-branch Git tree and confirmed exactly 80 article HTML pages: 40 English and 40 Urdu.
- Fetched and inspected all 80 article HTML files. Checked every local `href` and `src` attribute, including root-relative and page-relative paths.
- Resolved local paths against the same branch's complete Git tree, including directory routes that map to `index.html` and query/hash suffixes.
- Total local HTML references checked: 1,596. Missing local file/route targets found: 0.
- This result is limited to literal HTML `href` and `src` attributes. It does not verify remote URL status, CSS `url()` references, JavaScript-generated URLs, image rendering, browser network requests, or whether external sources are authoritative.
- No article body or route was changed as part of this audit.


## CSS background and asset-path audit — 2026-11-15

- Enumerated and inspected all 5 repository CSS files: `styles.css`, `assessment/assessment.css`, `five-design-system.css`, `master-homepage.css`, and `portfolio/styles.css`.
- Found one CSS `url()` asset reference: `/assets/od-app-logo.svg` in `styles.css`; confirmed the target file exists in the same Git tree (SVG, 1,102 bytes).
- No missing local CSS asset paths found.
- Inspected all 80 English and Urdu article HTML pages for CSS `url()` references inside inline style attributes and embedded `<style>` blocks. No inline CSS URL references were found.
- This is a repository-path existence check, not a browser rendering, image decoding, or remote asset availability test. No code changes were needed for this audit.


## Article SEO metadata and structured-data audit — 2026-11-15

- Inspected the HTML head and JSON-LD blocks of all 80 article pages (40 English and 40 Urdu) in the development branch.
- All 80 pages have exactly one canonical link.
- All 80 pages include `hreflang` entries for `en`, `ur`, and `x-default`.
- Checked all 240 alternate-language target URLs against the repository tree: zero missing local page targets.
- All 80 pages contain two JSON-LD blocks; both parse as valid JSON.
- The two detected schema types on every page are `Article` and `BreadcrumbList`.
- This is a source-code/repository validation. It does not establish Google rich-result eligibility, live production response headers, rendered metadata after JavaScript, or Search Console indexing.


## SEO titles, descriptions, social metadata, and image-alt audit — 2026-11-15

- Inspected all 80 article HTML pages (40 English and 40 Urdu).
- All 80 pages have a `<title>`, meta description, Open Graph title, and Open Graph description.
- Found 7 pages missing `og:image`; added the existing site-wide `/assets/brand-cover.png` social image to those pages.
- Found one Urdu page missing Twitter Card metadata (`ur/articles/self-regulation-in-psychology/`); added `twitter:card`, title, description, image, and URL metadata.
- Re-fetched and verified all 8 changed pages: Open Graph image, Twitter Card, and Twitter image tags are present.
- Confirmed both image assets referenced by the changes exist in the branch tree: `assets/brand-cover.png` and `assets/articles/self-regulation-in-psychology.svg`.
- Found 10 literal `<img>` elements across the 80 pages; all 10 have non-empty `alt` attributes. No missing or empty alt attributes were found.
- Source-level metadata and path checks only; actual social-platform previews, remote HTTP status, image decoding, and browser rendering have not been tested.


## Homepage accessibility and mobile-navigation source audit — 2026-11-15

- Checked the English and Urdu homepage markup, shared styles, and mobile-navigation script.
- Both homepages already declare a viewport and a main landmark; added a keyboard-visible skip link to each and a stable, focusable `#main-content` target.
- Added skip-link styling with a visible focus state using the approved warm orange/cream palette.
- Fixed the reduced-motion ticker rule: the earlier reduced-motion CSS still allowed the continuous ticker animation to loop; the new override disables its animation and transform when `prefers-reduced-motion: reduce` is active.
- Improved the dynamically injected mobile side menu with dialog semantics, an explicit `aria-controls` relationship, focus placement on open, keyboard Tab focus containment, Escape-to-close, and focus return to the menu toggle.
- Re-fetched all four changed files and verified each expected source-level change.
- Scope/limitations: no real browser, device emulator, Lighthouse, screen-reader, or network-performance run was available in this pass. These changes are source-verified, not a substitute for rendered cross-device testing.
- Additional visual finding retained for a separate design pass: legacy English-homepage CSS overrides still contain blue/navy styling alongside the approved orange/cream brand tokens. No broad palette rewrite was made during this accessibility-focused change to avoid unintended visual regressions.


## Homepage brand consistency and markup correction — 2026-11-15

- Audited the shared homepage design overrides and found legacy multi-colour category/path accents (blue, pink, teal, gold and purple) conflicting with the approved single orange identity. Normalized those accent tokens and component accents to Signature Orange `#E8752A`.
- Replaced the remaining lime-green shadow accents with orange-tinted equivalents.
- Changed homepage dark feature/research/footer surface backgrounds from near-black to Deep Brown `#49382D`, keeping readable light text; the design retains warm cream and orange as its primary surfaces.
- Corrected one duplicated closing `</picture>` tag in the Urdu homepage hero image markup.
- Validation performed: exact source replacement counts checked; verified the corrected hero image has one opening and one closing picture tag; re-scanned the edited CSS for legacy blue/pink/teal/purple accent declarations and lime-green shadow values. Browser visual validation is still pending.


## Bilingual article keyboard accessibility and E2E test alignment — 2026-11-15

- Audited the 80 article detail pages (40 English and 40 Urdu) and found the pages did not provide a consistent skip-to-main-content link or a stable keyboard-focus target.
- Added a language-appropriate skip link to all 80 article pages: English pages use “Skip to main content”; Urdu pages use “مرکزی مواد پر جائیں”.
- Added `id="main-content"` and `tabindex="-1"` to each article page's main landmark so the skip link has a real, keyboard-focusable destination.
- Reused the existing shared `.od-skip-link` styles already added for the bilingual homepages; no new visual system or route changes were introduced.
- Reviewed the previously completed Playwright run: 52 tests passed and 3 failed. The failures were stale assertions expecting the retired `#F47721` brand orange instead of the approved `#E8752A`, plus a locator selecting a hidden duplicate Mind Tests link.
- Updated the E2E assertions to the approved brand orange and changed the Mind Tests locator to select a visible link. The test suite has not yet been confirmed green on the latest commit.
- Source-level change was committed only to the development branch. Production `main` and the separate Assessment Hub were not changed; no deployment was performed.
- Browser-level validation remains pending until the latest PR workflow completes. The earlier E2E run did exercise the checked-out branch in Chromium, but its three failures were assertion/locator mismatches described above.


### Final source verification — 2026-11-15
- Re-fetched all 80 article detail files after the implementation (40 English and 40 Urdu).
- Verified 80/80 have exactly the intended language-specific skip-link text, a matching `#main-content` target, and `tabindex="-1"` on the main landmark.
- No article route, canonical URL, hreflang target, article text, or schema block was changed by this accessibility update.
- The latest branch run reports SEO bilingual metadata validation, internal-link validation, and citation-placeholder regression checks as successful. The Playwright E2E job is still running at the time of this log update.


## Production release trigger — 2026-11-16
- PR #98 brand-system and bilingual roadmap changes were merged into `main` as commit `dc720bae15d6b317f71630fd317400946c4daf78`.
- Manifest theme color aligned to approved signature orange `#E8752A`.
- Release trigger commit records this deployment checkpoint; production status must be verified from the Cloudflare Pages workflow and live routes.
