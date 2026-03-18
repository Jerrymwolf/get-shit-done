# Phase 15: Upstream Sync to v1.25.1 - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Sync all core CJS modules, agent prompts, workflow files, and templates from GSD v1.24.0 to v1.25.1 while preserving GRD's research-specific modifications. Clean up all 5 known tech debt items. All 164+ existing tests must pass on the new baseline.

</domain>

<decisions>
## Implementation Decisions

### Merge Strategy
- **Diff-and-apply** across all file types (modules, agents, workflows, templates) -- same proven v1.1 pattern
- Diff each upstream file v1.24.0 to v1.25.1, apply the delta to GRD's version
- Preserves research modifications by integrating upstream changes around them
- **Research-phase diff analysis required** -- run `/gsd:plan-phase 15` with research enabled to produce a full file-by-file diff manifest before planning

### Research-Specific Preservation
- 5 research-only modules (acquire.cjs, bootstrap.cjs, vault.cjs, verify-research.cjs, plan-checker-rules.cjs) get **opportunistic cleanup** during sync
- For modules with both upstream changes and research extensions (state.cjs, core.cjs, model-profiles.cjs): **case-by-case** conflict resolution -- researcher/planner decides per conflict which change matters more
- No blanket "research always wins" or "upstream always wins" rule

### Test Strategy
- Run tests **after each module group** sync:
  1. CJS modules synced -> run all 164 tests
  2. Agent prompts synced -> run tests
  3. Workflows/templates synced -> run tests
- **Existing tests only** -- TEST-01 scope is "all 164+ tests pass." New tests come in later phases (Phase 16+)
- Catch regressions early rather than discovering them after everything is synced

### Tech Debt Cleanup
- Clean up **all 5 items** during sync:
  1. Remove duplicate `stateExtractField` dead code in state.cjs (line 12)
  2. Implement or remove `config-set-model-profile` stub in grd-tools.cjs
  3. Add research-specific metrics to stats.md
  4. Fix 2 stale `Skill()` namespace calls (plan-phase.md:529, discuss-phase.md:682)
  5. Remove `replaceInCurrentMilestone` unused export

### Claude's Discretion
- Exact order of module sync within each group
- How to handle any unexpected upstream changes not identified in STACK.md research
- Whether to batch small changes or commit per-module

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Upstream Sync
- `.planning/research/STACK.md` -- Full sync manifest with file-by-file v1.24.0 to v1.25.1 diff analysis, key changes per module
- `.planning/research/PITFALLS.md` -- Upstream sync risk analysis and prevention strategies
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` -- Full v1.2 spec (sync is Phase 1 prerequisite)

### Prior Sync Reference
- `.planning/milestones/v1.1-ROADMAP.md` -- v1.1 sync approach (phases 9-14) for pattern reference
- `.planning/milestones/v1.1-REQUIREMENTS.md` -- v1.1 sync requirements for pattern reference

### Upstream Source
- `~/.claude/get-shit-done/` -- GSD v1.25.1 installed (source of truth for upstream)
- `grd/VERSION` -- Currently reads 1.24.0, must read 1.25.1 after sync

### Known Tech Debt
- `.planning/PROJECT.md` (Known Tech Debt section) -- All 5 items to clean up

</canonical_refs>

<code_context>
## Existing Code Insights

### Module Inventory
- **GRD has 17 CJS modules** in `grd/bin/lib/`
- **Upstream has 12 CJS modules** in `~/.claude/get-shit-done/bin/lib/`
- **5 research-only modules** (no upstream equivalent): acquire.cjs, bootstrap.cjs, vault.cjs, verify-research.cjs, plan-checker-rules.cjs
- **12 shared modules**: commands.cjs, config.cjs, core.cjs, frontmatter.cjs, init.cjs, milestone.cjs, model-profiles.cjs, phase.cjs, roadmap.cjs, state.cjs, template.cjs, verify.cjs

### Key v1.25.1 Changes (from STACK.md)
- core.cjs: `spawnSync` replaces `execSync` in `execGit`; new `stripShippedMilestones()`, `getMilestonePhaseFilter()`
- config.cjs: `ensureConfigFile()` extracted; `VALID_CONFIG_KEYS` set added
- state.cjs: Changes TBD (researcher will produce full diff)

### Established Patterns
- v1.1 sync used "upstream wins" as default with research layer applied on top
- v1.2 uses case-by-case instead of blanket upstream-wins
- Dependency injection pattern in tests (toolRunner) must be preserved

### Integration Points
- All modules export via `module.exports` and are consumed by `grd-tools.cjs` (CLI entry point)
- Agent prompts reference module paths via absolute paths to `grd/bin/lib/`
- Workflow files reference commands via `Skill("grd:...")` calls

</code_context>

<specifics>
## Specific Ideas

- Same diff-and-apply pattern that worked in v1.1 -- don't reinvent the wheel
- Opportunistic cleanup means fixing tech debt while we're already modifying the files, not as separate tasks
- Research-phase diff analysis before planning -- don't trust the STACK.md research alone for 1,077 commits

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 15-upstream-sync-v1.25.1*
*Context gathered: 2026-03-17*
