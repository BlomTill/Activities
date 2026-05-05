# realswitzerland.ch — Launch Plan v2

**Owner:** Till
**Drafted:** 2026-05-04
**Public launch target:** 2026-05-18 (Monday) — 14 days from today
**Marketing budget (first 90 days):** CHF 200–1,000

The previous `LAUNCH_PLAN.md` (April 2026) was written for the old `exploreswitzerland.ch` domain and ~80% of its blockers have since been fixed. This document supersedes it. Old plan kept for reference.

---

## Where we are today

The site is **already deployed at realswitzerland.ch on Vercel**. The hard engineering is done: 1,513 activities, 25 stories, 5 itineraries, 17+ pages, the realswitzerland.ch alpine-sunshine design rolled out across the shell, GA4 instrumented (`G-WM5HKRFLBQ`), Travelpayouts Drive AI mounted, real affiliate IDs wired for GetYourGuide (`JE8NE76`), Viator (`P00299712`), Klook (`120379`), Travelpayouts (`724838`), SwissActivities (`odbhodn`), with a tracked `<AffiliateLink>` component and `affiliate_click` GA4 events. Three partner widgets render on the home, destination detail, and deals pages. Privacy + cookie consent + sitemap + robots + service worker + PWA manifest are all in place.

What's left is **verification, polish, content seeding, and turning on traffic acquisition** — not engineering.

---

## Hard blockers found in audit (must fix in week 1)

These are real, will affect launch quality, and have been verified live in the codebase:

1. **`NEWSLETTER_AUDIENCE_ID` is empty in `.env.local` and Vercel.** Newsletter signups currently return HTTP 503 with "Newsletter is not configured yet." Every signup that fails costs you a future booking conversion. Create the Resend audience and paste the ID into both local `.env.local` and Vercel → Settings → Environment Variables → Production.

2. **OG image is 33 KB at `public/og-image.jpg`.** Dimensions are right (1200×630), but the file size suggests it's a placeholder, not a real social share card. Every link shared on WhatsApp, Slack, X, or Facebook will use this image. Replace with a real composition (mountain hero + headline + URL).

3. **Affiliate partner approval status unknown.** GYG, Viator, Klook take 1–3 business days to approve a publisher's site. If realswitzerland.ch isn't live in their system, your tracking IDs work but your earnings don't post. Confirm each one is approved (each network has a "site approved" or "active" status in the dashboard).

4. **No Google Search Console verification visible in `src/app/layout.tsx`.** Without it the sitemap can't be submitted and Google indexing is slower. Add the meta verification tag.

5. **Privacy policy hasn't been updated for Travelpayouts Drive.** Drive auto-shows offers based on user behavior — this is regulated as a tracking technology under Swiss DSG. The `/partners` page now mentions it (added today), but `/privacy` should explicitly call it out as a third-party AI offer system.

---

## The plan: 14 days, four sprints

### Sprint 1 — Verification & blockers (Mon–Wed, May 4–6)

**Goal:** Every blocker above closed. Site safely shippable from a legal/quality standpoint.

Mon May 4 (today): Resend audience + audience ID into Vercel. Replace OG image. Trigger a fresh Vercel deploy and confirm `https://realswitzerland.ch/api/newsletter` returns success when posted a real email. Open all four affiliate dashboards (GYG, Viator, Klook, Travelpayouts) and verify "site approved" for `realswitzerland.ch`. If any still says "pending review," reach out via their support — having a live site speeds approval.

Tue May 5: Add Google Search Console verification meta tag, submit sitemap (`https://realswitzerland.ch/sitemap.xml`), submit robots. Add Bing Webmaster Tools too (5 min, ignored by most but free). Update `/privacy` to disclose Travelpayouts Drive and the four affiliate partners by name. Run `npx next build` end-to-end to catch any production-only issues.

Wed May 6: Real-device QA. iPhone Safari, Android Chrome, desktop Safari/Chrome/Firefox. Test the wander shell on each: header collapses correctly, mega-menu opens, floating pager doesn't overlap content, fact toast renders, dusk theme persists across navigation, peaks parallax doesn't jank, partner widgets render. Note every glitch in a doc, fix the top 5. Run Lighthouse on `/`, `/activities`, `/destinations/zurich`, `/deals`. Target: Performance ≥ 80, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100.

