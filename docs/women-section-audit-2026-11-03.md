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


## Follow-up pass: topics 91–100

- Reviewed the English and Urdu cards numbered 91–100. Urdu practical guidance was already topic-specific; English practical-step paragraphs repeated the preceding explanation in several cards.
- Rewrote all three English guidance fields for topics 91–100 to distinguish context, practical actions and escalation/support. Topics include climate-related livelihoods, disaster preparedness, displacement, water and resource security, food security, humanitarian crises, recruitment fraud, urban safety, crisis misinformation and data literacy.
- Guidance was informed by UN Women, UNDRR, UNHCR and UNDP Pakistan public resources. These general references do not constitute legal advice or topic-by-topic independent certification.
- Re-fetched both pages after the edit. Structural checks: 100 cards and 10 category sections in each language; English remains `lang=en`/`dir=ltr`; Urdu remains `lang=ur`/`dir=rtl`; each card retains three labelled guidance paragraphs.
- This pass does not complete the full bilingual semantic audit, does not add per-topic citations, and does not constitute browser/runtime testing. No production deployment was performed.


## Follow-up pass: topics 81–90

- Corrected English topics 81–90, replacing repeated or misplaced guidance with distinct topic-specific explanation, practical steps and support/escalation guidance.
- Topics covered: salary negotiation, pay transparency, credit and debt, banking/payment fraud, investing, pensions, property/inheritance awareness, remittances, tax/self-employment and funding women-led businesses.
- Used the existing Urdu topic guidance as a bilingual meaning and coverage reference; the Urdu text itself was not changed in this pass.
- Re-fetched both pages after the update. Verified 100 topic cards and 10 category sections in each language, correct English/Urdu language-direction declarations, and three labelled guidance paragraphs in each of topics 81–90.
- This remains an editorial consistency pass, not independent financial/legal advice certification, full source verification or a complete semantic parity audit. No production deployment was performed.

## Follow-up pass: trusted source-map expansion

- Expanded the visible source map on both English and Urdu pages with five additional direct resources: UN Statistics Division Minimum Set of Gender Indicators; UNESCO women-and-girls research/publications; Pakistan's National Strategy to Counter Technology-Facilitated Gender-Based Violence (published 16 April 2026); UN Women Data Hub publications; and United Nations Pakistan publications.
- Opened and checked the source pages before adding them. The Pakistan strategy page identifies the Government of Pakistan Ministry of Human Rights and UNDP as developers and describes prevention, protection, redress and institutional coordination. UNESCO's resource page covers education, science/technology and gender-based violence; UN Statistics Division documents indicator themes and metadata; UN Women Data Hub lists research publications; UN Pakistan provides country publications.
- The new links improve discovery and source relevance but are not yet attached to individual claims/cards. A page-level source map must not be represented as per-topic citation coverage.
- English and Urdu source-map additions use the same five URLs; only link labels are translated. No statistics were copied into topic cards during this pass.
- Structural re-fetch and link-list parity check remain required after the update. No production deployment was performed.

## Bilingual parity pass — topics 11, 12, 13, 15 and 20 (3 November 2026)

Compared the English and Urdu guidance for the first 20 topics. Updated Urdu topics 11, 12, 13, 15 and 20 to restore material points present in the English versions: career and structural constraints after marriage; caregiving/childbirth/illness-related career breaks; boundaries without undermining legitimate teamwork; unequal access to visibility and advancement in remote work; and unequal access to business finance/support plus basic unit-cost/revenue planning. Re-fetched the Urdu page after the edit and verified 100 topic cards remain and each of the five edited cards still contains exactly three labelled guidance paragraphs. This is a focused semantic-parity correction, not certification of all 100 bilingual pairs.


## Bilingual parity pass — topics 21–40 (3 November 2026)

Compared English and Urdu guidance for topics 21–40. Corrected Urdu topics 26–30, 32–35 and 40 to better preserve the English page's relevant distinctions and safety guidance. The corrections cover family expectations and coercion; unequal caregiving effects on paid work, education and rest; clear boundaries and safe responses to retaliation; adolescent autonomy, privacy and safeguarding warning signs; integrated postnatal physical/mental/social care and urgent warning signs; commercial/edited beauty standards; social-feed comparison triggers and help-seeking; filters and appearance-related distress; sponsored influencer claims versus evidence; and early recognition/referral for eating concerns. Re-fetched the Urdu page after edits: 100 cards remain, and every edited card has exactly three labelled guidance paragraphs. This is a targeted semantic-parity pass, not a complete review of every topic or clinical validation.

Research grounding checked during this pass: WHO women's health overview; WHO postnatal care recommendations for women and newborns; WHO adolescent mental health fact sheet (including eating disorders); and WHO violence-against-women guidance. These sources support the health/safeguarding context but do not constitute topic-by-topic citations or local clinical/legal review.


## Bilingual parity pass — topics 41–60 (3 November 2026)

Compared English and Urdu guidance for topics 41–60. Corrected Urdu topics 41, 42, 43, 46, 47, 48, 49 and 50 to preserve jurisdictional caveats and survivor-centred safety details: verify current local law rather than treating global standards as local legal advice; recognize coercive/economic abuse and prioritize safety over confronting an abusive person; account for workplace, education, public and online harassment and retaliation; clarify privacy/data rights and platform controls; distinguish specific, informed consent from blanket permission; recognize that leaving can sometimes increase danger and safety planning is not a guarantee; avoid evidence collection that increases risk; and verify local support-service contacts and suitability. Re-fetched the Urdu page after editing and confirmed 100 topic cards remain and each of the eight edited cards has exactly three labelled guidance paragraphs.

