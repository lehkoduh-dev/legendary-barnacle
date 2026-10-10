#!/usr/bin/env python3
"""Static site builder for beachheavenrum.com. Output: ./site (served from web root)."""
import os, textwrap

SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")
DOMAIN = "https://beachheavenrum.com"
CONTACT = "info@beachheavenrum.com"
ASSET_V = "4"
CATEGORY = "Rum-based tropical spirit drink"

# ---- verified product data (label art, spec table from producer, producer waiver) ----
SKUS = [
    dict(slug="pink-dream", key="pink", name="Pink Dream", ean="8720892516206",
         abv="37.5", vol="70",
         bg="#F9BFDD", ac="#D82F7A", deep="#7E1B4A", liquid="#F4A9C8", liquid_op=.9, tile="tile-pink.jpg",
         notes=["Hibiscus", "Grapefruit", "Blueberry"],
         short="Hibiscus-led, floral and softly sweet.",
         lead="Delicate hibiscus with a smooth, warming character. Subtle floral notes and a gentle hint of sweetness make it easy to sip and a natural fit for cocktails.",
         colour="Pink",
         serve="Over ice with a squeeze of citrus, long with soda or tonic, or in your favourite tropical cocktail."),
    dict(slug="lychee-bliss", key="lychee", name="Lychee Bliss", ean="8720892516220",
         abv="37.5", vol="70",
         bg="#F9AF8F", ac="#D2394F", deep="#7A2A1C", liquid="#E9F1EE", liquid_op=.55, tile="tile-lychee.jpg",
         notes=["Lychee", "Lemon", "Lime", "Cucumber", "Ginger"],
         short="Ripe lychee, bright citrus and a crisp finish.",
         lead="Smooth and refreshing, built around the sweetness of ripe lychee. Delicate floral notes and a lively citrus and ginger lift leave a crisp, fruity finish.",
         colour="Clear",
         serve="Chilled over ice, with soda and a lime wedge, or shaken into something fresh."),
    dict(slug="spiced-velvet", key="spiced", name="Spiced Velvet", ean="8720892516213",
         abv="37.5", vol="70",
         bg="#96DBC7", ac="#D8700A", deep="#6E3508", liquid="#D68A22", liquid_op=.92, tile="tile-spiced.jpg",
         notes=["Orange", "Lime"],
         short="Deep amber, smooth, with orange and lime brightness.",
         lead="A deep amber blend with a smooth, mellow body, lifted by orange and lime. Made for sipping on ice and for long, warming tropical serves.",
         colour="Amber",
         serve="On the rocks, with ginger beer and lime, or in a warm-weather highball."),
]
BY_KEY = {s["key"]: s for s in SKUS}

