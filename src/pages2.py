"""Extra sections: Our Rums, Cocktails, Experiences, Contact."""
import json
from build import (SKUS, BY_KEY, DOMAIN, CONTACT, CATEGORY, JSONLD, head, header, FOOTER, bottle, write)
from content import COCKTAILS, ARTICLES

BY_COCKTAIL = {c["slug"]: c for c in COCKTAILS}

def cocktail_card(c):
    s = BY_KEY[c["key"]]
    return f"""<a class="card {s['key']}" href="/cocktails/{c['slug']}/">
  <div class="art" style="background-image:linear-gradient(180deg,{s['bg']}00 55%,{s['bg']} 100%),url(/assets/img/{s['tile']})">{bottle(s)}</div>
  <div class="body"><p class="tag">Made with {s['name']}</p><h3>{c['name']}</h3><p>{c['blurb']}</p><span class="more">Get the recipe &rarr;</span></div>
</a>"""


def cocktail_tile(c):
    s = BY_KEY[c["key"]]
    shown = c["ingredients"][:3]
    rest = len(c["ingredients"]) - len(shown)
    ing = "".join(f"<li>{a + ' ' if a else ''}{n}</li>" for a, n in shown)
    more = f'<li class="more-ing">+{rest} ingredient{"s" if rest > 1 else ""}</li>' if rest > 0 else ""
    return f"""<a class="tile {s['key']}" href="/cocktails/{c['slug']}/" data-blend="{s['key']}" data-level="{c['level']}" data-flavor="{c['flavor']}">
  <div class="art" style="background-image:linear-gradient(180deg,{s['bg']}00 55%,{s['bg']} 100%),url(/assets/img/{s['tile']})">{bottle(s)}</div>
  <div class="body"><p class="tag">Made with {s['name']}</p><h3>{c['name']}</h3>
    <ul class="ing-prev">{ing}{more}</ul>
    <dl class="meta"><div><dt>Level</dt><dd>{c['level']}</dd></div><div><dt>Flavour</dt><dd>{c['flavor']}</dd></div><div><dt>Prep</dt><dd>{c['prep']} min</dd></div></dl>
    <span class="more">View cocktail &rarr;</span></div>
</a>"""

def post_card(a):
    s = BY_KEY[a["key"]]
    return f"""<a class="post {s['key']}" href="/experiences/{a['slug']}/">
  <div class="thumb" style="background-image:url(/assets/img/{s['tile']})"></div>
  <div class="pbody"><p class="tag">{a['date']} &middot; {a['read']}</p><h3>{a['title']}</h3><p>{a['excerpt']}</p><span class="more">Read &rarr;</span></div>
</a>"""

def teasers():
    cocks = "\n".join(cocktail_card(c) for c in (COCKTAILS[1], COCKTAILS[2], COCKTAILS[4]))
    posts = "\n".join(post_card(a) for a in ARTICLES)
    return f"""<section><div class="wrap">
  <div class="sec-head"><p class="eyebrow">Cocktails</p><h2>Easy serves, big flavour.</h2>
  <p>From a two-ingredient long drink to a proper shaken classic.</p></div>
  <div class="cards">
{cocks}
  </div>
  <p style="margin-top:32px"><a class="btn alt" href="/cocktails/">All cocktails</a></p>
</div></section>

<section class="facts"><div class="wrap">
  <div class="sec-head"><p class="eyebrow">Experiences</p><h2>Ideas for good evenings.</h2></div>
  <div class="posts">
{posts}
  </div>
  <p style="margin-top:32px"><a class="btn alt" href="/experiences/">All stories</a></p>
</div></section>
"""

def our_rums():
    html = head("Our Rums | Beach Heaven",
                f"Meet Pink Dream, Lychee Bliss and Spiced Velvet: three Beach Heaven {CATEGORY.lower()}s. {SKUS[0]['abv']}% vol., 70 cl.",
                "/our-rums/", JSONLD) + header("rums")
    html += """<section class="page-hero"><div class="wrap"><p class="eyebrow">Our Rums</p><h1>Three blends, three moods.</h1>
<p>Beach Heaven is a rum-based tropical spirit drink, bottled at 37.5% vol. in 70 cl. Pick your colour.</p></div></section>
"""
    for s in SKUS:
        chips = "".join(f"<li>{n}</li>" for n in s["notes"])
        cocks = [c for c in COCKTAILS if c["key"] == s["key"]]
        html += f"""<section class="band {s['key']}"><div class="wrap">
  <div class="sku-art"><div class="bg" style="background-image:linear-gradient(180deg,{s['bg']}33,{s['bg']}00 60%),url(/assets/img/{s['tile']})"></div>{bottle(s)}</div>
  <div>
    <p class="cat">{CATEGORY}</p>
    <h2>{s['name']}</h2>
    <p class="lead">{s['lead']}</p>
    <ul class="chips"><li>{s['abv']}% vol.</li><li>{s['vol']} cl</li>{chips}</ul>
    <div class="cta" style="display:flex;gap:14px;flex-wrap:wrap"><a class="btn" href="/{s['slug']}/">Discover {s['name']}</a>
    <a class="btn alt" href="/cocktails/{cocks[0]['slug']}/">Try a cocktail</a></div>
  </div>
</div></section>
"""
    html += FOOTER
    write("/our-rums/index.html", html)

