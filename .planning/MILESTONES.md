# Milestones

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

