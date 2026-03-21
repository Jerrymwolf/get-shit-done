# Requirements: GRD v1.2 Research Reorientation

**Defined:** 2026-03-17
**Core Value:** Every research finding is self-contained and auditable -- the note plus its actual source files, never just links

## v1.2 Requirements

Requirements for the Research Reorientation milestone. Each maps to roadmap phases.

### Upstream Sync

- [x] **SYNC-01**: All core CJS modules synced with GSD v1.25.1 while preserving research-specific modifications
- [x] **SYNC-02**: All agent prompts synced with GSD v1.25.1 while preserving research adaptations
- [x] **SYNC-03**: All workflow and command files synced with GSD v1.25.1 while preserving research adaptations
- [x] **SYNC-04**: All templates synced with GSD v1.25.1 while preserving research adaptations
- [x] **SYNC-05**: VERSION file updated to 1.25.1 and all 164+ tests pass on new baseline

### Namespace & Identity

- [x] **NS-01**: All `/grd:` command references renamed to `/grd:` across all files
- [x] **NS-02**: Command vocabulary renamed to research-native terms (execute-phase → conduct-inquiry, discuss-phase → scope-inquiry, plan-phase → plan-inquiry, verify-work → verify-inquiry, new-project → new-research, complete-milestone → complete-study, etc.)
- [x] **NS-03**: `grd-tools.cjs` renamed to `grd-tools.cjs` with all internal and external references updated
- [x] **NS-04**: `grd/` directory renamed to `grd/` with all path references updated
- [x] **NS-05**: Agent names in model-profiles.cjs renamed from `grd-*` to `grd-*`
- [x] **NS-06**: Zero residual `grd` references in any user-facing output (verified by automated scan)

### Config & Scoping

- [x] **CFG-01**: `researcher_tier` field in config.json (guided/standard/expert) with selection during `/grd:new-research`
- [x] **CFG-02**: `review_type` field in config.json (systematic/scoping/integrative/critical/narrative) with selection during `/grd:new-research`
- [x] **CFG-03**: `epistemological_stance` field in config.json (positivist/constructivist/pragmatist/critical) with pragmatist default if skipped
- [x] **CFG-04**: Smart defaults cascade -- selecting a review type auto-configures critical_appraisal, temporal_positioning, synthesis, and plan_check rigor per the Smart Defaults table
- [x] **CFG-05**: `configWithDefaults()` function ensuring existing projects get correct defaults for all new fields
- [x] **CFG-06**: `config.workflow.critical_appraisal` toggle (skips Evidence Quality section globally; defaults to false for narrative+Guided tier)
- [x] **CFG-07**: `config.workflow.temporal_positioning` toggle (skips era field; defaults per Smart Defaults table)

### Research Formulation

- [x] **FORM-01**: `/grd:new-research` scoping includes researcher tier, review type, epistemological positioning, and standard topic/significance/audience questions
- [x] **FORM-02**: 4 parallel researchers renamed and rechartered (Methodological Landscape, Prior Findings & Key Themes, Theoretical Framework Survey, Limitations Critiques & Debates)
- [x] **FORM-03**: PROJECT.md serves as research prospectus with problem statement, significance, epistemological stance, review type, researcher tier, research questions, and constraints
- [x] **FORM-04**: BOOTSTRAP.md reframed as "state-of-the-field assessment" with scholarly vocabulary (Established → Contested → Unexplored maps to known → debated → gap)
- [x] **FORM-05**: REQUIREMENTS.md vocabulary shifted to "research objectives / specific aims" — each REQ-ID is a research objective with acceptance criteria defining what "answered" means
- [x] **FORM-06**: ROADMAP.md reframed as "research design / study plan" — phases described as lines of inquiry, not administrative phases

### Research Notes

- [x] **NOTE-01**: Research note template includes Evidence Quality section with depth scaled by review type (systematic=full CASP/GRADE, scoping=charting, integrative/critical=proportional, narrative=optional) and influenced by epistemological stance (positivist prioritizes RCTs/meta-analyses, constructivist values rich description)
- [x] **NOTE-02**: Research note frontmatter includes `era` field (foundational/developmental/contemporary/emerging) for temporal positioning, skippable via config
- [x] **NOTE-03**: Research note frontmatter updated with `review_type`, `inquiry`, `era`, and `status` fields

