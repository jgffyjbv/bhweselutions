#!/usr/bin/env python3
"""
Build the "website design in <town>" pages for local search.

Content lives in .build/areas_data.py (one unique intro, local points and question per town).
Output: web-design/index.html (all areas), web-design/<region>.html, web-design/<town>.html,
and the /web-design/ entries in sitemap.xml (other sitemap entries are kept as they are).

Run from the repo root:  python3 .build/build_areas.py
"""
import json
import os
import re
import sys
from datetime import date
from html import escape

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from areas_data import WORK, REGIONS, T  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "web-design")
SITE = "https://bhwebs.com"
TODAY = date.today().isoformat()
PHONE, TEL, EMAIL = "845-587-0531", "+1-845-587-0531", "info@bhwebs.com"
WA = "https://wa.me/18455870531?text=" + "Hi%2C%20I%27d%20like%20a%20website%20for%20my%20business."
REG = {r["slug"]: r for r in REGIONS}
STATE_NAME = {"NY": "New York", "NJ": "New Jersey", "OH": "Ohio"}

def e(s):
    return escape(str(s), quote=True)

ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>'
LOGO = ('<svg class="brand__mark" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="bhg" gradientUnits="userSpaceOnUse" x1="18" y1="24" x2="110" y2="88">'
        '<stop offset="0" stop-color="#2b4eff"/><stop offset=".42" stop-color="#7c3aed"/><stop offset=".72" stop-color="#ff5c39"/><stop offset="1" stop-color="#ffc53d"/></linearGradient></defs>'
        '<g fill="none" stroke="url(#bhg)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"><path d="M22 18 V88"/><path d="M22 18 H40 a17 17 0 0 1 0 34 H22"/><path d="M22 52 H44 a18 18 0 0 1 0 36 H22"/>'
        '<path d="M74 18 V88"/><path d="M106 18 V88"/><path d="M74 53 H106"/></g><path d="M20 106 Q 50 96 78 103 T 108 100" fill="none" stroke="#6cb33f" stroke-width="9" stroke-linecap="round"/></svg>')

def url(slug):
    return f"{SITE}/web-design/{slug}" if slug else f"{SITE}/web-design/"

def head(title, desc, canon, schema):
    ld = "\n".join(f'<script type="application/ld+json">{json.dumps(s, ensure_ascii=False)}</script>' for s in schema)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{canon}">
<meta name="robots" content="index,follow">
<meta name="theme-color" content="#faf7f0">
<meta property="og:type" content="website">
<meta property="og:site_name" content="BH Web Solutions">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{SITE}/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="/web-design/areas.css?v={TODAY}">
{ld}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="nav">
  <div class="in nav__in">
    <a href="/" class="brand" aria-label="BH Web Solutions home">{LOGO}<span>BH Web Solutions</span></a>
    <nav class="nav__links" aria-label="Main"><a href="/#how">How it works</a><a href="/#work">Our work</a><a href="/web-design/">Areas we serve</a><a href="/#faq">Questions</a></nav>
    <a class="btn btn--green btn--sm" href="/order.html">Start a project</a>
  </div>
</header>
"""

def foot():
    regions = "".join(f'<a href="/web-design/{r["slug"]}">{e(r["name"])}</a>' for r in REGIONS)
    return f"""<footer class="foot">
  <div class="in foot__grid">
    <div><a href="/" class="brand">{LOGO}<span>BH Web Solutions</span></a>
      <p>Custom websites, online stores and web apps for businesses in New York, New Jersey and beyond. English and Yiddish.</p>
      <p><a href="tel:8455870531">{PHONE}</a> &middot; <a href="mailto:{EMAIL}">{EMAIL}</a></p></div>
    <div><b>Areas we serve</b>{regions}<a href="/web-design/">All areas</a></div>
    <div><b>BH Web Solutions</b><a href="/">Home</a><a href="/work.html">Our work</a><a href="/about.html">About</a><a href="/guides/">Guides</a><a href="/order.html">Start a project</a></div>
  </div>
  <div class="in foot__bar">&copy; {date.today().year} BH Web Solutions</div>
