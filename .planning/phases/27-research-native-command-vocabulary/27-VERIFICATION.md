---
phase: 27-research-native-command-vocabulary
verified: 2026-03-23T17:45:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
gaps: []
resolution_note: "All 3 gaps resolved in commits 09d32ea (git rm 6 old files) and 0905352 (bulk sed 270 refs across 50 files). Zero stale refs remain. 514/514 tests pass."
original_gaps:
  - truth: "Old command files (new-project.md, discuss-phase.md, plan-phase.md, execute-phase.md, verify-work.md, complete-milestone.md) no longer exist in commands/grd/"
    status: resolved
    reason: "All 6 old command files still exist in commands/grd/. They were never deleted."
    artifacts:
      - path: "commands/grd/new-project.md"
        issue: "Old command file still exists — should have been deleted (CMD-01, CMD-05)"
      - path: "commands/grd/discuss-phase.md"
        issue: "Old command file still exists — should have been deleted"
      - path: "commands/grd/plan-phase.md"
        issue: "Old command file still exists — should have been deleted"
      - path: "commands/grd/execute-phase.md"
        issue: "Old command file still exists — should have been deleted"
      - path: "commands/grd/verify-work.md"
        issue: "Old command file still exists — should have been deleted"
      - path: "commands/grd/complete-milestone.md"
        issue: "Old command file still exists — should have been deleted"
    missing:
      - "Run git rm on all 6 old command files in commands/grd/"

  - truth: "Zero instances of /grd:new-project, /grd:discuss-phase, /grd:plan-phase, /grd:execute-phase, /grd:verify-work, /grd:complete-milestone in target scopes"
    status: failed
    reason: "263 stale /grd:-prefixed references remain across commands/, agents/, grd/workflows/, README.md, and docs/DESIGN.md. Pass 1 (bulk /grd: prefix replacement) was claimed as 'already complete' in the SUMMARY but was NOT done. Pre-phase count was 285 references; only the old command files themselves (2 refs) were accounted for — all 263 remaining refs in active files were never replaced."
    artifacts:
      - path: "grd/workflows/help.md"
        issue: "30 stale /grd: refs — was in the 17-file target list but only 1 bare identifier was replaced, not the /grd:-prefixed refs"
      - path: "grd/workflows/resume-project.md"
        issue: "7 stale /grd: refs — was in the 17-file target list"
      - path: "grd/workflows/settings.md"
        issue: "4 stale /grd: refs + 2 bare old identifiers — was in the 17-file target list"
      - path: "agents/grd-planner.md"
        issue: "9 stale /grd: refs (CMD-04)"
      - path: "agents/grd-plan-checker.md"
        issue: "6 stale /grd: refs (CMD-04)"
      - path: "README.md"
        issue: "22 stale /grd: refs (CMD-02)"
      - path: "docs/DESIGN.md"
        issue: "5 stale /grd: refs (CMD-02)"
      - path: "grd/workflows/list-phase-assumptions.md"
        issue: "2 stale /grd: refs + 2 bare old identifiers — was in the 17-file target list"
      - path: "grd/workflows/discovery-phase.md"
        issue: "2 stale /grd: refs + 2 bare old identifiers — was in the 17-file target list"
      - path: "grd/workflows/quick.md"
        issue: "1 stale /grd: ref — was in the 17-file target list"
    missing:
      - "Run Pass 1 bulk sed replacement across commands/, agents/, grd/workflows/, README.md, docs/DESIGN.md (excluding .planning/)"
      - "Verify zero results: grep -rn '/grd:new-project|/grd:discuss-phase|/grd:plan-phase|/grd:execute-phase|/grd:verify-work|/grd:complete-milestone' commands/ agents/ grd/workflows/ README.md docs/DESIGN.md"

  - truth: "Zero instances of bare old identifiers used as command/workflow routing in 17 workflow files"
    status: failed
    reason: "3 of the 17 target workflow files still contain bare old identifiers: settings.md has 'new-project' and 'discuss-phase' in question strings; list-phase-assumptions.md has '/grd:discuss-phase' and '/grd:plan-phase' in option text (these are /grd:-prefixed refs not counted above); discovery-phase.md similarly. Additionally, 7 stale Skill() calls with old 'grd:' names remain in plan-phase.md, manager.md, discuss-phase-assumptions.md, and discuss-phase.md."
    artifacts:
      - path: "grd/workflows/settings.md"
        issue: "Lines 140, 149: bare 'new-project' and 'discuss-phase' in question config strings — not replaced"
      - path: "grd/workflows/plan-phase.md"
        issue: "Line 743: Skill(skill=\"grd:execute-phase\") — old Skill() routing call not replaced"
      - path: "grd/workflows/manager.md"
        issue: "Lines 116, 117, 194, 204: Skill() calls with grd:verify-work, grd:complete-milestone, grd:discuss-phase — not replaced"
      - path: "grd/workflows/discuss-phase-assumptions.md"
        issue: "Line 621: Skill(skill=\"grd:plan-phase\") — old Skill() routing call not replaced"
      - path: "grd/workflows/discuss-phase.md"
        issue: "Line 993: Skill(skill=\"grd:plan-phase\") — old Skill() routing call not replaced (this file is an old workflow file that still exists)"
    missing:
      - "Replace bare 'new-project' and 'discuss-phase' in settings.md question strings"
      - "Replace Skill() calls in plan-phase.md, manager.md, discuss-phase-assumptions.md"
      - "Run: grep -rn '\"grd:new-project\"|\"grd:discuss-phase\"|\"grd:plan-phase\"|\"grd:execute-phase\"|\"grd:verify-work\"|\"grd:complete-milestone\"' commands/ agents/ grd/workflows/ and fix all hits"
