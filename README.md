# SwissActivity — Compare Activities Across Switzerland

A modern, SEO-optimized website for discovering and comparing activities across Switzerland with transparent pricing for every age group (Child, Student, Adult, Senior), seasonal intelligence, and budget-friendly tools.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content Pipeline

This project now uses a Git-based content architecture:

- Canonical content files in `content/activities`, `content/stories`, `content/itineraries`
- Generated runtime manifests in `.content/generated`
- Typed content access through `src/lib/content/repository.ts` and selectors

Commands:

```bash
npm run content:build
npm run content:check
```

The app consumes generated manifests, not direct `src/data/*` imports.

## Environment Variables

Create `.env.local` from `.env.local.example`.

Required for launch:

- `NEXT_PUBLIC_GA_ID` — GA4 Measurement ID (`G-...`)
- `NEWSLETTER_PROVIDER_API_KEY` — Resend API key
- `NEWSLETTER_AUDIENCE_ID` — Resend audience/contact list ID
- `NEXT_PUBLIC_AFFILIATE_*_PARAMS` — query-string tracking params per affiliate network

Optional:

- `UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`, `PIXABAY_API_KEY` for image-fetch tooling
- `NEXT_PUBLIC_MAPBOX_TOKEN` if map tokenized features are added

## Release Checklist

Run before every production deploy:

```bash
npm run check:release
```

Manual smoke checks (desktop + mobile):

1. Home, activities list/detail, compare, stories/blog, privacy, partners
2. `/sitemap.xml` and `/robots.txt` use `https://exploreswitzerland.ch`
3. Cookie consent appears on first visit and GA loads only after accept
4. Newsletter signup succeeds and shows success state
5. Affiliate booking buttons open correctly and show disclosure text nearby
6. `npm run content:check` passes (schema + duplicate + broken-link checks)

## Features

- **55 Swiss Activities** with realistic pricing across 5 categories (Outdoor, Culture, Adventure, Family, Wellness)
- **Age Group Tabs** (Child/Student/Adult/Senior) — persistent site-wide price recalculation
- **Seasonal Intelligence** — auto-detects current season, filters activities accordingly
- **Budget Explorer** — enter your budget, see what you can afford
- **Surprise Me** — random seasonal activity picker
- **Comparison Tool** — side-by-side comparison of up to 3 activities
- **Interactive Map** — Leaflet map of Switzerland with activity pins
- **SBB Travel Cost Estimator** — estimated train fare + total day trip cost
- **Weather Integration** — weather-based activity suggestions per region
- **Blog** — SEO content articles targeting long-tail keywords
- **Deals Page** — special offers, free activities, budget options
- **Multi-language Support** — translation system for DE, EN, FR, IT
- **PWA** — installable progressive web app with offline support
- **SEO** — JSON-LD structured data, sitemap, robots.txt, Open Graph

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** with custom design system
- **Leaflet** for interactive maps
- **Lucide React** for icons

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── activities/         # Activity listing & detail pages
│   ├── blog/               # Blog listing & article pages
│   ├── budget/             # Budget Explorer tool
│   ├── compare/            # Activity comparison page
│   ├── deals/              # Deals & discounts page
│   ├── map/                # Interactive map view
│   ├── surprise/           # Random activity picker
│   └── about/              # About page
├── components/             # React components
│   ├── ui/                 # Base UI components (button, card, etc.)
│   ├── layout/             # Header & Footer
│   ├── activity-card.tsx   # Activity card component
│   ├── search-bar.tsx      # Search bar component
│   ├── weather-widget.tsx  # Weather widget
│   ├── sbb-estimator.tsx   # SBB cost estimator
│   └── json-ld.tsx         # Structured data components
├── context/                # React contexts (age group, comparison)
├── data/                   # Activity & blog post data
└── lib/                    # Utilities, types, constants
```
