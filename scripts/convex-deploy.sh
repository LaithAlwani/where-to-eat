#!/usr/bin/env bash
# Deploy @repo/backend's Convex functions to the PRODUCTION deployment.
# Requires CONVEX_DEPLOY_KEY in the environment for non-interactive/CI runs,
# otherwise uses your logged-in credentials.
# Extra args pass through, e.g. ./scripts/convex-deploy.sh --preview-create my-branch
set -euo pipefail
cd "$(dirname "$0")/../packages/backend"
npx convex deploy "$@"
