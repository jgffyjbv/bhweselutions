#!/usr/bin/env python3
"""
Assemble the BH Web Solutions guides library.

Reads content fragments from .build/fragments/<slug>.html plus .build/manifest.json,
and emits fully-formed pages into guides/, a hub at guides/index.html, and a sitemap.

Deterministic on purpose: the writing is the model's job, the markup is not.
Run from the repo root:  python3 .build/build_guides.py
"""
import json
import os
import re
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRAG = os.path.join(ROOT, ".build", "fragments")
OUT = os.path.join(ROOT, "guides")
MANIFEST = os.path.join(ROOT, ".build", "manifest.json")
SITE = "https://bhwebs.com"
TODAY = date.today().isoformat()

PILLARS = {
    "law": {
        "label": "Law & compliance",
        "title": "What the law actually asks of your website",
        "blurb": "Accessibility, privacy, cookies, selling online, and marketing by email and text — "
                 "explained for the person who owns the business, not the person who wrote the statute.",
    },
    "heimish": {
        "label": "Heimish business web",
        "title": "Building for a heimish business",
        "blurb": "Yiddish and Hebrew on the web, kosher delivery zones, closing properly for Shabbos "
                 "and Yom Tov, and photographing what you sell. Things almost nobody has written down.",
    },
    "decisions": {
        "label": "Before you build",
        "title": "The decisions that come before the website",
        "blurb": "What to build on, what it should cost, and why speed quietly decides whether an "
                 "online store makes money.",
    },
}

NAV = """<nav class="gnav">
  <div class="in">
    <a href="/" class="brand" aria-label="BH Web Solutions home">
      <span class="brand__mark" aria-hidden="true">BH</span>
      <span class="brand__txt"><b>BH</b> Web Solutions</span>
    </a>
    <ul class="gnav__links">
      <li><a href="/#work">Work</a></li>
      <li><a href="/#services">Services</a></li>
      <li><a href="/guides/">Guides</a></li>
      <li><a href="/about.html">About</a></li>
      <li><a href="/order.html" class="btn btn--green">Order Now</a></li>
    </ul>
  </div>
</nav>"""

FOOT = """<footer class="gfoot">
  <div class="in">
    <div class="gfoot__grid">
      <div>
        <a href="/" class="brand">
          <span class="brand__mark" aria-hidden="true">BH</span>
          <span class="brand__txt"><b>BH</b> Web Solutions</span>
        </a>
        <p class="gfoot__about">Custom websites, online stores, and WordPress-to-static migrations —
          designed beautifully, built fast, and fully managed. In English and Yiddish.</p>
      </div>
      <div>
        <h5>Explore</h5>
        <a class="fl" href="/#work">Our work</a>
        <a class="fl" href="/#services">Services</a>
        <a class="fl" href="/guides/">Guides</a>
        <a class="fl" href="/about.html">About us</a>
      </div>
      <div>
        <h5>Get started</h5>
        <a class="fl" href="/order.html">Order now</a>
        <a class="fl" href="/#contact">Contact</a>
      </div>
      <div>
        <h5>Get in touch</h5>
        <a class="fl" href="tel:8455870531">845-587-0531</a>
        <a class="fl" href="mailto:info@bhwebsolutions.com">info@bhwebsolutions.com</a>
      </div>
    </div>
    <div class="gfoot__bottom">
      <span>&copy; 2026 BH Web Solutions. All rights reserved.</span>
      <span>Designed &amp; built by BH Web Solutions</span>
    </div>
  </div>
</footer>"""

CTA = """<section class="gcta">
  <div class="in">
    <h2>Want this handled properly?</h2>
    <p>We build websites and online stores for businesses that need them to actually work — in
      English and Yiddish. Tell us what you're trying to do and we'll tell you straight what it takes.</p>
    <div class="row">
      <a class="btn btn--green" href="/order.html">Start a project</a>
      <a class="btn btn--ghost" href="tel:8455870531">845-587-0531</a>
    </div>
  </div>
</section>"""


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def wrap_tables(html):
    """Wide tables must scroll inside their own container, never the page body."""
    return re.sub(r"(<table\b)", r'<div class="table-scroll">\1', html).replace(
        "</table>", "</table></div>")


def article_page(a, siblings):
    slug, title = a["slug"], a["title"]
    pil = PILLARS[a["pillar"]]
    body = wrap_tables(a["_body"])

    related = [s for s in siblings if s["slug"] != slug and s["pillar"] == a["pillar"]][:3]
    if len(related) < 3:
        related += [s for s in siblings
                    if s["slug"] != slug and s not in related][: 3 - len(related)]

    rcards = "\n".join(
        f'        <a class="rcard" href="/guides/{r["slug"]}.html">'
        f'<b>{esc(r["title"])}</b><span>{esc(r["metaDescription"])}</span></a>'
        for r in related)

    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": a["metaDescription"],
        "author": {"@type": "Organization", "name": "BH Web Solutions",
                   "url": SITE + "/"},
        "publisher": {"@type": "Organization", "name": "BH Web Solutions",
                      "url": SITE + "/"},
        "mainEntityOfPage": {"@type": "WebPage",
                             "@id": f"{SITE}/guides/{slug}.html"},
        "inLanguage": "en",
        "dateModified": TODAY,
    }

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)} — BH Web Solutions</title>
<meta name="description" content="{esc(a['metaDescription'])}">
<meta name="theme-color" content="#0b1c30">
<link rel="canonical" href="{SITE}/guides/{slug}.html">
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(a['metaDescription'])}">
<meta property="og:url" content="{SITE}/guides/{slug}.html">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap">
<link rel="stylesheet" href="/guides/guides.css">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{NAV}

