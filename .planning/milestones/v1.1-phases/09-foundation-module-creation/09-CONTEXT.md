# Phase 9: Foundation Module Creation - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Create `model-profiles.cjs` as a standalone module with GSD-R agent name prefixes (`gsd-r-*`) and establish upstream version tracking via a VERSION file. Core.cjs is NOT modified in this phase -- integration happens in Phase 10.

</domain>

<decisions>
## Implementation Decisions

### Agent roster
- Include all 15 upstream agents with `gsd-r-*` prefixes (including ui-researcher, ui-checker, ui-auditor -- Phase 13 UI workflows will need them)
- Add GSD-R-only research agents: `gsd-r-source-researcher`, and any others the codebase actually invokes
- Profile tier assignments for research agents match their closest upstream analogue:
  - `gsd-r-source-researcher` matches `gsd-r-phase-researcher` (opus/sonnet/haiku)
  - `gsd-r-verify-research` matches `gsd-r-verifier` (sonnet/sonnet/haiku)

### Extraction approach
- Match upstream's exact API surface: `MODEL_PROFILES`, `VALID_PROFILES`, `formatAgentToModelMapAsTable`, `getAgentToModelMapForProfile`
- Same function signatures as upstream -- only the data differs (gsd-r-* agent names + research agents added)
- core.cjs is left untouched -- it keeps its inline MODEL_PROFILES until Phase 10 rewires it to import from model-profiles.cjs

### VERSION tracking
- Plain text file containing `1.24.0` (single line, no trailing metadata)
- Location: `get-shit-done-r/VERSION` (inside the distributable package)

### Claude's Discretion
- Exact test structure (test file naming, assertion patterns)
- Whether to add a helper function for reading VERSION at runtime
- How to handle edge cases in profile resolution (unknown agent names, missing profiles)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Upstream reference implementation
- `~/.claude/get-shit-done/bin/lib/model-profiles.cjs` -- Upstream's extracted module (API surface to match)
- `~/.claude/get-shit-done/bin/lib/core.cjs` -- Upstream's core.cjs showing how it imports from model-profiles.cjs

### Current GSD-R implementation
- `get-shit-done-r/bin/lib/core.cjs` lines 18-30 -- Current inline MODEL_PROFILES (12 agents, gsd-r-* names)
- `get-shit-done-r/bin/lib/core.cjs` resolveModelInternal function -- Current profile resolution logic (maps opus -> 'inherit')

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `core.cjs` MODEL_PROFILES (lines 18-30): 12 gsd-r-* agents already defined with correct prefixes -- can be copied as starting point
- `core.cjs` resolveModelInternal: Profile resolution logic already works, stays in core.cjs until Phase 10

### Established Patterns
- CommonJS modules with `module.exports` at bottom
- Zero external dependencies (node:fs, node:path only)
- Tests use `node:test` runner with `describe`/`it`/`assert`

### Integration Points
- `core.cjs` currently owns MODEL_PROFILES inline -- Phase 10 will rewire to `require('./model-profiles.cjs')`
- `init.cjs` and `commands.cjs` reference model profiles indirectly through core.cjs
- Tests in `test/` directory follow `{module}.test.cjs` naming

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

*Phase: 09-foundation-module-creation*
*Context gathered: 2026-03-15*
