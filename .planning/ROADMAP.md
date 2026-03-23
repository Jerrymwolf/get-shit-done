# Roadmap: GRD

## Overview

GRD transforms GSD's code-commit workflow into a research-note workflow.

## Milestones

- ✅ **v1.0 GRD MVP** -- Phases 1-8 (shipped 2026-03-12)
- ✅ **v1.1 Upstream Sync** -- Phases 9-14 (shipped 2026-03-16)
- ✅ **v1.2 Research Reorientation** -- Phases 15-24 (shipped 2026-03-22)
- 🚧 **v1.3 Upstream Sync + Rename + Source Pipeline Wiring** -- Phases 25-29 (in progress)

## Phases

<details>
<summary>v1.0 GRD MVP (Phases 1-8) -- SHIPPED 2026-03-12</summary>

- [x] Phase 1: Fork and Foundation (3/3 plans) -- completed 2026-03-11
- [x] Phase 2: Vault Write and State (2/2 plans) -- completed 2026-03-11
- [x] Phase 3: Source Acquisition (2/2 plans) -- completed 2026-03-11
- [x] Phase 4: Research Agents and Planner (2/2 plans) -- completed 2026-03-11
- [x] Phase 5: Verification and Workflows (2/2 plans) -- completed 2026-03-11
- [x] Phase 6: Output Formats and E2E Validation (1/1 plans) -- completed 2026-03-12
- [x] Phase 7: CLI Wiring and Agent Integration (2/2 plans) -- completed 2026-03-12
- [x] Phase 8: Traceability Reconciliation (1/1 plans) -- completed 2026-03-12

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>v1.1 Upstream Sync (Phases 9-14) -- SHIPPED 2026-03-16</summary>

- [x] Phase 9: Foundation Module Creation (1/1 plans) -- completed 2026-03-15
- [x] Phase 10: Core Library Sync (1/1 plans) -- completed 2026-03-15
- [x] Phase 11: State, Commands, and Remaining Modules (2/2 plans) -- completed 2026-03-16
- [x] Phase 12: Templates and Execution Rigor (2/2 plans) -- completed 2026-03-16
- [x] Phase 13: Workflow Sync (3/3 plans) -- completed 2026-03-16
- [x] Phase 14: Path Standardization and Final Verification (2/2 plans) -- completed 2026-03-16

Full details: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>v1.2 Research Reorientation (Phases 15-24) -- SHIPPED 2026-03-22</summary>

- [x] Phase 15: Upstream Sync to v1.25.1 -- completed 2026-03-17
- [x] Phase 16: Config Schema and Defaults -- completed 2026-03-18
- [x] Phase 17: Namespace Migration -- completed 2026-03-18
- [x] Phase 18: Research Prospectus and Researcher Rechartering -- completed 2026-03-19
- [x] Phase 19: Review-Type Enforcement -- completed 2026-03-19
- [x] Phase 20: Three-Tier Verification -- completed 2026-03-20
- [x] Phase 21: Adaptive Communication -- completed 2026-03-20
- [x] Phase 22: Synthesis Stage -- completed 2026-03-21
- [x] Phase 23: Gap Closure A -- completed 2026-03-22
- [x] Phase 24: Gap Closure B -- completed 2026-03-22

Full details: `.planning/ROADMAP.md` (v1.2 archive)

</details>

### v1.3 Upstream Sync + Rename + Source Pipeline Wiring (In Progress)

**Milestone Goal:** Sync GRD to upstream GSD v1.28.0, eliminate all GSD-R branding, adopt research-native command vocabulary, and wire the source acquisition pipeline.

- [x] **Phase 25: Upstream Sync to v1.28.0** - Sync all CJS modules, workflows, agent prompts, and templates with GSD v1.28.0 baseline (completed 2026-03-23)
- [ ] **Phase 26: Rename GSD-R to GRD** - Eliminate all GSD-R branding via file renames, directory moves, and bulk content replacement
- [ ] **Phase 27: Research-Native Command Vocabulary** - Rename 6 core commands to research-native equivalents and update all cross-references
- [ ] **Phase 28: Source Pipeline Wiring** - Connect acquire.cjs, vault.cjs, and source-researcher agent into the conduct-inquiry execution path
- [ ] **Phase 29: Documentation Rewrite** - Rewrite README.md and docs/DESIGN.md with final-state naming and command references

#### Phase 25: Upstream Sync to v1.28.0
**Goal**: GRD operates on the latest upstream GSD v1.28.0 codebase with all research extensions preserved
**Depends on**: Nothing (first phase of v1.3)
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04, SYNC-05, SYNC-06
**Success Criteria** (what must be TRUE):
  1. All CJS library modules reflect v1.28.0 upstream changes while preserving research extensions (note status, source gaps, vault write, acquire, verify-research)
  2. All workflow and agent prompt files incorporate v1.28.0 improvements while retaining research-specific adaptations (three-tier verification, synthesis, adaptive communication)
  3. VERSION file reads 1.28.0
  4. All 514+ existing tests pass after sync with zero regressions
