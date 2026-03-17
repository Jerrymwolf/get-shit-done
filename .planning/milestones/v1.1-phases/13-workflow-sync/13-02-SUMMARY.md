---
phase: 13-workflow-sync
plan: 02
subsystem: workflows
tags: [upstream-sync, namespace-transform, research-workflows, gsd-r]

# Dependency graph
requires:
  - phase: 13-workflow-sync
    provides: 5 new workflow files from plan 01
provides:
  - 12 research-customized workflows synced with upstream v1.24.0
  - answer_validation, --auto mode, --batch mode in discuss-phase
  - deep_work_rules in plan-phase planner prompt
  - --research flag in quick.md
  - multi-runtime detection in update.md
  - UI Phase/UI Safety Gate in settings.md
  - Inherit model profile across new-project, settings, help
affects: [14-path-sweep, execute-phase, plan-phase, discuss-phase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Overwrite + namespace transform + research re-apply for workflow sync"
    - "canonical_refs section in CONTEXT.md templates"

key-files:
  created: []
  modified:
    - get-shit-done-r/workflows/verify-phase.md
    - get-shit-done-r/workflows/discuss-phase.md
    - get-shit-done-r/workflows/new-project.md
    - get-shit-done-r/workflows/plan-phase.md
    - get-shit-done-r/workflows/quick.md
    - get-shit-done-r/workflows/help.md
    - get-shit-done-r/workflows/new-milestone.md
    - get-shit-done-r/workflows/update.md
    - get-shit-done-r/workflows/execute-phase.md
    - get-shit-done-r/workflows/progress.md
    - get-shit-done-r/workflows/settings.md
    - get-shit-done-r/workflows/map-codebase.md

key-decisions:
  - "Start from GSD-R version for heavily-rewritten files (discuss, quick, help), apply upstream structural additions"
  - "Start from upstream for update.md (multi-runtime detection is major improvement)"
  - "canonical_refs section added to discuss-phase and plan-phase CONTEXT.md templates"
  - "Do NOT persist research choice in new-milestone (upstream behavioral fix)"

patterns-established:
  - "canonical_refs: mandatory section in CONTEXT.md with full file paths for downstream agents"
  - "deep_work_rules: every plan task must have read_first, acceptance_criteria, concrete action"

requirements-completed: [WKFL-03]

# Metrics
duration: 12min
completed: 2026-03-16
---

# Phase 13 Plan 02: Research-Customized Workflow Sync Summary

**12 workflows synced with upstream v1.24.0 improvements while preserving all GSD-R research logic (detect_research_phase, principal investigator framing, research dimensions, gsd-r-* agents)**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-16T13:09:49Z
- **Completed:** 2026-03-16T13:22:24Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- 6 heavily-customized workflows (verify-phase, discuss-phase, new-project, plan-phase, quick, help) synced with upstream additions while preserving research framing
- 6 moderately-customized workflows (new-milestone, update, execute-phase, progress, settings, map-codebase) synced with upstream structural improvements
- Zero occurrences of upstream namespace references (gsd-tools.cjs, /Users/jeremiahwolf/.claude/get-shit-done/) across all 12 files
- Zero double-replacement issues (gsd-r-r-)

## Task Commits

Each task was committed atomically:

1. **Task 1: Sync 6 heavily-customized workflows** - `82d7927` (feat)
2. **Task 2: Sync 6 moderately-customized workflows** - `d227c7e` (feat)

## Files Created/Modified
- `get-shit-done-r/workflows/verify-phase.md` - Research-aware phase verification (confirmed synced)
- `get-shit-done-r/workflows/discuss-phase.md` - Added answer_validation, --auto, --batch, canonical_refs
- `get-shit-done-r/workflows/new-project.md` - Added Inherit model profile option
- `get-shit-done-r/workflows/plan-phase.md` - Added deep_work_rules, canonical_refs in PRD path
- `get-shit-done-r/workflows/quick.md` - Added --research flag with focused research agent
- `get-shit-done-r/workflows/help.md` - Added --batch, --research, inherit documentation
- `get-shit-done-r/workflows/new-milestone.md` - Fixed research_enabled flow, stopped persisting choice
- `get-shit-done-r/workflows/update.md` - Multi-runtime detection (codex, gemini, opencode)
- `get-shit-done-r/workflows/execute-phase.md` - REQUIRED chain flag sync, stronger STOP semantics
- `get-shit-done-r/workflows/progress.md` - Added inherit to profile display
- `get-shit-done-r/workflows/settings.md` - Added Inherit, UI Phase, UI Safety Gate toggles
- `get-shit-done-r/workflows/map-codebase.md` - Confirmed synced with gsd-r agent refs

## Decisions Made
- Started from GSD-R version for heavily-rewritten files to preserve research framing
- Full overwrite with namespace transform for update.md (multi-runtime detection too valuable)
- Added canonical_refs as MANDATORY section in CONTEXT.md templates
- Stopped persisting research choice in new-milestone (upstream behavioral fix)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 12 research-customized workflows now have upstream v1.24.0 improvements
- Ready for Phase 14 path sweep to clean remaining stale references

---
*Phase: 13-workflow-sync*
*Completed: 2026-03-16*
