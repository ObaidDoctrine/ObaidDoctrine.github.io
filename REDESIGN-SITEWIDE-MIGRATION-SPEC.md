# OBAID DOCTRINE — Sitewide Orange Design-System Migration Specification

Status: implementation specification / not yet applied
Target branch: `design/orange-editorial-redesign-20261030`
Production branch: `main` (must remain unchanged until reviewed and approved)

## 1. Source files inspected

The following files were fetched directly from `main` on 2026-10-30:

| File | Observed baseline |
|---|---|
| `styles.css` | 90,089 characters; root tokens include forest/lime/cream palette; global typography, header, links and shared components |
| `mobile-navigation.js` | 12,544 characters; mobile navigation and language-switcher behaviour/styles are partly injected at runtime |
| `master-homepage.css` | 12,847 characters; dedicated homepage layer with its own lime token and component overrides |
| `five-design-system.css` | 9,623 characters; additional homepage preview variants and responsive/reduced-motion rules |
| `index.html` | 28,202 characters; English homepage metadata, canonical/hreflang, theme-color and inline critical styles |

These files are separate styling layers. A global token replacement is unsafe and is not an acceptable implementation strategy.

## 2. Approved visual tokens

Brand:
- Primary orange: `#F47721`
- Bright orange: `#FF9B45`
- Warm cream: `#FFF3E8`
- Deep charcoal: `#171717`
- White: `#FFFFFF`

Category accents:
- Psychology: `#8054C7`
- Human Behaviour: `#168B83`
- Relationships: `#E34F78`
- Marriage & Family: `#D58B26`
- Self Improvement: `#3478D4`
- Mind Tests: `#9B63C7`
- Research & Insights: `#39865A`
- Learning Lab: `#C36C35`

Orange is the brand anchor, not a universal background. Use neutral editorial reading surfaces and category colours only for category identity.

## 3. Required coordinated migration

### A. Shared design tokens and global styles
- Define one documented token set for brand, text, surfaces, borders, focus, shadows and category accents.
- Map existing legacy variables deliberately; do not mass-replace colour literals.
- Audit repeated selectors and specificity before changing component rules.
- Preserve existing typography metrics and layout dimensions unless a separately tested design change requires adjustment.

### B. Homepage critical CSS
- Update the inline critical style in `index.html` in coordination with shared styles.
- Keep first-paint colours, hero geometry and focus states consistent with the external stylesheet.
- Preserve canonical, hreflang, robots, Open Graph, Twitter metadata, JSON-LD and existing content/links.

### C. Homepage-specific layers
- Reconcile `master-homepage.css` and `five-design-system.css` with the approved tokens.
- Identify and remove/retire conflicting preview overrides only after proving which selectors are active.
- Preserve English and Urdu homepage layouts and existing breakpoints.

### D. Runtime mobile navigation
- Inspect every injected style block and hard-coded colour in `mobile-navigation.js`.
- Replace legacy palette values with shared tokens or a controlled CSS custom-property contract.
- Preserve menu open/close, body scroll lock, language switcher, keyboard interaction and accessible expanded state.
- Verify genuine RTL behaviour for Urdu; do not force LTR direction on the Urdu menu.
- Avoid adding further `!important` declarations as a shortcut.

### E. Category and interactive components
- Map category accents consistently across cards, badges, topic tiles and navigation.
- Mind Test cards must retain legible foreground/background contrast and clear interactive states.
- Preserve all existing test routes, question flow, scoring, restart behaviour and results.

## 4. Accessibility and responsive acceptance

- Target WCAG 2.2 AA contrast for normal text, large text, controls and focus indicators.
- Provide visible keyboard focus, semantic landmarks, accessible names and correct expanded/current states.
- Respect `prefers-reduced-motion`; avoid animating colour, shadow and layout properties unnecessarily.
- Check mobile widths, tablet and desktop; check English LTR and Urdu RTL independently.
- No horizontal overflow, clipped menus, overlapping sticky navigation or unreadable text.

