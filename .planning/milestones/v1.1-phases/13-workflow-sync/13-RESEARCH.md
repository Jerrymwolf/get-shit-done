# Phase 13: Workflow Sync - Research

**Researched:** 2026-03-16
**Domain:** Workflow and command file synchronization (upstream GSD v1.24.0 -> GSD-R)
**Confidence:** HIGH

## Summary

Phase 13 is a large-scale file synchronization phase: 5 new workflows, 2 new templates, ~33 shared workflow overwrites, ~30 command file overwrites, and 4 new command files. The work is mechanically straightforward but volume-heavy. Every file in GSD-R differs from upstream due to three systematic transformations: (1) path references change from hardcoded `/Users/jeremiahwolf/.claude/get-shit-done/` to `$HOME/.claude/get-shit-done-r/`, (2) tool references change from `gsd-tools.cjs` to `gsd-r-tools.cjs`, and (3) namespace references change from `/gsd:` to `/gsd-r:`. A subset of files (~8 workflows) also contain GSD-R research-specific logic that must be re-applied after overwrite.

The critical risk is not technical complexity but volume management: with ~70 files to touch, the planner must structure work to avoid context overflow while ensuring no files are missed. The execute-plan.md workflow is explicitly excluded (already synced in Phase 12).

**Primary recommendation:** Split into 3 plans: (1) new files (5 workflows + 2 templates + 4 commands = 11 files), (2) shared workflow sync with research re-application (~33 files), (3) command file sync (~30 files). Each plan should include a verification step that diffs against upstream to confirm zero missed files.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Copy all 5 new workflows (autonomous.md, node-repair.md, stats.md, ui-phase.md, ui-review.md) wholesale from upstream
- Find-and-replace namespace: /gsd: -> /gsd-r:, gsd-tools.cjs -> gsd-r-tools.cjs, agent names gsd-* -> gsd-r-*
- No inline research-specific modifications in the workflow files themselves
- UI workflows (ui-phase.md, ui-review.md) included for v1.24.0 parity even though research projects typically don't have frontends
- Copy both copilot-instructions.md and UI-SPEC.md to get-shit-done-r/templates/
- Same namespace fix applied to templates
- Default: wholesale overwrite from upstream, then re-apply GSD-R research sections where needed
- execute-plan.md EXCLUDED -- already synced with rigor gates in Phase 12
- verify-phase.md: overwrite + re-apply the source audit tier (two-tier verification)
- new-project.md, discovery-phase.md, and other files with GSD-R research logic: overwrite + re-apply research sections
- Files with no GSD-R customizations (~25): straight overwrite + namespace fix
- Overwrite each command file from corresponding upstream skill definition (at ~/.claude/commands/gsd/)
- Namespace fix: /gsd: -> /gsd-r: throughout command files
- Keep GSD-R-only command files: set-profile.md and join-discord.md (no upstream equivalent)
- Add new command files for the 5 new workflows (autonomous, node-repair, stats, ui-phase, ui-review) -- NOTE: only 4 are actually new (autonomous, stats, ui-phase, ui-review); node-repair has no command file upstream
- EXEC-03 (node-repair source awareness): Satisfied by ecosystem
- EXEC-04 (autonomous research detection): Satisfied by ecosystem
- EXEC-05 (stats research metrics): Partially satisfied -- deferred to future library enhancement

### Claude's Discretion
- Classification of which shared workflows have GSD-R research logic vs clean copies (researcher determines via diff)
- Exact research sections to re-apply after overwrite for each customized workflow
- Order of operations (new workflows first vs shared sync first)
- Whether any command files need content changes beyond namespace fix

