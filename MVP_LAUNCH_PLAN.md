# MVP Launch Plan — realswitzerland.ch

> **Status:** Final, supersedes `LAUNCH_PLAN.md`, `LAUNCH_PLAN_v2.md`, `MASTER_PLAN.md`, `PLAN_ExploreSwitzerland.md`, `LAUNCH_FEATURES.md`.
> Authored 2026-05-15.
> Owner: Till. Engineering partner: Claude.

---

## 0. Reality check on the 7-day timeline

You said: **7 days bare-minimum**, but also want **live prices + real search across 1,513 activities + destinations + SEO content**. Those don't fit in one week. I'm not going to pretend they do.

So the plan splits into two compressed phases:

| Phase | Days | Scope | Outcome |
|---|---|---|---|
| **Phase 1 — Money MVP** | 1–7 | Cut to essentials. Real affiliate IDs wired. Static prices + good-enough server-side filtering. 5 destinations. 5 SEO stories restored. | Site live at https://realswitzerland.ch. Every activity page has working, tracked affiliate CTAs. GA4 reports `affiliate_click` events. |
| **Phase 2 — Depth pass** | 8–21 | Live price adapters turned on. Full-text + faceted search via MeiliSearch. Personalization unlocked. SEO content engine started. | Click-through rates start compounding. Site feels "dynamic." |

**Phase 2 only happens if Phase 1 is shipped.** No exceptions, no bleed-over.

---

## 1. What stays in MVP, what gets cut

### Keep in nav (the revenue funnel)
- `/` — home
- `/activities` — list, filterable
- `/activities/[slug]` — detail page (the highest-converting URL on the site)
- `/destinations/[slug]` — 5 city pages (Zurich, Lucerne, Interlaken, Zermatt, Geneva)
- `/compare` — side-by-side comparison
- `/blog` or `/stories` — 5 hand-picked SEO articles
- `/about`, `/privacy` — minimal, but exist

### Hide from nav (route stays, feature-flagged off)
`/planner`, `/budget`, `/surprise`, `/itineraries`, `/travel-passes`, `/map`, `/guides`, `/partners`, `/deals`, `/regions`, `/plan`

These get a `NEXT_PUBLIC_FEATURE_<NAME>=off` env flag. The page returns `notFound()` when off. Nothing is deleted — we can flip them back on individually in Phase 2 as each is polished.

