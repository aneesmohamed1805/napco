# NAPCO Articles → static-site handoff

Status: proposed integration contract for the existing “napco adhesive Articles” workflow. No automatic connection or publishing schedule has been established. Do not duplicate the separate social campaign.

## Add an approved article

1. Copy `content/articles/_template.json` to an ordinary filename, for example `approved-article-slug.json`. Files beginning with `_` are ignored.
2. Replace the sample fields with the actual approved title, excerpt, category, publication date, path and article sections. Preserve an existing published URL when migrating an article; do not invent a replacement slug without a redirect plan.
3. Add its approved image under `public/assets/articles/` and set `image` to that root-relative path. Include descriptive `imageAlt`.
4. Keep `status` as `draft` while reviewing. Set `status` to `published` only when authorized. Run `npm test` and review the full page.
5. Commit the approved content and image to the NAPCO repository. After Git integration is configured, a new build updates the archive and homepage cards from the same data.

The internal format is a `body` array of sections, each with a `heading` and `paragraphs` array. Text is escaped rather than accepting arbitrary HTML. The present template does not support inline links, tables, footnotes or lists; extend its schema and renderer before migrating content that needs these elements. Do not silently discard source references or article structure.

## Image rule

Use the approved clean article format: 1920 × 1080, WebP around quality 70, with **no text, logo, focus icon or brackets**. It should express the actual topic. This rule differs from homepage imagery, which may have a separate original focus-device overlay. The existing archive card's small wood image is a temporary conceptual thumbnail, not a replacement for its original featured image.

## Dates and scheduling

Use a full ISO date with timezone, such as `2026-11-02T09:00:00+04:00`. Published records with a future date are excluded until a build occurs after that date. Merely reaching the date does **not** rebuild the static site. No scheduler, cron, deploy hook or recurring automation is included. Plan and authorize that separately if scheduled publication is required.

## November boundaries

Until 30 November 2026 the agreed campaign emphasis remains approximately 70% positioning and 30% generic product functions, without SKU promotion. Product-specific December material needs the promised validated information; the date alone is not approval.

The current bundle contains only a verified external link to the historical article “The Science Behind Wood Floor Adhesives,” originally dated 12 November 2019. New November copy was not retrieved and has not been fabricated or backdated.
