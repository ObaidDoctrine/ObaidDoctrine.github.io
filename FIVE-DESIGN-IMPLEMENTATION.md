# Five-design sitewide preview implementation

## Scope
This is a preview-only change on `design/five-designs-sitewide-preview`. It does not change `main`, DNS, production deployment settings, sitemap URLs, canonical URLs, hreflang, robots directives, structured data, analytics IDs, or page copy.

## Design allocation
1. **Premium Editorial** — English home page, English article index, and English article detail template.
2. **Dark Luxury** — founder profile, portfolio, and about page.
3. **Swiss Minimal** — English and Urdu Mind Tests, Learning Lab, Start Here, Contact, Disclaimer, Privacy Policy, and Terms & Conditions.
4. **Warm Humanist** — Urdu-language pages, Relationships, Marriage & Family, and Just for Women.
5. **Knowledge Lab** — Psychology, Human Behaviour, Self-Improvement, Society & Life, and Research Insights.

## Implementation approach
- Reuse the current HTML content and existing shared stylesheet; add scoped design tokens/overrides rather than replacing page copy.
- Use a `data-design` body attribute for page clusters that need an explicit visual identity.
- Use `lang="ur"` for the warm humanist treatment, except Urdu Mind Tests, which explicitly opt into Swiss Minimal.
- Respect `prefers-reduced-motion` and keep layouts responsive.
- Existing preview concept files remain `noindex,nofollow`. Existing production-route pages retain their existing SEO metadata; verify on preview before considering a merge.

## Required preview QA before any production approval
- Confirm Vercel preview deployment is READY and inspect all five design clusters on desktop and mobile.
- Check English/Urdu navigation, RTL rendering, internal links, forms and Mind Test interactions.
- Compare page titles, meta descriptions, canonical, hreflang, robots, JSON-LD, sitemap and robots.txt against `main`.
- Confirm no content is removed, no links are redirected accidentally, no JS errors occur, and no page overflows horizontally at mobile widths.
- Do not merge this PR or trigger production deployment without the site owner's explicit approval.
