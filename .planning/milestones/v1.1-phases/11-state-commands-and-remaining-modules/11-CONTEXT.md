# Phase 11: State, Commands, and Remaining Modules - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Sync state.cjs, commands.cjs, and gsd-tools.cjs with upstream v1.24.0. Preserve GSD-R's 6 research functions in state.cjs (Note Status, Source Gaps). Add new upstream commands (cmdStats). Ensure all existing tests pass after merge. install.js is GSD-R-only and has no upstream equivalent -- CORE-04 is N/A.

</domain>

<decisions>
## Implementation Decisions

### state.cjs merge strategy
- Overwrite state.cjs with upstream wholesale, then append the 6 research functions at the end
- Research functions to preserve: `ensureStateSections`, `cmdStateAddNote`, `cmdStateUpdateNoteStatus`, `cmdStateGetNotes`, `cmdStateAddGap`, `cmdStateResolveGap`, `cmdStateGetGaps`
- Keep `ensureStateSections` as a standalone function (research functions call it before operating on STATE.md)
- All 6 research functions stay inline in state.cjs after the upstream code -- no extraction to separate module
- Clean separation: upstream code first, then a `// === GSD-R Research Extensions ===` comment block, then research functions

### state.cjs frontmatter key
- Keep `gsd_r_state_version` as the frontmatter key (not upstream's `gsd_state_version`)
- Any upstream code that reads `gsd_state_version` needs adaptation to use `gsd_r_state_version`

### commands.cjs sync
- Wholesale overwrite with upstream v1.24.0
- Re-apply the MODEL_PROFILES import fix from Phase 10 (`require('./model-profiles.cjs')` instead of inline)
- Copy `cmdStats` as-is from upstream -- no research-specific extensions in this phase
- GSD-R commands.cjs has no research-specific functions, making wholesale overwrite safe

### gsd-tools.cjs routing
- Overwrite gsd-tools.cjs with upstream to get new routes (stats, scaffold improvements)
- Verify GSD-R-specific routes (if any) are preserved after overwrite
- This is the CLI dispatcher -- must match the commands.cjs and state.cjs it routes to

### install.js / CORE-04
- Skip CORE-04 entirely -- upstream has no bin/install.js, GSD-R's installer is fork-specific infrastructure
- Mark CORE-04 as N/A in requirements tracking
- install.js is not touched in this phase

### Test regression strategy
- Run `node --test` after every task commit (same pattern as Phase 10)
- Write new targeted tests for upstream additions to state.cjs (any new/changed upstream functions)
- Existing tests cover GSD-R research functions and other modules
- CORE-05: all existing tests (vault, acquire, state, bootstrap, plan-checker-rules, verify-research, e2e) must pass
- Fix forward on failures -- diagnose and fix merged code, don't revert

### Claude's Discretion
- Exact placement of research functions within state.cjs (after which upstream function)
- Whether gsd-tools.cjs has GSD-R-specific routes that need preservation (researcher determines via diff)
- Which specific upstream state.cjs functions changed and need new test coverage
- Adaptation approach for `gsd_r_state_version` vs `gsd_state_version` references in upstream code

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Upstream sync targets (v1.24.0)
- `~/.claude/get-shit-done/bin/lib/state.cjs` -- Upstream state.cjs (723 lines, 16 exports) -- overwrite source
- `~/.claude/get-shit-done/bin/lib/commands.cjs` -- Upstream commands.cjs (667 lines, 13 exports) -- overwrite source
- `~/.claude/get-shit-done/bin/gsd-tools.cjs` -- Upstream CLI dispatcher -- overwrite source for routing

### Current GSD-R implementation
- `get-shit-done-r/bin/lib/state.cjs` -- GSD-R state.cjs (971 lines, 21 exports) -- 6 research functions to extract and re-append
- `get-shit-done-r/bin/lib/commands.cjs` -- GSD-R commands.cjs (549 lines, 12 exports) -- overwrite target
- `get-shit-done-r/bin/gsd-tools.cjs` -- GSD-R CLI dispatcher -- overwrite target

### Existing tests (must pass after merge)
- `test/` directory -- All test files: vault, acquire, state, bootstrap, plan-checker-rules, verify-research, e2e

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `model-profiles.cjs` (Phase 9): MODEL_PROFILES with 19 gsd-r-* agents -- commands.cjs import already fixed in Phase 10
- Existing test infrastructure: node:test runner, describe/it/assert patterns, 160 tests passing
- `ensureStateSections` function: Guarantees Note Status and Source Gaps sections exist in STATE.md

### Established Patterns
- CommonJS modules with `module.exports` at bottom
- Zero external dependencies (node:fs, node:path, node:child_process only)
- `safeReadFile` pattern for graceful file reads
- `output()`/`error()` pattern for CLI JSON responses
- Dependency injection for tool calls in tests (`toolRunner` pattern)

### Integration Points
- `gsd-tools.cjs` dispatches CLI subcommands to `commands.cjs` and `state.cjs` functions
- `state.cjs` is imported by: gsd-tools.cjs (routing), init.cjs (state checks)
- `commands.cjs` is imported by: gsd-tools.cjs (routing)
- Research functions in state.cjs are called by: executor agents (note tracking), verifier agents (gap reporting)

### GSD-R-only modules (untouched in this phase)
- `acquire.cjs`, `bootstrap.cjs`, `vault.cjs`, `verify-research.cjs`, `plan-checker-rules.cjs` -- no upstream equivalents

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

- Research-specific stats extensions for cmdStats (note count, source coverage, source gaps) -- future phase after EXEC-05 stats workflow is added
- install.js modernization -- separate effort if needed

</deferred>

---

*Phase: 11-state-commands-and-remaining-modules*
*Context gathered: 2026-03-15*