# ---- inline bottle illustration, built from label art + dieline proportions ----
_uid = [0]
def bottle(s, cls=""):
    _uid[0] += 1
    u = f"{s['key']}{_uid[0]}"
    glass = ("M86 66 V138 C86 166 22 158 22 206 V522 Q22 548 48 548 H192 Q218 548 218 522 "
             "V206 C218 158 154 166 154 138 V66 Z")
    return f"""<svg class="{cls}" viewBox="0 0 240 566" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Beach Heaven {s['name']} bottle, 70 cl">
<defs>
<clipPath id="g{u}"><path d="{glass}"/></clipPath>
<pattern id="p{u}" width="132" height="129" patternUnits="userSpaceOnUse"><image href="/assets/img/{s['tile']}" width="132" height="129" preserveAspectRatio="xMidYMid slice"/></pattern>
<linearGradient id="s{u}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".22" stop-color="#fff" stop-opacity=".0"/><stop offset=".78" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
</defs>
<rect x="88" y="12" width="64" height="58" rx="7" fill="#C99C6B"/>
<rect x="88" y="12" width="64" height="12" rx="6" fill="#B58655"/>
<rect x="82" y="60" width="76" height="14" rx="5" fill="#DCE6E4" opacity=".9"/>
<path d="{glass}" fill="#DFEBEA" fill-opacity=".38"/>
<g clip-path="url(#g{u})">
  <rect x="0" y="98" width="240" height="470" fill="{s['liquid']}" opacity="{s['liquid_op']}"/>
  <rect x="0" y="520" width="240" height="30" fill="#fff" opacity=".16"/>
  <rect x="0" y="345" width="240" height="98" fill="url(#p{u})"/>
  <rect x="0" y="345" width="240" height="2" fill="#fff" opacity=".5"/><rect x="0" y="441" width="240" height="2" fill="#fff" opacity=".5"/>
  <ellipse cx="120" cy="318" rx="86" ry="52" fill="{s['bg']}"/>
  <ellipse cx="120" cy="318" rx="80" ry="46" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>
  <text x="120" y="290" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="6.5" letter-spacing="2" fill="#A98E2E" font-weight="700">EST 2025</text>
  <image href="/assets/img/wordmark.png" x="54" y="296" width="132" height="18.7"/>
  <text x="120" y="337" text-anchor="middle" font-family="Yellowtail,cursive" font-size="25" fill="{s['ac']}">{s['name']}</text>
  <text x="120" y="351" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="6.2" letter-spacing="1.6" fill="#1D1917" font-weight="700">AUTHENTIC TROPICAL BLEND</text>
  <rect x="0" y="0" width="240" height="566" fill="url(#s{u})"/>
  <rect x="34" y="214" width="9" height="296" rx="4.5" fill="#fff" opacity=".34"/>
  <rect x="97" y="82" width="5" height="52" rx="2.5" fill="#fff" opacity=".4"/>
</g>
<path d="{glass}" fill="none" stroke="#7A9A9A" stroke-opacity=".55" stroke-width="1.4"/>
</svg>"""

# ---- shared page chrome ----
def head(title, desc, path, extra=""):
    canon = f"{DOMAIN}{path}"
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canon}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Beach Heaven">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<meta property="og:url" content="{canon}"><meta property="og:image" content="{DOMAIN}/assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FCF8F4">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/playfair-display-latin-900-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css?v={ASSET_V}">
<script>try{{var v=localStorage.getItem("bh_age_ok")||sessionStorage.getItem("bh_age_ok");if(!(v&&parseInt(v,10)>Date.now()))document.documentElement.classList.add("needs-gate")}}catch(e){{document.documentElement.classList.add("needs-gate")}}</script>
{extra}
</head>
<body>
"""

GATE = """<div class="gate" id="age-gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
  <div class="gate-card">
    <img src="/assets/img/wordmark.png" alt="Beach Heaven" width="240" height="34">
    <div id="age-ask">
      <p class="gate-top">You must be of legal drinking age to enter this site</p>
      <h2 id="gate-title">Please enter your date of birth</h2>
      <form id="age-form" novalidate>
        <div class="dob">
          <div><label for="dob-d">Day</label><input class="d" id="dob-d" type="text" inputmode="numeric" maxlength="2" placeholder="DD" autocomplete="bday-day" aria-label="Day"></div>
          <div><label for="dob-m">Month</label><input class="m" id="dob-m" type="text" inputmode="numeric" maxlength="2" placeholder="MM" autocomplete="bday-month" aria-label="Month"></div>
          <div><label for="dob-y">Year</label><input class="y" id="dob-y" type="text" inputmode="numeric" maxlength="4" placeholder="YYYY" autocomplete="bday-year" aria-label="Year"></div>
        </div>
        <p class="gate-error" id="age-error" role="alert"></p>
        <label class="remember"><input type="checkbox" id="age-remember" checked> Remember me on this device</label>
        <button class="btn" type="submit">Enter</button>
      </form>
      <p class="gate-note">This site is for adults only. Please enjoy responsibly.</p>
    </div>
    <div id="age-denied" class="gate-denied" hidden>
      <h2>Sorry, you can't enter</h2>
      <p>Come back when you are of legal drinking age.</p>
    </div>
  </div>
