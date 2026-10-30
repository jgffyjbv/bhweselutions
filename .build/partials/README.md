# Shared page parts (Doctrine B redesign, Oct 2026)

Every main page (index, work, about, order, website-transfers, stuck-on-wix, privacy, review) is plain HTML and carries
these parts INLINE (there is no build step for them). When one changes, change it on every page.
- head-common.html: theme colour, icons, fonts, /css/site.css?v=<stamp> (bump the stamp on every CSS change)
- svg.html: the BH mark + icon symbols, right after <body>
- header.html: header + small-screen nav (add aria-current="page" on the current page's link)
- footer.html: footer + the phone-only sticky bar
Styles: /css/site.css (tokens, components, the one motion motif). Page-only styles go in a small <style> on that page.
