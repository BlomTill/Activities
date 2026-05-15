# Phase 1 Launch Checklist — things only Till can click

Engineering (code) is done. These are the human/credential steps. Order matters.

## 0. Merge the stacked PRs to `main` first
The Phase 1 work is 7 stacked PRs. Merge in order (each targets the previous):
`#2 → #4 → #5 → #6 → #7 → #8 → #9`. Squash-merge each, bottom-up, or
fast-forward the chain. Production deploys from `main`, so nothing ships
until these are on `main`.

## 1. Vercel → Project → Settings → Environment Variables (Production)

> ⚠️ `NEXT_PUBLIC_*` vars are inlined at **build time**. Set them BEFORE the
> deploy, and **redeploy** after any change. An UNSET affiliate var in
> production means *no tracking params are appended for that network* — so
> these are revenue-critical.

**Required (copy the values from your local `.env.local`):**
- `NEXT_PUBLIC_GA_ID` — your `G-XXXXXXXXXX`
- `NEXT_PUBLIC_AFFILIATE_GETYOURGUIDE_PARAMS`
- `NEXT_PUBLIC_AFFILIATE_VIATOR_PARAMS`
- `NEXT_PUBLIC_AFFILIATE_KLOOK_PARAMS`
- `NEXT_PUBLIC_AFFILIATE_TRAVELPAYOUTS_PARAMS`
- `NEWSLETTER_PROVIDER_API_KEY` — Resend key
- `NEWSLETTER_AUDIENCE_ID` — Resend audience

**New, set these (not in .env.local yet):**
- `CRON_SECRET` — any long random string. Secures `/api/health/revenue`;
  Vercel Cron sends it automatically once it exists.
- `ALERT_EMAIL` — where the daily revenue alert email should go.

**Leave UNSET on purpose:**
- `NEXT_PUBLIC_FEATURE_*` — unset = those routes 404 (intended for MVP).
  Set a specific one to `on` only when you want to expose that feature.
- Affiliate params for **Booking, Omio, Rentalcars, SwissPass, Musement,
  Civitatis** — placeholders until you're approved. `check:revenue` warns,
  doesn't fail. (SwissActivities needs nothing — it rides on `ref=odbhodn`
  embedded in every booking URL.)

**Optional (Phase 2 — leave unset for now):**
- `GA4_PROPERTY_ID`, `GA4_ACCESS_TOKEN` — only if you want the daily cron to
  also report the 24h `affiliate_click` count. Without them the cron still
  works (broken-link alerting); it just reports `clickCount24h: null`.

## 2. Vercel → Domains
- Confirm `realswitzerland.ch` (and `www`) is attached to this project and
  the DNS check is green. If DNS isn't pointed yet, add the records Vercel
  shows. Verify `https://realswitzerland.ch` resolves with a valid cert.

## 3. Deploy & smoke-test
- Trigger a production deploy (push to `main` / Vercel "Redeploy").
- Visit and confirm **200**: `/`, `/activities`, the 5 `/destinations/<slug>`
  (zurich, lucerne, interlaken, zermatt, geneva), one `/activities/<slug>`,
  `/compare`, 5 `/stories/<slug>`, `/about`, `/privacy`.
- Confirm flagged routes 404: `/planner`, `/budget`, `/map`, `/itineraries`,
  `/partners`, `/deals`, `/surprise`, `/travel-passes`, `/guides`, `/plan`,
  `/regions`.
- `https://realswitzerland.ch/api/health/revenue` → JSON with
  `brokenCount: 0`.

## 4. GA4 (Realtime) — verify affiliate tracking
- Open GA4 → Reports → Realtime.
- On a live activity page, click one CTA per network (GetYourGuide, Viator,
  Klook, SwissActivities). Confirm an `affiliate_click` event appears with
  `partner` / `slot` / `slug` params. Target: events from ≥4 networks.

## 5. Partner dashboards — confirm the click landed
- For each of the ≥4 live networks, open the partner dashboard and confirm
  the test click registered (this is the Phase-1 Definition-of-Done item).

## 6. Newsletter (Resend) — real opt-in test
- Subscribe with a real address via the home/destination form. Confirm a
  contact appears in your Resend audience. (I deliberately didn't test-submit
  so I wouldn't pollute the live audience.)

## 7. Google Search Console
- Add/verify the `realswitzerland.ch` property (DNS TXT or the HTML-tag
  method).
- Submit the sitemap: `https://realswitzerland.ch/sitemap.xml`.
- Run the URL Inspection / Rich Results test on one activity URL and one
  destination URL — confirm `TouristAttraction` + `BreadcrumbList` parse
  with no errors.

## 8. Bing Webmaster Tools
- Add the site, import from Search Console (fastest), submit the same sitemap.

## 9. Uptime monitor
- Better Uptime (or similar) free tier: monitor `https://realswitzerland.ch`
  every 3 min; alert to your email/Slack on downtime. Optionally also monitor
  `/api/health/revenue` and alert if the JSON body contains `"alert":true`.

## 10. Confirm the cron is live
- Vercel → Project → Settings → Cron Jobs: confirm `/api/health/revenue`
  at `0 9 * * *` is listed. Use "Run" once to fire it manually and confirm a
  200 + (if you set `ALERT_EMAIL`) no spurious alert email.

---
When 1–10 are done, Phase 1 is live. Phase 2 backlog: `docs/PHASE_2_BACKLOG.md`.