### Plan-Checker

- [x] **PLAN-01**: Plan-checker validates against review type requirements (7 checks: source budget, no duplication, primary sources, systematic search strategy, multi-disciplinary perspectives, inclusion/exclusion criteria, diverse methodologies)
- [x] **PLAN-02**: Plan-checker uses graduated enforcement -- advisory warnings in early investigation phases, blocking errors in later phases

### Verification

- [x] **VER-01**: Tier 0 sufficiency verification checks whether enough evidence has been gathered for the selected review type, including saturation assessment and epistemological consistency check
- [x] **VER-02**: Sufficiency criteria scale by review type (systematic=exhaustive, scoping=representative, narrative=adequate coverage)
- [x] **VER-03**: Three-tier verification pipeline: Tier 0 (sufficiency) → Tier 1 (goal-backward) → Tier 2 (source audit), with `--skip-tier0` flag

### Synthesis

- [ ] **SYN-01**: `/grd:synthesize` workflow exists and reuses execute-phase machinery
- [ ] **SYN-02**: Thematic synthesis agent produces THEMES.md mapping patterns and themes across all verified notes
- [ ] **SYN-03**: Theoretical integration agent produces FRAMEWORK.md testing evidence against theoretical framework from Stage 1
- [ ] **SYN-04**: Gap analysis agent produces GAPS.md with typed gaps (Muller-Bloch & Kranz taxonomy) and problematization
- [ ] **SYN-05**: Argument construction agent produces Executive Summary assembling synthesis into coherent scholarly argument
- [ ] **SYN-06**: Synthesis respects dependency ordering: 6a (themes) before 6b/6c (framework/gaps run in parallel), all before 6d (argument)
- [ ] **SYN-07**: Synthesis skippable via `config.workflow.synthesis: false` and individual activities via `--skip-themes`, `--skip-framework`, `--skip-gaps` flags
- [ ] **SYN-08**: Synthesis output follows `{Study}-Research/` directory structure with `00-` prefixed synthesis files and numbered line-of-inquiry subdirectories

### Adaptive Communication

- [ ] **TIER-01**: All agent prompts include researcher tier context and adapt vocabulary, explanations, and information density accordingly
- [x] **TIER-02**: All templates adapt by tier (Guided=inline guidance comments, Standard=brief descriptions, Expert=headers only)
- [ ] **TIER-03**: Verification feedback adapts by tier (Guided=explains what failed and why, Standard=states failure with standard, Expert=terse)
- [ ] **TIER-04**: Error messages and next-action routing adapt by tier (Guided=suggests next steps and explains, Standard=states requirement and rationale, Expert=states requirement only)

### Trap Doors & Interactive Gates

- [x] **TRAP-01**: `--prd <file>` flag for scope-inquiry (skip scoping, use file as locked context) and `--batch N` flag (group N questions per turn)
- [x] **TRAP-02**: Review type mismatch interactive gate — when plan-checker detects rigor below review type, offer "Downgrade review type" / "Add rigor" / "Override"
- [x] **TRAP-03**: Saturation interactive gate in Tier 0 verification — offer "Evidence is sufficient" / "Continue investigating" / "Add inquiry"
- [ ] **TRAP-04**: Synthesis scope interactive gate before `/grd:synthesize` — offer "Full synthesis (all 4 activities)" / "Themes + argument only" / "Skip synthesis"
- [x] **TRAP-05**: Review type downgrade via `/grd:settings` mid-study — rigor requirements relax, no work lost

### Completion

- [ ] **COMP-01**: `/grd:complete-study` includes deliverable assembly — compile synthesis into the target format specified in PROJECT.md

### Testing

- [x] **TEST-01**: All existing 164+ tests continue to pass after all changes
- [x] **TEST-02**: New tests cover namespace migration (zero residual references)
- [x] **TEST-03**: New tests cover review type enforcement in plan-checker
- [x] **TEST-04**: New tests cover config schema with defaults and smart defaults cascade
- [ ] **TEST-05**: New tests cover synthesis stage workflow
- [x] **TEST-06**: New tests cover researcher tier template selection and adaptive output

