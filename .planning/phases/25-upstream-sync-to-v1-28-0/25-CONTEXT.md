# Phase 25: Upstream Sync to v1.28.0 - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Sync all core CJS modules, agent prompts, workflow files, command files, and templates from GSD v1.25.1 to v1.28.0 while preserving GRD's research-specific modifications. Adopt all 5 new upstream modules. Clean up carried tech debt opportunistically. All 514+ existing tests must pass on the new baseline.

</domain>

<decisions>
## Implementation Decisions

### New Module Strategy
- **D-01:** Adopt all 5 new upstream modules (security.cjs, uat.cjs, workstream.cjs, profile-output.cjs, profile-pipeline.cjs) into grd/bin/lib/
- **D-02:** Apply GRD namespace to new modules (same pattern as existing shared modules)

### Merge Strategy
- **D-03:** Single diff from v1.25.1 to v1.28.0 (skip intermediate versions). Final state is what matters, not the journey.
- **D-04:** Same diff-and-apply pattern as Phase 15 -- diff upstream, apply delta to GRD's version, preserve research extensions
- **D-05:** Case-by-case conflict resolution for shared modules (no blanket "upstream wins" or "research wins")

### Workflow/Agent Scope
- **D-06:** Full sync across all file types -- CJS modules, workflows, agents, commands, templates
- **D-07:** Same thoroughness as Phase 15. Adopt new upstream files, update existing, preserve research adaptations.

### Test Strategy
- **D-08:** Run tests after each module group sync (modules → agents → workflows → templates)
- **D-09:** Existing 514+ tests only -- no new tests in this phase

### Tech Debt Cleanup
- **D-10:** Opportunistic cleanup -- fix tech debt items when modifying the affected file during sync, not as separate tasks
- **D-11:** 5 items to clean up: duplicate stateExtractField, config-set-model-profile stub, stats.md research metrics, 2 stale Skill() namespace calls, unused replaceInCurrentMilestone export

### Claude's Discretion
- Exact order of module sync within each file group
- How to handle unexpected upstream changes not in prior research
- Commit granularity (per-module vs per-group)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Upstream Source
- `~/.claude/get-shit-done/` -- GSD v1.28.0 installed (source of truth for upstream)
- `grd/VERSION` -- Currently reads 1.25.1, must read 1.28.0 after sync

### Prior Sync Reference
- `.planning/phases/15-upstream-sync-v1.25.1/15-CONTEXT.md` -- v1.25.1 sync decisions and approach
- `.planning/milestones/v1.1-ROADMAP.md` -- v1.1 sync approach (phases 9-14) for pattern reference

### Known Tech Debt
- `.planning/PROJECT.md` (Known Tech Debt section) -- 5 items to clean up opportunistically

### Rename Spec (future phases context)
- `docs/GRD-Rename-Spec.md` -- v1.3 full spec. Phase 25 sync is prerequisite for Phases 26-29.

</canonical_refs>

<code_context>
## Existing Code Insights

### Module Inventory
- **GRD has 19 CJS modules** in `grd/bin/lib/`
- **Upstream has 17 CJS modules** in `~/.claude/get-shit-done/bin/lib/`
- **7 research-only modules** (no upstream equivalent): acquire.cjs, bootstrap.cjs, plan-checker-rules.cjs, tier-strip.cjs, vault.cjs, verify-research.cjs, verify-sufficiency.cjs
- **12 shared modules** need diff-and-apply: commands, config, core, frontmatter, init, milestone, model-profiles, phase, roadmap, state, template, verify
- **5 new upstream modules** to adopt: profile-output.cjs, profile-pipeline.cjs, security.cjs, uat.cjs, workstream.cjs

### Established Patterns
- v1.1/v1.2 sync used diff-and-apply with research layer preserved
- All modules export via `module.exports`, consumed by `grd-tools.cjs`
- Agent prompts reference module paths via absolute paths to `grd/bin/lib/`
- Workflow files reference commands via `Skill("grd:...")` calls
- Dependency injection pattern in tests (toolRunner) must be preserved

### Integration Points
- `grd/bin/grd-tools.cjs` is the CLI entry point -- must wire new modules
- `grd/bin/lib/model-profiles.cjs` defines agent model assignments -- may need new agents for new modules
- `commands/gsd-r/` routes to library functions -- new commands may be needed for new modules

</code_context>

<specifics>
## Specific Ideas

- Same diff-and-apply pattern that worked in Phases 9-15 -- don't reinvent
- Research-phase diff analysis before planning -- run /grd:plan-inquiry 25 with research enabled to produce file-by-file diff manifest
- Opportunistic tech debt cleanup means fixing while we're already in the file, not separate tasks

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 25-upstream-sync-to-v1-28-0*
*Context gathered: 2026-03-22*
