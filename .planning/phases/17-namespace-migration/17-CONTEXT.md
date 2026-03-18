# Phase 17: Namespace Migration - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Rename every `grd` reference to `grd` across the entire codebase: directory rename (`grd/` → `grd/`), CLI tool rename (`grd-tools.cjs` → `grd-tools.cjs`), command prefix change (`/grd:` → `/grd:`), research-native command vocabulary per spec table, agent name prefix change (`grd-*` → `grd-*`), and workflow file renames to match new command names. Zero residual `grd` references in any file.

</domain>

<decisions>
## Implementation Decisions

### Command Vocabulary Mapping
- **Use the spec table exactly** -- the 23-command mapping from `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Command Vocabulary is the source of truth
- Commands NOT in the spec table get **prefix change only**: `grd:` → `grd:` with existing names preserved (e.g., `/grd:validate-phase`, `/grd:add-tests`, `/grd:check-todos`, `/grd:note`, `/grd:add-todo`, `/grd:cleanup`, `/grd:do`, `/grd:map-codebase`, `/grd:update`, `/grd:reapply-patches`)
- **Workflow filenames rename to match new commands**: `execute-phase.md` → `conduct-inquiry.md`, `discuss-phase.md` → `scope-inquiry.md`, `plan-phase.md` → `plan-inquiry.md`, etc. Full consistency between user-facing command names and internal filenames
- Structural operations use spec vocabulary: `add-inquiry`, `remove-inquiry`, `insert-inquiry` (not `add-phase`)

### Directory Rename Strategy
- **Atomic single commit**: `git mv grd/ grd/` + all path reference updates (runtime code, tests, .planning/ docs, CLAUDE.md) in one commit
- **Update everything**: all `.planning/` docs, `CLAUDE.md`, and runtime code get updated -- no stale references anywhere
- Test file `require()` paths updated in the same atomic commit as the directory rename -- no intermediate broken state
- `grd-tools.cjs` → `grd-tools.cjs` included in same rename commit

### Residual Scan
- **Scan scope**: everything under `grd/` AND `.planning/` -- zero tolerance for any `grd` string in either tree
- **Pattern variants**: scan for `grd`, `grd`, `grd`, `GSDR` (case-sensitive per pattern). Note: the repo root folder `GSDR` is the project name, not a namespace reference -- exclude the root directory name itself from scan failures
- **Implementation**: `test/namespace.test.cjs` that greps for residual references and fails if any found. Runs with every test suite execution. Satisfies TEST-02 and NS-06

### Agent Names
- **Rename everywhere**: both `model-profiles.cjs` table AND all `subagent_type` references in workflows/agents change. `grd-planner` → `grd-planner`, `grd-executor` → `grd-executor`, etc.
- **Agent prompt content updated too**: `.md` files in `grd/agents/` get `GRD` → `GRD` in their descriptions and context sections

### Claude's Discretion
- Exact ordering of rename operations within the atomic commit
- Whether to use a script for bulk find-and-replace or manual editing
- How to structure the namespace test assertions (individual patterns vs combined regex)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Command Vocabulary
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Command Vocabulary (lines 440-464) -- the authoritative 23-command rename table

### Namespace Requirements
- `.planning/REQUIREMENTS.md` -- NS-01 through NS-06, TEST-02

### Current Infrastructure
- `grd/bin/grd-tools.cjs` -- CLI entry point, all command routing
- `grd/references/model-profiles.md` -- 19 agent names with grd-* prefix
- `grd/bin/lib/model-profiles.cjs` -- agent name resolution code
- `grd/bin/lib/commands.cjs` -- command registration

</canonical_refs>

<code_context>
## Existing Code Insights

### Scope of Changes
- **~699 `grd` references** across all files in `grd/`
- **~234 `grd` path references** across all files
- **19 agent names** in model-profiles.cjs/md using `grd-*` prefix
- **23 commands** in spec rename table + ~10 unlisted commands needing prefix-only change
- **17 CJS modules** in `grd/bin/lib/` with internal references
- **41+ workflow files** in `grd/workflows/` with Skill() calls and cross-references
- **6 test files** in `test/` with `require()` paths to `grd/`

### Established Patterns
- All Skill() calls use format `Skill("grd:command-name")` -- need bulk replacement
- Agent prompts reference absolute paths to `grd/bin/lib/` and `grd/workflows/`
- `grd-tools.cjs` routes CLI commands via a switch/map pattern in `commands.cjs`
- Config references use `grd-` prefix in some dot-notation paths

### Integration Points
- CLAUDE.md references `grd/` paths for project configuration
- `.planning/` docs reference `grd/` paths in CONTEXT.md, RESEARCH.md, and PLAN.md files
- `scripts/` directory may have `grd` references (rename scripts from prior phases)

</code_context>

<specifics>
## Specific Ideas

- The directory rename is the highest-risk operation -- everything else is find-and-replace. Do the directory rename first within the atomic commit, then fix all references
- Workflow file renames (execute-phase.md → conduct-inquiry.md) are the second-highest risk because cross-references between workflows are extensive
- The namespace test should be durable -- it prevents future regressions if someone accidentally adds a grd reference

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 17-namespace-migration*
*Context gathered: 2026-03-17*
