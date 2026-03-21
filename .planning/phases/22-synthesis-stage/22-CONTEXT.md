# Phase 22: Synthesis Stage - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Build `/grd:synthesize` workflow with four synthesis activities: thematic synthesis, theoretical integration, gap analysis, and argument construction. Outputs go directly to the research vault. Reuses execute-phase machinery (plans, waves, subagents). Includes TRAP-04 interactive gate, skip flags, and COMP-01 deliverable assembly in complete-study. This phase also covers TEST-05 (synthesis stage tests).

Requirements: SYN-01, SYN-02, SYN-03, SYN-04, SYN-05, SYN-06, SYN-07, SYN-08, TRAP-04, COMP-01, TEST-05

</domain>

<decisions>
## Implementation Decisions

### Synthesis Agent Design
- **D-01:** 4 dedicated agent types in model-profiles.cjs: `grd-thematic-synthesizer`, `grd-framework-integrator`, `grd-gap-analyzer`, `grd-argument-constructor`. Matches the 4-researcher pattern from Stage 1. Each gets a focused system prompt grounded in its methodology.
- **D-02:** Methodological frameworks embedded as guardrails in each agent's system prompt. Braun & Clarke (2006) reflexive thematic analysis for themes. Carroll et al. (2013) best-fit framework synthesis for theoretical integration. Muller-Bloch & Kranz (2015) gap taxonomy + Alvesson & Sandberg (2011) problematization for gap analysis. These shape how the agent works, not just what it references.
- **D-03:** All verified research notes passed as file paths in the agent prompt's `<files_to_read>` block. Agents read them at execution start. No pre-compiled digest — agents work from primary sources.
- **D-04:** Synthesis outputs write directly to vault (`{Study}-Research/00-THEMES.md`, etc.), not to `.planning/`. These are research deliverables, not planning artifacts. Git commit captures the output.

### Readiness Validation
- **D-05:** Readiness gate accepts phases with `passed` or `human_needed` verification. Only `gaps_found` blocks synthesis. The researcher chose to proceed past human_needed items — respect that choice.
- **D-06:** Partial synthesis via `--partial` flag. Default requires all investigation phases verified. `--partial` synthesizes from whatever is verified so far — useful for iterative research.
- **D-07:** Per-activity prerequisite validation. Themes requires verified notes. Framework requires THEMES.md + theoretical framework survey from Stage 1 researchers. Gaps requires THEMES.md + FRAMEWORK.md. Argument requires all three. Validates the full dependency chain before each activity.
- **D-08:** Readiness failure errors route to specific next actions. Unverified phase → "Run `/grd:verify-inquiry {phase}`". Missing framework survey → "Check Stage 1 researcher output". No notes → "Run `/grd:conduct-inquiry` first".

### Executive Summary Structure
- **D-09:** `deliverable_format` field added to PROJECT.md during `/grd:new-research`. Options: `literature_review`, `research_brief`, `build_spec`, `custom`. Argument agent reads this field to select output structure.
- **D-10:** Scholarly standard baseline structure: Introduction (research questions + significance) → Key Themes (from THEMES.md) → Theoretical Implications (from FRAMEWORK.md) → Gaps & Future Directions (from GAPS.md) → Conclusion (the argument — what this body of evidence means and advances).
- **D-11:** Inline note-level citations for traceability. Format: `[Note: {note-name}]`. Every claim links to the research note(s) that support it. Maintains GRD's core value: every finding is auditable back to its source.
- **D-12:** Markdown only output. `{Study}-Research/00-Executive-Summary.md`. Researcher uses external tools (pandoc, etc.) for format conversion. GRD focuses on content, not formatting.

### Complete-Study Integration (COMP-01)
- **D-13:** Deliverable assembly = compile + validate. Complete-study verifies all synthesis outputs exist (THEMES/FRAMEWORK/GAPS/Executive Summary), checks that Executive Summary references all identified themes, and produces a final status report. Not a new document — a validation gate.
- **D-14:** Synthesis required before completion only when `config.workflow.synthesis` is `true` (default for systematic, integrative, critical). When synthesis is `false` (e.g., narrative), complete-study skips synthesis validation.
- **D-15:** Minimal changes to existing `complete-study.md` — add a synthesis validation step before the existing archival flow. No full rewrite.
- **D-16:** Brief study stats in completion output: note count, source count, theme count, gap count, verification status. Quick snapshot of research scope from existing STATE.md data.

