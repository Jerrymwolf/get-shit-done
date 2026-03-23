# Phase 31: Command Reconceptualization -- Export and Presentation - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning
**Mode:** Infrastructure phase — discuss skipped (command reconceptualization with clear success criteria)

<domain>
## Phase Boundary

Four output-oriented PM commands become research delivery tools for packaging, exporting, and reviewing scholarly work:
1. `/grd:ship` → research export — Obsidian vault export, manuscript assembly, deliverable packaging
2. `/grd:pr-branch` → export clean research — package notes without .planning/ artifacts
3. `/grd:ui-phase` → presentation design — plan how findings will be presented (poster, paper, slide deck, report)
4. `/grd:ui-review` → output review — audit quality of research deliverables (completeness, citation coverage, argument coherence)

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — infrastructure phase with clear success criteria from ROADMAP. Each command's workflow file, agent prompt (if exists), and CLI route must be updated end-to-end.

</decisions>

<code_context>
## Existing Code Insights

### Target Files
- `grd/workflows/ship.md` — current ship workflow (no CLI route file)
- `grd/workflows/pr-branch.md` — current pr-branch workflow (no CLI route file)
- `grd/workflows/ui-phase.md` — current ui-phase workflow
- `commands/grd/ui-phase.md` — CLI route for ui-phase
- `grd/workflows/ui-review.md` — current ui-review workflow
- `commands/grd/ui-review.md` — CLI route for ui-review

### Established Patterns
- Phase 30 reconceptualized 3 commands with the same approach (rewrite content, preserve structure)
- CLI routes and file paths stay unchanged; only descriptive content gets reframed
- Structural elements (grd-tools.cjs calls, Task() spawning, AskUserQuestion gates) preserved

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
