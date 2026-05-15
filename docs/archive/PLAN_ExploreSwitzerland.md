# ExploreSwitzerland — Relaunch Plan & Market Strategy

**Prepared for:** Till
**Date:** April 6, 2026
**Current state:** SwissActivity (Next.js 14 / TypeScript / Tailwind)

---

## Executive Summary

Your site already has a strong technical foundation: 30 activities, age-based pricing, a comparison tool, a budget explorer, affiliate links to GetYourGuide/Viator/Klook, and SBB transport estimation. But it's stuck in "activity directory" mode — it doesn't yet make money, doesn't match the depth of competitors like SwissActivities.com or MySwitzerland.ch, and has several UX gaps.

This plan turns **SwissActivity** into **ExploreSwitzerland** — a broader, profit-generating Swiss travel platform that stands apart from the competition by combining activity booking with travel planning intelligence that no single competitor offers in one place.

---

## Part 1: What to Change, Why, and How

### 1. Rebrand to ExploreSwitzerland

**Why:** "SwissActivity" is generic and directly overlaps with SwissActivities.com (an established competitor). "ExploreSwitzerland" is broader, SEO-friendly, and signals that the site covers more than just activities — it's a full travel companion.

**How:**
- Update `siteConfig` in `constants.ts` (name, description, taglines)
- New logo and brand colors (keep the red Swiss accent, add a mountain/compass icon)
- Update meta tags, Open Graph data, structured JSON-LD across all pages
- Register `exploreswitzerland.ch` domain

---

### 2. Expand Activity Count (30 → 80+)

**Why:** 30 activities is thin. GetYourGuide lists thousands; SwissActivities has hundreds. You don't need thousands, but you need enough to cover every major Swiss region and category credibly.

**How:** Add ~50 new activities to `activities.ts`, focusing on gaps:

| Category | Current count | Target | Examples to add |
|----------|--------------|--------|-----------------|
| Outdoor | 8 | 20 | Via ferratas, canyoning, e-bike tours, stand-up paddling |
| Culture | 7 | 18 | Gruyères cheese factory, Ballenberg open-air museum, Lucerne Chapel Bridge, Bern Zytglogge |
| Adventure | 6 | 15 | Bungee jumping Verzasca, zip-line Grindelwald, bobsled runs |
| Family | 5 | 15 | Conny-Land, Ravensburger Spieleland, Swiss Miniatur, Maison Cailler |
| Wellness | 4 | 12 | Leukerbad thermal baths, Bogn Engiadina, Tamina Therme |

Each activity needs: slug, name, descriptions, providers with real pricing, booking URLs, coordinates, seasons, and tags.

---

### 3. Fix Images — Real, Matching, High Quality

**Why:** Many `imageUrl` fields point to Unsplash placeholders or don't match the activity. Users decide within 2 seconds whether a card looks credible.

**How:**
- Source royalty-free images from Unsplash, Pexels, and Wikimedia Commons for each activity
- Use specific search terms (e.g., "Jungfraujoch sphinx observatory" not "swiss mountain")
- Store optimized WebP images in `/public/images/activities/` (800×600 cards, 1600×900 hero)
- Use Next.js `<Image>` with `priority` for above-the-fold images, lazy loading for the rest
- Add a `gallery` array (3–5 images) for each activity detail page

---

### 4. Multi-Person Booking

**Why:** Currently the site shows pricing for 1 person only. Families and groups are the highest-value segment in Swiss tourism. A family of 4 visiting Jungfraujoch spends CHF 800+.

**How:** Add a group configurator component:

```
Adults: [−] 2 [+]    Children: [−] 1 [+]    Seniors: [−] 0 [+]    Students: [−] 0 [+]
```

- New `GroupContext` provider alongside existing `AgeGroupContext`
- Total price calculation: `sum(count × price_per_age_group)` per provider
- Display per-person breakdown + group total on activity cards and detail pages
- Pass group size as URL params when redirecting to booking partners (GetYourGuide supports `&adults=2&children=1`)
- SBB estimator also calculates group transport costs

---

### 5. Move Age Classes Below the Navigation Bar

**Why:** The age selector is currently inside the header, which makes it cramped on mobile and hard to discover. Placing it in a slim bar below the nav makes it prominent and always visible.

**How:**
- Create a new `<AgeBar />` component: a thin (40px) sticky bar below the header
- Show age group chips/pills: `Child · Student · Adult · Senior` with the active one highlighted
- On mobile: horizontal scroll or dropdown
- Keep it sticky so it follows the user as they scroll
- Integrate the new group size selector (from point 4) into this bar

