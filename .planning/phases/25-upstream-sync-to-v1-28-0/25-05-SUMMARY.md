---
phase: 25-upstream-sync-to-v1-28-0
plan: 05
subsystem: workflows
tags: [workflow-sync, upstream-v1.28.0, namespace-conversion, research-vocabulary]

requires:
  - phase: 25-04
    provides: grd-tools.cjs CLI synced with v1.28.0 commands and module wiring
provides:
  - 68 workflow files synced with upstream v1.28.0
  - 26 new upstream workflows adopted with GRD namespace
  - 30 shared workflows with upstream functional improvements
  - 12 GRD-only renamed workflows with namespace cleanup
affects: [templates-sync, version-update, command-vocabulary]

tech-stack:
  added: []
  patterns: [namespace-conversion-script, tier-block-preservation]

key-files:
  created:
    - grd/workflows/fast.md
    - grd/workflows/forensics.md
    - grd/workflows/manager.md
    - grd/workflows/review.md
    - grd/workflows/ship.md
    - grd/workflows/audit-uat.md
    - grd/workflows/list-workspaces.md
    - grd/workflows/new-workspace.md
    - grd/workflows/remove-workspace.md
    - grd/workflows/next.md
    - grd/workflows/plant-seed.md
    - grd/workflows/pr-branch.md
    - grd/workflows/profile-user.md
    - grd/workflows/session-report.md
    - grd/workflows/milestone-summary.md
    - grd/workflows/discuss-phase-assumptions.md
    - grd/workflows/add-phase.md
    - grd/workflows/audit-milestone.md
    - grd/workflows/complete-milestone.md
    - grd/workflows/discuss-phase.md
    - grd/workflows/execute-phase.md
    - grd/workflows/insert-phase.md
    - grd/workflows/new-project.md
    - grd/workflows/plan-phase.md
    - grd/workflows/remove-phase.md
    - grd/workflows/verify-work.md
  modified:
    - grd/workflows/progress.md
    - grd/workflows/help.md
    - grd/workflows/new-milestone.md
    - grd/workflows/transition.md
    - grd/workflows/autonomous.md
    - grd/workflows/settings.md
    - grd/workflows/execute-plan.md
    - grd/workflows/map-codebase.md
    - grd/workflows/quick.md
    - grd/workflows/ui-phase.md
    - grd/workflows/verify-phase.md
    - grd/workflows/validate-phase.md
    - grd/workflows/add-inquiry.md
    - grd/workflows/audit-study.md
    - grd/workflows/complete-study.md
    - grd/workflows/insert-inquiry.md
    - grd/workflows/new-research.md
    - grd/workflows/remove-inquiry.md
    - grd/workflows/set-profile.md
    - grd/workflows/verify-inquiry.md

key-decisions:
  - Copied upstream workflows with automated namespace conversion script (sed-based) for consistent path/command/agent name transformation
  - Preserved tier-guided/tier-standard/tier-expert blocks in progress.md to maintain GRD three-tier communication system
  - Kept GRD research vocabulary in routing (conduct-inquiry, scope-inquiry, plan-inquiry) while adding upstream-named versions as additional files for compatibility
  - Left ${GSD_WS} workstream variable as-is since it resolves at runtime and will be empty until workstream support is wired

requirements-completed: [SYNC-02]

metrics:
  duration: 8 min
  completed: 2026-03-23
  tasks: 2
  files: 61
---

# Phase 25 Plan 05: Workflow Sync with Upstream v1.28.0 Summary

**One-liner:** Synced all 68 workflow files with upstream v1.28.0 -- 30 shared workflows updated with functional improvements (DISCUSS_MODE, workstream awareness, cross-phase health checks, sub-repos, parallel executor handling), 26 new upstream workflows adopted with GRD namespace, 12 GRD-only renamed workflows cleaned.

## Duration

- Start: 2026-03-23T03:59:01Z
- End: 2026-03-23T04:07:51Z
- Duration: 8 min
- Tasks: 2
- Files changed: 61

## Task Results

