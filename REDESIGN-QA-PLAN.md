# OBAID DOCTRINE Redesign — QA and Non-Regression Plan

## Scope and safety

- Baseline production branch: `main`
- Baseline commit: `3fdaa578debb9d51e3890f784c65d4b98a32387a`
- Work branch: `design/orange-editorial-redesign-20261030`
- Protected baseline branch: `backup/pre-orange-redesign-20261030`
- Production deployment is explicitly out of scope until implementation, review, and all applicable checks pass.
- Current preparation work has not changed production HTML, CSS, JavaScript, headers, redirects, or SEO assets.

## Existing repository checks verified on main

| Workflow | Command / behavior | What it protects |
|---|---|---|
| Public website E2E | Playwright against a local Python static server | Browser-level public-site behavior on the checked-out branch |
| Bilingual SEO metadata | `node scripts/check-seo-metadata.mjs` | Canonicals, title/description, html lang, hreflang reciprocity, sitemap coverage and robots sitemap directive |
| Internal links | `node scripts/check-internal-links.mjs` | Local HTML anchor targets and www-host consistency |
| SEO placeholders | `node scripts/check-seo-placeholders.mjs` | Prevents internal citation/search placeholders from reaching published HTML |
| Live SEO audit | `node scripts/audit-live-seo.mjs` | Read-only production sitemap URL, canonical, noindex and HTTP/non-www redirect checks |

All five workflow definitions and their referenced scripts were fetched from `main` and inspected on 2026-10-30.

## Verified security headers and crawler policy

The existing `_headers` file sets:
- `X-Robots-Tag: noindex` on the Cloudflare Pages project hostname.
- HSTS with a two-year max-age.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` disabling geolocation, camera, microphone and payment.
- `X-Frame-Options: SAMEORIGIN`.

The existing `robots.txt` allows crawling and declares:
`https://www.obaiddoctrine.com/sitemap.xml`.

These controls must be preserved and re-tested after any redesign. Do not broaden crawler blocks or change the canonical host as part of visual work.

## Important QA observations / limitations

1. The SEO metadata script is a repository-wide static check. It validates local sitemap targets and reciprocal hreflang links, but cannot prove that Google has selected the preferred canonical or indexed a URL.
2. The internal-link script checks local HTML targets. It intentionally does not verify remote third-party destinations.
3. The live SEO audit is read-only and useful after a preview/production release; it cannot replace Search Console indexing evidence.
4. The Playwright workflow starts Python's static server and runs `npx playwright test`. No package manifest was identified in the inspected repository root, so confirm the test suite/configuration is self-contained before relying on a local reproduction.
5. The E2E workflow installs Chromium and dependencies in CI; browser visual-regression, accessibility automation, Urdu RTL screenshots, and performance budgets were not established by the workflow definition inspected here. Add targeted checks only after reviewing existing test files to avoid duplicate or incompatible infrastructure.
6. Lighthouse scores are lab observations, not a substitute for field Core Web Vitals. Compare mobile and desktop runs using the same test conditions before/after implementation.

## Required redesign acceptance gates

- [ ] Approved desktop and mobile design direction produced through the required 12ui design workflow.
- [ ] English and Urdu page templates mapped; Urdu `lang` and `dir=rtl` behavior retained.
- [ ] Existing page copy, routes, IDs, anchors, forms, assessments, navigation and interactive behavior preserved unless an explicit approved change is documented.
- [ ] Brand orange and category accent tokens meet contrast requirements for text, controls, focus rings and states.
- [ ] Reduced-motion preferences and keyboard focus/operation verified.
- [ ] All five existing GitHub Actions checks pass on the design branch.
- [ ] Representative desktop/mobile and Urdu RTL browser checks pass.
- [ ] Lighthouse / PageSpeed before-after comparison recorded without regressing the known baseline.
- [ ] Preview deployment reviewed before any production deployment.
- [ ] Production canonical, redirects, robots, sitemap and headers rechecked after release.
- [ ] Search Console indexing status monitored separately; do not claim indexing recovery based only on code tests.

## Current status

This document is a QA plan only. No production UI has been implemented. The required 12ui CLI setup previously timed out; design production remains gated on access to a functioning 12ui design workflow.

## Additional verified findings from the existing Playwright suite

The existing `tests/public-site.spec.mjs` is a substantial regression suite, and `playwright.config.mjs` is present (there is no root `package.json`). The E2E workflow installs `@playwright/test@1.63.0` directly and runs this configuration.