---

### 6. Fix Transport Pricing (SBB Estimator)

**Why:** The current `sbb.ts` uses haversine distance × a flat rate. This gives wildly inaccurate results because Swiss rail routes wind through mountains. Zurich→Zermatt is 230km straight-line but 330km by rail.

**How:**
- Replace haversine estimation with a pre-computed fare lookup table for common city pairs (the ~16 origin cities × ~30 activity destinations = ~480 pairs)
- Source real fares from SBB.ch (2nd class, no discount / half-fare / GA)
- Store in a `sbb-fares.ts` data file
- Fall back to distance estimation only for unlisted pairs, with a 1.6× mountain factor (not 1.4×)
- Add support for Swiss Travel Pass pricing (many tourists have this)
- Show "Free with GA" badge where applicable

---

### 7. Trending / Hottest Activities Tracker

**Why:** Social proof drives clicks. Showing what's popular right now creates urgency and helps undecided visitors pick an activity.

**How (no backend needed):**
- Define a `trending` property on activities: `{ score: number, reason: string }`
- Score based on: season relevance (auto-calculated), manual editorial picks, deal availability
- New `<TrendingBar />` on the homepage: horizontal scroll of top 5 trending activities with a flame icon and reason tag ("Peak season", "50% off this week", "Just opened for summer")
- New `/trending` page with full ranked list
- Later (with analytics): use actual click/booking data to inform scores via a simple API endpoint

---

### 8. Beyond Activities — New Content Verticals

**Why:** This is how you differentiate from GetYourGuide (pure booking) and MySwitzerland (government tourism). No competitor combines activities + travel logistics + local tips in one platform.

**New sections to add:**

| Section | What it covers | Revenue angle |
|---------|---------------|---------------|
| **Travel Passes** | Swiss Travel Pass, Half-Fare Card, regional passes — comparison calculator | Affiliate links to SBB / Swiss Travel System |
| **Itineraries** | Curated multi-day trip plans ("5 Days in the Bernese Oberland") | Embed affiliate-linked activities + hotels |
| **Seasonal Guides** | "What to do in Switzerland in Winter 2026" — editorial content | SEO traffic → affiliate conversions |
| **Local Tips** | Hidden gems, best times to visit, money-saving tricks | Builds trust & repeat visits |
| **Accommodation** | Hotel/hostel recommendations near activities | Booking.com affiliate (4-6% commission) |

---

### 9. In-Site Booking with Markup — Feasibility

**Your question:** Can you charge 1% extra on bookings made through the site?

**Short answer:** Yes, but not by marking up partner prices. Here's the realistic path:

**Option A — Affiliate commissions (recommended, start here)**
You already have affiliate links to GetYourGuide (8% commission), Viator (8%), and Klook (5%). When a user clicks "Book Now" and completes a booking on their platform, you earn 8% of the sale price. On a CHF 200 Jungfraujoch ticket, that's CHF 16. You don't set the price — the partner does — but you keep the commission.

**Option B — Become a reseller (medium-term)**
Platforms like Bokun, Rezdy, or FareHarbor let you embed a booking widget directly on your site. The user never leaves ExploreSwitzerland. You negotiate a markup (typically 5–15%) with local operators. This requires:
- Business registration in Switzerland
- Contracts with individual activity providers
- Payment processing (Stripe)
- Cancellation/refund handling

**Option C — Service fee model (long-term)**
Add a small "platform fee" (CHF 2–5 per booking) on top of the base price, clearly disclosed. This is what some comparison sites do. Requires Option B infrastructure.

**Recommendation:** Start with Option A (affiliate). It's already 80% built in your code. Focus on maximizing click-through rates and conversion. Move to Option B once you have steady traffic (1000+ monthly visitors).

---

## Part 2: Revenue & Profit Strategy

### Revenue Streams (Prioritized)

| Stream | Revenue per action | Difficulty | Timeline |
|--------|-------------------|------------|----------|
| **1. Affiliate commissions** | 5–8% per booking (CHF 5–40 avg) | Low — already built | Now |
| **2. Accommodation affiliates** | 4–6% per hotel booking | Low | Month 1 |
| **3. Travel pass affiliates** | CHF 3–10 per pass sold | Low | Month 1 |
| **4. Sponsored placements** | CHF 200–500/month per operator | Medium | Month 3 |
| **5. Newsletter sponsorship** | CHF 100–300 per send | Medium | Month 4 |
| **6. Direct reselling** | 10–15% margin | High | Month 6+ |

