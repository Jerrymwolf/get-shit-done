---
phase: 18-research-formulation-and-notes
plan: 02
subsystem: templates
tags: [researcher-recharter, scholarly-missions, thematic-analysis, critical-appraisal]

# Dependency graph
requires:
  - phase: 18-01
    provides: Research prospectus template, scoping questions, GRD branding in new-research.md
provides:
  - 4 scholarly researcher templates (Methodological Landscape, Prior Findings, Theoretical Framework, Limitations & Debates)
  - Updated researcher Task() prompts with scholarly missions and citations
  - Updated synthesizer reading new output paths
affects: [18-03 template vocabulary reframe, 18-04 research note template, conduct-inquiry executor]

# Tech tracking
tech-stack:
  added: []
  patterns: [scholarly-citation-in-agent-prompts, thematic-over-chronological-organization]

key-files:
  created:
    - grd/templates/research-project/METHODOLOGICAL-LANDSCAPE.md
    - grd/templates/research-project/PRIOR-FINDINGS.md
    - grd/templates/research-project/THEORETICAL-FRAMEWORK.md
    - grd/templates/research-project/LIMITATIONS-DEBATES.md
  modified:
    - grd/workflows/new-research.md

key-decisions:
  - "Researcher templates include full scholarly structure with tables matching each mission (methods inventory, thematic clusters, framework comparison, replication failures)"
  - "Agent prompts embed scholarly citations (Braun & Clarke 2006, CASP UK 2024, Alvesson & Sandberg 2011) directly in downstream_consumer text"

patterns-established:
  - "Researcher output structure matches scholarly function: each template's sections align with its specific analytical mission"
  - "Thematic organization over chronological: Prior Findings groups by theme, not by publication date"

requirements-completed: [FORM-02]

# Metrics
duration: 4min
completed: 2026-03-20
---

# Phase 18 Plan 02: Researcher Recharter Summary

**4 parallel researchers renamed to scholarly missions (Methodological Landscape, Prior Findings & Key Themes, Theoretical Framework Survey, Limitations Critiques & Debates) with citation-backed prompts and new template structures**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-20T00:11:24Z
- **Completed:** 2026-03-20T00:16:12Z
- **Tasks:** 2
- **Files modified:** 5 created, 4 deleted, 1 modified

## Accomplishments
- Created 4 new scholarly researcher templates with mission-specific section structures
- Updated all 4 researcher Task() prompts with scholarly questions, downstream consumers, and quality gates
- Updated synthesizer, research banner, Step 7 reference, and artifact list to use new file names
- Zero residual references to old file names (LANDSCAPE/QUESTIONS/FRAMEWORKS/DEBATES) remain in grd/

## Task Commits

Each task was committed atomically:

1. **Task 1: Create new researcher templates and delete old ones** - `5790532` (feat)
2. **Task 2: Update researcher prompts and synthesizer in new-research.md** - `bcd4636` (feat)

## Files Created/Modified
- `grd/templates/research-project/METHODOLOGICAL-LANDSCAPE.md` - Methods inventory, validated instruments, research designs (PRISMA-P, Cochrane Handbook)
- `grd/templates/research-project/PRIOR-FINDINGS.md` - Thematic clusters, convergent/divergent findings (Braun & Clarke, 2006)
- `grd/templates/research-project/THEORETICAL-FRAMEWORK.md` - Framework survey with disciplinary contributions (Ravitch & Riggan, 2017; Repko & Szostak, 2021)
- `grd/templates/research-project/LIMITATIONS-DEBATES.md` - Replication failures, untested assumptions (CASP UK, 2024; Alvesson & Sandberg, 2011)
- `grd/workflows/new-research.md` - All 4 researcher prompts + synthesizer + banner + artifact list updated
- Deleted: LANDSCAPE.md, QUESTIONS.md, FRAMEWORKS.md, DEBATES.md (old templates)

## Decisions Made
- Embedded scholarly citations directly in agent prompt downstream_consumer text so researchers receive methodological guidance at generation time
- Each template's sections were designed to match its scholarly function (e.g., Methodological Landscape has Research Methods Inventory and Validated Instruments tables; Prior Findings has Convergent/Divergent Findings tables)
- Added Disciplinary Contributions section to Theoretical Framework template for interdisciplinary topics (per Repko & Szostak, 2021)
- Added Replication Failures and Untested Assumptions sections to Limitations template (per CASP UK and Alvesson & Sandberg)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added scholarly citations to workflow prompts**
- **Found during:** Task 2 (acceptance criteria verification)
- **Issue:** Acceptance criteria required "Braun & Clarke" and "CASP/Alvesson" in new-research.md prompts, but initial prompt rewrites used thematic language without explicit citations
- **Fix:** Added "(Braun & Clarke, 2006)" to Prior Findings downstream_consumer and "(CASP UK, 2024; Alvesson & Sandberg, 2011)" to Limitations downstream_consumer
- **Files modified:** grd/workflows/new-research.md
- **Committed in:** bcd4636

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Citation addition ensures researchers receive methodological provenance. No scope creep.

## Issues Encountered
- npm test fails due to missing tests/ directory -- pre-existing condition unrelated to this plan

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 researcher templates and prompts are scholarly-rechartered
- Ready for Plan 03 (template vocabulary reframe) and Plan 04 (research note template)
- Synthesizer reads new paths; downstream bootstrap/requirements/roadmap workflows will need to reference new research output names when updated

---
## Self-Check: PASSED

All 6 files verified present. Both task commits (5790532, bcd4636) confirmed in git log.

---
*Phase: 18-research-formulation-and-notes*
*Completed: 2026-03-20*