</footer>
<a class="wa" href="{WA}" target="_blank" rel="noopener" aria-label="WhatsApp us">WhatsApp</a>
</body>
</html>
"""

def business(area_served):
    return {"@context": "https://schema.org", "@type": "ProfessionalService", "@id": f"{SITE}/#business",
            "name": "BH Web Solutions", "url": f"{SITE}/", "telephone": TEL, "email": EMAIL,
            "image": f"{SITE}/og-image.jpg", "logo": f"{SITE}/logo.svg",
            "description": "Custom websites, online stores and web apps, in English and Yiddish.",
            "knowsLanguage": ["en", "yi", "he"], "areaServed": area_served}

def crumbs(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}

def faq_ld(qas):
    return {"@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qas]}

def work_cards(keys):
    out = []
    for k in keys[:3]:
        n, label, img = WORK[k]
        out.append(f'<a class="wcard" href="/work.html"><img src="/images/work/{img}" alt="{e(n)} website by BH Web Solutions" loading="lazy" decoding="async" width="700" height="438"><span><b>{e(n)}</b><i>{e(label)}</i></span></a>')
    return '<div class="wgrid">' + "".join(out) + "</div>"

def builds(place):
    items = [("01", "Websites", "A site that makes your business look established, with your hours, services and photos."),
             ("02", "Online stores", "Fast checkout, local delivery zones and an admin you run yourself."),
             ("03", "Booking & web apps", "Appointments, rentals, ordering and portals built around how you work."),
             ("04", "Moving your site", "Your WordPress or Wix site, faster and safer, same look.")]
    return '<div class="b4">' + "".join(f'<div class="b4c"><span>{n}</span><b>{t}</b><p>{d}</p></div>' for n, t, d in items) + "</div>"

STEPS = ('<ol class="steps"><li><b>Tell us what you need</b><span>A short form, or just a WhatsApp message.</span></li>'
         '<li><b>See your design</b><span>Ask for any change before you pay the balance.</span></li>'
         '<li><b>Go live</b><span>Usually within days. We stay for every change after.</span></li></ol>')

def shared_faq(place):
    return [(f"How much does a website cost in {place}?",
             "You get the price in writing before we start, and you pay the balance only after you have seen your design. Running costs are told up front."),
            (f"Do I need to meet you to get a website in {place}?",
             "No. Everything can happen by phone, WhatsApp and email, whichever you prefer. You deal directly with the person building your site.")]

def faq_html(qas):
    return '<div class="faq">' + "".join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in qas) + "</div>"

def cta(place):
    return f"""<section class="cta"><div class="in">
  <h2>Ready for a website in {e(place)}?</h2>
  <p>Tell us what you need. You see the design before you pay.</p>
  <p class="row"><a class="btn btn--green" href="/order.html">Start my website {ARROW}</a><a class="btn btn--line" href="{WA}" target="_blank" rel="noopener">WhatsApp us</a></p>
</div></section>"""

def town_page(t):
    r = REG[t["region"]]
    place, name = t["place"], t["name"]
    state = STATE_NAME[r["state"]]
    head_name = name[0].upper() + name[1:]
    title = f"Website Design in {place[0].upper() + place[1:]} | BH Web Solutions"
    desc = (f"Website design for {name} businesses: custom websites, online stores and booking, live in days. "
            + ("English & Yiddish. " if t["yiddish"] else "") + "See your design before you pay.")
    canon = url(t["slug"])
    area_name = re.sub(r"^the ", "", name); area_name = area_name[0].upper() + area_name[1:]
    area = {"@type": "Place" if t["slug"] == "five-towns-ny" else "City", "name": area_name,
            "containedInPlace": {"@type": "AdministrativeArea", "name": r["full"]}}
    qas = [t["faq"]] + shared_faq(name)
    schema = [business(area), crumbs([("Home", SITE + "/"), ("Areas we serve", url("")), (r["name"], url(r["slug"])), (head_name, canon)]),
              faq_ld(qas),
              {"@context": "https://schema.org", "@type": "Service", "serviceType": "Website design",
               "name": f"Website design in {place}", "provider": {"@id": f"{SITE}/#business"}, "areaServed": area,
               "url": canon}]
    near = [T[n] for n in t["near"]]
    near_html = "".join(f'<a href="/web-design/{n["slug"]}">{e(n["name"][0].upper() + n["name"][1:])}</a>' for n in near)
    near_html += f'<a class="hub" href="/web-design/{r["slug"]}">All of {e(r["name"])}</a>'
    local = "".join(f"<li>{CHECK} {e(x)}</li>" for x in t["local"])
    guide = ('<p class="more">Read more: <a href="/guides/yiddish-hebrew-rtl-websites">Yiddish and Hebrew websites</a> &middot; '
             '<a href="/guides/shabbos-yom-tov-online-orders">Closing online orders for Shabbos and Yom Tov</a></p>') if t["yiddish"] else ""
    body = f"""<main id="main">
