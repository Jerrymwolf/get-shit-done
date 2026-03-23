---
phase: 25-upstream-sync-to-v1-28-0
plan: 01
subsystem: core
tags: [upstream-sync, security, core, v1.28.0]

requires:
  - phase: none
    provides: first plan in v1.3 sync
provides:
  - "security.cjs with 9 security exports (validatePath, scanForInjection, sanitizeForPrompt, etc.)"
  - "core.cjs with 18 new upstream exports (planningDir, planningPaths, normalizeMd, extractCurrentMilestone, etc.)"
  - "All existing core.cjs exports preserved"
affects: [25-02, 25-03, 25-04, 25-05, 25-06]

tech-stack:
  added: [execFileSync for shell-safe git operations]
  patterns: [fs.writeSync(1,...) for reliable pipe output, workstream-aware planning paths, file-based locking]

key-files:
  created: [grd/bin/lib/security.cjs]
  modified: [grd/bin/lib/core.cjs, test/state.test.cjs, test/e2e.test.cjs]

key-decisions:
  - "Preserve GRD research-specific loadConfig fields (SMART_DEFAULTS, review_type, epistemological_stance) while syncing all upstream additions"
  - "Update test captureCmd helpers to intercept fs.writeSync(1,...) matching upstream output() pattern change"
  - "Use Unicode escapes for emoji in regex patterns for cross-platform safety"

patterns-established:
  - "fs.writeSync(1, data) for output: upstream pattern prevents process.exit race condition on pipe writes"
  - "execFileSync for git shell commands: prevents command injection via crafted path names"

requirements-completed: [SYNC-01]

duration: 12min
completed: 2026-03-23
---

# Phase 25 Plan 01: Foundation Module Sync Summary

**Synced security.cjs (9 exports) and core.cjs (18 new exports) from upstream v1.28.0, preserving GRD research-specific config**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-23T03:07:52Z
- **Completed:** 2026-03-23T03:19:31Z
- **Tasks:** 2/2
- **Files modified:** 4

## Accomplishments

### Task 1: Adopt security.cjs from upstream
- Copied upstream security.cjs as new file (standalone, no GRD-specific changes needed)
- All 9 exports verified: validatePath, requireSafePath, INJECTION_PATTERNS, scanForInjection, sanitizeForPrompt, validateShellArg, safeJsonParse, validatePhaseNumber, validateFieldName
- **Commit:** 8b08e82

### Task 2: Sync core.cjs with upstream v1.28.0
- Added 18 new functions/constants from upstream delta
- Key additions: planningDir/planningPaths (workstream-aware), normalizeMd (markdown linting), extractCurrentMilestone (positive-lookup scoping), withPlanningLock (concurrency), detectSubRepos/findProjectRoot (multi-repo), MODEL_ALIAS_MAP, filterPlanFiles/filterSummaryFiles/getPhaseFileStats/readSubdirectories (phase helpers)
- Updated existing functions: output() to fs.writeSync pattern, isGitIgnored to execFileSync, loadConfig with sub_repos auto-sync and new defaults, searchPhaseInDir/findPhaseInternal to use readSubdirectories/getPhaseFileStats
- Preserved all GRD research-specific config: SMART_DEFAULTS integration, researcher_tier, review_type, epistemological_stance, plan_check, critical_appraisal, temporal_positioning, synthesis
- **Commit:** ff4019c

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test captureCmd helpers for upstream output() change**
- **Found during:** Task 2
- **Issue:** Upstream output() changed from process.stdout.write() to fs.writeSync(1,...) for reliable pipe writes. This broke test helpers that captured output by overriding process.stdout.write.
- **Fix:** Updated captureCmd in test/state.test.cjs and test/e2e.test.cjs to also intercept fs.writeSync on fd 1 and fd 2.
- **Files modified:** test/state.test.cjs, test/e2e.test.cjs
- **Commit:** ff4019c (included in Task 2 commit)

## Verification

- security.cjs: All 9 exports present, loads without error
- core.cjs: All 18 new exports present, all existing exports preserved
- Test suite: 514 tests, 513 pass, 1 fail (pre-existing namespace test)

## Known Stubs

None -- both modules are fully functional with all upstream code synced.
