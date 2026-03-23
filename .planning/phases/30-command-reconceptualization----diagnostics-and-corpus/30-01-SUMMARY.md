---
phase: 30-command-reconceptualization----diagnostics-and-corpus
plan: 01
subsystem: command-reconceptualization
tags: [diagnose, map-corpus, add-verification, research-native, commands]

requires:
  - phase: 28-agent-and-workflow-reorientation
    provides: Agent prompts and workflows already speaking research language
provides:
  - Research-native diagnose pipeline (methodology gaps, source conflicts, analytical dead ends)
  - Research-native map-corpus pipeline (corpus survey with 7 knowledge landscape documents)
  - Research-native add-verification pipeline (evidence, coverage, methodology checks)
affects: [help-reorganization, documentation]

tech-stack:
  added: []
  patterns:
    - "Research investigation techniques: source tracing, conceptual comparison, methodology audit, coverage gap analysis, reasoning chain validation"
    - "Corpus mapping produces 7 research documents: SOURCES, DOMAINS, METHODOLOGY, COVERAGE, GAPS, CONNECTIONS, QUALITY"
    - "Verification categories: Evidence (source fidelity), Coverage (completeness), Methodology (soundness)"

key-files:
  created: []
  modified:
    - commands/grd/debug.md
    - commands/grd/map-codebase.md
    - commands/grd/add-tests.md
    - grd/workflows/diagnose-issues.md
    - grd/workflows/map-codebase.md
    - grd/workflows/add-tests.md
    - agents/grd-debugger.md
    - agents/grd-codebase-mapper.md

key-decisions:
  - "Diagnosis agent keeps hypothesis-testing framework but applies it to scholarly investigation (source conflicts, methodology gaps)"
  - "Corpus mapping produces 7 research documents replacing 7 codebase documents (SOURCES/DOMAINS/METHODOLOGY/COVERAGE/GAPS/CONNECTIONS/QUALITY)"
  - "Verification uses Evidence/Coverage/Methodology categories replacing TDD/E2E/Skip"

patterns-established:
  - "Research diagnosis pattern: symptom gathering asks about expected findings, conflicting sources, and scope"
  - "Corpus mapper agent surveys vault/sources/ and vault/notes/ instead of src/ and package.json"
  - "Verification workflow: source fidelity checks, coverage assertions, methodology validation"

requirements-completed: [CMD-02, CMD-04, CMD-05]

duration: 10min
completed: 2026-03-23
---

# Phase 30 Plan 01: Command Reconceptualization -- Diagnostics and Corpus Summary

**Three PM-only commands reconceptualized as research-native tools: diagnose (methodology gaps, source conflicts), map-corpus (knowledge landscape survey), add-verification (evidence checks and source coverage assertions)**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-23T23:06:35Z
- **Completed:** 2026-03-23T23:16:35Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Rewrote `/grd:diagnose` pipeline (command + workflow + agent) from code debugging to research investigation -- source tracing, conceptual comparison, methodology audit, coverage gap analysis, reasoning chain validation
- Rewrote `/grd:map-corpus` pipeline (command + workflow + agent) from codebase analysis to research corpus surveying -- produces 7 knowledge landscape documents (SOURCES, DOMAINS, METHODOLOGY, COVERAGE, GAPS, CONNECTIONS, QUALITY)
- Rewrote `/grd:add-verification` pipeline (command + workflow) from software test generation to research evidence verification -- Evidence/Coverage/Methodology categories replace TDD/E2E/Skip

## Task Details

### Task 1: Reconceptualize diagnose command, workflow, and agent
- **Commit:** c7c4a12
- commands/grd/debug.md: Research diagnosis entry point with scholarly symptom gathering
- grd/workflows/diagnose-issues.md: Parallel diagnosis of research gaps (not UAT gaps)
- agents/grd-debugger.md: Full research diagnostician agent with 5 investigation techniques

### Task 2: Reconceptualize map-corpus command, workflow, and agent
- **Commit:** 3fe552f
- commands/grd/map-codebase.md: Corpus survey entry point mapping knowledge landscape
- grd/workflows/map-codebase.md: 4 parallel agents producing 7 corpus documents
- agents/grd-codebase-mapper.md: Created from scratch (was empty) as corpus mapper

### Task 3: Reconceptualize add-verification command and workflow
- **Commit:** 2e9baad
- commands/grd/add-tests.md: Evidence checks and source coverage assertions
- grd/workflows/add-tests.md: Classification into Evidence/Coverage/Methodology categories

## Decisions Made

1. **Diagnosis agent keeps systematic investigation framework** -- Hypothesis testing, falsifiability, cognitive bias awareness all preserved but applied to scholarly problems (source conflicts, methodology gaps, analytical dead ends) instead of code bugs
2. **7 corpus documents replace 7 codebase documents** -- SOURCES.md, DOMAINS.md, METHODOLOGY.md, COVERAGE.md, GAPS.md, CONNECTIONS.md, QUALITY.md replace STACK.md, ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, INTEGRATIONS.md, CONCERNS.md
3. **Three verification categories** -- Evidence (source fidelity), Coverage (completeness), Methodology (soundness) replace TDD (unit), E2E (browser), Skip

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Phase 31 (Command Reconceptualization -- Export and Presentation) can proceed independently
- Phase 32 (Help Reorganization) depends on both Phase 30 and 31 completing

## Self-Check: PASSED
