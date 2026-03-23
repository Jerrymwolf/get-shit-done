# Phase 29: Research Template Variants - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning
**Mode:** Infrastructure phase — discuss skipped (pure template file modifications)

<domain>
## Phase Boundary

Plan task templates and summary templates include research-specific structure so generated plans produce scholarly output. Target files: phase-prompt.md (task template) and summary.md template.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Success criteria are explicit file-content requirements:
- phase-prompt.md includes research-task examples with `<task type="research">` blocks showing sources, notes, and findings structure
- A research-summary template variant exists with frontmatter fields: sources_acquired, notes_produced, evidence_quality, domains_covered
- summary.md template detects project type and renders appropriate frontmatter (code fields for code projects, research fields for research projects)

</decisions>

<code_context>
## Existing Code Insights

### Target Files
- `grd/templates/phase-prompt.md` — task template used by planner agent
- `grd/templates/summary.md` — summary template used by executor agent

### Established Patterns
- Phase 28 reoriented agent prompts to acknowledge research outputs
- GRD already has research note templates with frontmatter (domain, sources, findings)
- Existing task types include `<task type="auto">` and `<task type="checkpoint">`

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
