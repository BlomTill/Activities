# Content Architecture (Git-based)

This project uses Git-managed content with generated manifests.

## Directory layout

- `content/activities/*.json` — canonical activity documents (one file per slug)
- `content/stories/*.json` — canonical story documents (one file per slug)
- `content/itineraries/*.json` — canonical itinerary documents (one file per slug)
- `content/activity-slug-aliases.json` — legacy itinerary/activity slug compatibility map
- `.content/generated/*.json` — build artifacts consumed by app/runtime

## Workflow

1. Edit content files in `content/`
2. Run `npm run content:build`
3. Run `npm run content:check`
4. Run `npm run check:release` before deploy

## Editorial conventions

- Slugs are lowercase kebab-case and immutable once published
- One content item per file (filename must match slug)
- Keep excerpt/description concise and factual
- Do not duplicate IDs or slugs across files
- If a slug is renamed, add an entry to `content/activity-slug-aliases.json`

## Guardrails

- `content:check` validates schema, duplicates, and itinerary activity links
- `perf:check` enforces generated artifact size budgets for CI stability
