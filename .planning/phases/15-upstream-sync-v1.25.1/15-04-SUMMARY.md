---
phase: 15-upstream-sync-v1.25.1
plan: 04
subsystem: workflows
tags: [merge, upstream-sync, research-vocabulary, namespace, v1.25.1]

# Dependency graph
requires:
  - phase: 15-02
    provides: CJS modules synced with v1.25.1 (commands.cjs YYMMDD format)
provides:
  - 5 large-divergence workflow files merged with v1.25.1 structural improvements
  - Tech debt #4 fully resolved (no stale Skill() namespace calls)
  - Research vocabulary preserved across all research-adapted workflows
affects: [15-05, 17-namespace-migration]

# Tech tracking
tech-stack:
  added: []
  patterns: [upstream-first-merge-with-research-vocabulary-overlay]

key-files:
  modified:
    - grd/workflows/discuss-phase.md
    - grd/workflows/plan-phase.md
    - grd/workflows/new-project.md
    - grd/workflows/quick.md
    - grd/workflows/help.md

key-decisions:
  - "All 5 files were already structurally synced from 15-03; only help.md needed minor upstream improvements (--global flag, explicit global scope path)"
  - "new-project.md research vocabulary (Landscape/Questions/Frameworks/Debates) preserved as intended divergence from upstream (Stack/Features/Architecture/Pitfalls)"

patterns-established:
  - "Research vocabulary overlay: fork uses research-specific naming that diverges from upstream by design"

requirements-completed: [SYNC-03]

# Metrics
duration: 2min
completed: 2026-03-17
---

# Phase 15 Plan 04: Large-Divergence Workflow Merge Summary

**Merged 5 large-divergence workflows with v1.25.1, preserving research vocabulary in discuss-phase/plan-phase/new-project while adopting upstream quick ID format and help command additions**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-17T20:20:54Z
- **Completed:** 2026-03-17T20:22:34Z
- **Tasks:** 2
- **Files modified:** 3 (discuss-phase.md, plan-phase.md, help.md)

## Accomplishments
- discuss-phase.md and plan-phase.md merged with v1.25.1 structural improvements, research vocabulary (principal investigator, research assistant, inquiry) preserved
- new-project.md confirmed already synced with research-specific research dimensions (Landscape/Questions/Frameworks/Debates)
- quick.md confirmed already synced with YYMMDD-xxx ID format, no sequential IDs remain
- help.md updated with upstream --global note flag and explicit global scope path
- Tech debt #4 fully resolved: zero stale Skill() namespace calls across all workflows

## Task Commits

Each task was committed atomically:

1. **Task 1: Merge discuss-phase.md and plan-phase.md with v1.25.1** - `0f59930` (feat)
2. **Task 2: Merge new-project.md, quick.md, and help.md with v1.25.1** - `1625373` (feat)

## Files Created/Modified
- `grd/workflows/discuss-phase.md` - Research-adapted discussion workflow with v1.25.1 structural improvements (T1)
- `grd/workflows/plan-phase.md` - Research-adapted planning workflow with v1.25.1 improvements (T1)
- `grd/workflows/help.md` - Added --global note flag and explicit global scope path (T2)

## Decisions Made
- All 5 files were already structurally synced from Plan 15-03's comprehensive workflow sync; this plan validated the merge quality and applied two minor upstream improvements to help.md
- new-project.md research vocabulary is intentional divergence: Landscape/Questions/Frameworks/Debates vs upstream's Stack/Features/Architecture/Pitfalls

## Deviations from Plan
None - plan executed exactly as written. The files required less work than anticipated because Plan 15-03 had already done thorough upstream-first syncing.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 39 workflow files now synced with v1.25.1
- Ready for Plan 15-05: template and reference sync, VERSION file update
- Tech debt #4 fully resolved (no stale Skill() namespace calls remain)

---
*Phase: 15-upstream-sync-v1.25.1*
*Completed: 2026-03-17*
