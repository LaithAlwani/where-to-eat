#!/usr/bin/env pwsh
# Start the Convex DEV deployment for @repo/backend.
# Generates convex/_generated, provisions a dev deployment on first run
# (interactive browser login), and keeps syncing local function changes.
# Extra args pass through, e.g. ./scripts/convex-dev.ps1 --once
$ErrorActionPreference = "Stop"
$backend = Join-Path $PSScriptRoot ".." "packages" "backend"
Set-Location $backend
npx convex dev @args
