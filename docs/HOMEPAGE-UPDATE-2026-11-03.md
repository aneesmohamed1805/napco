# Homepage banners and favicon — 3 November 2026

## User-authorised scope

Keep the approved architectural homepage banner and add two autoplaying banners: one about industries, one about innovation strategy. Use the newly supplied `icon.png` as the favicon. This approval is for the static review website, not the original live WordPress site, its store or DNS. The main NAPCO logo and original red focus device remain unchanged.

## Implementation choices

The homepage now contains three selectable HTML slides, not flattened poster images:

1. Existing Applications slide: **BIG IDEAS. SMALL DETAILS.**
2. Industries slide: **DIFFERENT INDUSTRIES. ONE PARTNER.** Material-junction imagery, linking to industrial solutions and construction.
3. Innovation slide: **MATERIAL SCIENCE. IN ACTION.** Conceptual pipette/material imagery, linking to innovation strategy and technical resources.

The exact new headlines and seven-second interval are implementation choices for review, not new brand standards. Supporting copy is grounded in the existing NAPCO industry coverage and innovation strategy. Sources: https://www.napcoadhesives.com/ and https://www.napcoadhesives.com/innovation/innovation-strategy/. The photographs are existing conceptual review assets; they are not evidence of actual NAPCO laboratory tests or customer installations.

Autoplay advances every seven seconds. Pause/play, previous/next and direct slide selection are available. Hover temporarily suspends playback. Keyboard focus or manual selection stops rotation until the visitor presses Play. Reduced-motion users start with rotation paused. Background tabs and an offscreen carousel suspend the timer. Mobile swipe is supported without blocking vertical scrolling. Without JavaScript the original first slide remains usable.

The original favicon is preserved byte-for-byte. Source SHA256: `9b1a74645cb6a1270733392857877e0a401cfd23e83d758b00b4c6cee8adce75`. Browser-sized 16, 32 and 48 pixel variants and a 180 pixel Apple touch icon retain its proportions and colours. A checked, encoded source bundle is expanded during the build, so the website serves normal PNG and ICO files without external dependencies. All 22 generated HTML documents, including the 404 page, receive favicon links.

## Verification completed locally

`npm test` passes: 21 routes, 1,155 local references and 94 image elements. Added tests verify three slides, one H1, seven-second interval, controls, preserved homepage content, favicon checksums and favicon links on all HTML pages. The 14 existing external links are inventoried, not retested by this static check.

Offline Chromium rendering of the actual built markup, CSS, scripts and images was checked at 320, 360, 390, 768, 1024, 1440 and 1920 pixel widths. At each width all three slides have the same carousel height, no horizontal page overflow, no overlapping controls, one active slide and two inert slides. All images decoded. Autoplay cycle, pause/resume, hover pause/resume, keyboard focus, arrow keys, manual selection, reduced motion, mobile swipe and no-JavaScript fallback passed. No JavaScript errors were reported.

These are local/offline layout and interaction tests, not a claim of hosted Cloudflare verification. GitHub validation must pass before merging. Cloudflare deployment status and the served website must be checked separately.

## Boundaries and rollback

The original build template, existing lower homepage sections, article data, store links, main logo and focus-device source files are unchanged. `npm run build` now runs a narrowly scoped post-build enhancement after the original generator. Preview/noindex safeguards remain active. No WordPress, DNS, production-domain or Performance Stimuli changes are included.

Rollback: revert this grouped change, or restore package.json and remove the enhancement module, carousel assets, favicon bundle and added test. The original single-banner generator remains intact.
