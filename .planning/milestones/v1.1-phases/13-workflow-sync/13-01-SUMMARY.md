---
phase: 13-workflow-sync
plan: 01
subsystem: workflows
tags: [autonomous, node-repair, stats, ui-phase, ui-review, copilot, ui-spec, namespace-sync]

# Dependency graph
requires:
  - phase: 01-fork-and-foundation
    provides: GSD-R directory structure and namespace conventions
provides:
  - 5 new workflow files (autonomous, node-repair, stats, ui-phase, ui-review)
  - 2 new template files (copilot-instructions, UI-SPEC)
  - 4 new command entry points (autonomous, stats, ui-phase, ui-review)
affects: [14-path-sweep, workflow-sync-overwrite-plans]

# Tech tracking
tech-stack:
  added: []
  patterns: [namespace-transform-for-new-files]

key-files:
  created:
    - get-shit-done-r/workflows/autonomous.md
    - get-shit-done-r/workflows/node-repair.md
    - get-shit-done-r/workflows/stats.md
    - get-shit-done-r/workflows/ui-phase.md
    - get-shit-done-r/workflows/ui-review.md
    - get-shit-done-r/templates/copilot-instructions.md
    - get-shit-done-r/templates/UI-SPEC.md
    - commands/gsd-r/autonomous.md
    - commands/gsd-r/stats.md
    - commands/gsd-r/ui-phase.md
    - commands/gsd-r/ui-review.md
  modified: []

key-decisions:
  - "node-repair.md has no gsd-r-tools reference -- upstream source has no tool binary calls, it is a process reference document invoked by execute-plan"
  - "copilot-instructions.md copied as-is -- no GSD-specific paths or namespace references in upstream source"

patterns-established:
  - "New file namespace transform: hardcoded paths to $HOME, gsd-tools to gsd-r-tools, /gsd: to /gsd-r:, agent names gsd-X to gsd-r-X"
  - "Command frontmatter name field keeps gsd:xxx convention (not gsd-r:xxx) per established GSD-R pattern"

requirements-completed: [EXEC-03, EXEC-04, EXEC-05, WKFL-01, WKFL-02]

# Metrics
duration: 4min
completed: 2026-03-16
---

# Phase 13 Plan 01: New Workflows and Templates Summary

**11 new files from upstream v1.24.0: 5 workflows (autonomous, node-repair, stats, ui-phase, ui-review), 2 templates (copilot-instructions, UI-SPEC), and 4 command entry points, all with GSD-R namespace transforms**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-16T13:09:49Z
- **Completed:** 2026-03-16T13:14:00Z
- **Tasks:** 2
- **Files created:** 11

## Accomplishments
- Added 5 new workflow files covering autonomous execution, task self-healing, project stats, UI design contracts, and UI visual audits
- Added 2 new template files for IDE integration and UI specification
- Added 4 new command entry points matching upstream feature parity
- All namespace transformations verified: zero upstream paths, zero gsd-tools.cjs refs, zero double-replacements

## Task Commits

Each task was committed atomically:

1. **Task 1: Copy 5 new workflows and 2 new templates** - `b08d9c3` (feat)
2. **Task 2: Create 4 new command files** - `938332e` (feat)

## Files Created/Modified
- `get-shit-done-r/workflows/autonomous.md` - Milestone-wide autonomous execution workflow
- `get-shit-done-r/workflows/node-repair.md` - Task failure self-healing process
- `get-shit-done-r/workflows/stats.md` - Project statistics dashboard workflow
- `get-shit-done-r/workflows/ui-phase.md` - UI design contract generation workflow
- `get-shit-done-r/workflows/ui-review.md` - Retroactive 6-pillar visual audit workflow
- `get-shit-done-r/templates/copilot-instructions.md` - IDE integration template
- `get-shit-done-r/templates/UI-SPEC.md` - UI specification template
- `commands/gsd-r/autonomous.md` - Autonomous command entry point
- `commands/gsd-r/stats.md` - Stats command entry point
- `commands/gsd-r/ui-phase.md` - UI phase command entry point
- `commands/gsd-r/ui-review.md` - UI review command entry point

## Decisions Made
- node-repair.md faithfully copied from upstream without adding gsd-r-tools reference -- upstream source contains no tool binary calls (it is a process description invoked by execute-plan.md)
- copilot-instructions.md copied as-is since upstream has no GSD-specific paths or namespace references
- Command frontmatter `name:` field keeps `gsd:xxx` convention per established GSD-R pattern (not `gsd-r:xxx`)

## Deviations from Plan

None - plan executed exactly as written.

Note: Plan acceptance criteria expected `gsd-r-tools` in node-repair.md, but the upstream source has no tool binary references. The file is faithful to upstream -- this is a plan specification inaccuracy, not a deviation.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 11 new files in place, ready for Phase 13 Plan 02 (workflow overwrites)
- Phase 14 path sweep can now include these files in its reference audit

## Self-Check: PASSED

All 12 files verified present on disk. Both task commits (b08d9c3, 938332e) verified in git log.

---
*Phase: 13-workflow-sync*
*Completed: 2026-03-16*
