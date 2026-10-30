#!/usr/bin/env python3
"""
Assemble the BH Web Solutions guides library.

Reads content fragments from .build/fragments/<slug>.html plus .build/manifest.json,
and emits fully-formed pages into guides/ and a hub at guides/index.html.

Deterministic on purpose: the writing is the model's job, the markup is not.
Run from the repo root:  python3 .build/build_guides.py

Dates: a guide keeps the date already on its page unless its words changed (title, description
or article text). Only a guide whose content changed gets today's date. Shell-only rebuilds
(header, footer, styles) therefore never move a date.

Shell: the page parts are read from .build/partials/ (the same header, footer, icons and <head>
lines every main page carries), so a rebuild picks up the current site chrome.

sitemap.xml is edited in place: only the guide entries' <lastmod> follow the guide dates, a new
guide gets an entry; every other entry (and robots.txt, if present) is left exactly as it is.
"""
import html as htmlmod
import json
import os
import re
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRAG = os.path.join(ROOT, ".build", "fragments")
PARTS = os.path.join(ROOT, ".build", "partials")
OUT = os.path.join(ROOT, "guides")
MANIFEST = os.path.join(ROOT, ".build", "manifest.json")
SITE = "https://bhwebs.com"
TODAY = date.today().isoformat()
CSS_VER = "20261030a"  # bump when guides/guides.css changes

PILLARS = {
    "law": {
        "label": "Law & compliance",
        "title": "What the law actually asks of your website",
        "accent": "actually",
        "blurb": "Accessibility, privacy, cookies, selling online, and marketing by email and text — "
                 "explained for the person who owns the business, not the person who wrote the statute.",
    },
    "heimish": {
        "label": "Heimish business web",
        "title": "Building for a heimish business",
        "accent": "heimish",
        "blurb": "Yiddish and Hebrew on the web, kosher delivery zones, closing properly for Shabbos "
                 "and Yom Tov, and photographing what you sell. Things almost nobody has written down.",
    },
    "decisions": {
        "label": "Before you build",
        "title": "The decisions that come before the website",
        "accent": "before",
        "blurb": "What to build on, what it should cost, and why speed quietly decides whether an "
                 "online store makes money.",
    },
}


def part(name):
    return open(os.path.join(PARTS, name), encoding="utf-8").read().strip()


HEAD = part("head-common.html") + \
    f'\n<link rel="stylesheet" href="/guides/guides.css?v={CSS_VER}">'
SVG = part("svg.html")
NAV = part("header.html")
FOOT = part("footer.html")

OG_IMAGE = f"""<meta property="og:image" content="{SITE}/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">"""

CTA = """<section class="call gcall" aria-labelledby="cta-h">
  <div class="wrap">
    <div class="rh"><span>Start</span><span>Brooklyn, NY · and beyond</span></div>
    <h2 id="cta-h">Want this handled <em>properly?</em></h2>
    <div class="call-grid">
      <div class="call-l">
        <p class="call-sub">We build websites and online stores for businesses that need them to actually work — in
          English and Yiddish. Tell us what you're trying to do and we'll tell you straight what it takes.</p>
      </div>
      <div class="call-r">
        <p class="gcall-go"><a class="btn btn-lg" href="/order">Start a project<span class="ar" aria-hidden="true">→</span></a></p>
        <ul class="contact">
          <li><small>Call or text</small><a href="tel:8455766607">(845) 576-6607</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>"""


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def accent(pil):
    """The pillar heading with its one accent word in <em> (gradient text); the words are unchanged."""
    t = esc(pil["title"])
    w = pil.get("accent")
    return t.replace(w, f"<em>{w}</em>", 1) if w and w in t else t


def wrap_tables(html):
    """Wide tables must scroll inside their own container, never the page body."""
    return re.sub(r"(<table\b)", r'<div class="table-scroll">\1', html).replace(
        "</table>", "</table></div>")


def words(html):
    """The readable text of a piece of HTML: tags dropped, entities decoded, spaces collapsed."""
    return " ".join(htmlmod.unescape(re.sub(r"<[^>]+>", " ", html)).split())


