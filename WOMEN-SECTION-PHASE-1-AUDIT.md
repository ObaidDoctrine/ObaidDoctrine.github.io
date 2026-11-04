# OBAID DOCTRINE Women Section — Phase 1 Repository Audit

Audit date: 2026-11-04
Repository: https://github.com/ObaidDoctrine/ObaidDoctrine.github.io
Base branch: main
Working branch: women-section-rebuild-2026-11-04
Base commit: 072f1c10291c0841d82b680d343c5a1b397288ea

## Verified inventory

| Item | English | Urdu |
|---|---:|---:|
| Existing Women landing files | 1 | 1 |
| Categories | 10 | 10 |
| Topic cards | 100 | 100 |
| Topics per category | 10 | 10 |

Existing files:
- `women/index.html` (95,635 characters)
- `ur/women/index.html` (92,061 characters)

The 10 English categories are:
1. Digital Safety
2. Career & Money
3. Family & Motherhood
4. Body Image & Social Media
5. Rights, Safety & Legal Awareness
6. Education, Identity & Social Life
7. Research, Myths & Practical Tools
8. AI, Future & Digital Life
9. Money & Economic Independence
10. Climate, Crisis & Global Life

The Urdu landing page contains 10 corresponding categories and 100 topic cards.

## Confirmed architectural gaps

1. Both landing pages currently render topic cards using `<details class="topic-card">` and `<summary>`; topic content expands inline rather than navigating to an independent article route.
2. The repository tree contains only the two Women landing-page files under `women/` and `ur/women/`; no dedicated Women article-page directories were found in this inventory.
3. The current sitemap includes the two Women landing pages but no dedicated Women topic article URLs.
4. The current card bodies are short overview/action/help snippets, not the full evidence-led article format required by the project brief.
5. The English category labels include potentially overlapping groupings: “Career & Money” and “Money & Economic Independence”. Preserve all topics, but review taxonomy and cross-category duplication before changing category structure.
6. Existing landing-page metadata, canonical URLs, reciprocal hreflang links, Open Graph tags and WebPage/BreadcrumbList JSON-LD are present and must be preserved or improved during migration.

## Implementation safeguards

- Do not delete or rename existing topic IDs, titles, cards or language relationships.
- Build a machine-readable bilingual topic inventory before generating article routes.
- Use stable topic IDs and explicit English/Urdu pair mappings; do not infer translations from slugs.
- Use reusable article templates and content data, but generate crawlable static HTML pages compatible with the current static hosting architecture.
- Keep high-risk health, mental-health, violence, legal and safeguarding content flagged for qualified review where needed.
- Never fabricate authors, medical reviewers, research references, dates, statistics or endorsements.
- Do not merge this branch into `main` or deploy until automated checks and review are complete.

## Phase 1 status

Repository access and write permission verified. A dedicated working branch was created from the recorded main commit. This audit records the baseline only; no production files have been changed and no deployment has been performed.
