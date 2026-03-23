# Phase 28: Agent and Workflow Reorientation - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning
**Mode:** Infrastructure phase — discuss skipped (pure file-content refactoring)

<domain>
## Phase Boundary

Agent prompts and workflow examples speak research language — no PM/feature vocabulary in user-facing guidance. Target files: 4 agent prompts (grd-executor.md, grd-verifier.md, grd-plan-checker.md, grd-roadmapper.md) and 3 workflow files (scope-inquiry.md, verify-inquiry.md, new-milestone.md).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Success criteria are explicit file-content requirements:
- Zero "GSD" references in the 4 agent files
- grd-executor.md describes research outputs (notes, sources, synthesis) as valid deliverables
- grd-verifier.md validates research findings and source completeness
- scope-inquiry.md examples use methodology/scope/theory vocabulary
- verify-inquiry.md describes research finding validation
- new-milestone.md dimensions: Landscape/Questions/Frameworks/Debates

</decisions>

<code_context>
## Existing Code Insights

### Target Files
- `agents/grd-executor.md` — 2 GSD references (description line, identity line)
- `agents/grd-verifier.md` — 1 GSD reference (identity line)
- `agents/grd-plan-checker.md` — 1 GSD reference (identity line)
- `agents/grd-roadmapper.md` — 1 GSD reference (identity line)
- `grd/workflows/scope-inquiry.md` — examples need research vocabulary
- `grd/workflows/verify-inquiry.md` — description needs research reframe
- `grd/workflows/new-milestone.md` — dimension labels need research reframe

### Established Patterns
- Phase 27 already renamed PM-style command identifiers to research-native names across 17 workflow files
- Phase 26 handled the GSD→GRD brand rename across the codebase

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
