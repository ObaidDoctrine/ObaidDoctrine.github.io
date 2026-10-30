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