## 5. SEO, security and content invariants

Do not alter these as part of visual work:
- URL paths, redirects and trailing-slash policy.
- Canonical host: `https://www.obaiddoctrine.com/`.
- Reciprocal hreflang and x-default.
- Sitemap, robots directives, structured data and indexability.
- Article copy, author attribution, citations, internal destinations and social/legal links.
- Cloudflare security headers and project-hostname noindex policy.

A visual redesign cannot claim Google canonical selection or indexing recovery. Those require separate Search Console evidence.

## 6. Performance guardrails

Historical supplied mobile Lighthouse baseline (27 Oct 2026): Performance 100, Accessibility 96, Best Practices 100, SEO 100; LCP 1.5s, TBT 0ms, CLS 0.03. This is a historical user-provided report, not a new measurement.

After implementation:
- Compare mobile and desktop Lighthouse runs under equivalent conditions.
- Prevent hero/font/image layout shifts; retain intrinsic image dimensions and correct fetch priority.
- Avoid increasing blocking CSS/JS or adding unnecessary dependencies.
- Recheck DOM size, forced reflow, animation compositing and font loading.
- Treat the historical score as a regression guardrail, not a guarantee.

## 7. Mandatory implementation sequence

1. Obtain and follow the required approved design-system workflow.
2. Build the homepage first on the design branch only.
3. Implement shared tokens and coordinated homepage/mobile layers.
4. Expand by page template/category, not blind mass-editing all HTML files.
5. Run existing Playwright public-site tests and all SEO/link/placeholder checks.
6. Add visual regression and accessibility checks for desktop/mobile and English/Urdu.
7. Inspect the full diff for accidental SEO, content, URL or security changes.
8. Request review; merge/deploy only after checks pass and deployment authorization is explicit.

## 8. Current completion state

- Source-file inspection: completed for the five files listed above.
- Approved palette and migration constraints: documented.
- Actual UI/CSS/JavaScript implementation: not started.
- Browser tests for the redesign: not run.
- Production deployment: not performed.
- Mandatory design workflow: remains a prerequisite; do not bypass it with an unapproved substitute.


## 8. Source stylesheet colour-token inventory (2026-10-30)

A read-only inspection of the current `main` branch identified the following migration surface:

| File | Size inspected | CSS custom-property declarations | Distinct literal HEX colours | Migration note |
|---|---:|---:|---:|---|
| `styles.css` | 90,089 bytes | 73 | 119 | Multiple legacy and editorial token namespaces coexist; do not globally replace colours |
| `master-homepage.css` | 12,847 bytes | 7 | 13 | Homepage-specific lime/ink/paper tokens need an explicit mapping |
| `five-design-system.css` | 9,623 bytes | 0 | 55 | Contains several independent visual variants; preserve variant identity unless explicitly redesigned |
| `mobile-navigation.js` | 12,544 bytes | 0 | 8 | Runtime-injected CSS contains hard-coded legacy green/sage values; migrate separately and verify Urdu RTL |

### Safe migration rules

1. Establish one documented semantic token layer (brand, surfaces, text, borders, focus, category accents and category text) before changing component declarations.
2. Map legacy token namespaces to semantic tokens only after tracing which selectors and pages consume them.
3. Keep category accent fills separate from accessible category text colours; never assume one hue works for both foreground and background use.
4. Treat runtime-injected mobile navigation styles as a separate migration target; CSS variables in stylesheets will not automatically replace hard-coded JavaScript literals.
5. Preserve the distinct editorial variants in `five-design-system.css` until their route usage is inventoried. Do not flatten all page types into one palette.
6. After implementation, run route-based visual checks in English LTR and Urdu RTL, at mobile/tablet/desktop widths, and test hover, focus-visible, active, disabled and reduced-motion states.

This inventory is based on source text inspection only. It is not a rendered-browser audit. No source files were modified as part of this inventory.