### Deferred Ideas (OUT OF SCOPE)
- Research-specific stats metrics (note count, source coverage, source gaps) in cmdStats -- future library enhancement
- Research-domain detection in autonomous.md smart discuss -- revisit if ecosystem approach proves insufficient
- Source-acquisition failure patterns in node-repair.md -- add if research-specific failures become common
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EXEC-03 | Add node-repair.md workflow with source-acquisition-aware failure diagnosis | Copy upstream node-repair.md + namespace fix. Per user decision: satisfied by ecosystem (executor already has research logic). |
| EXEC-04 | Add autonomous.md workflow with research-domain detection in smart discuss | Copy upstream autonomous.md + namespace fix. Per user decision: satisfied by ecosystem (autonomous calls discuss-phase which reads PROJECT.md). |
| EXEC-05 | Add stats.md workflow with research-specific metrics | Copy upstream stats.md + namespace fix. Per user decision: partially satisfied, actual metrics deferred. |
| WKFL-01 | Add ui-phase.md and ui-review.md workflows (direct copy with namespace adaptation) | Copy both upstream workflow files + namespace fix. Also copy gsd-ui-researcher, gsd-ui-checker, gsd-ui-auditor agent refs if needed. |
| WKFL-02 | Add UI-SPEC.md template and copilot-instructions.md template | Copy both from upstream templates/ to get-shit-done-r/templates/ + namespace fix. |
| WKFL-03 | Sync existing workflow files with upstream refinements (~25 overwrite files) | Overwrite all 33 shared workflows (minus execute-plan.md) from upstream, apply namespace transforms, re-apply research sections for ~8 customized files. |
| WKFL-04 | Sync existing command files with upstream refinements | Overwrite all ~30 shared command files from upstream ~/.claude/commands/gsd/, apply namespace transforms, keep set-profile.md and join-discord.md as GSD-R-only. |
</phase_requirements>

## Standard Stack

### Core
| Component | Location | Purpose | Why Standard |
|-----------|----------|---------|--------------|
| Upstream workflows | `~/.claude/get-shit-done/workflows/` | Sync source for all workflow files | Single source of truth for v1.24.0 |
| Upstream templates | `~/.claude/get-shit-done/templates/` | Sync source for new templates | Canonical template definitions |
| Upstream commands | `~/.claude/commands/gsd/` | Sync source for command files | Canonical command definitions |
| GSD-R workflows | `get-shit-done-r/workflows/` | Overwrite targets | Project's workflow directory |
| GSD-R templates | `get-shit-done-r/templates/` | Copy targets for new templates | Project's template directory |
| GSD-R commands | `commands/gsd-r/` | Overwrite targets for command files | Project's command directory |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `diff` | Verify sync completeness | Post-overwrite verification |
| `sed` | Namespace transformation | Batch find-and-replace across files |
| `grep` | Detect research sections | Identify customized files before overwrite |

## Architecture Patterns

### Namespace Transformation Pattern
Three systematic replacements applied to every copied/overwritten file:

```bash
# Pattern 1: Hardcoded absolute paths -> $HOME variable paths
# FROM: /Users/jeremiahwolf/.claude/get-shit-done/
# TO:   $HOME/.claude/get-shit-done-r/
# Note: Also handle the @path variant in execution_context references

# Pattern 2: Tool binary reference
# FROM: gsd-tools.cjs
# TO:   gsd-r-tools.cjs

# Pattern 3: Command namespace
# FROM: /gsd:  (and gsd:)
# TO:   /gsd-r:  (and gsd-r:)

# Pattern 4: Agent name prefix (in workflows that spawn agents)
# FROM: gsd-  (in agent type contexts like "gsd-ui-researcher")
# TO:   gsd-r-  (becomes "gsd-r-ui-researcher")
```

**CRITICAL:** Pattern 4 must be applied carefully -- only in agent name contexts (subagent_type, resolve-model calls), not in generic text. The `gsd-` prefix appears in many non-agent contexts.

### Overwrite + Re-apply Pattern (for customized workflows)
```
1. Read current GSD-R file, extract research-specific sections
2. Copy upstream file wholesale
3. Apply namespace transformations
4. Re-insert research-specific sections at correct locations
5. Verify file is valid (no broken references)
```

### File Classification

**Files with GSD-R research-specific logic (overwrite + re-apply):**

| File | Research Logic | Diff Lines |
|------|---------------|------------|
| verify-phase.md | `detect_research_phase` step + research verification context in `verify_truths` | 58 |
| discuss-phase.md | Complete rewrite for research approach (principal investigator framing, research gray areas) | 351 |
| new-project.md | Research project dimensions (landscape/questions/frameworks/debates), gsd-r-project-researcher agents, no "inherit" model profile | 200 |
| plan-phase.md | Research-aware planning, phase-researcher spawning | 182 |
| quick.md | Research-specific quick task handling | 228 |
| help.md | GSD-R-specific help text and command listing | 190 |
| new-milestone.md | Research milestone setup | 82 |
| update.md | GSD-R-specific update logic | 150 |
| execute-phase.md | Research-aware execution context | 63 |
| progress.md | Research-specific progress display | 58 |
| settings.md | GSD-R-specific settings (no inherit profile) | 55 |
| map-codebase.md | Research-aware codebase mapping | 24 |

**Files with namespace-only changes (straight overwrite + namespace fix):**

