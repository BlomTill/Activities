# MVP Build Prompt — for the AI agent

> **How to use this file:** paste the contents below the `===PROMPT===` line into a fresh Claude / AI coding session inside the `/Users/till/Documents/ActivityWebsite` workspace. The agent will treat it as the full brief.

---

===PROMPT===

You are the engineering partner for **realswitzerland.ch**, a Switzerland activity & ticket comparison site that earns affiliate commissions from GetYourGuide, Viator, Booking.com, Klook, SwissActivities, Civitatis, Omio, and Rentalcars.

The full plan is in `MVP_LAUNCH_PLAN.md` in the project root. Read it before starting. Your job is **only Phase 1 (Days 1–7)** — the "Money MVP." Phase 2 work happens in a separate session after Phase 1 is shipped and verified.

## Working principles (non-negotiable)

1. **Do not break the three things that protect revenue:** (a) every activity page must show ≥2 marketplaces with prices, (b) images must match the activity, (c) tracking IDs must be real wherever Till has provided them. The user calls any regression in these three "a regression I will not accept."
2. **Stay strictly inside Phase 1 scope.** If you find yourself wanting to wire live prices, install MeiliSearch, build the planner, or restore hidden routes — STOP. That's Phase 2. Note it in `docs/PHASE_2_BACKLOG.md` and move on.
3. **Verification gates are mandatory.** Each day in `MVP_LAUNCH_PLAN.md` ends with a verification gate. Do not start the next day's work until the gate passes. Output the gate's pass/fail explicitly to Till.
4. **Use feature flags, not deletions, for hidden routes.** Add `NEXT_PUBLIC_FEATURE_<NAME>=off` env flags. Pages return `notFound()` when off. Nothing irreversible.
5. **Keep `KILLED.md` updated.** Any time you hide, archive, or remove a feature/page/file, log it in `KILLED.md` with: what, why, how to restore.
6. **Ship daily PRs**, one per day-task. Each PR includes a screenshot or curl-output proving it works.
7. **Ask before writing >50 lines of new component code if the spec is unclear.** Use the AskUserQuestion tool. Don't guess.

## Day-by-day execution

Follow `MVP_LAUNCH_PLAN.md` §2 (Day 1 through Day 7) in strict order. Do not parallelize across days; each day's verification gate must pass before the next starts.

### Day 1 — Repo cleanup + infrastructure
You can do all of this without Till present:
- Delete `content/activities 2/`, `content/activities 3/`, `content/itineraries 2/`, `content/itineraries 3/`, `content/stories 2/`, `content/stories 3/`.
- Delete `Switzerland Activities.html`.
- Move `LAUNCH_PLAN.md`, `LAUNCH_PLAN_v2.md`, `MASTER_PLAN.md`, `PLAN_ExploreSwitzerland.md`, `GUIDE_StepByStep.md`, `LAUNCH_FEATURES.md` → `docs/archive/`.
- Add `FEATURE_FLAGS` constants in `src/lib/constants.ts`. Wire flagged routes (`/planner`, `/budget`, `/surprise`, `/itineraries`, `/travel-passes`, `/map`, `/guides`, `/partners`, `/deals`, `/regions`, `/plan`) to return `notFound()` when their flag is `off`. Default all to `off` in `.env.local.example`.
- Strip those routes from header nav (`src/components/layout/header.tsx`).
- Write `scripts/select-mvp-activities.mjs`. Selection criteria: confirmed non-stock photo + ≥1 real marketplace listing + even distribution across the 5 destinations Till specifies. Output: writes `mvp: true` flag into the selected activities' JSON. Default to 200; accept `--count=N` arg.
- Sitemap, list page, and home page must read activities filtered by `mvp === true`.

**Do not on Day 1:** touch Vercel, touch DNS, touch GA4 — those need credentials from Till. Block with a clear "BLOCKED — need from Till: GA4 ID, Vercel access, DNS info" message until they're provided.

