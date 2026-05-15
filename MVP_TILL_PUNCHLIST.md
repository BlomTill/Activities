# Till's Punch List — what only you can do

> **How to use this file:** these are the things AI cannot do for you. They mostly involve human approvals, account creation, brand decisions, or real-world actions (buying, posting, applying). Bracketed time estimates are the *minimum* hands-on time; affiliate approvals add wall-clock waiting time.
>
> Do them in priority order. P0 items block Day 1 of the build.

---

## P0 — Blockers for Day 1 (do TODAY, ~1 hour total)

### 1. Set up Google Analytics 4 [10 min]
- Go to https://analytics.google.com → Admin → Create Property → "realswitzerland"
- Set timezone Europe/Zurich, currency CHF
- Create a Web data stream → URL `https://realswitzerland.ch`
- Copy the Measurement ID (format `G-XXXXXXXXXX`)
- → Send me this ID

### 2. Vercel account + deploy access [15 min]
- If no account: sign up at https://vercel.com (use GitHub login)
- Connect the GitHub repo for ActivityWebsite (push it to GitHub first if not already there)
- Either:
  - (a) Invite my email to your Vercel team, OR
  - (b) Tell me you'll handle deploys yourself and I'll just hand you the env vars to paste
- → Confirm which option

### 3. DNS for realswitzerland.ch [10 min]
- Tell me where the domain is registered (Cloudflare? Namecheap? GoDaddy? Infomaniak?)
- Give me login or have it ready when we cut over on Day 7
- Confirm it's not currently pointed at a live site you'd accidentally take down
- → Send me: registrar name + current DNS A/CNAME records

### 4. Sign up for Resend (newsletter) [5 min]
- Go to https://resend.com → sign up
- Create an API key (Settings → API Keys → Create)
- Verify your sending domain `realswitzerland.ch` (they walk you through the SPF/DKIM records)
- Create an audience (Audiences → New Audience → "newsletter")
- → Send me: API key + audience ID

### 5. Confirm what's in your `.env.local` already [5 min]
- Open `/Users/till/Documents/ActivityWebsite/.env.local`
- Send me the **list of key names** that have real values (NOT the values themselves)
- This tells me what's wired vs placeholder so I don't double-work

---

## P0 — Affiliate program applications (do TODAY, 30 min hands-on, 2–7 days approval)

The whole site earns $0 without these. Each application takes 5 min. Approvals are async — apply now, fill in IDs as they arrive over the next week.

### 6. GetYourGuide [5 min apply, 24–72h approval]
- Apply at https://partner.getyourguide.com (or via Awin if you prefer Awin's dashboard)
- They'll ask: site URL, monthly traffic estimate, content niche
- For traffic estimate, say "pre-launch, 5–10k/mo target by month 3"
- → Once approved, send me your `partner_id`

### 7. Viator [5 min apply, 48–72h approval]
- Apply at https://www.viator.com/affiliate/
- Two things to request: (a) affiliate program (basic IDs), (b) Partner API access (Phase 2)
- → Once approved, send me your `pid` + `mcid`

### 8. Booking.com [5 min apply, 48h approval]
- Apply at https://partners.booking.com/affiliate-program (or via Awin)
- Booking has the highest commission per click (~$1 EPV) — DO NOT skip this one
- → Once approved, send me your `aid`

### 9. Klook [5 min apply, 24–48h approval]
- Apply at https://affiliate.klook.com
- → Once approved, send me your `aid`

### 10. Civitatis [5 min apply, 24–48h approval]
- Apply at https://www.civitatis.com/en/affiliates/
- → Once approved, send me your affiliate code

### 11. Omio (rail tickets) [5 min apply, 48–72h]
- Apply at https://www.omio.com/affiliates
- → Send me your `partner_id`

### 12. Rentalcars.com (car hire) [5 min apply, 72h]
- Apply at https://www.rentalcars.com/Affiliate.do
- → Send me your `affiliateCode`

---

## P1 — Decisions I need from you (do today, 15 min total)

These unblock Days 1, 5, and 6 simultaneously. There's no wrong answer; just pick.

### 13. MVP activity count
Pick one: **100** (faster ship, less SEO surface) / **200** (recommended) / **500** (more content but more thin pages) / all 1,513 (not recommended).

### 14. MVP destinations (pick exactly 5)
Default: Zurich, Lucerne, Interlaken, Zermatt, Geneva.
Possible swaps: Lugano (Italian-speaking south), Bern (capital), St. Moritz (luxury), Grindelwald (Jungfrau region), Lauterbrunnen (waterfalls), Montreux (Lake Geneva east).
→ Send me your final 5.

### 15. Primary launch language
**English only** (recommended week 1 — international tourist audience).
German + French come in Phase 3 (significant translation work).
→ Confirm or override.

### 16. OG image style
- (a) **Activity photo + price overlay** (Pinterest-optimized, higher CTR)
- (b) **Branded text-only** (cleaner aesthetic, lower CTR)
→ Pick one (recommend a).

### 17. Newsletter provider
- **Resend** (recommended — cheap, dev-friendly, free <3k/mo)
- ConvertKit (better creator UX, $25/mo from start)
- Beehiiv (built for newsletters, $39/mo)
- Mailchimp (most familiar, but dated)
→ Pick one.