## Future Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### Bibliometrics

- **BIB-01**: Citation network analysis via OpenAlex/Semantic Scholar integration
- **BIB-02**: Co-citation clustering and intellectual lineage visualization

### PRISMA

- **PRISMA-01**: Automated PRISMA 2020 flow diagram generation from SOURCE-LOG.md data
- **PRISMA-02**: Study-level screening/inclusion/exclusion count tracking

### Source Classification

- **CLASS-01**: Practitioner-academic source type distinction with different appraisal criteria

## Out of Scope

| Feature | Reason |
|---------|--------|
| Automated source quality scoring | Quality assessment requires human judgment; auto-scoring produces false confidence |
| Automatic era classification by date | Era is intellectual positioning, not chronology; a 2020 paper can be foundational |
| Per-field granular epistemological enforcement | Epistemology is a framing lens, not enforceable rules; over-operationalizing produces rigidity |
| Real-time collaboration | Single-user research tool (same as v1.0/v1.1) |
| Mobile/web UI | CLI only (same as v1.0/v1.1) |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SYNC-01 | Phase 15 | Complete |
| SYNC-02 | Phase 15 | Complete |
| SYNC-03 | Phase 15 | Complete |
| SYNC-04 | Phase 15 | Complete |
| SYNC-05 | Phase 15 | Complete |
| NS-01 | Phase 17 | Complete |
| NS-02 | Phase 17 | Complete |
| NS-03 | Phase 17 | Complete |
| NS-04 | Phase 17 | Complete |
| NS-05 | Phase 17 | Complete |
| NS-06 | Phase 17 | Complete |
| CFG-01 | Phase 16 | Complete |
| CFG-02 | Phase 16 | Complete |
| CFG-03 | Phase 16 | Complete |
| CFG-04 | Phase 16 | Complete |
| CFG-05 | Phase 16 | Complete |
| CFG-06 | Phase 16 | Complete |
| CFG-07 | Phase 16 | Complete |
| FORM-01 | Phase 18 | Complete |
| FORM-02 | Phase 18 | Complete |
| FORM-03 | Phase 18 | Complete |
| FORM-04 | Phase 18 | Complete |
| FORM-05 | Phase 18 | Complete |
| FORM-06 | Phase 18 | Complete |
| NOTE-01 | Phase 18 | Complete |
| NOTE-02 | Phase 18 | Complete |
| NOTE-03 | Phase 18 | Complete |
| PLAN-01 | Phase 19 | Complete |
| PLAN-02 | Phase 19 | Complete |
| VER-01 | Phase 20 | Complete |
| VER-02 | Phase 20 | Complete |
| VER-03 | Phase 20 | Complete |
| SYN-01 | Phase 22 | Pending |
| SYN-02 | Phase 22 | Pending |
| SYN-03 | Phase 22 | Pending |
| SYN-04 | Phase 22 | Pending |
| SYN-05 | Phase 22 | Pending |
| SYN-06 | Phase 22 | Pending |
| SYN-07 | Phase 22 | Pending |
| SYN-08 | Phase 22 | Pending |
| TRAP-01 | Phase 18 | Complete |
| TRAP-02 | Phase 19 | Complete |
| TRAP-03 | Phase 20 | Complete |
| TRAP-04 | Phase 22 | Pending |
| TRAP-05 | Phase 16 | Complete |
| COMP-01 | Phase 22 | Pending |
| TIER-01 | Phase 21 | Pending |
| TIER-02 | Phase 21 | Complete |
| TIER-03 | Phase 21 | Pending |
| TIER-04 | Phase 21 | Pending |
| TEST-01 | Phase 15 | Complete |
| TEST-02 | Phase 17 | Complete |
| TEST-03 | Phase 19 | Complete |
| TEST-04 | Phase 16 | Complete |
| TEST-05 | Phase 22 | Pending |
| TEST-06 | Phase 21 | Complete |

**Coverage:**
- v1.2 requirements: 55 total
- Mapped to phases: 55
- Unmapped: 0

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after spec audit gap closure (11 requirements added)*