| File | Diff Lines | Notes |
|------|------------|-------|
| cleanup.md | 2 | Trivial |
| pause-work.md | 6 | Trivial |
| diagnose-issues.md | 6 | Trivial |
| add-todo.md | 10 | Small |
| list-phase-assumptions.md | 8 | Small |
| add-phase.md | 18 | Small |
| add-tests.md | 22 | Small |
| check-todos.md | 20 | Small |
| insert-phase.md | 16 | Small |
| remove-phase.md | 20 | Small |
| research-phase.md | 18 | Small |
| resume-project.md | 22 | Small |
| audit-milestone.md | 30 | Medium |
| complete-milestone.md | 24 | Medium |
| plan-milestone-gaps.md | 18 | Small |
| validate-phase.md | 26 | Small |
| verify-work.md | 41 | Medium |
| transition.md | 28 | Medium |
| health.md | 14 | Small |
| discovery-phase.md | 16 | Small |

**Excluded:**
| File | Reason |
|------|--------|
| execute-plan.md | Already synced in Phase 12 with rigor gates |
| set-profile.md (workflow) | GSD-R only, no upstream equivalent |

### Command File Classification

**New command files to create (4):**
- `autonomous.md` -- from `~/.claude/commands/gsd/autonomous.md`
- `stats.md` -- from `~/.claude/commands/gsd/stats.md`
- `ui-phase.md` -- from `~/.claude/commands/gsd/ui-phase.md`
- `ui-review.md` -- from `~/.claude/commands/gsd/ui-review.md`

Note: Upstream has no `node-repair.md` command file -- node-repair is invoked internally by execute-plan.md, not directly by users.

**GSD-R-only command files to keep (not overwrite):**
- `set-profile.md` -- GSD-R-specific (model profile selection)
- `join-discord.md` -- GSD-R community link

**Shared command files to overwrite (~30):**
All remaining files in `commands/gsd-r/` that have matching upstream equivalents at `~/.claude/commands/gsd/`. Most diffs are 4-16 lines (path references only). A few have larger diffs:
- `research-phase.md` (22 lines) -- may have GSD-R research context
- `complete-milestone.md` (16 lines)
- `debug.md` (16 lines) -- check if upstream has changes
- `new-project.md` (14 lines)
- `new-milestone.md` (14 lines)

**Command files with content changes beyond namespace:**
- `set-profile.md` -- GSD-R only, keep as-is (32 diff lines = completely different file)
- `research-phase.md` -- GSD-R has additional research context; after overwrite, check if research-specific content needs re-application
- `map-codebase.md` (12 lines) -- verify after overwrite

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Namespace transformation | Manual per-file editing | `sed` batch transformation script | 70+ files, error-prone by hand |
| Diff verification | Manual file-by-file comparison | `diff` against upstream after sync | Catches missed transformations |
| Research section extraction | Reading files and manually copying sections | `grep -n` for research markers then extract ranges | Consistent and repeatable |

**Key insight:** This is a batch operation. The planner should structure tasks to process files in groups, not individually. A sed-based transformation pipeline applied to all files is more reliable than manual editing of 70 files.

## Common Pitfalls

### Pitfall 1: Incomplete Namespace Transformation
**What goes wrong:** Files reference `gsd-tools.cjs` or `/gsd:` instead of GSD-R equivalents
**Why it happens:** Multiple patterns to replace, easy to miss one
**How to avoid:** After all sync work, run a comprehensive grep for remaining upstream references:
```bash
grep -rn "gsd-tools\.cjs\|/gsd:\|get-shit-done/\|gsd-tools\.cjs" get-shit-done-r/workflows/ commands/gsd-r/ get-shit-done-r/templates/copilot-instructions.md get-shit-done-r/templates/UI-SPEC.md
```
**Warning signs:** Any matches found by the above grep

### Pitfall 2: Agent Name Over-Replacement
**What goes wrong:** Replacing `gsd-` with `gsd-r-` in contexts where it shouldn't change (e.g., "gsd-tools" becomes "gsd-r-tools" correctly, but generic text like "the gsd framework" becomes mangled)
**Why it happens:** Broad regex matching
**How to avoid:** Only replace agent names in specific contexts: `subagent_type=`, `gsd-ui-researcher`, `gsd-ui-checker`, `gsd-ui-auditor`, `gsd-executor`, `gsd-verifier`, `gsd-codebase-mapper`, `gsd-debugger`, `gsd-project-researcher`, `gsd-phase-researcher`, `gsd-planner`
**Warning signs:** Grep for `gsd-r-r-` (double replacement) or broken prose

