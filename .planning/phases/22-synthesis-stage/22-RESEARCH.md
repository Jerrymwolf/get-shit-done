# Phase 22: Synthesis Stage - Research

**Researched:** 2026-03-21
**Domain:** Research synthesis workflow, agent orchestration, scholarly output generation
**Confidence:** HIGH

## Summary

Phase 22 builds the `/grd:synthesize` workflow that transforms verified research notes into structured scholarship through four activities: thematic synthesis, theoretical integration, gap analysis, and argument construction. The implementation reuses the existing execute-phase machinery (wave-based execution, subagent spawning, PLAN.md/SUMMARY.md lifecycle) and adds 4 new agent types to model-profiles.cjs. The workflow must enforce a strict dependency ordering: themes first, then framework and gaps in parallel, then argument construction last.

The primary technical work is: (1) a new `synthesize.md` workflow file following the conduct-inquiry pattern, (2) 4 new synthesis agent prompt files with embedded methodological guardrails, (3) model-profiles.cjs additions, (4) modifications to new-research.md and PROJECT.md template to add `deliverable_format`, (5) modifications to complete-study.md for synthesis validation, and (6) tests covering the workflow.

**Primary recommendation:** Follow the existing conduct-inquiry.md wave execution pattern exactly -- themes as wave 1, framework+gaps as wave 2, argument as wave 3. Each synthesis activity is a task in a generated PLAN.md, executed by a subagent with the appropriate agent type. The synthesize workflow generates this plan dynamically based on readiness validation and skip flags.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 4 dedicated agent types in model-profiles.cjs: `grd-thematic-synthesizer`, `grd-framework-integrator`, `grd-gap-analyzer`, `grd-argument-constructor`. Matches the 4-researcher pattern from Stage 1. Each gets a focused system prompt grounded in its methodology.
- **D-02:** Methodological frameworks embedded as guardrails in each agent's system prompt. Braun & Clarke (2006) reflexive thematic analysis for themes. Carroll et al. (2013) best-fit framework synthesis for theoretical integration. Muller-Bloch & Kranz (2015) gap taxonomy + Alvesson & Sandberg (2011) problematization for gap analysis. These shape how the agent works, not just what it references.
- **D-03:** All verified research notes passed as file paths in the agent prompt's `<files_to_read>` block. Agents read them at execution start. No pre-compiled digest -- agents work from primary sources.
- **D-04:** Synthesis outputs write directly to vault (`{Study}-Research/00-THEMES.md`, etc.), not to `.planning/`. These are research deliverables, not planning artifacts. Git commit captures the output.
- **D-05:** Readiness gate accepts phases with `passed` or `human_needed` verification. Only `gaps_found` blocks synthesis. The researcher chose to proceed past human_needed items -- respect that choice.
- **D-06:** Partial synthesis via `--partial` flag. Default requires all investigation phases verified. `--partial` synthesizes from whatever is verified so far -- useful for iterative research.
- **D-07:** Per-activity prerequisite validation. Themes requires verified notes. Framework requires THEMES.md + theoretical framework survey from Stage 1 researchers. Gaps requires THEMES.md + FRAMEWORK.md. Argument requires all three. Validates the full dependency chain before each activity.
- **D-08:** Readiness failure errors route to specific next actions. Unverified phase -> "Run `/grd:verify-inquiry {phase}`". Missing framework survey -> "Check Stage 1 researcher output". No notes -> "Run `/grd:conduct-inquiry` first".
- **D-09:** `deliverable_format` field added to PROJECT.md during `/grd:new-research`. Options: `literature_review`, `research_brief`, `build_spec`, `custom`. Argument agent reads this field to select output structure.
- **D-10:** Scholarly standard baseline structure: Introduction (research questions + significance) -> Key Themes (from THEMES.md) -> Theoretical Implications (from FRAMEWORK.md) -> Gaps & Future Directions (from GAPS.md) -> Conclusion (the argument -- what this body of evidence means and advances).
- **D-11:** Inline note-level citations for traceability. Format: `[Note: {note-name}]`. Every claim links to the research note(s) that support it. Maintains GRD's core value: every finding is auditable back to its source.
- **D-12:** Markdown only output. `{Study}-Research/00-Executive-Summary.md`. Researcher uses external tools (pandoc, etc.) for format conversion. GRD focuses on content, not formatting.
- **D-13:** Deliverable assembly = compile + validate. Complete-study verifies all synthesis outputs exist (THEMES/FRAMEWORK/GAPS/Executive Summary), checks that Executive Summary references all identified themes, and produces a final status report. Not a new document -- a validation gate.
- **D-14:** Synthesis required before completion only when `config.workflow.synthesis` is `true` (default for systematic, integrative, critical). When synthesis is `false` (e.g., narrative), complete-study skips synthesis validation.
- **D-15:** Minimal changes to existing `complete-study.md` -- add a synthesis validation step before the existing archival flow. No full rewrite.
- **D-16:** Brief study stats in completion output: note count, source count, theme count, gap count, verification status. Quick snapshot of research scope from existing STATE.md data.

