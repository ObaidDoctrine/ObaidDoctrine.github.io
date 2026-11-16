# OBAID DOCTRINE Life Hacks A–Z — Editorial Production Standard

**Project:** 200 topics × English and Urdu = 400 planned article versions  
**Audience:** General readers seeking practical, safe, evidence-informed everyday guidance  
**Status:** Editorial standard; not a claim that any article has been researched, reviewed, or published.

## 1. Publication gate

A topic in `topics.json` is an editorial assignment only. It must not be treated as a published URL or added to the sitemap until both language versions are complete, reviewed, and deployed.

Every article must pass all of these gates:

1. Topic fit: directly answers the assigned topic and adds a distinct reader benefit.
2. Evidence: factual, scientific, health, financial, legal, safety, or technical claims are checked against reliable primary or authoritative sources.
3. Originality: independently written; no spun, copied, or near-duplicate passages.
4. Practicality: steps are specific, realistic, contextual, and include limitations where needed.
5. Bilingual quality: English and Urdu are equivalent in meaning and usefulness, not literal machine translations.
6. Safety: no diagnosis, guaranteed outcome, dangerous shortcut, or unsupported treatment claim.
7. Technical QA: metadata, canonical, hreflang, structured data, internal links, accessibility, and mobile rendering are checked.
8. Editorial approval: reviewer name/role and review date are recorded before publication.

## 2. Required article structure

Use this structure where it fits the topic; do not pad an article to meet a word count.

- One clear H1 matching the reader's task.
- A concise introduction that states the problem and what the reader will learn.
- A short answer or key takeaway near the top.
- Context: explain when the technique is useful and when it may not be.
- Practical steps in a numbered sequence.
- A realistic example or scenario.
- Common mistakes and how to avoid them.
- Limitations, risks, or when to seek qualified help, where relevant.
- A short conclusion with one actionable next step.
- References for substantive factual claims.

## 3. Evidence and source rules

Prefer sources in this order:

1. Peer-reviewed systematic reviews, meta-analyses, and well-designed primary research.
2. Official public-health, government, university, standards-body, or professional-association guidance.
3. Original documentation from the relevant product or service for technical instructions.
4. Reputable specialist sources for practical context, clearly distinguished from research evidence.

For each substantive claim, record the source URL, publisher, publication/update date where available, access date, and the exact claim it supports in the editorial research notes.

Do not:
- invent citations, statistics, study findings, expert quotations, or publication dates;
- describe correlation as proof of causation;
- turn one study into a universal rule;
- imply that a popular psychology label is a clinical diagnosis;
- cite search snippets instead of checking the source itself;
- use affiliate or promotional claims as neutral evidence.

If evidence is mixed or limited, say so plainly and narrow the claim.

## 4. Health, psychology, finance, safety, and legal topics

- Distinguish general education from professional advice.
- Never diagnose a reader or tell them to stop prescribed treatment.
- Do not promise that a habit, exercise, food, or technique will cure a condition.
- Include practical risk warnings and appropriate professional/emergency referral guidance when the topic requires it.
- Financial content must avoid guaranteed returns and must explain assumptions, fees, risks, and local variation.
- Legal and travel guidance must identify jurisdiction and date sensitivity; do not present one country's rules as universal.
- Safety instructions must be conservative and based on authoritative guidance.

## 5. English and Urdu language standard

English:
- Use plain international English, short paragraphs, descriptive headings, and explain specialist terms on first use.
- Avoid clickbait, exaggerated promises, and keyword stuffing.

Urdu:
- Write natural, fluent Urdu in right-to-left direction.
- Prefer familiar Urdu phrasing; retain a technical English term in parentheses only when it improves understanding.
- Avoid awkward word-for-word translation and unnecessary Roman Urdu.
- Keep examples culturally understandable without assuming every reader shares the same family, income, education, or location.
- Ensure punctuation, lists, numbers, and mixed Urdu/English terms render correctly on mobile.

Both versions must preserve the same evidence, cautions, steps, and reader outcome. Adapt phrasing and examples naturally rather than translating mechanically.

## 6. SEO and technical requirements

Before publication, verify:
- one unique, descriptive title tag and meta description per language;
- one self-referencing canonical URL per language;
- reciprocal `hreflang="en"` and `hreflang="ur"` links plus `x-default` where appropriate;
- matching language and direction attributes (`lang="ur" dir="rtl"` for Urdu);
- one clear H1 and a logical heading hierarchy;
- meaningful internal links to relevant OBAID DOCTRINE resources;
- no links to unpublished or nonexistent pages;
- accurate Article/BlogPosting structured data only when its fields are true;
- useful image alt text and optimized media;
- no placeholder text, fabricated author/reviewer credentials, or misleading dates.

Do not add planned article URLs to the XML sitemap until the corresponding pages return a successful public response and have been checked.

## 7. Editorial record for every article

Maintain these fields in the production tracker:

- topic ID and category;
- English and Urdu URLs;
- working title and final approved title in both languages;
- primary reader question and search intent;
- unique angle and overlap check against existing articles;
- research sources and claim-to-source notes;
- author and reviewer;
- evidence/safety review status;
- English and Urdu language QA status;
- SEO/accessibility/technical QA status;
- publication date and last-reviewed date;
- deployment URL and live verification result.

## 8. Definition of done

An article is **ready to publish** only when every required editorial and technical gate is passed in both languages. It is **published** only after deployment and live URL verification. A green CI check validates only the checks implemented in that workflow; it does not replace fact-checking, expert review, or live production verification.

## 9. Editorial checklist

- [ ] The article answers one clear, distinct reader question.
- [ ] No substantial overlap with another Life Hacks article.
- [ ] Every material factual claim has been verified against its source.
- [ ] Practical steps are safe, specific, and realistic.
- [ ] Limits, exceptions, and risks are disclosed.
- [ ] English is original and proofread.
- [ ] Urdu is natural, accurate, and proofread.
- [ ] Both versions communicate equivalent guidance.
- [ ] SEO, canonical, hreflang, structured data, and internal links are checked.
- [ ] Mobile, accessibility, and RTL rendering are checked.
- [ ] Sitemap inclusion waits until live verification.
- [ ] Reviewer approval and review date are recorded.
