# Pitfalls Research

**Domain:** Research reorientation of forked codebase (GRD v1.1 becoming GRD v1.2)
**Researched:** 2026-03-17
**Confidence:** HIGH (evidence-driven from direct codebase analysis, v1.1 sync lessons, and spec review)

## Critical Pitfalls

### Pitfall 1: Upstream Merge Destroys Research-Specific Modifications

**What goes wrong:**
The v1.24.0-to-v1.25.1 upstream sync involves 1,077 commits. v1.1 already demonstrated this risk at smaller scale (v1.22.4 to v1.24.0): research layer functions in state.cjs got silently dropped, frontmatter keys diverged, MODEL_PROFILES agent prefixes reverted. At 1,077 commits, the surface area is dramatically larger. Upstream may have refactored files that GRD has modified for research purposes. The six research-specific state.cjs exports (cmdStateAddNote, cmdStateUpdateNoteStatus, cmdStateGetNotes, cmdStateAddGap, cmdStateResolveGap, cmdStateGetGaps), the research-specific templates (bootstrap.md, research-note.md, source-log.md, decision-log.md, terminal-deliverable.md, research-task.md), and the four research-specific reference files (note-format.md, research-depth.md, research-verification.md, source-protocol.md) are all at risk of being overwritten or having their anchoring assumptions invalidated by upstream structural changes.

**Why it happens:**
The "upstream wins" strategy from v1.1 (documented in key decisions) is correct for minimizing drift, but it requires methodical re-application of every research-specific modification after each file replacement. With 1,077 commits, upstream may have renamed functions, changed parameter signatures, restructured module exports, or added new dependencies between modules. A function that GRD calls may have been renamed; a module boundary that GRD hooks into may have been refactored.

**How to avoid:**
1. Before starting the sync, create a definitive "research delta manifest" -- every file that differs from upstream, what the difference is, and whether the difference is GRD-specific or just a version lag. The v1.1 audit found 70 files with `grd` references in the package directory alone.
2. Categorize each delta: (a) "upstream wins, no re-application needed" (pure upstream changes), (b) "upstream wins, must re-apply research layer" (state.cjs pattern), (c) "GRD wins, upstream changes ignored" (research-only files with no upstream equivalent), (d) "manual merge required" (both sides changed the same code).
3. Sync one module at a time, run the full 164-test suite after each file, exactly as v1.1 learned the hard way.
4. Do the upstream sync BEFORE any v1.2 feature work, so the sync operates on a known baseline.

**Warning signs:**
- `node --test test/*.test.cjs` failures after replacing a file, especially "is not a function" errors
- `module.exports` in any synced file has fewer entries than the GRD version
- Research workflow commands (`note-add`, `note-status`, `gap-add`) throw TypeError at runtime
- verify-rename.cjs reports new stale namespace references

**Phase to address:**
Must be the first phase of v1.2. No other work should begin until the upstream sync is complete and all 164 tests pass on the v1.25.1 base.

**GRD-specific risk level:** CRITICAL

---

### Pitfall 2: Incomplete Namespace Migration Leaves Mixed grd/grd References

**What goes wrong:**
The namespace migration from `grd` to `grd` touches 1,907 occurrences across 172 files (grep-confirmed). Within the package directory alone, there are 681 occurrences across 70 files. This is not a simple find-and-replace -- the `grd` string appears in at least seven distinct contexts, each requiring different replacement logic:

1. **Slash command namespace:** `/grd:plan-phase` becomes `/grd:plan-inquiry` (not just prefix change -- command names also change)
2. **Agent name prefixes:** `grd-planner`, `grd-executor` in model-profiles.cjs and init.cjs (19 agent names)
3. **Directory path references:** `commands/grd/` directory name
4. **File names:** `grd-tools.cjs` becomes `grd-tools.cjs`
5. **Frontmatter keys:** `grd_state_version` in state.cjs
6. **Template/prose references:** Help text, error messages, documentation
7. **Test fixtures:** model-profiles.test.cjs has 37 occurrences; test files reference agent names

A naive `sed 's/grd/grd/g'` would corrupt paths like `grd` (the package directory name), create invalid identifiers like `grd_state_version` (should it be `grd_state_version`? `grd_state_version`?), and miss the command name changes entirely (`plan-phase` to `plan-inquiry`).

