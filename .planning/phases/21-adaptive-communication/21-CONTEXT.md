# Phase 21: Adaptive Communication - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Make GRD adapt its communication to the researcher's experience level (Guided/Standard/Expert) without changing the underlying rigor. Add tier-conditional content to agent prompts, templates, verification feedback, error messages, and next-action routing. Create a CJS strip utility and comprehensive test coverage.

</domain>

<decisions>
## Implementation Decisions

### Tier-Conditional Syntax (resolves STATE.md blocker)
- **Agent prompts: inline XML blocks** — `<tier-guided>`, `<tier-standard>`, `<tier-expert>` blocks within existing prompts. Single file per prompt, easy to diff. Similar to existing `<domain>`, `<decisions>` blocks
- **Templates: conditional comment blocks** — `<!-- tier:guided -->` ... `<!-- /tier:guided -->` comment blocks. Executor strips non-matching blocks before writing. One file per template. Comments invisible in rendered markdown
- **Top-level context block per prompt** — one `<researcher_tier>` block at the top of each prompt with vocabulary rules, explanation depth, and examples for that tier. Agent applies rules throughout
- **Orchestrator strips before spawning** — workflow reads `researcher_tier` from init and strips non-matching blocks before passing prompt to agent. Agent sees only its tier's content. Clean context, no wasted tokens
- **CJS utility: `stripTierContent(content, tier, format='xml'|'comment')`** — one function, two modes. XML mode strips `<tier-*>` blocks, comment mode strips `<!-- tier:* -->` blocks. Testable and reusable

### Adaptation Scope
- **User-facing agents only** — adapt prompts for executor (research notes), verifier (verification feedback), planner (plan descriptions). Internal agents (researcher, synthesizer) don't need adaptation — their output is consumed by other agents
- **Checkpoint descriptions adapt** — text inside checkpoint boxes adapts by tier. Guided: explains what checkpoint means and what each option does. Standard: brief context. Expert: options only. Box structure stays the same
- **Next Up routing adapts per spec** — Guided: explains what next step is and why before command. Standard: names next step with command. Expert: command only
- **Key workflows only** — 5-6 workflows: new-research.md, scope-inquiry.md, plan-inquiry.md, conduct-inquiry.md (execute-phase), verify-inquiry.md, progress.md

### Template Variant Strategy (TIER-02)
- **Research-facing templates only** — research-note.md, source-log.md, research-task.md, project.md (prospectus), bootstrap.md, requirements.md, roadmap.md. Internal templates stay as-is
- **Guided: one sentence per section** — each section gets a single guidance sentence in `<!-- tier:guided -->` blocks. Enough to orient without overwhelming
- **Expert: headers only, no descriptions** — section headers and frontmatter, nothing else. Matches spec exactly
- **Standard: brief descriptions** — current template content (what exists today) is the Standard tier baseline. Guided adds to it, Expert removes from it

### Verification Feedback (TIER-03)
- **Verification output adapts by tier** — Guided: explains what failed and why it matters. Standard: states failure with relevant standard. Expert: terse failure statement. All three convey the same information at different depths
- **Implemented in verifier agent prompt** — tier context block tells the agent how to format its output. CJS verification modules return raw results; the agent formats for the tier

### Error Messages and Routing (TIER-04)
- **Error messages adapt** — Guided: suggests next steps and explains concepts. Standard: states requirement and rationale. Expert: states requirement only
- **Implemented in workflow orchestration** — workflows read tier from init and use tier-conditional blocks in their user-facing output

### Testing (TEST-06)
- **Strip function unit tests + template content tests** — unit tests for `stripTierContent()` (correct blocks kept/removed per tier). Content tests for each adapted template (Guided has guidance, Expert has headers only)
- **Completeness check** — test scans all adapted templates and verifies each has content for all three tiers. Catches missing tier variants
- **Round-trip safety tests** — strip each tier, verify remaining content is valid markdown with no orphaned tags, verify non-tier content preserved exactly

### Claude's Discretion
- Exact guidance sentences for each template section
- Which specific checkpoint boxes and error messages to adapt (vs. leaving as-is)
- How the verifier agent prompt structures tier-adaptive output
- Exact content of the `<researcher_tier>` context block per agent
- Test file organization and assertion patterns

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Adaptive Communication Spec
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Adaptive Communication (lines 333-361) — tier definitions for agent prompts, templates, verification feedback, error messages, next-action routing with examples for each tier

### Current Templates (to be adapted)
- `grd/templates/research-note.md` — research note template (Phase 18 Evidence Quality section)
- `grd/templates/source-log.md` — source log template
- `grd/templates/research-task.md` — research task template
- `grd/templates/project.md` — research prospectus template (Phase 18)
- `grd/templates/bootstrap.md` — state-of-the-field assessment (Phase 18)
- `grd/templates/requirements.md` — research objectives template (Phase 18)
- `grd/templates/roadmap.md` — research design template (Phase 18)

### Current Workflows (key orchestration points)
- `grd/workflows/new-research.md` — new research flow
- `grd/workflows/scope-inquiry.md` — inquiry scoping
- `grd/workflows/plan-inquiry.md` — search protocol development
- `grd/workflows/verify-inquiry.md` — three-tier verification (Phase 20)
- `grd/workflows/progress.md` — status and routing (inherited from GSD)

### Config Infrastructure (Phase 16)
- `grd/bin/lib/config.cjs` — researcher_tier field, SMART_DEFAULTS
- `grd/bin/lib/init.cjs` — researcher_tier propagation to all workflows

### Requirements
- `.planning/REQUIREMENTS.md` — TIER-01, TIER-02, TIER-03, TIER-04, TEST-06

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `init.cjs` already propagates `researcher_tier` to all workflow init calls (lines 40, 129, 386)
- `config.cjs` has `researcher_tier` in VALID_CONFIG_KEYS with 'standard' default
- `plan-checker-rules.cjs:RIGOR_LEVELS` — lookup table pattern to follow for tier content mapping
- Phase 17 namespace test pattern — char-code construction to prevent bulk rename corruption, reusable for tier completeness scan

### Established Patterns
- XML blocks in prompts (`<domain>`, `<decisions>`, `<canonical_refs>`) — tier blocks follow same convention
- Comment blocks in markdown templates — natural extension for tier-conditional content
- CJS utility modules return structured results (`{ valid, issues }`) — strip function follows similar pattern
- Workflow orchestrators read init JSON and substitute values into prompts

### Integration Points
- Every workflow that spawns an agent — needs to call `stripTierContent()` on prompts before spawning
- Every workflow with user-facing output (checkpoints, Next Up, errors) — needs tier-conditional blocks
- Template consumption in executor agents — executor must strip template before writing research notes
- `grd-tools.cjs` — may need a `strip-tier` command for templates if executors call via CLI

</code_context>

<specifics>
## Specific Ideas

- Standard tier is the baseline — current content IS Standard. Guided adds guidance, Expert removes descriptions. This means adaptation is additive (Guided) and subtractive (Expert), not three rewrites
- The strip utility is the linchpin — everything depends on it working correctly. Build and test it first
- Workflows already have the tier from init — the main work is adding tier-conditional blocks to output sections and calling strip before agent spawns
- The spec examples (lines 338-361) should be used verbatim as the canonical tier adaptation examples in tests

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 21-adaptive-communication*
*Context gathered: 2026-03-20*
