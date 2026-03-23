# Requirements: GRD v1.3 Research-Native Purification

**Defined:** 2026-03-23
**Core Value:** Every research finding is self-contained and auditable -- the note plus its actual source files, never just links

## v1.3 Requirements

Requirements for the Research-Native Purification milestone. Reconceptualize every PM/application-development feature into its research equivalent.

### Command Reconceptualization

- [x] **CMD-01**: `/grd:ship` reconceptualized as research export — ship notes + sources to Obsidian vault, export manuscript, package deliverables
- [x] **CMD-02**: `/grd:add-tests` reconceptualized as add verification criteria — evidence checks, source coverage assertions
- [x] **CMD-03**: `/grd:pr-branch` reconceptualized as export clean research — package notes without .planning/ artifacts
- [x] **CMD-04**: `/grd:debug` reconceptualized as diagnose — investigate methodology gaps, source conflicts, analytical dead ends
- [x] **CMD-05**: `/grd:map-codebase` reconceptualized as map corpus / map literature — survey existing sources and knowledge landscape
- [x] **CMD-06**: `/grd:ui-phase` reconceptualized as presentation design — plan how findings will be presented
- [x] **CMD-07**: `/grd:ui-review` reconceptualized as output review — audit quality of research deliverables

### Workflow Reorientation

- [x] **WFL-01**: scope-inquiry.md examples replaced with research vocabulary (methodology choices, scope boundaries, theoretical emphasis — not UI features)
- [x] **WFL-02**: verify-inquiry.md description rewritten from "validate built features" to "validate research findings"
- [x] **WFL-03**: new-milestone.md research dimension labels reoriented (Stack→Landscape, Features→Questions, Architecture→Frameworks, Pitfalls→Debates)

### Agent Fixes

- [x] **AGT-01**: Fix "GSD" → "GRD" in grd-executor.md, grd-verifier.md, grd-plan-checker.md, grd-roadmapper.md
- [x] **AGT-02**: grd-verifier.md acknowledges research outputs alongside code ("verify findings" not just "verify codebase")
- [x] **AGT-03**: grd-executor.md acknowledges research outputs (notes, sources, synthesis documents)

### Template Updates

- [ ] **TPL-01**: Create research-task examples in phase-prompt.md (`<task type="research">` with sources, notes, findings structure)
- [ ] **TPL-02**: Create research-summary template variant with research frontmatter (sources_acquired, notes_produced, evidence_quality, domains_covered)
- [ ] **TPL-03**: summary.md template supports dual-purpose frontmatter (code OR research fields)

### Help & Organization

- [x] **HLP-01**: `/grd:help` reorganized with Research Workflow / Utility / Configuration sections (not PM-centric categories)
- [x] **HLP-02**: Each command in help shows its research-native purpose, not inherited PM description

## Future Requirements

### Source Pipeline Wiring (deferred from v1.2)

- **SRC-01**: Wire acquire.cjs, vault.cjs, and source-researcher into conduct-inquiry workflow
- **SRC-02**: README + docs/DESIGN.md rewrite with final-state naming

## Out of Scope

| Topic | Reason |
|-------|--------|
| New research features (bibliometrics, PRISMA diagrams) | Separate milestone — purification first |
| Upstream GSD sync | v1.28.0 sync complete in v1.2; no new upstream to merge |
| Breaking CLI API changes | This milestone changes descriptions and templates, not command signatures |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CMD-01 | Phase 31 | Complete |
| CMD-02 | Phase 30 | Complete |
| CMD-03 | Phase 31 | Complete |
| CMD-04 | Phase 30 | Complete |
| CMD-05 | Phase 30 | Complete |
| CMD-06 | Phase 31 | Complete |
| CMD-07 | Phase 31 | Complete |
| WFL-01 | Phase 28 | Complete |
| WFL-02 | Phase 28 | Complete |
| WFL-03 | Phase 28 | Complete |
| AGT-01 | Phase 28 | Complete |
| AGT-02 | Phase 28 | Complete |
| AGT-03 | Phase 28 | Complete |
| TPL-01 | Phase 29 | Pending |
| TPL-02 | Phase 29 | Pending |
| TPL-03 | Phase 29 | Pending |
| HLP-01 | Phase 32 | Complete |
| HLP-02 | Phase 32 | Complete |

**Coverage:**
- Primary requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after roadmap creation (traceability populated)*
