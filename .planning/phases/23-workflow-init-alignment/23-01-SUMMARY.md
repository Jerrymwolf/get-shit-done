---
phase: 23-workflow-init-alignment
plan: 01
title: Fix workflow init subcommand names
status: complete
completed: 2026-03-22
---

# Summary: Fix Workflow Init Subcommand Names

## One-Liner
Updated 8 workflow files to use research-native init subcommand names, restoring the full E2E research flow.

## What Changed
- Updated init calls in 8 workflow files: `plan-inquiry.md`, `conduct-inquiry.md`, `verify-inquiry.md`, `new-research.md`, `execute-plan.md`, `complete-study.md`, `synthesize.md`, `ui-phase.md`
- Old names (`init plan-phase`, `init execute-phase`, `init verify-work`, `init new-project`) replaced with research-native names (`init plan-inquiry`, `init conduct-inquiry`, `init verify-inquiry`, `init new-research`)

## Verification
- All 8 workflow files use correct init subcommand names
- `grep -rn 'init plan-phase\|init execute-phase\|init verify-work\|init new-project' grd/workflows/` returns 0 results
- All existing tests pass (445/445)

## Commit
`fix(phase-23): update init subcommand names in 8 workflow files` (07ea486)
