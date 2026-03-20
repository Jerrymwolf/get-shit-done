---
phase: 18-research-formulation-and-notes
plan: 04
subsystem: templates
tags: [research-note, evidence-quality, scope-inquiry, prd-flag, testing]

# Dependency graph
requires:
  - phase: 18-01
    provides: PROJECT.md prospectus template and new-research scoping questions
  - phase: 18-02
    provides: Researcher recharter with new template files and output paths
  - phase: 18-03
    provides: BOOTSTRAP/REQUIREMENTS/ROADMAP template reframing
provides:
  - Research note template with Evidence Quality section and new frontmatter
  - scope-inquiry --prd flag for research brief parsing
  - 4 test files covering all Phase 18 template changes (58 tests)
affects: [conduct-inquiry, verify-inquiry, evidence-quality]

# Tech tracking
tech-stack:
  added: []
  patterns: [evidence-quality-scaling-by-review-type, research-brief-parsing]

key-files:
  created:
    - test/template-vocabulary.test.cjs
    - test/research-note-template.test.cjs
    - test/scope-inquiry-flags.test.cjs
    - test/researcher-recharter.test.cjs
  modified:
    - grd/templates/research-note.md
    - grd/workflows/scope-inquiry.md
    - scripts/run-tests.cjs

key-decisions:
  - "Evidence Quality section includes all 3 format variants as template guidance; agent selects based on review_type"
  - "--prd flag parses research-specific sections (inclusion criteria, search boundaries, disciplinary scope)"
  - "Fixed run-tests.cjs to reference test/ (singular) instead of tests/ (plural)"

patterns-established:
  - "Evidence Quality scaling: systematic/scoping=table, integrative/critical=prose, narrative=brief"
  - "Template test pattern: read file content, assert section presence and ordering"

requirements-completed: [NOTE-01, NOTE-02, NOTE-03, TRAP-01, FORM-02]

# Metrics
duration: 4min
completed: 2026-03-20
---

# Phase 18 Plan 04: Research Note Evidence Quality, --prd Flag, and Test Coverage Summary

**Research note template extended with Evidence Quality section (3 format variants), new frontmatter fields (inquiry/era/review_type), --prd flag for scope-inquiry, and 58 new tests covering all Phase 18 changes**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-20T00:18:48Z
- **Completed:** 2026-03-20T00:23:00Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Research note template extended with Evidence Quality section between Analysis and Implications, with systematic/scoping table, integrative/critical prose, and narrative brief format variants
- New frontmatter fields added: inquiry (phase number), era (temporal positioning), review_type (from config), status (lifecycle)
- scope-inquiry workflow now supports --prd flag for non-interactive research brief parsing
- 4 new test files (58 tests) covering template vocabulary (FORM-03-06), research note structure (NOTE-01-03), scope-inquiry flags (TRAP-01), and researcher recharter (FORM-02)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend research note template with Evidence Quality and new frontmatter** - `0f0f130` (feat)
2. **Task 2: Implement --prd flag in scope-inquiry workflow** - `b04852a` (feat)
3. **Task 3: Create all Phase 18 test files** - `ecfe329` (test)

## Files Created/Modified
- `grd/templates/research-note.md` - Extended with Evidence Quality section and new frontmatter fields
- `grd/workflows/scope-inquiry.md` - Added --prd flag parsing and updated express path
- `test/template-vocabulary.test.cjs` - 22 tests verifying FORM-03 through FORM-06 template vocabulary
- `test/research-note-template.test.cjs` - 12 tests verifying NOTE-01 through NOTE-03 research note structure
- `test/scope-inquiry-flags.test.cjs` - 8 tests verifying TRAP-01 --prd and --batch flags
- `test/researcher-recharter.test.cjs` - 16 tests verifying FORM-02 researcher recharter
- `scripts/run-tests.cjs` - Fixed test directory path from tests/ to test/
- `.planning/phases/18-research-formulation-and-notes/deferred-items.md` - Pre-existing issues log

## Decisions Made
- Evidence Quality section includes all 3 format variants as template guidance with a comment instructing the user to delete unused formats -- agent selects based on review_type from config
- --prd flag parses research-specific sections (inclusion criteria, exclusion criteria, search boundaries, disciplinary scope, research questions) rather than generic PRD content
- Fixed run-tests.cjs to reference correct test/ directory (Rule 3 blocking fix)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed run-tests.cjs test directory path**
- **Found during:** Task 3 (npm test verification)
- **Issue:** scripts/run-tests.cjs referenced `tests/` (plural) directory but all test files live in `test/` (singular), causing npm test to fail with ENOENT
- **Fix:** Changed directory reference from `tests` to `test` in run-tests.cjs
- **Files modified:** scripts/run-tests.cjs
- **Verification:** npm test now runs all 259 tests (258 pass, 1 pre-existing failure)
- **Committed in:** ecfe329 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix necessary for npm test to function. No scope creep.

## Issues Encountered
- 1 pre-existing test failure in namespace.test.cjs ("no old long path in .planning/ tree") caused by `.planning/phases/17-namespace-migration/17-VERIFICATION.md` -- logged to deferred-items.md, not related to Phase 18 changes

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 18 complete -- all template reframing, researcher recharter, and research note enhancements done
- 258/259 tests passing (1 pre-existing namespace issue)
- Ready for Phase 19 (conduct-inquiry executor integration)

---
*Phase: 18-research-formulation-and-notes*
*Completed: 2026-03-20*
