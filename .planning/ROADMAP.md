# Roadmap: GRD

## Overview

GRD transforms GSD's code-commit workflow into a research-note workflow.

## Milestones

- ✅ **v1.0 GRD MVP** -- Phases 1-8 (shipped 2026-03-12)
- ✅ **v1.1 Upstream Sync** -- Phases 9-14 (shipped 2026-03-16)
- ✅ **v1.2 Research Reorientation** -- Phases 15-24 (shipped 2026-03-22)
- 🚧 **v1.3 Research-Native Purification** -- Phases 28-32 (in progress)

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

- [x] Phase 15: Upstream Sync to v1.25.1 (5/5 plans) -- completed 2026-03-17
- [x] Phase 16: Config Schema and Defaults (2/2 plans) -- completed 2026-03-18
- [x] Phase 17: Namespace Migration (2/2 plans) -- completed 2026-03-18
- [x] Phase 18: Research Formulation and Notes (4/4 plans) -- completed 2026-03-20
- [x] Phase 19: Plan-Checker Enforcement (2/2 plans) -- completed 2026-03-20
- [x] Phase 20: Three-Tier Verification (2/2 plans) -- completed 2026-03-20
- [x] Phase 21: Adaptive Communication (3/3 plans) -- completed 2026-03-21
- [x] Phase 22: Synthesis Stage (2/2 plans) -- completed 2026-03-22
- [x] Phase 23: Workflow Init Alignment (1/1 plans) -- completed 2026-03-22
- [x] Phase 24: Verification Pipeline Wiring (1/1 plans) -- completed 2026-03-22

Full details: Phase details collapsed above.

</details>

<details>
<summary>v1.3 Pre-milestone work (Phases 26-27) -- COMPLETE</summary>

- [x] Phase 26: GSD-to-GRD Rename (1/1 plans) -- completed 2026-03-23
- [x] Phase 27: Research-Native Command Vocabulary (1/1 plans) -- completed 2026-03-23

</details>

### v1.3 Research-Native Purification (In Progress)

**Milestone Goal:** Reconceptualize every PM/application-development feature into its research equivalent -- nothing removed, everything reframed for scholarly workflows.

- [x] **Phase 28: Agent and Workflow Reorientation** - Fix remaining GSD references in agents and rewrite workflow examples with research vocabulary (completed 2026-03-23)
- [x] **Phase 29: Research Template Variants** - Create research-specific task templates and summary templates with scholarly frontmatter (completed 2026-03-23)
- [x] **Phase 30: Command Reconceptualization -- Diagnostics and Corpus** - Reconceptualize debug, map-codebase, and add-tests as research equivalents (completed 2026-03-23)
- [x] **Phase 31: Command Reconceptualization -- Export and Presentation** - Reconceptualize ship, pr-branch, ui-phase, and ui-review as research equivalents (completed 2026-03-23)
- [x] **Phase 32: Help Reorganization** - Restructure /grd:help around the research workflow with proper categorization and descriptions (completed 2026-03-23)

## Phase Details

### Phase 28: Agent and Workflow Reorientation
**Goal**: Agent prompts and workflow examples speak research language -- no PM/feature vocabulary in user-facing guidance
**Depends on**: Nothing (first phase of v1.3 main work)
**Requirements**: AGT-01, AGT-02, AGT-03, WFL-01, WFL-02, WFL-03
**Success Criteria** (what must be TRUE):
  1. grd-executor.md, grd-verifier.md, grd-plan-checker.md, and grd-roadmapper.md contain zero "GSD" references in any context
  2. grd-executor.md describes research outputs (notes, sources, synthesis documents) as valid deliverables, not just code
  3. grd-verifier.md describes its purpose as validating research findings and source completeness, not validating built features
  4. scope-inquiry.md examples use methodology choices, scope boundaries, and theoretical emphasis -- not UI features or sprint planning
  5. verify-inquiry.md describes validation of research findings, evidence quality, and source coverage -- not feature testing
  6. new-milestone.md dimension labels read Landscape/Questions/Frameworks/Debates (not Stack/Features/Architecture/Pitfalls)
**Plans**: 2 plans
Plans:
- [x] 28-01-PLAN.md — Fix GSD references and add research awareness to 4 agent files
- [x] 28-02-PLAN.md — Rewrite workflow examples with research vocabulary in 3 workflow files

### Phase 29: Research Template Variants
**Goal**: Plan task templates and summary templates include research-specific structure so generated plans produce scholarly output
**Depends on**: Phase 28
**Requirements**: TPL-01, TPL-02, TPL-03
**Success Criteria** (what must be TRUE):
  1. phase-prompt.md includes research-task examples with `<task type="research">` blocks showing sources, notes, and findings structure
  2. A research-summary template variant exists with frontmatter fields: sources_acquired, notes_produced, evidence_quality, domains_covered
  3. summary.md template detects project type and renders appropriate frontmatter (code fields for code projects, research fields for research projects)
**Plans**: 1 plan
Plans:
- [x] 29-01-PLAN.md — Add research task examples to phase-prompt.md and research frontmatter variant to summary.md

