# ExploreSwitzerland — Your Step-by-Step Launch Guide

**For:** Till
**Date:** April 6, 2026
**Status:** Rebrand + core features built. This guide covers what's done, what's next, and exactly how to proceed.

---

## What's Already Built (Done Today)

These features are live in your codebase and ready to use:

**1. Rebrand to ExploreSwitzerland** — Site name, meta tags, header, footer, Open Graph, and all references updated from "SwissActivity" to "ExploreSwitzerland."

**2. Group Booking Selector** — New `GroupContext` provider with a `GroupConfig` (adults, children, seniors, students). Counter buttons let users configure their group size (0–10 per type).

**3. AgeBar Below Navigation** — A sticky bar below the header showing age group pills (Child, Student, Adult, Senior) and a collapsible group size selector. Replaced the old in-header age selector.

**4. 150 Activities** — Your data already includes 150 activities across outdoor, culture, adventure, family, and wellness categories with real pricing from multiple providers.

**5. Trending Activities Section** — A "Trending Now" horizontal scroll bar on the homepage showing the top 8 trending activities with rank badges, reason tags (e.g., "Peak season," "Trails just opened"), and pricing. Data in `src/data/trending.ts` — update seasonally.

**6. Travel Passes Comparison Page** — Full page at `/travel-passes` comparing Swiss Travel Pass (3/8/15 day), Half-Fare Card, Flex Pass, and Saver Day Pass. Includes an interactive calculator that recommends a pass based on trip length and travel days, expandable details, and a quick comparison table.

**7. Itineraries System** — Five curated multi-day itineraries at `/itineraries`:
   - Classic Switzerland in 7 Days
   - 5 Days in the Bernese Oberland
   - Switzerland on a Budget — 5 Days
   - Family Switzerland — 7 Days with Kids
   - Swiss Winter Wonderland — 5 Days

Each itinerary has day-by-day routes with linked activities, transport tips, insider tips, and budget estimates at three tiers (budget/mid/luxury). Detail pages at `/itineraries/[slug]`.

**8. Updated Navigation** — Header and footer now include links to Itineraries and Travel Passes pages.

---

## Step-by-Step: What You Need to Do Next

### Phase 1: Immediate Actions (This Week)

