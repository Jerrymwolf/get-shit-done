# Project Research Summary

**Project:** GRD v1.2 Research Reorientation
**Domain:** CLI research workflow tool transformation (GRD fork becoming GRD)
**Researched:** 2026-03-17
**Confidence:** HIGH

## Executive Summary

GRD v1.2 is a transformation of an existing AI-powered planning tool (GRD v1.1) into a methodology-aware research workflow system. The scope is a codebase reorientation: rename the namespace from `grd` to `grd`, reframe the command vocabulary from PM terms to research terms, and add five research-specific capability layers (review type enforcement, researcher tier adaptation, epistemological positioning, three-tier verification, and synthesis stage). Critically, no new npm dependencies are required — every v1.2 feature is implementable with the existing zero-dependency stack (Node.js CJS modules, `node:fs`, `node:test`, `docx`). This is a pure code and configuration expansion on top of a validated 164-test codebase.

The recommended approach, derived from direct codebase analysis and v1.1 sync lessons, is to execute the transformation in strict phase order: namespace migration first, then config schema extension, then feature layers (review type enforcement, three-tier verification, adaptive communication, synthesis), and upstream sync last. The dependency chain is not arbitrary — upstream sync done before feature stabilization risks architectural invalidation from an unknown 1,077-commit delta; namespace migration done after feature development requires double-editing every file. The research converges on a clear eight-phase build sequence with well-understood dependencies.

The key risks are not technical (the stack is proven) but operational. Three demand specific design contracts before coding begins: (1) the researcher tier boundary — tier adaptation must apply only to user-facing output, never to agent-to-agent communication (PLAN.md, STATE.md, verification reports must be structurally identical across all tiers); (2) config defaults — a `configWithDefaults()` function that deep-merges raw config with `CONFIG_DEFAULTS` is a prerequisite for all v1.2 features, not an afterthought; and (3) the namespace migration must be done in four ordered sub-phases (CLI rename, agent names, command namespace, command vocabulary) with test suite validation between each, not as a single-pass sed operation.

---

## Key Findings

### Recommended Stack

The stack is unchanged from v1.1. Node.js CJS with zero production dependencies except `docx ^9.6.1` for Word export. The entire feature set — tier lookups, review type enforcement matrices, saturation detection, synthesis orchestration — is implementable with static JavaScript objects, `Set` intersection, and the existing `node:test`/`node:fs`/`node:child_process` APIs. No new packages are needed or appropriate.

One new first-party module (`tier.cjs`) is under debate: Stack research recommends it as a pure-function lookup module; Architecture research argues the same logic belongs in workflow markdown branching, not CJS. This design decision should be resolved at the start of Phase 4, when the first feature reads config values. Either approach is valid; the choice should be documented and applied consistently.

**Core technologies:**
- Node.js >=18.0.0 (runtime v22.20.0): Validated across 164 tests; provides `spawnSync`, `node:test`, filesystem APIs
- CommonJS (CJS): Entire codebase and upstream GSD are CJS; ESM migration would break upstream sync pattern
- node:test (built-in): 164 tests passing; zero migration benefit from Jest or Vitest
- docx ^9.6.1: DOCX export for research outputs; unchanged in v1.2
- Upstream GSD v1.25.1 base: Currently at v1.24.0; sync introduces `spawnSync`, `stripShippedMilestones()`, `VALID_CONFIG_KEYS` validation — all additive

### Expected Features

GRD occupies a genuine competitive gap. Existing tools (Covidence, Rayyan, Elicit) are strongest at screening, extraction, or discovery. None help with synthesis, none adapt to researcher experience level, and none enforce methodology rules at the planning stage.

