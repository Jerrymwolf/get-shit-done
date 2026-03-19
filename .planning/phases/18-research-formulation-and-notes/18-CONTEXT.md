# Phase 18: Research Formulation and Notes - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform the research workflow vocabulary from project creation through note writing. Reframe PROJECT.md as a research prospectus, reframe BOOTSTRAP.md/REQUIREMENTS.md/ROADMAP.md templates to scholarly vocabulary, recharter the 4 parallel researchers with new names and missions, update the research note template with Evidence Quality section and new frontmatter fields, and implement --prd/--batch flags for scope-inquiry.

</domain>

<decisions>
## Implementation Decisions

### PROJECT.md as Research Prospectus
- **Replace template structure entirely** -- new sections: Problem Statement, Significance, Epistemological Stance, Review Type, Researcher Tier, Research Questions, Methodological Decisions, Constraints
- **Reframe questioning flow to scholarly terms** -- ask "What is your research problem?", "Why does this matter?", "Who is your target audience?", "What are your research questions?" The questioning itself speaks research language
- **Config scoping questions (tier/type/epistemology) come before deep questioning** -- per Phase 16 CONTEXT.md decision: "Tier first so language adapts for subsequent questions"
- **Keep Methodological Decisions table** -- renamed from "Key Decisions." Tracks choices like "excluded grey literature", "focused on post-2010 studies", etc.

### Evidence Quality in Research Notes
- **Placement: between Analysis and Implications** -- per spec
- **Always present, depth varies by review type** -- the section header is always there. Systematic=full CASP/GRADE table, scoping=charting table, integrative/critical=proportional prose, narrative=brief strengths/limitations note
- **Table for systematic/scoping, prose for others** -- systematic and scoping get the structured table (Source | Design | Sample | Quality | Limitations). Integrative/critical/narrative use prose: "This source contributes X but is limited by Y"
- **Epistemological influence via agent prompt guidance** -- the executor agent prompt includes the epistemological stance and instructions on how to weight evidence types. Template stays the same; the agent fills it differently based on stance
- **Note status lifecycle: draft / reviewed / verified** -- three stages matching the verification pipeline

### Research Note Frontmatter
- **era field always in frontmatter, default to null** -- when temporal_positioning is 'optional', era: null. Consistent schema across all notes
- **inquiry field uses phase number only** -- e.g., inquiry: 3. Simple, unambiguous. Name can be looked up from roadmap
- **New fields: review_type, inquiry, era, status** -- per NOTE-03. review_type comes from config, inquiry from the executing phase, era from user or null, status starts as 'draft'

### Researcher Recharter
- **Rename output files to match scholarly names** -- STACK.md → METHODOLOGICAL-LANDSCAPE.md, FEATURES.md → PRIOR-FINDINGS.md, ARCHITECTURE.md → THEORETICAL-FRAMEWORK.md, PITFALLS.md → LIMITATIONS-DEBATES.md
- **Copy spec descriptions verbatim into agent prompts** -- use the spec's scholarly function text as the core of each agent prompt, including citations (Braun & Clarke, 2006; CASP UK, 2024; etc.)
- **New output structure per mission** -- each researcher's output structure matches its scholarly function. Methodological Landscape outputs methods taxonomy, validated instruments, research design inventory. Prior Findings outputs thematic clusters, convergent findings, evidence strength. Etc.

### Template Vocabulary Reframing
- **BOOTSTRAP.md** -- title becomes "State-of-the-Field Assessment." Headers: Established Knowledge, Contested Claims, Knowledge Gaps
- **REQUIREMENTS.md** -- title becomes "Research Objectives / Specific Aims." **Keep REQ-ID format** (REQ-01, etc.) -- less disruption to existing plan-checker and verification tooling. Acceptance criteria become "what 'answered' means"
- **ROADMAP.md** -- title becomes "Research Design / Study Plan." **Rename 'Phase' to 'Inquiry' throughout** -- "### Inquiry 1: Foundational Works" instead of "### Phase 1: Foundational Works"

