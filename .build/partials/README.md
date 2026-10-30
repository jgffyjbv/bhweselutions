# Shared page parts (the owner's look on the new structure, Oct 30 2026)

The eight hand-written pages (index, work, about, order, website-transfers, stuck-on-wix, privacy, review) carry these
parts INLINE between marker comments, and `.build/sync_partials.py` refills them:

| part              | markers in each page                     | what it holds |
|-------------------|------------------------------------------|---------------|
| head-common.html  | `<!-- bh:head -->` … `<!-- /bh:head -->`     | theme colour (white), icons, Fraunces + Hanken Grotesk, `/css/site.css?v=<stamp>` |
| svg.html          | `<!-- bh:svg -->` … `<!-- /bh:svg -->`       | the BH mark in the logo colours `#bh-c` (gradient + green swoosh), the one-colour mark `#bh` (currentColor: white on bands, the stamps), `#i-phone`, `#i-chat`, `#i-wa` |
| header.html       | `<!-- bh:header -->` … `<!-- /bh:header -->` | the floating frosted pill (colour mark, 4 links, phone, green "Start my website") + the row of link pills shown below 981px |
| footer.html       | `<!-- bh:footer -->` … `<!-- /bh:footer -->` | deep-indigo footer, the phone-only sticky Call / WhatsApp / Start bar, the round WhatsApp button (desktop) |

Change a part here, then from the repo root:

    python3 .build/sync_partials.py           # rewrites the pages whose blocks are out of date
    python3 .build/sync_partials.py --check   # exit 1 if any page is out of date

Nothing outside the markers is touched. A nav link that carries `aria-current="page"` keeps it after the refill
(matched by its href), so mark the current page's link once in that page and the sync preserves it.

The generated pages read the same files when they are rebuilt: `.build/build_areas.py` (/web-design/) and
`.build/build_guides.py` (/guides/); they do not use the markers.

Bump the `?v=` stamp in head-common.html on every change to /css/site.css (now `20261030d`), then sync and rebuild.
Styles: /css/site.css (tokens, components, bands, motion). Page-only styles go in a small `<style>` on that page.