### Phase 30: Command Reconceptualization -- Diagnostics and Corpus
**Goal**: Three PM-only commands become research-native tools that researchers would reach for naturally
**Depends on**: Phase 28
**Requirements**: CMD-02, CMD-04, CMD-05
**Success Criteria** (what must be TRUE):
  1. `/grd:diagnose` investigates methodology gaps, source conflicts, and analytical dead ends -- not code bugs
  2. `/grd:map-corpus` (or map-literature) surveys existing sources and the knowledge landscape of a research project -- not a codebase
  3. `/grd:add-verification` adds evidence checks and source coverage assertions -- not software test cases
  4. Each reconceptualized command's workflow file, agent prompt, and CLI route are updated end-to-end
**Plans**: 2 plans
Plans:
- [ ] 30-01-PLAN.md — Reconceptualize /grd:debug as /grd:diagnose (CLI route, workflow, agent, template)
- [ ] 30-02-PLAN.md — Reconceptualize /grd:map-codebase as /grd:map-corpus and /grd:add-tests as /grd:add-verification

### Phase 31: Command Reconceptualization -- Export and Presentation
**Goal**: Four output-oriented PM commands become research delivery tools for packaging, exporting, and reviewing scholarly work
**Depends on**: Phase 29
**Requirements**: CMD-01, CMD-03, CMD-06, CMD-07
**Success Criteria** (what must be TRUE):
  1. `/grd:ship` (or export) packages research notes and sources for Obsidian vault export, manuscript assembly, or deliverable packaging
  2. `/grd:export-clean` (or equivalent) packages research notes without .planning/ artifacts for sharing or submission
  3. `/grd:presentation-design` (or equivalent) plans how research findings will be presented (poster, paper, slide deck, report)
  4. `/grd:output-review` audits quality of research deliverables -- completeness, citation coverage, argument coherence
  5. Each reconceptualized command's workflow file, agent prompt, and CLI route are updated end-to-end
**Plans**: 2 plans
Plans:
- [x] 31-01-PLAN.md — Reconceptualize /grd:ship and /grd:pr-branch as research export tools
- [x] 31-02-PLAN.md — Reconceptualize /grd:ui-phase as presentation design and /grd:ui-review as output review

### Phase 32: Help Reorganization
**Goal**: `/grd:help` presents the tool as a research workflow system, not a PM tool -- every command described in scholarly terms
**Depends on**: Phase 30, Phase 31
**Requirements**: HLP-01, HLP-02
**Success Criteria** (what must be TRUE):
  1. `/grd:help` organizes commands into Research Workflow / Utility / Configuration sections (not PM-centric categories)
  2. Every command entry shows its research-native purpose (e.g., "Plan the next line of inquiry" not "Plan the next development phase")
  3. A researcher unfamiliar with GSD would understand what each command does from its help description alone
**Plans**: 1 plan
Plans:
- [x] 32-01-PLAN.md — Rewrite help workflow with research-native organization, descriptions, and all current commands

## Progress

**Execution Order:**
Phases execute in numeric order: 28 -> 29 -> 30/31 -> 32
Note: Phases 30 and 31 can execute in parallel (both depend on 28/29 respectively, no interdependency).

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
| 15. Upstream Sync to v1.25.1 | v1.2 | 5/5 | Complete | 2026-03-17 |
| 16. Config Schema and Defaults | v1.2 | 2/2 | Complete | 2026-03-18 |
| 17. Namespace Migration | v1.2 | 2/2 | Complete | 2026-03-18 |
| 18. Research Formulation and Notes | v1.2 | 4/4 | Complete | 2026-03-20 |
| 19. Plan-Checker Enforcement | v1.2 | 2/2 | Complete | 2026-03-20 |
| 20. Three-Tier Verification | v1.2 | 2/2 | Complete | 2026-03-20 |
| 21. Adaptive Communication | v1.2 | 3/3 | Complete | 2026-03-21 |
| 22. Synthesis Stage | v1.2 | 2/2 | Complete | 2026-03-22 |
| 23. Workflow Init Alignment | v1.2 | 1/1 | Complete | 2026-03-22 |
| 24. Verification Pipeline Wiring | v1.2 | 1/1 | Complete | 2026-03-22 |
| 26. GSD-to-GRD Rename | v1.3 | 1/1 | Complete | 2026-03-23 |
| 27. Research-Native Command Vocabulary | v1.3 | 1/1 | Complete | 2026-03-23 |
| 28. Agent and Workflow Reorientation | v1.3 | 2/2 | Complete    | 2026-03-23 |
| 29. Research Template Variants | v1.3 | 1/1 | Complete    | 2026-03-23 |
| 30. Command Reconceptualization -- Diagnostics and Corpus | v1.3 | 2/2 | Complete    | 2026-03-23 |
| 31. Command Reconceptualization -- Export and Presentation | v1.3 | 2/2 | Complete    | 2026-03-23 |
| 32. Help Reorganization | v1.3 | 1/1 | Complete    | 2026-03-23 |

---
*Roadmap created: 2026-03-11*
*Last updated: 2026-03-23 after Phase 32 planning*