#### Step 1: Register the Domain
- Go to [Infomaniak](https://www.infomaniak.com) or [Hostpoint](https://www.hostpoint.ch) (Swiss registrars)
- Register `exploreswitzerland.ch` (also consider `.com` if available)
- Point DNS to your hosting provider (Vercel recommended for Next.js)

#### Step 2: Deploy to Vercel
- Push your code to GitHub if not already
- Sign up at [vercel.com](https://vercel.com) and import the repository
- Connect your custom domain (`exploreswitzerland.ch`)
- Vercel handles SSL, CDN, and automatic deployments on push
- Free tier is sufficient to start

#### Step 3: Register for Affiliate Programs
This is your first revenue source. Apply to these programs:

| Program | Commission | Cookie | Apply at |
|---------|-----------|--------|----------|
| GetYourGuide Partner | 8% | 30 days | partner.getyourguide.com |
| Viator Affiliate | 8% | 30 days | viatorpartnerresources.com |
| Klook Affiliate | 5% | 30 days | affiliate.klook.com |
| Booking.com Affiliate | 25-40% of their commission | 30 days | affiliate.booking.com |
| Travelpayouts | Varies (100+ brands) | Varies | travelpayouts.com |
| Swiss Travel System | Contact directly | — | swistravelsystem.com |

After approval, update the placeholder IDs in `src/lib/affiliate.ts` with your real partner IDs.

#### Step 4: Set Up Google Analytics 4
- Create a GA4 property at [analytics.google.com](https://analytics.google.com)
- Replace `G-XXXXXXXXXX` in `src/app/layout.tsx` with your real measurement ID
- Set up custom events for affiliate clicks (see Phase 2)

#### Step 5: Replace Placeholder Images
Many activities use Unsplash placeholder images. For the top 20–30 most important activities:
- Search [Unsplash](https://unsplash.com), [Pexels](https://pexels.com), and [Wikimedia Commons](https://commons.wikimedia.org) for specific, matching images
- Use specific search terms (e.g., "Jungfraujoch sphinx observatory" not "swiss mountain")
- Download and optimize to WebP format (800x600 for cards, 1600x900 for hero)
- Place in `/public/images/activities/` and update the `imageUrl` in `activities.ts`

---

### Phase 2: Revenue Optimization (Weeks 2–3)

#### Step 6: Implement Affiliate Click Tracking
Add GA4 event tracking to every "Book Now" button click. In your activity detail page, fire an event like:
```
gtag('event', 'affiliate_click', {
  activity_name: 'Jungfraujoch',
  provider: 'GetYourGuide',
  price: 245,
  age_group: 'adult'
});
```
This tells you which activities and providers generate the most clicks.

#### Step 7: Add Group Total Pricing to Activity Cards
The GroupContext is built but not yet wired to the activity cards and detail pages. Next steps:
- Import `useGroup` in `activity-card.tsx` and `[slug]/page.tsx`
- Show "Group total: CHF X" alongside per-person pricing when group size > 1
- Pass group params to affiliate URLs: `&adults=2&children=1`

#### Step 8: Connect Newsletter to a Provider
Your `newsletter-signup.tsx` component exists but isn't connected to a backend. Options:
- **Resend** (free up to 3,000 emails/month) — best for developers
- **Mailchimp** (free up to 500 subscribers) — easiest to set up
- **Buttondown** (free up to 100 subscribers) — minimal and clean

Create a simple API route at `/api/newsletter` that adds the email to your list.

#### Step 9: Write Your First 4 Blog Articles (SEO)
These target high-intent keywords with strong search volume:

1. **"Top 10 Free Activities in Switzerland"** — Targets "free things to do in Switzerland" (3,000+ monthly searches). Link to your free activities filter.

2. **"Swiss Travel Pass vs Half-Fare Card: Which Saves More?"** — Targets "Swiss Travel Pass worth it" (5,000+ monthly searches). Link to your Travel Passes page.

3. **"Jungfraujoch vs Matterhorn: Which Summit Should You Visit?"** — Targets comparison queries. Link to both activity pages with affiliate booking buttons.

4. **"Switzerland on a Budget: Complete Guide"** — Targets "Switzerland budget" keywords. Link to Budget Explorer and the budget itinerary.

Each article should be 1,500–2,500 words, include activity cards with pricing, and have affiliate-linked "Book Now" buttons.

---

### Phase 3: Content & Growth (Weeks 4–8)

#### Step 10: Create City Landing Pages
Build dedicated pages for the top 5 Swiss cities tourists visit:
- `/zurich` — Activities, day trips, where to stay
- `/lucerne` — Lake activities, mountains, museums
- `/interlaken` — Adventure sports, Jungfraujoch, Lauterbrunnen
- `/zermatt` — Matterhorn, skiing, hiking
- `/geneva` — Lake Geneva, culture, day trips to Montreux

Each page targets "[city] things to do" keywords (5,000–15,000 monthly searches each).

#### Step 11: Add Accommodation Recommendations
Create a new data file (`src/data/accommodations.ts`) with hotel/hostel recommendations near popular activities. Link to Booking.com with your affiliate tag. Start with 3–5 recommendations per city. Display on itinerary pages and city landing pages.

#### Step 12: Launch Pinterest Strategy
Pinterest is the highest-ROI social platform for travel content:
- Create a business account
- Pin each itinerary as a tall (1000x1500px) infographic
- Pin seasonal guides monthly
- Pin "Top 10" lists from blog articles
- Aim for 5 pins/week — pins have a 3–6 month lifespan

#### Step 13: Seasonal Content Updates
Update these regularly:
- `src/data/trending.ts` — Update trending scores and reasons each month
- Blog — Write seasonal guides ("What to Do in Switzerland in Summer 2026")
- Activity seasons — Ensure `seasons` arrays in activities are accurate
- Deals — Update `deal` properties on activities when new promotions appear

#### Step 14: Newsletter Launch
Once you have 50+ subscribers:
- Send a weekly "Swiss Weekend Pick" email highlighting 1 activity
- Include seasonal recommendations and deal alerts
- Add a "Sponsored Activity" slot (CHF 100–300 per send once you have 500+ subscribers)

---

### Phase 4: Scale & Monetize (Months 3–6)

#### Step 15: Implement Real SBB Fare Data
Replace the haversine estimation in `src/lib/sbb.ts` with a pre-computed fare lookup table. Source real fares from SBB.ch for the most common city-to-activity routes (about 200–300 pairs). This dramatically improves the accuracy of your transport cost estimates and builds trust.

#### Step 16: A/B Test Conversion Elements
Use Google Optimize (free) or Vercel Edge Config to test:
- "Book Now" button color and text
- Price display format (per person vs group total)
- "Popular — booked 12 times this week" social proof badges
- Position of the comparison table on detail pages

#### Step 17: Outreach for Backlinks
Contact Swiss regional tourism offices:
- Offer to feature their region's activities for free
- Ask for a backlink from their "useful links" page
- These are high-authority `.ch` domains that boost your SEO significantly

Contact travel bloggers:
- Offer guest posts about Switzerland with links back to your itineraries
- Provide them with an affiliate referral link so they earn too

#### Step 18: Explore Direct Reselling
Once you have 1,000+ monthly visitors, consider becoming a reseller:
- Sign up with Bokun, Rezdy, or FareHarbor
- Embed booking widgets directly on your site (users never leave)
- Negotiate 10–15% margins with local operators
- Requires: Swiss business registration, payment processing (Stripe), and cancellation handling

#### Step 19: Add User Reviews
Allow visitors to leave short reviews on activities they've done. This generates unique content (great for SEO) and builds trust. Start with a simple system — name, rating (1–5), and a short text. No login required.

#### Step 20: Full i18n Content
Your UI already supports language switching, but the content (activity descriptions, blog posts, itineraries) is English-only. Translate key pages into German, French, and Italian to capture Swiss residents and European tourists searching in their native language.

---

## Revenue Projections

| Metric | Month 1–3 | Month 4–6 | Month 7–12 |
|--------|-----------|-----------|------------|
| Monthly visitors | 500 | 2,000 | 5,000 |
| Affiliate click-through | 3% | 5% | 7% |
| Booking conversion | 2% | 3% | 4% |
| Avg booking value | CHF 120 | CHF 140 | CHF 150 |
| Commission rate | 7% | 7% | 7% |
| **Monthly revenue** | **CHF 25** | **CHF 290** | **CHF 1,470** |

Add accommodation affiliate (Booking.com) and travel pass referrals for an estimated additional 30–50% on top.

---

## Key Files Reference

| What | Where |
|------|-------|
| Site config (name, URL, description) | `src/lib/constants.ts` |
| Activity data (150 activities) | `src/data/activities.ts` |
| Trending data | `src/data/trending.ts` |
| Itinerary data | `src/data/itineraries.ts` |
| Affiliate URL builder | `src/lib/affiliate.ts` |
| Group context | `src/context/group-context.tsx` |
| Age bar component | `src/components/age-bar.tsx` |
| Trending bar component | `src/components/trending-bar.tsx` |
| Travel passes page | `src/app/travel-passes/page.tsx` |
| Itineraries page | `src/app/itineraries/page.tsx` |
| Itinerary detail page | `src/app/itineraries/[slug]/page.tsx` |
| Homepage | `src/app/page.tsx` |
| Header | `src/components/layout/header.tsx` |
| Footer | `src/components/layout/footer.tsx` |
| Root layout | `src/app/layout.tsx` |

---

## Competitive Advantages Summary

What ExploreSwitzerland does that no single competitor offers:

1. **Price comparison across providers** — GetYourGuide only shows their prices. You show GetYourGuide vs Viator vs Klook vs direct.
2. **Group pricing calculator** — Input "2 adults + 2 kids" and see the total including transport.
3. **SBB transport integration** — "Activity CHF X + Train CHF Y = Total day trip CHF Z."
4. **Budget Explorer** — Set your budget, see what's possible.
5. **Side-by-side comparison** — Compare up to 3 activities.
6. **Seasonal intelligence** — Content auto-filters by what's open now.
7. **Travel pass calculator** — No competitor helps you choose the right pass.
8. **Curated itineraries with real pricing** — Day-by-day plans with live activity prices.

---

*This guide is your roadmap. Focus on Phase 1 first (domain, deploy, affiliates), then systematically work through each phase. The code foundation is solid — now it's about content, traffic, and conversion optimization.*
