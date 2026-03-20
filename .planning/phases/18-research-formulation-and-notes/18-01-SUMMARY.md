---
phase: 18-research-formulation-and-notes
plan: 01
subsystem: templates
tags: [research-prospectus, scoping-questions, grd-branding, workflow]

# Dependency graph
requires:
  - phase: 16-config-schema-extensions
    provides: SMART_DEFAULTS, configWithDefaults, config-set for researcher_tier/review_type/epistemological_stance
  - phase: 17-namespace-migration
    provides: GRD namespace across commands and user-facing labels
provides:
  - Research prospectus template (PROJECT.md) with 7 scholarly sections
  - Research scoping questions in new-research workflow (tier/type/epistemology)
  - Config integration for scoping values written before deep questioning
affects: [18-02 researcher recharter, 18-03 template reframing, conduct-inquiry executor]

# Tech tracking
tech-stack:
  added: []
  patterns: [scoping-before-questioning, config-driven-language-adaptation]

key-files:
  created: []
  modified:
    - grd/templates/project.md
    - grd/workflows/new-research.md

key-decisions:
  - "Research prospectus template uses double-dash (--) separators matching existing codebase convention"
  - "All GSD stage banners in new-research.md replaced with GRD (Steps 3, 6, 7, 8, 9)"

patterns-established:
  - "Scoping questions write config values immediately via grd-tools config-set before downstream steps"
  - "Step 3a Research Scoping runs for BOTH interactive and auto mode paths"

requirements-completed: [FORM-01, FORM-03]

# Metrics
duration: 3min
completed: 2026-03-20
---

# Phase 18 Plan 01: Research Prospectus Template and Scoping Questions Summary

**Research prospectus template with Problem Statement, Significance, Research Questions, and Methodological Decisions replacing PM vocabulary; scoping questions for tier/type/epistemology inserted before deep questioning in new-research workflow**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-20T00:03:48Z
- **Completed:** 2026-03-20T00:07:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- PROJECT.md template replaced with research prospectus structure containing 7 scholarly sections (Problem Statement, Significance, Epistemological Stance, Review Type, Researcher Tier, Research Questions, Methodological Decisions)
- Step 3a Research Scoping added to new-research workflow with tier/type/epistemology questions that write to config.json immediately
- All GSD stage banners replaced with GRD branding across the entire new-research workflow
- Deep questioning reframed to research vocabulary ("What is your research problem?" replaces "What do you want to build?")

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace PROJECT.md template with research prospectus** - `cb41cc4` (feat)
2. **Task 2: Add scoping questions to new-research workflow** - `597e7b4` (feat)

## Files Created/Modified
- `grd/templates/project.md` - Research prospectus template with scholarly sections, guidelines, evolution, brownfield, and state_reference all updated to research vocabulary
- `grd/workflows/new-research.md` - Step 3a Research Scoping with 3 config questions, GRD branding, research-vocabulary questioning

## Decisions Made
- Replaced ALL GSD banners in new-research.md (not just the 3 mentioned in plan) -- Steps 7 (DEFINING REQUIREMENTS), 8 (CREATING ROADMAP), and 9 (PROJECT INITIALIZED) also updated for consistency
- Used double-dash (--) separators in template to match existing codebase convention rather than em-dash

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Updated additional GSD banners in Steps 7, 8, 9**
- **Found during:** Task 2 (new-research workflow updates)
- **Issue:** Plan specified updating banners in Steps 3, 6 only, but Steps 7, 8, 9 also had GSD branding
- **Fix:** Replaced all remaining GSD banners with GRD for consistent branding
- **Files modified:** grd/workflows/new-research.md
- **Verification:** grep confirms zero GSD banner remnants
- **Committed in:** 597e7b4 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for consistent GRD branding. No scope creep.

## Issues Encountered
- Pre-existing test issue: `npm test` fails because `scripts/run-tests.cjs` references `tests/` directory but test files are in `test/`. Running `node --test test/*.test.cjs` directly shows 200/201 passing with 1 pre-existing namespace test failure unrelated to this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Research prospectus template ready for consumption by new-research workflow Step 4
- Config scoping infrastructure ready for downstream plans (researcher recharter, template reframing)
- Plan 18-02 (researcher recharter) can proceed -- scoping questions now write config values needed by researcher agents

---
*Phase: 18-research-formulation-and-notes*
*Completed: 2026-03-20*
