# realswitzerland.ch — Affiliate Profit Plan

> Single goal: every activity page must (1) show ≥2 providers with real prices, (2) have a picture that 100% matches the activity, and (3) route every outbound click through a real affiliate ID. Anything that doesn't move one of those three needles is out of scope.

---

## Diagnosis (what's actually broken right now)

I read the codebase and content directory. Here's the honest state:

1. **The "comparison" premise is mostly fake.** Many activity JSONs have `providers: []` — only a single SwissActivities marketplace link. Pages that look like a comparison are showing one row. Examples spotted in `content/activities/`:
   - `classic-city-tour-lucerne-private.json` → 0 priced providers
   - `alice-wonderland-virtual-reality-game-lucerne.json` → 0 priced providers
   - `paragliding-davos-tandem-flight-from-jakobshorn.json` → 1 provider
2. **Image reuse is rampant.** Three completely unrelated activities (Davos paragliding, Lucerne city tour, Lucerne VR game) all use the *same* generic Unsplash photo `photo-1531973576160-7125cd663d86`. That's a credibility killer — once a user notices, they assume the whole site is auto-generated junk and leave.
3. **Affiliate tracking IDs are placeholders.** Only SwissActivities (`ref=odbhodn`) earns money today. GetYourGuide (`partner_id=XXXXXXX`), Viator (`pid=P00XXXXX`), Booking, Klook, Musement, Civitatis — all earn $0 until the real ID lands in `.env.local`.
4. **Location data is broken on scraped activities.** `city: "Switzerland"`, `canton: ""`, lat/lng `46.8182, 8.2275` (geographic centroid of CH) defeats the marketplace search-URL templates that rely on `{city}` / `{canton}`.
5. **Branding holdouts.** `wander.ch` still appears in `LAUNCH_PLAN_v2.md`, `src/components/layout/header.tsx`, `src/components/layout/theme-provider.tsx`, `Switzerland Activities.html`. Needs a sweep to `realswitzerland.ch`.

The good news: the *plumbing* (`src/data/affiliate-partners.ts`, `src/lib/affiliate.ts`, `MarketplaceListing` type, `getMarketplaceLinks()`) is well-architected. The problem is data, not code. That's much cheaper to fix.

---

## Part A — Guarantee multi-provider price comparisons

### Target rule

Every activity that ships in the index has **either**:
- ≥2 priced providers in `providers[]` (true cross-supplier comparison), **or**
- ≥1 priced provider plus ≥2 marketplace search links (provider + cross-platform check).

Anything below that threshold is **quarantined** — kept in `content/activities/` but excluded from sitemap/index by a `published: false` flag — until a human or a re-scrape promotes it.

### Implementation steps

1. **Add a `published` gate.**
   - Extend `Activity` type with `published?: boolean` (default true for back-compat).
   - In `src/lib/content/...` index loader, filter `published === false` out of list pages and sitemap.
   - In `scripts/content-check.mjs`, count any activity with `providers.length < 1 && marketplaces.length < 2` and force-set `published: false`.

