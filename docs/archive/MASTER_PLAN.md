# Master Plan · Explore Switzerland

> A calmer, more expandable website that earns its keep.
> Style: editorial minimalism × cinematic photography. Motion: quiet, purposeful.
> Money: affiliate-first for six months. Growth: SEO via regional and thematic depth.

---

## 0 · North Star

Build a travel site that **feels like a magazine you want to read** and **works like a tool that actually books your trip**. Everything below is in service of two numbers:

1. **Weekly active visitors** (proxy for SEO + brand)
2. **Affiliate click-through to partner checkout** (the only direct revenue lever for now)

Nothing ships that doesn't move one of those.

---

## 1 · What's wrong with the current landing page

An honest read of the current `/` page:

- **Eight sections above the fold worth of reading** before a first real decision — overwhelming.
- **Too many motion layers** competing for attention (animated gradients, fade-ups, soft-pulses, parallax, gondola, snow) — none of them individually bad, collectively noisy.
- **Every CTA looks important** — no visual priority. The eye ricochets.
- **No restraint on color** — red, amber, gold, sunrise, glacier all play at once.
- **Value proposition is diffused** — visitors don't immediately know whether this is a booking site, a guide, or a magazine.

The fix is not *less beautiful*. It's *quieter and more confident*.

---

## 2 · New Landing Page — Editorial × Cinematic

The page reads like the first spread of a travel magazine. One photograph, one sentence, one action. Everything else is a calm scroll away.

### 2.1 Above the fold (the only part most visitors see)

```
┌────────────────────────────────────────────────────────────┐
│  logo                                nav · EN · plan a trip│
│                                                             │
│                                                             │
│      Switzerland,                                           │
│      written as a country.                                  │
│                                                             │
│      A quiet guide to mountains, trains, and                │
│      the small towns between them.                          │
│                                                             │
│      [  Begin the journey  →  ]   [ or · surprise me ]      │
│                                                             │
│                                                             │
│  ··· (subtle: "This week: autumn in Ticino" kicker) ···     │
└────────────────────────────────────────────────────────────┘
     ← background: single full-bleed cinematic photo,
       very slow ken-burns (18s), 30% dark gradient for legibility
```

**Rules**

- **One** headline, **one** subhead, **one** primary CTA. Secondary is a ghost text link.
- **One** background photo, rotating weekly (not per load). A photo earns its place; it doesn't cycle.
- **One** subtle motion element (the ken-burns). Nothing else moves above the fold.
- **Zero** search bar on desktop — it lives in the sticky nav after scroll. On mobile, it collapses into a small search icon.
- **Zero** badges, snowflakes, gondolas, aurora, drifting elements, seasonal gradient switches. All of these move to deeper pages where they *earn* the viewer's attention.

### 2.2 Scroll 1 — "The Three Doors" (decision surface)

Three large, equally-weighted cards. Not six. The copy tells someone what to click:

1. **I want to browse** → Destinations
2. **I want to plan** → Itineraries
3. **I want to book today** → Activities (in-season, high-intent)

Each card has: a single photo, a serif label, one line of copy, one arrow. No icons, no badges, no pricing chips. That kind of density comes later, when the user opts in.

### 2.3 Scroll 2 — "This week on the rails" (editorial feature)

One featured *story* from `/stories`, full-bleed image left, pull quote right. This is the magazine spine of the brand and also a content funnel into long-tail SEO.

### 2.4 Scroll 3 — "In season right now" (revenue surface)

Four cards, same size, same treatment. These are the highest-affiliate-EPC activities in the current season. **This is the money scroll.** Everything above was trust-building so this scroll converts.

### 2.5 Scroll 4 — "The quiet promise" (trust + newsletter)

Four bullets on why to trust us, one email-capture. Newsletter is the strongest non-SEO retention asset we own.

### 2.6 Scroll 5 — Footer

A proper editorial footer: sitemap columns, a handwritten-feel "— fin" mark, affiliate disclosure, small country flag. This is where the rich typographic personality lives, because the reader has already decided whether to stay.

### 2.7 What this costs us

