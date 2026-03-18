---
phase: 17-namespace-migration
plan: 02
subsystem: cli
tags: [namespace, workflow-rename, command-vocabulary, research-native]

requires:
  - phase: 17-01
    provides: "gsd-r to grd namespace rename across 170+ files"
provides:
  - "10 workflow files renamed to research-native command vocabulary"
  - "CLI init subcommand routing using new names (conduct-inquiry, scope-inquiry, etc.)"
  - "Zero residual old command names in grd/workflows/, grd/references/, grd/templates/"
affects: [all-phases, cli-routing, workflow-cross-references]

tech-stack:
  added: []
  patterns: ["research-native command vocabulary: conduct-inquiry, scope-inquiry, plan-inquiry, verify-inquiry, new-research, complete-study, insert-inquiry, add-inquiry, remove-inquiry, audit-study"]

key-files:
  created:
    - "grd/workflows/conduct-inquiry.md"
    - "grd/workflows/scope-inquiry.md"
    - "grd/workflows/plan-inquiry.md"
    - "grd/workflows/verify-inquiry.md"
    - "grd/workflows/new-research.md"
    - "grd/workflows/complete-study.md"
    - "grd/workflows/insert-inquiry.md"
    - "grd/workflows/add-inquiry.md"
    - "grd/workflows/remove-inquiry.md"
    - "grd/workflows/audit-study.md"
  modified:
    - "grd/bin/grd-tools.cjs"
    - "grd/bin/lib/init.cjs"
    - "grd/bin/lib/commands.cjs"
    - "grd/workflows/*.md (all 41 workflow files)"
    - "grd/references/continuation-format.md"
    - "grd/references/research-depth.md"
    - "grd/templates/*.md (6 template files)"

key-decisions:
  - "Kept JavaScript function names (cmdInitExecutePhase, etc.) as internal identifiers while renaming only user-facing switch/case labels"
  - "Added scope-inquiry as alias for phase-op init (discuss-phase previously routed to phase-op)"
  - "Applied text replacements in order of longest string first to avoid partial matches"

patterns-established:
  - "Research-native command vocabulary: /grd:conduct-inquiry replaces /grd:execute-phase"
  - "Workflow filenames now match the user-facing command names exactly"

requirements-completed: [NS-02, NS-06]

duration: 4min
completed: 2026-03-18
---

# Phase 17 Plan 02: Workflow File Rename Summary

**Renamed 10 workflow files to research-native command vocabulary and updated all 220+ cross-references across CLI, workflows, references, and templates**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-18T03:12:37Z
- **Completed:** 2026-03-18T03:17:11Z
- **Tasks:** 2
- **Files modified:** 44

## Accomplishments
- Renamed 10 workflow files per spec table (execute-phase.md -> conduct-inquiry.md, etc.)
- Updated all Skill() calls and /grd: references across 41 workflow files, 2 reference files, and 6 template files
- Updated CLI init subcommand routing in grd-tools.cjs with new command names
- Updated error messages in init.cjs to reflect new command names
- Zero residual old command names in grd/ tree

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename 10 workflow files and update all internal cross-references** - `be38c18` (feat)
2. **Task 2: Update CLI routing and init subcommands for new command names** - `ed9cfd0` (feat)

## Files Created/Modified

**Renamed (10 files):**
- `grd/workflows/new-project.md` -> `grd/workflows/new-research.md`
- `grd/workflows/discuss-phase.md` -> `grd/workflows/scope-inquiry.md`
- `grd/workflows/plan-phase.md` -> `grd/workflows/plan-inquiry.md`
- `grd/workflows/execute-phase.md` -> `grd/workflows/conduct-inquiry.md`
- `grd/workflows/verify-work.md` -> `grd/workflows/verify-inquiry.md`
- `grd/workflows/complete-milestone.md` -> `grd/workflows/complete-study.md`
- `grd/workflows/insert-phase.md` -> `grd/workflows/insert-inquiry.md`
- `grd/workflows/add-phase.md` -> `grd/workflows/add-inquiry.md`
- `grd/workflows/remove-phase.md` -> `grd/workflows/remove-inquiry.md`
- `grd/workflows/audit-milestone.md` -> `grd/workflows/audit-study.md`

**CLI routing (3 files):**
- `grd/bin/grd-tools.cjs` - Updated init switch/case labels and doc comments
- `grd/bin/lib/init.cjs` - Updated error messages
- `grd/bin/lib/commands.cjs` - Updated scaffold template reference

**Cross-reference updates (31 files):**
- All remaining workflow .md files (31 files updated with new Skill() and /grd: refs)
- `grd/references/continuation-format.md`, `grd/references/research-depth.md`
- `grd/templates/UAT.md`, `grd/templates/VALIDATION.md`, `grd/templates/bootstrap.md`, `grd/templates/phase-prompt.md`, `grd/templates/planner-subagent-prompt.md`, `grd/templates/research.md`

## Decisions Made
- Kept JavaScript function names as internal identifiers (cmdInitExecutePhase, etc.) -- only renamed user-facing switch/case labels and error messages
- Added scope-inquiry as an alias for phase-op init, since discuss-phase previously used the phase-op init path
- Applied text replacements in longest-first order to prevent partial matches (complete-milestone before complete, etc.)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Updated init.cjs error messages**
- **Found during:** Task 2
- **Issue:** Error messages in init.cjs still referenced old command names (e.g., "phase required for init execute-phase")
- **Fix:** Updated 3 error messages to use new command names (conduct-inquiry, plan-inquiry, verify-inquiry)
- **Files modified:** grd/bin/lib/init.cjs
- **Verification:** grep confirms no old command names in error strings

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for user-facing consistency. No scope creep.

## Issues Encountered

- Pre-existing namespace test failure: `test/namespace.test.cjs` subtest "no old long path in .planning/ tree" fails because `17-01-SUMMARY.md` contains historical documentation of the old "get-shit-done-r" namespace. This failure predates this plan (confirmed by running tests before changes). Not caused by 17-02 changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 10 workflow files now use research-native command vocabulary
- CLI routing accepts new command names
- Ready for subsequent phases that may reference these commands

---
*Phase: 17-namespace-migration*
*Completed: 2026-03-18*
