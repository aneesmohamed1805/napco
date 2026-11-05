# NAPCO Articles → static-site handoff

## Confirmed publishing destination — 3 November 2026

The user has instructed the project **“napco adhesive Articles”** that NAPCO now has a static site in GitHub and that articles can be published there. This confirms the destination for that project's approved content; it does not create a new article schedule, automatically transfer manuscripts between projects, or authorise a production-domain launch.

| Item | Destination / rule |
| --- | --- |
| Repository | `aneesmohamed1805/napco` |
| Publishing branch | `main`, after review and successful validation |
| Article records | `content/articles/<approved-slug>.json` |
| Starting template | `content/articles/_template.json` |
| Featured images | `public/assets/articles/` |
| Archive | `/insights/` |
| Article page path | Use the approved `path` in each record; preserve existing published URLs when migrating |
| Site build and validation | `npm test` |
| Website rendering and layout | Owned by the NAPCO Website workflow; preserve the approved design |

Read the latest repository files before editing. Do not replace the repository with an older ZIP or overwrite unrelated changes. Article updates should normally change only their own JSON records and image assets. If the article needs features not supported by the current schema, coordinate a focused renderer change rather than deleting content or independently rewriting the website.

The repository has a connected Cloudflare build integration. A change merged into `main` triggers the connected build; report publication only after checking its result and the actual served article URL. The homepage's Insights cards and the archive are generated from the same article data during the build. A successful GitHub commit is not, by itself, proof that the hosted article is visible.

Keep the static website's existing review/noindex safeguards until a separate launch is approved. Publishing content into this review build is not a production-domain launch or a claim that it is search-indexable. Do not change DNS, the original NAPCO WordPress site/store, or the Performance Stimuli repository.

## Add an approved article

1. Copy `content/articles/_template.json` to an ordinary filename, for example `approved-article-slug.json`. Files beginning with `_` are ignored.
2. Replace the sample fields with the actual approved title, excerpt, category, publication date, path and article sections. Preserve an existing published URL when migrating an article; do not invent a replacement slug without a redirect plan. Check existing article IDs, paths and titles to avoid duplicate publication. Keep `sourceProject` as `napco adhesive Articles`.
3. Add its approved image under `public/assets/articles/` and set `image` to that root-relative path. Include descriptive `imageAlt`. Use local, committed assets rather than expiring media URLs.
4. Keep `status` as `draft` while reviewing. Set `status` to `published` only within the user's publishing authority. Run `npm test` and review the full page, metadata, image crop and links.
5. Commit the approved content and image to the NAPCO repository, preferably on a focused branch with a reviewed pull request. After the approved change reaches `main`, verify GitHub validation, the connected Cloudflare build and the served article, archive and homepage cards. Do not report success on the basis of a commit alone.

The internal format is a `body` array of sections, each with a `heading` and `paragraphs` array. Text is escaped rather than accepting arbitrary HTML. The present template does not support inline links, tables, footnotes or lists; extend its schema and renderer before migrating content that needs these elements. Do not silently discard source references or article structure. Do not assume extra JSON fields will be rendered without checking the generator.

## Image rule

Use the approved clean article format: 1920 × 1080, WebP around quality 70, with **no text, logo, focus icon or brackets**. It should express the actual topic. This rule differs from homepage imagery, which may have a separate original focus-device overlay. The existing archive card's small wood image is a temporary conceptual thumbnail, not a replacement for its original featured image.

## Dates and scheduling

Preserve the existing Articles project's approved calendar and publishing ownership. This handoff does not create, duplicate, cancel or reschedule any article, LinkedIn or social-media automation. The separate project **“napco adhesives social”** remains responsible for its own approved social workflow. Do not promote a review-only URL as the final public article URL without approval.

Use a full ISO date with timezone, such as `2026-11-03T09:00:00+04:00`. This is a format example, not a new approved publication time. Published records with a future date are excluded until a build occurs after that date. Merely reaching the date does **not** rebuild the static site. No scheduler, cron, deploy hook or recurring automation is established by this document. The Articles workflow must verify and use an authorised publishing trigger for any scheduled release; do not assume a future-dated JSON file will appear on its own.