### Sprint 2 — Content & pre-launch warmup (Thu–Sun, May 7–10)

**Goal:** Three high-quality SEO articles published, soft pre-launch share to a small private list.

You have 25 existing stories — but for launch, three pieces should be exceptional, not just present. Pick three from this list that have the strongest commercial intent (high search volume + high affiliate conversion):

- "Swiss Travel Pass vs Half Fare Card — The Honest Math" (transactional, high CPC, evergreen)
- "Jungfraujoch from Interlaken — Is the CHF 234 Worth It?" (high-intent comparison, GYG/Viator commission)
- "9 Swiss Villages You Should Visit Instead of Grindelwald" (already drafted, highly shareable)

For each: rewrite to ~1,800–2,500 words, embed `<AffiliateLink>` to specific GYG/Viator tour URLs (you already have working ones), embed a `<PartnerWidget>` for the relevant city, add a primary image + 2–3 in-line images, internal-link to 3–5 related activities/destinations. Run each through https://www.semrush.com or https://ahrefs.com (free trials work) for keyword density check.

Thu May 7: Article #1 (Travel Pass).
Fri May 8: Article #2 (Jungfraujoch).
Sat May 9: Article #3 (Swiss Villages).
Sun May 10: Soft pre-launch. Send to 10–20 people you trust personally — friends, family, Swiss travelers you know — with one ask: "Click around for 5 minutes and tell me what's broken or weird." Their feedback is gold and free.

### Sprint 3 — Smoke tests & SEO seeding (Mon–Thu, May 11–14)

**Goal:** Site is observably stable. Indexing has begun. Social channels exist.

Mon May 11: Read every soft-launch reply. Triage into "must fix before public launch" vs "can wait." Fix the must-fixes. Verify GA4 is firing real events (live debug view at analytics.google.com → Admin → DebugView). Confirm `affiliate_click` events show correct `partner` field and `value` in CHF. Fire test bookings through each affiliate (you can immediately cancel them) to confirm conversions register.

Tue May 12: Submit sitemap to Google Search Console + request indexing for the homepage and the three Sprint 2 articles. Set up `https://www.realswitzerland.ch` and `https://realswitzerland.com` (if you own the .com) to 301 to the canonical. Set up Vercel "Speed Insights" or a free PostHog account to capture real-user metrics post-launch — not just synthetic Lighthouse.

Wed May 13: Create the social accounts. Minimum: Instagram (`@realswitzerland`), TikTok (`@realswitzerland.ch`), Pinterest (huge for travel). Don't post yet — just secure the handles, fill bio, link to the site. Pinterest deserves real attention: it's the highest organic-traffic-to-travel-affiliate-clickthrough platform. Create 5 boards (Hiking, Lakes, Trains, Winter, Hidden Switzerland), pin 8–10 images each, every pin links back to the matching `/activities/...` or `/stories/...` page.

Thu May 14: Email-capture pre-launch landing on social bios. Newsletter signup is already wired — make sure the `/?intent=launch` URL fires the right tag in Resend so the launch email reaches them first.

### Sprint 4 — Public launch (Fri–Mon, May 15–18)

**Goal:** Doors open. First paid traffic flowing. Conversions tracking.

Fri May 15: Final pre-launch checklist run (see "Definition of done" below). If anything is red, fix or accept the trade-off explicitly. Schedule your launch email in Resend for Monday 8:00 CET (Swiss morning commute = inbox open rate sweet spot).

Sat–Sun May 16–17: Buffer + content. Draft the launch email and 3 social posts (Instagram carousel, TikTok 30-sec clip walking through the site, Pinterest pin batch). The launch email should be honest: what the site is, why you built it, two specific things you want them to try. No marketing theater.