<section class="hero"><div class="in">
  <p class="crumb"><a href="/">Home</a> › <a href="/web-design/">Areas we serve</a> › <a href="/web-design/{r['slug']}">{e(r['name'])}</a> › {e(head_name)}</p>
  <h1>Website design in <span class="gt">{e(place)}</span></h1>
  <p class="lead">{e(t['intro'])}</p>
  <p class="row"><a class="btn btn--green" href="/order.html">Start my website {ARROW}</a><a class="btn btn--line" href="/work.html">See our work</a></p>
  <p class="trust"><span>{CHECK} Free logo</span><span>{CHECK} Free small edits</span><span>{CHECK} See the design before you pay</span></p>
</div></section>

<section class="sec"><div class="in">
  <h2>What we build for {e(name)} businesses</h2>
  <p class="sub">Common here: {e(t['types'])}.</p>
  {builds(place)}
</div></section>

<section class="sec sec--tint"><div class="in two">
  <div><h2>Built for how {e(name)} does business</h2>
  <ul class="checks">{local}<li>{CHECK} Works on older iPads and filtered phones</li><li>{CHECK} You update prices, photos and hours yourself</li></ul>{guide}</div>
  <div><h2>How it works</h2>{STEPS}</div>
</div></section>

<section class="sec"><div class="in">
  <h2>Recent work</h2>
  <p class="sub">Real websites for real businesses. Every picture is the live site.</p>
  {work_cards(r['work'])}
</div></section>

<section class="sec sec--tint"><div class="in">
  <h2>Questions from {e(name)} business owners</h2>
  {faq_html(qas)}
</div></section>

<section class="sec"><div class="in">
  <h2>Nearby areas we serve</h2>
  <p class="chips">{near_html}</p>
</div></section>

{cta(name)}
</main>
"""
    return head(title, desc, canon, schema) + body + foot()

def region_page(r):
    place = r["name"]
    title = f"Website Design in {place}{', NY' if r['state'] == 'NY' else ''} | BH Web Solutions"
    desc = f"Websites, online stores and booking for businesses across {place}. Live in days, see the design before you pay. English & Yiddish."
    canon = url(r["slug"])
    towns = [T[s] for s in r["towns"]]
    area = {"@type": "State" if r["slug"] in ("new-jersey", "ohio") else "AdministrativeArea", "name": r["full"]}
    qas = shared_faq(place)
    schema = [business(area), crumbs([("Home", SITE + "/"), ("Areas we serve", url("")), (place, canon)]), faq_ld(qas)]
    cards = "".join(f'<a class="tcard" href="/web-design/{t["slug"]}"><b>{e(t["name"][0].upper() + t["name"][1:])}</b><span>{e(t["intro"].split(". ")[0])}.</span><i>Website design in {e(t["place"])} {ARROW}</i></a>' for t in towns)
    body = f"""<main id="main">
<section class="hero"><div class="in">
  <p class="crumb"><a href="/">Home</a> › <a href="/web-design/">Areas we serve</a> › {e(place)}</p>
  <h1>Website design in <span class="gt">{e(place)}</span></h1>
  <p class="lead">{e(r['intro'])}</p>
  <p class="row"><a class="btn btn--green" href="/order.html">Start my website {ARROW}</a><a class="btn btn--line" href="/work.html">See our work</a></p>
  <p class="trust"><span>{CHECK} Free logo</span><span>{CHECK} Free small edits</span><span>{CHECK} See the design before you pay</span></p>