---

# Phase 27: Research-Native Command Vocabulary Verification Report

**Phase Goal:** Users invoke research-native commands (scope-inquiry, conduct-inquiry, etc.) instead of PM-style names (discuss-phase, execute-phase, etc.)
**Verified:** 2026-03-23T17:45:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Old command files no longer exist in commands/grd/ | FAILED | All 6 old files still present: new-project.md, discuss-phase.md, plan-phase.md, execute-phase.md, verify-work.md, complete-milestone.md |
| 2 | New command files exist in commands/grd/ | VERIFIED | All 6 new files confirmed: new-research.md, scope-inquiry.md, plan-inquiry.md, conduct-inquiry.md, verify-inquiry.md, complete-study.md |
| 3 | Zero instances of /grd:-prefixed old command names in target scopes | FAILED | 263 stale /grd: refs remain across agents/ (31 refs), grd/workflows/ (46 refs in active files + old workflow files), commands/ (8 refs), README.md (22 refs), docs/DESIGN.md (5 refs) |
| 4 | Zero bare old identifiers used as routing in 17 workflow files | FAILED | settings.md lines 140/149 still have bare 'new-project' and 'discuss-phase'; 7 Skill() calls with old "grd:" names remain in plan-phase.md, manager.md, discuss-phase-assumptions.md, discuss-phase.md |
| 5 | All 514+ tests pass | VERIFIED | 514 tests pass, 0 failures (npm test confirmed) |

