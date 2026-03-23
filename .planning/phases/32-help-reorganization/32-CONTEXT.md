# Phase 32: Help Reorganization - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning
**Mode:** Infrastructure phase — discuss skipped (help text rewrite with clear success criteria)

<domain>
## Phase Boundary

`/grd:help` presents the tool as a research workflow system, not a PM tool — every command described in scholarly terms. Reorganize commands into Research Workflow / Utility / Configuration sections.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — infrastructure phase with clear success criteria from ROADMAP:
- `/grd:help` organizes commands into Research Workflow / Utility / Configuration sections (not PM-centric categories)
- Every command entry shows its research-native purpose
- A researcher unfamiliar with GSD would understand what each command does from its help description alone

</decisions>

<code_context>
## Existing Code Insights

### Target Files
- `grd/workflows/help.md` — main help workflow (generates the help output)
- `commands/grd/help.md` — CLI route for help command

### Context from Prior Phases
- Phase 27: Renamed all command identifiers to research-native names
- Phase 28: Agent prompts and workflow examples use research vocabulary
- Phase 30-31: All 7 PM commands reconceptualized with research-native descriptions
- New commands created: export-research, export-clean, presentation-design, output-review, diagnose, map-corpus, add-verification

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
