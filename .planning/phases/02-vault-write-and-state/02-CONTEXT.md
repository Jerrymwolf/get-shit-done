# Phase 2: Vault Write and State - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Atomic vault write operation — note file, `-sources/` folder, SOURCE-LOG.md, and git commit all succeed or all roll back — and STATE.md extensions for note-status and source-gap tracking. Source acquisition itself is Phase 3; this phase handles the write infrastructure.

</domain>

<decisions>
## Implementation Decisions

### Atomic Write Operation
- Vault write is all-or-nothing: note.md + note-sources/ + SOURCE-LOG.md + git commit
- On any failure (disk write, git commit), all partial artifacts are cleaned up (rolled back)
- The write function extends the existing `vault.cjs` module — not a new module
- SOURCE-LOG.md is created from the source-log template with an empty table (Phase 3 populates it)
- Git commit uses `HOME=/dev/null` pattern to bypass global gitconfig LFS filter (proven in Phase 1)

### Rollback Strategy
- Track created artifacts during write (files and directories)
- On failure, delete artifacts in reverse order
- If rollback itself fails, log the partial state and throw with details
- No partial notes should exist in the vault after a failed write

### STATE.md Note-Status Tracker
- New section: `## Note Status` with a markdown table
- Columns: Note | Status | Sources | Last Updated
- Status values: draft, reviewed, final, source-incomplete
- Updated by vault write operations and verification
- Programmatic access via state.cjs extensions

### STATE.md Source-Gap Reporting
- New section: `## Source Gaps` with a markdown table
- Columns: Note | Missing Source | Reason | Impact
- Populated when sources are marked unavailable (Phase 3 uses this)
- Cleared when gaps are resolved
- Programmatic access via state.cjs extensions

### Claude's Discretion
- Internal implementation of the rollback mechanism (try/finally vs explicit cleanup)
- Whether to use git porcelain or plumbing commands for the commit step
- Exact format of the note-status and source-gap tables
- Test structure and organization

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `vault.cjs` (grd/bin/lib/vault.cjs): Has writeNote, ensureVaultDir, generateSourceFilename, expandTilde — extend with atomic write wrapper
- `state.cjs` (grd/bin/lib/state.cjs): Has full STATE.md read/write/patch infrastructure — extend with note-status and source-gap operations
- `source-log.md` template: Already exists with correct table format
- `test/vault.test.cjs`: 12 passing tests — extend with atomic write tests

### Established Patterns
- Zero-dependency CJS architecture (Node.js built-ins only)
- TDD approach proven in Phase 1 (vault.cjs)
- `HOME=/dev/null` git commit pattern bypasses broken global LFS config
- State operations follow cmd* naming convention (cmdStateUpdate, cmdStatePatch, etc.)
- frontmatter.cjs handles YAML frontmatter extraction/reconstruction

### Integration Points
- vault.cjs writeNote() is the foundation — atomic write wraps it
- state.cjs writeStateMd() syncs frontmatter — new sections need frontmatter awareness
- gsd-tools.cjs routes CLI commands — new state subcommands need registration
- Executor agents will call atomic write during research task execution (Phase 5)

</code_context>

<specifics>
## Specific Ideas

- User requirement: "When the executive summary says a thing, I want it to tell me where so I can read the paper and verify for myself" — this drives the source-gap tracking (every gap is visible, not hidden)
- Git commit message format: "research(topic): add note-slug" to match GSD's commit convention
- The atomic write is the research equivalent of GSD's code commit — it's the fundamental unit of work

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-vault-write-and-state*
*Context gathered: 2026-03-11*
