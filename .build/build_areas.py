#!/usr/bin/env python3
"""
Build the "website design in <town>" pages for local search.

Content lives in .build/areas_data.py (one unique intro, local points and question per town).
Output: web-design/index.html (all areas), web-design/<region>.html, web-design/<town>.html,
and the /web-design/ entries in sitemap.xml (other sitemap entries are kept as they are).

The page shell (head icons/fonts/site.css, the svg symbols, header, footer + phone bar) is read from
.build/partials/ at build time, so every area page carries the same shell as the main pages.
Page styles: /css/site.css (shared) + /web-design/areas.css (area-page bits only).

Run from the repo root:  python3 .build/build_areas.py
"""
import hashlib
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
PHONE, TEL, EMAIL = "845-576-6607", "+1-845-576-6607", "info@bhwebs.com"
WA = "https://wa.me/18455870531?text=" + "Hi%2C%20I%27d%20like%20a%20website%20for%20my%20business."
REG = {r["slug"]: r for r in REGIONS}
STATE_NAME = {"NY": "New York", "NJ": "New Jersey", "OH": "Ohio", "MD": "Maryland", "IL": "Illinois", "FL": "Florida", "CA": "California"}

def e(s):
    return escape(str(s), quote=True)

AR = '<span class="ar" aria-hidden="true">→</span>'
PARTIALS = os.path.join(ROOT, ".build", "partials")

def partial(name):
    with open(os.path.join(PARTIALS, name), encoding="utf-8") as f:
        return f.read().strip("\n")