**Must have (table stakes):**
- `/grd:` namespace with research-native command vocabulary — without this the tool still looks like a PM fork
- Review type selection (systematic/scoping/integrative/critical/narrative) + smart defaults — structural backbone; every downstream feature scales off it
- Plan-checker enforcement per review type — without enforcement, review type selection is decorative
- Evidence Quality section in notes scaled by review type — required for defense-quality output
- Temporal positioning (`era` frontmatter field) — low cost, expected by anyone trained in literature review methods
- Revised parallel researchers (Methodological Landscape, Prior Findings, Theoretical Framework, Limitations) — research-native vocabulary replacing PM terms
- Researcher tier selection + config storage — must capture tier even if adaptive communication ships incrementally
- Tier 0 verification (sufficiency of evidence) — completes the verification triangle

**Should have (competitive differentiators):**
- Adaptive communication across agent prompts (Guided/Standard/Expert) — highest-value differentiator; no existing tool adapts by researcher experience level
- Full synthesis stage: THEMES.md -> FRAMEWORK.md -> GAPS.md -> Executive Summary — structured transformation of notes into scholarship; no existing tool does this
- Epistemological positioning (positivist/constructivist/pragmatist/critical) — doctoral-level framing lens affecting evidence evaluation
- Recursive loop formalization with Decision Log integration — operationalizes how research actually works

**Defer to v1.2.x or v1.3:**
- PRISMA flow diagram generation — requires tracking infrastructure that does not yet exist
- Bibliometric/citation network analysis — adds external dependencies to a zero-dependency tool
- Real-time auto-scoring of source quality — would produce false confidence; judgment must remain researcher-authored
- Per-tier template variants for all 41 workflow files — deliver agent prompt adaptation first; full template adaptation deferred

### Architecture Approach

The architecture is a layered CLI system: CLAUDE.md Skill() registrations route to workflow markdown files, which dispatch to a CJS CLI router, which calls a library layer of ~17 CJS modules. State lives entirely on the filesystem (`.planning/config.json`, `STATE.md`, `ROADMAP.md`), never in a database. This is a design principle, not a constraint to work around.

Three new architectural patterns introduced in v1.2: (1) config-driven behavior branching — `researcher_tier`, `review_type`, and `epistemological_stance` from `config.json` propagate through `init.cjs` to every workflow, which branches on them using conditional blocks; (2) layered verification pipeline — Tier 0 (sufficiency, new) gates Tier 1 (goal-backward, existing) gates Tier 2 (source audit, existing); (3) synthesis as standard phase execution — `/grd:synthesize` generates a PLAN.md with four tasks in three waves and delegates to the existing `execute-phase` machinery.

**Major components:**
1. CLAUDE.md / Skill() registrations — all `/grd:*` become `/grd:*`; workflow filenames stay unchanged to preserve git history
2. bin/grd-tools.cjs — CLI router; rename from `grd-tools.cjs`; update ~161 path references across 40 files
3. bin/lib/config.cjs — add 6 new config keys; add `configWithDefaults()` deep-merge function as prerequisite for all features
4. bin/lib/plan-checker-rules.cjs — add 4 review-type-conditional rules to existing 4 universal rules; graduated enforcement
5. bin/lib/verify-research.cjs — add `verifyTier0()` (phase-level sufficiency); wrap as `verifyPhase()`
6. workflows/synthesize.md — new orchestrator: validates readiness, generates synthesis PLAN.md, delegates to execute-phase
7. templates/research-note.md — add Evidence Quality section and `era`/`review_type` frontmatter fields
8. model-profiles.cjs — rename 19 `grd-*` agents to `grd-*`; add `grd-synthesizer`

### Critical Pitfalls

1. **Upstream sync destroys research-specific modifications** — Create a definitive research delta manifest before syncing; categorize each delta; sync one module at a time; run the 164-test suite after each file. The six research-specific `state.cjs` exports are the highest-risk items.

2. **Incomplete namespace migration leaves mixed references** — 1,907 occurrences across 172 files; seven distinct context types requiring different replacement logic. Build a migration script handling each context type separately; never use a single global sed pass; extend `verify-rename.cjs` to check for residue.

3. **Researcher tier leaks into agent-to-agent communication** — PLAN.md, STATE.md, and verification reports must be structurally identical across all three tiers. Design the user-facing/agent-facing boundary as a first-class architectural decision before touching any workflow file.

