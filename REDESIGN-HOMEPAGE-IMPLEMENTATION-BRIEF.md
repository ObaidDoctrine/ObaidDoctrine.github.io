# OBAID DOCTRINE — Homepage Design Implementation Brief

Status: approved direction / implementation-ready specification  
Target branch: `design/orange-editorial-redesign-20261030`  
Production deployment: NOT authorized by this document.

## 1. Design direction

Premium Modern Editorial with a balanced orange identity and restrained category-based colour. The site must feel like a credible psychology and human-behaviour knowledge publication, not a generic SaaS landing page.

Primary brand orange: `#F47721`  
Bright orange: `#FF9B45`  
Warm cream: `#FFF3E8`  
Deep charcoal: `#171717`  
White: `#FFFFFF`

Category accents:
- Psychology: `#8054C7`
- Human Behaviour: `#168B83`
- Relationships: `#E34F78`
- Marriage & Family: `#D58B26`
- Self Improvement: `#3478D4`
- Mind Tests: `#9B63C7`
- Research & Insights: `#39865A`
- Learning Lab: `#C36C35`

Orange is the brand anchor, not a colour to apply to every surface. Use cream and white for editorial reading surfaces, charcoal for primary text, and category accents only for category identification.

## 2. Homepage information architecture

Preserve the existing homepage content, links, routes, and features. Recompose into this order where matching content already exists:

1. Existing site header and navigation, with clear active/focus states and language switch.
2. Editorial hero: concise positioning statement, supporting copy, primary path into the knowledge library, and existing founder image if currently used.
3. Featured knowledge / latest articles: editorial cards with category, title, short excerpt, and clear reading action.
4. Explore by topic: category tiles using the category accent tokens above.
5. Mind Tests feature: clearly differentiated interactive-test entry point; preserve all existing test routes and behaviour.
6. Human behaviour / relationships or other existing editorial feature sections.
7. Research & Insights / Learning Lab discovery links where present.
8. Existing footer, social links, legal links, and language entry points.

Do not invent article titles, statistics, endorsements, authors, or claims. Reuse the site's existing verified copy and URLs.

## 3. Component and visual rules

- Header: restrained, compact, editorial; keep navigation discoverable on desktop and mobile.
- Hero: strong typographic hierarchy; orange used as a focal accent rather than a full-page orange background.
- Article cards: consistent image ratio, readable title, category label, generous spacing, visible hover and keyboard-focus treatment.
- Topic tiles: category colour may identify the tile/icon/edge; maintain sufficient text contrast.
- Mind Test cards: preserve test-specific labels, descriptions, start/restart states, and accessible controls.
- Buttons: primary orange with accessible contrast; secondary actions use neutral surfaces and visible borders.
- Surfaces: mostly white / warm cream; charcoal text; avoid excessive gradients, glass effects, and decorative animation.
- Typography: preserve the site's loaded font stack unless verified alternatives improve Urdu and English rendering without harming performance.

## 4. Responsive behaviour

- Desktop: editorial max-width, balanced multi-column article/topic layouts, no excessively wide text measure.
- Tablet: reduce columns and spacing without hiding key navigation or content.
- Mobile: single-column reading flow, touch-friendly controls, no horizontal overflow, no clipped cards, stable hero dimensions.
- Urdu: true RTL direction and alignment for navigation, cards, icons, breadcrumbs, and text; do not merely right-align English layout. Verify mixed Urdu/English strings and punctuation.

## 5. Accessibility and motion

Target WCAG 2.2 AA-oriented implementation:
- Check text, button, badge, and focus-indicator contrast for every palette combination.
- Semantic landmarks and correctly nested headings.
- Keyboard-operable navigation, language switch, cards, and tests.
- Visible focus indicators not dependent on colour alone.
- Meaningful image alt text; decorative images use empty alt.
- Respect `prefers-reduced-motion`; avoid layout-affecting hover animations.
- Ensure controls have accessible names and touch targets are practical on mobile.

## 6. Non-negotiable preservation constraints

Do not change:
- Existing route paths, canonical URLs, hreflang relationships, metadata, Open Graph/Twitter metadata, JSON-LD, sitemap, robots rules, or redirects unless separately audited and explicitly approved.
- Article copy, Urdu translations, author attribution, or internal link destinations.
- Mind Test logic, scoring, state, restart behaviour, or accessibility semantics.
- Login/member exclusions, PWA/service worker behaviour, manifest, or navigation/language switching.
- Security headers in `_headers`.

The homepage has inline critical CSS. Global `styles.css`, `master-homepage.css`, `five-design-system.css`, and runtime CSS injected by `mobile-navigation.js` must be reconciled deliberately. Do not perform blind global colour replacement.

## 7. Performance guardrails

Historical mobile Lighthouse snapshot supplied by the site owner: Performance 100, Accessibility 96, Best Practices 100, SEO 100; LCP 1.5s; CLS 0.03; TBT 0ms. These are historical measurements, not a guarantee for future builds.

- Preserve image dimensions and high-priority LCP image loading behaviour.
- Avoid adding large dependencies, heavy animation, unnecessary fonts, or oversized images.
- Prevent layout shifts by reserving media and hero dimensions.
- Re-test mobile and desktop performance after implementation.

## 8. Acceptance checklist

- [ ] Homepage English desktop / tablet / mobile visually reviewed.
- [ ] Homepage Urdu desktop / tablet / mobile visually reviewed with true RTL.
- [ ] Header, mobile drawer, overlay, Escape dismissal, scroll lock, and language switch work.
- [ ] Article cards and all category links resolve to existing URLs.
- [ ] Mind Test entry points and full interactive test flows remain functional.
- [ ] Keyboard navigation and visible focus verified.
- [ ] Contrast checked for all text and control states.
- [ ] Reduced-motion behaviour verified.
- [ ] No horizontal overflow or clipped content at tested widths.
- [ ] Canonical, hreflang, metadata, JSON-LD, sitemap, robots, and security headers unchanged and verified.
- [ ] Existing Playwright tests pass without weakening assertions.
- [ ] Fresh Lighthouse / PageSpeed checks completed on desktop and mobile.
- [ ] Production deployment remains blocked until explicit owner approval.

## 9. Current implementation gate

This document is a design/engineering brief only. It does not claim that a visual design, prototype, code change, browser test, or deployment has been completed. The required 12ui design workflow was previously attempted once and timed out; do not claim it is available until its toolchain is actually verified.