**Why it happens:**
v1.1 already demonstrated this at smaller scale: the v1.0 rename pass missed 2 stale Skill() calls (`plan-phase.md:529` using `gsd:execute-phase`, `discuss-phase.md:682` using `gsd:plan-phase`) and left all 35 command frontmatter files with `name: gsd:<command>`. The existing `scripts/rename-gsd-to-grd.cjs` (28 occurrences of its own patterns) was built for the v1.0 rename and is not designed for the grd-to-grd migration. The v1.2 migration is more complex because it also involves command name changes (not just prefix changes).

**How to avoid:**
1. Build a new migration script (or heavily extend `rename-gsd-to-grd.cjs`) that handles each context type separately. Do NOT use a single regex.
2. Create a migration mapping table: `{old_command: new_command}` for all 24 commands in the command mapping table from the spec.
3. Run the migration in layers: (a) file/directory renames first, (b) agent name prefixes in CJS modules, (c) slash command references in workflows, (d) prose references in templates, (e) test fixtures.
4. Extend `verify-rename.cjs` (currently 8 checks scanning 175 files) to check for both `grd` AND `gsd:` residue. The v1.1 audit confirmed it catches these regressions.
5. After migration, run: `grep -r 'grd' grd/ --include='*.md' --include='*.cjs' | grep -v 'grd'` -- zero hits expected (excluding the directory name itself).
6. Decide upfront: is the package directory renamed from `grd` to something else? If yes, the migration is even larger. If no, accept that `grd` directory name is a legacy artifact.

**Warning signs:**
- Users see `/grd:plan-phase` in output when they should see `/grd:plan-inquiry`
- Agent model resolution returns fallback because agent names still use `grd-` prefix in some files but `grd-` in others
- `verify-rename.cjs` passes but a manual grep finds residue (script needs updating too)
- Help text shows a mix of old and new command names
- Test assertions fail because they check for `grd-planner` but the module now exports `grd-planner`

**Phase to address:**
Dedicated namespace migration phase, AFTER upstream sync but BEFORE feature work. This must be atomic -- partial migration is worse than no migration because mixed references cause silent failures.

**GRD-specific risk level:** CRITICAL

---

### Pitfall 3: Researcher Tier Leaks Into Internal Agent Communication

**What goes wrong:**
The `researcher_tier` (Guided/Standard/Expert) is meant to control how GRD communicates with the _user_. It should NOT affect how agents communicate with each other internally. But the spec says "this setting affects agent prompts" -- and GRD's architecture has agents reading agent-generated output as their input. The planner reads the researcher's output; the executor reads the planner's output; the verifier reads the executor's output. If a Guided-tier agent writes verbose, explanatory prose ("I'm now conducting a thematic analysis -- that means..."), the next agent in the chain receives that verbosity as input, wasting context budget and potentially confusing structured parsing.

The risk is especially acute in three places:
- **Planner subagent prompt** (`planner-subagent-prompt.md`, 7 grd references): generates PLAN.md files that the executor parses for task structure
- **Phase prompt** (`phase-prompt.md`, 2 grd references): generates the execution context that subagents read
- **Verification report** (`verification-report.md`): generates structured pass/fail output that the progress system parses

**Why it happens:**
The spec defines tier as affecting "agent prompts, templates, verification feedback, and error messages." The natural implementation is to inject tier-awareness into the system prompt for every agent. But some agents produce output that is consumed by other agents (machine-to-machine), while others produce output consumed by the user (machine-to-human). The distinction is not explicit in the current architecture.

**How to avoid:**
1. Classify every agent output as either "user-facing" or "agent-facing." User-facing outputs: verification feedback, error messages, progress reports, next-action guidance. Agent-facing outputs: PLAN.md task blocks, phase prompts, state updates, frontmatter.
2. Apply tier adaptation ONLY to user-facing outputs. Agent-facing outputs always use Standard tier internally for consistent structure.
3. Implement tier as a formatting layer at the output boundary, not as a prompt injection at the system level. The agent produces structured output; a formatting function wraps it in tier-appropriate language before presenting to the user.
4. Test with a Guided-tier config: verify that PLAN.md files, STATE.md updates, and VERIFICATION.md files remain structurally identical to Expert-tier output. Only the messages shown in the terminal should differ.

**Warning signs:**
- PLAN.md files contain explanatory prose that is not part of the task structure when using Guided tier
- Executor subagent receives a plan with inline definitions and tutorials instead of clean task blocks
- Context budget overruns because Guided-tier agents produce 3x more text per output
- Verifier produces different structured results depending on tier (it should not)

