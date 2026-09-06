#!/usr/bin/env pwsh
# Deploy @repo/backend's Convex functions to the PRODUCTION deployment.
# Requires CONVEX_DEPLOY_KEY in the environment for non-interactive/CI runs,
# otherwise uses your logged-in credentials.
# Extra args pass through, e.g. ./scripts/convex-deploy.ps1 --preview-create my-branch
$ErrorActionPreference = "Stop"
$backend = Join-Path $PSScriptRoot ".." "packages" "backend"
Set-Location $backend
npx convex deploy @args
