# Milestones

## v1.3 Research-Native Purification (Shipped: 2026-03-24)

**Phases completed:** 5 phases, 8 plans, 13 tasks

**Key accomplishments:**

- GRD branding and research-awareness added to 4 agent prompts (executor, verifier, plan-checker, roadmapper)
- Research task type with acquisition/synthesis examples in phase-prompt.md and dual-purpose scholarly frontmatter in summary.md
- Three PM-only commands reconceptualized as research-native tools: diagnose (methodology gaps, source conflicts), map-corpus (knowledge landscape survey), add-verification (evidence checks and source coverage assertions)
- Rewrote map-codebase and add-tests commands as research-native tools: corpus landscape survey and evidence verification criteria
- Four PM-oriented output commands reconceptualized as research delivery tools: export-research (Obsidian/manuscript/archive packaging), export-clean (artifact-free sharing), presentation-design (paper/poster/slides/report structure), output-review (6-dimension scholarly quality audit)
- Complete /grd:help rewrite with Research Workflow / Utility / Configuration sections and research-native descriptions for all 30+ commands

---

## v1.2 Research Reorientation (Shipped: 2026-03-22)

**Phases completed:** 10 phases (15-24), 39 plans total across v1.0-v1.2
**Timeline:** 6 days (2026-03-17 → 2026-03-22)
**Tests:** 514 passing (18 test files + smoke suite)

**Key accomplishments:**

- Synced to GSD v1.25.1 baseline preserving all research extensions
- Added research config schema: researcher_tier, review_type, epistemological_stance with smart defaults
- Migrated namespace from gsd-r to grd with research-native command vocabulary
- Reframed PROJECT.md as research prospectus, rechartered 4 parallel researchers for scholarly output
- Added review-type enforcement (systematic/scoping/integrative/critical/narrative) with PRISMA protocol awareness
- Built three-tier verification: Tier 0 sufficiency → Tier 1 goal-backward → Tier 2 source audit
- Implemented adaptive communication across 3 researcher tiers (guided/standard/expert)
- Created synthesis stage: thematic synthesis, theoretical integration, gap analysis, argument construction
- Added 69-test comprehensive smoke test suite covering structural integrity, CLI routes, config, and E2E pipeline

**Tech debt accepted:**

- Duplicate stateExtractField in state.cjs (carried from v1.1)
- config-set-model-profile stub in grd-tools.cjs (carried from v1.1)
- stats.md research metrics deferred
- Bibliometric mapping deferred to future milestone
- PRISMA flow diagram generation deferred to future milestone

**Archive:** `.planning/ROADMAP.md` (phases 15-24 section)

---

## v1.1 Upstream Sync (Shipped: 2026-03-16)

**Phases completed:** 6 phases, 11 plans, 22 tasks
**Timeline:** 2 days (2026-03-15 → 2026-03-16)
**Requirements:** 27/27 satisfied
**Tests:** 164 passing (9 test files)

**Key accomplishments:**

- Created model-profiles.cjs foundation with 19 GRD agents and upstream v1.24.0 version tracking
- Synced core.cjs with milestone scoping, profile inheritance, and flexible goal regex
- Merged state.cjs preserving 7 research extensions alongside 16 upstream functions
- Added execution rigor gates (read_first, acceptance_criteria) to templates and workflows
- Synced 61 workflow and command files with upstream v1.24.0 while preserving research adaptations
- Standardized all paths and achieved zero namespace leaks across 175 files

**Tech debt accepted:**

- Duplicate stateExtractField in state.cjs (dead code)
- config-set-model-profile stub in grd-tools.cjs
- stats.md research metrics deferred
- 2 stale Skill() namespace calls in plan-phase.md and discuss-phase.md
- replaceInCurrentMilestone exported but unused

**Archive:** `.planning/milestones/v1.1-ROADMAP.md`, `.planning/milestones/v1.1-REQUIREMENTS.md`

---

## v1.0 GRD MVP (Shipped: 2026-03-12)

**Phases completed:** 8 phases, 15 plans, 33 requirements
**Timeline:** 2 days (2026-03-11 → 2026-03-12)
**Lines of code:** ~21K (CJS + agent prompts + templates)

**Key accomplishments:**

- Forked GSD into GRD with independent research-note workflow, templates, Git LFS, and filesystem vault
- Atomic vault writes — note + sources + SOURCE-LOG.md + git commit with rollback on failure
- Source acquisition engine with firecrawl→web_fetch→wget fallback chain, content validation, and two-hop traceability
- 4 specialized researcher subagents (source, methods, architecture, limitations) with plan-checker source discipline
- Two-tier verification — goal-backward quality check + source audit ensuring every finding traces to a local file
- Full CLI wiring — 8 routes connecting library functions to tool layer, agent prompts with exact invocation instructions
- All 33 requirements satisfied with full traceability across REQUIREMENTS.md, ROADMAP.md, and SUMMARY files

**Archive:** `.planning/milestones/v1.0-ROADMAP.md`, `.planning/milestones/v1.0-REQUIREMENTS.md`

---
