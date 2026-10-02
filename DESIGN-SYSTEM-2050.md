# OBAID DOCTRINE — 2050 Knowledge Platform Design Direction

## Audit baseline
- Existing stack: static HTML/CSS/JS on GitHub Pages with shared `styles.css`, route-per-folder HTML, bilingual English/Urdu pages.
- Current live homepage already has strong information architecture: hero, question-led discovery, category grid, learning paths, Mind Tests, research/editorial approach, founder, app CTA, footer.
- Existing SEO foundations include canonical URLs, hreflang, Open Graph/Twitter metadata, JSON-LD on representative pages, robots.txt and sitemap.xml.
- Existing responsive and reduced-motion rules are present.
- Main branch was re-checked before changes; implementation work is isolated on `design/2050-knowledge-platform`.

## Design concept
Quiet Futurism for Knowledge:
- ivory editorial canvas + deep botanical green structure + lime signal accent;
- thin precision borders, layered surfaces and restrained depth instead of glassmorphism;
- asymmetric editorial grids and a recurring Knowledge Card motif;
- motion is short, purposeful and skipped/reduced for reduced-motion users;
- content remains the dominant visual element.

## Core tokens
- `--od-forest: #31543A`
- `--od-lime: #B7D84B`
- `--od-sage: #DCE8B5`
- `--od-ivory: #FAFAF5`
- `--od-muted: #6F756F`
- `--od-white: #FFFFFF`

## Signature system
1. Knowledge Card — a structured editorial surface with a small topic signal, title, context and next action.
2. Evidence Rail — restrained research indicator used only where evidence context is legitimate.
3. Knowledge Orbit — homepage-only layered visual framing around the real founder image.
4. Future Index — numbered, quiet metadata language for pathways, tests and research.
5. Reading Canvas — calmer article layout with strong measure, hierarchy and reference treatment.

## Responsive targets
- 360px
- 390px
- 430px
- tablet
- 1366px
- 1440px
- large desktop

## Change-control rules
- No URL changes.
- No deletion of article/content copy.
- No new credentials, statistics, testimonials, awards or partnerships.
- No black backgrounds/cards.
- No cyberpunk/neon/glowing HUD treatment.
- Preserve SEO metadata, schema, sitemap and robots behavior.
- Preserve existing functionality unless a verified defect requires correction.

## Implementation sequence
1. Global token and typography layer.
2. Shared navigation/footer and surfaces.
3. Homepage signature composition.
4. Category/search/article reading surfaces.
5. Mind Tests and Urdu RTL refinement.
6. Motion/accessibility layer.
7. Static QA and route/SEO checks.