</div>
"""

def header(active=""):
    def a(href, label, k):
        cur = ' aria-current="page"' if active == k else ""
        return f'<li><a href="{href}"{cur}>{label}</a></li>'
    return f"""{GATE}<header class="site-header"><div class="wrap nav">
  <a class="brand" href="/" aria-label="Beach Heaven home"><img src="/assets/img/wordmark.png" alt="Beach Heaven" width="198" height="28"></a>
  <button class="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="nav-list"><span></span><span></span><span></span></button>
  <ul id="nav-list">
    {a('/our-rums/','Our Rums','rums')}
    {a('/cocktails/','Cocktails','cocktails')}
    {a('/experiences/','Experiences','experiences')}
    {a('/contact/','Contact','contact')}
    <li><a class="btn teal" href="/wholesale/">Wholesale</a></li>
  </ul>
</div></header>
<main>
"""

FOOTER = f"""</main>
<footer class="site-footer"><div class="wrap">
  <div class="foot">
    <div><img src="/assets/img/wordmark.png" alt="Beach Heaven" width="226" height="32">
      <p>Our signature spirits capture bold horizons and timeless allure, with a whisper of tropical adventure in every sip.</p></div>
    <div><h4>The blends</h4><ul>
      <li><a href="/pink-dream/">Pink Dream</a></li><li><a href="/lychee-bliss/">Lychee Bliss</a></li><li><a href="/spiced-velvet/">Spiced Velvet</a></li></ul></div>
    <div><h4>Explore</h4><ul><li><a href="/our-rums/">Our Rums</a></li><li><a href="/cocktails/">Cocktails</a></li><li><a href="/experiences/">Experiences</a></li><li><a href="/contact/">Contact</a></li><li><a href="/wholesale/">Wholesale</a></li></ul></div>
  </div>
  <div class="legal"><span>Enjoy responsibly. For adults of legal drinking age only. Beach Heaven is a product of Kroonbrau BV, Amsterdam.</span><span>&copy; 2026 Beach Heaven</span></div>
</div></footer>
<script src="/assets/js/site.js?v={ASSET_V}" defer></script>
</body></html>
"""

def card(s):
    return f"""<a class="card {s['key']}" href="/{s['slug']}/">
  <div class="art" style="background-image:linear-gradient(180deg,{s['bg']}00 55%,{s['bg']} 100%),url(/assets/img/{s['tile']})">{bottle(s)}</div>
  <div class="body"><p class="tag">{CATEGORY}</p><h3>{s['name']}</h3><p>{s['short']}</p><span class="more">Discover &rarr;</span></div>
</a>"""

def write(path, html):
    full = os.path.join(SITE, path.lstrip("/"))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(html)

JSONLD = f"""<script type="application/ld+json">{{"@context":"https://schema.org","@type":"Organization","name":"Beach Heaven","url":"{DOMAIN}/","logo":"{DOMAIN}/assets/img/wordmark.png","foundingDate":"2025"}}</script>"""

# ---- home ----
def home():
    cards = "\n".join(card(s) for s in SKUS)
    rows = lambda f: "".join(f"<td>{f(s)}</td>" for s in SKUS)
    html = head("Beach Heaven | Tropical rum-based spirit drinks",
                "Beach Heaven: three rum-based tropical spirit drinks. Pink Dream, Lychee Bliss and Spiced Velvet. 37.5% vol., 70 cl.",
                "/", JSONLD) + header()
    html += f"""<section class="hero"><div class="wrap">
  <div>
    <p class="eyebrow">Est. 2025 &middot; Tropical spirit drinks</p>
    <h1>A whisper of tropical adventure in every sip.</h1>
    <p class="lead">Beach Heaven is a rum-based tropical spirit drink in three blends: Pink Dream, Lychee Bliss and Spiced Velvet. Bold horizons, timeless allure.</p>
    <div class="cta"><a class="btn" href="#blends">Meet the blends</a><a class="btn alt" href="/wholesale/">Wholesale enquiries</a></div>
  </div>
  <div class="trio" aria-hidden="false">
    <div class="bottle b1">{bottle(BY_KEY['pink'])}</div>
    <div class="bottle b2">{bottle(BY_KEY['lychee'])}</div>
    <div class="bottle b3">{bottle(BY_KEY['spiced'])}</div>
  </div>
