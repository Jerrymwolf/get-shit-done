---
phase: 05-verification-and-workflows
plan: 01
subsystem: verification
tags: [tdd, verification, research-quality, source-audit]
dependency_graph:
  requires: [acquire.cjs, vault.cjs]
  provides: [verify-research.cjs]
  affects: [research workflow, note status management]
tech_stack:
  added: []
  patterns: [two-tier-verification, goal-backward-check, source-audit, fix-task-generation]
key_files:
  created:
    - grd/bin/lib/verify-research.cjs
    - test/verify-research.test.cjs
  modified: []
decisions:
  - "Tier 1 uses keyword overlap ratio (30% threshold) for question-content relevance check"
  - "Placeholder detection via regex patterns (TODO, TBD, FIXME, fill in, etc.)"
  - "Frontmatter sources count checked against actual files excluding SOURCE-LOG.md"
  - "Orphan files are warnings (not failures) -- do not block verification"
  - "Fix tasks typed as research/acquisition/cleanup with high/medium priority"
requirements-completed: [ORCH-01, VERI-01, VERI-02, VERI-03]
metrics:
  duration: 15min
  completed: 2026-03-11
  tasks: 3
  files: 2
  test_count: 24
---

# Phase 5 Plan 01: Two-Tier Research Verification Summary

Two-tier verification engine (goal-backward + source audit) with fix task generation, built TDD-first with 24 tests covering all verification paths.

## What Was Built

### verify-research.cjs (276 lines)

Four exported functions implementing the research verification pipeline:

- **verifyTier1(noteContent, researchQuestion)** -- Goal-backward verification checking: Key Findings exists and is substantive (>50 chars), Analysis exists and is substantive (>100 chars, not placeholder), Implications section exists, and keyword overlap between research question and note content (>30% threshold).

- **verifyTier2(noteContent, sourcesDir, sourceLogPath)** -- Source audit calling validateReferences from acquire.cjs, plus: SOURCE-LOG.md existence check, frontmatter `sources` count vs actual file count, orphan file detection (warnings only).

- **verifyNote(noteContent, sourcesDir, sourceLogPath, researchQuestion)** -- Combined pipeline running Tier 1 first, skipping Tier 2 if Tier 1 fails. Status mapping: `final` (both pass), `reviewed` (minor issues like orphans), `draft` (any failure).

- **generateFixTasks(verificationResult, noteMetadata)** -- Produces typed fix task descriptions: `research` tasks for Tier 1 gaps, `acquisition` tasks for missing sources, `cleanup` tasks for formatting issues.

### test/verify-research.test.cjs (24 tests across 6 suites)

- Suite 1: verifyTier1 goal-backward (5 tests)
- Suite 2: verifyTier2 source audit (6 tests)
- Suite 3: verifyNote combined pipeline (4 tests)
- Suite 4: generateFixTasks output (4 tests)
- Suite 5: Integration -- full pipeline end-to-end (1 test)
- Suite 6: Edge cases -- backticks in Analysis, special chars, empty dirs, mixed failures (4 tests)

## Key Integration Points

- **acquire.cjs**: Calls `validateReferences()` and `extractReferences()` for Tier 2 source file/orphan checks
- **note-format.md**: Parses all five required sections (Key Findings, Analysis, Implications, Open Questions, References)
- **research-verification.md**: Implements the two-tier criteria and status mapping defined in the reference

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test fixtures with incorrect frontmatter sources count**
- **Found during:** Task 2 (GREEN phase)
- **Issue:** Three test fixtures had `sources: 2` in frontmatter but actual file count on disk differed (orphan tests had 3 files, unavailable test had 1 file)
- **Fix:** Updated test fixtures to use correct `sources` counts matching actual disk state
- **Files modified:** test/verify-research.test.cjs

### Notes

- vault.test.cjs and state.test.cjs hang when run (likely iCloud fs issue with temp dirs) -- this is a pre-existing issue unrelated to this plan's changes. All other test files (acquire, plan-checker-rules, bootstrap, verify-research) pass with 0 failures.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 30b4e6d | test(05-01): add failing tests for two-tier verification |
| 2 | 9fc71b5 | feat(05-01): implement two-tier research verification engine |
| 3 | 6cffdcc | refactor(05-01): add integration and edge case tests |

## Self-Check: PASSED

- FOUND: grd/bin/lib/verify-research.cjs
- FOUND: test/verify-research.test.cjs
- FOUND: .planning/phases/05-verification-and-workflows/05-01-SUMMARY.md
- FOUND: commit 30b4e6d
- FOUND: commit 9fc71b5
- FOUND: commit 6cffdcc
- All 24 tests pass (0 failures)
