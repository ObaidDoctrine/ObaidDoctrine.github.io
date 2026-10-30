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

- [x] Approved responsive English/Urdu design direction prototyped in MagicPath after the owner explicitly authorized an alternative tool workflow; 12ui was not used.
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

This document began as a QA plan. On 2026-10-31, the owner explicitly authorized alternative tools. A responsive bilingual homepage prototype was created in MagicPath, and shared site CSS/JS plus brand theme updates were implemented on the redesign branch. Production remains unchanged pending PR checks and deployment.

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

### Implementation sequence using the owner-approved alternative design workflow

1. Build a page-to-stylesheet dependency map for representative English/Urdu home, category, article, profile, and Mind Test pages.
2. Identify all shared tokens and the true cascade order, including inline critical CSS and dynamically injected mobile navigation styles.
3. Introduce the approved orange/category tokens centrally, then migrate shared components in controlled groups; do not overwrite category identity colours with orange.
4. Update visual regression assertions to the approved tokens while retaining contrast, keyboard focus, hover, RTL, and responsive behavior assertions.
5. Compare before/after computed styles and performance at desktop, tablet, and mobile widths; run the full existing interactive Mind Test and navigation suite.
6. Only after successful review should a pull request and a separately approved deployment plan be considered.

No production CSS, HTML, JavaScript, route, metadata, or deployment configuration was changed as part of this inventory.


## 9. Verified mobile navigation and multi-theme migration risks (2026-10-30)

Read-only inspection of the current design branch files confirms:

- `mobile-navigation.js` is 12,544 bytes and injects its own complete side-menu and language-switcher stylesheet at runtime. The injected CSS contains 112 `!important` declarations, fixed-position controls, and hard-coded legacy green/sage values (including `#31543A`, `#dce8b5`, and `#FAFAF5`). Updating CSS files alone will not recolour this interface.
- The injected side-menu panel explicitly sets `direction:ltr`. Urdu labels are supplied, but the panel's layout direction must be reviewed and tested for Urdu RTL rather than assuming translated strings are sufficient.
- The same script supports multiple navigation modes: existing `<details>` menus, legacy header navigation, and a generated side menu. It also manages body scroll locking, Escape-to-close, overlay dismissal, language switching and responsive behavior. Do not replace or simplify it without tracing which mode each page actually uses.
- `index.html` contains a separate inline critical stylesheet that independently hard-codes the forest/lime palette in header, hero, buttons and mobile layout. These declarations can override or visually conflict with the shared stylesheet if only one layer is migrated.
- `styles.css` contains multiple generations of token namespaces and repeated token declarations, including `--f/--l/--i`, `--od-forest/--od-lime`, `--ed-*`, and a separate editorial navy/blue set. A global text replacement would risk changing opt-in editorial or category-specific variants unintentionally.
- `master-homepage.css` uses its own lime token (`--od-master-lime:#B7D84B`) and includes explicit Urdu RTL layout rules. Its overrides must be migrated as a coordinated component layer.
- `five-design-system.css` contains several distinct colour families (including neutral, blue, warm, and teal variants) and both responsive and reduced-motion rules. Treat it as a multi-variant stylesheet, not as a single global brand palette.

### Additional implementation gates

- [ ] Trace which pages load `mobile-navigation.js`, which navigation mode each page uses, and whether generated navigation duplicates server-rendered controls.
- [ ] Replace runtime-injected colour literals with approved shared design tokens only after confirming all navigation modes and Urdu RTL behavior.
- [ ] Rework the generated side menu's direction, alignment, focus order, close controls and language switch for Urdu without regressing English.
- [ ] Migrate the homepage critical CSS and shared stylesheet together; verify computed styles after the complete cascade loads.
- [ ] Keep opt-in editorial/design variants and category accent colours distinct from the global orange brand token.
- [ ] Test keyboard operation, Escape, overlay dismissal, body scroll restoration, route navigation and language switching at mobile and desktop breakpoints.

These are verified source-level findings, not browser-tested defects. No source code or production configuration was modified by this inspection.


## Verified workflow entry points and exact checks (rechecked 2026-10-30)

The following workflow filenames and commands were fetched from `main`:

| Workflow file | Workflow name | Command / behavior |
|---|---|---|
| `.github/workflows/public-site-e2e.yml` | OBAID DOCTRINE — Public Website E2E | Installs Playwright 1.63.0 and Chromium, serves the checked-out static site on port 4173, runs `npx playwright test` |
| `.github/workflows/seo-metadata-check.yml` | SEO bilingual metadata validation | `node scripts/check-seo-metadata.mjs` |
| `.github/workflows/seo-internal-link-check.yml` | SEO internal link validation | `node scripts/check-internal-links.mjs` |
| `.github/workflows/seo-placeholder-check.yml` | SEO citation placeholder regression check | `node scripts/check-seo-placeholders.mjs` |
| `.github/workflows/live-seo-audit.yml` | Read-only live SEO and redirect audit | `node scripts/audit-live-seo.mjs`; read-only HTTP checks against the live site |

