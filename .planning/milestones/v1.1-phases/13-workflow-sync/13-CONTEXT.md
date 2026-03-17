# Phase 13: Workflow Sync - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Add 5 new upstream workflows (autonomous, node-repair, stats, ui-phase, ui-review) and 2 new templates (copilot-instructions.md, UI-SPEC.md) to GSD-R. Sync 33 existing shared workflows with upstream v1.24.0 via overwrite + re-apply research logic. Sync ~30 command files from upstream skill definitions. All files get /gsd-r: namespace. execute-plan.md is excluded (already synced in Phase 12).

</domain>

<decisions>
## Implementation Decisions

### New workflow strategy
- Copy all 5 new workflows (autonomous.md, node-repair.md, stats.md, ui-phase.md, ui-review.md) wholesale from upstream
- Find-and-replace namespace: /gsd: → /gsd-r:, gsd-tools.cjs → gsd-r-tools.cjs, agent names gsd-* → gsd-r-*
- No inline research-specific modifications in the workflow files themselves
- UI workflows (ui-phase.md, ui-review.md) included for v1.24.0 parity even though research projects typically don't have frontends

### New template strategy
- Copy both copilot-instructions.md and UI-SPEC.md to get-shit-done-r/templates/
- Same namespace fix applied
- Completes WKFL-02 (deferred from Phase 12)

### Shared workflow sync (33 files)
- Default: wholesale overwrite from upstream, then re-apply GSD-R research sections where needed
- Same strategy as state.cjs in Phase 11 -- overwrite is cleanest way to get all upstream improvements
- execute-plan.md EXCLUDED -- already synced with rigor gates in Phase 12, has heavy research logic
- verify-phase.md: overwrite + re-apply the source audit tier (two-tier verification: goal-backward + source audit)
- new-project.md, discovery-phase.md, and other files with GSD-R research logic: overwrite + re-apply research sections
- Files with no GSD-R customizations (~25): straight overwrite + namespace fix

### Command file sync (WKFL-04)
- Overwrite each command file from corresponding upstream skill definition
- Namespace fix: /gsd: → /gsd-r: throughout
- Keep GSD-R-only command files: set-profile.md and join-discord.md (no upstream equivalent)
- Add new command files for the 5 new workflows (autonomous, node-repair, stats, ui-phase, ui-review)

### Research-aware requirement satisfaction
- EXEC-03 (node-repair source awareness): Satisfied by ecosystem -- node-repair works with executor which already has research logic. No inline modification needed.
- EXEC-04 (autonomous research detection): Satisfied by ecosystem -- autonomous calls discuss-phase which reads PROJECT.md. Research context comes from project config, not the workflow file.
- EXEC-05 (stats research metrics): Partially satisfied -- stats.md workflow copied as-is. Actual research metrics (note count, source coverage, source gaps) require cmdStats library changes deferred to future version.

### Claude's Discretion
- Classification of which shared workflows have GSD-R research logic vs clean copies (researcher determines via diff)
- Exact research sections to re-apply after overwrite for each customized workflow
- Order of operations (new workflows first vs shared sync first)
- Whether any command files need content changes beyond namespace fix

</decisions>

<specifics>
## Specific Ideas

No specific requirements -- open to standard approaches

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Upstream workflows (sync source)
- `~/.claude/get-shit-done/workflows/` -- All 38 upstream workflow files (copy source for new, overwrite source for shared)
- `~/.claude/get-shit-done/workflows/autonomous.md` -- New: autonomous execution workflow
- `~/.claude/get-shit-done/workflows/node-repair.md` -- New: task failure self-healing
- `~/.claude/get-shit-done/workflows/stats.md` -- New: statistics dashboard
- `~/.claude/get-shit-done/workflows/ui-phase.md` -- New: UI design contract generation
- `~/.claude/get-shit-done/workflows/ui-review.md` -- New: UI visual audit

### Upstream templates (copy source)
- `~/.claude/get-shit-done/templates/copilot-instructions.md` -- New: IDE integration template
- `~/.claude/get-shit-done/templates/UI-SPEC.md` -- New: UI specification template

### Current GSD-R workflows (overwrite targets)
- `get-shit-done-r/workflows/` -- All 34 GSD-R workflow files (overwrite targets for shared sync)
- `get-shit-done-r/workflows/execute-plan.md` -- EXCLUDED from sync (Phase 12 already handled)
- `get-shit-done-r/workflows/verify-phase.md` -- Has research two-tier verification to re-apply after overwrite

### GSD-R command files
- `commands/gsd-r/` -- All 30 GSD-R command files (overwrite targets)
- `commands/gsd-r/set-profile.md` -- GSD-R-only, keep as-is
- `commands/gsd-r/join-discord.md` -- GSD-R-only, keep as-is

### Phase 12 context (already-synced work)
- `.planning/phases/12-templates-and-execution-rigor/12-CONTEXT.md` -- Deferred copilot-instructions.md and UI-SPEC.md to this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 34 existing GSD-R workflow files with established /gsd-r: namespace patterns
- 30 existing command files with /gsd-r: namespace
- Phase 12's execute-plan.md with rigor gates already applied -- pattern reference for how research logic coexists with upstream improvements

### Established Patterns
- Workflow files reference gsd-r-tools.cjs for CLI operations
- Agent names use gsd-r-* prefix (19 agents in model-profiles.cjs)
- Command files are thin wrappers that set context and invoke workflows
- Research-specific sections use clear delimiter comments (e.g., `// === GSD-R Research Extensions ===`)

### Integration Points
- Workflows are invoked by command files via Skill tool
- Workflows call gsd-r-tools.cjs for state/roadmap operations
- Workflows reference agent types (gsd-r-executor, gsd-r-verifier, etc.)
- verify-phase.md is consumed by gsd-r-verifier agent

</code_context>

<deferred>
## Deferred Ideas

- Research-specific stats metrics (note count, source coverage, source gaps) in cmdStats -- future library enhancement after EXEC-05 workflow is in place
- Research-domain detection in autonomous.md smart discuss -- revisit if ecosystem approach proves insufficient
- Source-acquisition failure patterns in node-repair.md -- add if research-specific failures become common

</deferred>

---

*Phase: 13-workflow-sync*
*Context gathered: 2026-03-16*