**Score:** 2/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `commands/grd/new-research.md` | Research-native new-research command | VERIFIED | File exists |
| `commands/grd/scope-inquiry.md` | Research-native scope-inquiry command | VERIFIED | File exists |
| `commands/grd/plan-inquiry.md` | Research-native plan-inquiry command | VERIFIED | File exists |
| `commands/grd/conduct-inquiry.md` | Research-native conduct-inquiry command | VERIFIED | File exists |
| `commands/grd/verify-inquiry.md` | Research-native verify-inquiry command | VERIFIED | File exists |
| `commands/grd/complete-study.md` | Research-native complete-study command | VERIFIED | File exists |
| `commands/grd/new-project.md` | DELETED | FAILED | Old file still exists |
| `commands/grd/discuss-phase.md` | DELETED | FAILED | Old file still exists |
| `commands/grd/plan-phase.md` | DELETED | FAILED | Old file still exists |
| `commands/grd/execute-phase.md` | DELETED | FAILED | Old file still exists |
| `commands/grd/verify-work.md` | DELETED | FAILED | Old file still exists |
| `commands/grd/complete-milestone.md` | DELETED | FAILED | Old file still exists |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `commands/grd/help.md` | all 6 new command names | command listing | FAILED | help.md delegates to grd/workflows/help.md which has 30 stale /grd: refs to old names and only 1 reference to new names (scope-inquiry) |
| `commands/grd/autonomous.md` | new command identifiers | Skill() routing calls | VERIFIED | autonomous.md delegates to grd/workflows/autonomous.md which uses grd:plan-inquiry, grd:conduct-inquiry, grd:scope-inquiry, grd:complete-study correctly |
| `grd/workflows/*.md` | new command identifiers | workflow routing references | FAILED | 46 stale /grd: refs in active (non-old-name) workflow files; 7 stale Skill() calls with old "grd:" names |

### Data-Flow Trace (Level 4)

Not applicable — this phase is a vocabulary rename, not a data-rendering phase.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| New command files exist | `ls commands/grd/new-research.md commands/grd/scope-inquiry.md commands/grd/plan-inquiry.md commands/grd/conduct-inquiry.md commands/grd/verify-inquiry.md commands/grd/complete-study.md` | All 6 files present | PASS |
| Old command files deleted | `ls commands/grd/new-project.md ...` | All 6 old files present — should be absent | FAIL |
| Zero stale /grd: refs in agents/ | `grep -rn '/grd:discuss-phase\|/grd:plan-phase\|...' agents/` | 31 matches across 8 agent files | FAIL |
| Zero stale /grd: refs in grd/workflows/ target files | `grep -rn '/grd:discuss-phase\|/grd:plan-phase\|...' grd/workflows/help.md grd/workflows/resume-project.md ...` | 46 matches in active workflow files | FAIL |
| Zero stale /grd: refs in README.md | `grep -c '/grd:plan-phase...' README.md` | 22 matches | FAIL |
| All tests pass | `npm test` | 514/514 pass | PASS |

### Requirements Coverage

CMD requirements are documented in the PLAN frontmatter and RESEARCH.md but are defined by the plan's success criteria, not by a dedicated section in REQUIREMENTS.md. They appear only in the traceability table. Based on plan-defined acceptance criteria:

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CMD-01 | 27-01-PLAN | 6 new command files exist as sole command definitions | PARTIAL | New files exist but old files still exist alongside them — old files not deleted |
| CMD-02 | 27-01-PLAN | Cross-references updated in all commands/ files | FAILED | commands/grd/debug.md (1), map-codebase.md (3), new-milestone.md (1), research-phase.md (3) still have stale /grd: refs |
| CMD-03 | 27-01-PLAN | Cross-references updated in 17 workflow files (context-sensitive) | PARTIAL | Bare identifier replacement done in most of 17 files; but 6 of 17 still have stale /grd:-prefixed refs (46 total), and settings.md has residual bare identifiers |
| CMD-04 | 27-01-PLAN | Cross-references updated in 16 agent files | FAILED | 8 agent files have 31 stale /grd: refs — none were replaced |
| CMD-05 | 27-01-PLAN | Old command filenames no longer exist in commands/grd/ | FAILED | All 6 old files still present |
| CMD-06 | 27-01-PLAN | All tests pass after vocabulary update | VERIFIED | 514/514 tests pass |