## November boundaries

Until 30 November 2026 the agreed campaign emphasis remains approximately 70% positioning and 30% generic product functions, without SKU promotion. Product-specific December material needs the promised validated information; the date alone is not approval. Ground company, industry and application content in verified NAPCO sources and retain the established article evidence requirements.

## Content inventory at this handoff check

On 3 November 2026, `content/articles/` contained `_template.json` and `wood-floor-adhesives-2019.json`. The latter links to the historical article **“The Science Behind Wood Floor Adhesives,”** originally dated 12 November 2019. No new November manuscripts were imported by this documentation update. The Articles project can add its approved work using the contract above. This inventory is a dated observation, not a permanent restriction on future articles.

## WordPress staging sync — authorised 5 November 2026

The user has also authorised the Articles project to keep **https://dev-new-napco.pantheonsite.io/** in sync with each published programme article, including all already published programme articles. This is an additional destination alongside this static review site and the existing native NAPCO LinkedIn article workflow. It does not replace either workflow or authorise production launch. The linked NAPCO Website conversation is https://chatgpt.com/g/g-p-6ae8800de9c88191a33d358f10b875b7-napco-website/c/6ae880a5-7b60-83ed-b8e3-74538bb10ce6 .

### Shared ownership and coordination

- Articles owns approved copy, metadata, approved image creation and content synchronisation. Website owns WordPress layout, templates, homepage/archive presentation, navigation and final permalink architecture.
- Use this handoff and `docs/ARTICLE-REGISTER.md` as the durable coordination record between workflows. Read the latest versions before each write; preserve unrelated edits. No direct cross-conversation messaging mechanism is established by this document.
- Content updates must preserve the Website project's theme work, draft theme, pages, shop, settings, original banners and focus movement. Do not activate or overwrite a theme, rewrite permalinks, change DNS or remove noindex.
- Staging is a review destination. Never promote its URL as the production source or canonical URL on LinkedIn. The site currently reports `blog_public=0`, and the served article contains `noindex, nofollow`.

### Sync contract

1. Read the latest article JSON and register from `main`; sync only approved, published and date-eligible programme records. Exclude the historical 2019 wood-floor article. Existing editorial dates and November product restrictions continue.
2. Query WordPress posts across all statuses by exact slug/title and consult recorded IDs before creating anything. Reuse existing matches and preserve their editorial content structure; unknown write outcomes require readback before retry. Do not duplicate a post or media attachment.
3. Preserve exact title, full body and headings, excerpt, category, slug and publication instant. Use native editable Gutenberg blocks. Re-read the site's timezone and returned permalink; do not impose a new URL structure.
4. Reuse the exact approved featured image: 1920 × 1080 WebP, quality 70, text/logo/icon/bracket free, with its descriptive alt text. Search existing media first. WPVibe's current `upload_media` supports a server-side URL download and featured assignment using `post_id`; use that for the committed static image when needed. A new bridge is unnecessary where this native route succeeds.
5. Read back the post and featured attachment, then verify the served article and image. Record WordPress ID, returned URL, attachment ID, verification date and outstanding presentation items in the register. Keep destination failures pending independently; repairing staging must never duplicate an existing LinkedIn publication.
6. The existing hourly condition-watch task `6ae9839540988191b92a3df877cc105d` now covers staging sync as well as LinkedIn. No additional scheduler or new article-writing cadence was created.

### Current handoff for the Website project

NAP-001 already existed as **WordPress post 25**, category **3**, with featured attachment **23**. On 5 November 2026 the Articles workflow verified exact title, all seven headings and 22 paragraphs, excerpt and publication instant against current `main`; the attachment is 1920 × 1080 WebP with matching alt text and loads in the browser.

**Presentation item:** the current active staging template serves the full article but does not render its assigned featured image on the single-article page. The Website workflow should include the featured-image field in its finished article template. Articles has left the template and layout unchanged.

Current returned staging URL (re-read after future permalink work):
https://dev-new-napco.pantheonsite.io/2026/11/03/napco-adhesive-sealant-coating-expertise/
