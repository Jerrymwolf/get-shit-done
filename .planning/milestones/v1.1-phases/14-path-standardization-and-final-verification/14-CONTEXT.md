# Phase 14: Path Standardization and Final Verification - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace all `$HOME` and `~` path references with absolute paths (`/Users/jeremiahwolf/...`) across all GSD-R files. Extend verify-rename.cjs to detect stale path references. Run full validation sweep and test suite to confirm zero regressions. This is the final phase of v1.1 Upstream Sync.

</domain>

<decisions>
## Implementation Decisions

### Path replacement target
- Replace `$HOME/.claude/get-shit-done-r/` with `/Users/jeremiahwolf/.claude/get-shit-done-r/` everywhere
- Replace `~/` path references with `/Users/jeremiahwolf/` equivalent
- Replace in ALL contexts: executable bash code blocks, inline paths, documentation, examples — no exceptions
- Zero `$HOME` or `~` references should remain after this phase
- Matches upstream GSD convention which uses fully resolved absolute paths throughout

### Replacement scope
- 183 `$HOME` references across: workflows (159), agents (41), references (18), commands (6)
- 5 `~` path references
- Total: ~188 replacements across ~40 files
- No CJS module code changes expected (bin/ has 0 `$HOME` refs)

### Verification tooling
- Extend existing `scripts/verify-rename.cjs` to also detect `$HOME` and `~` path references (not just `/gsd:` namespace leaks)
- Single tool, single command for complete validation: namespace + path standardization
- PATH-03 satisfied by running extended verify-rename

### Test strategy
- No new tests needed — path changes are in markdown files, not CJS library code
- PATH-04: run existing `node --test test/` (164+ tests) to confirm zero regressions
- The verify-rename sweep IS the path-specific validation

### No exceptions
- Every `$HOME` reference becomes absolute path — no preserved exceptions for docs or examples
- Every `~` reference becomes absolute path
- If user-facing text needs a generic path representation, use `~/.claude/` is NOT acceptable — use the absolute path

### Claude's Discretion
- Batch size for sed replacements (per-directory or per-file)
- Whether to process workflows, agents, references, commands in separate tasks or together
- Order of operations (replace first, then verify, or verify-replace-verify)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — mechanical find-and-replace operation with verification bookend.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Verification tooling
- `scripts/verify-rename.cjs` — Existing namespace leak detection script, to be extended with $HOME/~ detection

### Current state baseline
- `get-shit-done-r/workflows/` — 159 $HOME refs across workflow files (largest scope)
- `agents/` — 41 $HOME refs across agent files
- `get-shit-done-r/references/` — 18 $HOME refs across reference files
- `commands/gsd-r/` — 6 $HOME refs across command files

### Requirements
- `.planning/REQUIREMENTS.md` — PATH-01 through PATH-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/verify-rename.cjs` — Already validates `/gsd:` namespace leaks; extension point for path validation
- Phase 13 already cleaned up all `/gsd:` namespace leaks and `gsd-tools.cjs` references — those are zero

### Established Patterns
- Prior phases used `sed` for namespace transformation across multiple files
- Workflow files use `node "$HOME/.claude/get-shit-done-r/bin/gsd-r-tools.cjs"` pattern — mechanical replacement
- Agent files reference `@$HOME/.claude/get-shit-done-r/` for execution context

### Integration Points
- verify-rename.cjs is a standalone script — no imports from library modules
- Test suite runs via `node --test test/` — tests exercise CJS modules, not markdown files

### Already Clean (no work needed)
- Zero `/gsd:` namespace leaks (Phase 13)
- Zero `gsd-tools.cjs` references (Phase 13)
- Zero hardcoded upstream paths (Phase 13)
- bin/ directory: zero `$HOME` references
- templates/ directory: zero `$HOME` references
- hooks/ directory: zero `$HOME` references

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 14-path-standardization-and-final-verification*
*Context gathered: 2026-03-16*