Important redesign compatibility issue:
- The homepage Mind Test card tests hard-code the current legacy green palette: card background `rgb(37, 75, 53)`, title `rgb(255, 255, 255)`, description `rgb(230, 238, 231)`, and badge background `rgb(216, 239, 131)`.
- The suite checks these values on desktop and mobile, plus hover/focus contrast. An intentional move to the approved orange/category palette will therefore fail these assertions unless the tests are updated to validate the new approved tokens and actual contrast ratios rather than the old green RGB values.
- This is a test expectation migration, not evidence that the existing design is defective. Update the test only alongside the approved implementation, and retain the meaningful contrast, hover, focus, visibility and responsive assertions.
- Existing tests also check English/Urdu homepages, language switching, no account/member links, robots/sitemap/manifest/service worker reachability, 20 negative auth/member routes, and 20 Mind Test language variants with interactive completion/restart. Preserve all these behaviors.
- Mind Test title spacing is explicitly asserted in desktop and mobile for English and Urdu. Redesign spacing changes must either satisfy these expectations or deliberately revise the assertions based on a reviewed visual specification.

Deployment safety:
- `.github/workflows/pages-deployment.yaml` deploys to Cloudflare Pages only on a push to `main`; pull requests do not trigger its production deployment job.
- A special PR-58 preview job is hard-coded to one historical branch name and is not a general preview mechanism. Do not assume a new redesign PR will receive a Cloudflare preview from this workflow.
- The deployment job resolves the Cloudflare project's configured production branch using repository secrets and deploys to that branch. Keep all redesign work on the isolated design branch until the full review gate is passed.
- `.github/workflows/seo-v2.yml` has `contents: write` and, when manually dispatched or triggered by its path marker, runs a script that edits all HTML pages and pushes a commit. Do not manually trigger this legacy automation during the redesign; review its effects separately before any use.

## Additional acceptance gates

- [ ] Migrate the homepage Mind Test card regression assertions from legacy green RGB constants to approved orange/category tokens and measured WCAG contrast checks, without weakening hover/focus/mobile coverage.
- [ ] Run the full existing Playwright suite after implementation, including all bilingual Mind Test flows and negative auth/member route checks.
- [ ] Verify the exact Cloudflare preview mechanism for the new PR before relying on preview URLs; the current workflow's PR preview condition is branch-specific.
- [ ] Do not trigger the legacy SEO V2 write workflow during redesign implementation.


## 8. Verified stylesheet and homepage cascade inventory (2026-10-30)

Read-only inspection of the current design branch confirms the following:

- `styles.css` is approximately 90,089 bytes and is minified into a single physical line. Its opening root tokens still define the legacy forest/lime palette (`#31543A`, `#B7D84B`, ivory/sage surfaces) and repeated `--od-*` declarations occur in the same stylesheet. Do not perform blind global string replacement: several semantic aliases and legacy declarations coexist.
- `index.html` links Google Fonts twice (preload with onload swap and a regular stylesheet link), then links `/styles.css?v=20261030-css-performance` using the same preload-plus-stylesheet pattern. It also contains one inline style block and four script blocks. Any future font/CSS optimization must first determine whether the duplicate font link is intentional and measure the impact before changing it.
- `five-design-system.css` (9,623 bytes) contains multiple opt-in design variants, including selectors scoped to `body[data-design=...]`, plus unscoped homepage/article selectors. It includes mobile and reduced-motion rules. Variant scoping and selector specificity need to be mapped before consolidating it.
- `master-homepage.css` (12,847 bytes) defines a second homepage token set (`--od-master-*`) with lime-based styling and numerous Urdu RTL overrides for header, hero, question grid, navigation and sections.
- The homepage inline CSS, shared `styles.css`, optional design-system overrides and homepage stylesheet can all contribute to the final cascade. The actual stylesheet inclusion order must be traced on representative English and Urdu pages before implementation.
- Existing breakpoints are not fully standardized (observed examples include 1100, 1050, 1000, 820, 760, 700, 680, 560, 480 and 360 pixels). The redesign should define a deliberate responsive scale and test boundary widths rather than mechanically replacing breakpoints.
- Preserve `prefers-reduced-motion: reduce` behavior across every migrated stylesheet. Existing reduced-motion rules were observed in all three inspected CSS files.

### Required implementation sequence after the 12ui design gate is cleared

1. Build a page-to-stylesheet dependency map for representative English/Urdu home, category, article, profile, and Mind Test pages.
2. Identify all shared tokens and the true cascade order, including inline critical CSS and dynamically injected mobile navigation styles.
3. Introduce the approved orange/category tokens centrally, then migrate shared components in controlled groups; do not overwrite category identity colours with orange.
4. Update visual regression assertions to the approved tokens while retaining contrast, keyboard focus, hover, RTL, and responsive behavior assertions.
5. Compare before/after computed styles and performance at desktop, tablet, and mobile widths; run the full existing interactive Mind Test and navigation suite.
6. Only after successful review should a pull request and a separately approved deployment plan be considered.

No production CSS, HTML, JavaScript, route, metadata, or deployment configuration was changed as part of this inventory.
