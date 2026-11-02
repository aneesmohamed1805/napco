# QA record — 2 November 2026

## Passed in this environment

- Dependency-free Node build: 21 pages plus a real 404 document.
- Static inspection: 1,061 local references checked, including links and assets; 90 image elements with alt attributes and dimensions; one H1 per page; title, description and preview noindex metadata present.
- Local Node HTTP server: 25 requests passed, comprising all 21 pages, selected CSS/JS/logo assets and an expected 404 for an unknown path.
- Chromium offline rendering: all 21 pages checked at 320, 390, 768 and 1440 CSS pixels, totalling 84 width checks. No horizontal document overflow, broken decoded images or JavaScript exceptions were reported.
- Eleven interaction checks passed: mobile menu opening, Escape closing the menu, desktop dropdown opening, Escape closing the dropdown, required form validation, valid input acceptance, email-draft URL construction, truthful form status, search match, search empty state and search reset.
- Homepage desktop and mobile screenshots inspected after scrolling and decoding the local images. Manufacturing crop was corrected to remove legacy baked-in lettering. The original focus device is layered independently above photographic fades.

## Test method and limits

Browser navigation to the local HTTP origin was blocked by the execution environment. Browser checks therefore loaded the same generated HTML/CSS/JS with embedded local image bytes; the HTTP routes were checked separately. This is not an end-to-end Cloudflare deployment test. Outbound `mailto:` navigation was stubbed during the form-handler test, so no email was sent and no external email application was exercised.

The full-page screenshots show the browser rendering, not a new AI mockup. The original supplied artwork remains unchanged. Some photographic sources are low-resolution review derivatives, particularly coatings and the archive thumbnail.

Fourteen distinct external links were inventoried. Public NAPCO content was reviewed during preparation, but this is not a complete network link crawl. Legal pages, the construction Finish destination, document access and external forms need live review.

No server email delivery, spam protection, Cloudflare headers/CSP, custom domain, DNS, Git push, scheduled publication, analytics or store checkout was configured or tested. No Lighthouse score, Core Web Vitals result or full WCAG compliance claim is made. Font identity/licensing and production imagery remain open.

## Re-run and records

`npm test` regenerates `docs/build-manifest.json` and `docs/static-check-results.json`.

Additional recorded checks:
- `browser-check-results.json` — offline browser and interaction results.
- `http-check-results.json` — local server statuses.

Repeat hosted QA after connecting the review repository to Cloudflare Pages and before public launch. Default noindex settings are not access control.
