# OBAID DOCTRINE Women Section — Initial Audit

Audit date: 2026-11-03  
Repository: https://github.com/ObaidDoctrine/ObaidDoctrine.github.io  
Live English page: https://www.obaiddoctrine.com/women/  
Live Urdu page: https://www.obaiddoctrine.com/ur/women/

## Verified inventory snapshot

| Item | English page | Urdu page |
|---|---:|---:|
| Existing topic cards | 100 | 100 |
| Category sections | 10 | 10 |
| HTML language | en | ur |
| Text direction | ltr | rtl |
| Page-level source-map section | 1 | 1 |
| Article-level numbered reference lists detected | 0 | 0 |
| Explicit reviewed/publication date fields detected | No | No |

Counts were derived from the two repository HTML files at audit time. The 100 cards are topic summaries within category accordions, not 100 standalone article pages. Counts do not establish that every claim is fully sourced or that the English and Urdu texts are semantically equivalent.

## Confirmed quality findings

1. The English and Urdu landing pages exist and declare their language and text direction correctly.
2. Both pages have canonical URLs and reciprocal hreflang links.
3. The pages provide a global source-map section, but the current markup does not provide per-topic inline numbered citations and a traceable article-specific reference list.
4. The English page has no explicit publication/review-date fields in its current markup.
5. Several English AI-related cards repeated the same wording in the “What to understand” and “Practical step” fields. The six affected cards (topics 71–76) were improved on this branch to give the practical-step field distinct, actionable guidance.
6. These pages are large, single-file HTML documents with embedded CSS and content. Any further edits should remain scoped and preserve existing URLs, design dependencies and unrelated site sections.
7. The current page's advertised “100-topic bilingual” description should not be interpreted as evidence that each card is a fully researched standalone article or that every topic has equivalent depth in both languages.

## Changes on this branch

- Updated the English practical guidance for topics 71–76: AI literacy, AI-related job transitions, women in STEM and AI, algorithmic hiring, AI privacy, and digital identity protection.
- No production deployment was performed.
- The Urdu file was not modified in this pass.
- No medical or legal claim is certified as independently reviewed by this audit.

## Required next work

- Build a full topic-by-topic inventory with titles, exact text, source requirements, bilingual parity and status.
- Add topic-specific source links only after opening and checking the actual source, publication date and relevance.
- Compare each English topic with its Urdu equivalent for substantive parity and medical/legal safety.
- Review all cards for duplicated or generic copy, then expand high-risk health, mental-health, abuse, safety and legal topics with jurisdiction-appropriate guidance.
- Verify every linked URL, source link, accessibility behaviour, mobile layout and relevant metadata in a real browser.
- Run the repository's actual build/check scripts after identifying the site's current workflow; this audit alone is not a build or runtime test.
- Deploy only after review and tests, then verify the production URLs.

## Status

This is an initial verified source audit plus a targeted content-quality correction. It is not a completion certificate for the Women section.