</div></section>

<section id="blends"><div class="wrap">
  <div class="sec-head"><p class="eyebrow">The blends</p><h2>Three moods, one tropical spirit.</h2>
  <p>Each blend has its own colour, flavour and label. All three are 37.5% vol. in a 70 cl bottle.</p></div>
  <div class="cards">
{cards}
  </div>
</div></section>

<section class="facts"><div class="wrap">
  <div class="sec-head"><p class="eyebrow">At a glance</p><h2>Side by side.</h2></div>
  <div class="scroll-x"><table class="spec">
    <thead><tr><th></th>{''.join(f"<th>{s['name']}</th>" for s in SKUS)}</tr></thead>
    <tbody>
      <tr><th>Flavour notes</th>{rows(lambda s: ', '.join(s['notes']))}</tr>
      <tr><th>Colour</th>{rows(lambda s: s['colour'])}</tr>
      <tr><th>Alcohol</th>{rows(lambda s: s['abv'] + '% vol.')}</tr>
      <tr><th>Bottle</th>{rows(lambda s: s['vol'] + ' cl')}</tr>
    </tbody></table></div>
</div></section>

{__import__("pages2").teasers()}
<section><div class="wrap">
  <div class="trade">
    <div><p class="eyebrow">For the trade</p><h2>Bars, beach clubs, shops and distributors.</h2>
    <p>Tell us about your business and we'll come back with pricing and availability.</p></div>
    <div class="right"><a class="btn light" href="/wholesale/">Wholesale enquiries</a></div>
  </div>
</div></section>
"""
    html += FOOTER
    write("/index.html", html)

# ---- sku pages ----
def sku_page(s):
    others = "\n".join(card(o) for o in SKUS if o["key"] != s["key"])
    chips = "".join(f"<li>{n}</li>" for n in s["notes"])
    html = head(f"{s['name']} | Beach Heaven",
                f"Beach Heaven {s['name']}: {s['short']} {CATEGORY}, {s['abv']}% vol., {s['vol']} cl.",
                f"/{s['slug']}/", JSONLD) + header("rums")
    html += f"""<section class="sku-hero {s['key']}"><div class="wrap">
  <div>
    <p class="cat">Beach Heaven &middot; {CATEGORY}</p>
    <h1>{s['name']}</h1>
    <p class="lead">{s['lead']}</p>
    <ul class="chips"><li>{s['abv']}% vol.</li><li>{s['vol']} cl</li>{chips}</ul>
    <div class="cta" style="display:flex;gap:14px;flex-wrap:wrap"><a class="btn" href="/wholesale/">Wholesale enquiry</a><a class="btn alt" href="#others">Other blends</a></div>
  </div>
  <div class="sku-art"><div class="bg" style="background-image:linear-gradient(180deg,{s['bg']}33,{s['bg']}00 60%),url(/assets/img/{s['tile']})"></div>{bottle(s)}</div>
</div></section>

<section><div class="wrap detail">
  <div><p class="eyebrow">Serve</p><h2>How we like it.</h2><p>{s['serve']}</p>
  <p class="note">Enjoy responsibly.</p></div>
  <div><p class="eyebrow">Specification</p>
    <dl class="kv">
      <dt>Product</dt><dd>Beach Heaven {s['name']}</dd>
      <dt>Category</dt><dd>{CATEGORY}</dd>
      <dt>Alcohol</dt><dd>{s['abv']}% vol.</dd>
      <dt>Bottle</dt><dd>{s['vol']} cl</dd>
      <dt>Colour</dt><dd>{s['colour']}</dd>
      <dt>EAN</dt><dd>{s['ean']}</dd>
    </dl></div>
</div></section>