def guide_date(a, body):
    """Keep the date on the existing page unless the guide's words changed."""
    path = os.path.join(OUT, a["slug"] + ".html")
    if not os.path.exists(path):
        return TODAY, "new"
    old = open(path, encoding="utf-8").read()
    d = re.search(r'"dateModified": "(\d{4}-\d{2}-\d{2})"', old)
    art = re.search(r'<article class="prose">(.*?)</article>', old, re.S)
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", old, re.S)
    desc = re.search(r'<meta name="description" content="([^"]*)"', old)
    if not (d and art and h1 and desc):
        return TODAY, "unreadable old page"
    if words(art.group(1)) != words(body):
        return TODAY, "article text changed"
    if words(h1.group(1)) != words(esc(a["title"])):
        return TODAY, "title changed"
    if htmlmod.unescape(desc.group(1)) != a["metaDescription"]:
        return TODAY, "description changed"
    return d.group(1), "kept"


def glist(items, read_label):
    rows = []
    for i, r in enumerate(items, 1):
        rows.append(
            f'      <li><a href="/guides/{r["slug"]}"><span class="n">{i:02d}</span>'
            f'<span class="gtx"><span class="nm">{esc(r["title"])}</span>'
            f'<span class="gd">{esc(r["metaDescription"])}</span></span>'
            f'<span class="tr">{read_label}<span class="ar" aria-hidden="true">→</span></span></a></li>')
    return "\n".join(rows)


def article_page(a, siblings, updated):
    slug, title = a["slug"], a["title"]
    pil = PILLARS[a["pillar"]]
    body = wrap_tables(a["_body"])

    related = [s for s in siblings if s["slug"] != slug and s["pillar"] == a["pillar"]][:3]
    if len(related) < 3:
        related += [s for s in siblings
                    if s["slug"] != slug and s not in related][: 3 - len(related)]

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
                             "@id": f"{SITE}/guides/{slug}"},
        "inLanguage": "en",
        "dateModified": updated,
    }

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)} — BH Web Solutions</title>
<meta name="description" content="{esc(a['metaDescription'])}">
<link rel="canonical" href="{SITE}/guides/{slug}">
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(a['metaDescription'])}">
<meta property="og:url" content="{SITE}/guides/{slug}">
{OG_IMAGE}
<meta name="twitter:card" content="summary_large_image">
{HEAD}
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{SVG}

{NAV}

<main id="main">

<section class="phead ghead" aria-labelledby="h1">
  <div class="wrap">
    <p class="crumbs"><a href="/">Home</a> / <a href="/guides/">Guides</a> / {esc(pil['label'])}</p>
    <h1 id="h1">{esc(title)}</h1>
    <p class="lede">{esc(a['metaDescription'])}</p>
  </div>
</section>

<div class="gbody">
  <div class="wrap gcols">
    <aside class="gside g-{a['pillar']}" aria-label="About this guide">
      <p class="gk">{esc(pil['label'])}</p>
      <p class="gmeta"><span>By BH Web Solutions</span><span class="dot"> · </span><span>Updated {updated}</span></p>
      <p class="gall"><a class="tlink" href="/guides/">All guides<span class="ar" aria-hidden="true">→</span></a></p>
      <p class="ggo"><a class="btn" href="/order">Start my website<span class="ar" aria-hidden="true">→</span></a></p>
    </aside>
    <article class="prose">
{body}
    </article>
  </div>
</div>

<section class="sec tight grel" aria-labelledby="rel-h">
  <div class="wrap">
    <div class="rh"><span>Guides</span></div>
    <div class="sec-head">
      <h2 id="rel-h">Keep <em>reading.</em></h2>
      <a class="sec-more" href="/guides/">All guides</a>
    </div>
    <ol class="gcards">
{glist(related, "Read")}
    </ol>
  </div>
</section>

{CTA}

</main>