<header class="ghead">
  <div class="in">
    <p class="crumb"><a href="/">Home</a> &rsaquo; <a href="/guides/">Guides</a> &rsaquo; {esc(pil['label'])}</p>
    <span class="pill">{esc(pil['label'])}</span>
    <h1>{esc(title)}</h1>
    <p class="lede">{esc(a['metaDescription'])}</p>
    <p class="meta">By BH Web Solutions &middot; Updated {TODAY}</p>
  </div>
</header>

<main id="main">
  <div class="in">
    <article class="prose">
{body}
    </article>
  </div>
</main>

{CTA}

<section class="related">
  <div class="in">
    <h2>Keep reading</h2>
    <div class="rgrid">
{rcards}
    </div>
  </div>
</section>

{FOOT}
</body>
</html>
"""


def hub_page(articles):
    sections = []
    for key, pil in PILLARS.items():
        items = [a for a in articles if a["pillar"] == key]
        if not items:
            continue
        cards = "\n".join(
            f'        <a class="hcard" href="/guides/{a["slug"]}.html">'
            f'<b>{esc(a["title"])}</b><span>{esc(a["metaDescription"])}</span>'
            f'<em>Read the guide &rarr;</em></a>'
            for a in items)
        sections.append(f"""    <div class="pillar__head">
      <h2>{esc(pil['title'])}</h2>
      <p>{esc(pil['blurb'])}</p>
    </div>
    <div class="hgrid">
{cards}
    </div>""")

    body = "\n".join(sections)
    schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Guides — BH Web Solutions",
        "description": "Practical guides on website law, building for heimish businesses, "
                       "and the decisions that come before a build.",
        "url": f"{SITE}/guides/",
        "hasPart": [{"@type": "Article", "headline": a["title"],
                     "url": f"{SITE}/guides/{a['slug']}.html"} for a in articles],
    }

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Guides — BH Web Solutions</title>
<meta name="description" content="Straight answers on website accessibility law, privacy, kosher e-commerce, Yiddish and Hebrew sites, what a website should cost, and why speed decides whether a store sells.">
<meta name="theme-color" content="#0b1c30">
<link rel="canonical" href="{SITE}/guides/">
<meta property="og:type" content="website">
<meta property="og:title" content="Guides — BH Web Solutions">
<meta property="og:url" content="{SITE}/guides/">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap">
<link rel="stylesheet" href="/guides/guides.css">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{NAV}

<header class="hubhead">
  <div class="in">
    <h1>Guides</h1>
    <p>Straight answers to the questions business owners actually ask us — about the law, about
      building for a heimish customer base, and about what any of it should cost. No jargon, no
      sales pitch.</p>
  </div>
</header>

<main id="main" class="pillar">
  <div class="in">
{body}
  </div>
</main>

{CTA}
{FOOT}
</body>
</html>
"""


def main():
    if not os.path.exists(MANIFEST):
        sys.exit(f"missing manifest: {MANIFEST}")
    articles = json.load(open(MANIFEST, encoding="utf-8"))

    missing = []
    for a in articles:
        p = os.path.join(FRAG, a["slug"] + ".html")
        if not os.path.exists(p):
            missing.append(a["slug"])
            continue
        a["_body"] = open(p, encoding="utf-8").read().strip()
    if missing:
        sys.exit("missing fragments: " + ", ".join(missing))

    os.makedirs(OUT, exist_ok=True)
    for a in articles:
        path = os.path.join(OUT, a["slug"] + ".html")
        open(path, "w", encoding="utf-8").write(article_page(a, articles))
        print(f"  wrote guides/{a['slug']}.html")

    open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(hub_page(articles))
    print("  wrote guides/index.html")

    # sitemap covering the marketing pages plus every guide
    urls = [("/", "weekly", "1.0"), ("/about.html", "yearly", "0.7"),
            ("/order.html", "monthly", "0.9"), ("/guides/", "weekly", "0.9")]
    urls += [(f"/guides/{a['slug']}.html", "monthly", "0.8") for a in articles]
    body = "\n".join(
        f"  <url>\n    <loc>{SITE}{u}</loc>\n    <lastmod>{TODAY}</lastmod>\n"
        f"    <changefreq>{c}</changefreq>\n    <priority>{p}</priority>\n  </url>"
        for u, c, p in urls)
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + body + "\n</urlset>\n")
    print("  wrote sitemap.xml")

    open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8").write(
        f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    print("  wrote robots.txt")

    print(f"\n{len(articles)} guides built.")


if __name__ == "__main__":
    main()