<section class="others" id="others"><div class="wrap">
  <div class="sec-head"><p class="eyebrow">Keep exploring</p><h2>The other blends.</h2></div>
  <div class="cards">
{others}
  </div>
</div></section>
"""
    html += FOOTER
    write(f"/{s['slug']}/index.html", html)

# ---- wholesale ----
def wholesale():
    html = head("Wholesale | Beach Heaven",
                "Wholesale and trade enquiries for Beach Heaven tropical spirit drinks: bars, restaurants, beach clubs, retailers and distributors.",
                "/wholesale/", JSONLD) + header()
    rows = "".join(f"<tr><th>{s['name']}</th><td>{s['ean']}</td><td>{s['abv']}% vol.</td><td>{s['vol']} cl</td></tr>" for s in SKUS)
    html += f"""<section class="page-hero"><div class="wrap">
  <p class="eyebrow">For the trade</p><h1>Wholesale &amp; distribution.</h1>
  <p>Beach Heaven is made for bars, restaurants, beach clubs, hotels, retailers and importers. Send us a few details and we'll come back with pricing and availability.</p>
</div></section>

<section><div class="wrap two">
  <form class="form" id="wholesale-form" data-to="{CONTACT}">
    <div><label for="f-name">Your name</label><input id="f-name" name="name" required autocomplete="name"></div>
    <div><label for="f-company">Company</label><input id="f-company" name="company" required autocomplete="organization"></div>
    <div><label for="f-email">Email</label><input id="f-email" name="email" type="email" required autocomplete="email"></div>
    <div><label for="f-country">Country</label><input id="f-country" name="country" required autocomplete="country-name"></div>
    <div class="full"><label for="f-type">Business type</label>
      <select id="f-type" name="type"><option>Bar or restaurant</option><option>Hotel or beach club</option><option>Retailer</option><option>Distributor or importer</option><option>Other</option></select></div>
    <div class="full"><label for="f-msg">Message</label><textarea id="f-msg" name="message" placeholder="Which blends, expected volumes, delivery country"></textarea></div>
    <div class="full"><button class="btn" type="submit">Send enquiry</button>
      <p class="note" style="margin:12px 0 0">This opens your email app with the enquiry filled in. You can also write to <a href="mailto:{CONTACT}">{CONTACT}</a>.</p></div>
  </form>
  <div>
    <p class="eyebrow">Product data</p><h2>The range.</h2>
    <div class="scroll-x"><table class="spec"><thead><tr><th>Blend</th><th>EAN</th><th>Alcohol</th><th>Bottle</th></tr></thead><tbody>{rows}</tbody></table></div>
    <p class="note" style="margin-top:14px">Category: {CATEGORY}. Producer: Kroonbrau BV, Amsterdam.</p>
  </div>
</div></section>
"""
    html += FOOTER
    write("/wholesale/index.html", html)

def extras():
    write("/404.html", head("Page not found | Beach Heaven", "Page not found.", "/404.html") + header()
          + """<section class="page-hero"><div class="wrap"><p class="eyebrow">404</p><h1>This beach doesn't exist.</h1><p><a class="btn" href="/">Back to Beach Heaven</a></p></div></section>""" + FOOTER)
    import pages2
    urls = ["/", "/pink-dream/", "/lychee-bliss/", "/spiced-velvet/", "/wholesale/"] + pages2.sitemap_urls()
    write("/sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
          + "\n".join(f"  <url><loc>{DOMAIN}{u}</loc></url>" for u in urls) + "\n</urlset>\n")
    write("/robots.txt", f"User-agent: *\nAllow: /\nSitemap: {DOMAIN}/sitemap.xml\n")
    write("/favicon.svg", """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0F6B78"/><circle cx="32" cy="36" r="14" fill="#F9AF8F"/><path d="M8 40c8-6 14-6 24 0s16 6 24 0v16H8z" fill="#8FD0CB"/></svg>""")

if __name__ == "__main__":
    home()
    for s in SKUS: sku_page(s)
    wholesale(); extras()
    import pages2; pages2.run()
    print("built")
