---
phase: 10-core-library-sync
plan: 01
subsystem: core
tags: [core.cjs, upstream-sync, milestone-scoping, model-profiles, regex]

requires:
  - phase: 09-foundation-module-creation
    provides: model-profiles.cjs module with MODEL_PROFILES export
provides:
  - "core.cjs synced to upstream v1.24.0 with milestone scoping, profile inheritance, flexible goal regex"
  - "commands.cjs imports MODEL_PROFILES from model-profiles.cjs (not core.cjs)"
  - "stripShippedMilestones and replaceInCurrentMilestone exported from core.cjs"
affects: [11-state-commands-sync, 12-templates-execution-rigor, 13-workflow-sync, 14-path-sweep]

tech-stack:
  added: []
  patterns:
    - "Milestone scoping via stripShippedMilestones for ROADMAP.md reads"
    - "replaceInCurrentMilestone for write operations on multi-milestone roadmaps"
    - "Profile inheritance via 'inherit' keyword in model_profile config"

key-files:
  created:
    - test/core.test.cjs
  modified:
    - get-shit-done-r/bin/lib/core.cjs
    - get-shit-done-r/bin/lib/commands.cjs

key-decisions:
  - "Full file overwrite from upstream: cleanest sync strategy since upstream is authoritative"
  - "MODEL_PROFILES count of 2 in core.cjs is correct: import + usage, not in exports"

patterns-established:
  - "Upstream overwrite pattern: copy entire file, verify key properties, fix consumers"
  - "Module extraction pattern: remove export from core, add import from dedicated module in consumers"

requirements-completed: [FOUN-02, FOUN-03, CORE-01]

duration: 4min
completed: 2026-03-15
---

# Phase 10 Plan 01: Core Library Sync Summary

**core.cjs synced to upstream v1.24.0 with stripShippedMilestones, replaceInCurrentMilestone, flexible goal regex, and profile inheritance; MODEL_PROFILES moved to model-profiles.cjs import**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T22:51:15Z
- **Completed:** 2026-03-15T22:55:12Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- core.cjs overwritten with upstream v1.24.0 adding milestone scoping (stripShippedMilestones, replaceInCurrentMilestone), flexible goal regex, and profile inheritance with String().toLowerCase()
- commands.cjs updated to import MODEL_PROFILES from model-profiles.cjs instead of core.cjs
- 9 new tests covering all 3 new behaviors (stripShippedMilestones x4, replaceInCurrentMilestone x3, resolveModelInternal inherit x2)
- Full suite: 160 tests, 0 failures

## Task Commits

Each task was committed atomically:

1. **Task 1: Overwrite core.cjs with upstream and fix commands.cjs consumer** - `d84d9ad` (feat)
2. **Task 2: Write targeted tests for new core.cjs functions** - `b487ed5` (test)

## Files Created/Modified
- `get-shit-done-r/bin/lib/core.cjs` - Synced to upstream v1.24.0 with milestone scoping, profile inheritance, flexible goal regex
- `get-shit-done-r/bin/lib/commands.cjs` - MODEL_PROFILES import moved from core.cjs to model-profiles.cjs
- `test/core.test.cjs` - 9 tests for stripShippedMilestones, replaceInCurrentMilestone, resolveModelInternal inherit

## Decisions Made
- Full file overwrite from upstream chosen as cleanest sync strategy since upstream is authoritative
- MODEL_PROFILES count of 2 in core.cjs is correct (import line + usage in resolveModelInternal, not in exports)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- core.cjs is now at full v1.24.0 parity, ready for state.cjs and commands.cjs sync in Phase 11
- All 160 tests passing with zero failures
- MODEL_PROFILES correctly extracted to model-profiles.cjs module

---
*Phase: 10-core-library-sync*
*Completed: 2026-03-15*
