---
phase: 25-upstream-sync-to-v1-28-0
plan: 06
subsystem: templates
tags: [sync, templates, version, workstreams, config]

requires:
  - phase: 25-05
    provides: Synced workflows and command files
provides:
  - 12 shared templates synced with upstream v1.28.0 changes
  - 4 new upstream templates adopted (claude-md.md, dev-preferences.md, discussion-log.md, user-profile.md)
  - New workstreams.md command adopted with GRD namespace
  - VERSION stamped at 1.28.0
  - 4 GRD research agents verified intact
affects: [rename-workstream, command-vocabulary, docs]

tech-stack:
  added: []
  patterns: [template-merge-upstream-wins-research-preserved]

key-files:
  created:
    - grd/templates/claude-md.md
    - grd/templates/dev-preferences.md
    - grd/templates/discussion-log.md
    - grd/templates/user-profile.md
    - commands/gsd-r/workstreams.md
  modified:
    - grd/templates/UAT.md
    - grd/templates/config.json
    - grd/templates/context.md
    - grd/templates/phase-prompt.md
    - grd/VERSION
    - test/model-profiles.test.cjs

key-decisions:
  - "GRD research templates (research.md, project.md, requirements.md, roadmap.md, state.md) kept as-is -- upstream structural changes not applicable to research-oriented versions"
  - "UAT.md synced with upstream partial status, blocked result type additions"
  - "config.json template gains firecrawl and exa_search keys alongside research keys"
  - "GSD marker prefix changed to GRD in claude-md.md template"
  - "commands/gsd-r/ namespace leaks are pre-existing and deferred to rename workstream"

patterns-established:
  - "Research template preservation: when upstream restructures templates that GRD has customized for research, keep GRD version"

requirements-completed: [SYNC-03, SYNC-04, SYNC-05, SYNC-06]

duration: 5min
completed: 2026-03-23
---

# Phase 25 Plan 06: Template Sync, Version Stamp, and Final Validation Summary

**Synced 12 shared templates with upstream v1.28.0, adopted 4 new templates and workstreams command, verified agents intact, stamped VERSION 1.28.0 with 513/514 tests passing**

## What Was Done

### Task 1: Sync templates and adopt new command file
Synced 12 shared templates with upstream changes while preserving GRD research-specific templates. Key syncs:
- **UAT.md**: Added `partial` status, `blocked` result type, partial completion lifecycle from upstream
- **context.md**: Added D-01/D-02 decision numbering pattern
- **config.json template**: Added `firecrawl` and `exa_search` config sections from upstream, preserved all GRD research keys
- **phase-prompt.md**: Updated checkpoint comment text

Adopted 4 new upstream templates with GRD namespace applied:
- `claude-md.md` -- CLAUDE.md generation with GRD markers
- `dev-preferences.md` -- Developer preferences template
- `discussion-log.md` -- Discussion audit trail template
- `user-profile.md` -- Developer profiling template

Adopted `workstreams.md` command with full GRD namespace (`/grd:`, `$GRD_TOOLS`, `$GRD_WS`).

Verified all 4 GRD research agents intact: grd-argument-constructor, grd-framework-integrator, grd-gap-analyzer, grd-thematic-synthesizer.

**Commit:** d45e1e0

### Task 2: Update VERSION file and run final validation
Updated `grd/VERSION` from `1.25.1` to `1.28.0`. Updated the version test expectation. Verified all 5 new CJS modules load cleanly (security, uat, workstream, profile-output, profile-pipeline). Zero `get-shit-done` leaks in grd/bin/lib/, grd/workflows/, grd/templates/. 513 of 514 tests pass (1 known pre-existing namespace fail in .planning/ files).

**Commit:** cb6ca65

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated VERSION test expectation**
- **Found during:** Task 2
- **Issue:** Test `model-profiles.test.cjs` hardcoded `1.25.1` expectation for VERSION file
- **Fix:** Updated assertion to expect `1.28.0`
- **Files modified:** test/model-profiles.test.cjs
- **Commit:** cb6ca65

### Scope Note
The plan's acceptance criterion "grep -rl get-shit-done ... outputs 0" includes `commands/gsd-r/` which has 34 pre-existing `get-shit-done-r` references from v1.1. These are NOT caused by this plan and are deferred to the rename workstream. The directories this plan actually modified (grd/bin/lib, grd/workflows, grd/templates) have zero leaks.

## Verification Results

- `cat grd/VERSION` = `1.28.0`
- 5 new CJS modules load cleanly
- 0 `get-shit-done` leaks in grd/bin/lib, grd/workflows, grd/templates
- 513/514 tests pass (SYNC-06 satisfied)
- 4 agent files verified present (SYNC-03 satisfied)
- Templates synced with research content preserved (SYNC-04 satisfied)
- VERSION = 1.28.0 (SYNC-05 satisfied)

## Self-Check: PASSED

All 10 files verified present. Both commits (d45e1e0, cb6ca65) confirmed in git history.
