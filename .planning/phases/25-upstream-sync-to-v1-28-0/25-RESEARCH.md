# Phase 25: Upstream Sync to v1.28.0 - Research

**Researched:** 2026-03-22
**Domain:** CJS module sync, workflow sync, upstream delta analysis
**Confidence:** HIGH

## Summary

GRD currently runs on GSD v1.25.1. Upstream GSD is at v1.28.0 with substantial changes: 20+ new functions in core.cjs, 5 entirely new modules (security, uat, workstream, profile-output, profile-pipeline), a new multi-repo/workstream architecture, security hardening across all modules, and CRLF/normalization improvements. The sync affects 12 shared CJS modules, the CLI entry point (grd-tools.cjs), 30 shared workflow files, 28 shared template files, and introduces 26 new upstream workflow files.

The largest changes are in core.cjs (785 diff lines -- new planning path resolution, workstream support, sub-repo detection, file locking), init.cjs (806 diff lines -- sub-repo/workstream init, fallback phase resolution), state.cjs (562 diff lines -- security validation, new helper functions), and phase.cjs (559 diff lines -- custom phase naming, workstream-aware paths). A cross-cutting theme is the replacement of hardcoded `.planning/` paths with `planningDir(cwd)` / `planningPaths(cwd)` calls, which is the backbone of workstream support.

**Primary recommendation:** Sync in 5 waves: (1) core.cjs + security.cjs foundation, (2) remaining shared CJS modules + new modules, (3) grd-tools.cjs CLI, (4) workflows, (5) templates + VERSION. Run tests after each wave.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Adopt all 5 new upstream modules (security.cjs, uat.cjs, workstream.cjs, profile-output.cjs, profile-pipeline.cjs) into grd/bin/lib/
- D-02: Apply GRD namespace to new modules (same pattern as existing shared modules)
- D-03: Single diff from v1.25.1 to v1.28.0 (skip intermediate versions)
- D-04: Same diff-and-apply pattern as Phase 15 -- diff upstream, apply delta to GRD's version, preserve research extensions
- D-05: Case-by-case conflict resolution for shared modules
- D-06: Full sync across all file types -- CJS modules, workflows, agents, commands, templates
- D-07: Same thoroughness as Phase 15. Adopt new upstream files, update existing, preserve research adaptations.
- D-08: Run tests after each module group sync (modules -> agents -> workflows -> templates)
- D-09: Existing 514+ tests only -- no new tests in this phase
- D-10: Opportunistic cleanup -- fix tech debt items when modifying the affected file during sync
- D-11: 5 items to clean up: duplicate stateExtractField, config-set-model-profile stub, stats.md research metrics, 2 stale Skill() namespace calls, unused replaceInCurrentMilestone export

### Claude's Discretion
- Exact order of module sync within each file group
- How to handle unexpected upstream changes not in prior research
- Commit granularity (per-module vs per-group)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SYNC-01 | GRD CJS modules synced with GSD v1.28.0 preserving all research extensions | Diff manifest below covers all 12 shared modules + 5 new modules + grd-tools.cjs |
| SYNC-02 | GRD workflows synced with GSD v1.28.0 preserving research adaptations | Workflow diff analysis covers 30 shared + 26 new upstream workflows |
| SYNC-03 | GRD agent prompts synced with GSD v1.28.0 preserving research-specific agents | Upstream has 0 agent files; GRD has 4 research-only agents -- no sync needed, just verify no upstream references changed |
| SYNC-04 | GRD templates synced with GSD v1.28.0 preserving research note templates | Template diff analysis covers 28 shared + 4 new upstream templates |
| SYNC-05 | VERSION file updated to 1.28.0 | Trivial -- `echo "1.28.0" > grd/VERSION` |
| SYNC-06 | All tests pass after sync (existing 514+ tests green) | Current baseline: 514 tests, 513 pass, 1 fail (pre-existing namespace test) |
</phase_requirements>

## Diff Manifest: CJS Modules

### Diff Size Summary (changed lines)