### 18. Your weekly post-launch time budget
How many hours/week can you commit to content + marketing Days 8–90?
- <5h/wk → SEO content engine is unrealistic; lean entirely on Pinterest + paid help later
- 5–10h/wk → Realistic for 1 SEO post + 5 pins/week
- 10–20h/wk → Recommended; full SEO content engine works
→ Honest answer please.

---

## P1 — Brand & content (need by Day 5)

### 19. Final logo
Either provide an SVG / 512×512 PNG, OR confirm "use a wordmark for now" and I'll generate one in your brand colors.

### 20. Brand colors
Send me your primary, accent, and neutral colors (hex codes), or say "suggest a palette" and I'll propose 3 options.

### 21. Hero photo for home
- Full-width, 16:9 landscape, ≥2400px wide
- Subject: iconic Swiss vista (Matterhorn / Lauterbrunnen / Lake Lucerne / Jungfrau)
- License: must be royalty-free or your own
- If you don't have one, I'll source from Unsplash CC0 — but yours will perform better

### 22. Tagline (1 line)
Working draft: *"Compare every Swiss adventure in one place — and save."*
→ Approve, edit, or replace.

### 23. About paragraph (2 sentences)
Who you are, why the site exists. Example template: *"realswitzerland.ch helps travelers find the best activities in Switzerland by comparing prices across every major booking platform. We're independent, ad-free, and earn a small commission when you book — at no extra cost to you."*
→ Approve or rewrite.

### 24. Affiliate disclosure approval
I'll draft an FTC + Swiss-consumer-law-compliant disclosure on Day 3 and send for your sign-off. **You** must approve before launch — it's your name on the legal hook.

---

## P2 — Pinterest setup (do this week, 30 min)

### 25. Create Pinterest business account
- Go to https://business.pinterest.com → sign up (free)
- Verify your domain `realswitzerland.ch` (they'll give you a meta tag — paste it; I'll wire it into the site head)
- Create 5 starter boards: "Things to do in Switzerland," "Switzerland on a Budget," "Hiking Switzerland," "Switzerland with Kids," "Switzerland in Winter"
- → Send me: confirmation it's set up + the verification meta tag

### 26. Commit (or don't) to the cadence
The Pinterest strategy assumes 5 pins/day for 90 days. That's ~30 min/day with my pre-generated templates.
- Yes → I build the pin generator Day 20
- No → we lean harder on SEO; expect slower traffic ramp
→ Honest answer.

---

## P2 — Live API access (apply Day 8, ~15 min total)

These are separate applications from the basic affiliate IDs above — they unlock live pricing in Phase 2.

### 27. GetYourGuide Partner API
- After you're approved as an affiliate (item 6), apply for API access in the same partner portal
- → Send me `GETYOURGUIDE_API_KEY` when approved

### 28. Viator Partner API
- After basic affiliate approval (item 7), apply for Partner API access at partner.viator.com
- → Send me `VIATOR_API_KEY` when approved

### 29. Klook API
- After basic affiliate approval (item 9), request API access
- → Send me `KLOOK_API_KEY` + `KLOOK_API_SECRET` when approved

---

## P2 — Real-world verification (Day 7)

### 30. Smoke-test purchases
After deploy, click 1 affiliate link per network. You don't have to complete a real booking — just click through to the partner site and confirm the partner's dashboard registers the click within 24h.
- → Confirm: which networks registered the click vs which didn't (so we can debug)

---

## P3 — Day 21+ (nice to have, not blockers)

- **31. Lead-magnet PDF approval** — I'll generate "10 Free Things to Do in Switzerland 2026"; you sign off on the copy.
- **32. Backlink outreach** — sign up to https://www.helpareporter.com (free) for HARO. Send 3 pitches/week. (Or hand me the topics and I'll draft the pitches.)
- **33. Bing Webmaster Tools** — submit sitemap (5 min, after Day 7 deploy).
- **34. Set up Google Search Console** — verify domain, submit sitemap (10 min, after Day 7 deploy). Required for SEO debugging.

---

## Quick-paste summary (send me back this checklist filled in)

```
GA4 measurement ID:           _____________
Vercel option (a invite / b solo): _____________
DNS registrar + current state:_____________
Resend API key + audience ID: _____________
What's in .env.local (key names): _____________

Affiliate IDs as approved:
- GetYourGuide partner_id:    _____________
- Viator pid + mcid:          _____________
- Booking aid:                _____________
- Klook aid:                  _____________
- Civitatis code:             _____________
- Omio partner_id:            _____________
- Rentalcars affiliateCode:   _____________

Decisions:
- Activity count:             _____________
- 5 destinations:             _____________
- Languages:                  _____________
- OG style (a or b):          _____________
- Newsletter provider:        _____________
- Weekly time budget:         _____________

Brand:
- Logo file path:             _____________
- Brand colors hex:           _____________
- Hero photo path:            _____________
- Tagline (final):            _____________
- About paragraph:            _____________

Pinterest:
- Business account ready?     _____________
- Cadence commitment?         _____________
```

When this block is filled in, I'm fully unblocked for the entire 7-day build.
