---
phase: 25-upstream-sync-to-v1-28-0
plan: 04
subsystem: cli
tags: [uat, workstream, profile-pipeline, profile-output, security, cli-wiring]

# Dependency graph
requires:
  - phase: 25-01
    provides: Core module sync (core.cjs, state.cjs, security.cjs)
  - phase: 25-02
    provides: Config, init, commands module sync
  - phase: 25-03
    provides: Model-profiles, phase, roadmap, milestone, verify module sync
provides:
  - 4 new upstream CJS modules (uat, workstream, profile-output, profile-pipeline)
  - CLI entry point (grd-tools.cjs) wired with all new modules and commands
  - New CLI flags: --pick, --ws, --no-verify, --id
  - Workstream CRUD, profile pipeline, and UAT audit commands
affects: [26-rename, 27-command-vocabulary, 28-source-pipeline]

# Tech tracking
tech-stack:
  added: []
  patterns: [parseNamedArgs helper, main/runCommand split, --pick field extraction]

key-files:
  created:
    - grd/bin/lib/uat.cjs
    - grd/bin/lib/workstream.cjs
    - grd/bin/lib/profile-output.cjs
    - grd/bin/lib/profile-pipeline.cjs
  modified:
    - grd/bin/grd-tools.cjs

key-decisions:
  - "Adopted upstream parseNamedArgs/parseMultiwordArg helpers for cleaner arg parsing"
  - "Applied GRD namespace to /gsd: -> /grd: and get-shit-done -> grd paths in all new modules"

patterns-established:
  - "main() + runCommand() split pattern for --pick field extraction interception"
  - "parseNamedArgs() for consistent flag parsing across all commands"

requirements-completed: [SYNC-01]

# Metrics
duration: 7min
completed: 2026-03-23
---

# Phase 25 Plan 04: New Upstream Modules + CLI Wiring Summary

**Adopted 4 upstream modules (uat, workstream, profile-output, profile-pipeline) and synced grd-tools.cjs with v1.28.0 CLI wiring including --pick, --ws, workstream CRUD, and profile pipeline commands**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-23T03:49:36Z
- **Completed:** 2026-03-23T03:57:12Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Adopted 4 new upstream modules (2,171 lines total) with GRD namespace applied
- Synced grd-tools.cjs with all new module wiring, new commands, and new flags
- Added --pick flag for jq-free JSON field extraction from CLI output
- Added --ws flag and workstream CRUD command routing (7 subcommands)
- All GRD-specific wiring preserved (research commands, vault, bootstrap, note status, source gaps)
- 513 tests pass (1 pre-existing namespace test failure unchanged)

## Task Commits

Each task was committed atomically:

1. **Task 1: Adopt 4 new upstream modules** - `742f3d8` (feat)
2. **Task 2: Sync grd-tools.cjs CLI entry point** - `8833e0d` (feat)

## Files Created/Modified
- `grd/bin/lib/uat.cjs` - Cross-phase UAT/verification scanner (189 lines)
- `grd/bin/lib/workstream.cjs` - Multi-workspace orchestration with CRUD (491 lines)
- `grd/bin/lib/profile-output.cjs` - User profiling output generation (953 lines)
- `grd/bin/lib/profile-pipeline.cjs` - Session scanning for behavioral profiling (539 lines)
- `grd/bin/grd-tools.cjs` - CLI entry point with all new module wiring (+358/-80 lines)

## Decisions Made
- Adopted upstream parseNamedArgs/parseMultiwordArg helpers to replace verbose indexOf patterns
- Applied GRD namespace: `/gsd:` to `/grd:`, `get-shit-done` to `grd` in all new module paths and string literals
- Used `security.safeJsonParse()` for template --fields parsing (replacing bare `JSON.parse()`)
- Preserved all GRD-specific commands: conduct-inquiry, plan-inquiry, new-research, verify-inquiry, scope-inquiry, vault, bootstrap, note status, source gaps

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 new upstream modules + grd-tools.cjs CLI wiring complete
- Ready for Plan 05 (workflow/template/prompt sync)
- All module dependencies resolved; no blocking issues

---
*Phase: 25-upstream-sync-to-v1-28-0*
*Completed: 2026-03-23*
