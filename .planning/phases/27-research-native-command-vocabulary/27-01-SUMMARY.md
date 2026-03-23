---
phase: 27-research-native-command-vocabulary
plan: 01
subsystem: commands
tags: [rename, vocabulary, workflow, research-native]

# Dependency graph
requires:
  - phase: 17-namespace-migration
    provides: grd namespace with /grd: prefix across codebase
provides:
  - Research-native bare identifiers in all 17 workflow files
  - Zero stale PM-style command identifiers in workflow routing
affects: [all workflow files, autonomous execution, command routing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Research-native command vocabulary: scope-inquiry, plan-inquiry, conduct-inquiry, verify-inquiry, complete-study, new-research"

key-files:
  created: []
  modified:
    - grd/workflows/autonomous.md
    - grd/workflows/conduct-inquiry.md
    - grd/workflows/scope-inquiry.md
    - grd/workflows/plan-inquiry.md
    - grd/workflows/verify-inquiry.md
    - grd/workflows/new-milestone.md
    - grd/workflows/quick.md
    - grd/workflows/audit-study.md
    - grd/workflows/verify-phase.md
    - grd/workflows/settings.md
    - grd/workflows/ui-phase.md
    - grd/workflows/diagnose-issues.md
    - grd/workflows/synthesize.md
    - grd/workflows/list-phase-assumptions.md
    - grd/workflows/resume-project.md
    - grd/workflows/discovery-phase.md
    - grd/workflows/help.md

key-decisions:
  - "Task 1 was already complete -- old command files already deleted and /grd: prefixed refs already zero from prior work"
  - "Preserved gsd-ui-researcher and gsd-ui-checker upstream GSD agent names per D-08"
  - "Bulk sed safe for bare hyphenated identifiers -- no false positive prose matches found"

patterns-established:
  - "Research-native vocabulary: discuss-phase->scope-inquiry, plan-phase->plan-inquiry, execute-phase->conduct-inquiry, verify-work->verify-inquiry, complete-milestone->complete-study, new-project->new-research"

requirements-completed: [CMD-01, CMD-02, CMD-03, CMD-04, CMD-05, CMD-06]

# Metrics
duration: 2min
completed: 2026-03-23
---

# Phase 27 Plan 01: Research-Native Command Vocabulary Summary

**Replaced 55 bare PM-style command identifiers with research-native names across 17 workflow files (scope-inquiry, plan-inquiry, conduct-inquiry, verify-inquiry, complete-study, new-research)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-23T15:50:30Z
- **Completed:** 2026-03-23T15:52:53Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments
- Replaced all bare old command identifiers (discuss-phase, execute-phase, plan-phase, verify-work, complete-milestone, new-project) with research-native equivalents in 17 workflow files
- Verified zero stale references remain across commands/, agents/, grd/workflows/, README.md, and docs/DESIGN.md scopes
- All 514 tests pass with no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete old command files and bulk-replace /grd: prefixed old command names** - Already complete (no changes needed -- old files already deleted, /grd: prefixed refs already zero)
2. **Task 2: Context-aware bare identifier replacement in 17 workflow files** - `cec4356` (feat)

## Files Created/Modified
- `grd/workflows/autonomous.md` - Replaced discuss-phase, execute-phase, complete-milestone, plan-phase bare identifiers
- `grd/workflows/conduct-inquiry.md` - Replaced plan-phase, execute-phase bare identifiers
- `grd/workflows/scope-inquiry.md` - Replaced discuss-phase, plan-phase, execute-phase, new-project bare identifiers
- `grd/workflows/plan-inquiry.md` - Replaced discuss-phase, execute-phase bare identifiers
- `grd/workflows/verify-inquiry.md` - Replaced plan-phase bare identifiers
- `grd/workflows/new-milestone.md` - Replaced discuss-phase, plan-phase, execute-phase, new-project bare identifiers
- `grd/workflows/quick.md` - Replaced execute-phase bare identifiers
- `grd/workflows/audit-study.md` - Replaced execute-phase bare identifiers
- `grd/workflows/verify-phase.md` - Replaced execute-phase bare identifiers
- `grd/workflows/settings.md` - Replaced plan-phase, execute-phase bare identifiers
- `grd/workflows/ui-phase.md` - Replaced discuss-phase, plan-phase bare identifiers
- `grd/workflows/diagnose-issues.md` - Replaced plan-phase, verify-work bare identifiers
- `grd/workflows/synthesize.md` - Replaced execute-phase bare identifiers
- `grd/workflows/list-phase-assumptions.md` - Replaced discuss-phase bare identifiers
- `grd/workflows/resume-project.md` - Replaced discuss-phase bare identifiers
- `grd/workflows/discovery-phase.md` - Replaced plan-phase bare identifiers
- `grd/workflows/help.md` - Replaced discuss-phase bare identifiers

## Decisions Made
- Task 1 (file deletion + /grd: prefix replacement) was already complete from prior work -- no changes needed
- Bulk sed was safe for bare hyphenated identifiers since no false-positive English prose matches existed
- Preserved gsd-ui-researcher and gsd-ui-checker upstream GSD agent names in ui-phase.md per D-08

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Task 1 already complete -- skipped to Task 2**
- **Found during:** Task 1
- **Issue:** Old command files already deleted and /grd: prefixed cross-references already at zero from prior phases
- **Fix:** Verified Task 1 acceptance criteria were met, proceeded directly to Task 2
- **Files modified:** None
- **Verification:** All Task 1 acceptance criteria confirmed passing

---

**Total deviations:** 1 (Task 1 pre-completed)
**Impact on plan:** No scope change. Task 1 work was done in prior phases; Task 2 executed as planned.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All workflow files now use research-native command vocabulary
- Commands, agents, and workflows are fully aligned on research-native names
- The commands/gsd-r/ directory still contains old PM-style command files (separate concern from this phase)

---
*Phase: 27-research-native-command-vocabulary*
*Completed: 2026-03-23*
