# Phase 20: Three-Tier Verification - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Add Tier 0 (sufficiency) verification before the existing Tier 1 (goal-backward) and Tier 2 (source audit), creating a three-tier pipeline. Implement `--skip-tier0` flag, saturation interactive gate (TRAP-03), and sufficiency criteria that scale by review type. Update verify-inquiry.md workflow to orchestrate the pipeline.

</domain>

<decisions>
## Implementation Decisions

### Sufficiency Criteria (VER-01, VER-02)
- **Multi-signal heuristic** — combine: (1) note count vs. expected range per review type, (2) theme coverage — are REQUIREMENTS.md objectives addressed?, (3) recency — any objectives with zero contemporary sources, (4) source diversity — methodological mix. Agent weighs signals holistically
- **Coverage depth scaling by review type:**
  - Systematic: every REQUIREMENTS.md objective must have ≥3 notes with primary sources AND no objective has only one methodological approach
  - Scoping: every objective has ≥1 note AND the overall collection spans the stated disciplinary scope
  - Narrative: ≥1 note per objective, no diversity requirement
- **Temporal coverage for systematic and scoping** — systematic reviews should span at least 3 of 4 eras (foundational/developmental/contemporary/emerging). Scoping reviews should have at least foundational + contemporary. Narrative has no temporal requirement. Uses `era` frontmatter field from Phase 18
- **Theme convergence heuristic for saturation** — look at the last N notes added: if they introduce zero new themes (all findings map to existing themes in earlier notes), signal potential saturation. Agent checks if recent notes are confirming vs. extending. Lightweight — no formal coding required

### Saturation Gate UX (TRAP-03)
- **Fires on insufficiency findings only** — gate fires when Tier 0 finds coverage gaps (objectives without enough notes) or saturation NOT reached. If everything looks sufficient, no gate — just pass
- **Standard checkpoint box** — consistent with TRAP-02 pattern. CHECKPOINT: Sufficiency Assessment with three options
- **"Evidence is sufficient"** — researcher overrides Tier 0's assessment. Proceed to Tier 1
- **"Continue investigating"** — verification stops. User returns to `/grd:conduct-inquiry N` to gather more evidence. Same phase, more plans
- **"Add inquiry"** — routes to `/grd:add-inquiry` to create a new line of inquiry in the roadmap. Verification stops

### Pipeline Orchestration (VER-03)
- **Tier 0 blocks Tier 1 and Tier 2** — if evidence is insufficient, no point checking goal-backward quality or source completeness. Tier 0 failure → saturation gate → researcher decides. Tiers 1+2 only run after Tier 0 passes or is skipped
- **One agent, three passes** — single grd-verifier agent runs all three tiers sequentially. Agent has full context from Tier 0 when running Tier 1. verify-inquiry.md already uses a single verifier agent
- **CJS module + agent split** — structured checks (note count per objective, era coverage, theme convergence heuristic) in a new `verify-sufficiency.cjs` module. Agent prompt handles qualitative saturation assessment and epistemological consistency. Mirrors Phase 19's split between CJS structural checks and agent qualitative assessment
- **`--skip-tier0` skips silently** — Tier 0 section in the verification report shows "Skipped (--skip-tier0)". Tiers 1+2 run normally. Clean and transparent

### Epistemological Consistency
- **Agent qualitative assessment only** — verifier agent reads epistemological stance from config, checks if notes' Evidence Quality sections and source selections are consistent with that stance. No CJS checks — inherently interpretive
- **Warning only, never blocks** — epistemological inconsistency flagged in report but doesn't block progression. Researcher might have good reasons for mixing approaches
- **Pragmatist auto-pass** — pragmatist stance explicitly means "whatever helps answer the question." Epistemological consistency check is irrelevant — auto-pass and note "Pragmatist stance: methodological flexibility expected." Positivist, constructivist, and critical stances get the full check

### Claude's Discretion
- Exact note count thresholds per review type for the multi-signal heuristic
- How "last N notes" is determined for theme convergence (e.g., last 3 or last 5)
- Exact structure of verify-sufficiency.cjs module (which functions, what they return)
- How the verifier agent prompt structures the three-pass report
- How to read research notes and their frontmatter for the sufficiency assessment
- Test structure and assertion patterns

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Verification Spec
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Stage 5 (lines 171-194) — three-tier verification definition, sufficiency criteria, saturation, epistemological consistency, trap doors, verification routing
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Smart Defaults by Review Type — verifier toggle per review type
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Command Flags (line 405) — `--skip-tier0` flag

### Current Verification Infrastructure
- `grd/workflows/verify-inquiry.md` — current verify-inquiry workflow (single verifier agent, UAT flow, gap routing)
- `grd/bin/lib/verify-research.cjs` — existing Tier 2 source audit logic (parseFrontmatter, extractSection, placeholder detection)
- `grd/bin/lib/verify.cjs` — existing verification CJS module (cmdVerifySummary, health checks)
- `grd/references/research-verification.md` — verification reference patterns
- `grd/references/verification-patterns.md` — verification patterns reference
- `grd/templates/verification-report.md` — verification report template

### Config Infrastructure (Phase 16)
- `grd/bin/lib/config.cjs` — SMART_DEFAULTS, configWithDefaults() (verifier toggle, review_type, epistemological_stance)
- `grd/bin/lib/init.cjs` — config propagation (review_type, epistemological_stance now available)

### Phase 19 Pattern (plan-checker enforcement)
- `grd/bin/lib/plan-checker-rules.cjs` — RIGOR_LEVELS pattern (CJS structural checks + agent qualitative assessment split)

### Requirements
- `.planning/REQUIREMENTS.md` — VER-01, VER-02, VER-03, TRAP-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `verify-research.cjs:parseFrontmatter()` — parses YAML frontmatter from notes. Can read `era`, `review_type`, `inquiry`, `status` fields added in Phase 18
- `verify-research.cjs:extractSection()` — extracts markdown sections by heading. Can check for Evidence Quality section existence
- `verify.cjs` — existing verification module with health checks and summary verification
- `plan-checker-rules.cjs:RIGOR_LEVELS` — pattern to follow for sufficiency criteria scaling table
- `config.cjs:SMART_DEFAULTS` — already has review type → workflow toggle mapping

### Established Patterns
- Verifier agent is a single spawn from verify-inquiry.md that produces a structured report
- CJS modules return `{ valid, issues }` objects (plan-checker pattern)
- Config values propagated via init.cjs to workflow JSON
- Checkpoint boxes use standard GSD pattern (CHECKPOINT: Type with options)

### Integration Points
- `verify-inquiry.md` — main orchestration point. Needs Tier 0 step before existing Tier 1/2
- `init.cjs` — needs to propagate `--skip-tier0` flag and review type context to verifier
- Research notes in vault — sufficiency check reads all notes from executed inquiry phases
- `REQUIREMENTS.md` — objectives used as coverage targets for sufficiency assessment

</code_context>

<specifics>
## Specific Ideas

- The CJS/agent split mirrors Phase 19: structural checks (note count, era coverage) in CJS module, qualitative assessment (saturation, epistemological consistency) in agent prompt
- Theme convergence doesn't need formal NLP — the agent can compare note Key Findings sections and assess overlap
- The pipeline is sequential within one agent: Tier 0 assessment → gate if needed → Tier 1 → Tier 2. Not three separate spawns
- `--skip-tier0` should be propagated through init.cjs like `--skip-verify` is propagated for plan-checker

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-three-tier-verification*
*Context gathered: 2026-03-20*