Research checked for this pass: WHO's 18 June 2026 violence-against-women fact sheet (including health consequences and survivor-centred health-sector response); UNFPA gender-based violence guidance; UNFPA Pakistan's GBV overview; UN Women Data Hub's Pakistan country profile; and the UNDP/NCSW report on digitalisation and women in Pakistan. The UNFPA Pakistan profile's figures are based on PDHS 2017–18 and should not be represented as current prevalence. No Pakistan-specific legal advice or local referral directory was validated in this pass.


## Bilingual parity and escalation pass — topics 61–80 (3 November 2026)

- Compared English and Urdu topic cards 61–80. Topics 61–70 were semantically aligned at the level of their three guidance fields; no copy changes were necessary in this range.
- For topics 71–80, refined the English and Urdu “When to seek help” fields so they describe appropriate escalation rather than repeating the practical-step checklist. Topics include AI literacy, AI-related job transitions, women in STEM, algorithmic hiring, AI privacy, identity misuse, manipulated media, online credentials, creator rights/safety and responsible technology design.
- Expanded Urdu practical guidance for topics 77–80 to match the English depth: checking original sources and corroboration for manipulated media; checking course assessment, recognition, cost and refund terms; preserving creator files, permissions, account security and conservative income assumptions; and checking representation, group-level outcomes, accessibility, privacy and appeal routes in technology systems.
- Added matching English/Urdu source-map links to the ILO's 2026 research brief on generative AI, occupational segregation and gender equality, and UNESCO's AI competency framework for students. These are broad source-map references, not citations attached to each individual claim.
- Research checked: ILO's 5 March 2026 brief explains that exposure to GenAI is not equivalent to job loss and that impacts vary by occupation and gender; UNESCO's framework emphasizes human-centred judgement, AI ethics, AI techniques and inclusive system design. The page avoids presenting global estimates as Pakistan-specific forecasts.
- Re-fetched both HTML files after edits. Verified 100 topic cards and 10 category sections per language, en/ltr and ur/rtl declarations, three labelled guidance paragraphs in every card, and presence of the two added source links in both languages.
- This pass does not constitute topic-by-topic citation coverage, independent legal/clinical review, browser/runtime testing or production deployment.


## Final bilingual parity pass — topics 81–100 (4 November 2026)

- Compared English and Urdu cards 81–100. Updated the Urdu practical-step and help-seeking guidance across all 20 cards to preserve the English version's decision points, cautions and escalation pathways while keeping Pakistan-specific legal/tax conclusions unasserted.
- Topics 81–90: salary negotiation and pay transparency; full borrowing costs and variable terms; fraud response and bank complaint routes; investment risk, authorisation and fees; pension contribution/eligibility checks; jurisdiction-specific property and inheritance caveats; remittance exchange-rate and fee comparisons; current official tax guidance; and due diligence before business financing or ownership agreements.
- Topics 91–100: locally relevant climate hazards and livelihood impacts; inclusive household emergency planning; verification of routes, accommodation and protection in displacement; official water-quality advice; food availability, affordability, nutrition and verified assistance; safe access to humanitarian services; recruiter/employer and visa verification; inclusive urban-safety reporting; verification of emergency misinformation; and statistical methodology, uncertainty and comparability.
- Added matching official/source resources to both language pages: State Bank of Pakistan Consumer Protection and complaint resolution; SBP women’s financial inclusion and entrepreneur finance; NDMA Pakistan publications on vulnerable groups in disasters; and UNHCR's Pakistan Forced Displacement Survey 2024. These are page-level discovery links, not citations attached to every card-level claim.
- Source review confirmed SBP describes bank-first complaint handling and subsequent Banking Mohtasib/SBP routes, and publishes women-focused financial inclusion measures. NDMA's current publication index includes national guidance for vulnerable groups in disasters. UNHCR's Pakistan 2024 survey covers displaced households' access to basic services and food security. Do not treat these sources as a substitute for current tax, provincial property/inheritance or employment-law advice.
- Re-fetched both language pages after edits. Structural checks confirmed 100 cards and 10 category sections per language; correct en/ltr and ur/rtl declarations; exactly three labelled guidance paragraphs in every card; and presence of all four new source URLs on both pages.
- This completes the editorial bilingual comparison of the 100 topic cards at the current landing-page level. It does not complete topic-by-topic citation coverage, independent clinical/legal/financial review, verification of every link, browser/accessibility/runtime/build QA, or production deployment.


### Final QA correction note — topics 81–100

During the final re-fetch, a field-order regression was detected in the first edit of the Urdu cards: help-seeking text had been inserted into the explanation field. This was corrected before considering the pass complete. The original Urdu explanation paragraphs were restored from the pre-edit committed version, the revised practical-step text was retained in the second field, and the help-seeking guidance was placed only in the third field. The corrected Urdu page was fetched again and checked card-by-card for the three expected labels and non-empty fields. The English and Urdu source links were also moved inside their respective source-map containers. Final structural verification passed after these corrections. This correction note is retained for audit transparency.
