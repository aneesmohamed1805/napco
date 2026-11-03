# Focus-device scroll motion — 3 November 2026

Dated supplement to DECISIONS.md. User request: "lets make the focus icons everywhere parallax floating movement slightly on scroll".

## Approved scope and implementation

Apply subtle scroll-linked movement to every existing `img.focus-device` in the static review website. The shared script is included once in every generated HTML page, including the 404, and does no work on pages without focus devices. There are currently five focus markers: the Applications, Industries and Innovation hero slides, the technical-thinking band and the complex-assemblies band. Do not introduce new decorative markers into other content.

Implementation values for review: vertical translation capped at +/-10 CSS pixels on desktop and +/-5 pixels at widths up to 700 pixels. Geometry checks reduce the distance further when a marker is close to an image boundary. Movement eases toward the scroll position and stops when settled; there is no continuous idle bobbing. The original centring transform is preserved using an independent translate property. No scaling, rotation, recolouring, logo changes or image changes.

Respect reduced-motion preferences on initial load and when changed. Printing restores the original position. Hidden slides, offscreen markers and hidden browser tabs do not continue animating. The carousel's seven-second autoplay, pause/play controls and existing content are unchanged. The favicon, navigation icons, logo, photographs and text are excluded.

## Verification

- Node regression tests pass for the shared script on all 22 HTML pages; original centring, desktop/mobile bounds, idle shutdown, offscreen markers, hidden slides/tabs, print, live reduced-motion changes and static fallbacks.
- Offline Chromium tests against the downloaded current GitHub build plus the new script passed at 390 and 1440 pixels. Each of the five markers moved with scroll, remained inside its image and preserved its centring transform. No horizontal overflow was found.
- Additional offline checks passed for live reduced-motion changes, reduced-motion mobile initial load, print reset, settled positions, hidden slide resets, unchanged automatic banner rotation and the no-JavaScript fallback. No JavaScript errors were reported.
- These offline tests do not establish that the hosted Cloudflare site serves the change. GitHub validation and Cloudflare build status must be verified separately after merge.

## Boundaries and rollback

Only the separate static review repository is changed. Existing NAPCO WordPress/store, DNS, article content, scheduled social publishing and PS-Site are untouched. Preview/noindex protection remains. No third-party animation library or external runtime service was added.

Rollback: revert this pull request. Alternatively remove the focus-motion script tag from the enhancer; all markers return to their original static positions without affecting the carousel or favicon.
