# Phase 15: Upstream Sync to v1.25.1 - Research

**Researched:** 2026-03-17
**Domain:** CJS module sync, workflow/template/reference merging, upstream delta analysis
**Confidence:** HIGH (direct file-by-file diff of upstream v1.25.1 against GSD-R v1.24.0-based fork)

## Summary

This research performs a complete file-by-file diff analysis of GSD upstream v1.25.1 (`~/.claude/get-shit-done/`) against the GSD-R fork (`get-shit-done-r/`). The upstream delta from v1.24.0 to v1.25.1 is moderate: 3 modules have significant functional changes (core.cjs, config.cjs, commands.cjs), 3 have moderate changes (init.cjs, phase.cjs, verify.cjs), 2 have minor changes (roadmap.cjs, model-profiles.cjs), 1 has namespace-only changes (state.cjs), and 3 are identical (frontmatter.cjs, milestone.cjs, template.cjs). In workflows, 2 new files must be adopted (do.md, note.md), and 37 of 38 shared workflows have changes (mostly namespace + functional upstream improvements). The fork has research-specific customizations in ~16 workflows that require careful merge.

All 164 tests pass on the current baseline. The tech debt cleanup (5 items) maps cleanly to files being touched during sync, making it efficient to address during the merge.

**Primary recommendation:** Process modules in three groups per the test cadence decision: (1) CJS modules core-first, (2) workflow/command files, (3) templates/references. Run full test suite after each group. Address tech debt items while touching each file.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Merge strategy:** Diff-and-apply across all file types (modules, agents, workflows, templates) -- same proven v1.1 pattern
- **Research-specific preservation:** 5 research-only modules get opportunistic cleanup; shared modules get case-by-case conflict resolution
- **Test strategy:** Run tests after each module group sync (CJS -> agents -> workflows/templates)
- **Tech debt:** Clean up all 5 items during sync

### Claude's Discretion
- Exact order of module sync within each group
- How to handle any unexpected upstream changes not identified in STACK.md research
- Whether to batch small changes or commit per-module

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SYNC-01 | All core CJS modules synced with GSD v1.25.1 while preserving research-specific modifications | Full diff manifest for all 12 shared modules below; 3 identical, 9 need changes |
| SYNC-02 | All agent prompts synced with GSD v1.25.1 while preserving research adaptations | No agents/ directories exist in either upstream or fork -- N/A |
| SYNC-03 | All workflow and command files synced with GSD v1.25.1 while preserving research adaptations | 37 changed workflows cataloged; 2 new upstream workflows; 1 fork-only workflow |
| SYNC-04 | All templates synced with GSD v1.25.1 while preserving research adaptations | 14 changed templates + 2 changed template subdirs cataloged; 6 fork-only templates preserved |
| SYNC-05 | VERSION file updated to 1.25.1 and all 164+ tests pass on new baseline | VERSION update trivial; baseline confirmed at 164 tests passing |
| TEST-01 | All existing 164+ tests continue to pass after all changes | Test suite verified: 164 tests, 47 suites, 0 failures |
</phase_requirements>

---

## File-by-File Diff Manifest

### Group 1: CJS Modules (`bin/lib/`)

#### 1.1 core.cjs -- HIGH PRIORITY

| Property | Value |
|----------|-------|
| Upstream lines | 497 |
| Fork lines | 506 |
| Diff size | 43 lines |
| Conflict risk | LOW |

**Upstream changes (adopt all):**

1. **`spawnSync` replaces `execSync` in `execGit`** -- The fork uses `execSync` with manual shell escaping (8 lines of escape logic). Upstream replaced this with `spawnSync('git', args, ...)` which is safer (no shell injection), simpler (5 lines), and avoids the try/catch pattern. Drop-in replacement since the return shape `{ exitCode, stdout, stderr }` is identical.

2. **`resolveModelInternal` drops `opus`-to-`inherit` mapping** -- Fork maps `'opus'` to `'inherit'` in two places (lines 385, 393-394). Upstream returns the value directly. Adopt upstream: the `opus` model name should pass through as-is.

**GSD-R modifications (none):** No research-specific changes to core.cjs beyond what was synced in v1.1.

**Action:** Replace `execGit` implementation. Remove `opus`-to-`inherit` mapping. Add `spawnSync` to require destructuring.

#### 1.2 config.cjs -- HIGH PRIORITY

| Property | Value |
|----------|-------|
| Upstream lines | 307 |
| Fork lines | 169 |
| Diff size | 138 lines |
| Conflict risk | MEDIUM |

**Upstream changes (adopt all):**

1. **`VALID_CONFIG_KEYS` Set** -- New allowlist of valid config keys. Fork has no validation. Adopt and extend with GSD-R keys (`vault_path`, `commit_research`).

