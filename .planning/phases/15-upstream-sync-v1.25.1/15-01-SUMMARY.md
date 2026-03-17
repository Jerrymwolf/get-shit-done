---
phase: 15-upstream-sync-v1.25.1
plan: 01
subsystem: tooling
tags: [core, config, cli, spawnSync, model-profiles]

requires: []
provides:
  - "core.cjs with spawnSync-based execGit and milestone scoping functions"
  - "config.cjs with VALID_CONFIG_KEYS, ensureConfigFile, setConfigValue, cmdConfigSetModelProfile"
  - "gsd-r-tools.cjs with config-set-model-profile wired to real implementation"
affects: [15-02, 15-03, 15-04, 15-05]

tech-stack:
  added: []
  patterns:
    - "spawnSync for git operations (no shell escaping needed)"
    - "Extracted reusable helpers (ensureConfigFile, setConfigValue) from command functions"
    - "VALID_CONFIG_KEYS Set for config key validation"

key-files:
  created: []
  modified:
    - "get-shit-done-r/bin/lib/core.cjs"
    - "get-shit-done-r/bin/lib/config.cjs"
    - "get-shit-done-r/bin/gsd-r-tools.cjs"

key-decisions:
  - "Preserved GSD-R config keys (vault_path, commit_research) in VALID_CONFIG_KEYS Set"
  - "Removed opus-to-inherit mapping to match upstream v1.25.1 behavior"

patterns-established:
  - "Upstream sync pattern: diff upstream vs fork, apply changes, preserve GSD-R extensions"

requirements-completed: [SYNC-01]

duration: 3min
completed: 2026-03-17
---

# Phase 15 Plan 01: Core and Config Upstream Sync Summary

**core.cjs synced to spawnSync-based execGit, config.cjs rewritten with key validation and model profile command, CLI stub eliminated**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-17T19:26:39Z
- **Completed:** 2026-03-17T19:29:23Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Replaced execGit shell-escaping execSync with spawnSync array-based invocation
- Removed opus-to-inherit mapping in resolveModelInternal to match upstream v1.25.1
- Rewrote config.cjs to upstream structure: VALID_CONFIG_KEYS, ensureConfigFile, setConfigValue, cmdConfigSetModelProfile
- Wired config-set-model-profile command in gsd-r-tools.cjs, eliminating the stub

## Task Commits

Each task was committed atomically:

1. **Task 1: Sync core.cjs with v1.25.1 upstream** - `e3ac944` (feat)
2. **Task 2: Sync config.cjs with v1.25.1 upstream and wire in gsd-r-tools.cjs** - `fa65ecd` (feat)

## Files Created/Modified
- `get-shit-done-r/bin/lib/core.cjs` - execGit uses spawnSync, opus passes through in resolveModelInternal
- `get-shit-done-r/bin/lib/config.cjs` - Full rewrite matching upstream with GSD-R key extensions
- `get-shit-done-r/bin/gsd-r-tools.cjs` - config-set-model-profile routed to real implementation

## Decisions Made
- Preserved GSD-R config keys (vault_path, commit_research) in VALID_CONFIG_KEYS Set alongside upstream keys
- Removed opus-to-inherit mapping to match upstream -- opus now passes through as-is
- Kept isGitIgnored using execSync (matches upstream, separate from execGit)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- core.cjs and config.cjs now at v1.25.1 baseline
- Ready for Plan 02 (state.cjs sync) which depends on these foundation modules
- All 164 existing tests continue to pass

---
*Phase: 15-upstream-sync-v1.25.1*
*Completed: 2026-03-17*
