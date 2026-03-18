---
phase: 01-fork-and-foundation
plan: 01
subsystem: infra
tags: [fork, npm, rename, cli, meta-prompting]

# Dependency graph
requires: []
provides:
  - "Fully renamed GRD repository with 150 files, zero stale gsd references"
  - "commands/grd/ with 32 command files, all using /grd: namespace"
  - "agents/ with 12 grd-* agent files"
  - "grd/bin/grd-tools.cjs entry point"
  - "package.json named grd v0.1.0 ready for npm"
  - "Rename script (scripts/rename-gsd-to-grd.cjs) for reproducibility"
  - "Verification script (scripts/verify-rename.cjs) for rename completeness"
affects: [01-02, 01-03, all-future-phases]

# Tech tracking
tech-stack:
  added: [node-cjs, esbuild, c8]
  patterns: [grd-namespace, protect-upstream-urls-during-rename, longest-first-replacement-order]

key-files:
  created:
    - scripts/rename-gsd-to-grd.cjs
    - scripts/verify-rename.cjs
  modified:
    - package.json
    - bin/install.js
    - commands/grd/ (32 files)
    - agents/grd-*.md (12 files)
    - grd/ (all runtime files)

key-decisions:
  - "Used protect-and-restore pattern for upstream URLs during rename to avoid corrupting GitHub references"
  - "Renamed gsd_state_version to grd_state_version (clean fork, no backward compat needed)"
  - "Updated all file.startsWith('gsd-') to 'grd-' in install.js for clean namespace separation"
  - "Used concatenation in rename script to prevent self-modification on re-run"

patterns-established:
  - "Namespace: all /grd:* commands, grd-* agents, grd/ directory"
  - "Upstream URL preservation: gsd-build/get-shit-done URLs kept intact throughout codebase"
  - "Scripted rename with verification: always use scripts/verify-rename.cjs after any bulk changes"

requirements-completed: [FORK-01, FORK-02, FORK-03]

# Metrics
duration: 7min
completed: 2026-03-11
---

# Phase 1 Plan 1: Clone and Rename Summary

**Cloned upstream GSD v1.22.4 (148 files) and renamed all 1071+ gsd references to grd with scripted replacement, zero stale references remaining**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-11T14:00:30Z
- **Completed:** 2026-03-11T14:07:46Z
- **Tasks:** 2
- **Files modified:** 150

## Accomplishments
- Cloned upstream GSD repo and copied all 148 files into project structure
- Renamed all directories (commands/gsd/ -> grd/, get-shit-done/ -> grd/), all 12 agent files, and gsd-tools.cjs
- Applied 1071+ string replacements across 114 files with upstream URL protection
- Updated package.json to grd v0.1.0 with correct bin, files, keywords, author
- Fixed 6 install.js agent cleanup patterns from 'gsd-' to 'grd-' and updated banner text
- npm pack --dry-run produces 147-file tarball at 1.3MB

## Task Commits

Each task was committed atomically:

1. **Task 1: Clone upstream GSD and create rename script** - `7fbc416` (feat)
2. **Task 2: Update package.json and verify npm pack** - `f9a0c8f` (feat)

## Files Created/Modified
- `scripts/rename-gsd-to-grd.cjs` - Node.js rename script with upstream URL protection and longest-first replacement ordering
- `scripts/verify-rename.cjs` - Verification script that greps for stale gsd references across all project files
- `package.json` - Updated name, version, bin, files, keywords, author, engines for GRD
- `bin/install.js` - Fixed 6 agent file prefix patterns, updated banner text
- `commands/grd/*.md` - 32 renamed command files with /grd: namespace
- `agents/grd-*.md` - 12 renamed agent files
- `grd/bin/grd-tools.cjs` - Renamed tools entry point
- `grd/**` - All runtime files with updated references

## Decisions Made
- Used protect-and-restore pattern for upstream URLs: temporarily replace `gsd-build/get-shit-done` with markers before applying string replacements, then restore. This prevents corrupting GitHub URLs.
- Renamed `gsd_state_version` to `grd_state_version` since this is a clean fork with no backward compatibility requirements.
- Used string concatenation in rename script constants (e.g., `'gsd' + '-executor'`) to prevent the script from modifying itself when run.
- Updated all 6 `file.startsWith('gsd-')` patterns in install.js to `grd-` for proper namespace isolation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Rename script self-modification**
- **Found during:** Task 1 (running rename script)
- **Issue:** The rename script modified its own source code because it contained `gsd-` strings that matched replacement patterns
- **Fix:** Rewrote both scripts using string concatenation for pattern constants (e.g., `'gsd' + '-executor'`) so they are not affected by string replacements
- **Files modified:** scripts/rename-gsd-to-grd.cjs, scripts/verify-rename.cjs
- **Verification:** verify-rename.cjs passes after rewrite
- **Committed in:** 7fbc416 (Task 1 commit)

**2. [Rule 1 - Bug] Verification script false positives after rename**
- **Found during:** Task 1 (running verification)
- **Issue:** The verification script's stale-pattern checks were modified by the rename script, causing it to flag correctly-renamed strings as stale (531 false positives)
- **Fix:** Rewrote verification script with smarter pattern matching: check for `gsd-SUFFIX` NOT preceded by `grd-SUFFIX`, using occurrence counting to distinguish stale from renamed
- **Files modified:** scripts/verify-rename.cjs
- **Verification:** Script correctly reports PASS with zero stale references
- **Committed in:** 7fbc416 (Task 1 commit)

**3. [Rule 1 - Bug] package.json not fully renamed by script**
- **Found during:** Task 2 (package.json inspection)
- **Issue:** package.json still had name `get-shit-done-cc`, old version, old author, old files array because the upstream URL protection was too aggressive (the `glittercowboy/get-shit-done` URLs in repository/homepage/bugs fields triggered URL protection for the whole file context)
- **Fix:** Manually rewrote package.json per the plan specification
- **Files modified:** package.json
- **Verification:** `node -p` confirms name/bin fields, npm pack succeeds
- **Committed in:** f9a0c8f (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (3 bugs)
**Impact on plan:** All fixes necessary for correctness. The self-modification issue is inherent to scripted rename approaches and was resolved by using string concatenation in constants.

## Issues Encountered
- The rename script's upstream URL protection pattern (`gsd-build/get-shit-done`) was too broad and prevented some legitimate replacements in package.json. Resolved by manually updating package.json in Task 2.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- GRD directory structure is complete and verified
- Ready for 01-02 (Git LFS configuration, research templates, reference files)
- Ready for 01-03 (vault.cjs module creation)
- All /grd:* commands are in place for future development

## Self-Check: PASSED

All claimed files verified on disk. Both commits (7fbc416, f9a0c8f) verified in git log.

---
*Phase: 01-fork-and-foundation*
*Completed: 2026-03-11*