**Phase to address:**
The researcher tier implementation phase. Must be designed with the user-facing/agent-facing boundary as a first-class concept, not bolted on after agent prompts are already modified.

**GRD-specific risk level:** HIGH

---

### Pitfall 4: Review Type Enforcement Too Rigid (Blocks Progress) or Too Loose (Meaningless)

**What goes wrong:**
The plan-checker must enforce different rigor requirements per review type (7 checks, 5 review types = 35 enforcement cells in the matrix from the spec's "Smart Defaults by Review Type" table). Two failure modes:

**Too rigid:** A systematic review requires "search strategy is systematic (databases named, keywords listed, date ranges specified)" for every plan. But early-phase investigation plans may be exploratory -- the researcher does not yet know which databases are relevant. If the plan-checker rejects every plan that lacks database names, it blocks the researcher from doing the preliminary scoping that would tell them which databases matter.

**Too loose:** A narrative review has "light" plan_check rigor. If "light" means "no checks at all," then review_type is purely decorative -- a narrative review plan with no sources passes the same as one with careful source selection. The setting provides false confidence.

**Why it happens:**
The spec defines what checks apply to which review types (a clean matrix), but it does not define the _timing_ of enforcement. Research is iterative: early phases are exploratory, later phases are confirmatory. The rigor requirements that make sense for a Phase 4 plan are inappropriate for a Phase 1 plan. The existing plan-checker (tested in `plan-checker-rules.test.cjs`) enforces rules uniformly across all phases.

**How to avoid:**
1. Implement enforcement as a graduated scale, not a binary gate. Phase 1-2 plans get advisory warnings ("Note: systematic reviews typically name databases"); Phase 3+ plans get blocking errors.
2. Define exactly what "light" plan_check rigor means for narrative reviews. Proposal: source attachment is still required (table stakes for GRD), but source diversity and search strategy completeness are advisory only.
3. Make the spec's "can be downgraded mid-study" path friction-free. If a researcher starts as systematic and discovers they need to downgrade to scoping, the plan-checker must accept existing plans without re-validation.
4. Add a `--override` flag to plan-inquiry for cases where the researcher knows the check is inapplicable. Log the override in the Decision Log for auditability.
5. Test with real scenarios: create a systematic review plan that deliberately omits database names in Phase 1, and verify the plan-checker gives an advisory rather than a block.

**Warning signs:**
- Researchers immediately downgrade from systematic to narrative to avoid plan-checker friction (suggests checks are too rigid)
- Plan-checker passes everything for narrative reviews with zero feedback (suggests checks are too loose)
- The same plan passes or fails depending on review type with no change to the plan content (confusing UX)
- Researchers use `--skip-verify` on every plan (complete bypass -- enforcement is useless)

**Phase to address:**
The plan-checker enhancement phase. Must be designed with phase-aware graduated enforcement, not uniform rules.

**GRD-specific risk level:** HIGH

---

### Pitfall 5: Synthesis Stage Couples Too Tightly to Investigation Stage

**What goes wrong:**
The synthesis stage (`/grd:synthesize`) must read ALL verified research notes from investigation phases to produce THEMES.md, FRAMEWORK.md, GAPS.md, and the Executive Summary. If the synthesis implementation directly reads investigation phase files by path convention (e.g., scanning `.planning/phases/*/` for `*.md` files), it becomes tightly coupled to the investigation stage's file layout. Three failure scenarios:

1. **Recursive loops break synthesis:** The spec explicitly supports recursive loops -- "investigation reveals the research question was wrong" triggers a return to Stage 1; "synthesis reveals an uninvestigated sub-topic" triggers Stages 2-4. If synthesis hard-codes expectations about which phases contain notes and which do not, a decimal phase inserted via `/grd:insert-inquiry` (e.g., Phase 2.1) may be invisible to synthesis.
2. **Note format assumptions:** Synthesis expects notes to have specific frontmatter (`era`, `review_type`, `sources` count). If some notes were written before the v1.2 template changes (e.g., notes from a partially-completed study that is being continued), they lack these fields. Synthesis that requires these fields crashes or silently skips old notes.
3. **Partial synthesis:** The spec allows `--skip-themes`, `--skip-framework`, `--skip-gaps`. But 6d (argument construction) "always runs if synthesis is enabled" and depends on THEMES.md, FRAMEWORK.md, and GAPS.md as inputs. If themes are skipped, does argument construction still run? With what input?

**Why it happens:**
Synthesis is a new stage being built from scratch. There is no existing GSD pattern for a stage that aggregates across all previous phases. The closest analog is the milestone audit (`/grd:audit-study`), which reads all phase SUMMARYs -- but audit is read-only verification, while synthesis produces new artifacts.

**How to avoid:**
1. Build a note discovery function that finds all research notes regardless of phase directory structure. Use the note frontmatter (`project`, `inquiry`, `status`) to determine inclusion, not the file path. This handles decimal phases, inserted inquiries, and notes from different milestones.
2. Make every frontmatter field that synthesis reads optional with sensible defaults. `era` defaults to `null` (unpositioned). `review_type` defaults to the study-level review_type from config.json. `sources` defaults to counting files in the `-sources/` sibling directory.
3. Define explicit dependency rules for the skip flags: if `--skip-themes` is used, 6d receives "themes not synthesized" as input and adapts its argument construction accordingly. Do not make 6d crash; make it produce a partial synthesis with clear documentation of what was omitted.
4. Synthesis outputs (THEMES.md, FRAMEWORK.md, GAPS.md) go to the vault root (as specified in the file structure diagram), NOT inside a phase directory. This prevents synthesis from being confused with investigation.

**Warning signs:**
- Synthesis produces empty output for studies with decimal phases (2.1, 3.1)
- Notes from before v1.2 are silently excluded from synthesis
- `--skip-themes` followed by argument construction crashes with "THEMES.md not found"
- Running synthesis twice produces different results (non-idempotent -- path scanning picks up synthesis artifacts from the first run)

**Phase to address:**
The synthesis stage implementation phase. The note discovery mechanism should be designed and tested before any synthesis logic is built on top of it.

**GRD-specific risk level:** HIGH

---

### Pitfall 6: Config Migration Breaks Existing Projects

**What goes wrong:**
The v1.2 config.json schema adds three new top-level fields (`researcher_tier`, `review_type`, `epistemological_stance`) and two new workflow keys (`critical_appraisal`, `temporal_positioning`, `synthesis`). The current config.json template has 24 keys across 5 sections. Existing projects created with v1.0 or v1.1 have config.json files that lack these keys. Three failure modes:

1. **Hard crash:** Code reads `config.researcher_tier` and gets `undefined`. If it uses this value in a string template (`"Running in ${config.researcher_tier} mode"`), the output is "Running in undefined mode." If it indexes an object with it (`TIER_PROMPTS[config.researcher_tier]`), it gets `undefined` and the next operation crashes.
2. **Silent wrong behavior:** Code checks `if (config.workflow.critical_appraisal)` and the key does not exist. JavaScript's `undefined` is falsy, so critical appraisal is silently disabled for every existing project. The spec says critical_appraisal defaults to `true` -- but the default is only in the config template, not in the running code.
3. **Migration destroys customization:** If the upgrade path is "replace config.json with new template," existing customizations (parallelization settings, gate configurations, safety settings) are lost.

**Why it happens:**
The `loadConfig` function in core.cjs reads config.json and returns the raw parsed object. There is no schema validation, no default-filling, no version migration. This works fine when the schema is stable. But v1.2 changes the schema substantially, and loadConfig does not distinguish between "user explicitly set this to false" and "this key does not exist in the file."

**How to avoid:**
1. Add a `configWithDefaults(rawConfig)` function that deep-merges the raw config with a complete defaults object. Every new key has an explicit default. Existing keys are preserved. This function runs inside `loadConfig` so every consumer gets complete config.
2. Define defaults in one place (a `CONFIG_DEFAULTS` constant), not scattered across consumer code. The spec's config example is the defaults object.
3. For the `researcher_tier` default: use `"guided"` (spec says this is the most inclusive tier). For `review_type`: use `null` (must be set during research formulation, not silently defaulted). For `epistemological_stance`: use `"pragmatist"` (spec says this is the default when skipped).
4. Do NOT add a config migration step that rewrites existing config.json files. Instead, make the code tolerant of missing keys via the defaults function. Users can add keys to their config when they want to override defaults.
5. Add a `config version` field to config.json (`"config_version": "1.2"`). This enables future migrations and lets the code warn when a config is from an older version.

**Warning signs:**
- "undefined" appears in any user-facing output
- Existing projects behave differently after upgrading GRD without any config changes
- Critical appraisal is disabled for existing projects even though the spec says default is `true`
- User's custom parallelization or gate settings disappear after upgrade

**Phase to address:**
The config schema expansion phase, which should be early (before any feature depends on the new config keys). The `configWithDefaults` function is a prerequisite for all v1.2 features.

**GRD-specific risk level:** HIGH

---

### Pitfall 7: Test Coverage Gaps During Major Refactor

**What goes wrong:**
v1.2 changes nearly everything: namespace, command names, agent names, config schema, templates, plan-checker rules, verification tiers, and adds an entirely new synthesis stage. The existing 164 tests (across 9 test files) were written for the v1.0/v1.1 feature set. Three gap categories:

1. **Tests that should break but do not:** If namespace migration changes agent names from `grd-planner` to `grd-planner` but model-profiles.test.cjs still tests `grd-planner`, and the test passes because the old keys are still in the code alongside the new ones, the test is passing for the wrong reason. Dual-namespace support means both old and new work, but the intent is to remove the old namespace entirely.

2. **New features with no test coverage:** Synthesis stage, Tier 0 verification (sufficiency of evidence), researcher tier template selection, review type enforcement in plan-checker, config default-filling, and temporal positioning validation are all new. If they ship without tests, regressions are invisible.

3. **Tests that break and get deleted instead of fixed:** During a large refactor, it is tempting to delete tests that fail rather than understanding why they fail and updating them. The v1.1 audit found that "Nyquist compliance" was only partial for 2 of 6 phases -- meaning validation was incomplete even with a test-first discipline.

**Why it happens:**
The v1.2 scope is large: 14 verification criteria in the spec, spanning command namespace, researcher tier, review type, epistemological stance, parallel researchers, evidence quality, temporal positioning, synthesis stage, three-tier verification, recursive loops, and trap doors. Each criterion needs its own test coverage. The existing test infrastructure (node:test with strict assertions, dependency injection for tool calls) is well-suited, but the tests themselves need to be written.

**How to avoid:**
1. Write tests BEFORE implementing each feature (TDD discipline already established in v1.0/v1.1). For v1.2, create test skeletons for each verification criterion from the spec before writing any implementation code.
2. For the namespace migration: update ALL test fixtures to use new names FIRST, verify they fail, THEN implement the migration, verify they pass. This ensures tests are actually testing the new namespace, not accidentally passing on old code.
3. Create a test coverage checklist tied to the spec's 14 verification criteria. Each criterion maps to specific test cases. No feature ships without its corresponding test.
4. For synthesis stage: write integration tests that create mock research notes, run synthesis, and verify output structure. The existing e2e.test.cjs pattern (create temp directory, populate with fixtures, run tool commands, verify output) is the right pattern.
5. Never delete a failing test without understanding why it fails. If the test is obsolete (tests a feature that no longer exists), document why it was removed. If the test is correct but the implementation changed, update the test to match the new behavior.

**Warning signs:**
- Test count decreases after a phase (tests were deleted, not fixed)
- New features have zero test coverage (check with `grep -L 'test\|describe' test/*.test.cjs` for missing test files)
- Tests pass but manual testing reveals bugs (tests are not exercising the right code paths)
- `node --test test/*.test.cjs` shows 164 passing but all 164 are from v1.0/v1.1 -- zero new tests added

**Phase to address:**
Every phase. Each phase must add tests for the features it implements. The upstream sync phase must update existing tests for the new baseline. The namespace migration phase must update test fixtures. The synthesis phase must add integration tests.

**GRD-specific risk level:** HIGH

---

## Moderate Pitfalls

### Pitfall 8: Command Name Mapping Creates Broken Cross-References

**What goes wrong:**
The spec defines 24 command mappings (e.g., `/grd:execute-phase N` becomes `/grd:conduct-inquiry N`). But GRD's workflow files heavily cross-reference each other. The `plan-phase.md` workflow (30 grd references) suggests running `/grd:execute-phase` after planning completes. The `autonomous.md` workflow (24 references) chains multiple commands together. If command A is renamed but its reference in workflow B is not updated, the user gets told to run a command that does not exist.

The v1.1 audit already found this exact pattern: `autonomous.md` correctly used `grd:` but `plan-phase.md:529` and `discuss-phase.md:682` still used stale `gsd:` Skill() calls. With 24 commands being renamed simultaneously, the surface area for this error is 24x larger.

**How to avoid:**
Build the command mapping table into the migration script. For each old command, grep for all references (not just the command definition), and replace each reference with the new command name. After migration, verify with: `for cmd in plan-phase execute-phase verify-work discuss-phase new-project complete-milestone; do echo "--- $cmd ---"; grep -rn "$cmd" grd/workflows/; done` -- all hits should show new names.

**Warning signs:**
- `/grd:progress` suggests running `/grd:plan-phase` (old name in new namespace)
- Skill() calls reference commands that no longer exist
- Help text shows a mix of old and new command names

**Phase to address:**
Namespace migration phase. Must be part of the same atomic migration as agent name changes.

---

### Pitfall 9: Three-Tier Verification Breaks Existing Two-Tier Workflows

**What goes wrong:**
The existing verification workflow (`verify-work.md`, 19 grd references) implements two tiers: goal-backward and source audit. v1.2 adds Tier 0 (sufficiency of evidence) as a new first tier. If Tier 0 is inserted before the existing tiers without updating the verification routing logic, three things break:

1. The `--skip-tier0` flag needs to be threaded through the verification workflow, which currently has no concept of tier selection.
2. The verification result routing (passed/human_needed/gaps_found) needs to account for Tier 0 results. A note can pass goal-backward and source audit but fail sufficiency -- what is the routing? The spec says the same 3-way routing applies, but the _triggers_ for each route are different at Tier 0 (sufficiency asks "is there enough evidence?" not "does this note answer its question?").
3. The existing verify.cjs (`cmdInitVerifyWork`) resolves planner and checker models but does not resolve a "sufficiency assessor" model. If Tier 0 uses a different agent, the init function needs updating.

**How to avoid:**
Implement Tier 0 as a separable, skippable pre-check that runs before the existing two tiers. The existing verification logic should be untouched -- Tier 0 is a new gate that either passes (continue to Tiers 1+2) or flags issues (route to human_needed). This preserves backward compatibility: `config.workflow.verifier: true` with no Tier 0 config behaves exactly as before.

**Warning signs:**
- Verification takes noticeably longer (Tier 0 is doing expensive cross-note analysis)
- Existing projects that passed verification before now fail at Tier 0
- `--skip-tier0` flag is not wired through and has no effect

**Phase to address:**
Verification enhancement phase. Should be implemented after investigation features are stable, so there are real notes to verify.

---

### Pitfall 10: Parallel Researcher Renaming Breaks Research Phase Workflow

**What goes wrong:**
The four parallel researchers are being renamed and rechartered: Stack becomes Methodological Landscape, Features becomes Prior Findings, Architecture becomes Theoretical Framework, Pitfalls becomes Limitations & Debates. This is not just a name change -- the agent prompts, model profile entries, and research workflow orchestration all reference these researchers by name. The `research-phase.md` workflow (7 grd references) spawns researchers. The `new-project.md` workflow (28 references) orchestrates the initial research. The `model-profiles.cjs` (22 grd references, 19 agents defined) maps agent names to model tiers.

If agent names are changed in model-profiles.cjs but the workflow files still spawn agents by old names, model resolution falls through to the default. If the workflows are updated but the agent prompt files (in `agents/`) still have old names, the spawned agent reads the wrong prompt.

**How to avoid:**
Rename in lockstep: (1) rename agent files in `agents/`, (2) update model-profiles.cjs keys, (3) update init.cjs model resolution calls, (4) update workflow files that spawn these agents. Test each researcher individually after renaming.

**Warning signs:**
- Research phase spawns agents that all resolve to the same default model
- Agent prompt content does not match the researcher's stated purpose
- Researcher output is generic rather than domain-specific (reading wrong prompt file)

**Phase to address:**
Part of the namespace migration phase or a dedicated parallel researchers phase. Must be atomic -- all four researchers renamed together.

---

### Pitfall 11: Epistemological Stance Has No Downstream Effect

**What goes wrong:**
The spec says epistemological stance "shapes what counts as valid evidence and how the critical appraisal step operates." It is stored in config.json. But if the implementation only captures the stance during research formulation and writes it to PROJECT.md without threading it through to the critical appraisal logic, it becomes a decorative field. A positivist review that prioritizes RCTs and a constructivist review that values rich description would produce identical Evidence Quality tables -- the stance made no difference.

**Why it happens:**
Epistemological stance is the most abstract of the v1.2 additions. Unlike review type (which has a concrete enforcement matrix) or researcher tier (which has concrete template differences), stance affects _judgment criteria_ that are hard to codify. The natural implementation path is to capture it and defer the downstream effects to "later."

**How to avoid:**
Define at least two concrete behavioral differences per stance at implementation time. Example: (a) positivist: Evidence Quality table includes a "Level of Evidence" column using a formal hierarchy (meta-analysis > RCT > cohort > case study); constructivist: Evidence Quality table includes a "Trustworthiness" column (credibility, transferability, dependability, confirmability per Lincoln & Guba). (b) positivist: Tier 0 sufficiency checks for methodological diversity weighted by evidence hierarchy; constructivist: Tier 0 checks for theoretical saturation.

**Warning signs:**
- `epistemological_stance` is in config.json and PROJECT.md but never read by any other code
- grep for `epistemological_stance` returns hits only in config loading and project template, never in plan-checker, verification, or note template logic
- Changing the stance from positivist to constructivist produces identical output

**Phase to address:**
Can be deferred to a later phase within v1.2, but must have at least a stub implementation that threads through to one behavioral difference before the milestone closes. Full implementation can be graduated.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Dual namespace support (accept both grd: and grd:) | Smooth migration, nothing breaks | Doubles maintenance surface; unclear which is canonical; tests must check both | Only during a single transitional phase with a documented removal date |
| Config keys without defaults in loadConfig | Less code to write initially | Every consumer must null-check; "undefined" appears in user output; existing projects break | Never -- configWithDefaults is a prerequisite |
| Synthesis reads files by path convention | Simpler implementation | Breaks on decimal phases, recursive loops, cross-milestone notes | Only for MVP if path convention is well-documented and tested for edge cases |
| Skip epistemological stance downstream effects | Faster to ship other features | Decorative field; erodes trust in the tool's scholarly rigor | Acceptable if documented as "captured but not yet enforced" with clear plan |
| Review type enforcement as binary (pass/fail) | Simpler plan-checker logic | Blocks researchers on early exploratory phases; causes downgrade cascade | Never -- graduated enforcement (advisory vs. blocking) is essential |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| model-profiles.cjs agent renaming | Rename keys in model-profiles but not in init.cjs resolveModelInternal calls | Search for EVERY call to resolveModelInternal (12+ in init.cjs alone) and update the agent name argument |
| config.json schema expansion | Add new keys to template but not to loadConfig defaults | Add configWithDefaults function that deep-merges raw config with CONFIG_DEFAULTS constant |
| Workflow cross-references | Update the workflow's own commands but not its references to other commands | Build a complete command mapping and apply it to ALL workflow files, not just the renamed workflow |
| verify-rename.cjs maintenance | Add new checks for grd namespace but forget to remove grd checks | Update the script to check for BOTH residual grd references AND missing grd references |
| Test fixture updates | Update code to use new names but leave test fixtures with old names (tests pass by accident) | Update fixtures FIRST, verify tests fail, THEN update code, verify tests pass |

## "Looks Done But Isn't" Checklist

- [ ] **Namespace migration:** `grep -r 'grd' grd/ --include='*.md' --include='*.cjs' | grep -v 'grd'` returns zero hits (excluding directory name)
- [ ] **Command mapping complete:** Every command in the spec's 24-command mapping table has both (a) a renamed workflow file and (b) zero references to the old command name in any other file
- [ ] **Agent name consistency:** `grep -r 'grd-planner\|grd-executor\|grd-verifier' grd/` returns zero hits; all 19 agents use `grd-` prefix
- [ ] **Config defaults:** `loadConfig` on an empty config.json returns a complete config object with all v1.2 keys populated with defaults
- [ ] **Researcher tier boundary:** PLAN.md files are structurally identical across all three tiers (Guided/Standard/Expert); only terminal output differs
- [ ] **Review type enforcement:** Plan-checker gives advisory (not blocking) warnings for Phase 1-2 plans even in systematic review mode
- [ ] **Synthesis note discovery:** Synthesis finds notes in decimal phases (2.1, 3.1) and inserted inquiries
- [ ] **Synthesis idempotency:** Running `/grd:synthesize` twice on the same data produces identical output (synthesis artifacts from first run are not re-ingested)
- [ ] **Tier 0 skippable:** `--skip-tier0` flag actually bypasses sufficiency check; existing verification behavior is unchanged when Tier 0 config is absent
- [ ] **Epistemological stance downstream:** At least one behavioral difference exists between positivist and constructivist stance (not just stored in config)
- [ ] **Existing tests pass:** All 164 tests from v1.0/v1.1 pass on the new codebase (updated for new namespace)
- [ ] **New tests exist:** Test count is >164, covering at least: namespace migration, config defaults, review type enforcement, researcher tier templates, synthesis stage, Tier 0 verification

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Upstream sync destroys research layer | MEDIUM | Restore research functions from git history (pre-sync commit); re-apply to synced file; re-run tests |
| Mixed namespace references | LOW-MEDIUM | Run updated verify-rename script; fix all reported hits; re-verify |
| Researcher tier leaks into agent-to-agent communication | HIGH | Requires architectural change: introduce output formatting layer between agent internals and user-facing presentation |
| Review type enforcement too rigid | LOW | Change plan-checker rules from blocking to advisory for early phases; update test expectations |
| Synthesis tightly coupled to file paths | MEDIUM | Refactor to frontmatter-based note discovery; update synthesis to use discovery function |
| Config migration breaks existing projects | LOW | Add configWithDefaults function; no changes to existing config.json files needed |
| Test coverage gaps | MEDIUM | Write missing tests retroactively; this is slower than TDD but achievable |
| Command cross-references stale | LOW | Run command mapping table as a migration script across all workflow files |
| Three-tier verification breaks routing | MEDIUM | Isolate Tier 0 as a pre-check with its own skip flag; existing verification untouched |
| Parallel researcher mismatch | LOW | Rename in lockstep: agent files, model-profiles, init.cjs, workflows -- all in one commit |
| Epistemological stance is decorative | LOW | Add one concrete behavioral difference per stance; defer full implementation |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Upstream sync destroys research layer | Phase 1: Upstream sync (v1.25.1) | All 164 tests pass; research exports verified; `module.exports` entry count unchanged |
| Mixed namespace references | Phase 2: Namespace migration | Updated verify-rename.cjs passes; manual grep confirms zero residue |
| Researcher tier leaks | Phase 3: Researcher tier implementation | PLAN.md structural diff across tiers shows zero differences; only terminal output differs |
| Review type too rigid/loose | Phase 4: Plan-checker enhancement | Phase 1-2 plans pass with advisory warnings in systematic mode; Phase 3+ plans blocked for missing databases |
| Synthesis coupling | Phase 5: Synthesis stage | Synthesis finds notes in decimal phases; skip flags produce partial (not crashed) output |
| Config migration | Phase 2-3: Config schema expansion (early) | loadConfig on v1.0 config.json returns complete object; no "undefined" in any output |
| Test coverage gaps | Every phase | Test count increases with each phase; new features have corresponding test files |
| Command cross-references | Phase 2: Namespace migration | Zero stale command names in any workflow file; help output shows only new names |
| Three-tier verification | Phase 6: Verification enhancement | `--skip-tier0` works; existing verification unchanged when Tier 0 absent |
| Parallel researcher mismatch | Phase 2: Namespace migration | All four researchers spawn with correct model and correct prompt |
| Epistemological stance decorative | Phase 7: Epistemological stance | grep confirms stance is read outside config/project template; output differs by stance |

## Sources

- Direct codebase analysis: `grep -r 'grd' grd/` (681 occurrences across 70 files in package; 1,907 across 172 files total)
- v1.1 milestone audit: `.planning/milestones/v1.1-MILESTONE-AUDIT.md` (namespace leak patterns, tech debt inventory)
- v1.1 pitfalls research: `.planning/research/PITFALLS.md` (upstream sync lessons learned)
- v1.2 spec: `docs/GRD-v1.2-Research-Reorientation-Spec.md` (14 verification criteria, command mapping table, smart defaults matrix)
- Config template: `grd/templates/config.json` (current 24-key schema)
- Init module: `grd/bin/lib/init.cjs` (12+ resolveModelInternal calls with agent name arguments)
- Current test inventory: 9 test files, 164 tests (test/*.test.cjs)
- Upstream version gap: v1.24.0 (current) to v1.25.1 (installed at `~/.claude/get-shit-done/`)

---
*Pitfalls research for: GRD v1.2 Research Reorientation*
*Researched: 2026-03-17*
