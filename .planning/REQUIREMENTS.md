# Requirements: GRD v1.2 Research Reorientation

**Defined:** 2026-03-17
**Core Value:** Every research finding is self-contained and auditable — the note plus its actual source files, never just links

## v1.2 Requirements

Requirements for the Research Reorientation milestone. Each maps to roadmap phases.

### Upstream Sync

- [ ] **SYNC-01**: All core CJS modules synced with GSD v1.25.1 while preserving research-specific modifications
- [ ] **SYNC-02**: All agent prompts synced with GSD v1.25.1 while preserving research adaptations
- [ ] **SYNC-03**: All workflow and command files synced with GSD v1.25.1 while preserving research adaptations
- [ ] **SYNC-04**: All templates synced with GSD v1.25.1 while preserving research adaptations
- [ ] **SYNC-05**: VERSION file updated to 1.25.1 and all 164+ tests pass on new baseline

### Namespace & Identity

- [ ] **NS-01**: All `/gsd-r:` command references renamed to `/grd:` across all files
- [ ] **NS-02**: Command vocabulary renamed to research-native terms (execute-phase → conduct-inquiry, discuss-phase → scope-inquiry, plan-phase → plan-inquiry, verify-work → verify-inquiry, new-project → new-research, complete-milestone → complete-study, etc.)
- [ ] **NS-03**: `gsd-r-tools.cjs` renamed to `grd-tools.cjs` with all internal and external references updated
- [ ] **NS-04**: `get-shit-done-r/` directory renamed to `grd/` with all path references updated
- [ ] **NS-05**: Agent names in model-profiles.cjs renamed from `gsd-r-*` to `grd-*`
- [ ] **NS-06**: Zero residual `gsd-r` references in any user-facing output (verified by automated scan)

### Config & Scoping

- [ ] **CFG-01**: `researcher_tier` field in config.json (guided/standard/expert) with selection during `/grd:new-research`
- [ ] **CFG-02**: `review_type` field in config.json (systematic/scoping/integrative/critical/narrative) with selection during `/grd:new-research`
- [ ] **CFG-03**: `epistemological_stance` field in config.json (positivist/constructivist/pragmatist/critical) with pragmatist default if skipped
- [ ] **CFG-04**: Smart defaults cascade — selecting a review type auto-configures critical_appraisal, temporal_positioning, synthesis, and plan_check rigor per the Smart Defaults table
- [ ] **CFG-05**: `configWithDefaults()` function ensuring existing projects get correct defaults for all new fields

### Research Formulation

- [ ] **FORM-01**: `/grd:new-research` scoping includes researcher tier, review type, epistemological positioning, and standard topic/significance/audience questions
- [ ] **FORM-02**: 4 parallel researchers renamed and rechartered (Methodological Landscape, Prior Findings & Key Themes, Theoretical Framework Survey, Limitations Critiques & Debates)
- [ ] **FORM-03**: PROJECT.md serves as research prospectus with problem statement, significance, epistemological stance, review type, researcher tier, research questions, and constraints

### Research Notes

- [ ] **NOTE-01**: Research note template includes Evidence Quality section with depth scaled by review type (systematic=full CASP/GRADE, scoping=charting, integrative/critical=proportional, narrative=optional)
- [ ] **NOTE-02**: Research note frontmatter includes `era` field (foundational/developmental/contemporary/emerging) for temporal positioning, skippable via config
- [ ] **NOTE-03**: Research note frontmatter updated with `review_type`, `inquiry`, `era`, and `status` fields

### Plan-Checker

- [ ] **PLAN-01**: Plan-checker validates against review type requirements (7 checks: source budget, no duplication, primary sources, systematic search strategy, multi-disciplinary perspectives, inclusion/exclusion criteria, diverse methodologies)
- [ ] **PLAN-02**: Plan-checker uses graduated enforcement — advisory warnings in early investigation phases, blocking errors in later phases

### Verification