Important test semantics:
- Public-site E2E runs against the checked-out branch via a local static server; it does not deploy.
- SEO metadata checks local canonical, title, description, language, hreflang reciprocity, sitemap targets and robots sitemap directive. It does not query Google's canonical/indexing decision.
- Internal-link checks local HTML targets and flags non-www internal URLs.
- Placeholder checks scan published HTML for internal citation/search reference markers.
- Live SEO audit reads live robots/sitemap/page responses and tests permanent HTTP/non-www aliases; it does not write to production.

## Current execution status (rechecked 2026-10-30)

- These workflow definitions and scripts have been inspected, but the redesign branch has not yet had these tests run.
- The owner previously asked not to use 12ui. On 2026-10-31, the owner explicitly authorized use of alternative tools; MagicPath was used for the responsive bilingual prototype.
- The approved MagicPath prototype is a design reference only; the production implementation is tracked separately in GitHub PR #82 and must pass the stated QA gates before release.
- No pull request has been opened, no deployment has been triggered, and production remains unchanged.


## 10. Verified palette contrast audit (2026-10-30)

Contrast ratios below were calculated from the supplied sRGB hex values using the WCAG relative-luminance formula. These are mathematical checks of the proposed tokens, not a full browser accessibility audit.

For normal-size text, use a minimum contrast ratio of 4.5:1. Large text may use 3:1, but interactive controls, focus indicators, icons that convey meaning, and component boundaries need their own applicable checks.

| Token / category colour | Hex | Charcoal `#171717` on colour | White `#FFFFFF` on colour | Safe initial use |
|---|---:|---:|---:|---|
| Primary Orange | `#F47721` | 6.41:1 PASS | 2.80:1 FAIL | Use charcoal text on orange buttons/badges |
| Bright Orange | `#FF9B45` | 8.56:1 PASS | 2.09:1 FAIL | Use charcoal text; avoid white text |
| Psychology | `#8054C7` | 3.42:1 FAIL | 5.24:1 PASS | White text on this solid category background |
| Human Behaviour | `#168B83` | 4.32:1 FAIL | 4.15:1 FAIL | Do not use either pairing for normal text; use on light surface as a non-text accent, or darken token |
| Relationships | `#E34F78` | 4.83:1 PASS | 3.71:1 FAIL | Charcoal text on this solid category background |
| Marriage & Family | `#D58B26` | 6.45:1 PASS | 2.78:1 FAIL | Charcoal text on this solid category background |
| Self Improvement | `#3478D4` | 4.08:1 FAIL | 4.39:1 FAIL | Neither pairing passes for normal text; darken/adjust token or use as non-text accent |
| Mind Tests | `#9B63C7` | 4.27:1 FAIL | 4.20:1 FAIL | Neither pairing passes for normal text; darken/adjust token or use as non-text accent |
| Research & Insights | `#39865A` | 4.04:1 FAIL | 4.44:1 FAIL | Neither pairing passes for normal text; darken/adjust token or use as non-text accent |
| Learning Lab | `#C36C35` | 4.71:1 PASS | 3.81:1 FAIL | Charcoal text on this solid category background |

Additional surface checks:
- Charcoal on warm cream `#FFF3E8`: 16.42:1 PASS.
- Charcoal on white: 17.93:1 PASS.
- White on primary orange and bright orange fails even the 3:1 large-text threshold; do not use white labels on these orange fills.
- The design-system kit's initial `--primary-foreground:#FFFFFF` pairing is therefore unsafe for normal text on `--primary:#F47721`. Set the foreground to `#171717` before using the token in buttons, chips, or other filled controls.

Implementation rules:
1. Keep category hues as identity accents, but do not assume every hue is a valid text colour or text-bearing background.
2. For any category colour used as text on white/cream, independently verify foreground-to-surface contrast; the table above reports text-on-colour, not colour-on-white.
3. If a token is adjusted, record the new hex and recompute every foreground/background pairing before implementation.
4. Test focus indicators and non-text control boundaries separately; text contrast results do not certify them.
5. Do not use opacity to dim text. Use an explicit semantic foreground token that meets contrast.
6. Re-run automated and manual checks against rendered English LTR and Urdu RTL pages after implementation.

No production CSS or component code was changed by this audit.


## 11. Text-on-light-surface token alternatives (2026-10-30)

The previous table tested dark/white text placed on solid category fills. This separate check tests the category hue itself when used as text or an icon on a white surface. It avoids the common mistake of assuming a colour that works as a card background also works as a text colour.

