# OBAID DOCTRINE — Redesign Baseline Inventory

Date: 2026-10-30
Target branch: design/orange-editorial-redesign-20261030
Production branch: main (unchanged)
Backup branch: backup/pre-orange-redesign-20261030

## Repository baseline

- Static website repository; no root package.json was found in the inspected root paths.
- Recursive Git tree: 532 tracked files, 172 HTML documents.
- Main shared stylesheet: styles.css (90,089 bytes at baseline).
- Additional style layers: five-design-system.css, master-homepage.css, plus assessment/assessment.css and portfolio/styles.css.
- Shared navigation script: mobile-navigation.js.
- Existing Cloudflare Pages headers: _headers.
- SEO assets present: sitemap.xml, robots.txt, canonical/hreflang/structured data embedded in page templates.
- Existing automated workflows include public-site-e2e.yml, seo-metadata-check.yml, seo-internal-link-check.yml, seo-placeholder-check.yml and live-seo-audit.yml.

## Page inventory (HTML paths)

- English and Urdu homepages.
- Category landing pages: Psychology, Human Behaviour, Relationships, Marriage & Family, Self Improvement, Society & Life, Research & Insights.
- Article index and individual article pages in English and Urdu.
- Mind Tests index and individual tests in English and Urdu.
- Assessment pages and individual assessment tools in English and Urdu.
- Informational pages: About, Contact, Profile, Privacy, Terms, Disclaimer, Start Here.
- Utility pages: authentication, download-app, learning-lab, portfolio, 404.

## Verified design inconsistencies

1. styles.css begins with legacy green/lime tokens (#31543A, #B7D84B, #FAFAF5) and contains a large set of accumulated page-specific overrides.
2. index.html embeds critical CSS with its own green/lime values, independent of styles.css.
3. five-design-system.css introduces multiple alternative themes (including blue, dark-luxury, Swiss-minimal and warm-humanist) and Urdu-wide styling overrides.
4. master-homepage.css has another homepage token set based on lime and its own component system.
5. Some category-specific pages define local colours inline (example: Emotional Intelligence test uses a purple accent).
6. The Urdu homepage uses lang="ur" and dir="rtl"; Urdu article and test pages also have dedicated RTL markup and language-specific content. These must be validated separately, not globally mirrored without inspection.

## Approved target tokens

- Primary Orange: #F47721
- Bright Orange: #FF9B45
- Warm Cream: #FFF3E8
- Deep Charcoal: #171717
- White: #FFFFFF

Category accents:
- Psychology: #8054C7
- Human Behaviour: #168B83
- Relationships: #E34F78
- Marriage & Family: #D58B26
- Self Improvement: #3478D4
- Mind Tests: #9B63C7
- Research & Insights: #39865A
- Learning Lab: #C36C35

## Non-regression requirements

- Do not alter canonical URLs, hreflang, robots directives, structured data, Open Graph/Twitter metadata, sitemap.xml, robots.txt, or existing route paths as part of the visual pass.
- Preserve all article text, test questions/scoring logic, assessment interactions, auth flows, PWA/service-worker behavior, language switch destinations, and navigation destinations.
- Preserve _headers security directives.
- Keep the existing mobile-navigation.js behavior unless tests prove a required change.
- Do not deploy until all applicable checks pass and the proposed change has been reviewed.

## Design production gate

The required 12ui design CLI installation was attempted once but timed out in the available execution environment. No approved visual candidate has therefore been generated or selected. Per the design workflow, implementation of non-trivial visual changes must wait for an approved design candidate rather than approximating it with unreviewed CSS.

## Current status

This document records repository evidence and constraints only. No production files have been modified by this redesign branch yet. No deployment has been initiated.