4. **Config migration breaks existing projects** — Add `configWithDefaults()` before any feature reads new config keys. Define defaults in a single `CONFIG_DEFAULTS` constant. Never require users to manually update `config.json` to get sensible behavior.

5. **Review type enforcement too rigid or too loose** — Phase 1-2 plans need advisory warnings, not blocking errors. Phase 3+ plans should block for systematic reviews missing required elements. Graduated enforcement is essential; binary pass/fail is an anti-pattern.

---

## Implications for Roadmap

Based on combined research, the correct phase sequence is determined by three constraints: (1) dependency ordering — namespace must precede feature work; config must precede enforcement logic; upstream sync is safest last; (2) blast radius management — do the highest-volume mechanical changes in isolated phases before introducing behavioral changes; (3) test stability — each phase must leave the test suite green before the next begins.

### Phase 1: Namespace Migration
**Rationale:** Every subsequent feature references the new `grd` namespace. Doing this first means all feature work uses final names and zero files need double-editing. Four ordered sub-phases: CLI rename (1a), agent name rename (1b), command namespace (1c), command vocabulary PM-to-research (1d). Test suite passes after each.
**Delivers:** Clean `grd` namespace across all 172 files; updated `verify-rename.cjs` that checks for residue; all 164 tests updated and passing with new names.
**Addresses:** `/grd:` namespace rename (table stakes), revised parallel researcher names
**Avoids:** Mixed namespace references (Pitfall 2); command cross-reference breakage (Pitfall 8)

### Phase 2: Config Schema and Propagation
**Rationale:** `researcher_tier`, `review_type`, and `epistemological_stance` must exist in config and flow through `init.cjs` before any feature can read them. This is plumbing, not a feature. The `configWithDefaults()` function is a hard prerequisite for every subsequent phase.
**Delivers:** Updated `config.cjs` with `VALID_CONFIG_KEYS` extensions and `configWithDefaults()`; updated `init.cjs` passing new fields to all workflows; updated `new-research` workflow asking three new scoping questions; three new reference docs (review-type-requirements.md, epistemological-stances.md, researcher-tiers.md).
**Addresses:** Review type selection, researcher tier config storage, epistemological positioning
**Avoids:** Config migration breaks existing projects (Pitfall 6)

### Phase 3: Research Note Template and Parallel Researcher Rechartering
**Rationale:** Small, contained template changes that unlock downstream enforcement. Evidence Quality section in notes is required before review-type plan-checker rules can reference it. Parallel researcher templates must be recharged before investigation phases can run correctly.
**Delivers:** Updated `research-note.md` (Evidence Quality section, `era` frontmatter, `review_type` frontmatter); renamed and recharged parallel researcher templates (METHODS, FINDINGS, FRAMEWORKS, LIMITATIONS).
**Addresses:** Evidence Quality section (table stakes), temporal positioning, revised parallel researchers
**Avoids:** Synthesis coupling to old note format (Pitfall 5)

### Phase 4: Review Type Enforcement in Plan-Checker
**Rationale:** Review type selection is decorative without enforcement. Plan-checker is the enforcement layer. Must be built before verification changes, which reference the same review type thresholds.
**Delivers:** Four new conditional rules in `plan-checker-rules.cjs`; graduated enforcement (advisory for Phase 1-2, blocking for Phase 3+); smart defaults table; tests for each review type's rule set.
**Addresses:** Plan-checker enforcement per review type (table stakes), smart defaults
**Avoids:** Review type enforcement too rigid or too loose (Pitfall 4)

### Phase 5: Three-Tier Verification
**Rationale:** Tier 0 (sufficiency) is the new first gate. Requires review type in config (Phase 2) and the updated note template for `era`/`review_type` field reading (Phase 3). Must be backward-compatible — `verifyNote()` unchanged; `verifyPhase()` wraps it.
**Delivers:** `verifyTier0()` in `verify-research.cjs`; `verifyPhase()` wrapper; `--skip-tier0` flag wired through; review-type-specific coverage thresholds; tests for Tier 0 across all five review types.
**Addresses:** Tier 0 verification (table stakes), sufficiency of evidence
**Avoids:** Three-tier verification breaking existing two-tier workflows (Pitfall 9)