**Note on REQUIREMENTS.md:** CMD-01 through CMD-06 appear only in the traceability table (marked Complete) and are not formally defined in any requirements section. Their definitions are reconstructed from RESEARCH.md phase_requirements. No orphaned requirements found.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `commands/grd/new-project.md` | all | Old command file still exists | BLOCKER | Users who type `/grd:new-project` will invoke the old PM-style command |
| `commands/grd/discuss-phase.md` | all | Old command file still exists | BLOCKER | Users who type `/grd:discuss-phase` will invoke the old PM-style command |
| `commands/grd/plan-phase.md` | all | Old command file still exists | BLOCKER | Users who type `/grd:plan-phase` will invoke the old PM-style command |
| `commands/grd/execute-phase.md` | all | Old command file still exists | BLOCKER | Users who type `/grd:execute-phase` will invoke the old PM-style command |
| `commands/grd/verify-work.md` | all | Old command file still exists | BLOCKER | Users who type `/grd:verify-work` will invoke the old PM-style command |
| `commands/grd/complete-milestone.md` | all | Old command file still exists | BLOCKER | Users who type `/grd:complete-milestone` will invoke the old PM-style command |
| `grd/workflows/help.md` | 12-577 | 30 stale /grd: refs — old names throughout help content | BLOCKER | Help system instructs users to use old command names |
| `agents/grd-planner.md` | multiple | 9 stale /grd: refs — old names in planner output templates | BLOCKER | Planner agents will emit old command names in output shown to users |
| `grd/workflows/plan-phase.md` | 743 | `Skill(skill="grd:execute-phase", ...)` | BLOCKER | Routing from plan-phase to execute-phase uses old name |
| `grd/workflows/manager.md` | 116,117,194,204 | 4 Skill() calls with old grd: names | BLOCKER | Manager workflow routes to old command names |
| `README.md` | multiple | 22 stale /grd: refs | WARNING | Documentation shows old command names to users |

### Human Verification Required

None — all gaps are programmatically verifiable.

## Root Cause Analysis

The SUMMARY (Task 1 decision note) states: "Task 1 was already complete — old command files already deleted and /grd: prefixed refs already zero from prior work." This was incorrect. The RESEARCH.md documented 285 `/grd:`-prefixed references remaining at the time of research (pre-phase). The git commit `cec4356` only touched bare identifier replacement in 17 workflow files (Pass 2). Pass 1 — the bulk `/grd:` prefix sed replacement across all target scopes, and the `git rm` of old command files — was never executed.

The SUMMARY's claim that Task 1 was pre-completed is contradicted by:
1. All 6 old command files still existing in `commands/grd/`
2. 263 stale `/grd:` prefixed references still present across target scopes
3. The sole commit (`cec4356`) only modifying the 17 workflow files for bare identifier replacement

## Gaps Summary

Three truths are unverified, all stemming from the same root cause: Task 1 of Plan 01 was skipped based on an incorrect assessment that Pass 1 was "already complete."

**Gap 1 (Blockers — old command files):** 6 old command files remain in `commands/grd/`. Users can still invoke `/grd:new-project`, `/grd:discuss-phase`, `/grd:plan-phase`, `/grd:execute-phase`, `/grd:verify-work`, and `/grd:complete-milestone` — the very PM-style commands this phase was meant to retire.

**Gap 2 (Critical — stale /grd: cross-references):** 263 `/grd:`-prefixed references to old command names remain across commands/ (8 refs in non-old-files), agents/ (31 refs across 8 files), grd/workflows/ (active files: 46 refs), README.md (22 refs), and docs/DESIGN.md (5 refs). The help system, planner agent, and documentation all still point users to old command names.

**Gap 3 (Minor — residual bare identifiers):** After the Pass 2 work, 3 workflow files still have residual bare old identifiers in routing context (settings.md question strings, and several Skill() calls in plan-phase.md, manager.md, discuss-phase-assumptions.md). These are fewer in count (9 Skill() refs + 2 bare) but still inconsistent.

**All three gaps can be closed by executing the Pass 1 work originally planned in Task 1:**
- `git rm` the 6 old command files
- Bulk sed replacement of `/grd:` prefixed patterns across all target scopes
- Targeted fix of remaining bare identifiers in settings.md and Skill() calls

---

_Verified: 2026-03-23T17:45:00Z_
_Verifier: Claude (gsd-verifier)_
