#!/usr/bin/env python3
"""Refill the shared page parts in the eight hand-written top-level pages from .build/partials/.

Each page carries the parts INLINE between marker comments:

    <!-- bh:head -->   ... head-common.html ...  <!-- /bh:head -->
    <!-- bh:svg -->    ... svg.html ...          <!-- /bh:svg -->
    <!-- bh:header --> ... header.html ...       <!-- /bh:header -->
    <!-- bh:footer --> ... footer.html ...       <!-- /bh:footer -->

Everything outside the markers is left exactly as it is. A link that carried aria-current="page" inside
a block before the refill (the page's own nav link) carries it again after, matched by its href.

Usage (from the repo root):
    python3 .build/sync_partials.py          # rewrite the pages that are out of date
    python3 .build/sync_partials.py --check  # report only; exit 1 if any page is out of date

The generated pages (/web-design/, /guides/) do not use markers: build_areas.py and build_guides.py
read the same partials when they rebuild.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARTS = os.path.join(ROOT, ".build", "partials")
PAGES = ["index", "work", "about", "order", "website-transfers", "stuck-on-wix", "privacy", "review"]
BLOCKS = [("head", "head-common.html"), ("svg", "svg.html"), ("header", "header.html"), ("footer", "footer.html")]


def part(name):
    with open(os.path.join(PARTS, name), encoding="utf-8") as f:
        return f.read().strip("\n")


def current_hrefs(block):
    """hrefs of the links that are marked as the current page in this block."""
    out = set()
    for tag in re.findall(r"<a\b[^>]*>", block):
        if 'aria-current="page"' in tag:
            m = re.search(r'href="([^"]*)"', tag)
            if m:
                out.add(m.group(1))
    return out


def mark_current(block, hrefs):
    if not hrefs:
        return block

    def fix(m):
        tag = m.group(0)
        h = re.search(r'href="([^"]*)"', tag)
        if h and h.group(1) in hrefs and "aria-current" not in tag:
            return tag.replace(h.group(0), h.group(0) + ' aria-current="page"', 1)
        return tag

    return re.sub(r"<a\b[^>]*>", fix, block)


def sync(page, check):
    path = os.path.join(ROOT, page + ".html")
    with open(path, encoding="utf-8") as f:
        src = f.read()
    out = src
    for key, fname in BLOCKS:
        rx = re.compile(r"(<!-- bh:%s -->\n)(.*?)(\n<!-- /bh:%s -->)" % (key, key), re.S)
        found = rx.findall(out)
        if len(found) != 1:
            sys.exit("%s.html: expected one <!-- bh:%s --> block, found %d" % (page, key, len(found)))
        keep = current_hrefs(found[0][1])
        fresh = mark_current(part(fname), keep)
        out = rx.sub(lambda m: m.group(1) + fresh + m.group(3), out, count=1)
    if out == src:
        return False
    if not check:
        with open(path, "w", encoding="utf-8") as f:
            f.write(out)
    return True


def main():
    check = "--check" in sys.argv[1:]
    changed = [p for p in PAGES if sync(p, check)]
    if check:
        print("out of date: " + ", ".join(changed) if changed else "all pages in sync")
        sys.exit(1 if changed else 0)
    print("updated: " + ", ".join(changed) if changed else "nothing to do")


if __name__ == "__main__":
    main()
