# Roadmap: GSD-R

## Overview

GSD-R transforms GSD's code-commit workflow into a research-note workflow.

## Milestones

- ✅ **v1.0 GSD-R MVP** -- Phases 1-8 (shipped 2026-03-12)
- ✅ **v1.1 Upstream Sync** -- Phases 9-14 (shipped 2026-03-16)
- [ ] **v1.2 Research Reorientation** -- Phases 15-22 (in progress)

## Phases

<details>
<summary>v1.0 GSD-R MVP (Phases 1-8) -- SHIPPED 2026-03-12</summary>

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

### v1.2 Research Reorientation (In Progress)

**Milestone Goal:** Transform GSD-R into GRD -- a research tool that uses PM discipline, not a PM tool that produces research notes.

- [x] **Phase 15: Upstream Sync to v1.25.1** - Sync all modules, agents, workflows, and templates with GSD v1.25.1 baseline (completed 2026-03-17)
- [ ] **Phase 16: Config Schema and Defaults** - Add researcher_tier, review_type, epistemological_stance to config with configWithDefaults() deep-merge
- [ ] **Phase 17: Namespace Migration** - Rename gsd-r to grd across all files, commands, agents, and directory structure
- [ ] **Phase 18: Research Formulation and Notes** - Reframe new-research scoping, recharter parallel researchers, update note template with Evidence Quality and temporal positioning
- [ ] **Phase 19: Plan-Checker Enforcement** - Add review-type-conditional rules with graduated enforcement
- [ ] **Phase 20: Three-Tier Verification** - Add Tier 0 sufficiency check gating existing Tier 1 and Tier 2
- [ ] **Phase 21: Adaptive Communication** - Apply researcher tier adaptation across all agent prompts, templates, verification, and error messages
- [ ] **Phase 22: Synthesis Stage** - Build /grd:synthesize with thematic synthesis, theoretical integration, gap analysis, and argument construction

## Phase Details

### Phase 15: Upstream Sync to v1.25.1
**Goal**: Codebase runs on GSD v1.25.1 baseline with all research-specific modifications preserved
**Depends on**: Nothing (first phase of v1.2)
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04, SYNC-05, TEST-01
**Success Criteria** (what must be TRUE):
  1. All 17 CJS modules reflect v1.25.1 upstream changes (spawnSync in execGit, stripShippedMilestones, getMilestonePhaseFilter, VALID_CONFIG_KEYS) while preserving research-specific exports
  2. All agent prompts and workflow files incorporate v1.25.1 changes without losing research adaptations
  3. VERSION file reads 1.25.1
  4. All 164+ existing tests pass on the new baseline
**Plans**: 5 plans

Plans:
- [ ] 15-01-PLAN.md -- Sync core.cjs and config.cjs with v1.25.1 (foundation modules + CLI entry point)
- [ ] 15-02-PLAN.md -- Sync remaining 7 CJS modules with v1.25.1 (milestone scoping, regex improvements)
- [ ] 15-03-PLAN.md -- Sync 34 workflows: new files, namespace-only, and minor-functional
- [ ] 15-04-PLAN.md -- Merge 5 large-divergence workflows (discuss-phase, plan-phase, new-project, quick, help)
- [ ] 15-05-PLAN.md -- Sync templates and references, update VERSION to 1.25.1

### Phase 16: Config Schema and Defaults
**Goal**: All v1.2 config fields exist, propagate through init.cjs, and existing projects get correct defaults without manual config edits
**Depends on**: Phase 15
**Requirements**: CFG-01, CFG-02, CFG-03, CFG-04, CFG-05, CFG-06, CFG-07, TRAP-05, TEST-04
**Success Criteria** (what must be TRUE):
  1. Running `/grd:new-research` prompts for researcher_tier, review_type, and epistemological_stance and stores selections in config.json
  2. Selecting a review_type auto-configures critical_appraisal, temporal_positioning, synthesis, and plan_check rigor per the Smart Defaults table
  3. `config.workflow.critical_appraisal` and `config.workflow.temporal_positioning` toggles exist with smart defaults per review type
  4. Review type can be downgraded mid-study via `/grd:settings` — rigor requirements relax, no work lost
  5. Opening an existing v1.1 project with no new config fields produces correct defaults via configWithDefaults() — no crash, no missing-key errors
  6. Tests validate config schema, defaults cascade, and smart defaults for all five review types
**Plans**: TBD

Plans:
- [ ] 16-01: TBD

