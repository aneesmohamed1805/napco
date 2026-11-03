# Dated decision log — static build

2 November 2026. Supplement to the original NAPCO Decision Register; this file does not replace it.

| Decision | Status | Implementation |
| --- | --- | --- |
| Use first combined full homepage as the design basis | User approved | Tall architectural hero; product-family cards; expertise; technical and automotive bands; industries; resources; Insights; enquiry and footer |
| Build a separate static site for GitHub and Cloudflare Pages first | User approved | Dependency-free Node build produces static HTML, CSS and JS |
| Develop WordPress later after confirming the site | User approved | No WordPress changes, theme activation or connection required |
| Refer to current NAPCO website and Articles/Social work | User requested | Public NAPCO source routes mapped; approved brand sources used; newer article files not available in retrieval |
| Preserve existing live website and store | Scope safeguard | External links retained; no deployment or DNS change |
| Use original logo, original focus device and red/charcoal/grey/white | Existing approved rules | Original masters unchanged; display crop recorded in asset manifest |
| System Arial fallback and current responsive CSS sizes | Provisional implementation | Actual live font family and licence still unverified |
| Derived conceptual photo crops | Review assets, not final masters | Replace low-resolution crops before public launch; no installation or performance evidence implied |
| Contact as email-draft helper for review | Temporary implementation, not approval of final form workflow | Explicit disclosure; no server email delivery |
| New article JSON contract | Proposed handoff | No cross-project synchronization, recurring schedule or social publishing created |

No new tagline, performance guarantee, certification, customer case, date claim or SKU was approved by this work. No scheduled social posts were changed. The user subsequently supplied `aneesmohamed1805/napco` and enabled repository access on 2 November 2026. The approved static package is being imported to that separate repository. No Cloudflare deployment or main-domain change is authorised by this repository import.

## Repository handoff — 2 November 2026

User-authorised destination: `aneesmohamed1805/napco`, branch `main`. Keep `PS-Site` untouched. Import the prepared source and original asset bytes, retain preview/noindex defaults, and run validation before treating the repository as ready for Cloudflare Pages. The website remains a review build.

## Homepage extension — 3 November 2026

User instruction: add two more autoplaying homepage banners, one on industries and one on innovation strategy, and use the attached `icon.png` as the favicon. Retain the existing first banner and lower homepage sections. This request approves the topics, rotation and supplied favicon; it does not approve a replacement main logo or a new focus device.

Implemented on a separate working branch with build checks: three slides, pause/play and navigation controls, reduced-motion support, mobile swipe, and favicon variants across the generated website. Exact new headlines and a seven-second rotation are implementation choices for review. The original favicon bytes, main logo and focus-device masters are preserved. See `HOMEPAGE-UPDATE-2026-11-03.md` for source grounding, test scope and rollback. No original live-site, store, DNS or other-repository changes are part of this update.
