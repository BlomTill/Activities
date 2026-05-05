# Affiliate API signup guide — realswitzerland.ch

How to apply to each partner program, what they ask for, how long they take, and exactly which line to put the resulting ID/key on in `.env.local`.

> Apply to the live-API partners first (Viator, Klook, Travelpayouts). Those are the three that the live-pricing engine actually fetches from — every approved key adds a real comparison row to every published activity. The rest only use a tracking parameter on a deep-link, which earns money but doesn't drive comparison depth.

## ⚠️ Status update — what's actually live as of 2026-05

What you already have configured in `.env.local` and ready to earn:

- **Viator** — affiliate `pid=P00299712` ✓ AND **API key live** (`c66110ff-...`). Live prices already flowing into the comparison table. **Highest priority partner right now.**
- **GetYourGuide** — affiliate `partner_id=JE8NE76` ✓. Tracking-only; **API access blocked until ~100k monthly visits** (their gate). No live row in the comparison table yet — fall back is the deep-link.
- **Klook** — affiliate `aid=120379` ✓. Tracking-only; need to request API access separately.
- **Travelpayouts** — `marker=724838` ✓. Drive AI script already mounted in the layout. **Strong candidate for being the meta-API for everything else** (see the recommendation below).
- **SwissActivities** — `ref=odbhodn` ✓. Static deep-links (no public REST API). The screenshot you shared is from their B2B "Leisure Link" API (`lla.swissactivities.com`) — that's a separate program with user/password auth meant for resellers; it requires a sales conversation with their team to access.

## Recommendation — go all-in on Travelpayouts

You asked the right question. Given that GetYourGuide's API is gated behind 100k MAU, **Travelpayouts is the highest-leverage move you can make this month**. Here's why:

One application, one approval, and you instantly get programs for: Booking.com, Hotellook, Aviasales, KiwiTaxi, WayAway, Hertz, Musement, plus a growing list of activity providers. Each one has its own deep-link generator and many have their own small API. You consolidate to a single dashboard, single payout schedule, single tax form.

