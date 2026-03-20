---
phase: 18-research-formulation-and-notes
plan: 03
subsystem: templates
tags: [scholarly-vocabulary, bootstrap, requirements, roadmap, research-reorientation]

# Dependency graph
requires:
  - phase: 16-config-infrastructure
    provides: SMART_DEFAULTS, config propagation for review_type/tier/epistemology
provides:
  - State-of-the-field assessment template (bootstrap.md)
  - Research objectives template (requirements.md)
  - Research design template (roadmap.md)
  - Backward-compatible bootstrap parser (accepts old and new vocabulary)
affects: [18-04, 18-05, new-research workflow, scope-inquiry workflow]

# Tech tracking
tech-stack:
  added: []
  patterns: [backward-compat regex fallback for vocabulary migration]

key-files:
  created: []
  modified:
    - grd/templates/bootstrap.md
    - grd/templates/requirements.md
    - grd/templates/roadmap.md
    - grd/bin/lib/bootstrap.cjs
    - test/bootstrap.test.cjs
    - test/plan-checker-rules.test.cjs

key-decisions:
  - "Bootstrap parser accepts both old and new section headers for backward compatibility"
  - "Requirements template uses scholarly SDT-Values example instead of CommunityApp"

patterns-established:
  - "Vocabulary migration with backward-compat parsing: new headers primary, old headers as fallback regex"

requirements-completed: [FORM-04, FORM-05, FORM-06]

# Metrics
duration: 4min
completed: 2026-03-19
---

# Phase 18 Plan 03: Template Vocabulary Reframe Summary

**Three templates reframed to scholarly vocabulary: State-of-the-Field Assessment, Research Objectives, Research Design with backward-compatible bootstrap parser**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-20T00:03:59Z
- **Completed:** 2026-03-20T00:08:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- BOOTSTRAP.md reframed: Established Knowledge / Contested Claims / Knowledge Gaps (with Arksey & O'Malley citation)
- REQUIREMENTS.md reframed: Research Objectives with Primary/Secondary, SDT-Values scholarly example, REQ-ID format preserved
- ROADMAP.md reframed: Research Design with "Inquiry" replacing "Phase" throughout, "Lines of Inquiry" section
- bootstrap.cjs updated: generateBootstrap() emits new vocabulary, parseBootstrap() accepts both old and new headers
- All 29 tests pass (12 bootstrap + 17 plan-checker)

## Task Commits

Each task was committed atomically:

1. **Task 1: Reframe BOOTSTRAP.md as state-of-the-field assessment** - `e336368` (feat)
2. **Task 2: Reframe REQUIREMENTS.md and ROADMAP.md + library/test updates** - `a251e9d` (feat)

## Files Created/Modified
- `grd/templates/bootstrap.md` - State-of-the-field assessment template with scholarly vocabulary
- `grd/templates/requirements.md` - Research objectives template with Primary/Secondary objectives and scholarly example
- `grd/templates/roadmap.md` - Research design template with Inquiry replacing Phase
- `grd/bin/lib/bootstrap.cjs` - Updated generateBootstrap() and parseBootstrap() with backward-compat
- `test/bootstrap.test.cjs` - Updated fixtures and assertions for new vocabulary
- `test/plan-checker-rules.test.cjs` - Updated fixtures for new vocabulary

## Decisions Made
- Bootstrap parser accepts both old ("Already Established") and new ("Established Knowledge") section headers via fallback regex -- ensures existing BOOTSTRAP.md files from prior projects still parse correctly
- Requirements example rewritten as SDT-Values Integration Study with THEO/EMPR/CULT themes instead of CommunityApp AUTH/PROF/CONT

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated bootstrap.cjs library to match new template vocabulary**
- **Found during:** Task 2
- **Issue:** bootstrap.cjs generateBootstrap() emitted old vocabulary ("Already Established") and parseBootstrap() only recognized old section headers
- **Fix:** Updated generateBootstrap() to emit new vocabulary; updated parseBootstrap() to accept both old and new headers as fallback
- **Files modified:** grd/bin/lib/bootstrap.cjs
- **Verification:** All 12 bootstrap tests pass
- **Committed in:** a251e9d (Task 2 commit)

**2. [Rule 1 - Bug] Updated test fixtures for bootstrap and plan-checker tests**
- **Found during:** Task 2
- **Issue:** Test fixtures in bootstrap.test.cjs and plan-checker-rules.test.cjs used old vocabulary in fixture strings
- **Fix:** Updated all fixtures to use new scholarly vocabulary (Established Knowledge, Contested Claims, Knowledge Gaps)
- **Files modified:** test/bootstrap.test.cjs, test/plan-checker-rules.test.cjs
- **Verification:** All 29 tests pass (12 bootstrap + 17 plan-checker)
- **Committed in:** a251e9d (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both fixes necessary for correctness -- library and tests must match template vocabulary. No scope creep.

## Issues Encountered
- npm test script references non-existent `tests/` directory (pre-existing issue, tests live in `test/`). Tests verified by running individual test files directly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 3 templates ready for consumption by new-research workflow
- Bootstrap parser backward-compatible with existing projects
- Plans 18-04 and 18-05 can proceed

---
*Phase: 18-research-formulation-and-notes*
*Completed: 2026-03-19*
