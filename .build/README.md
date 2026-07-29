# Guides build

The pages in `/guides/` are **generated**. Do not edit them by hand — the next build overwrites them.

- `fragments/<slug>.html` — the article content, as a semantic HTML fragment (no `<html>`, no
  styling, no classes except `callout` and `disclaimer`). **This is the source. Edit here.**
- `manifest.json` — slug, title, meta description, and pillar for each guide. Controls what appears
  on the hub and in what order.
- `build_guides.py` — wraps each fragment in the page shell (nav, footer, CTA, breadcrumbs,
  canonical, OpenGraph, schema.org Article) and writes `/guides/`, `sitemap.xml` and `robots.txt`.

To rebuild after editing a fragment, from the repo root:

    python3 .build/build_guides.py

Adding a guide: write `fragments/<slug>.html`, add an entry to `manifest.json` with a pillar of
`law`, `heimish`, or `decisions`, then rebuild.