### Phase 6: Adaptive Communication (Researcher Tier)
**Rationale:** Highest-breadth change in the project — touches all 41 workflow files. Done after namespace is stable and config propagation is wired, so the pattern can be established and applied consistently. The user-facing/agent-facing boundary must be designed before any workflow file is modified.
**Delivers:** Tier-conditional blocks in all 41 workflow files using a consistent pattern; documented in `references/researcher-tiers.md`; tier-aware verification feedback and error messages in CJS modules.
**Addresses:** Adaptive communication (top differentiator), researcher tier experience adaptation
**Avoids:** Researcher tier leaks into agent-to-agent communication (Pitfall 3)

### Phase 7: Synthesis Stage
**Rationale:** Net-new capability that depends on all prior phases being stable. Reuses existing `execute-phase` machinery to avoid building new execution infrastructure. Note discovery must use frontmatter-based matching, not file path conventions, to survive recursive loops and decimal phases.
**Delivers:** `workflows/synthesize.md`; `workflows/synthesize-activity.md`; four synthesis output templates (THEMES, FRAMEWORK, GAPS, Executive Summary); synthesis tracking in `state.cjs`; `grd-synthesizer` agent in model-profiles; integration tests using temp directory fixtures.
**Addresses:** Synthesis stage (top differentiator), recursive loop formalization
**Avoids:** Synthesis tightly coupled to investigation stage file paths (Pitfall 5)

### Phase 8: Upstream Sync (v1.24.0 to v1.25.1)
**Rationale:** Done last so conflicts are between two understood, stable codebases. The 1,077-commit scope is managed by doing it after GRD features are stable and tested. One hour of diff analysis is required before committing to this phase's plan.
**Delivers:** GRD on v1.25.1 base; `spawnSync` in `execGit`; `stripShippedMilestones()`; `getMilestonePhaseFilter()`; quick task IDs; all research extensions preserved.
**Addresses:** Version currency, upstream feature access
**Avoids:** Upstream sync destroying research-specific modifications (Pitfall 1)

### Phase Ordering Rationale

- Namespace first because it has the highest cross-file coverage and zero behavioral dependencies — the right time to do mechanical changes is before behavioral complexity is added.
- Config second because it is the plumbing all feature phases read; building features on a schema that does not yet exist creates tests that can pass for the wrong reasons.
- Template changes third because they are small, contained, and unlock enforcement logic (plan-checker needs the Evidence Quality section to exist before it can validate notes against it).
- Review type enforcement before verification because plan-checker rules and Tier 0 thresholds both reference `review_type`; establishing enforcement semantics first prevents ambiguity in threshold design.
- Adaptive communication before synthesis because synthesis workflows need tier-conditional blocks; building the pattern in simpler workflows first reduces synthesis implementation risk.
- Upstream sync last because an unexamined 1,077-commit delta is the highest-risk unknown; isolating it after all other work is stable makes the recovery cost predictable and bounded.

### Research Flags

