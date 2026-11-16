# Article page technical audit — 2026-11-15

Branch: `feat/brand-system-future-roadmap`
Scope: representative template and content-page review; this is not yet a full 80-page link crawl.

## Repository inventory

- 40 English article topic folders.
- 40 Urdu article topic folders.
- 38 matching folder slugs; two translation pairs use different language-specific slugs:
  - `family-communication-patterns` ↔ `family-communication`
  - `how-habits-form` ↔ `habits-form-and-change`
- Both differently-slugged pairs were inspected. Each page has its own self-canonical URL and reciprocal English/Urdu hreflang alternates. No URL migration is recommended.

## Representative page checks

Reviewed eight English and four Urdu article pages, including introductory psychology, emotional intelligence, procrastination, communication, habits, family communication, professional-support guidance and research-literacy topics.

- All 12 reviewed pages had a canonical link.
- All 12 reviewed pages had three hreflang alternates (English, Urdu and x-default).
- All 12 had valid JSON-LD scripts when parsed: Article and BreadcrumbList.
- All 12 included an author field in Article structured data.
- The sampled Urdu Article schemas included datePublished and dateModified.
- The sampled English Article schemas included dateModified but did not include datePublished.
- Sampled image tags had alt attributes wherever an image tag was present. Several article pages had no inline image tag; this check does not inspect CSS backgrounds or social preview images.
- Internal navigation and related-article links were present in the sampled pages.

## Findings and limitations

1. **Publication-date consistency:** In the sampled pages, Urdu Article schemas provide `datePublished`, while English Article schemas only provide `dateModified`. Do not manufacture publication dates. Confirm original publication dates from trustworthy CMS/repository history or an editorial source before adding `datePublished` to English pages.
2. **Full internal-link validation remains open:** This pass reviewed representative pages and extracted local link patterns, but did not resolve every local link across all 80 pages against the repository. No claim of a complete broken-link audit is made.
3. **Source quality is not yet assessed:** The presence of source/reference text or links is not proof that every citation is authoritative, correctly attributed or current. A separate evidence review is required.
4. **Images:** Alt attributes were present on the sampled inline images. Image availability, image relevance, SVG accessibility and CSS background imagery still need a separate asset check.
5. **Build and browser QA:** No verified build/test command or preview browser session is available yet. These checks remain open.

## Actions taken

- No article body, URL, canonical or hreflang value was changed during this audit.
- No publication dates were invented.
- The approved palette update for article directory cards was completed separately in shared CSS.
- Production `main` and the separate Assessment Hub remain untouched.


## Article directory reconciliation — completed on development branch

A repository directory comparison identified missing links despite the 40 English and 40 Urdu article folders:

- English directory omitted `why-do-we-overthink` (39 visible cards before correction).
- Urdu directory omitted `why-do-we-overthink` and `self-regulation-in-psychology` (38 visible cards before correction).
- Added the three missing directory cards using the article pages' own titles and descriptions. Existing article routes and article body content were not changed.
- Verified after the edits: English directory has 40 cards and 40 unique CollectionPage ItemList URLs; Urdu directory has 40 cards and 40 unique CollectionPage ItemList URLs. The declared `numberOfItems` values are 40 in both languages.
- Rechecked both Research Insights pages: their CollectionPage ItemLists each contain the same three unique article URLs represented by the content cards. Each destination appears twice in the HTML because title and card surfaces are separate anchors.

This resolves the directory-card count discrepancy. It does not constitute the full local-link crawl across all 80 article pages.


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