### Affiliate Implementation Details

Your `affiliate.ts` already has a `getAffiliateUrl()` function. What's missing:

1. **Real partner IDs** — Register for these programs:
   - GetYourGuide Partner Program (8% commission, 30-day cookie)
   - Viator Affiliate Program (8%, 30-day cookie)
   - Klook Affiliate (5%, 30-day cookie)
   - Booking.com Affiliate (25–40% commission on their commission)
   - Swiss Travel System affiliate or Trainline partner
   - Travelpayouts (aggregator for 100+ travel brands under one dashboard)

2. **Tracking** — Add UTM parameters and click tracking (a simple event to Google Analytics 4 on every "Book Now" click)

3. **Conversion optimization** — This is where the money is:
   - Show prices prominently (you already do this well)
   - "Best price" badge on the cheapest provider
   - Group total price (not just per-person) to create "wow, that's affordable for 4 people" moments
   - Urgency: "Popular — booked 12 times this week"
   - Comparison table on detail pages (you have this — make it more prominent)

### Revenue Projections (Conservative)

| Metric | Month 1–3 | Month 4–6 | Month 7–12 |
|--------|-----------|-----------|------------|
| Monthly visitors | 500 | 2,000 | 5,000 |
| Click-through rate | 3% | 5% | 7% |
| Booking conversion | 2% | 3% | 4% |
| Avg booking value | CHF 120 | CHF 140 | CHF 150 |
| Commission rate | 7% | 7% | 7% |
| **Monthly revenue** | **CHF 25** | **CHF 290** | **CHF 1,470** |

These are conservative. Swiss tourism activities have high average order values, which makes affiliate margins attractive even at modest traffic.

---

## Part 3: Market Strategy

### Positioning

**"The Swiss travel companion that saves you money and time."**

Unlike GetYourGuide (a booking engine), MySwitzerland (government tourism portal), or SwissActivities (an operator), ExploreSwitzerland is the **independent comparison and planning layer** — the site you visit *before* you book, to find the best price, plan your transport, and discover what's worth doing.

### Target Audiences

| Segment | Who they are | What they want | How we reach them |
|---------|-------------|---------------|-------------------|
| **Budget tourists** | Backpackers, students, young couples visiting Switzerland | Cheapest prices, free activities, transport savings | SEO: "cheap things to do in Switzerland", Budget Explorer tool |
| **Families** | Parents planning Swiss holidays (often from Germany, UK, USA) | Age-appropriate activities, group pricing, easy planning | SEO: "family activities Switzerland", group booking, itineraries |
| **Weekend explorers** | Swiss residents looking for Saturday plans | Seasonal ideas, nearby activities, SBB integration | Newsletter, seasonal guides, trending section |
| **Luxury travelers** | High-income visitors wanting curated experiences | Premium curation, exclusive activities, itineraries | Curated "Premium Experiences" section, blog content |

### SEO Strategy (Primary Growth Channel)

Swiss travel keywords have high search volume and strong commercial intent:

**Target keywords:**

| Keyword cluster | Monthly searches (est.) | Competition | Strategy |
|----------------|------------------------|-------------|----------|
| "things to do in Switzerland" | 40,000+ | High | Homepage + activities page |
| "best activities [city]" (Zurich, Lucerne, etc.) | 5,000–15,000 each | Medium | City-specific landing pages |
| "[activity] Switzerland price" | 1,000–5,000 | Low | Activity detail pages with pricing |
| "Switzerland itinerary [X] days" | 3,000–10,000 | Medium | Itinerary pages |
| "Swiss Travel Pass worth it" | 5,000+ | Medium | Travel passes comparison page |
| "free things to do Switzerland" | 3,000+ | Low | Deals/free activities page |
| "Switzerland with kids" | 2,000+ | Low | Family filter + guide |

**Technical SEO (already partially done):**
- JSON-LD structured data on every activity (enhance with `AggregateRating`, `Offer`)
- Sitemap generation (expand to include new pages)
- Hreflang tags for DE/FR/IT/EN versions
- Core Web Vitals optimization (Next.js Image, lazy loading, code splitting)

### Content Marketing

**Blog strategy** (you have the blog infrastructure, just need content):