Phases likely needing `/gsd:research-phase` deeper research during planning:
- **Phase 1 (Namespace Migration):** The command vocabulary mapping (24 commands, PM-to-research naming) should be validated against the full workflow cross-reference graph before scripting. The rename script logic for seven distinct context types warrants a planning deep-dive before any file is touched.
- **Phase 6 (Adaptive Communication):** The 41-workflow breadth and the user-facing/agent-facing boundary design are novel patterns without established templates in the codebase. The tier-conditional block syntax and the output formatting layer architecture need design work before any workflow file is modified.
- **Phase 8 (Upstream Sync):** Mandatory pre-phase diff analysis of v1.24.0 to v1.25.1 is a prerequisite. If upstream has structural refactors beyond the additive changes identified in research, this phase may need to be repositioned earlier.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Config Schema):** Config CRUD extension is well-understood. `configWithDefaults` deep-merge is a standard pattern. Low uncertainty.
- **Phase 3 (Templates):** Template file edits and four file renames. No novel patterns.
- **Phase 4 (Plan-Checker):** Extending an existing module with four conditional rules. The existing rule pattern is directly replicable.
- **Phase 5 (Verification):** `verifyTier0()` is new but its interface and the coverage threshold table are fully specified in the research.
- **Phase 7 (Synthesis):** Reuses execute-phase machinery. New workflows but the orchestration pattern is established.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct inspection of codebase, upstream diff, and runtime. Zero ambiguity about technology choices — no new dependencies needed. |
| Features | MEDIUM-HIGH | Table stakes grounded in established research methodology (Cochrane, PRISMA, Covidence workflows). Differentiators (adaptive communication, synthesis pipeline) are novel with no direct comparators, but the design rationale is sound and the implementation path is clear. |
| Architecture | HIGH | Direct code inspection of all 17 CJS modules, 41 workflow files, and occurrence counts via grep. Phase build order derives from actual dependency analysis, not inference. |
| Pitfalls | HIGH | Grounded in v1.1 sync lessons (documented in milestone audit), direct grep analysis (1,907 occurrences counted), and spec review. Warning signs and recovery strategies are specific and verifiable. |

**Overall confidence:** HIGH

### Gaps to Address

- **Upstream diff scope (Phase 8):** The exact scope of v1.24.0 to v1.25.1 changes is unknown until analyzed. Stack research lists likely changes but flags scope as unverified for several modules. Resolve with one hour of diff analysis before Phase 8 planning. If architectural changes are found, Phase 8 may need repositioning.
- **Tier-conditional block syntax:** No established pattern exists for how tier branches should look in workflow markdown. Architecture research suggests XML-style blocks (`<tier_guided>`, `<tier_standard>`, `<tier_expert>`). The exact syntax (nesting rules, default behavior when tier is unset) must be defined and documented before Phase 6 begins.
- **Epistemological stance downstream effects:** Both FEATURES.md and PITFALLS.md flag this as at risk of being decorative. At minimum, one concrete behavioral difference per stance (Evidence Quality column structure) must be specified before Phase 2 closes. Full implementation deferred but the stub must be wired and verifiable.
- **`tier.cjs` module vs. config-driven workflow branching:** Stack research recommends a `tier.cjs` module; Architecture research argues against it in favor of pure workflow markdown branching. Resolve at the start of Phase 4. Low stakes either way — the decision should be documented and applied consistently across all phases.

---

## Sources

### Primary (HIGH confidence)
- Upstream GSD v1.25.1: `~/.claude/get-shit-done/` — direct file comparison; sync manifest
- GRD v1.1 codebase: `/Users/jeremiahwolf/Desktop/Projects/APPs/GSDR/` — direct inspection of all 17 CJS modules, 41 workflow files, 164 tests
- GRD v1.2 spec: `docs/GRD-v1.2-Research-Reorientation-Spec.md` — authoritative requirements, command mapping table, smart defaults matrix
- v1.1 milestone audit: `.planning/milestones/v1.1-MILESTONE-AUDIT.md` — namespace leak patterns, tech debt inventory
- Codebase grep analysis: 1,907 occurrences of `grd` across 172 files (confirmed count); 164 tests across 9 test files

### Secondary (MEDIUM confidence)
- Covidence review type documentation and scoping review protocol guide (2025)
- PRISMA 2020 statement and 2025 guideline updates
- Rayyan, Elicit, NVivo/ATLAS.ti product documentation — competitor feature gap analysis
- Tools for SR automation scoping review (ScienceDirect, 2021)

### Tertiary (supporting context)
- Creswell & Creswell (2018), Booth et al. (2008) — literature review structure validation for parallel researcher categories
- Muller-Bloch & Kranz (2015), Alvesson & Sandberg (2011) — gap taxonomy and problematization frameworks for synthesis stage design
- Lincoln & Guba trustworthiness criteria — constructivist evidence quality criteria for epistemological stance implementation

---
*Research completed: 2026-03-17*
*Ready for roadmap: yes*