### Phase 17: Namespace Migration
**Goal**: Every user-facing and internal reference uses the grd namespace with research-native command vocabulary
**Depends on**: Phase 15
**Requirements**: NS-01, NS-02, NS-03, NS-04, NS-05, NS-06, TEST-02
**Success Criteria** (what must be TRUE):
  1. All `/gsd-r:` command references are `/grd:` with research-native names (conduct-inquiry, scope-inquiry, plan-inquiry, verify-inquiry, new-research, complete-study, etc.)
  2. `gsd-r-tools.cjs` is renamed to `grd-tools.cjs` and `get-shit-done-r/` is renamed to `grd/` with all path references updated
  3. All 19 agent names in model-profiles.cjs use `grd-*` prefix
  4. Automated scan finds zero residual `gsd-r` references in any user-facing output
  5. All tests pass with updated namespace references
**Plans**: TBD

Plans:
- [ ] 17-01: TBD
- [ ] 17-02: TBD

### Phase 18: Research Formulation and Notes
**Goal**: The research workflow speaks scholarly vocabulary from project creation through note writing
**Depends on**: Phase 16, Phase 17
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, FORM-06, NOTE-01, NOTE-02, NOTE-03, TRAP-01
**Success Criteria** (what must be TRUE):
  1. `/grd:new-research` scoping produces a PROJECT.md that serves as a research prospectus with problem statement, significance, epistemological stance, review type, researcher tier, research questions, and constraints
  2. The 4 parallel researchers are renamed and rechartered (Methodological Landscape, Prior Findings & Key Themes, Theoretical Framework Survey, Limitations Critiques & Debates) and produce research-native output
  3. BOOTSTRAP.md reframed as "state-of-the-field assessment" with scholarly vocabulary
  4. REQUIREMENTS.md uses "research objectives / specific aims" vocabulary — REQ-IDs are research objectives with acceptance criteria
  5. ROADMAP.md reframed as "research design / study plan" with phases as lines of inquiry
  6. Research note template includes Evidence Quality section scaled by review type and influenced by epistemological stance
  7. Research note frontmatter includes `era`, `review_type`, `inquiry`, and `status` fields with era skippable via config
  8. `--prd <file>` and `--batch N` flags implemented for scope-inquiry
**Plans**: TBD

Plans:
- [ ] 18-01: TBD
- [ ] 18-02: TBD

### Phase 19: Plan-Checker Enforcement
**Goal**: The plan-checker enforces review-type-appropriate rigor at the search protocol stage
**Depends on**: Phase 16, Phase 18
**Requirements**: PLAN-01, PLAN-02, TRAP-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. Plan-checker validates 7 checks (source budget, no duplication, primary sources, systematic search strategy, multi-disciplinary perspectives, inclusion/exclusion criteria, diverse methodologies) with each check applying only to the review types that require it
  2. Early investigation phases (1-2) receive advisory warnings; later phases receive blocking errors (graduated enforcement)
  3. Review type mismatch interactive gate offers "Downgrade review type" / "Add rigor" / "Override" when rigor falls below review type requirements
  4. Tests cover each review type's expected rule set and graduated enforcement behavior
**Plans**: TBD

Plans:
- [ ] 19-01: TBD

### Phase 20: Three-Tier Verification
**Goal**: Verification catches insufficient evidence before checking goal-backward quality and source completeness
**Depends on**: Phase 16, Phase 18
**Requirements**: VER-01, VER-02, VER-03, TRAP-03
**Success Criteria** (what must be TRUE):
  1. `verifyTier0()` checks sufficiency (scaled by review type), saturation assessment, and epistemological consistency
  2. Three-tier pipeline runs in order: Tier 0 (sufficiency) then Tier 1 (goal-backward) then Tier 2 (source audit)
  3. `--skip-tier0` flag bypasses sufficiency check while preserving existing Tier 1 and Tier 2 behavior
  4. Saturation interactive gate offers "Evidence is sufficient" / "Continue investigating" / "Add inquiry"
  5. Existing `verifyNote()` behavior is unchanged; `verifyPhase()` wraps the three-tier pipeline
**Plans**: TBD

Plans:
- [ ] 20-01: TBD

### Phase 21: Adaptive Communication
**Goal**: GRD adapts its communication to the researcher's experience level without changing the underlying rigor
**Depends on**: Phase 16, Phase 17, Phase 18
**Requirements**: TIER-01, TIER-02, TIER-03, TIER-04, TEST-06
**Success Criteria** (what must be TRUE):
  1. Agent prompts include researcher tier context and adapt vocabulary, explanation depth, and information density (Guided=plain language with definitions, Standard=academic with context, Expert=precise and terse)
  2. Templates adapt by tier (Guided=inline guidance comments, Standard=brief descriptions, Expert=headers only)
  3. Verification feedback and error messages adapt by tier (Guided=explains failure and suggests next steps, Standard=states failure with standard, Expert=terse)
  4. Agent-to-agent communication (PLAN.md, STATE.md, verification reports) is structurally identical across all tiers -- tier adaptation applies only to user-facing output
  5. Tests validate tier selection and adaptive output across all three tiers