| Module | Diff Lines | Complexity | Key Changes |
|--------|-----------|------------|-------------|
| init.cjs | 806 | HIGH | Sub-repo support, workstream init, fallback phase resolution, removed research config fields |
| core.cjs | 785 | HIGH | 20+ new functions (planningDir, planningPaths, workstream, sub-repo, normalizeMd, file locking) |
| state.cjs | 562 | HIGH | Security validation, stateExtractField/stateReplaceField helpers, planningPaths migration |
| phase.cjs | 559 | HIGH | Custom phase naming, workstream-aware paths, extractCurrentMilestone migration |
| commands.cjs | 306 | MEDIUM | Security sanitization, branching strategy auto-branch, noVerify param |
| config.cjs | 287 | MEDIUM | New config keys (firecrawl, exa_search, hooks, workflow.*), REMOVED GRD research config/smart defaults |
| verify.cjs | 89 | LOW | planningDir migration, custom phase naming skip, catch comments |
| milestone.cjs | 77 | LOW | planningPaths, already_complete tracking, normalizeMd, stateReplaceFieldWithFallback |
| roadmap.cjs | 57 | LOW | planningPaths, extractCurrentMilestone, flexible table column handling |
| model-profiles.cjs | 51 | LOW | grd-* -> gsd-* agent names (reverse of GRD's rename), removed research agents |
| frontmatter.cjs | 24 | LOW | CRLF handling, multiple frontmatter blocks, null byte guards, normalizeMd |
| template.cjs | 4 | TRIVIAL | normalizeMd on write |

### Module-by-Module Analysis

#### core.cjs (785 lines changed) -- CRITICAL FOUNDATION

**New functions to add:**
- `detectSubRepos(cwd)` -- scan child dirs for separate git repos
- `findProjectRoot(startDir)` -- walk up to find project root owning `.planning/`
- `resolveWorktreeRoot(cwd)` -- handle git worktree setups
- `withPlanningLock(cwd, fn)` -- file locking for concurrent access
- `normalizeMd(content)` -- normalize line endings in markdown output
- `planningDir(cwd, ws)` -- resolve `.planning/` path (workstream-aware)
- `planningRoot(cwd)` -- resolve planning root (for PROJECT.md, config.json)
- `planningPaths(cwd, ws)` -- structured paths object for all planning files
- `getActiveWorkstream(cwd)` / `setActiveWorkstream(cwd, name)` -- workstream state
- `extractCurrentMilestone(content, cwd)` -- replaces `stripShippedMilestones` usage in many places
- `extractOneLinerFromBody(content)` -- fallback one-liner extraction
- `filterPlanFiles(files)` / `filterSummaryFiles(files)` -- file filtering helpers
- `getPhaseFileStats(phaseDir)` -- phase directory statistics
- `readSubdirectories(dirPath, sort)` -- directory listing helper
- `reapStaleTempFiles(prefix, opts)` -- temp file cleanup
- `MODEL_ALIAS_MAP` -- model name alias mapping (new export)

**Modified existing functions:**
- `execGit` -- likely uses `execFileSync` now (imported at top)
- `isInsideFencedBlock` / `isClosingFence` -- new markdown parsing helpers

**New exports (must add to module.exports):**
normalizeMd, extractCurrentMilestone, extractOneLinerFromBody, resolveWorktreeRoot, withPlanningLock, findProjectRoot, detectSubRepos, reapStaleTempFiles, MODEL_ALIAS_MAP, planningDir, planningRoot, planningPaths, getActiveWorkstream, setActiveWorkstream, filterPlanFiles, filterSummaryFiles, getPhaseFileStats, readSubdirectories

**GRD preservation concern:** None -- core.cjs has no research-specific modifications. This is a pure additive sync.

#### config.cjs (287 lines changed) -- RESEARCH CONFLICT

**New config keys added:**
- `firecrawl`, `exa_search`
- `workflow.auto_advance`, `workflow.node_repair`, `workflow.node_repair_budget`, `workflow.text_mode`, `workflow.research_before_questions`, `workflow.discuss_mode`, `workflow.skip_discuss`
- `git.quick_branch_template`
- `hooks.context_warnings`

**REMOVED from upstream (GRD must preserve):**
- GRD research extensions in VALID_CONFIG_KEYS: `vault_path`, `commit_research`, `researcher_tier`, `review_type`, `epistemological_stance`, `workflow.critical_appraisal`, `workflow.temporal_positioning`, `workflow.synthesis`
- `SMART_DEFAULTS` object (76 lines) -- review type smart defaults
- `configWithDefaults()` function -- merges defaults with smart defaults
- `applySmartDefaults()` function -- applies smart defaults for new review type

**Resolution:** Add all new upstream config keys. Re-add GRD research keys and smart defaults functions that upstream removed. This is the highest-conflict module.

#### init.cjs (806 lines changed) -- RESEARCH CONFLICT

**New upstream features:**
- `getLatestCompletedMilestone(cwd)` -- milestone history helper
- `withProjectRoot(cwd, result)` -- inject project_root into init results
- Fallback phase resolution from ROADMAP.md when no phase directory exists
- `sub_repos` and `context_window` in init output
- Agent name change: `grd-executor` -> `gsd-executor`, `grd-verifier` -> `gsd-verifier`

**REMOVED from upstream (GRD must preserve):**
- Research config fields in init output: `researcher_tier`, `review_type`, `epistemological_stance`, `critical_appraisal`, `temporal_positioning`, `synthesis`

**Resolution:** Add all new upstream features. Re-add research config fields to init output. Keep `grd-*` agent names (not `gsd-*`).

#### state.cjs (562 lines changed) -- MODERATE CONFLICT

**New upstream features:**
- `getStatePath(cwd)` -- shorthand using planningPaths
- `stateExtractField(content, fieldName)` -- shared helper (supports bold and plain formats)
- `stateReplaceField` and `stateReplaceFieldWithFallback` -- shared helpers
- Security validation: `validatePath()` calls from security.cjs, `validateFieldName()` calls
- All hardcoded `.planning/` paths replaced with `planningPaths(cwd)`

**GRD conflict:** GRD has a duplicate `stateExtractField` at line 12 (tech debt item). Upstream now has a proper shared version. Tech debt D-11 resolves this naturally -- delete GRD's duplicate, use upstream's.

#### commands.cjs (306 lines changed)

**New upstream features:**
- New imports from core.cjs: `extractCurrentMilestone`, `planningDir`, `planningPaths`, `extractOneLinerFromBody`, `getRoadmapPhaseInternal`
- `planningDir(cwd)` / `planningPaths(cwd)` replacing hardcoded paths
- Null byte rejection in path handling
- `sanitizeForPrompt()` from security.cjs for commit messages
- `noVerify` parameter for `cmdCommit()`
- Auto-branch creation for branching_strategy config
- Empty catch blocks -> `catch { /* intentionally empty */ }`

**GRD preservation:** GRD's existing research command wiring must be preserved.

#### phase.cjs (559 lines changed)

**New upstream features:**
- Custom phase naming support (`config.phase_naming === 'custom'`)
- `extractCurrentMilestone` replacing `stripShippedMilestones` in phase-add
- `stateExtractField`, `stateReplaceField`, `stateReplaceFieldWithFallback` from state.cjs
- `planningDir(cwd)` replacing hardcoded paths
- `readSubdirectories` from core.cjs
- `loadConfig` import added

**GRD preservation:** Minimal -- phase.cjs has no research-specific code.

#### model-profiles.cjs (51 lines changed) -- NAMESPACE CONFLICT

**Upstream changed:**
- All agent names use `gsd-*` prefix (upstream's namespace)
- GRD uses `grd-*` prefix
- Upstream removed GRD's 8 research-specific agents

**Resolution:** Keep `grd-*` prefix for all agents. Keep all 8 research agents. Only update model tier assignments if upstream changed any. The diff shows upstream still uses the same opus/sonnet/haiku assignments -- so this is purely a namespace preservation exercise with no functional changes needed.

#### Other modules (frontmatter, milestone, roadmap, template, verify)

These are smaller changes. Key patterns:
- CRLF-tolerant regex in frontmatter.cjs
- `normalizeMd()` on all file writes
- `planningPaths(cwd)` replacing hardcoded `.planning/` paths
- `extractCurrentMilestone` replacing `stripShippedMilestones` usage
- `catch { /* intentionally empty */ }` replacing bare `catch {}`

## New Upstream Modules (5)

### security.cjs (356 lines) -- NEW, ADOPT AS-IS

**Purpose:** Centralized security checks -- path traversal prevention, prompt injection scanning, shell metacharacter validation, JSON safety, input validation.

**Exports:** validatePath, requireSafePath, INJECTION_PATTERNS, scanForInjection, sanitizeForPrompt, validateShellArg, safeJsonParse, validatePhaseNumber, validateFieldName

**Required by:** commands.cjs (sanitizeForPrompt), state.cjs (validatePath, validateFieldName), gsd-tools.cjs (safeJsonParse)

**GRD adaptation needed:** Minimal -- this is infrastructure code with no namespace sensitivity. Adopt as-is.

### uat.cjs (189 lines) -- NEW, ADOPT AS-IS

**Purpose:** Cross-phase UAT/verification scanner. Reads all `*-UAT.md` and `*-VERIFICATION.md` files, extracts non-passing items, returns structured JSON.

**Exports:** cmdAuditUat

**Required by:** gsd-tools.cjs (`audit-uat` command)

**GRD adaptation needed:** Minimal. Uses `planningDir`, `getMilestonePhaseFilter` from core.cjs and `extractFrontmatter` from frontmatter.cjs. Adopt as-is.

### workstream.cjs (491 lines) -- NEW, ADOPT AS-IS

**Purpose:** Multi-workspace orchestration. Create, list, manage, complete workstreams. Each workstream gets its own `.planning/` subdirectory.

**Exports:** migrateToWorkstreams, cmdWorkstreamCreate, cmdWorkstreamList, cmdWorkstreamStatus, cmdWorkstreamComplete, cmdWorkstreamSet, cmdWorkstreamGet, cmdWorkstreamProgress, getOtherActiveWorkstreams

**Required by:** gsd-tools.cjs (`workstream` command)

**GRD adaptation needed:** Minimal. Adopt as-is.

### profile-output.cjs (952 lines) -- NEW, ADOPT AS-IS

**Purpose:** User profiling output generation. Generates dev-preferences.md, Claude profile, Claude.md sections from profiling data.

**Exports:** cmdWriteProfile, cmdProfileQuestionnaire, cmdGenerateDevPreferences, cmdGenerateClaudeProfile, cmdGenerateClaudeMd, PROFILING_QUESTIONS, CLAUDE_INSTRUCTIONS

**Required by:** gsd-tools.cjs, profile-user.md workflow

**GRD adaptation needed:** Minimal.

### profile-pipeline.cjs (539 lines) -- NEW, ADOPT AS-IS

**Purpose:** Session scanning and message extraction for profiling pipeline. Scans Claude session transcripts to build user profiles.

**Exports:** cmdScanSessions, cmdExtractMessages, cmdProfileSample

**Required by:** gsd-tools.cjs, profile-user.md workflow

**GRD adaptation needed:** Minimal.

## CLI Entry Point: grd-tools.cjs (611 diff lines)

**New commands to wire:**
- `state begin-phase` -- update STATE.md for new phase start
- `state signal-waiting` -- write WAITING.json signal file
- `state signal-resume` -- remove WAITING.json signal
- `commit-to-subrepo` -- route commits to sub-repos
- `audit-uat` -- requires uat.cjs
- `workstream` (create/list/status/complete/set/get/progress) -- requires workstream.cjs
- `--pick <field>` flag -- extract single field from JSON output (replaces jq)
- `--no-verify` flag on commit
- `--ws <name>` flag for workstream selection
- `--id` flag on `phase add`

**New module requires:**
```javascript
const profilePipeline = require('./lib/profile-pipeline.cjs');
const profileOutput = require('./lib/profile-output.cjs');
const workstream = require('./lib/workstream.cjs');
```

**GRD preservation:** Must keep all GRD-specific command wiring (research commands, tier-strip, vault, etc.).

## Diff Manifest: Workflows

### Shared Workflows (30 files, ranked by diff size)

| Workflow | Diff Lines | Key Changes |
|----------|-----------|-------------|
| progress.md | 296 | DISCUSS_MODE display, workstream info, removed tier-guided blocks |
| help.md | 282 | New commands listed, workstream commands, removed research vocabulary |
| new-milestone.md | 161 | Seed scanning, workstream migration, new features |
| transition.md | 157 | Workstream awareness, discuss mode, new workflows |
| autonomous.md | 132 | Workstream context, parallel phase limits, fast mode |
| settings.md | 124 | New config keys, workstream settings |
| map-codebase.md | 86 | Enhanced mapping features |
| execute-plan.md | 75 | Security checks, workstream branch handling |
| pause-work.md | 68 | Enhanced state capture |
| update.md | 55 | New update features |
| do.md | 50 | Workstream awareness |
| resume-project.md | 48 | Workstream state restoration |
| ui-phase.md | 44 | New UI features |
| health.md | 44 | New health checks |
| quick.md | 43 | Fast mode support |
| verify-phase.md | 29 | Enhanced verification |
| add-tests.md | 26 | Minor updates |
| validate-phase.md | 24 | Custom phase naming support |
| ui-review.md | 24 | Minor updates |
| stats.md | 23 | New stats features |
| note.md | 22 | Minor updates |
| check-todos.md | 20 | Minor updates |
| plan-milestone-gaps.md | 19 | Minor updates |
| discovery-phase.md | 16 | Minor updates |
| research-phase.md | 14 | Minor updates |
| add-todo.md | 12 | Minor updates |
| diagnose-issues.md | 9 | Minor updates |
| list-phase-assumptions.md | 8 | Minor updates |
| cleanup.md | 2 | Trivial |
| node-repair.md | 0 | Identical |

### Cross-Cutting Workflow Pattern

All shared workflows have two systematic changes:
1. **Tool path:** `$HOME/.claude/get-shit-done/bin/gsd-tools.cjs` -> GRD already uses absolute path to `grd-tools.cjs`
2. **Command references:** `/gsd:*` -> GRD already uses `/grd:*` (and research vocabulary like `/grd:conduct-inquiry`)

These are NOT functional changes -- they are namespace differences GRD already handles. The real functional changes are smaller than the diff counts suggest.

### New Upstream Workflows (26 files)

| Workflow | Lines | Adopt? | Notes |
|----------|-------|--------|-------|
| add-phase.md | ~50 | YES | GRD has add-inquiry.md (renamed equivalent) |
| audit-milestone.md | ~80 | YES | GRD has audit-study.md (renamed equivalent) |
| audit-uat.md | ~100 | YES | NEW -- uses uat.cjs module |
| complete-milestone.md | ~60 | YES | GRD has complete-study.md (renamed equivalent) |
| discuss-phase-assumptions.md | ~60 | YES | NEW -- assumption surfacing |
| discuss-phase.md | ~120 | YES | GRD has scope-inquiry.md (renamed equivalent) |
| execute-phase.md | ~150 | YES | GRD has conduct-inquiry.md (renamed equivalent) |
| fast.md | ~80 | YES | NEW -- trivial task shortcut |
| forensics.md | ~100 | YES | NEW -- post-mortem investigation |
| insert-phase.md | ~50 | YES | GRD has insert-inquiry.md (renamed equivalent) |
| list-workspaces.md | ~40 | NEW | Workstream feature |
| manager.md | ~200 | YES | NEW -- milestone management dashboard |
| milestone-summary.md | ~80 | YES | NEW -- project summary generator |
| new-project.md | ~100 | YES | GRD has new-research.md (renamed equivalent) |
| new-workspace.md | ~80 | NEW | Workstream feature |
| next.md | ~60 | YES | NEW -- auto-advance to next step |
| plan-phase.md | ~150 | YES | GRD has plan-inquiry.md (renamed equivalent) |
| plant-seed.md | ~60 | YES | NEW -- forward-looking idea capture |
| pr-branch.md | ~80 | YES | NEW -- clean PR branch creation |
| profile-user.md | ~120 | YES | NEW -- developer profiling |
| remove-phase.md | ~50 | YES | GRD has remove-inquiry.md (renamed equivalent) |
| remove-workspace.md | ~40 | NEW | Workstream feature |
| review.md | ~100 | YES | NEW -- cross-AI peer review |
| session-report.md | ~80 | YES | NEW -- post-session summary |
| ship.md | ~100 | YES | NEW -- PR creation from planning artifacts |
| verify-work.md | ~80 | YES | GRD has verify-inquiry.md (renamed equivalent) |

**IMPORTANT:** Workflows that have GRD-renamed equivalents (add-phase -> add-inquiry, etc.) need careful handling. The upstream version may have new features that the GRD renamed version lacks. The sync should diff the upstream original against the GRD renamed version, apply deltas, and keep the GRD name.

### GRD-Only Workflows (12 files -- untouched)

add-inquiry.md, audit-study.md, complete-study.md, conduct-inquiry.md, insert-inquiry.md, new-research.md, plan-inquiry.md, remove-inquiry.md, scope-inquiry.md, set-profile.md, synthesize.md, verify-inquiry.md

These are research-renamed versions of upstream workflows. They need to be updated with upstream improvements but keep their GRD names and research adaptations.

## Diff Manifest: Templates

### Shared Templates with Changes (ranked by diff size)

| Template | Diff Lines | Key Changes |
|----------|-----------|-------------|
| research.md | 587 | Major upstream overhaul -- likely new structure |
| project.md | 263 | New sections, workstream support |
| requirements.md | 249 | New format/sections |
| roadmap.md | 156 | Workstream columns, new format |
| context.md | 46 | New sections |
| UAT.md | 30 | Updated format |
| phase-prompt.md | 29 | Updated structure |
| state.md | 14 | Minor format |
| planner-subagent-prompt.md | 14 | Minor updates |
| config.json | 13 | New keys |
| debug-subagent-prompt.md | 8 | Minor |
| discovery.md | 4 | Minor |
| Others (12 files) | 0 | Identical |

### New Upstream Templates (4)

- claude-md.md -- NEW (Claude.md generation template)
- dev-preferences.md -- NEW (developer preferences template)
- discussion-log.md -- NEW (discussion logging template)
- user-profile.md -- NEW (user profiling template)

### GRD-Only Templates (10 -- untouched)

bootstrap.md, decision-log.md, executive-summary.md, framework.md, gaps.md, research-note.md, research-task.md, source-log.md, terminal-deliverable.md, themes.md

## Diff Manifest: Commands

Upstream has only 1 command file: `commands/gsd/workstreams.md` (NEW). GRD has 36 command files in `commands/gsd-r/`. The command files are GRD-specific wiring -- no shared files to diff. The new `workstreams.md` command should be adopted.

## Diff Manifest: Agents

Upstream has 0 agent files. GRD has 4 research-only agents:
- grd-argument-constructor.md
- grd-framework-integrator.md
- grd-gap-analyzer.md
- grd-thematic-synthesizer.md

No sync needed for agents. These are GRD-only and untouched.

## Architecture Patterns

### Cross-Cutting Pattern: planningDir Migration

The single most pervasive upstream change is replacing hardcoded `.planning/` paths with function calls:

```javascript
// OLD (GRD current)
const phasesDir = path.join(cwd, '.planning', 'phases');
const statePath = path.join(cwd, '.planning', 'STATE.md');

// NEW (upstream v1.28.0)
const phasesDir = planningPaths(cwd).phases;
const statePath = planningPaths(cwd).state;
// or
const phasesDir = path.join(planningDir(cwd), 'phases');
```

This pattern appears in: commands.cjs, init.cjs, milestone.cjs, phase.cjs, roadmap.cjs, state.cjs, verify.cjs. It enables workstream isolation where each workstream has its own `.planning/ws/<name>/` subdirectory.

### Cross-Cutting Pattern: Security Hardening

Upstream added security checks in multiple modules:
- **Null byte rejection:** `if (path.includes('\0'))` in commands.cjs, frontmatter.cjs
- **Path validation:** `validatePath()` from security.cjs in state.cjs
- **Field name validation:** `validateFieldName()` in state.cjs
- **Prompt sanitization:** `sanitizeForPrompt()` in commands.cjs
- **Empty catch annotation:** `catch { /* intentionally empty */ }` everywhere

### Cross-Cutting Pattern: extractCurrentMilestone

Upstream added `extractCurrentMilestone(content, cwd)` as a replacement/supplement for `stripShippedMilestones()`. Used in: phase.cjs, roadmap.cjs, verify.cjs. This is smarter about finding the current milestone section.

### Dependency Graph for New Functions

```
security.cjs (standalone, no GRD deps)
  <- commands.cjs (sanitizeForPrompt)
  <- state.cjs (validatePath, validateFieldName)
  <- grd-tools.cjs (safeJsonParse)

core.cjs (foundation)
  exports: planningDir, planningPaths, planningRoot, normalizeMd, extractCurrentMilestone, ...
  <- commands.cjs, config.cjs, frontmatter.cjs, init.cjs, milestone.cjs,
     phase.cjs, roadmap.cjs, state.cjs, template.cjs, uat.cjs, verify.cjs, workstream.cjs

uat.cjs (depends on core.cjs, frontmatter.cjs)
  <- grd-tools.cjs

workstream.cjs (depends on core.cjs)
  <- grd-tools.cjs

profile-output.cjs (depends on core.cjs)
  <- grd-tools.cjs

profile-pipeline.cjs (depends on core.cjs)
  <- grd-tools.cjs
```

**Critical path:** core.cjs MUST be synced first because every other module depends on its new exports (planningDir, planningPaths, normalizeMd, etc.). security.cjs MUST be synced before commands.cjs and state.cjs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Planning path resolution | Custom path.join('.planning',...) | planningDir(cwd) / planningPaths(cwd) from core.cjs | Workstream-aware, handles sub-repos |
| Input sanitization | Custom regex filters | security.cjs functions | Comprehensive threat model, tested |
| Markdown line ending normalization | Manual \r\n replacement | normalizeMd() from core.cjs | Handles edge cases consistently |
| Milestone section extraction | Custom regex | extractCurrentMilestone() from core.cjs | Smarter than stripShippedMilestones |

## Common Pitfalls

### Pitfall 1: Import Order Breaks

**What goes wrong:** Adding new functions to core.cjs require() destructuring but missing one, causing runtime errors in modules that call the new function.
**Why it happens:** core.cjs exports grew from 22 to 40+ items. Every module that uses new functions needs updated imports.
**How to avoid:** For each module being synced, diff the `require('./core.cjs')` line first. Add ALL new imports before modifying function bodies.
**Warning signs:** `TypeError: planningDir is not a function` at runtime.

### Pitfall 2: GRD Namespace Regression in model-profiles.cjs

**What goes wrong:** Blindly applying upstream diff reverts `grd-*` agent names back to `gsd-*`, breaking model resolution.
**Why it happens:** Upstream uses `gsd-*` prefix. GRD uses `grd-*`.
**How to avoid:** model-profiles.cjs should NOT have its agent names changed. Only update model tier assignments if they actually changed (they didn't in v1.28.0).
**Warning signs:** Tests in model-profiles.test.cjs fail.

### Pitfall 3: Research Config Fields Removed

**What goes wrong:** config.cjs and init.cjs upstream removed research-specific fields. Blindly applying upstream removes GRD's research configuration support.
**Why it happens:** Upstream doesn't have research extensions.
**How to avoid:** After applying upstream delta, re-add: VALID_CONFIG_KEYS research entries, SMART_DEFAULTS, configWithDefaults(), applySmartDefaults(), and init.cjs research fields.
**Warning signs:** config-schema.test.cjs and init-verify-config.test.cjs fail.

### Pitfall 4: Template research.md Conflict

**What goes wrong:** research.md template has 587 diff lines. Upstream overhauled it. GRD has research-specific template content.
**Why it happens:** Both upstream and GRD modified the research template heavily.
**How to avoid:** Manual merge -- take upstream structural improvements, preserve GRD research-specific content. This template needs the most careful attention.
**Warning signs:** template-vocabulary.test.cjs or research-note-template.test.cjs fail.

### Pitfall 5: Tool Path References in Workflows

**What goes wrong:** Workflow diffs show tool path changes (`$HOME/.claude/get-shit-done/bin/gsd-tools.cjs` -> various). GRD uses absolute paths to `grd-tools.cjs`.
**Why it happens:** Path references differ between upstream and GRD.
**How to avoid:** When syncing workflows, do NOT change tool path references. Only apply functional changes (new features, new steps, new logic). The paths are already correct for GRD.
**Warning signs:** Workflows fail to find grd-tools.cjs.

## Tech Debt Cleanup Map

Per D-10/D-11, these items should be cleaned when their files are being synced:

| Tech Debt Item | File | When to Fix |
|----------------|------|-------------|
| Duplicate stateExtractField | state.cjs | During state.cjs sync -- upstream now exports proper version |
| config-set-model-profile stub | grd-tools.cjs | During grd-tools.cjs sync -- was fixed in Phase 15 but verify |
| stats.md research metrics | workflows/stats.md | During workflow sync |
| Stale Skill() calls at plan-phase.md:529 | workflows/plan-inquiry.md | During workflow sync |
| Stale Skill() calls at discuss-phase.md:682 | workflows/scope-inquiry.md | During workflow sync |
| Unused replaceInCurrentMilestone export | core.cjs | During core.cjs sync -- check if upstream still exports it |

**Note:** Upstream core.cjs still exports `replaceInCurrentMilestone`. It is used by phase.cjs and roadmap.cjs. This may not actually be dead code -- verify before removing.

## Existing Test Baseline

| Property | Value |
|----------|-------|
| Framework | Node.js built-in test runner (node:test) |
| Config file | scripts/run-tests.cjs |
| Quick run command | `node scripts/run-tests.cjs` |
| Full suite command | `node scripts/run-tests.cjs` |
| Test count | 514 tests |
| Current status | 513 pass, 1 fail (pre-existing namespace.test.cjs subtest 5) |
| Duration | ~727ms |

The pre-existing failure is in `namespace.test.cjs` subtest "no old long path in .planning/ tree" -- this is a known issue unrelated to the sync.

## Validation Architecture

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SYNC-01 | CJS modules work after sync | unit+smoke | `node scripts/run-tests.cjs` | Yes (existing) |
| SYNC-02 | Workflows reference correct paths | smoke | `node scripts/run-tests.cjs` (smoke.test.cjs) | Yes |
| SYNC-03 | Agent files unchanged | manual | `ls grd/agents/` | Yes |
| SYNC-04 | Templates syntactically valid | smoke | `node scripts/run-tests.cjs` | Yes |
| SYNC-05 | VERSION reads 1.28.0 | unit | `cat grd/VERSION` | Manual |
| SYNC-06 | All 514+ tests pass | integration | `node scripts/run-tests.cjs` | Yes |

### Sampling Rate
- **Per task commit:** `node scripts/run-tests.cjs`
- **Per wave merge:** `node scripts/run-tests.cjs` (same -- single test suite)
- **Phase gate:** Full suite green before verify-work

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. Per D-09, no new tests in this phase.

## Recommended Sync Order

Based on the dependency graph and diff analysis:

**Wave 1: Foundation (core.cjs + security.cjs)**
- security.cjs -- copy from upstream, apply GRD namespace pattern
- core.cjs -- add all new functions and exports, preserve existing

**Wave 2: Remaining CJS Modules (11 modules)**
- config.cjs -- add new keys, PRESERVE research extensions
- state.cjs -- add helpers + security, clean tech debt (duplicate stateExtractField)
- frontmatter.cjs -- CRLF handling, normalizeMd
- template.cjs -- normalizeMd (trivial)
- milestone.cjs -- planningPaths, normalizeMd
- roadmap.cjs -- planningPaths, extractCurrentMilestone
- phase.cjs -- custom naming, planningDir
- commands.cjs -- security, branching, noVerify
- init.cjs -- sub-repo support, PRESERVE research config
- verify.cjs -- planningDir, custom naming
- model-profiles.cjs -- PRESERVE grd-* names and research agents

**Wave 3: New Modules + CLI**
- uat.cjs, workstream.cjs, profile-output.cjs, profile-pipeline.cjs -- copy from upstream
- grd-tools.cjs -- wire new modules, new commands, new flags

**Wave 4: Workflows**
- 30 shared workflows -- apply functional changes, preserve tool paths and GRD vocabulary
- 26 new upstream workflows -- adopt with GRD namespace
- 12 GRD-only renamed workflows -- update from their upstream originals

**Wave 5: Templates + Finalize**
- 28 shared templates -- apply changes, preserve research templates
- 4 new upstream templates -- adopt
- VERSION file -> 1.28.0
- 1 new command file (workstreams.md) -- adopt

## Sources

### Primary (HIGH confidence)
- Direct file diff: GRD `grd/bin/lib/*.cjs` vs upstream `~/.claude/get-shit-done/bin/lib/*.cjs`
- Direct file diff: GRD `grd/workflows/*.md` vs upstream `~/.claude/get-shit-done/workflows/*.md`
- Direct file diff: GRD `grd/templates/*` vs upstream `~/.claude/get-shit-done/templates/*`
- Direct file inspection: upstream new modules (security.cjs, uat.cjs, workstream.cjs, profile-output.cjs, profile-pipeline.cjs)

### Secondary (MEDIUM confidence)
- Phase 15 PLAN.md artifacts for sync pattern reference

## Metadata

**Confidence breakdown:**
- Diff manifest: HIGH -- direct file comparison, no ambiguity
- Architecture patterns: HIGH -- extracted from actual code
- Pitfalls: HIGH -- based on actual code conflicts identified in diffs
- Sync order: HIGH -- based on dependency graph extracted from require() statements

**Research date:** 2026-03-22
**Valid until:** Indefinite (locked to specific upstream version v1.28.0)