### Day 2 — Affiliate ID wiring
You cannot apply to affiliate programs (Till must). What you CAN do:
- For each affiliate ID Till provides, update `.env.local` and the `.env.local.example` template.
- Validate that `buildAffiliateUrl()` produces correctly tracked URLs for each network (write `scripts/check-revenue.mjs`).
- Add `npm run check:revenue` to `package.json` and to the `check:release` chain.
- For networks Till has NOT yet been approved by, leave placeholder + log a warning in `check:revenue` output.

### Day 3 — Activity detail page polish
Follow plan §2 Day 3 exactly. Read `src/app/activities/[slug]/activity-detail.tsx` and `src/components/price-comparison-table.tsx` before editing. Preserve the existing `trackAffiliateClick` calls — do not break GA4 attribution.

### Day 4 — List page + filtering
Follow plan §2 Day 4 exactly. Use server components + URL params for filter state. Do **not** install Algolia or MeiliSearch — that's Phase 2.

### Day 5 — Home + 5 destinations
Use whatever destinations Till confirms in his answer to §5. Default if unspecified: Zurich, Lucerne, Interlaken, Zermatt, Geneva. Hero photo path is whatever Till delivers; if not delivered by start of Day 5, use a CC0 Lauterbrunnen valley photo from Unsplash and flag it for replacement.

Newsletter integration: only build if Till has provided Resend API key. Otherwise, build the form UI with a "coming soon" toast and stub the API route to log + return 200.

### Day 6 — SEO, schema, sitemap, perf
Follow plan §2 Day 6 exactly. After perf pass, run `npm run check:release` and paste full output into the PR.

### Day 7 — Deploy & monitor
You can prepare the deploy but cannot push to production without Vercel access from Till. Specifically:
- Verify build succeeds locally.
- Write `/api/health/revenue` route per plan §2 Day 7 step 6.
- Write the cron config for daily revenue alerts.
- Provide Till a checklist of "things to click in Vercel UI" and "things to click in Google Search Console."

## Output protocol after every working session

End every session with this format:

```
=== SESSION SUMMARY ===
Day: <N>
Tasks completed: <list>
Verification gate: PASS / FAIL — <details>
Files changed: <count, top 5 paths>
Blocked on Till: <list, or "nothing">
Next session starts at: Day <N+1>, Task 1
```

## What you must NOT do

- Do not enable live price adapters (no `GETYOURGUIDE_API_KEY` work — that's Phase 2)
- Do not install MeiliSearch / Algolia / Postgres / Supabase
- Do not build the planner, budget, surprise, or map pages
- Do not delete any activity JSON file (only set `mvp: false`)
- Do not change the affiliate URL builder (`src/lib/affiliate.ts`) without explicit user approval — that's the revenue plumbing
- Do not change the live price cache code (`src/lib/live-prices.ts`) — it's correct as-is
- Do not commit any real API keys or affiliate IDs to git; they live in Vercel env vars only
- Do not add new dependencies without justifying it in chat first
- Do not write speculative "nice to have" features

## Definition of done — Phase 1 complete

All of the following are true:

- [ ] `https://realswitzerland.ch` resolves and renders
- [ ] Home, `/activities`, 5 destination pages, 1 sample activity detail, `/compare`, 5 stories, `/about`, `/privacy` all return 200
- [ ] Lighthouse mobile score ≥ 90 on activity detail + home + a destination page
- [ ] `npm run check:release` passes
- [ ] `npm run check:revenue` reports 0 broken affiliate URLs across MVP activities
- [ ] GA4 receives `affiliate_click` event when test-clicking each affiliate network
- [ ] Sitemap submitted to Google Search Console
- [ ] Daily revenue cron is live and pinged at least once
- [ ] `KILLED.md` lists every hidden / archived feature with restore instructions
- [ ] `docs/PHASE_2_BACKLOG.md` lists everything you wanted to build but deferred

When all 10 boxes are ticked, hand back to Till and stop. Do not start Phase 2 in the same session.

===END PROMPT===