- 80% of the current homepage sections move to deeper pages (they're still built, still valuable, just not all screaming on page 1).
- Time-on-page drops slightly, scroll-depth drops, but click-through to deeper pages *rises*, and that's the metric that makes affiliate revenue.

---

## 3 · Information Architecture (15–20 pages)

The site is organised around **five verbs**: Discover, Plan, Experience, Know, Read. Every page lives in exactly one verb bucket, no exceptions.

```
/ (Landing)
│
├── DISCOVER ─────────────────────────
│   /destinations                        (existing — cleaned up)
│   /destinations/[slug]                 (existing — regional detail)
│   /regions                             NEW · overview of 6 Swiss regions
│   /regions/[region]                    NEW · Bernese Oberland, Valais,
│                                              Graubünden, Ticino, Mittelland, Jura
│   /cities/[city]                       NEW · Zurich, Geneva, Lucerne,
│                                              Interlaken, Bern, Basel, Zermatt, Lugano
│   /map                                 (existing)
│
├── PLAN ─────────────────────────────
│   /itineraries                         (existing)
│   /itineraries/[slug]                  (existing)
│   /planner                             (existing)
│   /budget                              (existing — rename: Budget Explorer)
│   /travel-passes                       (existing)
│   /when-to-go                          NEW · month-by-month + season guide
│
├── EXPERIENCE ──────────────────────
│   /activities                          (existing)
│   /activities/[slug]                   (existing)
│   /experiences/outdoor                 NEW · themed hub ("hiking in Switzerland")
│   /experiences/culture                 NEW
│   /experiences/food-wine               NEW
│   /experiences/winter                  NEW
│   /experiences/family                  NEW
│   /deals                               (existing)
│
├── KNOW ────────────────────────────
│   /tools/packing-list                  NEW · interactive, season-aware
│   /tools/cost-calculator               NEW · "what a week in Switzerland costs"
│   /tools/pass-decider                  NEW · a 60-second quiz: do you need a pass?
│   /about                               (existing)
│   /partners                            NEW · affiliate disclosures, FAQ
│
└── READ ────────────────────────────
    /stories                             NEW · editorial magazine hub
    /stories/[slug]                      NEW · long-form articles (current blog reworked)
    /guides                              NEW · practical evergreen ("Best hikes 2026")
    /guides/[slug]                       NEW
```

That's **21 top-level URL patterns**, with collection pages that scale to hundreds of generated URLs (a city, a region, a story, a guide). This is your SEO surface — the reason a search engine takes you seriously.

### 3.1 Navigation (less overwhelming)

The current header lists nine nav items. That is the number-one reason the site feels dense. New structure:

```
Destinations ▾     Plan ▾     Experience ▾     Stories     Deals
              (mega-menu: 3 columns under each dropdown)
```

Five items in the primary nav. The dropdown mega-menus surface the 15+ deeper pages without cluttering the top bar. Search and language move to the right side. A small "Compare" chip only appears when the user has selected items.

### 3.2 The "expandable" part

Because each verb has its own hub page (e.g. `/experiences`, `/stories`, `/regions`), adding new content later never means adding to the nav. A new theme = a new `/experiences/[theme]` page under an existing bucket. A new article = a `/stories/[slug]` under the existing Stories hub. The IA is deliberately designed to absorb growth without redesign.

---

## 4 · Motion System (cleaner, fewer, better)

Every animation currently in the codebase is kept, but **only four are used on any given page.** The others become opt-in library utilities that chapters can pull from deliberately.

### 4.1 The motion vocabulary

| Name            | When                              | Timing                                      |
|-----------------|-----------------------------------|---------------------------------------------|
| **Entrance**    | Sections as they scroll into view | 700ms `cubic-bezier(0.22, 1, 0.36, 1)`, 28px rise, staggered ×100ms |
| **Ken Burns**   | Hero and featured photographs     | 20s linear, 1.00 → 1.06 scale                |
| **Hover lift**  | Any clickable card or CTA         | 300ms `ease-out`, −4px translate, soft shadow bloom |
| **Underline draw** | Text links                     | 450ms `cubic-bezier(0.22, 1, 0.36, 1)`, left-to-right scaleX |

That's it. Four moves.

### 4.2 What gets retired on the landing page

- Drifting gondolas, aurora, snow, soft-pulse glows — all move to dedicated immersive pages (e.g. `/experiences/winter`, `/regions/bernese-oberland`). The *winter* page earns snow. The *landing* doesn't.
- Animated gradient backgrounds — replaced by a single static photo.
- Multiple staggered fade-ups per section — one entrance per section, not per element.

### 4.3 Timing tokens (add to `tailwind.config.ts`)

```ts
// tailwind.config.ts → theme.extend
transitionTimingFunction: {
  'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'in-out-smooth': 'cubic-bezier(0.65, 0, 0.35, 1)',
},
transitionDuration: {
  '250': '250ms',
  '450': '450ms',
  '700': '700ms',
  '1200': '1200ms',
},
```

### 4.4 Motion principles (write these down and refuse to break them)

1. **Motion marks meaning, not decoration.** A thing moves because the eye should find it.
2. **One motion per viewport.** If two things move at once, delete one.
3. **Entrance, not loop.** Elements animate in, then rest. Nothing loops except the single hero photo.
4. **Respect `prefers-reduced-motion` everywhere.** Already implemented in `globals.css`.
5. **Timing consistency.** Every entrance uses the same curve and duration token. Inconsistency reads as amateur.

### 4.5 A quieter hero, concretely

Replace the current parallax hero (mountains + gondola + snow + aurora + pulses) with:

- A 16:9 full-bleed photo, 20s ken-burns, 40% top-down dark overlay.
- A 1px hairline divider between nav and hero for editorial polish.
- A soft word-reveal on the headline (first word fades up at 120ms, whole line by 480ms).
- Nothing else.

---

## 5 · Cashflow Strategy — Affiliate-First (6-month plan)

This is a realistic, non-hype-y path to the first **CHF 500–1,500 / month** of sustainable recurring revenue.

### 5.1 The five affiliate networks to sign up for (week 1)

| Partner                    | Typical commission | Why it fits                                              |
|----------------------------|--------------------|----------------------------------------------------------|
| **GetYourGuide**           | 6–8%               | Largest activity inventory in Switzerland (Jungfraujoch, Glacier Express, cooking classes). Fast approval. |
| **Viator (Tripadvisor)**   | 6–10%              | Backup inventory, sometimes better rates than GYG.       |
| **Booking.com** (via Awin) | ~3–4% net          | Hotels/apartments — high-volume, low-rate, but ubiquitous. |
| **Omio**                   | ~5%                | Intercity trains and buses, good for cross-border travel. |
| **Klook**                  | 3–6%               | Passes and select experiences, strong in Asia-origin traffic. |

Optional later (month 2–3):

- **SBB Swiss Travel Pass** (via their affiliate page, currently ~CHF 3 flat per sale)
- **Swiss Activities** (local OTA, often exclusive inventory)
- **Kayak / Skyscanner** (flight comparison)
- **Tourlane / Kimkim** (higher ticket, bespoke trips — good EPC)

### 5.2 Revenue math (conservative)

Assume a fully-functioning site 3 months in:

```
25,000 monthly visitors
× 35%   click a primary CTA                 =  8,750 CTAs
× 45%   of those reach a partner page       =  3,938 outbound
× 8%    convert on the partner              =    315 bookings
× CHF 110 average booking value             = CHF 34,650 GMV
× 5.5%  blended commission                  =  CHF 1,905 / month
```

That's a realistic month-6 target. Month-1 with ~3,000 visitors is more like CHF 80–150. Compounding matters.

### 5.3 Where affiliate links actually live

Not plastered everywhere — placed with editorial restraint:

- **Activity detail pages** — the primary booking button is affiliate. Above the fold.
- **Itinerary pages** — every stop has a "Book this" inline link.
- **Stories / guides** — contextual "where we stayed" and "how we booked" callouts.
- **Deals page** — deal list is 100% affiliate (full disclosure at top).
- **City pages** — hotel module pulled from Booking via affiliate widget.

### 5.4 Tracking + disclosure (don't cut corners here)

- **Single affiliate link table** in `src/data/affiliate-links.ts` → every outbound link is a function call like `buildAffiliateUrl('jungfraujoch', 'activity-detail')` so source-of-link is logged.
- **UTM tags** on every outbound: `?utm_source=exploreswitzerland&utm_medium=affiliate&utm_campaign=[page]&utm_content=[slot]`.
- **First-click event** logged to GA4: `affiliate_click`, with `partner` + `slot` params.
- **/partners page** publicly lists every network we use + the exact phrasing of disclosure.
- **Per-page disclosure** — small italic line near the first affiliate link: *"Booking through this link supports the site at no extra cost to you."*
- **`rel="sponsored noopener"`** on every affiliate `<a>` — Google requires it; it also protects pagespeed.

### 5.5 Non-affiliate revenue streams (opportunistic, not yet)

Park these for month 4+ once affiliate is producing:

- **Premium tier ("Explorer Pass", CHF 4.90/mo)** — offline maps, downloadable itineraries, ad-free. Only launch once we have 5k+ monthly actives and a real retention loop.
- **Sponsored editorial** — cantonal tourism boards pay CHF 2–5k for a labelled feature article. Requires outbound sales. High margin.
- **Newsletter sponsorships** — once list is >3,000 subscribers, worth ~CHF 200–500 per send.
- **Digital product** (e.g. "Switzerland in 10 Days" PDF, CHF 19) — small but real.

All of these are layered on top of affiliate, never replacing it. Affiliate is the floor.

---

## 6 · SEO & Traffic Strategy (the only free customer-acquisition channel)

Affiliate revenue is a function of traffic × conversion. Conversion is a design problem. Traffic is an SEO problem.

### 6.1 The three content shapes

- **Regional hubs** (`/regions/[region]`) — target *"things to do in [region]"*. Each hub hosts a map, 12–20 activities, a seasonal guide, three itineraries, and a "where to stay" module. These are your money pages.
- **Comparison guides** (`/guides/best-[thing]`) — *"best hikes in Switzerland"*, *"Swiss Travel Pass vs Half-Fare Card"*, *"Jungfraujoch vs Gornergrat"*. High commercial intent. Affiliate-dense.
- **Stories** (`/stories/[slug]`) — the magazine spine. Lower commercial intent, higher brand, serves as internal-link fuel and social-shareable content. These get backlinks; backlinks lift the money pages.

### 6.2 Publishing cadence

- **2 regional hubs** total, one per month → 6 by end of plan (we already have 6 Swiss regions).
- **3–4 guides per month** → 18–24 by month 6. These are the SEO workhorses.
- **1 story every two weeks** → 12 by month 6.

Total: ~40–50 new indexed pages in 6 months, each with a clean schema, a canonical URL, OG image, and an internal link graph that feeds the money pages.

### 6.3 Off-site

- Guest posts on 4–5 travel blogs per month — simple pitch, one follow-up, done.
- Pinterest account — Switzerland is one of the top-performing niches. Every story gets 3 pins.
- Answer Reddit (/r/Switzerland, /r/travel) honestly, with links only where they help.
- HARO/Qwoted — respond to journalist queries; builds Tier-1 backlinks.

---

## 7 · Competitive positioning

Quick read of the competition and where we fit:

- **MySwitzerland.com** (official tourism board) — authoritative but corporate, slow, trapped in its own IA.
- **SwitzerlandTourism.com** — marketing-heavy, thin on actual planning help.
- **GetYourGuide / Viator** — transactional, no narrative, no trust-building.
- **Lonely Planet Switzerland** — text-heavy, dated visuals.
- **Travelgluten / The Travel Hack / nomadicmatt** — strong voice but thin on structured data and tools.

**Our wedge**: *"A magazine with a booking engine underneath."* Editorial voice + honest pricing advice + a proper pass-decider and cost-calculator. None of them have the full combination.

---

## 8 · Six-Week Implementation Roadmap

Each week is a shippable milestone. Feature freeze on Friday, ship Saturday, measure Sunday.

### Week 1 · Landing page reset + affiliate plumbing

- Replace current hero with editorial × cinematic version (section 2).
- Collapse homepage to 5 scrolls max.
- Ship `src/data/affiliate-links.ts` + `buildAffiliateUrl()` helper.
- Apply for GetYourGuide, Viator, Booking.com (Awin), Omio affiliate programs.
- Add `/partners` disclosure page.

**Success metric**: landing page LCP < 1.8s, homepage bounce rate down 10% within a week.

### Week 2 · Navigation + IA restructure

- Ship new 5-item nav with mega-menus.
- Create stub pages for all new URLs so internal linking doesn't 404.
- Rename `/blog` → `/stories` with 301 redirect.
- Remove landing-page animations that don't fit the motion vocabulary.

**Success metric**: 3+ internal page views per session (currently ~1.6).

### Week 3 · Regional hubs (the money pages)

- Ship `/regions` overview and 2 of 6 regions fully (pick Bernese Oberland + Valais — highest search volume).
- Each region page: map, 12 activities, 3 itineraries, seasonal note, affiliate-linked "where to stay".
- Add breadcrumb schema + FAQ schema.

**Success metric**: first 3 regional pages indexed on Google within a week.

### Week 4 · Guides + comparison pages

- Ship 4 guides: *"Swiss Travel Pass vs Half-Fare Card"*, *"Best hikes in Switzerland (2026)"*, *"Zermatt vs Grindelwald"*, *"Jungfraujoch: is it worth it?"*.
- These are the affiliate-dense workhorses. Each needs a table, a verdict, and a clear "book here" CTA.
- Ship `/tools/pass-decider` (the 60-second quiz).

**Success metric**: first CHF 50 of affiliate revenue recorded.

### Week 5 · Stories engine + newsletter

- Ship `/stories` hub with MDX-driven posts (already partly in the codebase).
- Migrate existing blog posts into the new template.
- Ship a proper newsletter opt-in with lead magnet (*"10 overlooked Swiss day-trips"* PDF).
- Integrate a real ESP (Resend + Buttondown, or Beehiiv for simpler).

**Success metric**: 200 subscribers in the first 2 weeks post-launch.

### Week 6 · Measurement, A/B, polish

- GA4 goals for every affiliate click.
- A/B test hero headline and primary CTA copy (PostHog or GrowthBook free tiers).
- Lighthouse pass > 90 across landing, regional hubs, guides.
- Cut the still-unused parts of the old animation library that nothing in the IA uses.
- Publish the 1st month-in-review blog post internally.

**Success metric**: a full funnel report from impression → click → outbound → partner booking.

---

## 9 · What this plan deliberately does NOT include

Equally important to be honest about:

- **No AI chatbot** — trendy, expensive, doesn't convert in travel yet.
- **No user accounts / saved trips** — until we hit 20k monthly actives, accounts are a distraction.
- **No mobile app** — the PWA is sufficient until there's a product reason for an app.
- **No paid ads** — every franc there is better spent on SEO content for now.
- **No display ads / AdSense** — strictly incompatible with the editorial brand we're building.

These all become interesting again at month 9+. Not now.

---

## 10 · Definition of "done" (the moment you know it worked)

By end of week 6, the site should be able to pass **all five** of these tests:

1. A friend opens the landing page for the first time and says "this looks like a real thing" within 5 seconds.
2. A stranger can plan a 4-day trip using only the site, end-to-end, without opening Google.
3. A search for *"best hikes in Switzerland 2026"* surfaces at least one of our pages on page 2+ of Google.
4. Monthly affiliate dashboard shows any non-zero commission.
5. The team ships a new story or guide without touching the navigation code.

If all five pass, the foundation is real. Everything after is compounding.

---

## Appendix A · File-level changes required in the codebase

This is a short, opinionated list to hand off to engineering:

- `src/app/page.tsx` — rewrite to section 2's five-scroll structure. Remove ParallaxHero, SnowLayer, aurora, gondola from landing; they remain available for deeper pages.
- `src/components/immersive/*` — keep all components as a library; their usage is now opt-in per page.
- `src/components/layout/header.tsx` — new 5-item nav + mega-menu component (new file: `header-mega-menu.tsx`).
- `src/data/affiliate-links.ts` — NEW. Single source of truth for all outbound URLs.
- `src/lib/affiliate.ts` — extend with `buildAffiliateUrl(partner, slug, slot)` and GA4 event dispatch.
- `src/app/regions/` — NEW route group + `[region]/page.tsx`.
- `src/app/cities/[city]/page.tsx` — NEW.
- `src/app/experiences/[theme]/page.tsx` — NEW.
- `src/app/tools/pass-decider/page.tsx` — NEW (interactive quiz).
- `src/app/stories/` — rename from `src/app/blog/` with 301s in `next.config.mjs` (existing `redirects()` block).
- `src/app/partners/page.tsx` — NEW disclosure page.
- `src/data/regions.ts`, `src/data/cities.ts`, `src/data/experiences.ts` — NEW seed data.
- `tailwind.config.ts` — add timing-function + duration tokens from section 4.3.
- `src/app/globals.css` — deprecate the loopy animations (`animate-drift`, `animate-aurora`, `animate-snow`, `animate-cable`, `animate-rotate-slow`) from general utilities; move them behind a `.immersive-page` scope so they can only be used intentionally.

---

## Appendix B · Measurement stack (free until meaningful)

- **Analytics** — GA4 (already wired) + Vercel Analytics (already wired) for real-user perf.
- **Affiliate tracking** — network dashboards + our own GA4 `affiliate_click` event cross-referenced.
- **A/B testing** — GrowthBook free tier or PostHog free tier.
- **Search** — Google Search Console (connect week 1), Bing Webmaster Tools (10 minutes, free traffic leak).
- **SEO monitoring** — Ahrefs Webmaster Tools (free for owned sites), SerpAPI for rank tracking of 20 target keywords.
- **Uptime** — BetterStack or Uptimerobot free tier.

Total monthly cost of measurement stack: **CHF 0** for the first 6 months.

---

*This plan is deliberately short on fireworks and long on compounding. The goal is a site that looks like a magazine, earns like a booking engine, and grows by itself while you focus on content instead of fighting the design.*