def cocktails_index():
    html = head("Rum Cocktails | Beach Heaven",
                "Simple, delicious cocktail recipes made with Beach Heaven Pink Dream, Lychee Bliss and Spiced Velvet.",
                "/cocktails/", JSONLD) + header("cocktails")
    flavors = sorted({c["flavor"] for c in COCKTAILS})
    opt = lambda vals: "".join(f'<option value="{v}">{v}</option>' for v in vals)
    html += f"""<section class="page-hero"><div class="wrap"><p class="eyebrow">Cocktails</p><h1>Show me tropical cocktails for any occasion.</h1>
<p>{len(COCKTAILS)} simple serves, four for each blend. Every recipe makes one drink.</p></div></section>
<section><div class="wrap">
  <div class="filters" id="cocktail-filters">
    <div><label for="f-blend">Blend</label><select id="f-blend" data-filter="blend"><option value="">All blends</option>{''.join(f'<option value="{s["key"]}">{s["name"]}</option>' for s in SKUS)}</select></div>
    <div><label for="f-level">Level</label><select id="f-level" data-filter="level"><option value="">Any level</option>{opt(["Easy", "Intermediate"])}</select></div>
    <div><label for="f-flavor">Flavour</label><select id="f-flavor" data-filter="flavor"><option value="">Any flavour</option>{opt(flavors)}</select></div>
    <p class="count" id="filter-count" aria-live="polite"></p>
  </div>
  <div class="tiles" id="tiles">
{''.join(cocktail_tile(c) for c in COCKTAILS)}
  </div>
  <p class="empty" id="filter-empty" hidden>No cocktails match these filters.</p>
</div></section>
"""
    html += FOOTER
    write("/cocktails/index.html", html)

def cocktail_page(c):
    s = BY_KEY[c["key"]]
    ing = "".join(f"<li><span>{a}</span> {n}</li>" if a else f"<li><span></span> {n}</li>" for a, n in c["ingredients"])
    steps = "".join(f"<li>{t}</li>" for t in c["steps"])
    ld = {"@context": "https://schema.org", "@type": "Recipe", "name": c["name"], "description": c["blurb"],
          "recipeCategory": "Cocktail", "recipeYield": "1 drink", "prepTime": f"PT{c['prep']}M",
          "recipeIngredient": [f"{a} {n}".strip() for a, n in c["ingredients"]],
          "recipeInstructions": [{"@type": "HowToStep", "text": t} for t in c["steps"]],
          "author": {"@type": "Organization", "name": "Beach Heaven"}}
    extra = JSONLD + '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + "</script>"
    html = head(f"{c['name']} cocktail recipe | Beach Heaven",
                f"{c['name']}: {c['blurb']} Made with Beach Heaven {s['name']}.",
                f"/cocktails/{c['slug']}/", extra) + header("cocktails")
    others = "\n".join(cocktail_card(o) for o in COCKTAILS if o["slug"] != c["slug"] and o["key"] != c["key"])[:0]
    more = [o for o in COCKTAILS if o["slug"] != c["slug"]][:3]
    html += f"""<section class="sku-hero {s['key']}"><div class="wrap">
  <div>
    <p class="cat">Cocktail &middot; Made with {s['name']}</p>
    <h1 style="font-size:clamp(3rem,7vw,5.4rem)">{c['name']}</h1>
    <p class="lead">{c['blurb']}</p>
    <ul class="chips"><li>Serves 1</li><li>{c['level']}</li><li>{c['flavor']}</li><li>{c['prep']} min</li><li>{c['glass']}</li><li>Garnish: {c['garnish']}</li></ul>
    <div class="cta" style="display:flex;gap:14px;flex-wrap:wrap"><a class="btn" href="/{s['slug']}/">About {s['name']}</a><a class="btn alt" href="/cocktails/">All cocktails</a></div>
  </div>
  <div class="sku-art"><div class="bg" style="background-image:linear-gradient(180deg,{s['bg']}33,{s['bg']}00 60%),url(/assets/img/{s['tile']})"></div>{bottle(s)}</div>
</div></section>

<section><div class="wrap detail">
  <div><p class="eyebrow">Ingredients</p><h2>What you need.</h2><ul class="ing">{ing}</ul></div>
  <div><p class="eyebrow">Method</p><h2>How to make it.</h2><ol class="steps">{steps}</ol>
  <p class="note">Enjoy responsibly.</p></div>
</div></section>

<section><div class="wrap">
  <div class="sec-head"><p class="eyebrow">Keep pouring</p><h2>More cocktails.</h2></div>
  <div class="cards">
{''.join(cocktail_card(o) for o in more)}
  </div>
</div></section>
"""
    html += FOOTER
    write(f"/cocktails/{c['slug']}/index.html", html)

