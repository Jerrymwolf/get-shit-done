---
phase: 32-help-reorganization
plan: 01
subsystem: documentation
tags: [help, cli, research-workflow, command-reference]

# Dependency graph
requires:
  - phase: 30-command-reconceptualization-diagnostics-and-corpus
    provides: Reconceptualized diagnose, map-corpus, add-verification commands
  - phase: 31-command-reconceptualization-export-and-presentation
    provides: Reconceptualized export-research, export-clean, presentation-design, output-review commands
provides:
  - Research-native /grd:help command reference organized by research lifecycle
  - Complete command inventory with scholarly descriptions
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Research Workflow / Utility / Configuration help organization"
    - "Research lifecycle command grouping: Scoping -> Conducting -> Synthesis -> Delivery"

key-files:
  created: []
  modified:
    - grd/workflows/help.md
    - commands/grd/help.md

key-decisions:
  - "Organized Research Workflow into 5 subsections: Scoping and Planning, Conducting Research, Synthesis and Delivery, Inquiry Management"
  - "Replaced all PM vocabulary with research-native descriptions throughout help"

patterns-established:
  - "Help sections follow the natural research lifecycle from scoping through delivery"

requirements-completed: [HLP-01, HLP-02]

# Metrics
duration: 3min
completed: 2026-03-23
---

# Phase 32 Plan 01: Help Reorganization Summary

**Complete /grd:help rewrite with Research Workflow / Utility / Configuration sections and research-native descriptions for all 30+ commands**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-23T23:51:37Z
- **Completed:** 2026-03-23T23:54:56Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Reorganized help into Research Workflow (with Scoping, Conducting, Synthesis, Delivery, Management subsections) / Smart Router / Quick Mode / Utility / Configuration sections
- Replaced all old PM command names: diagnose (not debug), map-corpus (not map-codebase), add-verification (not add-tests)
- Added missing commands: synthesize, presentation-design, output-review, stats, health, export-research, export-clean
- Rewrote all descriptions, examples, and Common Workflows section with research vocabulary
- Updated Files & Structure to show corpus/ documents (SOURCES, DOMAINS, METHODOLOGY, COVERAGE, GAPS, CONNECTIONS, QUALITY)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite help workflow with research-native organization and descriptions** - `64053dc` (feat)
2. **Task 2: Update CLI route file to match new help description** - `858c9b0` (feat)

## Files Created/Modified
- `grd/workflows/help.md` - Complete rewrite of help reference with research-native organization and descriptions
- `commands/grd/help.md` - Updated CLI route description and objective to reference research workflow

## Decisions Made
- Organized Research Workflow into 5 subsections following natural research lifecycle: Scoping and Planning, Conducting Research, Synthesis and Delivery, Inquiry Management
- Kept Smart Router and Quick Mode as separate top-level sections (not under Research Workflow) since they span the entire lifecycle
- Used research-native example descriptions (e.g., "Survey motivation frameworks in education literature" instead of "Add admin dashboard")

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- This is the final phase of v1.3 Research-Native Purification milestone
- All help content now speaks research language -- milestone ready for completion via /grd:complete-study

## Self-Check: PASSED

- FOUND: grd/workflows/help.md
- FOUND: commands/grd/help.md
- FOUND: 32-01-SUMMARY.md
- FOUND: commit 64053dc
- FOUND: commit 858c9b0

---
*Phase: 32-help-reorganization*
*Completed: 2026-03-23*
