# Phase 18: Research Formulation and Notes - Research

**Researched:** 2026-03-18
**Domain:** Template reframing, workflow modification, agent recharter (markdown templates + Node.js CJS)
**Confidence:** HIGH

## Summary

Phase 18 transforms the research workflow vocabulary from project creation through note writing. This is predominantly a template-and-prompt editing phase -- the infrastructure (config schema, init propagation, namespace) was completed in Phases 16 and 17. The work involves: (1) replacing the PROJECT.md template with a research prospectus structure, (2) reframing BOOTSTRAP.md/REQUIREMENTS.md/ROADMAP.md templates to scholarly vocabulary, (3) rechartering the 4 parallel researchers with new names, scholarly missions, and output file names, (4) updating the new-research workflow to include scoping questions that consume Phase 16's config infrastructure, (5) adding Evidence Quality section and new frontmatter fields to the research note template, and (6) implementing --prd and --batch flags for scope-inquiry.

The technical risk is low -- the changes are primarily markdown template edits and prompt rewrites with a few workflow modifications. The primary complexity is in coordinating the rename of researcher output files (LANDSCAPE.md -> METHODOLOGICAL-LANDSCAPE.md etc.) with downstream consumers (bootstrap agent, roadmapper agent) that read those files by name.

**Primary recommendation:** Organize work into 4-5 plans: (1) PROJECT.md prospectus template + new-research scoping questions, (2) researcher recharter with new output file names, (3) BOOTSTRAP/REQUIREMENTS/ROADMAP template reframing, (4) research note template updates (Evidence Quality + frontmatter), (5) --prd/--batch flags for scope-inquiry + tests.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- PROJECT.md as Research Prospectus: Replace template structure entirely with new sections: Problem Statement, Significance, Epistemological Stance, Review Type, Researcher Tier, Research Questions, Methodological Decisions, Constraints
- Reframe questioning flow to scholarly terms: "What is your research problem?", "Why does this matter?", "Who is your target audience?", "What are your research questions?"
- Config scoping questions (tier/type/epistemology) come before deep questioning -- per Phase 16 CONTEXT.md: "Tier first so language adapts for subsequent questions"
- Keep Methodological Decisions table (renamed from "Key Decisions")
- Evidence Quality placement: between Analysis and Implications
- Always present, depth varies by review type: systematic=full CASP/GRADE table, scoping=charting table, integrative/critical=proportional prose, narrative=brief strengths/limitations note
- Table for systematic/scoping, prose for others
- Epistemological influence via agent prompt guidance (template stays same; agent fills differently based on stance)
- Note status lifecycle: draft / reviewed / verified
- era field always in frontmatter, default to null when temporal_positioning is 'optional'
- inquiry field uses phase number only (e.g., inquiry: 3)
- New fields: review_type, inquiry, era, status
- Rename output files to match scholarly names: STACK.md -> METHODOLOGICAL-LANDSCAPE.md, FEATURES.md -> PRIOR-FINDINGS.md, ARCHITECTURE.md -> THEORETICAL-FRAMEWORK.md, PITFALLS.md -> LIMITATIONS-DEBATES.md
- Copy spec descriptions verbatim into agent prompts including citations
- New output structure per mission (each researcher's output structure matches scholarly function)
- BOOTSTRAP.md: title becomes "State-of-the-Field Assessment", headers: Established Knowledge, Contested Claims, Knowledge Gaps
- REQUIREMENTS.md: title becomes "Research Objectives / Specific Aims", keep REQ-ID format
- ROADMAP.md: title becomes "Research Design / Study Plan", rename 'Phase' to 'Inquiry' throughout
- --prd flag for scope-inquiry: research-adapted, parses research brief/protocol document
- --batch N flag: ensure works with reframed vocabulary

### Claude's Discretion
- Exact template markdown for each reframed document
- How researcher output structures are consumed by downstream BOOTSTRAP.md and ROADMAP.md creation
- How --prd research adaptation differs from the upstream plan-phase --prd implementation
- Test structure and assertion patterns

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FORM-01 | `/grd:new-research` scoping includes researcher tier, review type, epistemological positioning, and standard questions | New-research workflow modification: add scoping questions consuming config.cjs SMART_DEFAULTS; init.cjs already propagates config values |
| FORM-02 | 4 parallel researchers renamed and rechartered | Agent prompt rewrites + output file renames; downstream consumer updates in new-research.md |
| FORM-03 | PROJECT.md serves as research prospectus | Template replacement: grd/templates/project.md |
| FORM-04 | BOOTSTRAP.md reframed as "state-of-the-field assessment" | Template modification: grd/templates/bootstrap.md |
| FORM-05 | REQUIREMENTS.md uses "research objectives / specific aims" vocabulary | Template modification: grd/templates/requirements.md |
| FORM-06 | ROADMAP.md reframed as "research design / study plan" | Template modification: grd/templates/roadmap.md |
| NOTE-01 | Research note Evidence Quality section scaled by review type and epistemological stance | Template extension: grd/templates/research-note.md; agent prompt guidance for stance |
| NOTE-02 | Research note frontmatter includes era field, skippable via config | Template extension + frontmatter schema update |
| NOTE-03 | Research note frontmatter updated with review_type, inquiry, era, status fields | Template extension: 4 new YAML fields |
| TRAP-01 | --prd and --batch flags for scope-inquiry | Workflow modification: grd/workflows/scope-inquiry.md; --batch already partially exists |
</phase_requirements>

## Architecture Patterns

### Files to Modify (Complete Inventory)

```
grd/
├── templates/
│   ├── project.md                    # REPLACE: research prospectus structure (FORM-03)
│   ├── bootstrap.md                  # MODIFY: scholarly vocabulary (FORM-04)
│   ├── requirements.md               # MODIFY: scholarly vocabulary (FORM-05)
│   ├── roadmap.md                    # MODIFY: scholarly vocabulary (FORM-06)
│   ├── research-note.md              # EXTEND: Evidence Quality + frontmatter (NOTE-01/02/03)
│   └── research-project/
│       ├── LANDSCAPE.md              # RENAME+REWRITE: -> METHODOLOGICAL-LANDSCAPE template
│       ├── QUESTIONS.md              # RENAME+REWRITE: -> PRIOR-FINDINGS template
│       ├── FRAMEWORKS.md             # RENAME+REWRITE: -> THEORETICAL-FRAMEWORK template
│       ├── DEBATES.md                # RENAME+REWRITE: -> LIMITATIONS-DEBATES template
│       └── SUMMARY.md               # MAY NEED UPDATE: reads renamed files
├── workflows/
│   ├── new-research.md               # MODIFY: scoping questions + researcher recharter (FORM-01/02)
│   └── scope-inquiry.md              # MODIFY: --prd flag implementation (TRAP-01)
└── bin/lib/
    └── (no changes needed)           # Phase 16 config infrastructure already complete
```

### Pattern 1: Template Modification (FORM-03 through FORM-06)

**What:** Replace or modify markdown templates with scholarly vocabulary while preserving structural patterns the workflow expects.

**Key constraint:** Templates are consumed by agent prompts in workflows. The structure (sections, headers, frontmatter keys) must match what the consuming agent looks for. The vocabulary changes but the template-consumption pattern stays identical.

**Example -- BOOTSTRAP.md reframe:**
```markdown
# Current structure (to change):
## Already Established (do not re-research)
## Partially Established (extend, don't restart)
## Not Yet Researched

# New structure (scholarly vocabulary):
## Established Knowledge
## Contested Claims
## Knowledge Gaps
```

The guidelines and evolution sections of each template should also be updated to use research vocabulary.

### Pattern 2: Researcher Recharter (FORM-02)

**What:** Rename 4 parallel researcher agents and their output files, update prompts with scholarly missions from the spec.

**Critical coordination points:**
1. Output file names change in `grd/templates/research-project/` directory
2. The `new-research.md` workflow spawns these agents and references output paths -- paths must be updated
3. The synthesizer agent (`SUMMARY.md` creator) reads all 4 outputs -- its `<files_to_read>` must reference new names
4. The bootstrap agent and roadmapper agent may reference research output -- verify and update

**Current -> New file mapping:**
| Current Template | Current Output | New Template | New Output |
|-----------------|----------------|--------------|------------|
| LANDSCAPE.md | .planning/research/LANDSCAPE.md | METHODOLOGICAL-LANDSCAPE.md | .planning/research/METHODOLOGICAL-LANDSCAPE.md |
| QUESTIONS.md | .planning/research/QUESTIONS.md | PRIOR-FINDINGS.md | .planning/research/PRIOR-FINDINGS.md |
| FRAMEWORKS.md | .planning/research/FRAMEWORKS.md | THEORETICAL-FRAMEWORK.md | .planning/research/THEORETICAL-FRAMEWORK.md |
| DEBATES.md | .planning/research/DEBATES.md | LIMITATIONS-DEBATES.md | .planning/research/LIMITATIONS-DEBATES.md |

**Agent type:** All 4 use `grd-project-researcher` subagent_type. The prompts in new-research.md are inline (not separate agent files). The recharter changes the inline prompts, not a separate file.

### Pattern 3: New-Research Scoping Questions (FORM-01)

**What:** Add 3 scoping questions to the new-research workflow BEFORE the deep questioning phase.

**Integration with Phase 16 infrastructure:**
- `config.cjs:SMART_DEFAULTS` provides the lookup table for review type defaults
- `config.cjs:configWithDefaults()` handles backward compatibility
- `init.cjs:cmdInitNewProject()` already propagates `researcher_tier`, `review_type`, `epistemological_stance`
- The scoping questions write to config.json via `grd-tools.cjs config-set`

**Flow change in new-research.md:**
```
Current:  Setup -> Brownfield -> Deep Questioning -> PROJECT.md -> Config -> Research -> Requirements -> Roadmap
New:      Setup -> Brownfield -> Scoping Questions (tier/type/epistemology) -> Deep Questioning (adapted) -> PROJECT.md -> Config -> Research -> Requirements -> Roadmap
```

The scoping questions should use `AskUserQuestion` with options matching the spec's descriptions. Epistemological stance should be skippable (defaults to pragmatist). Tier selection determines the language used in subsequent questioning.

### Pattern 4: Research Note Template Extension (NOTE-01/02/03)

**What:** Add Evidence Quality section and new frontmatter fields to research-note.md.

**Template structure after changes:**
```markdown
---
project: [Study Name]
domain: [domain]
inquiry: [phase number]
era: foundational | developmental | contemporary | emerging | null
status: draft | reviewed | verified
review_type: [from config]
date: YYYY-MM-DD
sources: 0
---

# [Title]

## Key Findings
## Analysis
## Evidence Quality       <-- NEW: between Analysis and Implications
## Implications for [Study]
## Open Questions
## References
```

**Evidence Quality scaling -- template guidance:**
The template itself includes ALL formats as guidance. The executing agent selects which format to use based on review_type from config:
- systematic/scoping: table format (Source | Design | Sample | Quality | Limitations)
- integrative/critical: proportional prose ("This source contributes X but is limited by Y")
- narrative: brief strengths/limitations note

**Epistemological influence is NOT in the template** -- it's in the executor agent prompt guidance. The template stays the same; the agent adapts what it writes based on epistemological_stance from config.

### Pattern 5: --prd Flag for Scope-Inquiry (TRAP-01)

**What:** Implement `--prd <file>` flag that parses a research brief/protocol document and maps it to inquiry-specific CONTEXT.md sections.

**Current state:** The scope-inquiry workflow (formerly discuss-phase) already mentions `--prd` in its express path section but only as a redirect to plan-inquiry. The actual implementation needs to:
1. Parse $ARGUMENTS for `--prd <filepath>`
2. Read the provided file
3. Extract research-relevant sections: inclusion criteria, search boundaries, disciplinary scope, research questions
4. Generate a CONTEXT.md from the parsed content WITHOUT user interaction
5. Commit and proceed

**--batch already partially exists:** The scope-inquiry workflow already has batch mode support (lines 396-406). Verify it works with renamed vocabulary (inquiry instead of phase, etc.).

### Anti-Patterns to Avoid

- **Partial rename:** Renaming output files but not updating all consumers. Use grep to find every reference to old file names (LANDSCAPE.md, QUESTIONS.md, FRAMEWORKS.md, DEBATES.md) across the entire codebase.
- **Breaking existing projects:** Existing projects may have .planning/research/ with old file names. The rename affects TEMPLATES only -- the actual output path is determined by the workflow prompt, not the template file name.
- **Template-prompt mismatch:** If the template has an Evidence Quality section but the executor agent prompt doesn't know about it, the section will be empty. The executor agent prompt (in conduct-inquiry.md) needs to be aware of the new section.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Config reading for scoping questions | Custom config parser | `grd-tools.cjs config-set` / `config-get` | Already handles nested keys, validation, type coercion |
| Smart defaults for review type | Manual switch statement in workflow | `config.cjs:SMART_DEFAULTS` lookup table | Single source of truth, already tested |
| Backward compat for existing configs | Manual field checking | `config.cjs:configWithDefaults()` | Deep-merge with smart defaults, handles missing fields |

## Common Pitfalls

### Pitfall 1: Researcher Output File Name Propagation
**What goes wrong:** Renaming template files but missing references in workflow prompts, synthesizer task, or downstream consumers.
**Why it happens:** The file names appear in multiple places: template directory names, inline prompts in new-research.md, files_to_read blocks in synthesizer task, and possibly in bootstrap/roadmapper prompts.
**How to avoid:** After renaming, grep the entire codebase for each old name. The key files to check: new-research.md (4 Task prompts + synthesizer task), any agent that reads .planning/research/*.md.
**Warning signs:** Synthesizer errors, BOOTSTRAP.md missing content from researchers.

### Pitfall 2: Scoping Question Ordering
**What goes wrong:** Deep questioning starts before tier/type/epistemology are set, so the questioning language can't adapt.
**Why it happens:** The current flow has config questions AFTER deep questioning in the interactive path.
**How to avoid:** Insert scoping questions in Step 3 (before deep questioning), write to config.json immediately, then read config values to adapt questioning language.
**Warning signs:** Questioning uses generic language regardless of tier selection.

### Pitfall 3: Evidence Quality Section Conditional Rendering
**What goes wrong:** Evidence Quality section always renders as a table even for narrative reviews, or is missing entirely.
**Why it happens:** The template provides one format; the agent needs to know which format to use.
**How to avoid:** Template should include ALL formats as guidance (wrapped in conditional comments). The executor agent reads review_type from init JSON and selects the appropriate format.
**Warning signs:** Narrative review notes with full CASP tables, or systematic review notes with one-line quality notes.

### Pitfall 4: --prd Flag Parsing Ambiguity
**What goes wrong:** --prd flag value not correctly parsed when mixed with other arguments.
**Why it happens:** Argument parsing in workflow prompts is string-based, not a proper arg parser.
**How to avoid:** Use the same argument parsing pattern used elsewhere in the codebase (likely regex on $ARGUMENTS).
**Warning signs:** --prd path not detected, or path includes subsequent flags.

### Pitfall 5: Inquiry vs Phase Terminology in ROADMAP Template
**What goes wrong:** Partial rename -- some references say "Phase" and others say "Inquiry" in the same template.
**Why it happens:** ROADMAP.md template is large with many references to "Phase" in headings, examples, guidelines, and evolution sections.
**How to avoid:** Systematic find-and-replace within the template file. The key distinction: within the template content itself, "Phase" -> "Inquiry". But the template's structural markers (Phase Numbering, Phase Details) might need careful judgment -- they serve GSD's internal phase model.
**Warning signs:** Mixed terminology in generated roadmaps.

## Code Examples

### Scoping Questions in new-research.md

The scoping questions should follow this pattern, inserted before deep questioning:

```markdown
## 3a. Research Scoping

**Display stage banner:**
```
GRD ► RESEARCH SCOPING
```

**Round 1 -- Research Configuration (3 questions):**

AskUserQuestion([
  {
    header: "Experience",
    question: "What is your research background?",
    multiSelect: false,
    options: [
      { label: "Guided", description: "Curious non-academic, undergrad, early graduate — plain language, explains why each step matters" },
      { label: "Standard", description: "Mid-career graduate, doctoral candidate — academic vocabulary with brief context" },
      { label: "Expert", description: "Post-doc, faculty, established researcher — precise terminology, maximum efficiency" }
    ]
  },
  {
    header: "Review Type",
    question: "What kind of review is this?",
    multiSelect: false,
    options: [
      { label: "Systematic", description: "PRISMA 2020 protocol, pre-defined search strategy, critical appraisal of every study" },
      { label: "Scoping", description: "Arksey & O'Malley framework, maps extent of evidence, charting rather than appraising" },
      { label: "Integrative", description: "Whittemore & Knafl, combines diverse methodologies, five-stage process" },
      { label: "Critical", description: "Evaluates quality and contribution of literature, identifies gaps and new directions" },
      { label: "Narrative", description: "Broadest, most flexible, suitable for exploring wide topics" }
    ]
  },
  {
    header: "Epistemology",
    question: "What counts as valid evidence for your study? (Skip to default to Pragmatist)",
    multiSelect: false,
    options: [
      { label: "Positivist", description: "Objective reality, testable hypotheses, quantitative evidence prioritized" },
      { label: "Constructivist", description: "Multiple realities, meaning is co-constructed, qualitative evidence valued" },
      { label: "Pragmatist (default)", description: "Whatever works — mixed methods, problem-centered" },
      { label: "Critical", description: "Knowledge shaped by power structures, research aims at transformation" }
    ]
  }
])

**Write to config immediately:**
```bash
node "grd-tools.cjs" config-set researcher_tier "[selected]"
node "grd-tools.cjs" config-set review_type "[selected]"
node "grd-tools.cjs" config-set epistemological_stance "[selected]"
```

**Apply smart defaults for selected review type:**
Smart defaults cascade automatically via configWithDefaults() when init.cjs reads config.
```

### Research Note Frontmatter (Updated)

```yaml
---
project: [Study Name]
domain: [domain]
inquiry: 3
era: null
status: draft
review_type: systematic
date: 2026-03-18
sources: 0
---
```

### Evidence Quality Section -- Systematic/Scoping (Table Format)

```markdown
## Evidence Quality

| Source | Design | Sample | Quality | Limitations |
|---|---|---|---|---|
| Schwartz (1992) | Cross-cultural survey | 20 countries, N=25,863 | High -- validated across populations | Self-report; WEIRD-skewed initial sample |
| Gagne & Deci (2005) | Theoretical integration | N/A (conceptual) | High -- seminal SDT-workplace integration | Limited empirical validation at time of publication |
```

### Evidence Quality Section -- Integrative/Critical (Prose Format)

```markdown
## Evidence Quality

Schwartz (1992) provides high-quality cross-cultural evidence (20 countries, N=25,863) with validated instruments, though the initial sample was WEIRD-skewed. This source is central to the analysis.

Gagne & Deci (2005) offers a seminal theoretical integration of SDT into workplace contexts. As a conceptual work, it lacks direct empirical validation but has been extensively tested in subsequent research.
```

### Evidence Quality Section -- Narrative (Brief Format)

```markdown
## Evidence Quality

Sources consulted for this note are primarily theoretical works with limited empirical validation. Schwartz (1992) offers the strongest empirical foundation; remaining sources are conceptual contributions.
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in `node:test` with `node:assert/strict` |
| Config file | `scripts/run-tests.cjs` (test runner) |
| Quick run command | `node --test test/config-schema.test.cjs` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORM-01 | Scoping questions write tier/type/stance to config | unit | `node --test test/config-schema.test.cjs -x` | Partial (config schema tested, scoping flow not) |
| FORM-02 | Researcher output files renamed, prompts updated | unit | `node --test test/researcher-recharter.test.cjs -x` | Wave 0 |
| FORM-03 | PROJECT.md template has prospectus structure | unit | `node --test test/template-vocabulary.test.cjs -x` | Wave 0 |
| FORM-04 | BOOTSTRAP.md template uses scholarly vocabulary | unit | `node --test test/template-vocabulary.test.cjs -x` | Wave 0 |
| FORM-05 | REQUIREMENTS.md template uses scholarly vocabulary | unit | `node --test test/template-vocabulary.test.cjs -x` | Wave 0 |
| FORM-06 | ROADMAP.md template uses scholarly vocabulary | unit | `node --test test/template-vocabulary.test.cjs -x` | Wave 0 |
| NOTE-01 | Evidence Quality section in research note template | unit | `node --test test/research-note-template.test.cjs -x` | Wave 0 |
| NOTE-02 | era field in frontmatter | unit | `node --test test/research-note-template.test.cjs -x` | Wave 0 |
| NOTE-03 | review_type, inquiry, era, status in frontmatter | unit | `node --test test/research-note-template.test.cjs -x` | Wave 0 |
| TRAP-01 | --prd and --batch flags work | unit | `node --test test/scope-inquiry-flags.test.cjs -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `node --test test/config-schema.test.cjs`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/grd:verify-inquiry`

### Wave 0 Gaps
- [ ] `test/template-vocabulary.test.cjs` -- covers FORM-03 through FORM-06 (verify template sections contain expected scholarly vocabulary)
- [ ] `test/research-note-template.test.cjs` -- covers NOTE-01 through NOTE-03 (verify frontmatter fields and Evidence Quality section presence)
- [ ] `test/researcher-recharter.test.cjs` -- covers FORM-02 (verify new output file names exist in templates directory, verify new-research.md references new names)
- [ ] `test/scope-inquiry-flags.test.cjs` -- covers TRAP-01 (verify --prd flag parsing, --batch flag parsing)
- [ ] Existing test suite must continue passing: `npm test`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Generic PM vocabulary (project, phase, requirement) | Research-native vocabulary (study, inquiry, research objective) | Phase 17 (namespace) | User-facing commands already renamed; templates and prompts are the remaining surface |
| No config scoping | Config infrastructure for tier/type/stance | Phase 16 | SMART_DEFAULTS, configWithDefaults(), init propagation all ready to consume |
| 4 PM-oriented researchers (Stack, Features, Architecture, Pitfalls) | 4 scholarly researchers (Methodological Landscape, Prior Findings, Theoretical Framework, Limitations & Debates) | This phase | Changes agent prompts and output structure |

## Open Questions

1. **Conduct-inquiry executor agent prompt -- where is it?**
   - What we know: The executor agent needs to know about the Evidence Quality section to fill it in notes. The executor prompt lives in conduct-inquiry.md workflow.
   - What's unclear: Whether the executor prompt already has any Evidence Quality awareness or if this is entirely new.
   - Recommendation: Read conduct-inquiry.md during planning to verify; if executor is unaware, add Evidence Quality guidance to its prompt. This may spill into Phase 19/20 territory -- check scope boundary.

2. **SUMMARY.md template update scope**
   - What we know: SUMMARY.md synthesizes the 4 researcher outputs. When output file names change, the synthesizer prompt's files_to_read must update.
   - What's unclear: Whether the SUMMARY.md template itself needs vocabulary changes beyond the file references.
   - Recommendation: Update file references in synthesizer task prompt; evaluate if SUMMARY.md template needs scholarly vocabulary reframe.

3. **Downstream consumer discovery**
   - What we know: new-research.md is the primary consumer of researcher outputs. The roadmapper and bootstrap agents may also read research files.
   - What's unclear: Complete list of files that reference the old researcher output names.
   - Recommendation: During implementation, grep for LANDSCAPE.md, QUESTIONS.md, FRAMEWORKS.md, DEBATES.md across all files and update every reference.

## Sources

### Primary (HIGH confidence)
- `grd/templates/project.md` -- current template structure (read in full)
- `grd/templates/bootstrap.md` -- current template structure (read in full)
- `grd/templates/requirements.md` -- current template structure (read in full)
- `grd/templates/roadmap.md` -- current template structure (read in full)
- `grd/templates/research-note.md` -- current template structure (read in full)
- `grd/templates/research-project/LANDSCAPE.md` -- current researcher template (read in full)
- `grd/workflows/new-research.md` -- current new-research workflow (read in full, 1114 lines)
- `grd/workflows/scope-inquiry.md` -- current scope-inquiry workflow (read in full, 751 lines)
- `grd/bin/lib/config.cjs` -- SMART_DEFAULTS, configWithDefaults(), applySmartDefaults() (read in full)
- `grd/bin/lib/init.cjs` -- config propagation including researcher_tier/review_type/epistemological_stance (read in full)
- `grd/bin/lib/model-profiles.cjs` -- agent model mapping (read in full)
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` -- full spec (read in full)
- `.planning/phases/18-research-formulation-and-notes/18-CONTEXT.md` -- user decisions (read in full)

### Secondary (MEDIUM confidence)
- `test/config-schema.test.cjs` -- existing test patterns for config infrastructure

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no external dependencies, all changes are to project-internal files
- Architecture: HIGH -- file modification inventory verified by reading every file
- Pitfalls: HIGH -- identified from actual code reading, not speculation

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable -- internal project, no external dependency drift)
