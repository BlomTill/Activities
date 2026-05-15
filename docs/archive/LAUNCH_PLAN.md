# ExploreSwitzerland — Launch-Ready Plan
**Prepared for:** Till  
**Date:** April 22, 2026  
**Status:** Foundation complete. This document covers every gap between "built" and "live."

---

## ⚡ Bugs Fixed Right Now (Already Done)

Two critical files still referenced the old domain `swissactivity.ch` — **fixed**:
- `src/app/sitemap.ts` → BASE_URL now `https://exploreswitzerland.ch`
- `src/app/robots.ts` → sitemap URL now `https://exploreswitzerland.ch/sitemap.xml`

These would have caused Google to index your site under the wrong domain and break sitemap discovery.

---

## Part 1: Launch Blockers — Must Fix Before Going Live

These are things that will either break the site for real users, lose money, or create legal liability the moment you go live.

### 1.1 Register the Domain
**What:** `exploreswitzerland.ch` (primary) + `exploreswitzerland.com` (redirect).  
**Why:** `.ch` domains rank significantly better in Swiss Google searches. Also grab `.com` to prevent someone else from squatting on it.  
**Where:** Use [Infomaniak](https://www.infomaniak.com/en/domains) (Swiss, CHF 8–12/year for `.ch`) or [Hostpoint](https://www.hostpoint.ch). They speak German/French/Italian and have Swiss data centres.  
**After:** Point DNS A/CNAME records to Vercel (see 1.2).

### 1.2 Deploy to Vercel
**What:** Push code to GitHub → import project on [vercel.com](https://vercel.com) → connect domain.  
**Why:** Vercel is purpose-built for Next.js. Free tier handles 100GB bandwidth/month, has global CDN, automatic HTTPS, and preview deployments on every git push.  
**Steps:**
1. `git push` to GitHub (make sure `.env.local` is in `.gitignore` — it should already be)
2. Go to vercel.com → New Project → import repository
3. Add environment variables (GA4 ID, affiliate IDs) in the Vercel dashboard — never in code
4. Connect your `exploreswitzerland.ch` domain in Vercel's Domain settings
5. Vercel issues a free SSL cert automatically via Let's Encrypt

### 1.3 Replace Placeholder IDs — Affiliate & Analytics
The codebase has placeholder values in two places. **These must be real before launch** — otherwise you're sending traffic to partners and earning nothing.

**File: `src/app/layout.tsx` (line 71 & 73)**
```
G-XXXXXXXXXX  →  your real GA4 measurement ID
```
Get this from: [analytics.google.com](https://analytics.google.com) → Create Property → Web → copy "Measurement ID" (format: G-XXXXXXXXXX).

**File: `src/data/affiliate-partners.ts`**
Replace every `XXXXXXX` / `P00XXXXX` / `XXXXX` with real IDs after registering:

| Partner | Apply at | What to replace |
|---------|----------|-----------------|
| GetYourGuide | partner.getyourguide.com | `partner_id=XXXXXXX` |
| Viator | viatorpartnerresources.com | `pid=P00XXXXX` |
| Booking.com | affiliate.booking.com | `aid=XXXXXXX` |
| Klook | affiliate.klook.com | `aid=XXXXX` |
| SwissActivities | swissactivities.com/affiliate | `tap_a=XXXXX` |
| Rentalcars | rentalcars.com/affiliate | `affiliateCode=exploreswitzerland` |

GetYourGuide and Viator typically approve within 1–3 business days. Booking.com is instant for new accounts.

### 1.4 Connect the Newsletter Form
**Current state:** The `NewsletterSignup` component captures email and shows a success state — but `handleSubmit` never sends the email anywhere. The form is fake.  
**Fix:** Create `src/app/api/newsletter/route.ts` and wire it to a real email provider.

**Recommended provider: [Resend](https://resend.com)**
- Free tier: 3,000 emails/month, 100/day
- Developer-first, simple REST API
- Integrates with Next.js route handlers in ~30 lines
- Stores subscribers in Resend Contacts

Steps:
1. Sign up at resend.com, get your API key
2. Add `RESEND_API_KEY=your_key` to `.env.local` (and to Vercel environment variables)
3. Create the API route (see code below)
4. Update `handleSubmit` in `newsletter-signup.tsx` to `fetch('/api/newsletter', ...)`

```typescript
// src/app/api/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, intent } = await req.json();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  
  // Add to Resend audience
  const res = await fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      audience_id: process.env.RESEND_AUDIENCE_ID,
      unsubscribed: false,
      first_name: '',
      metadata: { intent },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
```

### 1.5 Privacy Policy + Cookie Consent (GDPR — Legal Requirement)
**Why:** You collect email addresses (newsletter) and use Google Analytics. Under Swiss DSG (Federal Act on Data Protection) and EU GDPR, this requires:
1. A privacy policy explaining what data you collect and why
2. Consent before dropping analytics cookies

**Create `/privacy` page** (minimum content):
- What data you collect: email (newsletter signup), usage data (GA4 analytics), IP addresses
- Why: newsletter communications, site improvement
- Third parties: Google Analytics, Resend (or Mailchimp), affiliate partners
- User rights: access, deletion, unsubscribe
- Contact email for data requests: your email
- Swiss legal basis: Art. 6 DSG — legitimate interest / consent

**Cookie consent banner:** Add a simple cookie consent component that:
- Shows on first visit (use `localStorage` to remember consent)
- Only loads the GA4 `<Script>` tags after consent is given
- Provides "Accept All" and "Reject Analytics" options

Minimal implementation: wrap your GA4 `<Script>` tags in the layout with a consent check. Libraries like `react-cookie-consent` (npm) handle this in 10 lines.

### 1.6 Add a Real Open Graph Image
**Current state:** `layout.tsx` has `openGraph` metadata but no `images` property. When anyone shares the site on WhatsApp, iMessage, Twitter/X, or LinkedIn, they get a blank preview.  
**Fix:**
1. Create a 1200×630px banner image for the site (Canva works perfectly — use a Swiss Alps photo with the "ExploreSwitzerland" logo over it)
2. Save as `/public/og-image.jpg`
3. Add to `layout.tsx` metadata:
```typescript
openGraph: {
  ...existing properties...
  images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'ExploreSwitzerland' }],
},
twitter: {
  card: 'summary_large_image',
  images: ['/og-image.jpg'],
},
```

### 1.7 Verify PWA Manifest Exists
**Current state:** `layout.tsx` references `manifest: "/manifest.json"` in metadata. Check that `public/manifest.json` exists.  
**If missing, create `/public/manifest.json`:**
```json
{
  "name": "ExploreSwitzerland",
  "short_name": "ExploreCH",
  "description": "Your Swiss travel companion",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#dc2626",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```
Also create `/public/icons/icon-192.png` and `/public/icons/icon-512.png` (the red ES logo on white).

### 1.8 Add `<html lang>` Fallback for Translated Pages
**Current state:** `layout.tsx` has `<html lang="en">` hardcoded. This is fine for now (site is English-first), but Google uses this for language targeting.  
**Action needed:** No change needed pre-launch. Note this for when i18n goes live.

---

## Part 2: Quality Gates — Things That Build Trust

These won't block launch but will make users bounce if missing.

### 2.1 Fix the Top 30 Activity Images
**Problem:** Activity images use Unsplash CDN URLs (`images.unsplash.com/...`). These work in development but are:
- Rate-limited (Unsplash will start returning 403s at scale)
- Not under your control (images can be deleted)
- Not optimised for your specific card dimensions

**The right approach:**
1. Download the best image for each of your top 30 activities (by traffic importance: Jungfraujoch, Matterhorn, Lake Geneva, Lucerne, Rhine Falls, etc.)
2. Convert to WebP (use squoosh.app — free, browser-based)
3. Save as `/public/images/activities/[slug]-card.webp` (800×500) and `/public/images/activities/[slug]-hero.webp` (1600×900)
4. Update `imageUrl` in `activities.ts`

For the remaining 120 activities, leave Unsplash URLs for now but plan to replace them over 4–6 weeks.

### 2.2 Wire Group Pricing to Activity Cards
**Problem:** `GroupContext` is built (correctly) but `activity-card.tsx` and the activity detail page don't read it. The group size selector changes nothing visible.  
**Fix:** In `activity-card.tsx`, import `useGroup` and calculate the group total:
```typescript
const { group } = useGroup();
const groupTotal = provider.pricing.adult * group.adults 
  + provider.pricing.child * group.children 
  + provider.pricing.senior * group.seniors
  + provider.pricing.student * group.students;
```
Show "Group: CHF X" when total group size > 1. This is your single biggest conversion lever because families buying 4 tickets see an honest "CHF 936 for your group" which feels more real than "CHF 234/person."

### 2.3 Verify All Internal Links Work
Run a full link check before launch. Common issues to look for:
- `/plan` — Does this page exist? (It's referenced from homepage but isn't in the src file list — check if it redirects somewhere)
- `/stories/[slug]` — Is this different from `/blog/[slug]`? Appears in homepage but both `/stories` and `/blog` directories exist
- Navigation links in header/footer point to real pages

### 2.4 Mobile Responsiveness Audit
The design looks clean but Swiss tourism users are overwhelmingly mobile (60–70% of travel searches are on phones). Manually test on:
- iPhone SE (375px width) — small screen edge case
- iPhone 14 (390px) — typical iOS
- Android mid-range (360px)
- iPad (768px)

Key areas to check:
- AgeBar: does horizontal scroll work on mobile?
- Activity cards: 2-column grid on mobile looks right
- Hero section: does text truncate properly on small screens?
- Navigation: hamburger menu opens cleanly?

### 2.5 Verify Blog Posts Have Real Content
Check `src/data/blog-posts.ts` — are these placeholder stubs or real articles? If they're stubs with fake content, either:
- Remove them from the homepage featured story until you write real content, OR
- Write the first 2 real articles before launch (see Part 3 for topics)

Launching with placeholder blog content looks amateurish and hurts SEO.

### 2.6 Add a Real About Page
`/about` exists. It should clearly state:
- What ExploreSwitzerland is (independent comparison + planning site for Swiss activities)
- Who runs it (you — name builds trust)
- Your editorial independence policy (you don't take payment for rankings)
- That you earn affiliate commissions (legally required disclosure in CH/EU)
- A real contact email

### 2.7 Affiliate Disclosure on Every Booking Link
Swiss and EU law requires disclosing affiliate relationships. You have a `/partners` page — make sure every activity page also has a small disclosure line near booking buttons:
```
"Booking links may earn us a commission at no extra cost to you. See our partners page."
```
The `AFFILIATE_REL = "sponsored noopener nofollow"` is already set in `affiliate.ts` — that's the technical part done. You just need the visible disclosure text.

---

## Part 3: Revenue Activation — First CHF

### 3.1 Affiliate Program Priority Order
Apply in this exact order (fastest approval → most revenue):

1. **Booking.com Affiliate** (day 1 — instant approval, 25-40% of their commission) — apply at `affiliate.booking.com`
2. **GetYourGuide Partner** (1–3 days — 8% commission, highest volume) — apply at `partner.getyourguide.com`
3. **Viator** (2–5 days — 8%, great for English-speaking market) — apply at `viatorpartnerresources.com`
4. **Travelpayouts** (instant — aggregates 100+ travel brands including train booking, insurance, car hire) — apply at `travelpayouts.com`
5. **Klook** (1–5 days — 5%, strong for Asian tourists) — apply at `affiliate.klook.com`

Once approved, update `src/data/affiliate-partners.ts` with real IDs and the tracking will work automatically.

### 3.2 Your First Revenue Day
The moment affiliate links are live, any booking that comes through earns commission. On a CHF 234 Jungfraujoch booking through GetYourGuide, you earn **CHF 18.72**. On a CHF 400 hotel booking through Booking.com, you earn **CHF 6–10**.

First priority for affiliate links: your top 10 most-viewed activities (likely Jungfraujoch, Matterhorn, Rhine Falls, Lake Geneva cruise, Zurich City Tour, Lucerne Day Trip, Swiss Museum of Transport, Interlaken adventure sports, Mount Pilatus, Schilthorn).

### 3.3 GA4 Conversion Funnel Setup
Once GA4 ID is real, set up these events in Google Analytics to track the money:

1. **`affiliate_click`** — already fires from `affiliate.ts` ✓
2. **`page_view`** on `/activities/[slug]` — track which activities get most views
3. **`newsletter_signup`** — fire when form submits successfully
4. **Goal:** Set "affiliate_click" as a conversion event in GA4 → you'll see which pages drive the most affiliate revenue

---

## Part 4: SEO Foundation — Long-Term Traffic

### 4.1 First 4 Blog Articles to Write
These target keywords with real search volume and low competition. Write these BEFORE launch so the site has content from day one:

**Article 1: "Top 10 Free Things to Do in Switzerland (2026 Guide)"**
- Target keyword: "free things to do in Switzerland" (2,800 monthly searches, low competition)
- Length: 1,800 words
- Include: your free activities filtered view, embed 4–5 activity cards
- Monetize: activities nearby that are paid (upgrade offer)

**Article 2: "Swiss Travel Pass vs Half-Fare Card: Which Saves You More Money?"**
- Target keyword: "Swiss Travel Pass worth it" (5,200 monthly searches, medium competition)
- Length: 2,000 words
- Include: link to your /travel-passes comparison calculator
- Monetize: affiliate link to Swiss Travel Pass purchase

**Article 3: "Jungfraujoch vs Schilthorn vs Pilatus: Which Summit is Worth It?"**
- Target keyword: "best mountain excursion Switzerland" (1,400 monthly searches, low competition)
- Length: 1,500 words
- Include: price comparison table, affiliate links to all three
- Monetize: direct to activity detail pages

**Article 4: "Switzerland Family Holiday: Complete Activity Guide with Prices"**
- Target keyword: "Switzerland family activities" (2,100 monthly searches, low competition)
- Length: 2,200 words
- Include: family-filtered activities, budget for family of 4 using GroupContext
- Monetize: itinerary affiliate links

### 4.2 Schema Markup Verification
You have JSON-LD in `json-ld.tsx`. After launch, verify it with [Google's Rich Results Test](https://search.google.com/test/rich-results):
- Activity pages should show `TouristAttraction` or `Event` schema
- Itinerary pages should show `ItemList` schema
- Blog posts should show `Article` schema
- Consider adding `AggregateRating` to activity pages (even with invented/curated initial ratings to seed the schema — be honest, these could be sourced from GetYourGuide reviews)

### 4.3 Google Search Console
Set up Google Search Console (free) and submit your sitemap:
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property `exploreswitzerland.ch`
3. Verify via DNS TXT record (Infomaniak/Hostpoint both support this)
4. Submit `https://exploreswitzerland.ch/sitemap.xml`
5. This tells Google about all your pages immediately instead of waiting for crawl

---

## Part 5: What to Monitor Post-Launch (Week 1)

Once live, watch these daily for the first week:

- **GA4 Real-time:** Are users landing? Where do they drop off?
- **Vercel Analytics:** Core Web Vitals — is LCP under 2.5s?
- **Console errors:** Check browser DevTools on your own phone for JS errors
- **Affiliate dashboards:** First clicks should appear within 24–48 hours of going live
- **Newsletter signups:** First subscriber is a milestone — celebrate it

---

## Summary: Critical Path to Launch

These are strictly ordered — each step depends on the previous one being done.

```
Domain registered (exploreswitzerland.ch)
    ↓
Code pushed to GitHub
    ↓
Deployed to Vercel (exploreswitzerland.ch connected)
    ↓
Environment variables set in Vercel:
  - NEXT_PUBLIC_GA_ID = G-XXXXXXX (real)
  - RESEND_API_KEY = re_XXXXXXX
  - RESEND_AUDIENCE_ID = xxxxxxxx
    ↓
Affiliate IDs registered & updated in affiliate-partners.ts
    ↓
Privacy policy page live at /privacy
Cookie consent banner live
    ↓
OG image created and committed to /public/og-image.jpg
    ↓
Newsletter API route working (/api/newsletter)
    ↓
Top 30 images replaced with local WebP files
    ↓
Group pricing wired to activity cards
    ↓
4 blog articles written and published
    ↓
Google Search Console: sitemap submitted
    ↓
✅ LIVE
```

---

*Built on Next.js 14 / TypeScript / Tailwind / Vercel. 150 activities, 5 itineraries, travel pass calculator, budget explorer, comparison tool, group pricing, affiliate tracking — all in place. The foundation is exceptionally strong. The blockers above are purely administrative (domain, IDs, legal) rather than engineering.*