**Plans**: TBD

Plans:
- [ ] 21-01: TBD
- [ ] 21-02: TBD

### Phase 22: Synthesis Stage
**Goal**: Researchers can transform verified notes into structured scholarship through thematic synthesis, theoretical integration, gap analysis, and argument construction
**Depends on**: Phase 18, Phase 20, Phase 21
**Requirements**: SYN-01, SYN-02, SYN-03, SYN-04, SYN-05, SYN-06, SYN-07, SYN-08, TRAP-04, COMP-01, TEST-05
**Success Criteria** (what must be TRUE):
  1. `/grd:synthesize` workflow exists, validates readiness (all investigation phases verified), and generates a synthesis PLAN.md using existing execute-phase machinery
  2. Four synthesis activities produce their outputs: thematic synthesis (THEMES.md), theoretical integration (FRAMEWORK.md), gap analysis (GAPS.md), argument construction (Executive Summary)
  3. Synthesis respects dependency ordering: themes before framework/gaps (which run in parallel), all before argument construction
  4. Synthesis output follows `{Study}-Research/` directory structure with `00-` prefixed synthesis files
  5. Synthesis scope interactive gate offers "Full synthesis" / "Themes + argument only" / "Skip synthesis"
  6. `/grd:complete-study` includes deliverable assembly — compiles synthesis into target format from PROJECT.md
  7. Synthesis is skippable via `config.workflow.synthesis: false` and individual activities via `--skip-themes`, `--skip-framework`, `--skip-gaps` flags
  8. Tests validate synthesis workflow execution and dependency ordering
**Plans**: TBD

Plans:
- [ ] 22-01: TBD
- [ ] 22-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 15 -> 16 -> 17 -> 18 -> 19 -> 20 -> 21 -> 22
Note: Phases 16 and 17 can execute in parallel (both depend only on Phase 15).
Note: Phases 19 and 20 can execute in parallel (both depend on 16+18).

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Fork and Foundation | v1.0 | 3/3 | Complete | 2026-03-11 |
| 2. Vault Write and State | v1.0 | 2/2 | Complete | 2026-03-11 |
| 3. Source Acquisition | v1.0 | 2/2 | Complete | 2026-03-11 |
| 4. Research Agents and Planner | v1.0 | 2/2 | Complete | 2026-03-11 |
| 5. Verification and Workflows | v1.0 | 2/2 | Complete | 2026-03-11 |
| 6. Output Formats and E2E Validation | v1.0 | 1/1 | Complete | 2026-03-12 |
| 7. CLI Wiring and Agent Integration | v1.0 | 2/2 | Complete | 2026-03-12 |
| 8. Traceability Reconciliation | v1.0 | 1/1 | Complete | 2026-03-12 |
| 9. Foundation Module Creation | v1.1 | 1/1 | Complete | 2026-03-15 |
| 10. Core Library Sync | v1.1 | 1/1 | Complete | 2026-03-15 |
| 11. State, Commands, and Remaining Modules | v1.1 | 2/2 | Complete | 2026-03-16 |
| 12. Templates and Execution Rigor | v1.1 | 2/2 | Complete | 2026-03-16 |
| 13. Workflow Sync | v1.1 | 3/3 | Complete | 2026-03-16 |
| 14. Path Standardization and Final Verification | v1.1 | 2/2 | Complete | 2026-03-16 |
| 15. Upstream Sync to v1.25.1 | 5/5 | Complete    | 2026-03-17 | - |
| 16. Config Schema and Defaults | v1.2 | 0/? | Not started | - |
| 17. Namespace Migration | v1.2 | 0/? | Not started | - |
| 18. Research Formulation and Notes | v1.2 | 0/? | Not started | - |
| 19. Plan-Checker Enforcement | v1.2 | 0/? | Not started | - |
| 20. Three-Tier Verification | v1.2 | 0/? | Not started | - |
| 21. Adaptive Communication | v1.2 | 0/? | Not started | - |
| 22. Synthesis Stage | v1.2 | 0/? | Not started | - |

---
*Roadmap created: 2026-03-11*
*Last updated: 2026-03-17 after Phase 15 planning*