### Trap Door Flags (TRAP-01)
- **--prd flag for scope-inquiry** -- research-adapted: parses a research brief/protocol document and maps it to inquiry-specific CONTEXT.md sections (inclusion criteria, search boundaries, disciplinary scope). Not just generic PRD parsing
- **--batch N flag** -- already exists in upstream scope-inquiry workflow. Ensure it works with the reframed vocabulary

### Claude's Discretion
- Exact template markdown for each reframed document
- How researcher output structures are consumed by downstream BOOTSTRAP.md and ROADMAP.md creation
- How --prd research adaptation differs from the upstream plan-phase --prd implementation
- Test structure and assertion patterns

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Research Workflow Spec
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Stage 1 (lines 33-100) -- new-research flow, scoping questions, artifact table, researcher recharter table
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Stage 2 (lines 86-101) -- scope-inquiry scholarly activity, trap doors
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Stage 4 (lines 126-149) -- Evidence Quality section definition, scaling by review type

### Current Templates
- `grd/templates/project.md` -- current PROJECT.md template (to be replaced)
- `grd/templates/bootstrap.md` -- current BOOTSTRAP.md template (to be reframed)
- `grd/templates/requirements.md` -- current REQUIREMENTS.md template (to be reframed)
- `grd/templates/roadmap.md` -- current ROADMAP.md template (to be reframed)
- `grd/templates/research-note.md` -- current research note template (to be extended with Evidence Quality + new frontmatter)

### Current Workflows
- `grd/workflows/new-research.md` -- new-research workflow (to add scoping questions + reframe questioning)
- `grd/workflows/scope-inquiry.md` -- scope-inquiry workflow (formerly discuss-phase; needs --prd and --batch flags)

### Config Infrastructure (from Phase 16)
- `grd/bin/lib/config.cjs` -- SMART_DEFAULTS, configWithDefaults(), applySmartDefaults() (scoping questions consume these)
- `grd/bin/lib/init.cjs` -- config propagation (researcher_tier, review_type, epistemological_stance now available)

### Requirements
- `.planning/REQUIREMENTS.md` -- FORM-01 through FORM-06, NOTE-01 through NOTE-03, TRAP-01

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `config.cjs:SMART_DEFAULTS` -- lookup table for review type defaults (Phase 16)
- `config.cjs:configWithDefaults()` -- deep-merge for backward compat (Phase 16)
- `init.cjs` -- already propagates researcher_tier, review_type, epistemological_stance (Phase 16)
- `grd/workflows/new-research.md` -- current new-research flow with questioning phase
- `grd/templates/research-note.md` -- current note template with Key Findings, Analysis, Implications, Connections sections

### Established Patterns
- Templates use markdown with frontmatter YAML
- Agent prompts in `grd/agents/` or inline in workflows
- Researcher agents spawned in parallel via `grd-project-researcher` subagent_type
- Config values read via `init` JSON output, not direct file reads

### Integration Points
- `new-research.md` orchestrates questioning → research → requirements → roadmap
- `grd-project-researcher` agent type handles all 4 parallel researchers
- Research note template consumed by executor agents during conduct-inquiry
- BOOTSTRAP.md, REQUIREMENTS.md, ROADMAP.md templates consumed by new-research workflow

</code_context>

<specifics>
## Specific Ideas

- The 3 config scoping questions (tier/type/epistemology) are infrastructure only in Phase 16 -- this phase adds them to the actual new-research flow
- Researcher recharter is both prompt changes AND output file name changes -- ensure downstream consumers (bootstrap.md agent, roadmapper agent) read the new filenames
- Evidence Quality section is the most nuanced piece -- it needs to scale by BOTH review type AND epistemological stance, but stance is prompt guidance not template changes
- The --prd flag for scope-inquiry should parse research-specific sections (inclusion criteria, search boundaries) not just generic requirements

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 18-research-formulation-and-notes*
*Context gathered: 2026-03-18*