</div></section>

<section class="sec"><div class="in">
  <h2>Towns we serve in {e(place)}</h2>
  <div class="tgrid">{cards}</div>
</div></section>

<section class="sec sec--tint"><div class="in">
  <h2>What we build</h2>
  {builds(place)}
</div></section>

<section class="sec"><div class="in">
  <h2>Recent work</h2>
  <p class="sub">Real websites for real businesses. Every picture is the live site.</p>
  {work_cards(r['work'])}
</div></section>

<section class="sec sec--tint"><div class="in">
  <h2>Questions</h2>
  {faq_html(qas)}
</div></section>

{cta(place)}
</main>
"""
    return head(title, desc, canon, schema) + body + foot()

def hub_page():
    title = "Areas We Serve: Website Design in New York, New Jersey & Ohio | BH Web Solutions"
    desc = "BH Web Solutions builds websites, online stores and booking systems for businesses in Rockland, Orange County, Brooklyn, Queens, Long Island, New Jersey and Ohio."
    canon = url("")
    area = [{"@type": "AdministrativeArea", "name": r["full"]} for r in REGIONS]
    schema = [business(area), crumbs([("Home", SITE + "/"), ("Areas we serve", canon)])]
    blocks = []
    for r in REGIONS:
        links = "".join(f'<a href="/web-design/{s}">{e(T[s]["name"][0].upper() + T[s]["name"][1:])}</a>' for s in r["towns"])
        blocks.append(f'<div class="rblock"><h2><a href="/web-design/{r["slug"]}">{e(r["name"])}</a></h2><p>{e(r["intro"].split(". ")[0])}.</p><p class="chips">{links}</p></div>')
    body = f"""<main id="main">
<section class="hero"><div class="in">
  <p class="crumb"><a href="/">Home</a> › Areas we serve</p>
  <h1>Websites for businesses <span class="gt">near you.</span></h1>
  <p class="lead">We build websites, online stores and booking systems for businesses across Rockland and Orange County, the five boroughs, Long Island, Westchester, New Jersey and Ohio. Find your town below.</p>
  <p class="row"><a class="btn btn--green" href="/order.html">Start my website {ARROW}</a><a class="btn btn--line" href="/work.html">See our work</a></p>
</div></section>
<section class="sec"><div class="in">{''.join(blocks)}</div></section>
{cta('your area')}
</main>
"""
    return head(title, desc, canon, schema) + body + foot()

def update_sitemap(slugs):
    path = os.path.join(ROOT, "sitemap.xml")
    xml = open(path, encoding="utf-8").read()
    entries = re.findall(r"<url>.*?</url>", xml, re.S)
    keep = []
    for en in entries:
        loc = re.search(r"<loc>(.*?)</loc>", en).group(1)
        if "/web-design/" in loc:
            continue
        # the server answers /page.html with a redirect to /page: list the final address
        en = re.sub(r"<loc>(https://bhwebs\.com/[^<]*?)\.html</loc>", r"<loc>\1</loc>", en)
        keep.append(en)
    for s, prio in slugs:
        keep.append(f"<url>\n    <loc>{url(s)}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>{prio}</priority>\n  </url>")
    out = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + \
          "\n".join("  " + k for k in keep) + "\n</urlset>\n"
    open(path, "w", encoding="utf-8").write(out)

def main():
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith(".html"):
            os.remove(os.path.join(OUT, f))
    pages = [("", "0.8")]
    open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(hub_page())
    for r in REGIONS:
        open(os.path.join(OUT, r["slug"] + ".html"), "w", encoding="utf-8").write(region_page(r))
        pages.append((r["slug"], "0.8"))
    for t in T.values():
        open(os.path.join(OUT, t["slug"] + ".html"), "w", encoding="utf-8").write(town_page(t))
        pages.append((t["slug"], "0.7"))
    update_sitemap(pages)
    print(f"built {len(pages)} pages in web-design/ and updated sitemap.xml")

if __name__ == "__main__":
    main()
