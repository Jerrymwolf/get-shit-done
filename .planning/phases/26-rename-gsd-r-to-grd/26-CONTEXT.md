# Phase 26: Rename GSD-R to GRD - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Eliminate all GSD-R branding from active files via file renames, directory moves, and bulk content replacement. After this phase, `grep -r "gsd-r\|GSD-R\|get-shit-done-r"` across active files returns zero results (excluding .planning/, node_modules/, package-lock.json). All 16 agent files, 34 command files, 3 hook files, and config references use GRD naming consistently. All tests pass.

This phase covers Workstream 1 of the GRD-Rename-Spec only. Command vocabulary changes (Workstream 2) and source pipeline wiring (Workstream 3) are separate phases (27 and 28).

</domain>

<decisions>
## Implementation Decisions

### Rename Execution Order
- **D-01:** Organize by file type, then apply replacement passes within each category. Sequence: (1) directory moves (`commands/gsd-r/` → `commands/grd/`), (2) agent file renames (`gsd-r-*.md` → `grd-*.md`), (3) hook file renames (`gsd-*.js` → `grd-*.js`), (4) bulk content replacements across all files (6 passes in spec order), (5) install.js internal renames, (6) config file updates, (7) test file updates.
- **D-02:** Bulk content replacement passes run in spec order (most-specific to least-specific): `/gsd-r:` → `/grd:`, `GSD-R` → `GRD`, `get-shit-done-r` → `grd`, `gsd-r-tools.cjs` → `grd-tools.cjs`, `gsd_state_version` → `grd_state_version`, `gsd-r-` (agent prefix) → `grd-`.

### Verification Strategy
- **D-03:** Run `npm test` after each major rename category (directory moves, agent renames, bulk content, config updates) to catch regressions early rather than one big run at the end.
- **D-04:** Final verification uses the grep-based checklist from the rename spec (three grep commands returning zero results).

### Git History Handling
- **D-05:** Use `git mv` for all file and directory renames to preserve blame history.
- **D-06:** One commit per major rename category (directory move, agent renames, hook renames, bulk content, config updates, test updates). Atomic enough to bisect if something breaks.

### Script Cleanup
- **D-07:** Delete `scripts/rename-gsd-to-gsd-r.cjs` and `scripts/bulk-rename-planning.cjs` (obsolete migration scripts).
- **D-08:** Delete `scripts/verify-rename.cjs` rather than rewriting it — the spec's grep-based verification checklist is more comprehensive and the script would be one-time-use.

### Known Edge Cases
- **D-09:** Bare `get-shit-done` (without `-r`) references in `bin/install.js` (~26 instances) refer to upstream GSD package — leave them intact.
- **D-10:** Bare `gsd-` (without `-r`) in `.gitignore` patterns (`.github/agents/gsd-*`, `.github/skills/gsd-*`) refer to Codex/Copilot directories — update these to `grd-*` per spec section 1.5.
- **D-11:** `GSD-R-Fork-Plan.md` at repo root → rename to `GRD-Fork-Plan.md`.
- **D-12:** `package.json` `files` array fix: replace `"get-research-done"` with `"grd"` (the actual directory name). npm package name stays `get-research-done`.

### Claude's Discretion
- Exact commit granularity within each major category
- Order of file processing within agent renames (alphabetical vs dependency order)
- Whether to combine small related changes into fewer commits

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Rename Specification
- `docs/GRD-Rename-Spec.md` — Complete rename spec with exact find/replace patterns, file lists, edge cases, and verification checklist. This is the authoritative reference for all rename operations in this phase (Workstream 1 / sections 1.1–1.8 only).

### Requirements
- `.planning/REQUIREMENTS.md` — REN-01 through REN-09 define acceptance criteria for the rename phase.

### Prior Sync Context
- `.planning/phases/25-upstream-sync-to-v1-28-0/25-CONTEXT.md` — Phase 25 completed the v1.28.0 sync that this rename builds on.

### Codebase Reference
- `bin/install.js` — Central installer with agent mappings, marker constants, and path references that need updating (spec section 1.4).
- `.claude/settings.local.json` — Permission patterns referencing old paths.
- `.gitignore` — Codex/Copilot directory patterns.

</canonical_refs>

<code_context>
## Existing Code Insights

### Current File Inventory
- `commands/gsd-r/` — 34 command files, all need to move to `commands/grd/`
- `agents/gsd-r-*.md` — 16 agent files need prefix rename to `grd-*`
- `hooks/gsd-*.js` — 3 hook files need prefix rename to `grd-*`
- 61 files total contain GSD-R references (excluding .planning/, node_modules/, package-lock.json)

### Already Clean (No Changes Needed)
- `grd/agents/` — 4 research-specific agents already use `grd` naming
- `grd/bin/` — All CJS modules already clean
- `grd/references/` — Already clean
- `grd/templates/` — Already clean

### Integration Points
- `bin/install.js` — Agent mappings in CODEX_AGENT_SANDBOX, marker constants, path variables
- `test/smoke.test.cjs` — References all 16 agent filenames and command directory
- `test/state.test.cjs` — References `gsd_state_version`

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond the rename spec — the spec is comprehensive and prescriptive. Follow it exactly for Workstream 1 (sections 1.1–1.8).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 26-rename-gsd-r-to-grd*
*Context gathered: 2026-03-23*
