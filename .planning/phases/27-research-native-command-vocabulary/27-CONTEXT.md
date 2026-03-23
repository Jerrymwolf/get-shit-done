# Phase 27: Research-Native Command Vocabulary - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Rename 6 core command files from PM-style names to research-native equivalents, and update all cross-references across 34 command files, 16 agent files, 17 workflow files, README.md, and docs/DESIGN.md. After this phase, users invoke `/grd:scope-inquiry` instead of `/grd:discuss-phase`, etc. All tests pass.

This phase covers Workstream 2 of the GRD-Rename-Spec only. The spec provides exact file-by-file mapping tables for all changes.

</domain>

<decisions>
## Implementation Decisions

### Command File Renames (6 files)
- **D-01:** Rename these files via `git mv` in `commands/grd/`:
  - `new-project.md` → `new-research.md`
  - `discuss-phase.md` → `scope-inquiry.md`
  - `plan-phase.md` → `plan-inquiry.md`
  - `execute-phase.md` → `conduct-inquiry.md`
  - `verify-work.md` → `verify-inquiry.md`
  - `complete-milestone.md` → `complete-study.md`

### Cross-Reference Replacement Strategy
- **D-02:** Two-pass approach:
  1. First pass: Replace `/grd:old-name` → `/grd:new-name` across all files (safe — the `/grd:` prefix makes these unambiguous)
  2. Second pass: Context-aware replacement of bare identifiers in workflow files (only when name appears as identifier/filename ref, not English prose)
- **D-03:** The 6 `/grd:` prefixed replacement patterns are:
  - `/grd:new-project` → `/grd:new-research`
  - `/grd:discuss-phase` → `/grd:scope-inquiry`
  - `/grd:plan-phase` → `/grd:plan-inquiry`
  - `/grd:execute-phase` → `/grd:conduct-inquiry`
  - `/grd:verify-work` → `/grd:verify-inquiry`
  - `/grd:complete-milestone` → `/grd:complete-study`

### Workflow File Handling
- **D-04:** 17 workflow files contain bare command names (without `/grd:` prefix) as internal routing identifiers. These need context-aware replacement — only replace when the name is used as a workflow/command identifier (e.g., `→ route to discuss-phase`, `spawn execute-phase`), NOT when it appears in English prose (e.g., "discuss the phase goals").
- **D-05:** The spec (section 2.3B) provides the verified list of 17 files and which old refs each contains. Use this list directly — no need to re-discover.

### Test Strategy
- **D-06:** Two test runs: (1) after file renames, (2) after all cross-reference updates. Not per-command.

### Command Listing Updates
- **D-07:** `help.md` and `autonomous.md` show only new command names — no transition period or dual-name display. Backward compatibility is explicitly out of scope per PROJECT.md.

### ui-phase.md Agent References
- **D-08:** Per spec section 2.4: `gsd-ui-researcher` and `gsd-ui-checker` agent names in `grd/workflows/ui-phase.md` are upstream GSD agents — keep them as-is. GRD does not have its own UI agents.

### Claude's Discretion
- Exact commit granularity (per-file-rename vs batched)
- Order of cross-reference updates within each file category
- Whether to combine the two passes (prefixed + bare) or keep them strictly sequential

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Rename Specification
- `docs/GRD-Rename-Spec.md` §2.1–2.4 — Command vocabulary rename spec with exact file mappings, cross-reference tables, and the verified 17-file workflow list. This is the authoritative reference for all changes in this phase (Workstream 2 only).

### Requirements
- `.planning/REQUIREMENTS.md` — CMD-01 through CMD-06 define acceptance criteria.

### Prior Phase Context
- `.planning/phases/26-rename-gsd-r-to-grd/26-CONTEXT.md` — Phase 26 decisions on git mv usage, commit granularity, test strategy (carried forward where applicable).

</canonical_refs>

<code_context>
## Existing Code Insights

### File Counts (Cross-Reference Impact)
- `/grd:new-project` appears in 22 files
- `/grd:discuss-phase` appears in 21 files
- `/grd:plan-phase` appears in 36 files (highest — most cross-referenced)
- `/grd:execute-phase` appears in 24 files
- `/grd:verify-work` appears in 14 files
- `/grd:complete-milestone` appears in 14 files

### Commands That Keep Their Names (28 commands — no rename)
- `new-milestone`, `audit-milestone`, `progress`, `help`, `update`, `quick`, `debug`, `health`, `settings`, `set-profile`, `add-todo`, `check-todos`, `pause-work`, `resume-work`, `map-codebase`, `stats`, `autonomous`, `cleanup`, `add-phase`, `insert-phase`, `remove-phase`, `validate-phase`, `plan-milestone-gaps`, `research-phase`, `add-tests`, `reapply-patches`, `ui-phase`, `ui-review`

### Integration Points
- `commands/grd/help.md` — Lists all commands, needs full update
- `commands/grd/autonomous.md` — Chains commands, needs routing updates
- `grd/workflows/*.md` — 17 files with bare identifier references
- `agents/grd-*.md` — 16 files suggest next commands to users

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond the rename spec — section 2.1–2.4 is prescriptive with exact mappings.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 27-research-native-command-vocabulary*
*Context gathered: 2026-03-23*