| Semantic use | Current token | Current contrast on white | Candidate text token | Candidate contrast on white |
|---|---:|---:|---:|---:|
| Brand orange text/link | `#F47721` | 2.80:1 FAIL | `#C3550A` | 4.54:1 PASS |
| Bright orange text/link | `#FF9B45` | 2.09:1 FAIL | `#BF5800` | 4.55:1 PASS |
| Psychology text/link | `#8054C7` | 5.24:1 PASS | Keep current | 5.24:1 PASS |
| Human Behaviour text/link | `#168B83` | 4.15:1 FAIL | `#15847C` | 4.54:1 PASS |
| Relationships text/link | `#E34F78` | 3.71:1 FAIL | `#DE2E5F` | 4.50:1 PASS |
| Marriage & Family text/link | `#D58B26` | 2.78:1 FAIL | `#A36A1D` | 4.53:1 PASS |
| Self Improvement text/link | `#3478D4` | 4.39:1 FAIL | `#3176D3` | 4.50:1 PASS |
| Mind Tests text/link | `#9B63C7` | 4.20:1 FAIL | `#975CC5` | 4.51:1 PASS |
| Research & Insights text/link | `#39865A` | 4.44:1 FAIL | `#388459` | 4.55:1 PASS |
| Learning Lab text/link | `#C36C35` | 3.81:1 FAIL | `#B16230` | 4.51:1 PASS |

Candidate values are mathematically generated same-hue/saturation darker alternatives and are **proposals, not yet approved brand tokens**. Review them visually in the actual design before adoption. Keep the original bright orange for filled surfaces with charcoal foreground where its contrast passes; use the darker orange alternative only for orange text/icons on white. Likewise, separate each category's vivid identity/accent token from its accessible text token when needed.

The calculations use white `#FFFFFF` as the background. Recheck on warm cream `#FFF3E8`, tinted chips, gradients, images, hover/focus states, and every actual rendered combination before release. Do not infer that this table certifies link affordance, focus visibility, or non-text contrast.

No site source code or production configuration was modified by this recommendation.


## 12. Contrast re-check against both white and warm-cream surfaces (2026-10-30)

A follow-up check found that the candidate text colours in section 11 were selected to pass on pure white, but most do **not** reach 4.5:1 on the proposed warm-cream surface `#FFF3E8`. Therefore section 11 candidates must not be treated as universal link/text tokens.

The following darker alternatives were recalculated to pass 4.5:1 on **both** `#FFFFFF` and `#FFF3E8`:

| Semantic text/accent token | Proposed universal text colour | Contrast on white | Contrast on warm cream |
|---|---:|---:|---:|
| Brand orange text | `#BA510A` | 4.92:1 | 4.51:1 |
| Bright orange text | `#B65400` | 4.93:1 | 4.52:1 |
| Psychology | `#8054C7` | 5.24:1 | 4.80:1 |
| Human Behaviour | `#147D76` | 4.97:1 | 4.55:1 |
| Relationships | `#D72255` | 4.94:1 | 4.53:1 |
| Marriage & Family | `#9B651C` | 4.92:1 | 4.50:1 |
| Self Improvement | `#2B6FCB` | 4.95:1 | 4.54:1 |
| Mind Tests | `#9254C2` | 4.92:1 | 4.51:1 |
| Research & Insights | `#367E55` | 4.92:1 | 4.50:1 |
| Learning Lab | `#A85D2E` | 4.92:1 | 4.51:1 |

These are conservative candidate text colours, not signed-off brand values. Use a distinct vivid category/accent token for decorative fills when desired, and a semantic `*-text` token for links, labels and icons on light surfaces. Filled buttons must use a separately verified foreground/background pair (for primary orange fill, charcoal `#171717` is the current passing pairing).

The ratios are rounded to two decimals; values near 4.50 should be rechecked against the exact final hex values and actual rendered surface. This is a two-surface mathematical check only, not a complete WCAG audit. Recheck gradients, transparency, image overlays, hover/focus/visited states, disabled controls, focus indicators and non-text component boundaries in the browser.

No website source code or production configuration was modified by this audit.


## 13. Current implementation and verification status (2026-10-31)

- A responsive English/Urdu homepage prototype was created in MagicPath and visually inspected. It includes a language toggle, Urdu RTL, orange brand accents, category navigation, Mind Tests, article links and research/editorial content.
- The sitewide shared stylesheet now contains the orange editorial token migration and common component overrides. Homepage-specific legacy tokens, ticker, footer and Mind Test cards are included.
- Runtime mobile navigation colours were migrated; the generated drawer now receives an explicit LTR/RTL direction from the current route.
- English/Urdu homepage browser theme colours and CSS cache-busting references were updated; the PWA manifest theme/background colours were aligned with the orange identity.
- Regression tests were updated for Mind Test contrast, mobile drawer direction/background, and PWA theme values.
- GitHub PR #82 is open against main. Vercel preview builds and GitHub Actions checks are pending; do not merge or deploy until checks complete successfully.
- The preview was previously verified to return HTTP 200 for a representative set of English/Urdu homepage, category, article, Mind Test and profile routes. This does not replace Playwright browser testing or a full route audit.
- Production main and the Cloudflare Pages live site have not been changed by this PR.