For your specific stack:
- TP gives you **Booking** without applying to Booking directly (Booking's direct affiliate program is fine but their API only covers hotels and is gated for "Connectivity Partners" — TP is friction-free).
- TP gives you **Musement** (TUI Group) without the slow direct application.
- TP also has its own **Data API** ([travelpayouts.com/developers](https://support.travelpayouts.com/hc/en-us/categories/200358578-API)) which exposes a unified product catalog. Worth applying to once your TP account is approved (instant) and your `marker` is active.
- The Travelpayouts **Drive AI** script (already in your layout via `NEXT_PUBLIC_TRAVELPAYOUTS_DRIVE_SRC`) auto-injects contextual offers based on page content. That's passive revenue you don't have to wire into the comparison table.

**Action right now**: log into your TP dashboard, "join" every program you see (instant approval for ~80% of them), and forget about the rest until you hit 100k MAU and the GYG API unlocks.

## Prep work — do this once, paste into every form

Have these answers ready in a notes file. You'll be asked the same things 8 times.

- Site URL: `https://realswitzerland.ch`
- Site purpose (1 sentence): *"Switzerland-focused activity & ticket comparison site that aggregates prices from multiple booking partners side-by-side, helping travellers find the cheapest option for things to do across Switzerland."*
- Promotion methods: organic SEO, content marketing, comparison reviews. (Don't tick "PPC bidding on partner brand keywords" — that gets you instantly rejected by most networks.)
- Country / billing entity: wherever you're filing taxes
- Payment method: PayPal or IBAN (have both ready)
- Monthly traffic estimate: be honest; "pre-launch / under 10k monthly visits" is fine. Lying gets accounts revoked once they reconcile.
- Privacy + Cookies + Affiliate-disclosure pages live before applying. The disclosure page is `/partners`. If yours is empty, write 200 words explaining the comparison model and that commissions don't change the user's price — most networks check this before approving.

---

## 1. GetYourGuide — Partner API + affiliate

**Where:** https://partner.getyourguide.com/

**Status for you:** Affiliate ✓ done (`partner_id=JE8NE76`). API access **blocked** by their 100k monthly-visits requirement.

**Why this matters:** GYG is the largest activities marketplace in Europe and has the deepest Switzerland inventory, so getting their live prices into the comparison table is a meaningful upgrade — but it's gated. Until then, every GYG row in the table is a deep-link (no live price), which is fine for revenue but doesn't deepen the comparison depth.

**What to do today:**
1. Keep using the tracking param `partner_id=JE8NE76` on every deep-link (already wired via `NEXT_PUBLIC_AFFILIATE_GETYOURGUIDE_PARAMS`).
2. Use the **GYG widget** as a temporary substitute for live API content. Their JS widget renders live availability/prices in an iframe-style block. You can drop it onto the homepage and category pages without API approval. Get the widget code from the GYG partner dashboard → **Tools → Widgets → Activity finder / Single tour**.
3. Track monthly visits in GA4. The moment you cross 100k visits in a calendar month, re-apply for API access. Cite your `partner_id` and traffic numbers in the application — same-day approvals are common at that threshold.

**Goes in `.env.local`:**

```
# Affiliate tracking — already configured
NEXT_PUBLIC_AFFILIATE_GETYOURGUIDE_PARAMS=partner_id=JE8NE76&utm_medium=online_publisher&utm_source=realswitzerland

# API key — only set this once approved (and the live-prices adapter
# in src/lib/live-prices.ts will start including a GYG comparison row)
# GETYOURGUIDE_API_KEY=your_long_api_token_here
```

**Gotcha:** The tracking param key is `partner_id` (lowercase, with underscore). Their docs sometimes call it "partnerId" — that's wrong on the URL.

---

## 2. Viator — Partner API (TripAdvisor company) ✓ LIVE

**Status for you:** Both affiliate (`pid=P00299712`) AND API key (`c66110ff-...`) configured. **The live-pricing comparison table is already pulling Viator prices** for every published activity via `POST /partner/search/freetext` (cached 10 min via `unstable_cache`).

**One critical rule — the productUrl returned by the API is pre-attributed.** Viator's spec explicitly forbids modifying it: *"You must use the full URL and not modify it in any way – any changes could result in failure to attribute the sale to you."* `buildAffiliateUrl()` in `src/lib/affiliate.ts` already detects pre-attributed Viator URLs (presence of `pid` + `mcid` + `medium=api`) and passes them through untouched. Don't break this.

**How to verify it's working:**
1. `npm run dev`, open any published activity (e.g. `/activities/jungfraujoch-top-of-europe`).
2. Look for a "Viator" row in the comparison table with an "Updated Xm ago" label.
3. Right-click the "Book →" button → Copy link → confirm it contains `pid=P00299712&mcid=42383&medium=api&campaign=...`.
4. Open in incognito → check Viator's partner dashboard → click logs should record the click within ~30 seconds.

**Already in `.env.local`:**

```
NEXT_PUBLIC_AFFILIATE_VIATOR_PARAMS=pid=P00299712&mcid=42383&medium=link
NEXT_PUBLIC_VIATOR_PID=P00299712
VIATOR_API_KEY=c66110ff-0327-43eb-8b28-3850174ea97f
```

---

## 3. Klook — Affiliate API

**Where:** https://affiliate.klook.com/

**Why:** Strong on rail passes (Swiss Travel Pass, Bernina, Glacier Express), ski passes, and the Asian-traveller market. Commission 5%. Their API returns CHF prices natively if you ask.

**Apply:**
1. Sign up. The default product type pre-checked is "Influencer/Content Creator" — switch to **"Website Owner"** for higher per-sale commission.
2. They ask for site description, monthly traffic, and target audience. Switzerland-themed sites get fast-tracked because it's a high-AOV market for them.
3. Approval: 5–10 business days. They DO check the live site, including whether `/partners` mentions Klook by name. (Add Klook to your disclosure list before applying — saves a back-and-forth email.)
4. Once approved, dashboard → **API Center** → request API access. This is a separate approval step, usually fast (1–2 days). They issue you `X-API-KEY` and a paired secret.

**Goes in `.env.local`:**

```
NEXT_PUBLIC_AFFILIATE_KLOOK_PARAMS=aid=YOUR_AID&aff_platform=online_publisher
KLOOK_API_KEY=your_api_key
KLOOK_API_SECRET=your_api_secret
```

**Gotcha:** Their CHF prices route through their own FX engine; rates differ slightly from interbank. That's normal — show "from CHF X" rather than promising an exact total.

---

## 4. SwissActivities — affiliate ✓ done; Leisure Link API is a separate program

You already have `ref=odbhodn` working as the standard affiliate link parameter. That's how the comparison table currently routes SwissActivities clicks — static deep-links, no live prices.

**About the "Leisure Link API"** (the page you saw at `lla.swissactivities.com/{version}/login`): that's not a regular affiliate API. It's a B2B reseller integration meant for OTAs and large travel sites that want to embed SwissActivities inventory in their own checkout flow. It uses bearer-token auth (POST `/login` with `{user, password}` → `accessToken`), exposes search/filter/availability/booking endpoints, and gives you full booking + payment capability — i.e. you'd be selling directly on `realswitzerland.ch` and remitting to SwissActivities.

For your stage, that's overkill. It also requires a sales conversation with their B2B team, a legal agreement, and ongoing operational complexity (you become responsible for cancellations, refunds, customer service). Sticking with the standard affiliate `ref=odbhodn` is the right call for launch.

**If you want a higher commission tier** (default 3% → 5%), email their affiliate team after you've sent them ~50 verified bookings. They'll usually grant it.

**If/when you outgrow affiliate and want full inventory control**, the Leisure Link API is what you'd ask for. Build it as a new adapter in `src/lib/live-prices.ts` (auth flow: cache the bearer token for `expiresInMinutes`, refresh on 401).

---

## 5. Booking.com — affiliate (accommodations only)

**Where:** https://www.booking.com/affiliate-program/v2/index.html

**Why:** No activity inventory but the highest accommodation conversion rates on the planet. If you ever add hotel comparisons (don't bother for launch), this is the partner. Commission = 25% of *Booking's* margin (so ~3-4% of room price).

**Apply:**
1. Direct apply → form asks for `aid`-eligible site description. They auto-approve most travel content sites within 24h.
2. Get `aid` (numeric) from the dashboard.

**Goes in `.env.local`:**

```
NEXT_PUBLIC_AFFILIATE_BOOKING_PARAMS=aid=YOUR_AID&label=realswitzerland
```

**Gotcha:** No API for activities. They have a Demand API for hotels but it requires you to be a "Connectivity Partner" — that's only worth it if you have your own hotel-search UI. For launch, skip.

**Easier alternative:** apply via **Travelpayouts** instead (see #9). Same Booking inventory, simpler approval, and you get Aviasales / Hotellook in the same dashboard.

---

## 6. Musement (TUI Group)

**Where:** https://www.musement.com/affiliate-program/  *(or via Travelpayouts)*

**Why:** Strong on cultural / museum entries (CERN, Olympic Museum Lausanne, Chaplin's World). Commission 5–6% direct, or ~50% margin share via Travelpayouts.

**Apply:**
- **Direct route:** form on the page above. Approval 5–7 days. They're picky about content quality — make sure your /partners page is real before applying.
- **Travelpayouts route (recommended):** sign up at Travelpayouts (#9) and add the Musement program from inside their dashboard. Approval is usually instant because Travelpayouts vouches for you.

**Goes in `.env.local`:**

```
NEXT_PUBLIC_AFFILIATE_MUSEMENT_PARAMS=utm_source=realswitzerland&utm_medium=affiliate&utm_campaign=YOUR_CAMPAIGN_ID
```

If you go through Travelpayouts, the param is `marker=YOUR_MARKER` instead and the URL goes through `tp.media`.

---

## 7. Civitatis

**Where:** https://www.civitatis.com/en/affiliates/

**Why:** Spanish-headquartered, strong in guided / free walking tours. Pays €1 per participant on free tours (rare in this industry). Commission 8–10% on paid.

**Apply:**
1. Direct form. Same business questions as the others.
2. Approval is usually same-day — they're aggressive about onboarding.
3. Get your `aid` (alphanumeric) from the dashboard.

**Goes in `.env.local`:**

```
NEXT_PUBLIC_AFFILIATE_CIVITATIS_PARAMS=aid=YOUR_AID&utm_source=realswitzerland
```

**Gotcha:** Their Switzerland inventory is thinner than GYG/Viator. Worth having for the long-tail "free walking tour Lucerne" type queries.

---

## 8. Omio

**Where:** https://www.omio.com/affiliate-program

**Why:** Train + bus + ferry. Useful for "how to get to Jungfraujoch" type pages later. Commission 2–6%.

**Apply:** Form, 5-day approval. They use Awin under the hood, so if you already have Awin you can skip the direct application and just join "Omio" inside Awin.

**Goes in `.env.local`:**

```
NEXT_PUBLIC_AFFILIATE_OMIO_PARAMS=partner_id=YOUR_NUMERIC_ID
```

---

## 9. Travelpayouts (meta-network — recommended shortcut)

**Where:** https://www.travelpayouts.com/

**Why this matters:** It's a single dashboard that brokers Booking, Aviasales, Hotellook, KiwiTaxi, Musement, WayAway, Hertz, and many more. One application, one tax form, one payout, one tracking marker. Most affiliates use this *instead of* applying to each program directly because it's faster and consolidates monthly invoices.

**Apply:**
1. Sign up. Approval is essentially instant; they won't reject a real site.
2. From the dashboard, "join" each program one by one. Most are auto-approved within minutes; Booking takes 24h.
3. Your `marker` (numeric) is the universal tracking ID across all sub-programs.

**Goes in `.env.local`:**

```
NEXT_PUBLIC_AFFILIATE_TRAVELPAYOUTS_PARAMS=marker=YOUR_MARKER
```

**Gotcha:** Commission is slightly lower than direct (TP takes a cut) but the convenience is real. Use direct for the top 3 partners, Travelpayouts for the long tail.

---

## 10. Swiss Travel Pass / Eurail / Interrail

**Where:** https://www.eurail.com/en/about-us/affiliate-program  *(Eurail and Interrail share the program)*

**Why:** The Swiss Travel Pass is one of the highest-AOV products you can sell — typical ticket CHF 250–500. Commission ~5%.

**Apply:** Form, 5–10 day approval. They want to see Switzerland-relevant content, which you obviously have.

**Goes in `.env.local`:**

```
NEXT_PUBLIC_AFFILIATE_SWISSPASS_PARAMS=partner_id=YOUR_ID
```

**Gotcha:** They require the disclosure to specifically name "Eurail Group" — add that to `/partners`.

---

## Suggested order to apply (week 1)

Day 1 (30 min): GetYourGuide + Viator + Klook + Travelpayouts (the four most important — start the clock on their approval queues immediately).

Day 2 (15 min): Civitatis + Musement (via Travelpayouts) + SwissPass.

Day 3+ (passive): Wait for approvals; check Vercel logs to confirm tracking params land in outbound URLs as each comes in.

Once all are approved you're earning on every link. The live-pricing engine will automatically gain a comparison row from each of GYG / Viator / Klook the moment its key shows up in `.env.local` — zero code changes required.

---

## Verifying everything works

After adding any new key:

1. `npm run dev`, open any published activity page.
2. Open dev tools → Network tab → filter "live-prices" / your slug.
3. Hover any "Book →" button — the destination URL should contain your real tracking parameter (no `XXXXXXX` placeholders).
4. Click through in an incognito window. Check the partner's dashboard → click logs → confirm your click registered with the right slug attribution (`es_slug=jungfraujoch-top-of-europe`).

Once a click logs end-to-end on each network, you're production-ready.
