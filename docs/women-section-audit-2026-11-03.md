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
5. English cards 71–80 had several practical-step fields that repeated or paraphrased the preceding explanation instead of giving topic-specific actions. English practical guidance for topics 71–80 has now been revised; the corresponding Urdu guidance for topics 71–76 was also expanded. This is a targeted content pass, not a full bilingual semantic review.
6. These pages are large, single-file HTML documents with embedded CSS and content. Any further edits should remain scoped and preserve existing URLs, design dependencies and unrelated site sections.
7. The current page's advertised “100-topic bilingual” description should not be interpreted as evidence that each card is a fully researched standalone article or that every topic has equivalent depth in both languages.

## Changes on this branch

- Updated the English practical guidance for topics 71–80: AI literacy, AI-related job transitions, women in STEM and AI, algorithmic hiring, AI privacy, digital identity protection, misinformation/manipulated media, online learning credentials, digital creators, and responsible technology design.
- Expanded the corresponding Urdu practical guidance for topics 71–76 to better match the actionable depth of the English version.
- Reference-checking direction for this pass was informed by public guidance from UNESCO on media and information literacy, WHO on checking information and context, and FTC/FBI guidance on account security. These sources provide general safety guidance; they do not constitute topic-by-topic medical/legal validation of the page.
- Re-fetched both files after the edits and verified that each still contains 100 topic cards, 10 category sections, and three guidance fields per card. This structural check does not establish full semantic parity or runtime correctness.
- No production deployment was performed.
- No medical or legal claim is certified as independently reviewed by this audit.

## Public guidance consulted for this targeted pass

- UNESCO, Media and Information Literacy: https://www.unesco.org/en/articles/media-and-information-literacy
- UNESCO, Do you trust what you watch or read?: https://www.unesco.org/en/articles/do-you-trust-what-you-watch-or-read
- WHO, Let's flatten the infodemic curve: https://www.who.int/news-room/spotlight/let-s-flatten-the-infodemic-curve
- FTC, Use Two-Factor Authentication To Protect Your Accounts: https://consumer.ftc.gov/articles/use-two-factor-authentication-protect-your-accounts
- FBI, Stay Safe Online: Simple Tips for Adults: https://www.fbi.gov/how-we-can-help-you/online-safety/stay-safe-online-simple-tips-for-adults

These are general guidance sources used to shape the targeted advice, not citations for every individual statement and not a substitute for local Pakistan-specific legal guidance.

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
