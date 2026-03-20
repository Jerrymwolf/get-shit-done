# Phase 19: Plan-Checker Enforcement - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the plan-checker enforce review-type-appropriate rigor at the search protocol stage. Add 3 new checks to plan-checker-rules.cjs, implement graduated enforcement by phase position, add review type mismatch interactive gate (TRAP-02), and update the planner agent prompt to emit new structured XML blocks. The plan-checker agent prompt also needs updating for qualitative assessment of disciplinary and methodological diversity.

</domain>

<decisions>
## Implementation Decisions

### Rigor Scaling
- **RIGOR_LEVELS lookup table** in plan-checker-rules.cjs (like SMART_DEFAULTS in config.cjs) — maps strict/moderate/light to per-check severity (error/warning/skip)
- **Light level: warnings only** — all 7 checks still run, but non-applicable checks produce advisory warnings instead of blocking errors. Nothing is silently skipped
- **Strict level: hard blocks** — missing search strategy is a blocking error that goes back to planner for revision
- **Moderate: scoping requires search strategy, integrative/critical get warnings** — matches the spec table exactly. Scoping reviews explicitly need search strategies (Arksey & O'Malley)

### Graduated Enforcement (PLAN-02)
- **Position-based threshold** — first ~third of phases are 'early' (advisory), rest are 'late' (blocking). Automatic from roadmap position, no config needed
- **Warnings in checker output** — checker returns `## VERIFICATION PASSED (with warnings)` for advisory issues. Plan-inquiry proceeds but displays warnings
- **Only review-type-specific checks graduate** — the 4 universal checks (source budget, duplication, acquisition methods, context budget) always block. Only the 3 new review-type-specific checks (primary sources, search strategy, inclusion/exclusion) graduate by phase position
- **No override knob** — position-based is automatic and TRAP-02 already handles individual overrides

### Review Type Mismatch Gate (TRAP-02)
- **Fires on blocking errors only** — warnings don't trigger the gate
- **Standard checkpoint box** — uses GSD checkpoint pattern (CHECKPOINT: Decision Required) with three options: "Downgrade review type to X" / "Send back to planner to add rigor" / "Override and proceed"
- **Override is per-plan** — applies to the current plan-inquiry run only. Next phase starts fresh
- **Downgrade is permanent** — actually calls `applySmartDefaults()` to change config.json. Consistent with Phase 16's downgrade-only policy
- **Gate fires after revision loop exhaustion** — if the planner can't fix the issue within 3 iterations, the gate presents

### New Check Implementation
- **`tier="primary|secondary|tertiary"` attribute on `<src>` tags** — checker counts ratio. Systematic requires ≥50% primary. Machine-readable, extends existing attribute pattern
- **`<search-strategy>` XML block at plan level** — contains databases, keywords, date-range fields. Checker validates block exists and has required fields for strict/scoping
- **`<criteria>` XML block at plan level** — contains `<include>` and `<exclude>` sub-elements. Checker validates both exist for strict/scoping
- **Disciplinary diversity and methodological diversity are agent-level checks** — too qualitative for CJS module. The grd-plan-checker agent prompt handles these assessments
- **CJS module handles 5 structural checks** — 4 existing (source budget, duplication, acquisition methods, context budget) + 1 new (primary source ratio). Search strategy and criteria block existence also checked by CJS, but content quality is agent-assessed
- **Planner agent prompt updated** — grd-planner needs to know about `<search-strategy>`, `<criteria>`, and `tier="primary|secondary|tertiary"` so it emits them

### Claude's Discretion
- Exact RIGOR_LEVELS table values and thresholds (e.g., primary source ratio per level)
- How to compute "first third of phases" from roadmap (e.g., Math.ceil(totalPhases / 3))
- Exact XML schema for `<search-strategy>` and `<criteria>` blocks
- How the grd-plan-checker agent prompt structures qualitative diversity assessment
- Test structure and assertion patterns for TEST-03

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Plan-Checker Spec
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Stage 3 (lines 104-122) — plan-checker validation table, 7 checks with "Applies To" column, scholarly citations
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Smart Defaults by Review Type (line 434) — plan_check values: strict/moderate/light per review type
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Trap Door Inventory → Config Toggles — plan_check in config schema
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Command Flags — --skip-verify flag

### Current Implementation
- `grd/bin/lib/plan-checker-rules.cjs` — existing 4 checks (source duplication, source limits, acquisition methods, context budget), extractTasks(), parseAttrs() utilities
- `grd/bin/lib/config.cjs` — SMART_DEFAULTS with plan_check values, configWithDefaults(), applySmartDefaults()
- `grd/bin/lib/init.cjs` line 114 — `plan_checker_enabled: config.plan_checker` propagation
- `grd/workflows/plan-inquiry.md` lines 475-520 — grd-plan-checker agent invocation, revision loop (max 3 iterations)
- `grd/references/model-profiles.md` — grd-plan-checker uses sonnet at quality profile

### Config Infrastructure (Phase 16)
- `grd/bin/lib/config.cjs` lines 31-35 — SMART_DEFAULTS table (plan_check: strict/moderate/light)
- `grd/bin/lib/config.cjs` lines 63-66 — backward compat: boolean plan_check true → 'moderate'

### Requirements
- `.planning/REQUIREMENTS.md` — PLAN-01, PLAN-02, TRAP-02, TEST-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `plan-checker-rules.cjs:extractTasks()` — parses `<task>` and `<src>` blocks from plan XML. Extend for `<search-strategy>` and `<criteria>`
- `plan-checker-rules.cjs:parseAttrs()` — extracts attributes from src tags. Already handles method/format/pages; `tier` is a natural addition
- `config.cjs:SMART_DEFAULTS` — pattern to follow for RIGOR_LEVELS table
- `config.cjs:applySmartDefaults()` — reusable for downgrade in TRAP-02 gate

### Established Patterns
- Each check is a standalone function returning `{ valid, issues }` — new checks should follow this pattern
- `validateResearchPlan()` aggregates all checks — add new checks to this aggregator
- Plan-inquiry workflow spawns checker agent with structured prompt, handles `## VERIFICATION PASSED` / `## ISSUES FOUND` return
- Revision loop (max 3 iterations) already exists in plan-inquiry.md

### Integration Points
- `plan-inquiry.md` step 10 — checker invocation point. Needs rigor level and phase position passed in
- `plan-inquiry.md` step 11-12 — checker return handling. Needs TRAP-02 gate logic after revision loop exhaustion
- `init.cjs` — needs to propagate `workflow.plan_check` (strict/moderate/light) alongside `plan_checker_enabled` boolean
- Planner agent prompt — needs `<search-strategy>`, `<criteria>` block schemas and `tier` attribute documentation

</code_context>

<specifics>
## Specific Ideas

- The RIGOR_LEVELS table should mirror SMART_DEFAULTS pattern: object keyed by level (strict/moderate/light), values are per-check severity
- Graduated enforcement uses roadmap phase count, not hardcoded numbers — a 4-phase study graduates differently than a 12-phase study
- The TRAP-02 gate should fire AFTER the 3-iteration revision loop, not alongside it — give the planner a chance to fix things first
- `init.cjs` currently propagates `config.plan_checker` (boolean) — needs to also propagate `config.workflow.plan_check` (strict/moderate/light) so checker knows its rigor level

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 19-plan-checker-enforcement*
*Context gathered: 2026-03-19*
