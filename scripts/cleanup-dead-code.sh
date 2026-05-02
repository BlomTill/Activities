#!/bin/bash
# Cleanup dead code identified during the perf pass.
# Run from project root:  bash scripts/cleanup-dead-code.sh

set -e
cd "$(dirname "$0")/.."

echo "Removing standalone HTML mockup (not used by Next.js)..."
rm -f "Switzerland Activities.html"

echo "Removing unused immersive components (no imports anywhere)..."
rm -rf "src/components/immersive"

echo "Removing unused trending-bar component (no imports)..."
rm -f "src/components/trending-bar.tsx"

echo ""
echo "Done. Run 'npm run lint' and 'npm run build' to verify."