def experiences_index():
    html = head("Experiences | Beach Heaven",
                "Stories and ideas for good evenings: hosting tips, serving ideas and the little details behind a great drink.",
                "/experiences/", JSONLD) + header("experiences")
    html += f"""<section class="page-hero"><div class="wrap"><p class="eyebrow">Experiences</p><h1>Ideas for good evenings.</h1>
<p>Hosting tips, serving ideas and small details that make a drink better.</p></div></section>
<section><div class="wrap"><div class="posts">
{''.join(post_card(a) for a in ARTICLES)}
</div></div></section>
"""
    html += FOOTER
    write("/experiences/index.html", html)

def article_page(a):
    s = BY_KEY[a["key"]]
    body = ""
    for part in a["body"]:
        if isinstance(part, tuple):
            body += f"<h3>{part[1]}</h3>\n"
        else:
            body += f"<p>{part}</p>\n"
    ld = {"@context": "https://schema.org", "@type": "Article", "headline": a["title"], "description": a["excerpt"],
          "datePublished": "2026-10-10", "author": {"@type": "Organization", "name": "Beach Heaven"},
          "publisher": {"@type": "Organization", "name": "Beach Heaven"}}
    extra = JSONLD + '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + "</script>"
    html = head(f"{a['title']} | Beach Heaven", a["excerpt"], f"/experiences/{a['slug']}/", extra) + header("experiences")
    more = [o for o in ARTICLES if o["slug"] != a["slug"]]
    html += f"""<section class="article-hero {s['key']}"><div class="wrap narrow">
  <p class="cat"><a href="/experiences/">Experiences</a> &middot; {a['date']} &middot; {a['read']}</p>
  <h1>{a['title']}</h1><p class="lead">{a['excerpt']}</p>
</div></section>
<article class="wrap narrow prose">
{body}
</article>
<section class="facts"><div class="wrap">
  <div class="sec-head"><p class="eyebrow">Keep reading</p></div>
  <div class="posts two">{''.join(post_card(o) for o in more)}</div>
</div></section>
"""
    html += FOOTER
    write(f"/experiences/{a['slug']}/index.html", html)

def contact():
    html = head("Contact | Beach Heaven",
                "Get in touch with Beach Heaven: general questions, wholesale and distribution, press and media.",
                "/contact/", JSONLD) + header("contact")
    html += f"""<section class="page-hero"><div class="wrap"><p class="eyebrow">Contact</p><h1>Say hello.</h1>
<p>Questions about Beach Heaven, trade enquiries or press: write to us and we will get back to you.</p></div></section>
<section><div class="wrap two">
  <form class="form" id="contact-form" data-to="{CONTACT}">
    <div><label for="c-name">Your name</label><input id="c-name" name="name" required autocomplete="name"></div>
    <div><label for="c-email">Email</label><input id="c-email" name="email" type="email" required autocomplete="email"></div>
    <div class="full"><label for="c-topic">Topic</label>
      <select id="c-topic" name="topic"><option>General question</option><option>Wholesale or distribution</option><option>Press and media</option><option>Something else</option></select></div>
    <div class="full"><label for="c-msg">Message</label><textarea id="c-msg" name="message" required></textarea></div>
    <div class="full"><button class="btn" type="submit">Send message</button>
      <p class="note" style="margin:12px 0 0">This opens your email app with the message filled in.</p></div>
  </form>
  <div>
    <p class="eyebrow">Write to us</p><h2>Get in touch.</h2>
    <dl class="kv">
      <dt>Email</dt><dd><a href="mailto:{CONTACT}">{CONTACT}</a></dd>
      <dt>Trade</dt><dd><a href="/wholesale/">Wholesale enquiries</a></dd>
      <dt>Producer</dt><dd>Kroonbrau BV, Amsterdam</dd>
    </dl>
  </div>
</div></section>
"""
    html += FOOTER
    write("/contact/index.html", html)

def run():
    our_rums(); cocktails_index()
    for c in COCKTAILS: cocktail_page(c)
    experiences_index()
    for a in ARTICLES: article_page(a)
    contact()

def sitemap_urls():
    u = ["/our-rums/", "/cocktails/", "/experiences/", "/contact/"]
    u += [f"/cocktails/{c['slug']}/" for c in COCKTAILS]
    u += [f"/experiences/{a['slug']}/" for a in ARTICLES]
    return u