### Claude's Discretion

- Exact agent prompt wording and methodological guardrail depth
- THEMES.md / FRAMEWORK.md / GAPS.md internal template structure (as long as they support the argument agent's needs)
- Wave grouping within the synthesize workflow (themes = wave 1, framework + gaps = wave 2, argument = wave 3 is the expected pattern)
- Test structure for TEST-05

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SYN-01 | `/grd:synthesize` workflow exists and reuses execute-phase machinery | Workflow pattern documented from conduct-inquiry.md; wave execution model applies directly |
| SYN-02 | Thematic synthesis agent produces THEMES.md | Agent profile + prompt template pattern from existing 4 researchers; Braun & Clarke methodology |
| SYN-03 | Theoretical integration agent produces FRAMEWORK.md | Carroll et al. best-fit framework synthesis; requires Stage 1 Theoretical Framework Survey |
| SYN-04 | Gap analysis agent produces GAPS.md | Muller-Bloch & Kranz taxonomy + Alvesson & Sandberg problematization |
| SYN-05 | Argument construction agent produces Executive Summary | deliverable_format field drives output structure; D-10 baseline structure |
| SYN-06 | Synthesis respects dependency ordering | Wave execution: wave 1 (themes) -> wave 2 (framework+gaps parallel) -> wave 3 (argument) |
| SYN-07 | Synthesis skippable via config and flags | `config.workflow.synthesis: false` toggle already exists in SMART_DEFAULTS; add `--skip-*` flag parsing |
| SYN-08 | Synthesis output follows vault directory structure with `00-` prefixed files | Spec lines 296-313 define structure; outputs go to `{Study}-Research/00-*.md` |
| TRAP-04 | Synthesis scope interactive gate | TRAP-01/02/03 patterns established; same AskUserQuestion approach |
| COMP-01 | `/grd:complete-study` includes deliverable assembly | Minimal addition to existing complete-study.md -- synthesis validation step |
| TEST-05 | New tests cover synthesis stage workflow | Node test runner (node:test + node:assert/strict); test file: `test/synthesis.test.cjs` |

</phase_requirements>

## Standard Stack

### Core

No new external dependencies. This phase is entirely within the GRD tool ecosystem using existing infrastructure:

| Component | Location | Purpose | Why Standard |
|-----------|----------|---------|--------------|
| node:test | Built-in | Test framework | All existing tests use this |
| node:assert/strict | Built-in | Assertions | All existing tests use this |
| grd-tools.cjs | `grd/bin/grd-tools.cjs` | CLI orchestration | Existing toolchain |
| model-profiles.cjs | `grd/bin/lib/model-profiles.cjs` | Agent-to-model mapping | Where to add 4 new agents |
| config.cjs | `grd/bin/lib/config.cjs` | Config with defaults | SMART_DEFAULTS already has synthesis toggle |
| tier-strip.cjs | `grd/bin/lib/tier-strip.cjs` | Tier-conditional content | New workflow/templates need tier blocks |

### Files to Create

| File | Pattern Source | Purpose |
|------|---------------|---------|
| `grd/workflows/synthesize.md` | `grd/workflows/conduct-inquiry.md` | Orchestrator workflow for synthesis |
| `grd/agents/grd-thematic-synthesizer.md` | New (no existing agent files -- agents are inline in plans) | Thematic synthesis agent prompt |
| `grd/agents/grd-framework-integrator.md` | New | Theoretical integration agent prompt |
| `grd/agents/grd-gap-analyzer.md` | New | Gap analysis agent prompt |
| `grd/agents/grd-argument-constructor.md` | New | Argument construction agent prompt |
| `grd/templates/themes.md` | New | THEMES.md output template |
| `grd/templates/framework.md` | New | FRAMEWORK.md output template |
| `grd/templates/gaps.md` | New | GAPS.md output template |
| `grd/templates/executive-summary.md` | New | Executive Summary output template |
| `test/synthesis.test.cjs` | `test/model-profiles.test.cjs` | Synthesis stage tests |

### Files to Modify

| File | Change | Scope |
|------|--------|-------|
| `grd/bin/lib/model-profiles.cjs` | Add 4 new agent entries | Small -- 4 lines in MODEL_PROFILES |
| `grd/workflows/new-research.md` | Add `deliverable_format` question | Small -- one new question in scoping |
| `grd/templates/project.md` | Add `deliverable_format` field | Small -- one new section |
| `grd/workflows/complete-study.md` | Add synthesis validation step | Medium -- new step before archival |
| `grd/templates/config.json` | No change needed | `workflow.synthesis` already present |
| `test/model-profiles.test.cjs` | Update agent count from 19 to 23 | Small -- change constant |

## Architecture Patterns

### Recommended Structure

```
grd/
├── workflows/
│   └── synthesize.md          # New: orchestrator workflow
├── agents/
│   ├── grd-thematic-synthesizer.md
│   ├── grd-framework-integrator.md
│   ├── grd-gap-analyzer.md
│   └── grd-argument-constructor.md
├── templates/
│   ├── themes.md              # Output template for THEMES.md
│   ├── framework.md           # Output template for FRAMEWORK.md
│   ├── gaps.md                # Output template for GAPS.md
│   └── executive-summary.md   # Output template for Executive Summary
└── bin/lib/
    └── model-profiles.cjs     # +4 agents
```

### Pattern 1: Wave-Based Synthesis Execution

**What:** The synthesize workflow generates a PLAN.md with 3 waves matching the dependency ordering, then delegates to execute-phase machinery.

**When to use:** Always -- this is how the workflow operates.

**How it works:**

1. User invokes `/grd:synthesize`
2. Workflow validates readiness (all investigation phases verified, or `--partial`)
3. TRAP-04 interactive gate: "Full synthesis" / "Themes + argument only" / "Skip synthesis"
4. Workflow generates a PLAN.md with tasks grouped into waves:
   - Wave 1: Thematic synthesis task (produces 00-THEMES.md)
   - Wave 2: Framework integration + Gap analysis tasks (parallel, produce 00-FRAMEWORK.md and 00-GAPS.md)
   - Wave 3: Argument construction task (produces 00-Executive-Summary.md)
5. Workflow invokes execute-phase machinery to run the generated plan
6. Each task spawns a subagent with the appropriate agent type

**Key detail:** The synthesize workflow does NOT execute the agents directly. It generates a structured PLAN.md and delegates execution to the existing execute-phase machinery. This reuses all existing infrastructure: wave grouping, parallel execution, SUMMARY.md creation, git commits, STATE.md updates.

### Pattern 2: Agent Prompt Structure for Synthesis

**What:** Each synthesis agent receives its methodological framework, input file paths, and output template as part of its prompt.

**Structure:**

```markdown
<purpose>
[What this agent does -- one paragraph]
</purpose>

<methodology>
[Scholarly framework that governs how the agent works]
[Braun & Clarke / Carroll et al. / Muller-Bloch & Kranz / etc.]
</methodology>

<inputs>
<files_to_read>
[List of file paths -- verified notes, THEMES.md, etc.]
</files_to_read>
</inputs>

<output_template>
[Template for the output file]
</output_template>

<quality_criteria>
[What makes a good output -- traceability, coverage, etc.]
</quality_criteria>

<researcher_tier>
[Tier-adaptive communication blocks]
</researcher_tier>
```

### Pattern 3: Readiness Validation

**What:** Before synthesis begins, validate that prerequisites are met.

**Validation chain:**

```
1. Check config.workflow.synthesis !== false
2. Find all investigation phases in ROADMAP.md
3. For each phase, check VERIFICATION.md status:
   - "passed" or "human_needed" -> OK
   - "gaps_found" -> BLOCK (unless --partial)
   - Missing -> BLOCK
4. If --partial: proceed with whatever phases are verified
5. Collect all verified research notes from vault
6. Per-activity prerequisite check (D-07):
   - Themes: at least 1 verified note
   - Framework: THEMES.md exists + Stage 1 Theoretical Framework Survey
   - Gaps: THEMES.md + FRAMEWORK.md exist
   - Argument: all three synthesis outputs exist
```

### Pattern 4: Vault Output Writes

**What:** Synthesis outputs go to the research vault, not `.planning/`.

**Path resolution:**

```
vault_path = config.vault_path or auto-detected from existing research notes
Output paths:
  {vault_path}/00-THEMES.md
  {vault_path}/00-FRAMEWORK.md
  {vault_path}/00-GAPS.md
  {vault_path}/00-Executive-Summary.md
```

### Anti-Patterns to Avoid

- **Executing synthesis agents directly from the workflow:** Always generate a PLAN.md and use execute-phase machinery. Direct execution bypasses wave ordering, SUMMARY.md, git commits, and STATE.md updates.
- **Pre-compiling note digests:** D-03 explicitly says agents work from primary sources. Pass file paths, not summaries.
- **Writing synthesis outputs to `.planning/`:** D-04 says vault only. These are research deliverables.
- **Blocking on `human_needed` verification status:** D-05 says respect the researcher's choice to proceed past human_needed items.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Wave execution ordering | Custom wave scheduler | conduct-inquiry.md wave execution | Already handles wave ordering, parallel execution, failure handling |
| Subagent spawning | Direct Task() calls from workflow | execute-plan.md Task() pattern | Handles context management, tracking, commits |
| Config toggle checking | Manual JSON reads | `config.cjs` configWithDefaults() | Already merges smart defaults for synthesis toggle |
| Tier-conditional content | Manual if/else in templates | `tier-strip.cjs` stripTierContent() | Handles XML and comment modes, cleanup |
| Git commits for vault writes | Manual git add/commit | Existing vault commit pattern in core.cjs | Already handles research file commits |

**Key insight:** The entire execute-phase pipeline (wave execution, subagent spawning, SUMMARY.md, STATE.md updates, git commits) already exists. The synthesize workflow generates the right PLAN.md and lets existing machinery do the work.

## Common Pitfalls

### Pitfall 1: Agent Count Mismatch in Tests

**What goes wrong:** The model-profiles.test.cjs currently asserts exactly 19 agents. Adding 4 new agents without updating this assertion breaks the test.
**Why it happens:** Hard-coded count in test.
**How to avoid:** Update the assertion from 19 to 23 in the same commit that adds the agents.
**Warning signs:** `model-profiles.test.cjs` failing with "Expected 19, got 23".

### Pitfall 2: Missing VALID_CONFIG_KEYS Entry

**What goes wrong:** If `deliverable_format` is added to the config template but not to VALID_CONFIG_KEYS in config.cjs, the config-set command will reject it.
**Why it happens:** VALID_CONFIG_KEYS is a whitelist.
**How to avoid:** Add `deliverable_format` to the VALID_CONFIG_KEYS Set if it needs to be settable via CLI. However, since D-09 says it's set during `/grd:new-research` and stored in PROJECT.md (not config.json), this may not be needed. Verify: is `deliverable_format` a PROJECT.md field or a config.json field?
**Resolution:** Per D-09, it goes in PROJECT.md (the argument agent reads PROJECT.md). No config.json change needed.

### Pitfall 3: Vault Path Resolution

**What goes wrong:** The vault path could be undefined if config.vault_path is empty and no research notes exist yet.
**Why it happens:** vault_path in config.json template defaults to empty string.
**How to avoid:** The synthesize workflow should resolve vault path from existing research notes (find the first `{Study}-Research/` directory), and error clearly if no vault exists.
**Warning signs:** "Cannot find vault" errors when running synthesize.

### Pitfall 4: Skip Flags with Dependency Chain

**What goes wrong:** Skipping themes (--skip-themes) breaks framework and gaps because they depend on THEMES.md.
**Why it happens:** Individual skip flags don't account for the dependency chain.
**How to avoid:** When --skip-themes is used, check if THEMES.md already exists. If not, error: "Cannot skip themes -- THEMES.md does not exist and is required by framework and gaps." Same logic for --skip-framework affecting gaps.
**Warning signs:** "File not found" errors in wave 2 agents.

### Pitfall 5: Theoretical Framework Survey Not Found

**What goes wrong:** The framework integrator needs the Stage 1 Theoretical Framework Survey, but the file name and location vary by study.
**Why it happens:** Stage 1 researchers produce notes with study-specific names in inquiry-specific subdirectories.
**How to avoid:** The readiness validation should search for notes created by the `grd-architecture-researcher` agent type (the "Theoretical Framework Survey" researcher from FORM-02). Use frontmatter or directory naming to identify it.
**Warning signs:** D-08 error: "Missing framework survey -- Check Stage 1 researcher output".

### Pitfall 6: Agents Directory Does Not Exist

**What goes wrong:** The CONTEXT.md references `grd/agents/` for agent prompt files, but this directory does not currently exist in the project.
**Why it happens:** Existing researcher agents (grd-source-researcher, etc.) are only registered in model-profiles.cjs -- they have no standalone prompt files.
**How to avoid:** Create `grd/agents/` directory as part of the first plan. The 4 synthesis agent prompts will be the first files in this directory.
**Warning signs:** File not found when referencing agent prompts.

## Code Examples

### Adding Agent Types to model-profiles.cjs

```javascript
// In MODEL_PROFILES object, after GRD-only research agents:
// --- GRD synthesis agents (match phase-researcher tier) ---
'grd-thematic-synthesizer':     { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
'grd-framework-integrator':     { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
'grd-gap-analyzer':             { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
'grd-argument-constructor':     { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
```

Confidence: HIGH -- follows exact pattern of existing research agents at lines 24-28.

### TRAP-04 Interactive Gate Pattern

Based on existing TRAP-01/02/03 patterns:

```
AskUserQuestion(
  header: "Synthesis Scope",
  question: "How would you like to synthesize your research?",
  options: [
    "Full synthesis (all 4 activities)" -- "Themes, framework, gaps, and argument",
    "Themes + argument only" -- "Skip framework and gap analysis",
    "Skip synthesis" -- "Keep verified notes without synthesis"
  ]
)
```

When "Themes + argument only" is selected: generate plan with wave 1 (themes) and wave 2 (argument only, reading THEMES.md directly). Framework and gaps waves are omitted. The argument agent adapts its structure to work without FRAMEWORK.md and GAPS.md.

### Synthesis PLAN.md Structure (Generated by Workflow)

```yaml
---
phase: 22
plan: 01
name: Research Synthesis
wave_count: 3
requirements: [SYN-01, SYN-02, SYN-03, SYN-04, SYN-05, SYN-06, SYN-08]
---
```

Tasks would follow the pattern:

```xml
<wave n="1">
<task type="synthesis">
  <n>Thematic Synthesis</n>
  <agent>grd-thematic-synthesizer</agent>
  <inputs>
    <files_to_read>[list of all verified note paths]</files_to_read>
  </inputs>
  <o>{vault_path}/00-THEMES.md</o>
  <done>THEMES.md written to vault with theme-to-note mappings</done>
</task>
</wave>

<wave n="2">
<task type="synthesis">
  <n>Theoretical Integration</n>
  <agent>grd-framework-integrator</agent>
  <inputs>
    <files_to_read>
    - {vault_path}/00-THEMES.md
    - [Theoretical Framework Survey note path]
    - [all verified note paths]
    </files_to_read>
  </inputs>
  <o>{vault_path}/00-FRAMEWORK.md</o>
  <done>FRAMEWORK.md written with evidence-mapped framework</done>
</task>

<task type="synthesis">
  <n>Gap Analysis</n>
  <agent>grd-gap-analyzer</agent>
  <inputs>
    <files_to_read>
    - {vault_path}/00-THEMES.md
    - {vault_path}/00-FRAMEWORK.md
    - [all verified note paths]
    </files_to_read>
  </inputs>
  <o>{vault_path}/00-GAPS.md</o>
  <done>GAPS.md written with typed gaps and problematization</done>
</task>
</wave>

<wave n="3">
<task type="synthesis">
  <n>Argument Construction</n>
  <agent>grd-argument-constructor</agent>
  <inputs>
    <files_to_read>
    - {vault_path}/00-THEMES.md
    - {vault_path}/00-FRAMEWORK.md
    - {vault_path}/00-GAPS.md
    - .planning/PROJECT.md (for deliverable_format)
    </files_to_read>
  </inputs>
  <o>{vault_path}/00-Executive-Summary.md</o>
  <done>Executive Summary written with inline note citations</done>
</task>
</wave>
```

### Complete-Study Synthesis Validation Addition

```markdown
<step name="validate_synthesis">
Check if synthesis is required:

1. Read config.workflow.synthesis value
2. If false/optional and synthesis not present: skip
3. If required (systematic/integrative/critical default):
   - Check 00-THEMES.md exists in vault
   - Check 00-FRAMEWORK.md exists in vault
   - Check 00-GAPS.md exists in vault
   - Check 00-Executive-Summary.md exists in vault
   - Verify Executive Summary references all themes from THEMES.md
4. Report: note count, source count, theme count, gap count, verification status

If any missing: present options
- "Run /grd:synthesize" -- complete synthesis first
- "Proceed anyway" -- complete study with gaps noted
- "Abort" -- return to development
</step>
```

### deliverable_format in PROJECT.md Template

```markdown
## Deliverable Format

**Format:** [literature_review / research_brief / build_spec / custom]
<!-- tier:guided -->
<!-- This determines how your synthesis is structured in the Executive Summary. Literature review follows academic conventions; research brief is condensed for practitioners; build spec generates a technical specification for follow-on development; custom lets you define your own structure. Set during research scoping. -->
<!-- /tier:guided -->
<!-- tier:standard -->
[Determines Executive Summary structure. Set during research scoping.]
<!-- /tier:standard -->
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No synthesis stage | 4-activity synthesis with dependency ordering | v1.2 (this phase) | Transforms GRD from note-collection to scholarship-production |
| Manual compilation | Agent-driven synthesis with methodological guardrails | v1.2 (this phase) | Scholarly rigor embedded in process |
| No deliverable format | deliverable_format in PROJECT.md | v1.2 (this phase) | Output structure matches research intent |

## Open Questions

1. **How does the synthesize workflow discover verified notes?**
   - What we know: Notes live in `{Study}-Research/{NN}-{Inquiry}/` subdirectories. Verification status is tracked in VERIFICATION.md per phase.
   - What's unclear: The exact mechanism to enumerate all verified note paths across all inquiry subdirectories.
   - Recommendation: Walk the vault directory structure, collect all `.md` files that are NOT in `-sources/` subdirectories and NOT `00-` prefixed. Cross-reference with VERIFICATION.md status for each phase.

2. **How does the argument agent identify the Theoretical Framework Survey note?**
   - What we know: Stage 1 includes a "Theoretical Framework Survey" researcher (grd-architecture-researcher). The note it produces has a study-specific name.
   - What's unclear: Whether there's a reliable way to identify this specific note (frontmatter field? directory convention? naming pattern?).
   - Recommendation: Use the inquiry subdirectory that corresponds to the phase where grd-architecture-researcher ran. The note format includes an `inquiry` field in frontmatter that could be matched.

3. **Should the synthesize workflow create its own `.planning/phases/` directory?**
   - What we know: The workflow generates a PLAN.md and uses execute-phase machinery. Normally phases have `.planning/phases/NN-name/` directories.
   - What's unclear: Whether synthesis plans go in the `.planning/phases/` structure or are ephemeral.
   - Recommendation: Use `.planning/phases/synthesis/` (or a numbered phase if synthesis is tracked in ROADMAP.md). The execute-phase machinery expects a phase directory. The existing phase structure should work -- synthesis can be treated as a special phase.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | node:test (built-in, v22.20.0) |
| Config file | None -- uses scripts/run-tests.cjs as runner |
| Quick run command | `node --test test/synthesis.test.cjs` |
| Full suite command | `node scripts/run-tests.cjs` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SYN-01 | Synthesize workflow exists and reuses execute-phase | smoke | Verify workflow file exists + structure | Wave 0 |
| SYN-02 | Thematic synthesizer agent registered | unit | `node --test test/synthesis.test.cjs` | Wave 0 |
| SYN-03 | Framework integrator agent registered | unit | Same test file | Wave 0 |
| SYN-04 | Gap analyzer agent registered | unit | Same test file | Wave 0 |
| SYN-05 | Argument constructor agent registered | unit | Same test file | Wave 0 |
| SYN-06 | Dependency ordering enforced (waves) | unit | Test wave grouping logic | Wave 0 |
| SYN-07 | Skip flags respected | unit | Test config toggle + flag parsing | Wave 0 |
| SYN-08 | Output follows vault structure with 00- prefix | unit | Test path generation | Wave 0 |
| TRAP-04 | Interactive gate options | manual-only | UI interaction | N/A |
| COMP-01 | Complete-study validates synthesis | unit | Test validation logic | Wave 0 |
| TEST-05 | Tests exist and pass | meta | `node --test test/synthesis.test.cjs` | Wave 0 |

### Sampling Rate

- **Per task commit:** `node --test test/synthesis.test.cjs`
- **Per wave merge:** `node scripts/run-tests.cjs`
- **Phase gate:** Full suite green before `/grd:verify-work`

### Wave 0 Gaps

- [ ] `test/synthesis.test.cjs` -- covers SYN-01 through SYN-08, COMP-01, TEST-05
- [ ] Update `test/model-profiles.test.cjs` -- agent count 19 -> 23

## Sources

### Primary (HIGH confidence)

- `docs/GRD-v1.2-Research-Reorientation-Spec.md` lines 197-313 -- Synthesis stage definition, output file structure
- `grd/workflows/conduct-inquiry.md` -- Wave execution pattern (source of truth for orchestration)
- `grd/workflows/execute-plan.md` -- Subagent execution pattern (Task spawning, SUMMARY.md, commits)
- `grd/bin/lib/model-profiles.cjs` -- Current 19 agents, MODEL_PROFILES structure
- `grd/bin/lib/config.cjs` -- SMART_DEFAULTS with synthesis toggle, VALID_CONFIG_KEYS
- `grd/bin/lib/tier-strip.cjs` -- Tier-conditional content utility
- `grd/templates/project.md` -- Current PROJECT.md template (no deliverable_format yet)
- `grd/templates/config.json` -- Current config template (workflow.synthesis already present)
- `grd/references/note-format.md` -- Research note structure that synthesis agents will read
- `grd/workflows/complete-study.md` -- Current completion workflow to modify

### Secondary (MEDIUM confidence)

- `.planning/phases/22-synthesis-stage/22-CONTEXT.md` -- User decisions and integration points
- `.planning/REQUIREMENTS.md` -- SYN-01 through SYN-08, TRAP-04, COMP-01, TEST-05 acceptance criteria
- `.planning/STATE.md` -- Current project position (phase 22, 15/16 phases complete)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all files examined directly, patterns verified from source code
- Architecture: HIGH -- existing wave execution pattern well-documented, synthesis follows same structure
- Pitfalls: HIGH -- identified from direct code inspection (agent count, VALID_CONFIG_KEYS, vault path, etc.)

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable -- internal tool, no external dependency changes)
