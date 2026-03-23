---
phase: 26-rename-gsd-r-to-grd
plan: 02
subsystem: namespace
tags: [content-replacement, install.js, package.json, gitignore, namespace-test]

# Dependency graph
requires:
  - "26-01: file and directory renames complete"
provides:
  - "Zero GSD-R/gsd-r/get-shit-done-r content references in active files"
  - "GRD_ marker constants in install.js"
  - "Updated package.json with get-research-done name and grd files entry"
  - "Updated .gitignore with grd-* patterns"
  - "Namespace and state tests passing"
affects:
  - "All 54 active files across agents/, commands/, grd/workflows/, bin/, docs/"
  - "test/namespace.test.cjs and test/state.test.cjs"

# Tech stack
added: []
patterns:
  - "6-pass bulk sed replacement (most-specific to least-specific per D-02)"
  - "Explicit install.js marker constant renames (GSD_ -> GRD_)"

# Key files
created: []
modified:
  - "54 files via bulk content replacement"
  - "bin/install.js (marker constants + codexGrdPath)"
  - ".gitignore (grd-* patterns)"
  - "package.json (name: get-research-done, files: grd)"
  - "test/namespace.test.cjs (expanded .planning/ exclusion filter)"
  - "test/state.test.cjs (fixed bulk-rename damage to negative assertions)"

# Decisions
decisions:
  - "package.json name set to get-research-done (npm package name), bin key also get-research-done"
  - "Bare gsd- agent refs in CODEX_AGENT_SANDBOX left as upstream (not gsd-r- pattern, excluded from scope)"
  - "PLAN.md files added to namespace test exclusion list (planning docs contain historical refs)"
  - "state.test.cjs negative assertions fixed to check old gsd_state_version key, not new grd_state_version"

# Metrics
duration: 6min
completed: "2026-03-23"
tasks: 2
files: 56
---

# Phase 26 Plan 02: Bulk Content Replacement and Test Fixes Summary

6-pass content replacement eliminating all GSD-R string references from 54 active files, plus install.js marker constant renames, config file updates, and namespace/state test fixes for zero failures.

## What Was Done

### Task 1: Bulk content replacement + install.js internals + config files (90cd5b8)

Executed 6 replacement passes in spec D-02 order (most-specific to least-specific):

1. `/gsd-r:` -> `/grd:` (command prefix)
2. `GSD-R` -> `GRD` (branded name)
3. `get-shit-done-r` -> `grd` (package/path refs)
4. `gsd-r-tools.cjs` -> `grd-tools.cjs` (tool binary)
5. `gsd_state_version` -> `grd_state_version` (state key)
6. `gsd-r-` -> `grd-` (agent prefix)

Install.js explicit renames:
- `GSD_CODEX_MARKER` -> `GRD_CODEX_MARKER` (5 occurrences)
- `GSD_COPILOT_INSTRUCTIONS_MARKER` -> `GRD_COPILOT_INSTRUCTIONS_MARKER` (5 occurrences)
- `GSD_COPILOT_INSTRUCTIONS_CLOSE_MARKER` -> `GRD_COPILOT_INSTRUCTIONS_CLOSE_MARKER` (6 occurrences)
- String literal values updated: `# GRD Agent Configuration`, `<!-- GRD Configuration`
- `codexGsdPath` -> `codexGrdPath` (3 occurrences)

Config files:
- `.gitignore`: `gsd-*` -> `grd-*`, `get-shit-done` -> `grd` in GitHub patterns
- `package.json`: name set to `get-research-done`, bin key to `get-research-done`, files array entry to `grd`

### Task 2: Fix namespace test and verify all tests pass (54856de)

- Expanded namespace.test.cjs `.planning/` tree exclusion filter to cover: REQUIREMENTS.md, ROADMAP.md, CONTEXT.md, RESEARCH.md, DISCUSSION-LOG.md, VALIDATION.md, PLAN.md, config.json
- Fixed state.test.cjs negative assertions damaged by bulk rename: restored checks for old `gsd_state_version` key absence (bulk pass 5 had incorrectly converted the negative assertion target)
- 514 tests pass, zero failures

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed bulk-rename damage to state.test.cjs negative assertions**
- **Found during:** Task 2
- **Issue:** Bulk pass 5 changed `gsd_state_version` to `grd_state_version` in negative assertions (lines 467, 479), making them assert that the NEW key doesn't exist (always fails)
- **Fix:** Restored negative assertions to check for old `gsd_state_version` key
- **Files modified:** test/state.test.cjs
- **Commit:** 54856de

**2. [Rule 1 - Bug] Added PLAN.md to namespace test exclusion list**
- **Found during:** Task 2
- **Issue:** Plan files in .planning/phases/ naturally contain `get-shit-done-r` as historical references in spec citations
- **Fix:** Added `!h.endsWith('-PLAN.md')` to exclusion filter (beyond the plan's listed exclusions)
- **Files modified:** test/namespace.test.cjs
- **Commit:** 54856de

## Known Stubs

None -- all content replacement is complete.

## Verification Results

- `grep -r "gsd-r"` (excluding false positives from gsd-research/gsd-roadmapper/gsd-reapply): 0 hits
- `grep -r "GSD-R"`: 0 hits
- `grep -r "get-shit-done-r"`: 0 hits
- `GRD_CODEX_MARKER` in install.js: 5 occurrences
- `GSD_CODEX_MARKER` in install.js: 0 (eliminated)
- `codexGrdPath` in install.js: 3 occurrences
- `codexGsdPath` in install.js: 0 (eliminated)
- package.json files array: `"grd"` present
- .gitignore: `grd-*` patterns present, `gsd-*` eliminated
- npm test: 514 pass, 0 fail

## Self-Check: PASSED