| Month | Content pieces | Topics |
|-------|---------------|--------|
| 1 | 4 articles | "Top 10 Free Activities in Switzerland", "Swiss Travel Pass vs Half-Fare Card", "Jungfraujoch vs Matterhorn: Which Summit?", "Switzerland on a Budget: Complete Guide" |
| 2 | 4 articles | Seasonal guide, city guides (Zurich, Lucerne), family travel guide |
| 3 | 4 articles | Itineraries, hidden gems, transport tips, local food experiences |

Each article embeds affiliate-linked activity cards for natural conversion.

### Social Media (Secondary Channel)

| Platform | Content type | Posting frequency |
|----------|-------------|-------------------|
| Instagram | Swiss landscape photos + activity tips | 3×/week |
| Pinterest | Itinerary pins, seasonal guides, infographics | 5×/week (high ROI for travel) |
| TikTok | Short clips of activities, "Did you know" Swiss facts | 2×/week |

Pinterest is especially valuable for travel — pins have a 3–6 month lifespan vs hours on other platforms.

### Newsletter

- Weekly "Swiss Weekend Pick" email to subscribers
- Seasonal roundups (e.g., "Spring is here — 8 activities now open")
- Flash deal alerts from partners
- Monetize with sponsored activity features (CHF 100–300 per sponsored slot)
- You already have `newsletter-signup.tsx` — connect it to Mailchimp or Resend

### Partnerships

- **Swiss tourism offices** — Offer to feature their region's activities in exchange for backlinks
- **Travel bloggers** — Guest posts with affiliate links back to your site
- **Hostel/hotel chains** — Cross-promote: they recommend your site, you link their booking pages

---

## Part 4: Implementation Roadmap

### Phase 1 — Foundation (Weeks 1–2)
- [ ] Rebrand to ExploreSwitzerland (config, meta, layout)
- [ ] Move age selector below nav bar
- [ ] Add multi-person group selector
- [ ] Fix SBB fare estimator with real price data
- [ ] Replace placeholder images with real, matching photos
- [ ] Register for affiliate programs (GetYourGuide, Viator, Booking.com)

### Phase 2 — Content Expansion (Weeks 3–4)
- [ ] Add 50 new activities with real data
- [ ] Build trending activities section
- [ ] Create Travel Passes comparison page
- [ ] Write first 4 blog articles (SEO-focused)
- [ ] Add accommodation recommendations with Booking.com affiliate

### Phase 3 — Revenue Optimization (Weeks 5–8)
- [ ] Add Google Analytics 4 with affiliate click tracking
- [ ] Build curated itinerary pages (3–5 itineraries)
- [ ] Create seasonal landing pages
- [ ] Launch newsletter with first 3 sends
- [ ] Add "Popular this week" social proof badges
- [ ] Create city-specific landing pages for top 5 cities

### Phase 4 — Growth (Months 3–6)
- [ ] Pinterest strategy launch
- [ ] Outreach to Swiss tourism offices for backlinks
- [ ] A/B test booking button placements and CTAs
- [ ] Explore direct reselling (Bokun/Rezdy integration)
- [ ] Add user reviews/ratings system
- [ ] Full i18n rollout (DE/FR/IT content, not just UI labels)

---

## Part 5: Competitive Advantages

What ExploreSwitzerland will do that **no single competitor** does:

1. **Price comparison across providers** — GetYourGuide only shows their prices. You show GetYourGuide vs Viator vs Klook vs direct.
2. **Group pricing calculator** — No competitor lets you input "2 adults + 2 kids" and see the total including transport.
3. **SBB integration** — Nobody else shows "Activity CHF X + Train CHF Y = Total day trip CHF Z."
4. **Budget Explorer** — A unique tool. Set your budget, see what's possible.
5. **Comparison tool** — Side-by-side comparison of up to 3 activities. Travel platforms don't offer this.
6. **Seasonal intelligence** — Auto-filtered content based on what's actually open right now.
7. **Multi-language from day one** — EN/DE/FR/IT covers all Swiss language regions plus tourists.

---

## Summary: Your Profit Path

The fastest path to profit is **affiliate commissions on the infrastructure you already have**. The site's unique value — price comparison, group pricing, transport integration — will drive organic traffic that converts into bookings on partner platforms. Every CHF 150 booking earns you ~CHF 12 in commission, with zero inventory risk.

The key investments are: more activities (credibility), better images (trust), group booking (higher order values), and SEO content (traffic). Everything else amplifies these four pillars.