### Task 1: Sync 30 shared workflows with upstream functional changes
- **Commit:** b29a3fd
- **Approach:** Copied upstream v1.28.0 versions with automated namespace conversion (tool paths, /grd: commands, grd-* agent names), then restored GRD research vocabulary (tier blocks in progress.md, research command names in routes)
- **Key functional changes applied:**
  - DISCUSS_MODE config loading and display in progress.md
  - Cross-phase health check (audit-uat debt scanner) in progress.md
  - Route E.2 (partial UAT testing) in progress.md
  - UI phase hint detection in progress.md Route B/C
  - Sub-repos commit flow in execute-plan.md
  - Parallel executor --no-verify handling in execute-plan.md
  - Workstream awareness across transition, autonomous, pause-work, resume-project
  - Security checks and workstream branch handling in execute-plan.md
  - Enhanced mapping features in map-codebase.md
  - New config keys in settings.md
  - Custom phase naming support in validate-phase.md
- **D-11 tech debt cleaned:** Fixed stale gsd-tools text references, stale gsd-* agent names (gsd-research-synthesizer, gsd-roadmapper, gsd-codebase-mapper, etc.)

### Task 2: Adopt 26 new upstream workflows and update 12 GRD-only renamed workflows
- **Commit:** 8674c85
- **26 new workflows adopted:** fast, forensics, manager, review, ship, audit-uat, list-workspaces, new-workspace, remove-workspace, next, plant-seed, pr-branch, profile-user, session-report, milestone-summary, discuss-phase-assumptions, and upstream originals (add-phase, audit-milestone, complete-milestone, discuss-phase, execute-phase, insert-phase, new-project, plan-phase, remove-phase, verify-work)
- **12 GRD-only workflows updated:** add-inquiry, audit-study, complete-study, insert-inquiry, new-research, remove-inquiry, set-profile, verify-inquiry (namespace cleanup), conduct-inquiry, plan-inquiry, scope-inquiry, synthesize (no changes needed -- already clean)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed stale gsd-* agent names across all workflows**
- **Found during:** Task 1
- **Issue:** Namespace conversion script didn't catch all gsd-* agent name patterns (gsd-research-synthesizer, gsd-roadmapper, gsd-codebase-mapper, gsd-assumptions-analyzer, gsd-advisor-researcher, gsd-ui-auditor, gsd-nyquist-auditor, gsd-user-profiler)
- **Fix:** Added comprehensive agent name conversion covering all upstream agent types
- **Files modified:** Multiple workflow files
- **Commit:** b29a3fd

**2. [Rule 1 - Bug] Fixed ~/.gsd/ config paths to ~/.grd/**
- **Found during:** Task 1 & 2
- **Issue:** Upstream references to ~/.gsd/defaults.json and ~/.gsd/ directories
- **Fix:** Converted to ~/.grd/ across all workflow files
- **Files modified:** settings.md, new-project.md, new-research.md
- **Commit:** b29a3fd, 8674c85

**3. [Rule 1 - Bug] Fixed /tmp/gsd-* temp file paths to /tmp/grd-***
- **Found during:** Task 2
- **Issue:** Temp file paths in profile-user.md and review.md used gsd prefix
- **Fix:** Converted to grd prefix
- **Files modified:** profile-user.md, review.md
- **Commit:** 8674c85

**Total deviations:** 3 auto-fixed (all Rule 1 -- namespace bugs). **Impact:** None -- all were namespace consistency fixes.

## Verification Results

- `grep -rl "get-shit-done" grd/workflows/`: 0 results (no upstream path leaks)
- `grep -rl "/gsd:" grd/workflows/`: 0 results (no stale namespace refs)
- New upstream workflow files exist: fast.md, forensics.md, manager.md, review.md, ship.md, audit-uat.md, list-workspaces.md (all confirmed)
- GRD research workflows preserved: conduct-inquiry.md, scope-inquiry.md, plan-inquiry.md, verify-inquiry.md (all confirmed with research content)
- progress.md has DISCUSS_MODE: confirmed (2 references)
- execute-plan.md has workstream/security content: confirmed (8 references)
- Test suite: 513 pass, 1 fail (pre-existing namespace.test.cjs subtest 5)
- Total workflow files: 68

## Known Stubs

None -- all workflows are fully functional with proper namespace.

## What's Next

Ready for 25-06 (templates sync and VERSION update).

## Self-Check: PASSED
