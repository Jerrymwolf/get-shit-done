---
phase: 21-adaptive-communication
plan: 03
subsystem: workflows
tags: [tier-conditional, xml-blocks, adaptive-communication, researcher-tier, workflows]

# Dependency graph
requires:
  - phase: 21-adaptive-communication
    provides: stripTierContent() CJS utility for XML tier block stripping
provides:
  - Tier-conditional Next Up sections in all 6 key workflows
  - researcher_tier context blocks in 3 agent-facing workflows
  - Tier-adapted checkpoint gates (TRAP-02, TRAP-03)
  - Tier-adapted error messages in progress.md
  - Workflow content tests (completeness, agent context, content verification)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [tier-conditional XML blocks in workflow Next Up sections, researcher_tier agent context blocks, tier-adapted checkpoint descriptions]

key-files:
  created: []
  modified:
    - grd/workflows/new-research.md
    - grd/workflows/scope-inquiry.md
    - grd/workflows/plan-inquiry.md
    - grd/workflows/conduct-inquiry.md
    - grd/workflows/verify-inquiry.md
    - grd/workflows/progress.md
    - test/tier-strip.test.cjs

key-decisions:
  - "researcher_tier blocks placed inside agent spawn prompts (conduct, verify) and before downstream_consumer (plan)"
  - "Guided tier explains what each step does and why before offering the command"
  - "Expert tier shows command only -- no explanation, no description"
  - "Error messages in progress.md adapted (no planning structure error)"
  - "TRAP-02 and TRAP-03 checkpoint descriptions fully adapted by tier"

patterns-established:
  - "Workflow Next Up pattern: <tier-guided> explains + command, <tier-standard> brief + command, <tier-expert> command only"
  - "Agent context pattern: <researcher_tier> block with Communication Style heading and per-tier rules"
  - "Checkpoint pattern: guided explains options and consequences, expert shows terse options list"

requirements-completed: [TIER-01, TIER-03, TIER-04, TEST-06]

# Metrics
duration: 7min
completed: 2026-03-21
---

# Phase 21 Plan 03: Workflow Adaptation Summary

**Tier-conditional XML blocks in all 6 key workflows with adapted Next Up routing, checkpoint gates, error messages, and agent context blocks**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-21T19:02:25Z
- **Completed:** 2026-03-21T19:09:25Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- All 6 key workflows have tier-conditional Next Up sections (guided=explains, standard=brief, expert=command only)
- 3 agent-facing workflows (plan-inquiry, conduct-inquiry, verify-inquiry) have researcher_tier context blocks
- TRAP-02 (review type mismatch) and TRAP-03 (saturation gate) checkpoint descriptions adapt by tier
- Error messages in progress.md adapt by tier (no planning structure error)
- 88 tier-strip tests pass including 24 new workflow-specific tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Add tier-conditional blocks to all 6 key workflows** - `80f58e3` (feat)
2. **Task 2: Workflow content tests and full suite validation** - `40a8d2a` (test)

## Files Created/Modified
- `grd/workflows/new-research.md` - Tier-adapted Next Up section
- `grd/workflows/scope-inquiry.md` - Tier-adapted Next Up section
- `grd/workflows/plan-inquiry.md` - Tier-adapted Next Up, researcher_tier block, TRAP-02 gate
- `grd/workflows/conduct-inquiry.md` - Tier-adapted Next Up (gaps), researcher_tier block
- `grd/workflows/verify-inquiry.md` - Tier-adapted Next Up, researcher_tier block, saturation gate
- `grd/workflows/progress.md` - 6 tier-adapted Next Up sections, error message adaptation
- `test/tier-strip.test.cjs` - 24 new tests (workflow completeness, agent context, content verification)

## Decisions Made
- researcher_tier blocks placed inside agent spawn prompt sections for conduct-inquiry and verify-inquiry, before downstream_consumer for plan-inquiry
- Guided tier provides full explanations of what each step does and why it matters
- Expert tier strips to command only -- no description, no sub-text
- Progress.md error messages adapted for the "no planning structure" case
- Both TRAP-02 and TRAP-03 get full 3-tier adaptation (guided explains consequences, expert shows terse options)

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None -- no external service configuration required.

## Next Phase Readiness
- All 6 workflows fully tier-adapted, ready for end-to-end testing
- 88 tier-strip tests green (unit + template + workflow)
- Full suite 388/389 (1 pre-existing namespace test failure unrelated to this work)

---
*Phase: 21-adaptive-communication*
*Completed: 2026-03-21*

## Self-Check: PASSED