2. **`CONFIG_KEY_SUGGESTIONS` typo correction map** -- Suggests correct key when user types common misspellings. Adopt as-is.

3. **`validateKnownConfigKeyPath()` function** -- Called before `cmdConfigSet`. Adopt.

4. **`ensureConfigFile()` extracted as non-exiting helper** -- Fork's `cmdConfigEnsureSection` both creates config AND calls `output()`. Upstream splits into `ensureConfigFile()` (reusable, no exit) and `cmdConfigEnsureSection()` (exits). Adopt this separation -- it enables `cmdConfigSetModelProfile` to call `ensureConfigFile()` without exiting.

5. **`setConfigValue()` extracted as non-exiting helper** -- Same pattern: reusable without exit. Fork inlines this in `cmdConfigSet`. Adopt.

6. **`cmdConfigSetModelProfile()` function** -- New command that sets profile and shows agent-to-model mapping table. Requires `model-profiles.cjs` import. Adopt -- this replaces the stub in `gsd-r-tools.cjs` (tech debt item #2).

7. **`getCmdConfigSetModelProfileResultMessage()` helper** -- Formats the model profile result. Adopt.

**GSD-R modifications (preserve):**
- `vault_path` and `commit_research` in config -- must be added to `VALID_CONFIG_KEYS`

**Action:** This is effectively a full rewrite of config.cjs to match upstream structure, then extend `VALID_CONFIG_KEYS` with GSD-R keys. Resolves tech debt item #2 (config-set-model-profile stub).

#### 1.3 commands.cjs -- HIGH PRIORITY

| Property | Value |
|----------|-------|
| Upstream lines | 709 |
| Fork lines | 667 |
| Diff size | 42 lines upstream-only |
| Conflict risk | MEDIUM |

**Upstream changes (adopt all):**

1. **`getMilestonePhaseFilter` import and usage** -- Upstream uses `getMilestonePhaseFilter(cwd)` to scope phase discovery to current milestone. Fork discovers all phases without filtering. Adopt.

2. **ROADMAP-driven phase discovery** -- Upstream reads ROADMAP.md headings via `stripShippedMilestones()` to build a phase-by-number map, then merges disk directories on top. Fork only reads disk directories. Adopt -- this enables roadmap-only phases (defined but not yet scaffolded).

3. **Quick task ID format** -- Upstream uses `YYMMDD-xxx` (collision-resistant timestamp-based). Fork uses sequential integer (`nextNum`). Adopt upstream format.

4. **Archived phase handling in discuss-phase init** -- Upstream checks `phaseInfo?.archived` and prefers ROADMAP entry over archived disk match. Fork has no archived phase handling. Adopt.

5. **`normalizePhaseName()` replaces `.padStart(2, '0')`** -- Fork hardcodes 2-char padding. Upstream uses the shared normalizer. Adopt.

6. **Phase number regex: `\d+[A-Z]?` vs `\d+`** -- Upstream supports letter suffixes (e.g., `5A`). Fork only supports numeric. Adopt.

7. **Progress calculation** -- Upstream tracks `plan_percent` separately from phase-completion `percent`. Fork conflates them. Adopt upstream's split.

8. **`last_activity` regex improvements** -- Upstream tries 4 patterns (bold, plain, case variants). Fork tries 1. Adopt.

9. **Git commit stats** -- Upstream uses explicit `rev-list --count` and `rev-list --max-parents=0` with `show -s --format=%as`. Fork uses `log --reverse --format=%as --max-count=1` in a try/catch. Adopt upstream approach.

**GSD-R modifications (preserve):**
- Agent names: `gsd-r-*` prefix throughout (namespace)
- Command references: `/gsd-r:` namespace

**Action:** Large merge. Apply upstream functional changes while preserving `gsd-r-` agent names. The quick ID format change requires updating `quick.md` workflow references too.

#### 1.4 init.cjs -- MEDIUM PRIORITY

| Property | Value |
|----------|-------|
| Upstream lines | 782 |
| Fork lines | 710 |
| Diff size | ~100 lines |
| Conflict risk | MEDIUM |

**Upstream changes (adopt all):**

1. **`getMilestonePhaseFilter` + `stripShippedMilestones` integration** -- Phase list and stats commands filter to current milestone. Adopt.

2. **ROADMAP-only phase support in `cmdInitStats`** -- Phases defined in ROADMAP but not yet on disk appear in stats output. Adopt.

3. **`normalizePhaseName()` usage** -- Replaces hardcoded `padStart(2, '0')`. Adopt.

4. **Phase regex with letter suffix support** -- `\d+[A-Z]?(?:\.\d+)*` vs `\d+(?:\.\d+)*`. Adopt.

5. **Status label: `'Not Started'` vs `'Pending'`** -- Upstream uses `'Not Started'`. Fork uses `'Pending'`. Adopt upstream.

**GSD-R modifications (preserve):**
- Agent names: `gsd-r-*` prefix
- Context template text: `/gsd-r:discuss-phase` reference

**Action:** Apply milestone scoping, ROADMAP-driven discovery, normalization changes. Preserve namespace.

#### 1.5 phase.cjs -- MEDIUM PRIORITY

| Property | Value |
|----------|-------|
| Upstream lines | 911 |
| Fork lines | 901 |
| Diff size | ~104 lines |
| Conflict risk | MEDIUM |

**Upstream changes (adopt all):**

1. **`stripShippedMilestones` + `replaceInCurrentMilestone` usage** -- Phase operations (add, insert, complete) scope to current milestone. Fork operates on full ROADMAP content. Adopt.

2. **`getMilestonePhaseFilter` import** -- Used for phase filtering. Adopt.

3. **Goal regex improvement** -- Upstream supports both `**Goal:**` and `**Goal**:` formats. Fork only supports `**Goal:**`. Adopt.

4. **Depends-on regex improvement** -- Same flexible format. Adopt.

5. **Checkbox pattern for phase completion** -- Upstream matches `Phase N:` or `Phase N `. Fork matches `Phase N` (could false-match). Adopt upstream's more specific pattern.

6. **Roadmap completion checkbox trust** -- Upstream: if ROADMAP marks phase complete, trust that over disk structure. Fork doesn't have this. Adopt.

7. **Requirements update tracking** -- Upstream tracks `requirementsUpdated` and includes `requirements_updated` in result. Fork doesn't. Adopt.

8. **Traceability table status matching** -- Upstream matches `Pending|In Progress`. Fork matches only `Pending`. Adopt.

9. **Phase section extraction** -- Upstream uses `escapeRegex` + scoped section matching for requirements extraction. Fork uses broader pattern. Adopt.

**GSD-R modifications (preserve):**
- Command references: `/gsd-r:plan-phase` in generated phase entries

**Action:** Apply all upstream improvements. Preserve namespace references.

#### 1.6 verify.cjs -- MEDIUM PRIORITY

| Property | Value |
|----------|-------|
| Upstream lines | 842 |
| Fork lines | 820 |
| Diff size | ~92 lines |
| Conflict risk | LOW-MEDIUM |

**Upstream changes (adopt all):**

1. **`os` module import + home directory guard** -- Upstream detects when CWD is home directory and errors with E010. Fork doesn't have this safety guard. Adopt.

2. **`stripShippedMilestones` usage in health check** -- Scopes ROADMAP analysis to current milestone. Adopt.

3. **Valid profiles: `'inherit'` added** -- Upstream validates `['quality', 'balanced', 'budget', 'inherit']`. Fork validates `['quality', 'balanced', 'budget']`. Adopt `'inherit'`.

4. **Config repair defaults** -- Upstream generates more complete defaults including `phase_branch_template`, `milestone_branch_template`, nested `workflow` object, and `brave_search`. Fork generates flat structure. Adopt upstream structure.

**GSD-R modifications (preserve):**
- All `/gsd-r:` command references in error messages
- Research-specific health checks (if any -- none found in shared portion)

**Action:** Apply upstream safety guards, milestone scoping, and config defaults improvements. Preserve namespace.

#### 1.7 roadmap.cjs -- LOW PRIORITY

| Property | Value |
|----------|-------|
| Upstream lines | 306 |
| Fork lines | 298 |
| Diff size | ~53 lines |
| Conflict risk | LOW |

**Upstream changes (adopt all):**

1. **`stripShippedMilestones` usage** -- All roadmap read operations strip shipped milestones. Fork reads full content. Adopt.

2. **`replaceInCurrentMilestone` usage** -- Roadmap write operations (update plan count, checkbox) scope to current milestone. Fork uses `.replace()`. Adopt.

3. **Goal regex improvement** -- Supports `**Goal:**` and `**Goal**:`. Adopt.

4. **Depends-on regex improvement** -- Same flexible format. Adopt.

**GSD-R modifications (none):** No research-specific changes to roadmap.cjs.

**Action:** Straightforward adopt of all upstream changes.

#### 1.8 model-profiles.cjs -- LOW PRIORITY

| Property | Value |
|----------|-------|
| Upstream lines | 68 |
| Fork lines | 72 |
| Diff size | ~4 lines (functional), ~40 lines (agent names) |
| Conflict risk | LOW |

**Upstream changes:**

1. **Agent names** -- Upstream uses `gsd-*` prefix. Fork uses `gsd-r-*` prefix. Keep fork prefix.

2. **Table drawing characters** -- Upstream uses literal Unicode (`---`, `|`, `+`). Fork uses Unicode escape sequences (`\u2500`, `\u2502`, `\u253C`). Either works -- adopt upstream for readability.

3. **Comment text** -- Upstream says "GSD agent to model". Fork says "GSD-R agent to model". Keep fork text.

**GSD-R modifications (preserve):**
- `gsd-r-*` agent name prefix
- 4 research-only agents: `gsd-r-source-researcher`, `gsd-r-methods-researcher`, `gsd-r-architecture-researcher`, `gsd-r-limitations-researcher`

**Action:** Adopt Unicode character change. Preserve agent names and research agents.

#### 1.9 state.cjs -- LOW PRIORITY

| Property | Value |
|----------|-------|
| Upstream lines | 723 |
| Fork lines | 979 |
| Diff size | 1 line shared, 256 lines GSD-R additions |
| Conflict risk | VERY LOW |

**Upstream changes:**
1. **`gsd_state_version` key** -- Upstream uses `gsd_state_version`. Fork uses `gsd_r_state_version`. Keep fork version key name.

**GSD-R modifications (preserve all):**
- `gsd_r_state_version` key
- Note Status operations (ensureStateSections, cmdStateAddNote, cmdStateUpdateNoteStatus, cmdStateGetNotes)
- Source Gaps operations (cmdStateAddGap, cmdStateResolveGap, cmdStateGetGaps)
- Table parsing/rebuilding helpers (parseTableSection, rebuildTableSection)
- All research-specific exports

**Action:** Minimal -- only verify the shared 703 lines haven't diverged beyond the version key. They haven't (confirmed by diff).

#### 1.10 frontmatter.cjs -- NO CHANGES

Files are identical. No action needed.

#### 1.11 milestone.cjs -- NO CHANGES

Files are identical. No action needed.

#### 1.12 template.cjs -- NO CHANGES

Files are identical. No action needed.

#### 1.13 gsd-r-tools.cjs (entry point) -- MEDIUM PRIORITY

| Property | Value |
|----------|-------|
| Diff size | ~132 lines |
| Conflict risk | MEDIUM |

**Upstream changes (adopt):**
- `config-set-model-profile` command implementation (replaces stub -- tech debt item #2)
- Any new command routing added in v1.25.1

**GSD-R modifications (preserve):**
- All research-specific commands (state add-note, state get-notes, state add-gap, etc.)
- verify research-plan command
- bootstrap generate command
- Research-specific imports (planCheckerRules, bootstrap)

**Action:** Replace config-set-model-profile stub with real implementation. Sync any new upstream command routing. Preserve all GSD-R extensions.

### Group 1 Summary

| Module | Change Size | Conflict Risk | Action |
|--------|-------------|---------------|--------|
| core.cjs | 43 lines | LOW | Replace execGit, remove opus mapping |
| config.cjs | 138 lines | MEDIUM | Near-full rewrite to upstream + extend |
| commands.cjs | 42 lines | MEDIUM | Milestone scoping, quick ID, ROADMAP discovery |
| init.cjs | ~100 lines | MEDIUM | Milestone scoping, normalization |
| phase.cjs | ~104 lines | MEDIUM | Milestone scoping, regex improvements |
| verify.cjs | ~92 lines | LOW-MEDIUM | Safety guards, config defaults |
| roadmap.cjs | ~53 lines | LOW | Milestone scoping |
| model-profiles.cjs | ~4 lines | LOW | Unicode chars only |
| state.cjs | 1 line | VERY LOW | Verify shared portion unchanged |
| frontmatter.cjs | 0 | NONE | Skip |
| milestone.cjs | 0 | NONE | Skip |
| template.cjs | 0 | NONE | Skip |
| gsd-r-tools.cjs | ~132 lines | MEDIUM | Config-set-model-profile, routing |

### Group 2: Workflows (`workflows/`)

#### New Upstream Workflows (adopt)

| File | Lines | Purpose | GSD-R Adaptation |
|------|-------|---------|------------------|
| `do.md` | 104 | Freeform intent dispatcher | Adopt with `/gsd-r:` namespace |
| `note.md` | 156 | Zero-friction idea capture | Adopt with `/gsd-r:` namespace |

#### Fork-Only Workflow (preserve)

| File | Lines | Purpose |
|------|-------|---------|
| `set-profile.md` | 81 | Model profile selection (may be superseded by upstream `cmdConfigSetModelProfile`) |

#### Changed Workflows -- Classification

**Namespace-only changes (adopt upstream, re-apply namespace):**

These files differ primarily due to `/gsd:` vs `/gsd-r:` and path differences. Upstream may have functional improvements mixed in.

| File | Diff Lines | Functional Lines | Primary Changes |
|------|-----------|------------------|-----------------|
| cleanup.md | 4 | ~0 | Namespace only |
| diagnose-issues.md | 12 | ~0 | Namespace only |
| list-phase-assumptions.md | 12 | ~0 | Namespace only |
| pause-work.md | 12 | ~0 | Namespace only |
| stats.md | 20 | ~0 | Namespace only |
| add-todo.md | 20 | ~4 | Minor |
| health.md | 28 | ~4 | Minor |
| add-phase.md | 32 | ~4 | Minor |
| discovery-phase.md | 30 | ~4 | Minor |
| check-todos.md | 36 | ~4 | Minor |
| remove-phase.md | 36 | ~4 | Minor |
| insert-phase.md | 30 | ~4 | Minor |
| research-phase.md | 36 | ~4 | Minor |
| add-tests.md | 38 | ~10 | Minor |
| verify-phase.md | 76 | ~4 | Mostly namespace |
| transition.md | 52 | ~8 | Minor |
| ui-review.md | 42 | ~4 | Minor |
| resume-project.md | 42 | ~4 | Minor |

**Functional + namespace changes (careful merge required):**

| File | Diff Lines | Functional Lines | Key Upstream Changes |
|------|-----------|------------------|---------------------|
| discuss-phase.md | 453 | ~283 | GSD-R has deep research vocabulary customization; upstream has structural improvements |
| new-project.md | 304 | ~152 | GSD-R has research-specific project setup; upstream has improvements |
| plan-phase.md | 230 | ~123 | GSD-R has research-specific planning; upstream has improvements |
| help.md | 371 | ~122 | GSD-R has research commands; upstream has new commands (do, note) |
| quick.md | 235 | ~122 | Upstream has YYMMDD-xxx quick ID format; GSD-R has sequential |
| execute-plan.md | 126 | ~47 | Upstream improvements |
| execute-phase.md | 98 | ~29 | Upstream improvements |
| new-milestone.md | 106 | ~45 | Upstream improvements |
| progress.md | 104 | ~28 | Upstream improvements |
| ui-phase.md | 98 | ~8 | Mostly namespace |
| autonomous.md | 98 | ~8 | Mostly namespace |
| verify-work.md | 78 | ~21 | Upstream improvements |
| audit-milestone.md | 60 | ~8 | Minor functional |
| complete-milestone.md | 44 | ~8 | Minor functional |
| settings.md | 55 | ~10 | Minor functional |
| plan-milestone-gaps.md | 34 | ~4 | Minor |
| map-codebase.md | 48 | ~4 | Minor |
| validate-phase.md | 50 | ~8 | Minor functional |
| update.md | 72 | ~8 | Minor functional |

#### Workflow Sync Strategy

1. **node-repair.md** -- Identical. Skip.
2. **New files (do.md, note.md)** -- Copy from upstream, apply namespace.
3. **Namespace-only (18 files)** -- Take upstream version, apply `/gsd-r:` namespace and path updates.
4. **Functional changes (19 files)** -- Case-by-case merge. The biggest ones:
   - **discuss-phase.md**: GSD-R has deep research vocabulary (principal investigator, research assistant, etc.). Upstream has structural improvements. Must preserve research vocabulary while adopting structural changes.
   - **plan-phase.md**: GSD-R has research-specific planning flow. Upstream has improvements. Merge carefully.
   - **new-project.md**: GSD-R has research project setup. Upstream has improvements. Merge carefully.
   - **quick.md**: Upstream has YYMMDD-xxx ID format. Adopt (matches commands.cjs change).
   - **help.md**: Add upstream's new commands (do, note) while preserving GSD-R's research commands.

### Group 3A: Templates (`templates/`)

#### Unchanged Templates (skip)

continue-here.md, milestone-archive.md, milestone.md, retrospective.md, roadmap.md, summary-complex.md, summary-minimal.md, summary-standard.md, summary.md, user-setup.md, verification-report.md

#### Changed Templates

| File | Diff Lines | Change Type |
|------|-----------|-------------|
| config.json | 7 | Fork adds `vault_path`, `commit_research`; upstream adds `hooks.context_warnings` |
| context.md | 76 | Upstream adds `canonical_refs` section; fork has namespace + vocabulary changes |
| copilot-instructions.md | 4 | Namespace only |
| debug-subagent-prompt.md | 16 | Namespace only |
| DEBUG.md | 4 | Namespace only |
| discovery.md | 8 | Namespace only |
| phase-prompt.md | 99 | Namespace + fork adds checkpoint key rule |
| planner-subagent-prompt.md | 28 | Namespace only |
| project.md | 4 | Namespace only |
| requirements.md | 4 | Namespace only |
| research.md | 735 | **Major divergence** -- GSD-R completely rewrote for academic research |
| state.md | 19 | Fork adds Note Status + Source Gaps sections |
| UAT.md | 12 | Namespace only |
| UI-SPEC.md | 4 | Namespace only |
| VALIDATION.md | 4 | Namespace only |

#### Fork-Only Templates (preserve all)

| File | Purpose |
|------|---------|
| bootstrap.md | Research bootstrap template |
| decision-log.md | Decision log format |
| research-note.md | Research note template |
| research-task.md | Research task XML template |
| source-log.md | Source acquisition log |
| terminal-deliverable.md | Terminal deliverable format |

#### Template Subdirectories

**research-project/:**
- Upstream has: ARCHITECTURE.md, FEATURES.md, PITFALLS.md, STACK.md, SUMMARY.md
- Fork has: DEBATES.md, FRAMEWORKS.md, LANDSCAPE.md, QUESTIONS.md, SUMMARY.md
- **Decision (from PROJECT.md):** Keep GSD-R research-project templates over upstream. The fork-specific templates are better fit for research workflow.
- SUMMARY.md differs (vocabulary mapping: Stack->Landscape, Features->Questions, Architecture->Frameworks, Pitfalls->Debates). Keep fork version.

**codebase/:**
- `structure.md` differs. Check if upstream changes are functional improvements worth merging.

#### Template Sync Strategy

1. **Unchanged (11 files)** -- Skip.
2. **Namespace-only (9 files)** -- Take upstream, apply namespace.
3. **config.json** -- Merge: keep fork's `vault_path`/`commit_research`, adopt upstream's `hooks.context_warnings`.
4. **context.md** -- Merge: adopt upstream's `canonical_refs` section, preserve fork's vocabulary.
5. **research.md** -- Keep fork version (completely rewritten for research).
6. **state.md** -- Keep fork version (has Note Status + Source Gaps).
7. **phase-prompt.md** -- Merge: adopt upstream changes, preserve fork's checkpoint key rule.
8. **research-project/** -- Keep fork versions entirely.
9. **Fork-only (6 files)** -- Preserve.

### Group 3B: References (`references/`)

#### Unchanged References (skip)

checkpoints.md, tdd.md

#### Changed References

| File | Diff Lines | Namespace Lines | Change Type |
|------|-----------|-----------------|-------------|
| continuation-format.md | 60 | 16 | Functional + namespace |
| decimal-phase-calculation.md | 16 | 4 | Minor functional |
| git-integration.md | 12 | ~12 | Namespace only |
| git-planning-commit.md | 12 | ~12 | Namespace only |
| model-profile-resolution.md | 11 | 2 | Minor functional |
| model-profiles.md | 70 | 20 | Agent names + profiles |
| phase-argument-parsing.md | 12 | ~12 | Namespace only |
| planning-config.md | 28 | 7 | Functional (new config keys) |
| questioning.md | 73 | 0 | **Purely functional** upstream changes |
| ui-brand.md | 6 | ~6 | Namespace only |
| verification-patterns.md | 4 | ~4 | Namespace only |

#### Fork-Only References (preserve all)

| File | Purpose |
|------|---------|
| note-format.md | Research note format reference |
| research-depth.md | Research depth guidelines |
| research-verification.md | Research verification patterns |
| source-protocol.md | Source acquisition protocol |

#### Reference Sync Strategy

1. **Unchanged (2 files)** -- Skip.
2. **Namespace-only (5 files)** -- Take upstream, apply namespace.
3. **questioning.md** -- Adopt upstream changes entirely (73 lines purely functional).
4. **model-profiles.md** -- Merge: adopt upstream structure, preserve `gsd-r-*` names and research agents.
5. **planning-config.md** -- Merge: adopt new config key documentation.
6. **continuation-format.md** -- Merge: adopt functional improvements, apply namespace.
7. **Fork-only (4 files)** -- Preserve.

### SYNC-02 Note: Agent Prompts

Neither upstream (`~/.claude/get-shit-done/agents/`) nor fork (`get-shit-done-r/agents/`) have an agents directory. Agent behavior is embedded in workflow files, not separate agent prompt files. **SYNC-02 is satisfied by the workflow sync above.** The requirement should be marked complete when workflows are synced.

---

## Tech Debt Cleanup Manifest

All 5 items map to files being touched during sync:

| # | Item | File | Action | When |
|---|------|------|--------|------|
| 1 | Duplicate `stateExtractField` dead code at line 12 | state.cjs | Remove lines 12-19 (duplicate of lines 184-193). Note: upstream has same duplication -- we clean up our fork | During state.cjs sync |
| 2 | `config-set-model-profile` stub in gsd-r-tools.cjs | gsd-r-tools.cjs + config.cjs | Replace stub with upstream's full `cmdConfigSetModelProfile` implementation | During config.cjs sync |
| 3 | Research-specific metrics in stats.md | workflows/stats.md | Add research note count, source gap count to stats output | During workflow sync |
| 4 | 2 stale `Skill()` namespace calls | plan-phase.md:529, discuss-phase.md:682 | Change `Skill(skill="gsd:...)` to `Skill(skill="gsd-r:...")` | During workflow sync |
| 5 | `replaceInCurrentMilestone` unused export | core.cjs | This function IS used by upstream (phase.cjs, roadmap.cjs). After sync, it will be used. **Not actually dead** -- remove from tech debt list |

**Important finding on tech debt item #5:** The fork's core.cjs exports `replaceInCurrentMilestone` but the fork's phase.cjs and roadmap.cjs don't use it (they use `.replace()` instead). After syncing those files to upstream versions, they WILL use `replaceInCurrentMilestone`. So this tech debt resolves itself during sync -- no separate action needed.

---

## Architecture Patterns

### Sync Order (Recommended)

**Within Group 1 (CJS modules), process in dependency order:**

1. **core.cjs** first -- all other modules import from it
2. **config.cjs** second -- config-set-model-profile needs model-profiles.cjs (already synced)
3. **state.cjs** third -- minimal changes, quick win
4. **roadmap.cjs** fourth -- simple, no research-specific changes
5. **model-profiles.cjs** fifth -- minimal changes
6. **commands.cjs** sixth -- depends on core.cjs changes
7. **init.cjs** seventh -- depends on core.cjs changes
8. **phase.cjs** eighth -- depends on core.cjs changes
9. **verify.cjs** ninth -- depends on core.cjs changes
10. **gsd-r-tools.cjs** last -- integrates all module changes

**Run full test suite after Group 1.**

**Within Group 2 (workflows), process by impact:**

1. New files first (do.md, note.md) -- no conflicts possible
2. Namespace-only files (18 files) -- batch these, low risk
3. Large functional changes (discuss-phase.md, plan-phase.md, new-project.md, quick.md, help.md) -- one at a time

**Run full test suite after Group 2.**

**Within Group 3 (templates + references), process by impact:**

1. Namespace-only files -- batch
2. Functional merges (config.json, context.md, phase-prompt.md) -- one at a time
3. Preserve fork-only files -- no action needed
4. research-project/ templates -- preserve fork versions

**Run full test suite after Group 3.**

### Merge Pattern per File

For each file with both upstream changes and fork modifications:

```
1. Read upstream v1.25.1 version (source of truth for new features)
2. Read fork version (source of truth for research modifications)
3. Start with upstream version
4. Apply GSD-R namespace changes (gsd: -> gsd-r:, paths)
5. Apply GSD-R research-specific additions (vocabulary, extra sections)
6. Verify no upstream functionality was lost
```

### Anti-Patterns to Avoid

- **Don't blindly copy upstream over fork** -- research vocabulary in discuss-phase.md, plan-phase.md, new-project.md must be preserved
- **Don't re-apply research changes to old upstream** -- start from new upstream, not from old fork
- **Don't batch files with different conflict levels** -- high-conflict files (config.cjs, commands.cjs) should be synced individually

---

## Common Pitfalls

### Pitfall 1: Missing Import Updates
**What goes wrong:** Synced module uses `stripShippedMilestones` or `getMilestonePhaseFilter` but the `require('./core.cjs')` destructuring doesn't include them.
**How to avoid:** When syncing each module, compare the import line first. Update destructuring before touching function bodies.
**Files affected:** commands.cjs, init.cjs, phase.cjs, verify.cjs, roadmap.cjs

### Pitfall 2: Quick ID Format Mismatch
**What goes wrong:** commands.cjs outputs `YYMMDD-xxx` format but quick.md workflow still references `next_num`.
**How to avoid:** Sync commands.cjs and quick.md together. Update all references from `next_num` to `quick_id`.

### Pitfall 3: Config Validation Rejecting GSD-R Keys
**What goes wrong:** Upstream's `VALID_CONFIG_KEYS` set doesn't include `vault_path` or `commit_research`. Setting these via CLI would error.
**How to avoid:** Immediately after adopting `VALID_CONFIG_KEYS`, add GSD-R keys to the set.

### Pitfall 4: Stale Agent Name in Test Expectations
**What goes wrong:** Tests assert `gsd-r-executor` model resolution, but if `opus`-to-`inherit` mapping is removed, expected values change.
**How to avoid:** After removing `opus`-to-`inherit` mapping from core.cjs, check test expectations in model-profiles.test.cjs.

### Pitfall 5: Research Template Overwrite
**What goes wrong:** templates/research.md gets replaced with upstream version, losing the entire research-oriented rewrite.
**How to avoid:** research.md is a KEEP-FORK file. Never take upstream for this file.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Config key validation | Custom key validator | Upstream's `VALID_CONFIG_KEYS` Set | Already built, tested, includes typo suggestions |
| Model profile setting | CLI stub | Upstream's `cmdConfigSetModelProfile` | Full implementation with table display |
| Milestone-scoped operations | Custom filtering | Upstream's `stripShippedMilestones` + `getMilestonePhaseFilter` | Already proven across 5 modules |
| Quick task IDs | Sequential counter | Upstream's YYMMDD-xxx format | Collision-resistant, no disk scan needed |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | node:test (built-in, Node.js v22.20.0) |
| Config file | None (no config needed for node:test) |
| Quick run command | `node --test test/*.test.cjs` |
| Full suite command | `node --test test/*.test.cjs` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SYNC-01 | CJS modules synced and functional | integration | `node --test test/*.test.cjs` | Yes (9 test files) |
| SYNC-02 | Agent prompts synced | manual-only | N/A (no agents dir) | N/A |
| SYNC-03 | Workflows synced | manual-only | Namespace grep scan | N/A |
| SYNC-04 | Templates synced | manual-only | Namespace grep scan | N/A |
| SYNC-05 | VERSION=1.25.1, all tests pass | unit+integration | `node --test test/*.test.cjs` | Yes |
| TEST-01 | 164+ tests pass | integration | `node --test test/*.test.cjs` | Yes |

### Sampling Rate
- **Per module sync:** `node --test test/*.test.cjs` (all 164 tests, ~80ms)
- **Per group completion:** Same full suite
- **Phase gate:** Full suite green + VERSION reads 1.25.1

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. No new test files needed for sync (TEST-01 scope is "existing tests pass," not new tests).

---

## State of the Art

| Old Approach (v1.24.0 fork) | Current Approach (v1.25.1 upstream) | Impact |
|------------------------------|-------------------------------------|--------|
| `execSync` with manual shell escaping | `spawnSync('git', args)` | Safer, simpler, no injection risk |
| Sequential quick task IDs | YYMMDD-xxx collision-resistant IDs | Better for parallel agents |
| No config key validation | `VALID_CONFIG_KEYS` + typo suggestions | Prevents silent config errors |
| No model profile CLI command | `cmdConfigSetModelProfile` with table | Full profile management |
| All ROADMAP content visible | `stripShippedMilestones` scoping | Clean multi-milestone view |
| Disk-only phase discovery | ROADMAP + disk merged | Sees planned-but-unscaffolded phases |
| `opus` mapped to `inherit` | `opus` passes through | Correct model resolution |
| Hardcoded 2-char phase padding | `normalizePhaseName()` | Supports letter suffixes (5A) |

---

## Open Questions

1. **set-profile.md workflow vs cmdConfigSetModelProfile**
   - What we know: Fork has `workflows/set-profile.md` (81 lines). Upstream has `cmdConfigSetModelProfile` in config.cjs.
   - What's unclear: Does `set-profile.md` become redundant after adopting upstream's config command?
   - Recommendation: Keep set-profile.md for now. It may provide a richer workflow experience than the bare command. Evaluate during sync.

2. **Tech debt item #1 (duplicate stateExtractField) exists upstream too**
   - What we know: Both upstream and fork have the same duplicate at line 12 and line 184.
   - What's unclear: Whether upstream plans to fix this.
   - Recommendation: Fix in fork only. Don't let upstream's duplication prevent cleanup.

3. **`hooks.context_warnings` in config.json template**
   - What we know: Upstream added this key. Fork doesn't have it.
   - What's unclear: What this feature does and whether it matters for GSD-R.
   - Recommendation: Adopt it in the config template for upstream compatibility. Document as LOW confidence.

---

## Sources

### Primary (HIGH confidence)
- Direct file diff: `~/.claude/get-shit-done/` (v1.25.1) vs `get-shit-done-r/` (v1.24.0-based fork)
- Test suite output: `node --test test/*.test.cjs` -- 164 tests, 0 failures
- VERSION files: upstream=1.25.1, fork=1.24.0

### Secondary (HIGH confidence)
- `.planning/research/STACK.md` -- Prior sync manifest (validated and extended by this research)
- `.planning/PROJECT.md` -- Tech debt items confirmed

---

## Metadata

**Confidence breakdown:**
- CJS module diffs: HIGH -- direct file comparison, every line examined
- Workflow classification: HIGH -- every file diffed and categorized
- Template/reference analysis: HIGH -- every file compared
- Tech debt mapping: HIGH -- each item verified in source
- Conflict risk assessments: MEDIUM -- based on change analysis, not actual merge testing

**Research date:** 2026-03-17
**Valid until:** Until upstream updates beyond v1.25.1 or fork changes beyond current state