**Plans:** 6/6 plans complete

Plans:
- [x] 25-01-PLAN.md -- Foundation: core.cjs + security.cjs
- [x] 25-02-PLAN.md -- HIGH-conflict shared modules (config, init, state, phase, commands)
- [x] 25-03-PLAN.md -- LOW-conflict shared modules (frontmatter, template, milestone, roadmap, verify, model-profiles)
- [x] 25-04-PLAN.md -- New upstream modules + CLI wiring (uat, workstream, profile-output, profile-pipeline, grd-tools.cjs)
- [x] 25-05-PLAN.md -- Workflow sync (30 shared + 26 new + 12 GRD-only)
- [x] 25-06-PLAN.md -- Templates + commands + VERSION + final validation

#### Phase 26: Rename GSD-R to GRD
**Goal**: Zero instances of GSD-R branding remain in active files -- the project is consistently named GRD everywhere
**Depends on**: Phase 25
**Requirements**: REN-01, REN-02, REN-03, REN-04, REN-05, REN-06, REN-07, REN-08, REN-09
**Success Criteria** (what must be TRUE):
  1. `commands/grd/` directory exists and `commands/gsd-r/` does not exist
  2. All 16 agent files exist as `agents/grd-*.md` and no `agents/gsd-r-*.md` files remain
  3. `grep -r "gsd-r\|GSD-R\|get-shit-done-r"` across active files returns zero results (excluding .planning/, node_modules/, package-lock.json)
  4. All tests pass after rename (including updated test file references)
**Plans**: TBD

#### Phase 27: Research-Native Command Vocabulary
**Goal**: Users invoke research-native commands (scope-inquiry, conduct-inquiry, etc.) instead of PM-style names (discuss-phase, execute-phase, etc.)
**Depends on**: Phase 26
**Requirements**: CMD-01, CMD-02, CMD-03, CMD-04, CMD-05, CMD-06
**Success Criteria** (what must be TRUE):
  1. The 6 renamed command files exist in `commands/grd/` (new-research.md, scope-inquiry.md, plan-inquiry.md, conduct-inquiry.md, verify-inquiry.md, complete-study.md)
  2. Old command filenames (new-project.md, discuss-phase.md, plan-phase.md, execute-phase.md, verify-work.md, complete-milestone.md) no longer exist in `commands/grd/`
  3. `grep` for old `/grd:` prefixed command names across commands/, agents/, grd/workflows/, README.md, and docs/DESIGN.md returns zero results
  4. All tests pass after vocabulary update
**Plans**: TBD

#### Phase 28: Source Pipeline Wiring
**Goal**: Running conduct-inquiry on a phase with `<src>` blocks produces `-sources/` directories with acquired files that pass Tier 2 verification
**Depends on**: Phase 27
**Requirements**: SRC-01, SRC-02, SRC-03, SRC-04, SRC-05
**Success Criteria** (what must be TRUE):
  1. conduct-inquiry workflow spawns the source-researcher agent after each plan's executor completes, and the agent calls acquireSource() for each `<src>` block URL
  2. atomicWrite() bundles note + sources + SOURCE-LOG.md + git commit during note creation (no raw file writes for research notes)
  3. validateReferences() in verify-inquiry correctly identifies missing sources, orphaned files, and unavailable-source exemptions for both local and global install paths
  4. Running conduct-inquiry on a test phase with `<src>` blocks produces `-sources/` directories containing actual acquired files
**Plans**: TBD

#### Phase 29: Documentation Rewrite
**Goal**: All user-facing documentation reflects the final-state naming, commands, and architecture
**Depends on**: Phase 27
**Requirements**: DOC-01, DOC-02, DOC-03, DOC-04
**Success Criteria** (what must be TRUE):
  1. README.md uses GRD naming throughout, includes translation table (GSD concepts to GRD equivalents), and all command examples use new invocations (/grd:new-research, /grd:scope-inquiry, etc.)
  2. docs/DESIGN.md reflects all naming changes with zero stale branding
  3. No instances of old command names or GSD-R branding in any user-facing documentation file
**Plans**: TBD
**UI hint**: yes

#### Progress

**Execution Order:**
Phases execute in numeric order: 25 -> 26 -> 27 -> 28 / 29 (28 and 29 can run in parallel after 27)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 25. Upstream Sync to v1.28.0 | v1.3 | 6/6 | Complete    | 2026-03-23 |
| 26. Rename GSD-R to GRD | v1.3 | 0/TBD | Not started | - |
| 27. Command Vocabulary | v1.3 | 0/TBD | Not started | - |
| 28. Source Pipeline Wiring | v1.3 | 0/TBD | Not started | - |
| 29. Documentation Rewrite | v1.3 | 0/TBD | Not started | - |
