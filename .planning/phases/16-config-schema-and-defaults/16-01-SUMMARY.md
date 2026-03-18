---
phase: 16-config-schema-and-defaults
plan: 01
subsystem: config
tags: [config-schema, smart-defaults, review-type, tdd, cjs]

# Dependency graph
requires:
  - phase: 15-upstream-sync
    provides: synced config.cjs with VALID_CONFIG_KEYS and existing exports
provides:
  - SMART_DEFAULTS lookup table for all 5 review types
  - REVIEW_TYPE_ORDER array for downgrade validation
  - configWithDefaults() deep-merge function for backward compatibility
  - applySmartDefaults() for review type change resets
  - canDowngrade() for downgrade-only enforcement
  - Extended VALID_CONFIG_KEYS with 6 new config paths
affects: [16-02, 18-new-research-scoping, 19-plan-checker-rigor, 20-settings-downgrade]

# Tech tracking
tech-stack:
  added: []
  patterns: [smart-defaults-lookup-table, deep-merge-with-backward-compat, downgrade-only-validation]

key-files:
  created: [test/config-schema.test.cjs]
  modified: [grd/bin/lib/config.cjs]

key-decisions:
  - "SMART_DEFAULTS as lookup table, not computed function -- single source of truth"
  - "configWithDefaults() backward compat: boolean plan_check true converts to 'moderate', false stays false"
  - "applySmartDefaults() clones workflow object to avoid mutating input config"

patterns-established:
  - "Smart defaults lookup: SMART_DEFAULTS[reviewType] returns 4-field object for workflow toggles"
  - "Two merge semantics: configWithDefaults (user wins) vs applySmartDefaults (smart defaults win)"

requirements-completed: [CFG-01, CFG-02, CFG-03, CFG-04, CFG-05, CFG-06, CFG-07, TEST-04]

# Metrics
duration: 2min
completed: 2026-03-18
---

# Phase 16 Plan 01: Config Schema and Defaults Summary

**SMART_DEFAULTS lookup table with configWithDefaults() deep-merge, applySmartDefaults() reset, and canDowngrade() validation for 5 review types**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-18T00:19:07Z
- **Completed:** 2026-03-18T00:20:48Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- SMART_DEFAULTS lookup table with all 5 review types matching spec exactly
- configWithDefaults() handles empty, partial, and full configs with backward compat for boolean plan_check
- applySmartDefaults() resets 4 smart-default keys while preserving all other workflow keys
- canDowngrade() enforces downgrade-only rule using REVIEW_TYPE_ORDER
- 28 new tests covering all requirements, 192 total tests green with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Write failing tests for config schema** - `37d6b2f` (test)
2. **Task 2: Implement config schema infrastructure** - `5b6624e` (feat)

_TDD approach: RED (28 failing tests) then GREEN (all pass)_

## Files Created/Modified
- `test/config-schema.test.cjs` - 28 unit tests across 5 describe blocks covering all config schema requirements
- `grd/bin/lib/config.cjs` - Added SMART_DEFAULTS, REVIEW_TYPE_ORDER, configWithDefaults, applySmartDefaults, canDowngrade + extended VALID_CONFIG_KEYS

## Decisions Made
- Implemented SMART_DEFAULTS as a constant lookup table (not computed) per RESEARCH.md recommendation
- Boolean plan_check backward compat: `true` maps to `'moderate'`, `false` stays as `false` (disabled)
- applySmartDefaults() clones both config and workflow objects to guarantee no mutation of input

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Config schema infrastructure complete, ready for 16-02 (loadConfig extension, templates, settings workflow)
- All 5 new exports available for downstream phases (18, 19, 20, 21)
- No blockers

---
*Phase: 16-config-schema-and-defaults*
*Completed: 2026-03-18*