- [ ] **VER-01**: Tier 0 sufficiency verification checks whether enough evidence has been gathered for the selected review type
- [ ] **VER-02**: Sufficiency criteria scale by review type (systematic=exhaustive, scoping=representative, narrative=adequate coverage)
- [ ] **VER-03**: Three-tier verification pipeline: Tier 0 (sufficiency) → Tier 1 (goal-backward) → Tier 2 (source audit), with `--skip-tier0` flag

### Synthesis

- [ ] **SYN-01**: `/grd:synthesize` workflow exists and reuses execute-phase machinery
- [ ] **SYN-02**: Thematic synthesis agent produces THEMES.md mapping patterns and themes across all verified notes
- [ ] **SYN-03**: Theoretical integration agent produces FRAMEWORK.md testing evidence against theoretical framework from Stage 1
- [ ] **SYN-04**: Gap analysis agent produces GAPS.md with typed gaps (Muller-Bloch & Kranz taxonomy) and problematization
- [ ] **SYN-05**: Argument construction agent produces Executive Summary assembling synthesis into coherent scholarly argument
- [ ] **SYN-06**: Synthesis respects dependency ordering: 6a (themes) before 6b/6c (framework/gaps run in parallel), all before 6d (argument)
- [ ] **SYN-07**: Synthesis skippable via `config.workflow.synthesis: false` and individual activities via `--skip-themes`, `--skip-framework`, `--skip-gaps` flags

### Adaptive Communication

- [ ] **TIER-01**: All agent prompts include researcher tier context and adapt vocabulary, explanations, and information density accordingly
- [ ] **TIER-02**: All templates adapt by tier (Guided=inline guidance comments, Standard=brief descriptions, Expert=headers only)
- [ ] **TIER-03**: Verification feedback adapts by tier (Guided=explains what failed and why, Standard=states failure with standard, Expert=terse)
- [ ] **TIER-04**: Error messages and next-action routing adapt by tier (Guided=suggests next steps and explains, Standard=states requirement and rationale, Expert=states requirement only)

### Testing

- [ ] **TEST-01**: All existing 164+ tests continue to pass after all changes
- [ ] **TEST-02**: New tests cover namespace migration (zero residual references)
- [ ] **TEST-03**: New tests cover review type enforcement in plan-checker
- [ ] **TEST-04**: New tests cover config schema with defaults and smart defaults cascade
- [ ] **TEST-05**: New tests cover synthesis stage workflow
- [ ] **TEST-06**: New tests cover researcher tier template selection and adaptive output

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
| SYNC-01 | — | Pending |
| SYNC-02 | — | Pending |
| SYNC-03 | — | Pending |
| SYNC-04 | — | Pending |
| SYNC-05 | — | Pending |
| NS-01 | — | Pending |
| NS-02 | — | Pending |
| NS-03 | — | Pending |
| NS-04 | — | Pending |
| NS-05 | — | Pending |
| NS-06 | — | Pending |
| CFG-01 | — | Pending |
| CFG-02 | — | Pending |
| CFG-03 | — | Pending |
| CFG-04 | — | Pending |
| CFG-05 | — | Pending |
| FORM-01 | — | Pending |
| FORM-02 | — | Pending |
| FORM-03 | — | Pending |
| NOTE-01 | — | Pending |
| NOTE-02 | — | Pending |
| NOTE-03 | — | Pending |
| PLAN-01 | — | Pending |
| PLAN-02 | — | Pending |
| VER-01 | — | Pending |
| VER-02 | — | Pending |
| VER-03 | — | Pending |
| SYN-01 | — | Pending |
| SYN-02 | — | Pending |
| SYN-03 | — | Pending |
| SYN-04 | — | Pending |
| SYN-05 | — | Pending |
| SYN-06 | — | Pending |
| SYN-07 | — | Pending |
| TIER-01 | — | Pending |
| TIER-02 | — | Pending |
| TIER-03 | — | Pending |
| TIER-04 | — | Pending |
| TEST-01 | — | Pending |
| TEST-02 | — | Pending |
| TEST-03 | — | Pending |
| TEST-04 | — | Pending |
| TEST-05 | — | Pending |
| TEST-06 | — | Pending |

**Coverage:**
- v1.2 requirements: 44 total
- Mapped to phases: 0
- Unmapped: 44 ⚠️

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after initial definition*
