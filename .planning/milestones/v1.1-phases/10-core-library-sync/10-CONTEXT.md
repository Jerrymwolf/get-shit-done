# Phase 10: Core Library Sync - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Bring core.cjs to v1.24.0 feature parity: rewire MODEL_PROFILES to import from model-profiles.cjs, add milestone scoping functions (stripShippedMilestones, replaceInCurrentMilestone), add profile inheritance support, update flexible goal regex, and fix all consumers. No new GSD-R-specific functionality -- this is a sync phase.

</domain>

<decisions>
## Implementation Decisions

### MODEL_PROFILES rewire
- Remove inline MODEL_PROFILES from core.cjs entirely
- Import MODEL_PROFILES from `./model-profiles.cjs` (created in Phase 9)
- Drop MODEL_PROFILES from core.cjs exports -- consumers must import from model-profiles.cjs directly
- resolveModelInternal stays in core.cjs (matches upstream), imports MODEL_PROFILES from model-profiles.cjs
- Fix all existing consumers of `require('./core.cjs').MODEL_PROFILES` to use `require('./model-profiles.cjs').MODEL_PROFILES` in this phase

### Milestone scoping additions
- Copy `stripShippedMilestones` and `replaceInCurrentMilestone` verbatim from upstream -- GSD-R's ROADMAP.md already uses the same `<details>` format
- Wire stripShippedMilestones into `getRoadmapPhaseInternal`, `getMilestonePhaseFilter`, and `getMilestoneInfo` (matching upstream)
- Export both new functions from core.cjs
- Adopt upstream's flexible goal regex in `getRoadmapPhaseInternal`: `Goal(?:\*\*:|\*?\*?:\*\*)` instead of the current rigid pattern

### Profile inheritance
- Add `if (profile === 'inherit') return 'inherit';` to resolveModelInternal (matching upstream)
- This allows the "inherit" profile setting to pass through without model resolution

### Merge strategy
- Overwrite core.cjs with upstream's version wholesale, then verify:
  - Import path is `./model-profiles.cjs` (not upstream's path)
  - No upstream-specific paths or references leak in
- Run existing test suite for regression
- Write new targeted tests for: stripShippedMilestones, replaceInCurrentMilestone, inherit profile handling

### Claude's Discretion
- Test file structure and assertion patterns for new tests
- Order of operations within the overwrite (copy-then-verify vs staged patches)
- Whether to add integration tests or keep unit-level only

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Upstream reference (sync target)
- `~/.claude/get-shit-done/bin/lib/core.cjs` -- Upstream v1.24.0 core.cjs (the overwrite source)
- `~/.claude/get-shit-done/bin/lib/model-profiles.cjs` -- Upstream's model-profiles.cjs (API surface reference)

### Current GSD-R implementation
- `get-shit-done-r/bin/lib/core.cjs` -- Current GSD-R core.cjs (overwrite target)
- `get-shit-done-r/bin/lib/model-profiles.cjs` -- GSD-R's model-profiles.cjs (Phase 9 output, import source)

### Existing tests
- `test/` directory -- All existing test files (must pass after sync)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `model-profiles.cjs` (Phase 9): Already has MODEL_PROFILES with 19 gsd-r-* agents, VALID_PROFILES, formatAgentToModelMapAsTable, getAgentToModelMapForProfile
- Existing test infrastructure: node:test runner, describe/it/assert patterns

### Established Patterns
- CommonJS modules with `module.exports` at bottom
- Zero external dependencies (node:fs, node:path, node:child_process only)
- `safeReadFile` pattern for graceful file reads
- `output()`/`error()` pattern for CLI JSON responses

### Integration Points
- `core.cjs` is imported by: init.cjs, commands.cjs, gsd-tools.cjs, state.cjs
- MODEL_PROFILES consumers need updating to import from model-profiles.cjs
- resolveModelInternal is called by init.cjs for agent model resolution

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 10-core-library-sync*
*Context gathered: 2026-03-15*