2. **Pull GetYourGuide deep links + prices.** GYG's Partner API (free with affiliate signup) returns activity name, URL, image, and `from_price`. Write `scripts/fetch-getyourguide-listings.mjs` that:
   - Reads each activity's name + city.
   - Queries GYG search API.
   - Stores top match into `marketplaces[]` (`partnerId: "getyourguide"`, `bookingUrl`, `isDirectLink: true`) and a `Provider` row when price is returned.
   - Skips matches with similarity score below a threshold (so we don't mismatch a "Lucerne city tour" to a Geneva one).

3. **Same for Viator.** Viator's free affiliate API has a search-by-keyword endpoint that returns price + image. Write `scripts/fetch-viator-listings.mjs`.

4. **Promote marketplace prices to providers.** `scripts/promote-marketplace-prices.mjs` already exists — extend it so any marketplace listing with a price becomes a real `Provider`, so the comparison table includes it.

5. **Rerun once, then on a schedule.** Daily scrape via the `schedule` skill or a GitHub Action. Stale prices are an affiliate-trust killer; show a "last updated" timestamp on every comparison block.

### UI changes (in `src/components/`)

A clean comparison table for the detail page:

| Provider | From price | Rating | Free cancel | Verdict |
|---|---|---|---|---|
| Air Davos Paragliding | CHF 190 | 4.6 ★ | ✓ | Direct supplier |
| GetYourGuide | CHF 195 | 4.5 ★ | ✓ | Best app/UX |
| SwissActivities | CHF 190 | 4.4 ★ | ✓ | **Cheapest** ← badge |
| Viator | CHF 199 | 4.4 ★ | ✓ | Most reviews |

Each row is one `<a>` with the affiliate URL. The "Cheapest" / "Best rated" badges go where they're true — never both on the same row, never as marketing decoration.

---

## Part B — Pictures matching 100%

### Image-source priority (highest → lowest)

1. **Operator's own hero image** (scraped alongside price). Highest match because the operator chose it. Attribute by name; this is fair-use editorial under most jurisdictions, but ask permission for top 50 most-trafficked activities to be safe.
2. **SwissActivities/GYG/Viator hero image** (their licensed image). Pulled by the same scraper that pulls the price. Already partially implemented via `activity-images-swissactivities.json`.
3. **Wikipedia/Wikimedia image** — only if the article's `wikipediaTitle` is the *exact* feature, not "near" it. Currently misused: the `adventure-park-interlaken` activity points at a Goldswil viaduct panorama, which is geographically near Interlaken but doesn't show the adventure park.
4. **Hand-curated Unsplash** with a specific keyword. Used only after vision check (below).

### Verification pipeline

Add `scripts/verify-activity-images.mjs`:
- For each activity, send `{ image_url, activity_name, subcategory, location.city }` to a vision model (Claude with vision works; the API is already in `.env.local`).
- Prompt: *"Does this image plausibly depict [activity name] in [city]? Reply JSON `{match: 0..1, reason: \"...\"}`."*
- Anything below 0.7 → mark `imageVerified: false`, fall back to the next tier.
- Anything above 0.9 → `imageVerified: true`.

Add a CI assertion (`scripts/content-check.mjs`):
- **No two activities may share the same image URL.** That alone removes the photo-1531973576160 problem.
- **No published activity may have `imageVerified: false`.**

This is the single biggest trust upgrade — and it's automatable.

### Schema addition

Extend `Activity` with:
```ts
imageVerified?: boolean | "manual";  // "manual" = curator approved, skip vision check
imageSource?: "operator" | "marketplace" | "wikipedia" | "unsplash";
```

---

## Part C — Affiliate IDs (the actual money pipe)

The plumbing routes every link through `buildAffiliateUrl()`. It just needs the IDs.

| Partner | What to do | Where it goes |
|---|---|---|
| GetYourGuide | Sign up at `partner.getyourguide.com`. Get `partner_id`. | `NEXT_PUBLIC_AFFILIATE_GETYOURGUIDE_PARAMS` in `.env.local` |
| Viator | Sign up at `viatorpartner.com`. Get `pid` + `mcid`. | `NEXT_PUBLIC_AFFILIATE_VIATOR_PARAMS` |
| Booking | Already a partner network candidate; sign up at `partners.booking.com`. Get `aid`. | `NEXT_PUBLIC_AFFILIATE_BOOKING_PARAMS` |
| Klook | Sign up at `affiliate.klook.com`. Get `aid`. | `NEXT_PUBLIC_AFFILIATE_KLOOK_PARAMS` |
| Musement | Either Travelpayouts or direct via `musement.com/affiliates`. | `NEXT_PUBLIC_AFFILIATE_MUSEMENT_PARAMS` |
| Civitatis | Direct: `civitatis.com/en/affiliates/`. Get `aid`. | `NEXT_PUBLIC_AFFILIATE_CIVITATIS_PARAMS` |
| SwissActivities | ✓ Already done (`ref=odbhodn`). | — |

Acceptance test before any of this hits prod: load any activity page, click each provider, and confirm the `partner_id` / `pid` / `aid` is *not* `XXXXXXX` in the destination URL.

---

## Part D — Conversion levers (without making it worse)

These are additive — they don't reduce content quality, they raise click-through.

1. **Sticky mobile CTA.** Bottom bar on `/activities/[slug]` showing `From CHF 190 · Compare 4 providers →`. Tap opens the comparison table.
2. **"Best for…" badges.** Cheapest, Best rated, Free cancellation. Earned, never decorative.
3. **`Product` + `AggregateOffer` schema.org markup.** Already partially in `json-ld.tsx` — extend to include all providers' prices so Google can render rich price snippets in SERPs. This is a free CTR boost that swissactivities.com doesn't get (single-source pricing).
4. **Aggregated rating.** Show the average across providers, with the count: *"4.5 ★ from 1,243 reviews across 4 platforms."* That's a story competitors can't match.
5. **"Why we recommend" text.** Two sentences per activity, written by you (or AI-drafted, human-edited). Generic descriptions like *"Discover X in Switzerland"* (currently in every scraped activity) tank both SEO and trust. Fix this with a content pass.
6. **Honest exit-intent.** Only fire when the cheapest price genuinely changed since the user landed. Don't fake it.

---

## Part E — Differentiation vs. competitors

Competitors are platforms, not comparators:
- **swissactivities.com** — only their own inventory. Strong on Switzerland depth, weak on cross-platform pricing.
- **getyourguide.com / viator.com** — global, single-platform, no comparison.
- **myswitzerland.com** (the official tourism board) — editorial-only, no booking.

Your defensible angle is: **the only Switzerland-focused site that compares 4+ booking platforms side-by-side, with the cheapest highlighted, and shows operator imagery + Wikipedia context for verification.** Lead with that on the home page hero copy, in meta descriptions, and in every Open Graph image.

---

## Part F — Branding sweep (realswitzerland.ch, not wander.ch)

Files still containing `wander.ch`:
- `LAUNCH_PLAN_v2.md`
- `src/components/layout/header.tsx`
- `src/components/layout/theme-provider.tsx`
- `Switzerland Activities.html`

Single find/replace pass. Verify after with `grep -r "wander\.ch" --exclude-dir=node_modules`.

Also worth checking: the env defaults in `affiliate-partners.ts` already say `realswitzerland`, but `partner_id=realswitzerland` (Omio) and `affiliateCode=realswitzerland` (Rentalcars) — these will only work if those partners assigned you that exact ID. Confirm with each partner; they usually generate a numeric ID instead.

---

## Concrete week-1 work order

In dependency order. Each step has a clear "done when" check.

1. **Branding sweep.** Replace `wander.ch` → `realswitzerland.ch` in the 4 files above. *Done when*: `grep -r "wander\.ch" --exclude-dir=node_modules` returns nothing.
2. **`published` gate + content-check rule.** Quarantine any activity with `<2` total provider/marketplace links. *Done when*: `npm run content-check` reports the quarantine count and excludes them from sitemap.
3. **GetYourGuide listings scraper.** *Done when*: ≥80% of currently-quarantined activities now have a GYG marketplace link with price.
4. **Viator listings scraper.** Same bar.
5. **`promote-marketplace-prices.mjs` extension.** Convert priced marketplaces into `Provider` rows. *Done when*: average providers-per-activity is ≥2.
6. **Vision-based image verification.** *Done when*: zero published activity has `imageVerified: false`, and the duplicate-image CI assertion passes.
7. **Real affiliate IDs in `.env.local`.** *Done when*: an end-to-end click test on each partner shows your real ID in the destination URL.
8. **Comparison table UI redesign.** Add the badge logic. *Done when*: at least three different "Best for…" badges show on three different activities.
9. **Sticky mobile CTA + AggregateOffer JSON-LD.** *Done when*: Google's Rich Results Test shows price snippets for 5+ activities.
10. **Home-hero copy rewrite** to lead with the comparison angle. *Done when*: hero, meta description, and OG image all say *"Compare prices across [N] booking platforms"*.

After step 5 you have a real comparison product. After step 6 it's trustworthy. After step 7 it earns money. After step 10 it markets itself.

---

## What I'd do differently if I were you

- **Start narrow.** Pick the 50 highest-search-volume Swiss activities (Jungfraujoch, Mt. Pilatus, Glacier Express, Rhine Falls, Lake Geneva cruise, Matterhorn cog rail, etc.). Make those *flawless* — 4 providers, verified images, hand-written copy. Quarantine the rest. 50 perfect pages out-rank 1,500 generic ones. SEO rewards depth, not breadth.
- **Don't ship before vision-checking the top 50 images.** A single mismatched hero photo on a page Google sends traffic to is more damaging than 1,000 perfect pages going un-indexed.
- **Track per-provider conversion rate.** `affiliate_click` events already fire. Add a Looker Studio / GA4 dashboard breaking down RPM by partner. Within a month you'll know which network actually converts in Switzerland (it's almost certainly *not* uniformly distributed) and you can re-rank the comparison table accordingly.