Mon May 18 (LAUNCH DAY):
- 08:00 — Launch email goes out via Resend.
- 09:00 — Post on Instagram, TikTok, LinkedIn (your personal account drives surprisingly well for niche launches), Reddit (`r/Switzerland`, `r/SwissActivities`, `r/solotravel` — read each subreddit's self-promo rules first; lead with story, not pitch).
- 10:00 — Turn on the first Google Ads campaign (see "Marketing strategy" below). Budget: CHF 20/day, capped.
- All day — sit on GA4 realtime, watch for dropoffs, fix anything that breaks under real traffic.

---

## Marketing strategy — first 90 days, CHF 200–1,000 budget

The right way to spend CHF 200–1,000 over 90 days is **not** to run ads continuously at low budgets — that gets you nothing useful. Spend it as a **discovery experiment**: find the channel that converts, then double down with reinvested affiliate revenue.

### CHF 300 → Google Ads keyword test (weeks 1–4 post-launch)

Run two micro-campaigns in parallel for 4 weeks at CHF 5/day each (CHF 280 total + CHF 20 fees buffer). Both must use exact-match keywords only — broad match burns budget fast.

**Campaign A: "Swiss Travel Pass" intent** — keywords like `[swiss travel pass cost]`, `[swiss travel pass vs half fare]`, `[is swiss travel pass worth it]`. Land them on your Travel Pass article. Goal: discover whether transactional intent converts → affiliate booking.

**Campaign B: "Things to do in [city]" intent** — keywords like `[things to do in zermatt]`, `[zurich day trips]`, `[interlaken activities]`. Land them on the matching destination page. Goal: discover whether lower-intent browsing converts.

Watch GA4. Whichever campaign generates more `affiliate_click` events at lower cost-per-click is your channel. Kill the other after week 4.

### CHF 200 → Pinterest promoted pins (weeks 5–8)

Pinterest's "Promoted Pins" deliver Swiss travel content to high-intent planners 6–18 months ahead of trips. Promote your 3 top-performing organic pins from Sprint 3 with CHF 7/day for 4 weeks. Travel converts on Pinterest.

### CHF 0 → SEO content compounding

The biggest single lever in your budget bracket. Publish 1–2 stories per week throughout the 90 days. Each one targeting a specific long-tail Swiss travel question with explicit affiliate links. After 90 days you should have 12–24 articles ranking; by month 6, organic should be your largest channel.

Topics to prioritize (use https://answerthepublic.com or `site:reddit.com/r/Switzerland [keyword]` to validate demand):
- "Best time to visit [destination]"
- "Cost of a week in Switzerland — actual breakdown 2026"
- "Glacier Express vs Bernina Express — which is worth it?"
- "Switzerland with kids — what actually works"
- "Free things to do in [city]"

### CHF 200–500 → One micro-influencer collab (weeks 9–12)

After 8 weeks of data you'll know which affiliate partner is your highest commission earner. Approach 1–2 Swiss travel micro-influencers (5k–30k followers — bigger isn't better) with a paid collab: 1 Instagram Reel + 1 Story link sticker pointing to your highest-converting page. Budget: CHF 200–500 each. Find them via Instagram search `#swissalps`, `#explore_switzerland`, `#myswitzerland`.

### Always-on tactics (CHF 0)

Reddit comments — answer real questions in `r/Switzerland`, `r/travel`, `r/solotravel` with one line of value + a non-aggressive link to your specific article. Two well-placed answers = thousands of impressions over time. Don't spam; the mods enforce this.

Quora — same pattern, longer half-life. A good Quora answer to "Is the Glacier Express worth it?" can drive monthly clicks for years.

Affiliate partner co-marketing — once you've earned €100+ from any one partner, ask your account manager (Klook and Viator have them at that tier) for an inclusion in their newsletter or "featured publisher" page. Free, high-trust traffic.

---

## Definition of done — go/no-go checklist for May 18

Don't launch unless every one of these is green:

- [ ] `realswitzerland.ch` resolves over HTTPS with valid cert (already true — verify on launch morning)
- [ ] `/api/newsletter` accepts a real email and adds it to a Resend audience that actually receives email
- [ ] OG image is replaced (1200×630, ≥ 80 KB, proper composition with brand)
- [ ] All four affiliate networks show `realswitzerland.ch` as approved/active
- [ ] GA4 DebugView shows `page_view` and `affiliate_click` events firing with correct payload
- [ ] Lighthouse on home + activities + a destination + deals: Performance ≥ 80, A11y ≥ 95, SEO 100
- [ ] Pages render correctly on iPhone Safari + Android Chrome + desktop Safari/Chrome/Firefox
- [ ] Privacy policy mentions Travelpayouts Drive + the four affiliate partners by name
- [ ] Search Console verified, sitemap submitted, indexing requested for top pages
- [ ] At least 3 high-quality SEO articles published with affiliate links + widgets
- [ ] Social handles secured on Instagram, TikTok, Pinterest
- [ ] Launch email written and scheduled in Resend
- [ ] First Google Ads campaign created, budget capped, ready to enable

Anything red on launch day is fine to delay if it's a "polish" item, but the first 5 are non-negotiable for legal + revenue reasons.

---

## First 30 days post-launch — what to actually monitor

Most launches fail not at launch but in the 30 days after, because nobody watches the right metrics. Set a daily 10-minute reading habit:

**Daily (5 min)**
- GA4 Realtime — are people on the site? where from?
- GA4 → Reports → Engagement → Events → `affiliate_click` count and revenue value (`value` field in CHF)
- Resend dashboard — newsletter open rate (target ≥ 30%) and click rate (target ≥ 4%)

**Weekly (45 min, Monday morning)**
- GA4 → Acquisition → User acquisition → Source/medium. Which channel is winning?
- Search Console → Performance → top queries. What are people actually searching for? That's your next article.
- Each affiliate dashboard — clicks vs sales vs commission. Is the funnel converting?
- Vercel Analytics → Top pages, slowest pages

**The single most important number** in month 1 is **affiliate click-through rate from the home page** (clicks on `<PartnerWidget>` and `<AffiliateLink>` ÷ home page sessions). Below 1% means the page isn't selling. Above 4% means you should drive more traffic.

If it's < 1%, the wander hero or partner widget placement isn't working — A/B test the hero CTA copy or the position of the GYG carousel. If it's > 4%, your bottleneck is traffic, not conversion — pour the rest of your CHF 1,000 into the channel from "Marketing strategy" above that's converting best.

---

## What's deferred (intentionally not blocking launch)

These are real improvements but none of them gate going live. Ship without them; revisit in month 2–3.

- Viator Partner API integration (live experience listings) — widgets cover 95% of value
- Live booking inside the site (vs redirecting to partner) — far too complex for v1
- More languages (DE/FR/IT) — focus on English first; ranking in one language well > three poorly
- Mobile app or PWA install prompt — service worker is registered but no install push
- User accounts / saved trips — heart-saves work via localStorage; no auth required for v1
- Custom illustrations / hand-drawn icons — Fraunces + the existing iconography is fine
- A/B testing infrastructure — premature; you don't have enough traffic for statistical significance until month 3+

---

## Risks & how I'd mitigate each

**Risk: Affiliate networks don't approve in time.** Mitigation: SwissActivities is already approved (`ref=odbhodn` is real). It's enough to launch with. The others can flip on after. Do not hold launch for a single partner.

**Risk: First wave of traffic crashes the site.** Mitigation: Vercel scales automatically; the slim-projection optimization in `src/app/activities/page.tsx` already cut JSON from 1.5 MB to ~250 KB. You're safe up to 100k visitors/month on the free tier.

**Risk: Negative review from a Reddit thread.** Mitigation: Be honest in the launch posts. Lead with "I built this because the existing options were noisy/biased." Reddit punishes spin and rewards honesty. Your `/partners` disclosure is already strong — point to it.

**Risk: Google doesn't index quickly.** Mitigation: After Search Console submission, Google typically indexes within 48 hours for the home page and 1–2 weeks for the long tail. Don't panic before week 3. To accelerate, get one decent backlink (a comment in `r/Switzerland` linking to your Travel Pass article counts).

**Risk: Affiliate revenue is lower than expected.** Mitigation: Expected: CHF 0–50 commission in month 1, CHF 50–300 in month 2, CHF 200–800 in month 3, assuming 500/2,000/5,000 monthly visitors. If month 2 is < CHF 50, the problem is conversion (page or product), not traffic. Investigate first.

---

## What to ask me for next

When you're ready I can implement, in order of likely value:

1. The Search Console + Bing meta verification tags into `src/app/layout.tsx` (5 min once you have the strings)
2. A "/launch" or "/coming-soon" splash variant for pre-launch waitlist if you want one
3. The 3 Sprint 2 articles (I can draft each in ~30 min — give me the angle and one URL of a competing article you want to outrank)
4. The launch email copy (Resend audience email)
5. A small `<AffiliateButton>` variant of `<AffiliateLink>` styled like the wander coral CTA, for in-article use
6. Wiring `lib/viator-api.ts` for live experience listings (only worth it after launch when you've validated demand)

Send any of those and we'll knock them out one by one.