def css_stamp():
    # version the area stylesheet by its content, so a rebuild without CSS changes keeps the same URL
    with open(os.path.join(OUT, "areas.css"), "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()[:10]

CSSV = css_stamp()

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
<meta property="og:type" content="website">
<meta property="og:site_name" content="BH Web Solutions">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{SITE}/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
{partial("head-common.html")}
<link rel="stylesheet" href="/web-design/areas.css?v={CSSV}">
{ld}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{partial("svg.html")}

{partial("header.html")}

"""

def foot():
    return f"""
{partial("footer.html")}
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

def rh(left, right):
    return f'<div class="rh sv"><span>{left}</span>{right if right.startswith("<a") else "<span>" + right + "</span>"}</div>'

def work_cards(keys):
    out = []
    for i, k in enumerate(keys[:3]):
        n, label, img = WORK[k]
        out.append(f'<li><a href="/work"><figure class="duo sv"><img src="/images/work/{img}" alt="{e(n)} website by BH Web Solutions" loading="lazy" decoding="async" width="700" height="560"></figure>'
                   f'<span class="cap"><span class="n">{i + 1:02d}</span><span class="nm">{e(n)}</span><span class="tr">{e(label)}</span></span></a></li>')
    return '<ol class="grid three">' + "".join(out) + "</ol>"

def work_sec(keys):
    return f"""<section class="sec work" aria-labelledby="work-h">
  <div class="wrap">
    {rh("Recent work", '<a href="/work">See our work →</a>')}
    <div class="sec-head"><h2 id="work-h">Recent <em>work</em></h2><p>Real websites for real businesses. Every picture is the live site.</p></div>
  </div>
  {work_cards(keys)}
</section>"""

def builds(place):
    items = [("01", "Websites", "A site that makes your business look established, with your hours, services and photos."),
             ("02", "Online stores", "Fast checkout, local delivery zones and an admin you run yourself."),
             ("03", "Booking & web apps", "Appointments, rentals, ordering and portals built around how you work."),
             ("04", "Moving your site", "Your WordPress or Wix site, faster and safer, same look.")]
    return '<ol class="incl four">' + "".join(f'<li><span class="n">{n}</span><b>{e(t)}</b><span class="c">{d}</span></li>' for n, t, d in items) + "</ol>"

STEPS = ('<ol class="steps"><li><span class="n">01</span><b>Tell us what you need</b><span class="c">A short form, or just a WhatsApp message.</span></li>'
         '<li><span class="n">02</span><b>See your design</b><span class="c">Ask for any change before you pay the balance.</span></li>'
         '<li><span class="n">03</span><b>Go live</b><span class="c">Usually within days. We stay for every change after.</span></li></ol>')

def shared_faq(place):
    return [(f"How much does a website cost in {place}?",
             "You get the price in writing before we start, and you pay the balance only after you have seen your design. Running costs are told up front."),
            (f"Do I need to meet you to get a website in {place}?",
             "No. Everything can happen by phone, WhatsApp and email, whichever you prefer. You deal directly with the person building your site.")]

def faq_html(qas):
    return '<div class="faq">' + "".join(f'<div class="qa"><h3><span class="n">Q.{i + 1}</span><span>{e(q)}</span></h3><p class="a">{e(a)}</p></div>'
                                         for i, (q, a) in enumerate(qas)) + "</div>"

def keep_state(place_html):
    # "Kaser, NY": keep the state on the same line as the town in the big heading
    return re.sub(r", ([A-Z]{2})$", r",&nbsp;\1", place_html)

def phead(trail, h1, lead, trust=True):
    proof = ('\n    <ul class="proof"><li>Free logo</li><li>Free small edits</li><li>See the design before you pay</li></ul>') if trust else ""
    return f"""<section class="phead" aria-labelledby="h1">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">{trail}</nav>
    <h1 id="h1">{h1}</h1>
    <div class="hero-row">
      <p class="lede">{lead}</p>
      <div class="actions"><a class="btn btn-lg" href="/order">Start my website{AR}</a><a class="tlink" href="/work">See our work{AR}</a></div>
    </div>{proof}
  </div>
</section>"""

def cta(place, label):
    return f"""<section class="call" aria-labelledby="call-h">
  <div class="wrap">
    <div class="rh"><span>Start</span><span>{e(label)}</span></div>
    <h2 id="call-h">Ready for a website in <em>{e(place)}</em>?</h2>
    <div class="call-grid">
      <div class="call-l"><p class="call-sub">Tell us what you need. You see the design before you pay.</p></div>
      <div class="call-r cta-btns"><a class="btn btn-inv btn-lg" href="/order">Start my website{AR}</a><a class="btn btn-pl btn-lg" href="{WA}" target="_blank" rel="noopener">WhatsApp us</a></div>
    </div>
  </div>
</section>"""

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
    near_html = "".join(f'<li><a href="/web-design/{n["slug"]}"><span class="n">{i + 1:02d}</span><span class="nm">{e(n["name"][0].upper() + n["name"][1:])}</span><span class="go" aria-hidden="true">→</span></a></li>'
                        for i, n in enumerate(near))
    near_html += f'<li class="hub"><a href="/web-design/{r["slug"]}"><span class="n" aria-hidden="true">↗</span><span class="nm">All of {e(r["name"])}</span><span class="go" aria-hidden="true">→</span></a></li>'
    local = "".join(f"<li>{e(x)}</li>" for x in t["local"])
    guide = ('<p class="more">Read more: <a href="/guides/yiddish-hebrew-rtl-websites">Yiddish and Hebrew websites</a> &middot; '
             '<a href="/guides/shabbos-yom-tov-online-orders">Closing online orders for Shabbos and Yom Tov</a></p>') if t["yiddish"] else ""
    trail = (f'<a href="/">Home</a> › <a href="/web-design/">Areas we serve</a> › '
             f'<a href="/web-design/{r["slug"]}">{e(r["name"])}</a> › <span aria-current="page">{e(head_name)}</span>')
    body = f"""<main id="main">

{phead(trail, f'Website design in <em>{keep_state(e(place))}</em>', e(t['intro']))}

<section class="sec" aria-labelledby="build-h">
  <div class="wrap">
    {rh("What we build", e(place))}
    <div class="sec-head"><h2 id="build-h">What we build for <em>{e(name)}</em> businesses</h2><p>Common here: {e(t['types'])}.</p></div>
    {builds(place)}
  </div>
</section>

<section class="sec dark" aria-labelledby="local-h">
  <div class="wrap">
    {rh("Built for " + e(head_name), "How it works")}
    <div class="two">
      <div class="col"><h2 id="local-h">Built for how <em>{e(name)}</em> does business</h2>
        <ul class="inc">{local}<li>Works on older iPads and filtered phones</li><li>You update prices, photos and hours yourself</li></ul>{guide}</div>
      <div class="col"><h2 id="how-h">How it works</h2>{STEPS}</div>
    </div>
  </div>
</section>

{work_sec(r['work'])}

<section class="sec" aria-labelledby="faq-h">
  <div class="wrap">
    {rh("Questions", e(place))}
    <div class="sec-head"><h2 id="faq-h">Questions from <em>{e(name)}</em> business owners</h2></div>
    {faq_html(qas)}
  </div>
</section>

<section class="sec tight" aria-labelledby="near-h">
  <div class="wrap">
    {rh("Nearby", '<a href="/web-design/">Areas we serve →</a>')}
    <div class="sec-head"><h2 id="near-h">Nearby areas <em>we serve</em></h2></div>
    <ol class="idx near">{near_html}</ol>
  </div>
</section>

{cta(name, place)}

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
    cards = "".join(f'<li><a href="/web-design/{t["slug"]}"><span class="n">{i + 1:02d}</span><b>{e(t["name"][0].upper() + t["name"][1:])}</b><span class="c">{e(t["intro"].split(". ")[0])}.</span><span class="go">Website design in {e(t["place"])}{AR}</span></a></li>'
                    for i, t in enumerate(towns))
    trail = f'<a href="/">Home</a> › <a href="/web-design/">Areas we serve</a> › <span aria-current="page">{e(place)}</span>'
    body = f"""<main id="main">

{phead(trail, f'Website design in <em>{e(place)}</em>', e(r['intro']))}

<section class="sec" aria-labelledby="towns-h">
  <div class="wrap">
    {rh("Towns we serve", e(r["full"]))}
    <div class="sec-head"><h2 id="towns-h">Towns we serve in <em>{e(place)}</em></h2></div>
    <ol class="tl">{cards}</ol>
  </div>
</section>

<section class="sec dark" aria-labelledby="build-h">
  <div class="wrap">
    {rh("What we build", e(place))}
    <div class="sec-head"><h2 id="build-h">What we <em>build</em></h2></div>
    {builds(place)}
  </div>
</section>

{work_sec(r['work'])}

<section class="sec" aria-labelledby="faq-h">
  <div class="wrap">
    {rh("Questions", e(place))}
    <div class="sec-head"><h2 id="faq-h">Questions</h2></div>
    {faq_html(qas)}
  </div>
</section>

{cta(place, r["full"])}

</main>
"""
    return head(title, desc, canon, schema) + body + foot()

def hub_page():
    title = "Areas We Serve: Website Design for Jewish Communities Across the US | BH Web Solutions"
    desc = "Websites, online stores and booking for businesses in Rockland, Orange County, Brooklyn, Queens, Long Island, New Jersey, Baltimore, Chicago, Miami, LA and Ohio."
    canon = url("")
    area = [{"@type": "AdministrativeArea", "name": r["full"]} for r in REGIONS]
    schema = [business(area), crumbs([("Home", SITE + "/"), ("Areas we serve", canon)])]
    blocks = []
    for i, r in enumerate(REGIONS):
        links = "".join(f'<li><a href="/web-design/{s}">{e(T[s]["name"][0].upper() + T[s]["name"][1:])}</a></li>' for s in r["towns"])
        blocks.append(f'<li class="rblock"><div class="rb-l"><span class="n">{i + 1:02d}</span><h2><a href="/web-design/{r["slug"]}">{e(r["name"])}</a></h2></div>'
                      f'<div class="rb-r"><p>{e(r["intro"].split(". ")[0])}.</p><ul class="towns">{links}</ul></div></li>')
    lead = ("We build websites, online stores and booking systems for businesses across Rockland and Orange County, the five boroughs, "
            "Long Island, Westchester and New Jersey, and for communities further away in Baltimore, Chicago, South Florida, Los Angeles and Ohio. "
            "Find your town below.")
    body = f"""<main id="main">

{phead('<a href="/">Home</a> › <span aria-current="page">Areas we serve</span>', 'Websites for businesses <em>near you.</em>', lead, trust=False)}

<section class="sec" aria-label="Areas we serve">
  <div class="wrap">
    {rh("Areas we serve", f"{len(REGIONS)} regions · {len(T)} towns")}
    <ol class="regions">{''.join(blocks)}</ol>
  </div>
</section>

{cta('your area', 'Monsey, NY · and beyond')}

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
