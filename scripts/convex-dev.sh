#!/usr/bin/env bash
# Start the Convex DEV deployment for @repo/backend.
# Generates convex/_generated, provisions a dev deployment on first run
# (interactive browser login), and keeps syncing local function changes.
# Extra args pass through, e.g. ./scripts/convex-dev.sh --once
set -euo pipefail
cd "$(dirname "$0")/../packages/backend"
npx convex dev "$@"
