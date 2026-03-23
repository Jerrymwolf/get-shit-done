---
phase: 31-command-reconceptualization----export-and-presentation
plan: "01"
subsystem: commands
tags: [export, presentation, research-delivery, scholarly-review, workflow]

requires:
  - phase: 28-agent-and-workflow-reorientation
    provides: research-aware agent prompts
  - phase: 29-research-template-variants
    provides: research task and summary templates
provides:
  - export-research command and workflow for packaging research deliverables
  - export-clean command and workflow for artifact-free research sharing
  - presentation-design command and workflow for structuring research presentations
  - output-review command and workflow for scholarly quality auditing
affects: [32-help-reorganization]

tech-stack:
  added: []
  patterns: [six-dimension scholarly review, presentation design contract, research export pipeline]

key-files:
  created:
    - commands/grd/export-research.md
    - commands/grd/export-clean.md
    - commands/grd/presentation-design.md
    - commands/grd/output-review.md
    - grd/workflows/export-research.md
    - grd/workflows/export-clean.md
    - grd/workflows/presentation-design.md
    - grd/workflows/output-review.md
    - grd/templates/PRESENTATION-SPEC.md
  modified:
    - grd/workflows/help.md
    - grd/workflows/verify-inquiry.md
    - grd/workflows/verify-work.md
    - grd/workflows/discuss-phase.md
    - grd/workflows/discuss-phase-assumptions.md
    - grd/workflows/plan-inquiry.md
    - grd/workflows/plan-phase.md
    - grd/workflows/progress.md
    - grd/workflows/new-project.md
    - grd/workflows/settings.md
    - grd/workflows/execute-phase.md
    - grd/workflows/complete-milestone.md
    - grd/workflows/complete-study.md
    - grd/bin/lib/config.cjs
    - grd/bin/lib/model-profiles.cjs
    - test/smoke.test.cjs

key-decisions:
  - "Six scholarly dimensions replace six UI pillars: argument coherence, evidence quality, citation coverage, methodology transparency, presentation clarity, completeness"
  - "PRESENTATION-SPEC.md template replaces UI-SPEC.md with argument arc, evidence mapping, and narrative decisions"
  - "Export-research offers three formats: Obsidian vault, manuscript assembly, shareable archive"

patterns-established:
  - "Research quality dimensions: 6-point scholarly audit replacing visual UI audit"
  - "Presentation design contract: locks structure and evidence placement before assembly"

requirements-completed: [CMD-01, CMD-03, CMD-06, CMD-07]

duration: 9min
completed: 2026-03-23
---

# Phase 31 Plan 01: Reconceptualize Export and Presentation Commands Summary

**Four PM-oriented output commands reconceptualized as research delivery tools: export-research (Obsidian/manuscript/archive packaging), export-clean (artifact-free sharing), presentation-design (paper/poster/slides/report structure), output-review (6-dimension scholarly quality audit)**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-23T23:30:10Z
- **Completed:** 2026-03-23T23:39:29Z
- **Tasks:** 2
- **Files modified:** 25

## Accomplishments
- Replaced ship and pr-branch with research export commands (export-research with 3 format options, export-clean for artifact-free sharing)
- Replaced ui-phase and ui-review with scholarly equivalents (presentation-design for argument structure, output-review with 6 research dimensions)
- Created PRESENTATION-SPEC.md template with argument arc, evidence mapping, and narrative decisions (replacing UI-SPEC.md)
- Updated 13 workflow files, 2 CJS modules, and 1 test file to reference new commands
- All 69 tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Reconceptualize ship and pr-branch as research export commands** - `8a96ae5` (feat)
2. **Task 2: Reconceptualize ui-phase and ui-review as presentation and output review commands** - `d9ed1d4` (feat)

## Files Created/Modified
- `commands/grd/export-research.md` - CLI route for research export packaging
- `commands/grd/export-clean.md` - CLI route for clean research sharing
- `commands/grd/presentation-design.md` - CLI route for presentation structure design
- `commands/grd/output-review.md` - CLI route for scholarly quality audit
- `grd/workflows/export-research.md` - Workflow: validate completeness, choose format, package deliverables
- `grd/workflows/export-clean.md` - Workflow: filter artifacts, copy research, generate manifest
- `grd/workflows/presentation-design.md` - Workflow: select format, design structure, map evidence
- `grd/workflows/output-review.md` - Workflow: evaluate 6 scholarly dimensions, score, recommend improvements
- `grd/templates/PRESENTATION-SPEC.md` - Template replacing UI-SPEC.md with research presentation contract
- 13 workflow files updated with new command references
- `grd/bin/lib/config.cjs` - Config keys: presentation_design, presentation_gate (replacing ui_phase, ui_safety_gate)
- `grd/bin/lib/model-profiles.cjs` - Agent profiles: grd-presentation-designer, grd-output-reviewer
- `test/smoke.test.cjs` - Updated expected file lists for renamed commands and templates

## Decisions Made
- Six scholarly dimensions for output-review (argument coherence, evidence quality, citation coverage, methodology transparency, presentation clarity, completeness) replace the former six UI pillars
- PRESENTATION-SPEC.md uses argument arc with evidence mapping instead of visual design tokens
- Export-research offers three export formats (Obsidian vault, manuscript assembly, shareable archive) to cover common research delivery needs
- Config keys renamed from ui_phase/ui_safety_gate to presentation_design/presentation_gate
- Kept ui-brand.md reference file (controls GRD's own display formatting, not research presentation)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Updated CJS modules and templates alongside workflow files**
- **Found during:** Task 2
- **Issue:** config.cjs had ui_phase/ui_safety_gate config keys, model-profiles.cjs had ui-researcher/checker/auditor agent names, UI-SPEC.md template was purely frontend-oriented
- **Fix:** Updated config keys, agent profile names, and replaced template with research-native PRESENTATION-SPEC.md
- **Files modified:** grd/bin/lib/config.cjs, grd/bin/lib/model-profiles.cjs, grd/templates/PRESENTATION-SPEC.md
- **Verification:** All 69 tests pass
- **Committed in:** d9ed1d4 (Task 2 commit)

**2. [Rule 1 - Bug] Updated smoke test expected file lists**
- **Found during:** Task 2
- **Issue:** Smoke tests would fail because they assert existence of old file names (ui-phase.md, ui-review.md, UI-SPEC.md)
- **Fix:** Updated EXPECTED_WORKFLOWS and EXPECTED templates arrays with new file names
- **Files modified:** test/smoke.test.cjs
- **Verification:** 69/69 tests pass
- **Committed in:** d9ed1d4 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All four export/presentation commands are research-native
- Phase 32 (Help Reorganization) can now document all reconceptualized commands
- All cross-references updated -- no dangling references to old command names

---
*Phase: 31-command-reconceptualization----export-and-presentation*
*Completed: 2026-03-23*