### DELETE outright (Day 1)
- `content/activities 2/`, `content/activities 3/` — Finder-copy duplicates, ~3MB wasted
- `content/itineraries 2/`, `itineraries 3/`, `stories 2/`, `stories 3/` — same
- `Switzerland Activities.html` — 82KB legacy mock, references `wander.ch`
- `LAUNCH_PLAN.md`, `LAUNCH_PLAN_v2.md`, `MASTER_PLAN.md`, `PLAN_ExploreSwitzerland.md`, `GUIDE_StepByStep.md`, `LAUNCH_FEATURES.md` → move to `docs/archive/` (don't delete — git history matters less than skim-ability)

### Cut activity count: 1,513 → ~200
1,513 activities at launch is an **SEO liability**, not an asset. Each thin page competes with the others for the same keywords; Google de-prioritizes "doorway" content. I'll write `scripts/select-mvp-activities.mjs` that keeps:
- Activities with a confirmed, non-stock photo
- Activities with ≥1 real marketplace listing (deep link, not search-template)
- Even distribution across the 5 MVP destinations (~40 each)
- The other ~1,300 stay in `content/activities/` but are **excluded from the sitemap and nav** until Phase 2 image/price audit clears them.

---

## 2. Phase 1 — Day-by-day plan

**Time budget assumed:** ~6 focused hours/day for 7 days = ~42 hours total. Adjust honestly with me if your real budget is half that — I'll recompress.

### Day 1 — Repo cleanup + infrastructure (5h)
1. Delete duplicate content folders + legacy HTML (30 min).
2. Move old launch plans → `docs/archive/` (10 min).
3. Add `FEATURE_FLAGS` constants in `src/lib/constants.ts` + wire feature-flagged routes (60 min).
4. Run `scripts/select-mvp-activities.mjs` → tag 200 winners (90 min — script doesn't exist yet, I'll write it).
5. Vercel project: connect repo, add custom domain, configure env vars placeholder (45 min).
6. Confirm DNS: where is `realswitzerland.ch` pointed today? Update to Vercel nameservers or A/CNAME records (15 min).
7. Plug in real `NEXT_PUBLIC_GA_ID` — verify pageviews show up in GA4 DebugView (30 min).

**Day 1 verification gate:** Vercel preview deploy renders, GA4 receives 1 pageview, nav shows only MVP routes.

### Day 2 — Affiliate networks: real IDs + first API access (6h)
This is THE most important day for revenue. Every hour of delay here = $0 commission on the traffic Phase 2 will bring.

Apply to all of the following in parallel — most have same-day or 24h approval for content sites:

| Network | Apply at | Approval | What you need from them |
|---|---|---|---|
| **GetYourGuide** | partner.getyourguide.com (direct) OR awin.com | 24–72h | Partner ID for tracking + (later) API key for live prices |
| **Viator** | partner.viator.com | 48–72h | `pid` + `mcid` + Partner API key |
| **Booking.com** | partners.booking.com (direct) OR awin.com | 48h | `aid` (affiliate ID) |
| **Klook** | affiliate.klook.com | 24–48h | `aid` + (Phase 2) API key + secret |
| **SwissActivities** | ✅ already approved (`ref=odbhodn`) | — | — |
| **Civitatis** | civitatis.com/en/affiliates/ | 24–48h | Affiliate code |
| **Omio** (rail tickets) | omio.com/affiliates | 48–72h | Partner ID |
| **Rentalcars.com** (car hire) | rentalcars.com/affiliate | 72h | Affiliate code |

For each: fill the corresponding `NEXT_PUBLIC_AFFILIATE_*_PARAMS` in `.env.local` AND Vercel env. Smoke test by clicking a real affiliate link from a preview deploy → verify the partner dashboard shows the click.

**Day 2 verification gate:** ≥4 networks return "approved", real IDs in Vercel env. `npm run check:revenue` (new script I'll add) confirms every MVP activity has ≥1 link with a real tracking ID.

### Day 3 — Activity detail page: the highest-converting URL (6h)
Currently `/activities/[slug]/activity-detail.tsx` exists. Tasks:

1. **Above-the-fold rebuild** (90 min)
   - Photo (16:9, blur-up via `next/image` `placeholder="blur"`)
   - Activity name (h1)
   - "From CHF X" price chip with discount badge if multiple providers
   - Primary CTA button: "Compare prices on 4 sites" (scrolls to comparison table)
   - Trust line: "★ 4.8 · 1,247 reviews · Free cancellation available"
2. **Price comparison table polish** (60 min)
   - Sort by price ascending, lowest highlighted
   - "Save CHF 12 vs highest" callout
   - Show partner logo + rating + free-cancellation badge
   - Each row's CTA fires `trackAffiliateClick()` (already wired)
3. **Sticky CTA on mobile** (30 min) — bottom bar with price + "Compare →"
4. **Schema.org markup** (45 min) — `TouristAttraction` + `Offer` + `AggregateRating` JSON-LD via `<JsonLd>` component
5. **Related activities** (45 min) — 4 cards from same destination, before footer
6. **Affiliate disclosure** (15 min) — visible above-the-fold per FTC guidelines

**Day 3 verification gate:** Lighthouse mobile score ≥ 90, click on every CTA → correct affiliate URL with real tracking + `es_slot` + `es_slug` params.

### Day 4 — List page + good-enough search (6h)
"Real search across 1,513 activities" is a Phase 2 task. For Phase 1 we do **server-side faceted filtering** on the 200 MVP activities — it's enough for shipping.

1. **`/activities` page rebuild** (2h)
   - 12 cards per page, infinite scroll OR pagination
   - URL-driven state: `?destination=zurich&maxPrice=80&season=summer&category=hiking`
   - Each card: photo, name, lowest price, rating, destination chip
2. **Filter sidebar** (90 min)
   - Destination (checkbox list of 5)
   - Price range (CHF 0–500 slider)
   - Season (summer/winter/year-round)
   - Category (hiking, cruise, ski, food, culture, family)
   - Free cancellation toggle
3. **Sort controls** (30 min) — Cheapest / Highest rated / Most reviewed
4. **"No results" state** (15 min) — "Try removing the price filter" suggestion
5. **Search box** in header (45 min) — fuzzy match on activity name only, top 8 results in dropdown. Replace with MeiliSearch in Phase 2.
6. **Smooth UX** (30 min) — `useDeferredValue` so filter clicks feel instant before server re-fetch

**Day 4 verification gate:** Filter combinations produce <100ms server response, URL state survives reload, share-link works.

### Day 5 — Home + 5 destination pages (6h)
1. **Home rebuild** (3h)
   - Hero: full-width Alpine photo + search box ("Where in Switzerland?")
   - "Top destinations" — 5 cards linking to destination pages
   - "Trending this week" — 12 activity cards (algorithm: highest review count among MVP set; Phase 2 = actual analytics-driven)
   - "What you save by comparing" social proof strip ("Avg traveler saves CHF 23 per booking")
   - Newsletter signup
   - Footer with affiliate disclosure
2. **5 destination pages** (90 min — template once, then `generateStaticParams`)
   - Hero photo per destination
   - 1-paragraph SEO intro (200 words, written by me — see §5 deliverables)
   - "Top 20 activities in [City]" grid
   - "Read more" → links to 1–2 related stories
3. **Newsletter wiring** (90 min)
   - Resend.com (free, dev-friendly, $20/mo at 50k sends) — recommended
   - `/api/newsletter` already exists, polish to actually call Resend
   - Double opt-in OFF for MVP (single opt-in OK in CH for genuine subscribers; revisit if you go bulk)
   - Welcome email: "Top 10 free Switzerland activities" PDF (you'll send me the PDF or I'll generate)

**Day 5 verification gate:** All 5 destination URLs render, home loads <1.5s, newsletter signup creates an actual Resend audience member.

### Day 6 — SEO, schema, sitemap, performance (6h)
1. **`sitemap.ts`** (45 min) — emit every MVP activity + 5 destinations + 5 stories + static pages with `lastModified` + `priority`
2. **`robots.ts`** (15 min) — allow all, disallow `/api/*`, point to sitemap
3. **Per-page metadata** (90 min) — title, description, OG tags, Twitter card. Template:
   - Activity: `{name} from CHF {price} | realswitzerland.ch`
   - Destination: `Things to do in {city} | 20+ tours compared | realswitzerland.ch`
   - Story: `{title} | realswitzerland.ch`
4. **Dynamic OG images** (90 min) — `@vercel/og` Edge function generates per-activity OG card with photo + price overlay. Massive for Pinterest/social CTR.
5. **JSON-LD audit** (45 min) — Rich Results test passes for every page type
6. **Performance pass** (90 min)
   - `next/image` on every `<img>`, sizes prop correct
   - Preconnect to image CDN(s)
   - Bundle audit: anything >50KB justified? Drop unused shadcn components
   - Lighthouse mobile: LCP <2.0s, CLS <0.1, TBT <200ms
7. **5 SEO stories restored** (60 min) — pick the 5 highest-traffic-potential from `content/stories/`. My picks:
   - `cheapest-ski-resorts-switzerland-2026`
   - `best-hikes-switzerland-beginners`
   - `best-thermal-baths-switzerland-ranked`
   - `geneva-lausanne-weekend-itinerary`
   - `free-activities-switzerland`
   - Each gets internal links to relevant activities + destinations.

**Day 6 verification gate:** `npm run check:release` passes, Google Search Console Rich Results test green, PageSpeed Insights mobile ≥90.

### Day 7 — Deploy, monitor, fix (6h)
1. **Production deploy** (60 min) — final env var sweep, push to main, verify Vercel deploy
2. **Search Console submission** (15 min) — verify domain, submit sitemap
3. **Bing Webmaster** (15 min) — same
4. **Uptime monitoring** (15 min) — Better Uptime free tier, ping `/` every 3 min, Slack alert on downtime
5. **GA4 event verification** (60 min) — manually trigger 5 `affiliate_click` events, confirm in Realtime
6. **Revenue alert** (60 min) — Vercel cron at 09:00 UTC daily pings a new `/api/health/revenue` route that:
   - Counts MVP activities with broken affiliate URLs (target: 0)
   - Pings GA4 Reporting API for `affiliate_click` count last 24h
   - Emails you if click count = 0 OR broken count > 5
7. **Smoke-test purchase flow per network** (90 min) — make 1 real test click per affiliate network, confirm tracking pixel fires in partner dashboard
8. **Buffer + bug fixes** (75 min)

**Day 7 verification gate:** `https://realswitzerland.ch` resolves, every page renders, ≥1 successful affiliate click registered in ≥4 partner dashboards.

---

## 3. Phase 2 — Day 8–21 depth pass

### Days 8–10: live prices
The adapter code in `src/lib/live-prices.ts` is already correct (verified). All it needs is API keys.
- Day 8: Apply for GYG + Viator API keys (separate from the affiliate ID; Viator's Partner API requires a second approval). Flip on adapters as keys arrive.
- Day 9: Add "Updated 5 minutes ago" freshness chip on price-comparison-table.
- Day 10: A/B test — split traffic 50/50 between "live prices" and "static fallback." Measure click-through delta over 7 days. Expected lift: 15–30%.

### Days 11–13: real search
- Day 11: Install MeiliSearch (free, self-hosted on Railway $5/mo or Fly.io free). Index all 200 MVP activities (Phase 3: expand to remaining 1,300 after image audit).
- Day 12: Replace header search dropdown with Meili-backed autocomplete. Typo-tolerant, fast (<50ms p95).
- Day 13: Add `/search?q=...` results page. Track zero-result queries → these are SEO content gaps; surface in a weekly "what users searched but didn't find" email to yourself.

### Days 14–17: personalization
You already have `age-group-context.tsx`, `group-context.tsx`, `recently-viewed.tsx` — wire them up.
- Day 14: Onboarding modal on first visit: "Who's traveling? Couple / Family / Solo / Friends." Saves to cookie, filters home page accordingly.
- Day 15: "Recently viewed" section on home (already scaffolded, just needs data).
- Day 16: Save-trip mechanic (localStorage, no auth) — small heart icon on activity cards, viewable at `/saved`.
- Day 17: Retargeting: append `?utm_segment=family` etc. on outbound affiliate links so partners can show you ad credit if they offer second-touch attribution.

### Days 18–21: SEO content engine
- Day 18: Restore 5 more stories from `content/stories/`.
- Day 19: Write 3 new evergreen pieces:
  1. "Is the Swiss Travel Pass worth it in 2026? Math we did."
  2. "Cheapest day trips from Zurich (under CHF 50)"
  3. "Switzerland with kids: 12 activities families actually loved"
- Day 20: Pinterest pin generator — 1 story → 3 pin variants via `@vercel/og` templates.
- Day 21: Set up HARO (Help A Reporter Out) + 5 outreach emails to Swiss travel blogs for guest posts / backlinks.

---

## 4. Marketing strategy — 90-day mix

You asked me to recommend. Here's the math and the conclusion.

### The economics
Affiliate margins are thin. Per-visitor revenue (EPV) estimate:

| Source | Commission | AOV | Conversion | EPV |
|---|---:|---:|---:|---:|
| GYG / Viator (activities) | 8% | $60 | 4% | **$0.19** |
| SwissActivities | 10% | $50 | 5% | **$0.25** |
| Booking.com (lodging) | 25% | $200 | 2% | **$1.00** |
| Rentalcars / Omio | 5–7% | $150 | 1.5% | **$0.13** |

**Mean blended EPV ≈ $0.30 per visitor.** For $1,000/month you need ~3,300 visits/month. For $5,000/month, ~16,500.

### Why I'm recommending Pinterest + SEO, NOT paid ads
Google Ads CPCs in Swiss travel: **CHF 1.50–4.00**. At $0.30 EPV you'd lose money on every click. Paid ads only become rational after:
- You have 30+ days of click-stream data to know YOUR actual EPV (not the table's estimate)
- You've tuned the funnel so ≥3% of activity-detail visitors click affiliate
- You have lookalike data to target

Until then, free channels.

### The 90-day plan

**Primary: Pinterest (40% of marketing time)**
- Swiss travel = visual gold. Pinterest's audience (planning-mode women 25–45) overlaps exactly with the highest-AOV travel buyers.
- Schedule: 5 pins/day = ~150/month, ~450 over 90 days. Each = 1 dynamic OG-style image linking to a destination page or story.
- Tools: Buffer or Pinterest's native scheduler, both free.
- Target: 1,000 visits/mo by week 4, 5,000 by week 12. Conservative — many travel niches do 10x.
- Pin templates I'll generate from your branded `@vercel/og` setup: 1000×1500 pin format, photo + bold text overlay + price/CTA.

**Secondary: SEO (40% of marketing time)**
- 5 stories live Day 6, 8 more in Phase 2 = 13 by Day 21.
- Target month-3: page-1 ranking for 10 long-tail keywords like "cheap things to do interlaken," "switzerland travel pass worth it," "best hikes switzerland for beginners."
- Backlinks via HARO (free) + 5 outreach emails/week to Swiss/travel bloggers offering free guest posts.
- SEO compounds. Month 1 = 0 traffic, month 6 = often 30k+/mo if you ship 1 quality post per week.

**Tertiary: Newsletter (20% of marketing time)**
- Weekly email: 5 best deals + 1 story. Highest-EPV channel because list is owned + warm.
- Lead magnet: "10 free things to do in Switzerland 2026" PDF.
- Send via Resend (free <3k/mo, $20/mo at 50k).

**Not now: paid ads, TikTok/Reels, Twitter, LinkedIn.** Revisit in 90 days with real data.

---

## 5. What I need from you — exact checklist

Tick these off into a single message back to me. The Day 1–2 items are blockers; without them I can't write a single line of MVP code.

### Credentials & tokens (Day 1–2 blockers)
- [ ] **GA4 measurement ID** (format `G-XXXXXXXXXX`)
- [ ] **Vercel account access** — invite my email or share deploy command if you want to drive
- [ ] **Domain registrar access** for realswitzerland.ch — or just tell me where DNS is currently pointed (Cloudflare? Namecheap? Netlify?) so I can write the cutover plan
- [ ] **Resend.com API key** + audience ID (sign up at resend.com, 1 min)
- [ ] What's already in your `.env.local`? Send me the keys (NOT values, just key names) so I know which IDs are already populated vs still placeholder

### Affiliate network IDs (apply Day 2, fill as approvals arrive)
- [ ] GetYourGuide `partner_id`
- [ ] Viator `pid` + `mcid`
- [ ] Booking.com `aid`
- [ ] Klook `aid`
- [ ] Civitatis affiliate code
- [ ] Omio `partner_id`
- [ ] Rentalcars `affiliateCode`

### Live price API access (Phase 2 — apply Day 8)
- [ ] GetYourGuide Partner API key (`GETYOURGUIDE_API_KEY`)
- [ ] Viator Partner API key (`VIATOR_API_KEY`)
- [ ] Klook API key + secret (`KLOOK_API_KEY`, `KLOOK_API_SECRET`)

### Decisions (5-minute answers)
- [ ] **MVP activity count:** confirm 200, or pick: 100 (faster) / 500 (more content) / all 1,513 (not recommended)
- [ ] **MVP destinations:** Zurich, Lucerne, Interlaken, Zermatt, Geneva — swap any for Lugano / Bern / St. Moritz / Grindelwald?
- [ ] **Primary launch language:** English only (recommended week 1) or also German / French? CH market is 60% DE, 23% FR, 8% IT — DE second-pass would be smart in Phase 2.
- [ ] **OG image style:** activity photo + price overlay (Pinterest-optimized) OR branded text-only (cleaner, lower CTR)?
- [ ] **Pinterest account:** do you have one for the brand? If not, I'll add "create + verify Pinterest business account" to Day 2.
- [ ] **Your weekly post-launch time budget:** how many hours/week can you commit Days 8–90? If <10h/wk the SEO content engine is unrealistic without paid help.
- [ ] **Newsletter provider:** Resend (recommended — dev-friendly, free start) / ConvertKit / Beehiiv / Mailchimp?

### Content & brand (Day 5 deliverable, ideally have by Day 3)
- [ ] **Final logo** (SVG ideally, or 512×512 PNG)
- [ ] **Brand colors** — primary, accent, neutrals. (If you don't have, I'll suggest a palette.)
- [ ] **Hero photo** for home — high-res, 16:9, landscape. Alpine vista, Lauterbrunnen valley, Matterhorn — your call. Royalty-free or own.
- [ ] **Tagline** (1 line). Working draft: *"Compare every Swiss adventure in one place — and save."* — yes/edit/replace.
- [ ] **2-sentence "about"** for footer + about page.
- [ ] **Affiliate disclosure text** — I'll draft an FTC-compliant + CH-law-aware version; you approve.
- [ ] **Lead-magnet PDF** ("10 free things to do in Switzerland") — I'll generate; you approve final copy.

---

## 6. Architecture decisions — locked

Don't ask me to revisit these mid-build; they're correct for your scale.

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | Already here, fits ISR + Edge perfectly |
| Hosting | Vercel | Free tier handles 100GB bandwidth / 100k visits per month |
| Data store | Static JSON in git (Phase 1), Supabase Postgres (Phase 3+ when admin UI needed) | 200 × 2KB = 400KB; Vercel build handles it. Postgres only when you need editing-without-deploying. |
| Live price cache | `unstable_cache` 10-min TTL (already coded) | Correct staleness/freshness trade for travel pricing |
| Search | URL-param server filtering Phase 1, MeiliSearch Phase 2 | 200 items don't need search infra; 1,500+ do |
| Auth | None until you have ≥1,000 active users with retention problem worth solving | YAGNI |
| CMS | Git + JSON Phase 1, lightweight admin UI Phase 3 | Editing 5 activities/week via PR is fine; editing 50/week needs an admin |
| Newsletter | Resend | Cheapest, best DX, $20/mo at 50k sends |
| Analytics | GA4 + Vercel Analytics | GA4 for funnel + revenue, Vercel for performance |
| Image CDN | next/image + remote loader for affiliate photos | Already configured |

---

## 7. Risks I want you to know about (and mitigations)

1. **SwissActivities `ref=odbhodn` is your only working ID right now.** If their fraud team sees 100% of your traffic flowing through one ID, they could investigate. Diversifying to ≥3 networks Week 1 is risk mitigation, not just revenue growth.
2. **GYG / Viator approval can take 3–10 business days.** Apply Day 2, even if you're not sure you'll use them. The cost of applying = 15 min. The cost of being unapproved on launch day = your first 1,000 visitors generate $0.
3. **1,513 thin activity pages hurts SEO ranking.** Google's "Helpful Content" update penalizes large sites with low avg page quality. Cutting to 200 high-quality pages is an SEO upgrade, not a downgrade.
4. **Vercel free-tier 100GB bandwidth cap.** Image-heavy travel site + 1,513 activity pages risks hitting this if a single Pinterest pin goes viral. Mitigations: (a) `next/image` everywhere (Vercel optimizes + caches), (b) image audit Day 6 — kill anything >300KB, (c) upgrade to Pro ($20/mo) only when bandwidth >70%.
5. **`npm run prebuild` runs content-build on every deploy.** With 1,513 activity files this may push build past Vercel's 45-min cap. We'll measure Day 1 and, if needed, switch to ISR (`revalidate: 86400`) so build doesn't pre-render everything.
6. **FTC + CH consumer-protection require visible affiliate disclosure.** Easy fix; I'll wire `<AffiliateDisclosure>` above-the-fold on every activity page Day 3.
7. **GDPR cookie consent.** EU/CH visitors need a banner before GA4 fires. You already have `analytics-consent.tsx`. Day 7: verify it blocks GA4 until consent, then unblocks correctly.

---

## 8. What I'll bring to the table

- Daily PRs with screenshots + verification gate output
- Two new scripts:
  - `scripts/select-mvp-activities.mjs` — picks the 200
  - `scripts/check-revenue.mjs` — fails CI if any MVP activity is missing tracked links
- `npm run check:revenue` added to `check:release`
- `KILLED.md` audit log so any hidden feature can be restored painlessly
- Daily 15-min check-in: what shipped, what's blocked, what changed in scope (if anything)

---

## 9. After Day 21 — what comes next (90-day roadmap preview, not commitments)

| Weeks 4–6 | Weeks 7–9 | Weeks 10–12 |
|---|---|---|
| Image audit on remaining 1,300 activities → progressively re-enable | Supabase Postgres migration + admin CMS | First paid ad test ($300 budget on Pinterest Ads, by then we have EPV data) |
| Pinterest scaling — 10 pins/day, 2 lookalike boards | A/B test framework (Vercel Edge Config or PostHog) | Onboarding-quiz funnel → personalized landing page |
| Second-language pass (German) for top 50 activities | Newsletter referral mechanic ("Refer 1 friend, get our hidden-gems guide") | Sponsored partner placement page (extra revenue stream beyond pure affiliate) |

---

## 10. Top-of-mind for you, right now

If you only do **three things** in the next 24 hours, do these:

1. **Apply to GetYourGuide, Viator, Booking, Klook, Civitatis affiliate programs.** Approval takes days; you can't speed it up later.
2. **Send me the credential checklist in §5.** Without GA4 + DNS + Resend keys, Day 1 stalls.
3. **Decide MVP activity count + 5 destinations + tagline.** These three answers unblock Days 1, 5, and 6 simultaneously.

Everything else, I drive.
