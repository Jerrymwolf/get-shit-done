# Phase 30: Command Reconceptualization -- Diagnostics and Corpus - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning
**Mode:** Infrastructure phase — discuss skipped (command reconceptualization with clear success criteria)

<domain>
## Phase Boundary

Three PM-only commands become research-native tools that researchers would reach for naturally:
1. `/grd:debug` → `/grd:diagnose` — investigate methodology gaps, source conflicts, analytical dead ends
2. `/grd:map-codebase` → `/grd:map-corpus` — survey existing sources and knowledge landscape
3. `/grd:add-tests` → `/grd:add-verification` — evidence checks, source coverage assertions

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — infrastructure phase with clear success criteria from ROADMAP. Each command's workflow file, agent prompt, and CLI route must be updated end-to-end.

</decisions>

<code_context>
## Existing Code Insights

### Target Files
- `grd/workflows/diagnose-issues.md` — orchestrates debug agents for UAT gap investigation
- `agents/grd-debugger.md` — scientific method debugging agent
- `grd/workflows/map-codebase.md` — orchestrates parallel codebase mapping agents
- `agents/grd-codebase-mapper.md` — writes 7 analysis documents to .planning/codebase/
- `grd/workflows/add-tests.md` — generates tests for completed phases
- `agents/grd-verifier.md` — goal-backward verification agent (shared, already updated in Phase 28)

### Established Patterns
- Phase 27 already renamed command identifiers (e.g., debug→diagnose, map-codebase→map-corpus, add-tests→add-verification)
- Phase 28 reoriented agent prompts to acknowledge research outputs
- Workflow files follow lean orchestrator pattern (spawn agents, collect results)

### Key Constraint
- CLI routes were already renamed in Phase 27 — this phase rewrites the workflow/agent CONTENT to be research-native, not the routing

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
