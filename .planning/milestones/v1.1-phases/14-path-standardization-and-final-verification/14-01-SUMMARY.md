---
phase: 14-path-standardization-and-final-verification
plan: 01
subsystem: tooling
tags: [verify-rename, path-standardization, sed, regex]

requires:
  - phase: 01-fork-and-foundation
    provides: verify-rename.cjs base script with checks 1-6
provides:
  - Extended verify-rename.cjs with $HOME and ~ path detection (checks 7-8)
  - All markdown files with absolute paths instead of $HOME/~ references
affects: [14-02, final-verification]

tech-stack:
  added: []
  patterns: [absolute-path-references, verify-rename-checks]

key-files:
  created: []
  modified:
    - scripts/verify-rename.cjs
    - agents/*.md (14 files)
    - commands/gsd-r/*.md (27 files)
    - get-shit-done-r/workflows/*.md
    - get-shit-done-r/references/*.md
    - get-shit-done-r/templates/*.md

key-decisions:
  - "Narrowed Check 7 regex from /\\$HOME/ to /\\$HOME\\/\\.claude/ to avoid false positives on runtime shell variables"
  - "Kept $HOME in reapply-patches.md and update.md -- these are runtime shell variables for non-.claude paths"

patterns-established:
  - "All .md files use absolute paths /Users/jeremiahwolf/.claude/ instead of $HOME or ~"

requirements-completed: [PATH-01, PATH-03]

duration: 9min
completed: 2026-03-16
---

# Phase 14 Plan 01: Path Standardization Summary

**Extended verify-rename.cjs with $HOME/~ detection and replaced all ~357 stale path references across 70+ markdown files with absolute paths**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-16T14:00:02Z
- **Completed:** 2026-03-16T14:09:08Z
- **Tasks:** 2
- **Files modified:** 70+

## Accomplishments
- Added Check 7 ($HOME/.claude detection) and Check 8 (~/.claude detection) to verify-rename.cjs
- Added install.js to EXCLUDE_BASENAMES to prevent false positives on runtime shell variables
- Replaced ~224 $HOME/.claude/ and ~133 ~/.claude/ references with absolute paths across all target directories
- Zero stale path references remain in any markdown file

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend verify-rename.cjs with $HOME and ~ path detection** - `25e7852` (feat)
2. **Task 2: Replace all $HOME and ~/ path references in markdown files** - `6f6a2e7` (fix)

## Files Created/Modified
- `scripts/verify-rename.cjs` - Added checks 7-8 for $HOME/.claude and ~/.claude detection, install.js exclusion
- `agents/*.md` (14 files) - Replaced $HOME and ~ path references with absolute paths
- `commands/gsd-r/*.md` (27 files) - Replaced $HOME and ~ path references with absolute paths
- `get-shit-done-r/workflows/*.md` - Replaced $HOME and ~ path references with absolute paths
- `get-shit-done-r/references/*.md` - Replaced $HOME and ~ path references with absolute paths
- `get-shit-done-r/templates/*.md` - Replaced $HOME and ~ path references with absolute paths

## Decisions Made
- Narrowed Check 7 regex from `/\$HOME/` to `/\$HOME\/\.claude/` to avoid false positives on legitimate runtime shell variables (e.g., `$HOME/.config/opencode` in reapply-patches.md, `$HOME/$dir` in update.md)
- Kept $HOME references in reapply-patches.md and update.md where they are genuine runtime shell variables for non-.claude paths

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Narrowed Check 7 regex to avoid false positives**
- **Found during:** Task 2 (path replacement)
- **Issue:** Check 7 with `/\$HOME/` flagged runtime shell variables in reapply-patches.md and update.md that use $HOME for non-.claude paths (.config/opencode, .opencode, .gemini, $dir)
- **Fix:** Changed regex from `/\$HOME/` to `/\$HOME\/\.claude/` to only detect actual stale path references
- **Files modified:** scripts/verify-rename.cjs
- **Verification:** verify-rename.cjs reports 0 stale $HOME hits after replacement
- **Committed in:** 6f6a2e7 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Necessary to avoid false positives. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Path standardization complete for all target directories
- Ready for 14-02 final verification pass

---
*Phase: 14-path-standardization-and-final-verification*
*Completed: 2026-03-16*
