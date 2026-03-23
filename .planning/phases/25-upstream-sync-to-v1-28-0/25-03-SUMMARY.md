---
phase: 25-upstream-sync-to-v1-28-0
plan: 03
subsystem: core-modules
tags: [frontmatter, template, milestone, roadmap, verify, model-profiles, upstream-sync]

requires:
  - phase: 25-01
    provides: "core.cjs and state.cjs synced with upstream v1.28.0"
provides:
  - "6 LOW-conflict CJS modules synced with upstream v1.28.0"
  - "CRLF-tolerant frontmatter parsing"
  - "planningPaths/planningDir usage across milestone, roadmap, verify"
  - "extractCurrentMilestone replaces stripShippedMilestones in roadmap/verify"
  - "normalizeMd on file writes across frontmatter, template, milestone"
  - "Flexible table column handling in roadmap progress updates"
affects: [26-gsd-r-to-grd-rename, 27-command-vocabulary]

tech-stack:
  added: []
  patterns: [planningPaths for path resolution, extractCurrentMilestone for milestone scoping, normalizeMd on writes]

key-files:
  created: []
  modified:
    - grd/bin/lib/frontmatter.cjs
    - grd/bin/lib/template.cjs
    - grd/bin/lib/milestone.cjs
    - grd/bin/lib/roadmap.cjs
    - grd/bin/lib/verify.cjs

key-decisions:
  - "model-profiles.cjs required no changes -- upstream tier assignments identical, grd-* namespace already correct"
  - "Kept /grd: namespace in verify.cjs health messages (upstream uses /gsd:)"

patterns-established:
  - "extractCurrentMilestone replaces stripShippedMilestones for roadmap scoping"
  - "planningPaths(cwd) and planningDir(cwd) replace hardcoded .planning/ paths"
  - "All catch blocks annotated with /* intentionally empty */"

requirements-completed: [SYNC-01]

duration: 6min
completed: 2026-03-23
---

# Phase 25 Plan 03: LOW-conflict CJS Module Sync Summary

**Synced 6 shared CJS modules (frontmatter, template, milestone, roadmap, verify, model-profiles) with upstream v1.28.0 -- CRLF tolerance, planningPaths migration, normalizeMd on writes, flexible table columns**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-23T03:40:48Z
- **Completed:** 2026-03-23T03:47:29Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- frontmatter.cjs: CRLF-tolerant regex, multi-block support, null byte path guards, normalizeMd on writes
- template.cjs: normalizeMd import and usage on template file output
- milestone.cjs: planningPaths, already_complete tracking, extractOneLinerFromBody, improved task counting, stateReplaceFieldWithFallback, normalizeMd
- roadmap.cjs: planningPaths, extractCurrentMilestone, flexible 4/5-column table handling, plan checkbox marking
- verify.cjs: planningDir/planningRoot paths, extractCurrentMilestone, custom phase naming skip, annotated catch blocks, quick_branch_template in repair
- model-profiles.cjs: confirmed no changes needed (upstream tiers identical, grd-* namespace preserved, all 8 research agents intact)

## Task Commits

Each task was committed atomically:

1. **Task 1: Sync frontmatter, template, milestone, roadmap** - `cda9f71` (feat)
2. **Task 2: Sync verify.cjs, preserve model-profiles.cjs namespace** - `dc4561e` (feat)

## Files Created/Modified
- `grd/bin/lib/frontmatter.cjs` - CRLF-tolerant parsing, multi-block support, null byte guards, normalizeMd on writes
- `grd/bin/lib/template.cjs` - normalizeMd import and write wrapping
- `grd/bin/lib/milestone.cjs` - planningPaths, already_complete, extractOneLinerFromBody, stateReplaceFieldWithFallback, normalizeMd
- `grd/bin/lib/roadmap.cjs` - planningPaths, extractCurrentMilestone, flexible table columns, plan checkboxes
- `grd/bin/lib/verify.cjs` - planningDir/planningRoot, extractCurrentMilestone, custom naming skip, annotated catches

## Decisions Made
- model-profiles.cjs required zero changes: upstream tier assignments are identical to GRD's existing values, and the grd-* namespace with all 8 research agents was already correct
- Kept /grd: namespace in verify.cjs health check messages (upstream uses /gsd: -- this is a deliberate fork difference)
- Updated W002 health warning to advise manual review instead of auto-repair for STATE.md phase mismatches (matching upstream guidance)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All shared CJS modules now synced with upstream v1.28.0
- Ready for remaining plans in phase 25 (agent prompts, workflows, templates, commands)

---
*Phase: 25-upstream-sync-to-v1-28-0*
*Completed: 2026-03-23*

## Self-Check: PASSED
