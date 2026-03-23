---
phase: 25-upstream-sync-to-v1-28-0
plan: 02
subsystem: core
tags: [upstream-sync, config, init, state, phase, commands, v1.28.0]

requires:
  - phase: 25-01
    provides: "core.cjs with planningDir/planningPaths/normalizeMd/extractCurrentMilestone, security.cjs with validatePath/sanitizeForPrompt"
provides:
  - "config.cjs with upstream keys (firecrawl, exa_search, workflow.*, hooks.*) + GRD SMART_DEFAULTS preserved"
  - "init.cjs with sub-repo support, ROADMAP fallback, workspace commands, grd-* namespace preserved"
  - "state.cjs with stateReplaceFieldWithFallback, security validation, file locking, cmdStateBeginPhase/cmdSignalWaiting/Resume"
  - "phase.cjs with planningDir migration, extractCurrentMilestone, readSubdirectories import"
  - "commands.cjs with sanitizeForPrompt, noVerify, cmdCommitToSubrepo, cmdTodoMatchPhase, planningDir migration"
affects: [25-03, 25-04, 25-05, 25-06]

tech-stack:
  added: []
  patterns: [planningDir(cwd) replacing hardcoded .planning/ paths, stateReplaceFieldWithFallback for field updates with fallback, file-based locking for STATE.md writes, sanitizeForPrompt for commit message safety]

key-files:
  created: []
  modified: [grd/bin/lib/config.cjs, grd/bin/lib/init.cjs, grd/bin/lib/state.cjs, grd/bin/lib/phase.cjs, grd/bin/lib/commands.cjs]

key-decisions:
  - "Preserve GRD research config (SMART_DEFAULTS, configWithDefaults, applySmartDefaults, vault_path, researcher_tier, review_type, epistemological_stance) in config.cjs while adopting all upstream improvements"
  - "Keep grd-* agent names (grd-executor, grd-verifier, etc.) in init.cjs, not upstream gsd-* names"
  - "Resolve tech debt D-11: removed duplicate stateExtractField from state.cjs, using upstream's escapeRegex-based version"
  - "Add upstream's file-based locking (O_EXCL + lockfile) for STATE.md writes to prevent parallel agent corruption"

patterns-established:
  - "planningDir(cwd) migration: all 5 modules now use planningDir(cwd) instead of hardcoded path.join(cwd, '.planning')"
  - "stateReplaceFieldWithFallback: consolidated pattern for state field replacement with fallback field name"

requirements-completed: [SYNC-01]

duration: 17min
completed: 2026-03-23
---

# Phase 25 Plan 02: High-Conflict Module Sync Summary

**Synced 5 HIGH-conflict CJS modules (config, init, state, phase, commands) from upstream v1.28.0, preserving GRD research extensions and resolving tech debt D-11**

## Performance

- **Duration:** 17 min
- **Started:** 2026-03-23T03:21:17Z
- **Completed:** 2026-03-23T03:39:07Z
- **Tasks:** 2/2
- **Files modified:** 5

## Accomplishments

### Task 1: Sync config.cjs, init.cjs, and state.cjs (highest-conflict modules)

- **config.cjs:** Added upstream planningRoot import, new VALID_CONFIG_KEYS (firecrawl, exa_search, workflow.auto_advance, workflow.node_repair, etc.), buildNewProjectConfig, cmdConfigNewProject, CONFIG_KEY_SUGGESTIONS updates. Preserved GRD SMART_DEFAULTS, configWithDefaults, applySmartDefaults, canDowngrade, research keys.
- **init.cjs:** Added getLatestCompletedMilestone, withProjectRoot, ROADMAP fallback phase resolution, sub_repos/context_window in init output, planningDir/planningPaths migration, workspace commands (cmdInitManager, cmdInitNewWorkspace, cmdInitListWorkspaces, cmdInitRemoveWorkspace), detectChildRepos. Preserved grd-* agent names and research config fields.
- **state.cjs:** Added getStatePath, upstream stateExtractField (using escapeRegex), stateReplaceFieldWithFallback, security validation (validatePath, validateFieldName), normalizeMd in writeStateMd, file-based locking for parallel safety, compound Plan format support, cmdStateBeginPhase, cmdSignalWaiting, cmdSignalResume. Removed duplicate stateExtractField (tech debt D-11). Preserved GRD research extensions (Note Status, Source Gaps).
- **Commit:** 8696686

### Task 2: Sync phase.cjs and commands.cjs

- **phase.cjs:** Updated imports (loadConfig, extractCurrentMilestone, planningDir, readSubdirectories, stateExtractField/stateReplaceField/stateReplaceFieldWithFallback). Replaced all hardcoded `.planning/` paths with planningDir(cwd). Replaced stripShippedMilestones with extractCurrentMilestone in cmdPhaseAdd/cmdPhaseInsert.
- **commands.cjs:** Updated imports (extractCurrentMilestone, planningDir, planningPaths, extractOneLinerFromBody, getRoadmapPhaseInternal, sanitizeForPrompt). Added null byte rejection, noVerify parameter, cmdCommitToSubrepo, cmdTodoMatchPhase. Replaced hardcoded paths with planningDir/planningPaths.
- **Commit:** 621a359

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- All 5 modules load without error
- config.cjs contains firecrawl in VALID_CONFIG_KEYS (new upstream)
- config.cjs contains vault_path in VALID_CONFIG_KEYS (research preserved)
- config.cjs contains SMART_DEFAULTS (research preserved)
- config.cjs contains configWithDefaults (research preserved)
- config.cjs contains applySmartDefaults (research preserved)
- init.cjs contains researcher_tier (research config preserved)
- init.cjs contains grd-executor (namespace preserved, NOT gsd-executor)
- init.cjs contains sub_repos (new upstream feature)
- state.cjs contains stateReplaceFieldWithFallback (new upstream function)
- state.cjs contains validatePath/validateFieldName usage (security integration)
- state.cjs has single stateExtractField definition (tech debt D-11 fixed)
- phase.cjs contains planningDir (path migration)
- phase.cjs contains extractCurrentMilestone (new function usage)
- phase.cjs contains readSubdirectories (new import)
- commands.cjs contains sanitizeForPrompt (security integration)
- commands.cjs contains noVerify (new parameter)
- commands.cjs contains planningDir/planningPaths (path migration)
- Test suite: 514 tests, 513 pass, 1 fail (pre-existing namespace test)

## Known Stubs

None -- all modules are fully functional with upstream code synced and research extensions preserved.