### Pitfall 3: Losing Research Logic During Overwrite
**What goes wrong:** Overwriting a file that has research-specific sections without re-applying them
**Why it happens:** Misclassifying a file as "namespace-only" when it actually has research customizations
**How to avoid:** The classification table above identifies all files with research logic. Before overwriting, the executor should extract the research sections. After overwriting, re-apply them.
**Warning signs:** verify-phase.md missing `detect_research_phase` step; discuss-phase.md using standard interview format instead of research framing

### Pitfall 4: Missing Files in Sync
**What goes wrong:** A workflow or command file exists upstream but isn't synced
**Why it happens:** New files added upstream that weren't in the original inventory
**How to avoid:** Final verification task diffs file lists:
```bash
diff <(ls ~/.claude/get-shit-done/workflows/ | sort) <(ls get-shit-done-r/workflows/ | sort)
diff <(ls ~/.claude/commands/gsd/ | sort) <(ls commands/gsd-r/ | sort)
```
**Warning signs:** Any files appearing in upstream but not in GSD-R (except intentional exclusions)

### Pitfall 5: Context Overflow During Execution
**What goes wrong:** Trying to read and transform too many files in one task exhausts context
**Why it happens:** 70+ files with some being 400+ lines
**How to avoid:** Split into focused plans. Group files by category (new vs overwrite, namespace-only vs research-customized). Each task should handle 5-10 files maximum.

### Pitfall 6: Hardcoded Path Format Inconsistency
**What goes wrong:** Upstream uses hardcoded `/Users/jeremiahwolf/.claude/get-shit-done/`, GSD-R uses `$HOME/.claude/get-shit-done-r/` -- but some GSD-R files use `~/.claude/get-shit-done-r/` (tilde) instead of `$HOME`
**Why it happens:** Inconsistent path conventions across the codebase
**How to avoid:** Standardize on `$HOME/.claude/get-shit-done-r/` for bash contexts and `~/.claude/get-shit-done-r/` for markdown reference contexts (like `@~/.claude/...`). Check existing GSD-R files for the established convention.
**Warning signs:** Mixed path formats in the same file

## Code Examples

### Namespace Transformation (verified from actual diffs)

**Workflow file transformation (e.g., cleanup.md):**
```bash
# Source: diff of upstream vs GSD-R cleanup.md
# FROM:
node "/Users/jeremiahwolf/.claude/get-shit-done/bin/gsd-tools.cjs" commit "chore: ..." --files ...
# TO:
node "$HOME/.claude/get-shit-done-r/bin/gsd-r-tools.cjs" commit "chore: ..." --files ...
```

**Command file transformation (e.g., add-phase.md):**
```bash
# Source: diff of upstream vs GSD-R add-phase.md
# FROM:
@/Users/jeremiahwolf/.claude/get-shit-done/workflows/add-phase.md
# TO:
@~/.claude/get-shit-done-r/workflows/add-phase.md

# FROM:
**Follow the add-phase workflow** from `@/Users/jeremiahwolf/.claude/get-shit-done/workflows/add-phase.md`.
# TO:
**Follow the add-phase workflow** from `@~/.claude/get-shit-done-r/workflows/add-phase.md`.
```

**Command file frontmatter transformation:**
```yaml
# FROM:
name: gsd:autonomous
# TO:
name: gsd-r:autonomous  # NOTE: Verify this is the correct pattern for GSD-R command names
```

### Research Section Re-application (verify-phase.md)

The research-specific sections to re-apply after overwrite:

