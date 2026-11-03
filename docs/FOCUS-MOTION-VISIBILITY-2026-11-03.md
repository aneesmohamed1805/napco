# Focus motion visibility revision — 3 November 2026

## Approved change

The user requested more visible movement because the initial scroll effect was too subtle. This supersedes the initial 10px desktop / 5px mobile tuning documented in FOCUS-MOTION-2026-11-03.md; the original artwork and application-led positioning remain unchanged.

## Revised implementation

- Maximum vertical offset from the original position: 32px on desktop, 18px at viewport widths of 700px or less, subject to the existing image-edge constraints.
- Scroll response multiplied by 1.5 before clamping, so the movement is visible during an ordinary scroll rather than only near viewport edges.
- In the unclamped range, this gives 4.8 times the original desktop response and 5.4 times the original mobile response. Image-edge limits can reduce the actual motion.
- Existing 100ms easing, settling shutdown, hidden-slide/tab/offscreen handling, reduced-motion and printing behaviour are preserved. No continuous bobbing, rotation or scale animation.
- The motion script URL is versioned as 20261103-2 on every generated page to avoid reusing the previous script URL.

These numerical settings implement the requested stronger effect; they are not new permanent brand standards. All existing focus icons use the same shared script. Main logo, favicon, photographs, copy, layout and seven-second carousel timing remain unchanged.

## Tests

Local Node/VM tests of the actual updated motion script passed against the compiled site artifact: script inclusion on 22 HTML pages; visible response to a 150px scroll; desktop/mobile caps at six viewport widths; clipping protection for markers near the top and bottom image edges; resize; reduced-motion preference changes; printing; hidden slides/tabs; idle shutdown; original centring transform; and static fallback.

The representative 800px viewport / 400px scene simulation moves the icon 12px on desktop and 6.75px on mobile for a 150px scroll, compared with 2.5px and 1.25px under the prior settings. These are simulated geometry measurements, not a claim of visual verification on the hosted website.

The full build and regression suite must pass in GitHub before merging. Cloudflare build status and the served website are checked separately. No original NAPCO WordPress/store, DNS, main-domain or Performance Stimuli changes are included.

## Rollback

Revert the grouped pull request to restore the previous motion tuning, script URL and regression tests. Original artwork files are not modified by this revision.
