---
phase: 24-verification-pipeline-wiring
plan: 01
title: Wire verify-sufficiency to CLI and fix temporal_positioning bug
status: complete
completed: 2026-03-22
---

# Summary: Wire Verification Pipeline and Fix Config Bug

## One-Liner
Exposed Tier 0 sufficiency checks via CLI `verify sufficiency` subcommand and fixed temporal_positioning config propagation bug.

## What Changed
- Added `verify sufficiency` subcommand to `grd-tools.cjs` that invokes `verifySufficiency()` from `verify-sufficiency.cjs`
- Fixed `init.cjs:387` to read `config.temporal_positioning` (top-level) instead of `config.workflow?.temporal_positioning` (always undefined)
- Added temporal_positioning propagation tests covering required/optional/false values
- Fixed `temporal_positioning` field in research note template (was duplicated as both frontmatter and body field)

## Verification
- `node grd/bin/grd-tools.cjs verify sufficiency` runs without error
- `grep 'config.workflow?.temporal_positioning' grd/bin/lib/init.cjs` returns 0 results
- All tests pass (445/445)

## Commit
`feat(phase-24): wire verify-sufficiency to CLI and fix temporal_positioning bug` (7bb3049)