### Claude's Discretion
- Exact agent prompt wording and methodological guardrail depth
- THEMES.md / FRAMEWORK.md / GAPS.md internal template structure (as long as they support the argument agent's needs)
- Wave grouping within the synthesize workflow (themes = wave 1, framework + gaps = wave 2, argument = wave 3 is the expected pattern)
- Test structure for TEST-05

</decisions>

<specifics>
## Specific Ideas

- The 4 synthesis agents mirror the 4 Stage 1 researchers — intentional symmetry between investigation and synthesis
- Thematic synthesis follows Braun & Clarke: "themes are actively constructed through sustained engagement with evidence, not passively discovered"
- Gap analysis goes beyond gap-spotting into problematization: "not 'what hasn't been studied?' but 'what has been assumed without justification?'"
- Executive Summary is where "the review becomes a contribution, not just a summary"
- The `[Note: {note-name}]` citation format should be consistent with however notes are already referenced in SOURCE-LOG.md

</specifics>

<canonical_refs>
## Canonical References

### Synthesis specification
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Stage 6 (lines 197-227) — Full synthesis activity definitions, inputs/outputs, dependency ordering, trap doors
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Synthesis Output File Structure (lines 296-313) — Vault directory structure with `00-` prefixed synthesis files

### Requirements
- `.planning/REQUIREMENTS.md` §Synthesis (SYN-01 through SYN-08) — All synthesis requirements with acceptance criteria
- `.planning/REQUIREMENTS.md` §Trap Doors (TRAP-04) — Synthesis scope interactive gate
- `.planning/REQUIREMENTS.md` §Completion (COMP-01) — Deliverable assembly requirement
- `.planning/REQUIREMENTS.md` §Testing (TEST-05) — Synthesis test coverage requirement

### Existing patterns to follow
- `grd/workflows/conduct-inquiry.md` — Execute-phase workflow pattern (wave execution, subagent spawning)
- `grd/workflows/execute-plan.md` — Subagent execution pattern (how plans are executed)
- `grd/bin/lib/config.cjs` §SMART_DEFAULTS (lines 30-36) — Synthesis toggle already wired per review type
- `grd/bin/lib/model-profiles.cjs` — Where to add the 4 new agent types
- `grd/references/note-format.md` — Research note structure (what synthesis agents will read)

### Tier adaptation (Phase 21)
- `grd/bin/lib/tier-strip.cjs` — stripTierContent() utility for tier-conditional blocks in new templates/workflows

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `config.cjs` SMART_DEFAULTS: synthesis toggle already configured per review type (required/recommended/optional)
- `conduct-inquiry.md`: Full execute-phase workflow with wave parallelism — synthesize can follow same pattern
- `execute-plan.md`: Subagent execution with SUMMARY.md creation — synthesis agents use same flow
- `tier-strip.cjs`: New synthesis workflow and templates should include tier-conditional blocks
- `model-profiles.cjs`: Has 19 GRD agents; add 4 more for synthesis activities

### Established Patterns
- Wave execution: wave 1 completes before wave 2 starts. Maps to themes → framework+gaps → argument
- Agent prompts in `grd/agents/`: Each agent has a `.md` prompt file + entry in model-profiles.cjs
- Vault writes commit to git automatically (core.cjs handles this)
- `grd-tools.cjs` provides init, state, and roadmap CLI commands for workflow orchestration

### Integration Points
- `/grd:synthesize` command needs a new command file in `grd/commands/`
- New workflow file: `grd/workflows/synthesize.md`
- 4 new agent files: `grd/agents/grd-thematic-synthesizer.md`, etc.
- `model-profiles.cjs`: 4 new agent entries
- `complete-study.md`: Add synthesis validation step
- `new-research.md`: Add `deliverable_format` question
- `PROJECT.md` template: Add `deliverable_format` field
- `config.json` template: Already has synthesis toggle; may need `deliverable_format`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-synthesis-stage*
*Context gathered: 2026-03-21*