```markdown
<!-- After step "load_context", insert new step: -->
<step name="detect_research_phase">
**Detect if this is a research phase** before establishing must-haves.
<!-- ... full detect_research_phase step content ... -->
</step>

<!-- In step "verify_truths", append after standard verification: -->
**Research phase additional context:** When `is_research_phase` is true, the verifier agent also receives:
1. **Research verification module reference:** `get-shit-done-r/bin/lib/verify-research.cjs`
2. **Research verification criteria:** `get-shit-done-r/references/research-verification.md`
3. **Research note inventory:** The `research_notes[]` array...
<!-- ... full research verification context ... -->
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual namespace fixing per file | Batch sed transformation | Phase 13 (new) | 70+ files can be transformed consistently |
| Individual file copy+edit | Overwrite + re-apply pattern | Phase 11 (state.cjs) | Cleaner sync, preserves upstream improvements |
| GSD-R discuss-phase as standard | Complete rewrite for research framing | v1.0 | discuss-phase.md is heavily customized -- 351 diff lines |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js assert (CJS) |
| Config file | None (direct node execution) |
| Quick run command | `node test/e2e.test.cjs` |
| Full suite command | `for f in test/*.test.cjs; do node "$f"; done` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EXEC-03 | node-repair.md workflow exists with namespace | smoke | `test -f get-shit-done-r/workflows/node-repair.md && grep -q "gsd-r-tools" get-shit-done-r/workflows/node-repair.md` | N/A (file check) |
| EXEC-04 | autonomous.md workflow exists with namespace | smoke | `test -f get-shit-done-r/workflows/autonomous.md && grep -q "gsd-r-tools" get-shit-done-r/workflows/autonomous.md` | N/A (file check) |
| EXEC-05 | stats.md workflow exists with namespace | smoke | `test -f get-shit-done-r/workflows/stats.md && grep -q "gsd-r-tools" get-shit-done-r/workflows/stats.md` | N/A (file check) |
| WKFL-01 | ui-phase.md and ui-review.md exist with namespace | smoke | `test -f get-shit-done-r/workflows/ui-phase.md && test -f get-shit-done-r/workflows/ui-review.md` | N/A (file check) |
| WKFL-02 | UI-SPEC.md and copilot-instructions.md templates exist | smoke | `test -f get-shit-done-r/templates/UI-SPEC.md && test -f get-shit-done-r/templates/copilot-instructions.md` | N/A (file check) |
| WKFL-03 | All shared workflows synced, no upstream namespace leaks | integration | `grep -rn "gsd-tools\.cjs" get-shit-done-r/workflows/ \| grep -v "gsd-r-tools" && echo FAIL \|\| echo PASS` | N/A (grep check) |
| WKFL-04 | All command files synced, no upstream namespace leaks | integration | `grep -rn "/gsd:" commands/gsd-r/ \| grep -v "/gsd-r:" && echo FAIL \|\| echo PASS` | N/A (grep check) |

### Sampling Rate
- **Per task commit:** File existence + namespace grep checks
- **Per wave merge:** Full namespace leak scan across all synced directories
- **Phase gate:** Zero upstream namespace references in any GSD-R file

### Wave 0 Gaps
None -- validation for this phase is file existence and grep-based namespace checking, which requires no test framework setup. The existing e2e.test.cjs can be run to confirm no regressions.

## Open Questions

1. **Command file frontmatter `name:` field convention**
   - What we know: Upstream uses `name: gsd:autonomous`, GSD-R commands use `name: gsd:add-phase` (not `gsd-r:`)
   - What's unclear: Whether GSD-R command frontmatter should use `gsd:` or `gsd-r:` in the `name:` field -- checking actual files shows GSD-R uses `gsd:add-phase` in frontmatter
   - Recommendation: Check existing GSD-R command files for the established pattern and follow it. This may be an intentional choice.

2. **Node-repair command file existence**
   - What we know: Upstream has no `node-repair.md` command file in `~/.claude/commands/gsd/` -- node-repair is internal to execute-plan
   - What's unclear: Whether CONTEXT.md's mention of "5 new command files" is accurate
   - Recommendation: Create only 4 new command files (autonomous, stats, ui-phase, ui-review). Note discrepancy.

3. **Path format convention ($HOME vs ~ vs hardcoded)**
   - What we know: Upstream uses hardcoded paths; GSD-R uses `$HOME` in bash and `~` in markdown references
   - What's unclear: Whether PATH-01 (Phase 14) will change this convention
   - Recommendation: Follow existing GSD-R patterns for now (Phase 14 handles path standardization)

## Sources

### Primary (HIGH confidence)
- Upstream workflow files at `~/.claude/get-shit-done/workflows/` -- all 38 files read and diffed
- Upstream command files at `~/.claude/commands/gsd/` -- all 36 files inventoried
- Upstream template files at `~/.claude/get-shit-done/templates/` -- copilot-instructions.md and UI-SPEC.md read
- GSD-R workflow files at `get-shit-done-r/workflows/` -- all 34 files diffed against upstream
- GSD-R command files at `commands/gsd-r/` -- all 32 files diffed against upstream
- Phase 13 CONTEXT.md -- locked decisions and canonical references

### Secondary (MEDIUM confidence)
- File classification (research vs namespace-only) based on diff analysis -- some borderline files may need closer inspection during execution

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - direct filesystem inspection of all source and target files
- Architecture: HIGH - patterns verified through actual diff analysis of existing synced files
- Pitfalls: HIGH - derived from observed patterns in 70+ file diffs
- File classification: MEDIUM - some files near the boundary may be misclassified; executor should verify before overwriting

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable -- upstream version is fixed at v1.24.0)