{FOOT}
</body>
</html>
"""


def hub_page(articles):
    sections = []
    n = 0
    for i, (key, pil) in enumerate(PILLARS.items(), 1):
        items = [a for a in articles if a["pillar"] == key]
        if not items:
            continue
        rows = []
        for a in items:
            n += 1
            rows.append(
                f'      <li><a href="/guides/{a["slug"]}"><span class="n">{n:02d}</span>'
                f'<span class="gtx"><span class="nm">{esc(a["title"])}</span>'
                f'<span class="gd">{esc(a["metaDescription"])}</span></span>'
                f'<span class="tr">Read the guide<span class="ar" aria-hidden="true">→</span></span></a></li>')
        count = f"{len(items)} guide" + ("" if len(items) == 1 else "s")
        sections.append(f"""<section class="sec tight ghub" id="{key}" aria-labelledby="p-{key}">
  <div class="wrap">
    <div class="rh"><span>{i:02d} · {esc(pil['label'])}</span><span>{count}</span></div>
    <div class="sec-head">
      <h2 id="p-{key}">{accent(pil)}</h2>
      <p>{esc(pil['blurb'])}</p>
    </div>
    <ol class="gcards">
{chr(10).join(rows)}
    </ol>
  </div>
</section>""")

    body = "\n\n".join(sections)
    schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Guides — BH Web Solutions",
        "description": "Practical guides on website law, building for heimish businesses, "
                       "and the decisions that come before a build.",
        "url": f"{SITE}/guides/",
        "hasPart": [{"@type": "Article", "headline": a["title"],
                     "url": f"{SITE}/guides/{a['slug']}"} for a in articles],
    }
    topics = " · ".join(
        f'<a href="#{k}">{esc(p["label"])}</a>' for k, p in PILLARS.items()
        if any(a["pillar"] == k for a in articles))

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Guides — BH Web Solutions</title>
<meta name="description" content="Straight answers on website accessibility law, privacy, kosher e-commerce, Yiddish and Hebrew sites, what a website should cost, and why speed decides whether a store sells.">
<link rel="canonical" href="{SITE}/guides/">
<meta property="og:type" content="website">
<meta property="og:title" content="Guides — BH Web Solutions">
<meta property="og:url" content="{SITE}/guides/">
{OG_IMAGE}
{HEAD}
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{SVG}

{NAV}

<main id="main">

<section class="phead ghead hubhead" aria-labelledby="h1">
  <div class="wrap">
    <p class="crumbs"><a href="/">Home</a> / Guides</p>
    <h1 id="h1"><em class="sw">Guides</em></h1>
    <p class="lede">Straight answers to the questions business owners actually ask us — about the law, about
      building for a heimish customer base, and about what any of it should cost. No jargon, no
      sales pitch.</p>
    <p class="gtopics"><span class="gcount">{len(articles)} guides</span> · {topics}</p>
  </div>
</section>

{body}

{CTA}

</main>

{FOOT}
</body>
</html>
"""


def update_sitemap(articles, dates):
    """Touch only the guide entries: their <lastmod> follows the guide's date; a new guide is added."""
    path = os.path.join(ROOT, "sitemap.xml")
    if not os.path.exists(path):
        print("  sitemap.xml not found, left alone")
        return
    xml = open(path, encoding="utf-8").read()
    before = xml
    for a in articles:
        loc = f"{SITE}/guides/{a['slug']}"
        pat = re.compile(r"(<loc>" + re.escape(loc) + r"</loc>\s*<lastmod>)[^<]*(</lastmod>)")
        if pat.search(xml):
            xml = pat.sub(lambda m: m.group(1) + dates[a["slug"]] + m.group(2), xml, count=1)
        else:
            entry = (f"  <url>\n    <loc>{loc}</loc>\n    <lastmod>{dates[a['slug']]}</lastmod>\n"
                     f"    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n")
            xml = xml.replace("</urlset>", entry + "</urlset>")
    if xml != before:
        open(path, "w", encoding="utf-8").write(xml)
        print("  updated guide entries in sitemap.xml")
    else:
        print("  sitemap.xml already up to date")


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
    dates = {}
    for a in articles:
        d, why = guide_date(a, wrap_tables(a["_body"]))
        dates[a["slug"]] = d
        path = os.path.join(OUT, a["slug"] + ".html")
        open(path, "w", encoding="utf-8").write(article_page(a, articles, d))
        print(f"  wrote guides/{a['slug']}.html  (date {d}, {why})")

    open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(hub_page(articles))
    print("  wrote guides/index.html")

    update_sitemap(articles, dates)

    robots = os.path.join(ROOT, "robots.txt")
    if not os.path.exists(robots):
        open(robots, "w", encoding="utf-8").write(
            f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
        print("  wrote robots.txt")

    print(f"\n{len(articles)} guides built.")


if __name__ == "__main__":
    main()
