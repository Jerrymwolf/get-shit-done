# Phase 11: State, Commands, and Remaining Modules - Research

**Researched:** 2026-03-15
**Domain:** CommonJS module sync -- state.cjs, commands.cjs, gsd-r-tools.cjs upstream merge
**Confidence:** HIGH

## Summary

Phase 11 syncs three files with upstream v1.24.0: state.cjs (highest complexity -- research functions must survive), commands.cjs (straightforward overwrite + MODEL_PROFILES fix), and gsd-r-tools.cjs (routing additions). The research functions in state.cjs represent ~270 lines of GSD-R-specific code that must be appended after the upstream wholesale copy. CORE-04 (install.js) is N/A per user decision.

All three upstream files have been read and diffed against their GSD-R counterparts. The differences are well-understood and the merge strategy is low-risk given the Phase 10 pattern of wholesale overwrite + selective re-application. The primary risk is the `gsd_state_version` -> `gsd_r_state_version` adaptation in upstream's `buildStateFrontmatter` function -- a single-line change that is easy to miss.

**Primary recommendation:** Follow the same wholesale-overwrite-then-append pattern established in Phase 10. Process state.cjs first (highest risk), then commands.cjs, then gsd-r-tools.cjs. Run `node --test` after each file change.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Overwrite state.cjs with upstream wholesale, then append the 6 research functions at the end
- Research functions to preserve: `ensureStateSections`, `cmdStateAddNote`, `cmdStateUpdateNoteStatus`, `cmdStateGetNotes`, `cmdStateAddGap`, `cmdStateResolveGap`, `cmdStateGetGaps`
- Keep `ensureStateSections` as a standalone function (research functions call it before operating on STATE.md)
- All 6 research functions stay inline in state.cjs after the upstream code -- no extraction to separate module
- Clean separation: upstream code first, then a `// === GSD-R Research Extensions ===` comment block, then research functions
- Keep `gsd_r_state_version` as the frontmatter key (not upstream's `gsd_state_version`)
- Any upstream code that reads `gsd_state_version` needs adaptation to use `gsd_r_state_version`
- Wholesale overwrite commands.cjs with upstream v1.24.0
- Re-apply the MODEL_PROFILES import fix from Phase 10 (`require('./model-profiles.cjs')` instead of inline)
- Copy `cmdStats` as-is from upstream -- no research-specific extensions in this phase
- GSD-R commands.cjs has no research-specific functions, making wholesale overwrite safe
- Overwrite gsd-r-tools.cjs with upstream to get new routes (stats, scaffold improvements)
- Verify GSD-R-specific routes (if any) are preserved after overwrite
- Skip CORE-04 entirely -- upstream has no bin/install.js, GSD-R's installer is fork-specific infrastructure
- Mark CORE-04 as N/A in requirements tracking
- Run `node --test` after every task commit
- Write new targeted tests for upstream additions to state.cjs
- CORE-05: all existing tests must pass
- Fix forward on failures

### Claude's Discretion
- Exact placement of research functions within state.cjs (after which upstream function)
- Whether gsd-r-tools.cjs has GSD-R-specific routes that need preservation (researcher determines via diff)
- Which specific upstream state.cjs functions changed and need new test coverage
- Adaptation approach for `gsd_r_state_version` vs `gsd_state_version` references in upstream code

### Deferred Ideas (OUT OF SCOPE)
- Research-specific stats extensions for cmdStats (note count, source coverage, source gaps) -- future phase after EXEC-05
- install.js modernization -- separate effort if needed
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CORE-02 | Sync state.cjs with upstream v1.24.0 while preserving Note Status and Source Gaps functions | Detailed diff analysis below identifies exact changes; overwrite + append strategy verified |
| CORE-03 | Sync commands/routing with upstream (add new CLI subcommands for stats, autonomous, etc.) | Diff shows commands.cjs gains `cmdStats`; gsd-r-tools.cjs gains `stats` and `config-set-model-profile` routes |
| CORE-04 | Sync install.js with upstream changes | N/A per user decision -- upstream has no install.js equivalent |
| CORE-05 | All existing tests pass against merged code | Current suite: 160 tests, 44 suites, all passing. Test map below |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| node:test | Node.js built-in | Test runner | Zero-dependency, already used for 160 tests |
| node:assert/strict | Node.js built-in | Test assertions | Strict mode, already established |
| node:fs, node:path | Node.js built-in | File ops | Only allowed dependencies per project convention |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| frontmatter.cjs | local | YAML frontmatter parse/reconstruct | Used by state.cjs for STATE.md sync |
| model-profiles.cjs | local (Phase 9) | MODEL_PROFILES constant | Imported by commands.cjs |
| core.cjs | local (Phase 10) | Shared utilities (escapeRegex, loadConfig, etc.) | Imported by state.cjs and commands.cjs |

## Architecture Patterns

### File Merge Pattern (established in Phase 10)
```
1. Copy upstream file wholesale into GSD-R location
2. Apply known adaptations (frontmatter key, import fixes)
3. Append GSD-R-specific extensions after separator comment
4. Run tests
5. Fix forward on any failures
```

### state.cjs Structure After Merge
```
state.cjs (target: ~990 lines, 21 exports)
├── Upstream code (lines 1-705)           # Wholesale from upstream
│   ├── imports (core.cjs, frontmatter.cjs)
│   ├── stateExtractField (shared helper)  # Uses escapeRegex from core
│   ├── cmdStateLoad, cmdStateGet, etc.    # 15 upstream functions
│   ├── State Progression Engine           # advance, record, progress, etc.
│   ├── State Frontmatter Sync             # buildStateFrontmatter (ADAPT: gsd_r_state_version)
│   └── module.exports = { ... 16 exports }  # WILL BE REPLACED
├── // === GSD-R Research Extensions ===   # Separator comment
├── Research code (lines ~706-~970)        # Appended from current GSD-R
│   ├── VALID_NOTE_STATUSES constant
│   ├── NOTE_STATUS_SECTION, SOURCE_GAPS_SECTION templates
│   ├── ensureStateSections
│   ├── parseTableSection, rebuildTableSection (helpers)
│   ├── cmdStateAddNote, cmdStateUpdateNoteStatus, cmdStateGetNotes
│   ├── cmdStateAddGap, cmdStateResolveGap, cmdStateGetGaps
│   └── module.exports = { ...16 upstream + 7 research exports }  # MERGED
```

### commands.cjs Structure After Merge
```
commands.cjs (target: ~667 lines, 13 exports)
├── imports: core.cjs, model-profiles.cjs, frontmatter.cjs
│   └── ADAPT: ensure MODEL_PROFILES import uses require('./model-profiles.cjs')
├── All upstream functions (cmdGenerateSlug through cmdStats)
│   └── NEW: cmdStats function (upstream addition)
└── module.exports = { ...13 exports including cmdStats }
```

### gsd-r-tools.cjs Routing After Merge
```
gsd-r-tools.cjs (target: ~700 lines)
├── imports: core, state, phase, roadmap, verify, config, template,
│            milestone, commands, init, frontmatter
│   └── KEEP: planCheckerRules, bootstrap (GSD-R-only imports)
├── CLI router with all upstream routes
│   ├── NEW from upstream: 'stats' route -> commands.cmdStats
│   ├── NEW from upstream: 'config-set-model-profile' route
│   ├── KEEP: 'verify research-plan' sub-route (GSD-R-only)
│   ├── KEEP: 'bootstrap generate' route (GSD-R-only)
│   └── KEEP: state sub-routes for add-note, update-note-status,
│             get-notes, add-gap, resolve-gap, get-gaps (GSD-R-only)
```

## Detailed Diff Analysis

### state.cjs: Upstream vs GSD-R (Claude's Discretion Items)

**1. Duplicate `stateExtractField` function (CRITICAL)**
GSD-R state.cjs has TWO definitions of `stateExtractField`:
- Lines 12-20: Uses `escapeRegex` from core.cjs import
- Lines 184-194: Uses inline `fieldName.replace(...)` regex escape

Upstream has the same pattern -- one at line 12 (shared helper using escapeRegex) and one at line 184 (in Progression Engine section). The function at line 12 wins at runtime (second is dead code in the same scope, but redeclared). After wholesale copy, this duplication carries forward from upstream. No action needed -- it's upstream's code.

**2. `buildStateFrontmatter` key change (line 642)**
- Upstream: `const fm = { gsd_state_version: '1.0' };`
- GSD-R:    `const fm = { gsd_r_state_version: '1.0' };`

**Adaptation:** Change this single line after wholesale copy. This is the ONLY place in state.cjs where the frontmatter key name appears. The key is written to STATE.md frontmatter, and existing tests check for `gsd_r_state_version`.

**3. `cmdStateUpdateProgress` milestone scoping**
- Upstream (line 280-286): Uses `getMilestonePhaseFilter(cwd)` to scope to current milestone
- GSD-R current: Does NOT use milestone filter (counts all phases)

After wholesale overwrite, GSD-R gets the upstream version with milestone scoping. This is correct -- upstream improvement.

**4. Functions that changed between GSD-R's base and upstream v1.24.0:**
After comparing both files function by function:
- `cmdStateUpdateProgress`: Gained milestone scoping (filter to current milestone phases)
- All other shared functions: Identical between upstream and current GSD-R

**New test coverage needed:** `cmdStateUpdateProgress` with milestone-scoped progress (test that only current milestone phases are counted).

### commands.cjs: Upstream vs GSD-R

**1. New function: `cmdStats` (upstream lines 536-651)**
- Provides project statistics: phase counts, plan counts, requirements stats, git commit stats
- Supports `json` and `table` output formats
- Uses `execGit` for git stats (commit count, first commit date)
- Reads REQUIREMENTS.md for requirement completion stats

**2. Import differences:**
- Upstream line 8: `const { extractFrontmatter } = require('./frontmatter.cjs');`
- Upstream line 9: `const { MODEL_PROFILES } = require('./model-profiles.cjs');`
- GSD-R line 8: `const { MODEL_PROFILES } = require('./model-profiles.cjs');`
- GSD-R line 9: `const { extractFrontmatter } = require('./frontmatter.cjs');`

Import order differs but both are present. After wholesale overwrite, upstream order is fine.

**3. `execGit` usage in `cmdStats`:**
Upstream `cmdStats` calls `execGit(cwd, ...)` differently than how `cmdCommit` uses it. In `cmdCommit`, `execGit` returns `{ exitCode, stdout, stderr }`. In `cmdStats` (upstream line 601-604), `execGit` return value is used directly as a string (`.trim()`), which suggests upstream may have changed `execGit` behavior OR there's a bug. Need to verify GSD-R's `execGit` signature.

**Verified:** In core.cjs, `execGit` returns `{ exitCode, stdout, stderr }` object. Upstream cmdStats line 601 does `const commitCount = execGit(cwd, ['rev-list', '--count', 'HEAD']); gitCommits = parseInt(commitCount.trim(), 10)`. This would fail because `.trim()` on an object returns `"[object Object]"`. However, looking more carefully at upstream core.cjs, `execGit` may return the stdout string directly in some cases. **This needs verification during implementation** -- if GSD-R core.cjs `execGit` returns an object, `cmdStats` will need adaptation to use `.stdout.trim()`.

### gsd-r-tools.cjs: Upstream vs GSD-R (Discretion: GSD-R-specific routes)

**GSD-R-specific routes that MUST be preserved after upstream overwrite:**

1. **`verify research-plan` sub-route** (lines 403-423): Routes to `planCheckerRules.validateResearchPlan`
2. **`bootstrap generate` route** (lines 429-452): Routes to `bootstrap.generateBootstrap`
3. **State research sub-routes** (lines 264-303):
   - `state add-note`
   - `state update-note-status`
   - `state get-notes`
   - `state add-gap`
   - `state resolve-gap`
   - `state get-gaps`

**Routes upstream has that GSD-R lacks:**
1. **`stats` route** (lines 496-499): `commands.cmdStats(cwd, subcommand, raw)`
2. **`config-set-model-profile` route** (lines 380-383): `config.cmdConfigSetModelProfile(cwd, args[1], raw)`

**GSD-R-specific imports that MUST be preserved:**
- `const planCheckerRules = require('./lib/plan-checker-rules.cjs');`
- `const bootstrap = require('./lib/bootstrap.cjs');`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frontmatter key adaptation | Manual search/replace across file | Single-line change at line 642 of upstream | Only one occurrence in state.cjs |
| Export merging | Complex module.exports merge logic | Replace upstream's exports with combined list | Straightforward append to exports object |
| CLI route merging | Diff-based patching | Upstream wholesale + append GSD-R blocks | Cleaner, less error-prone than diffing routers |

## Common Pitfalls

### Pitfall 1: Missing `gsd_r_state_version` Adaptation
**What goes wrong:** Upstream's `buildStateFrontmatter` writes `gsd_state_version` to STATE.md frontmatter, breaking existing tests and hooks that read `gsd_r_state_version`.
**Why it happens:** It is a single-line difference buried in a 700-line file.
**How to avoid:** After wholesale copy, search for `gsd_state_version` in the file and change to `gsd_r_state_version`. Verify with `grep gsd_state_version get-shit-done-r/bin/lib/state.cjs`.
**Warning signs:** Tests fail with "gsd_r_state_version not found in frontmatter" or STATE.md frontmatter has wrong key.

### Pitfall 2: Forgetting to Merge module.exports
**What goes wrong:** Upstream's `module.exports` at line 706 only exports 16 functions. Research functions are appended but never exported.
**Why it happens:** Wholesale copy includes upstream's module.exports, and the appended research code's module.exports is ignored (only last assignment wins, but it comes after upstream's).
**How to avoid:** Replace upstream's `module.exports` block with a combined block that includes all 21+ exports. Or position the final `module.exports` at the very end of the file after all research functions.
**Warning signs:** Tests importing research functions get "undefined" errors.

### Pitfall 3: `execGit` Return Type Mismatch in cmdStats
**What goes wrong:** Upstream's `cmdStats` may call `execGit` expecting string return, but GSD-R's `execGit` returns `{ exitCode, stdout, stderr }`.
**Why it happens:** Upstream may have changed `execGit` in their core.cjs but GSD-R already synced core.cjs in Phase 10.
**How to avoid:** Check how `cmdStats` uses `execGit` return values. If it does `.trim()` directly, change to `.stdout.trim()`.
**Warning signs:** Stats command outputs NaN for git commits or throws at runtime.

### Pitfall 4: GSD-R Routes Lost in gsd-r-tools.cjs Overwrite
**What goes wrong:** Upstream wholesale overwrite of gsd-r-tools.cjs drops the 6 research state sub-routes, verify research-plan route, and bootstrap route.
**Why it happens:** These routes exist only in GSD-R, not upstream.
**How to avoid:** After overwrite, re-add: (a) planCheckerRules + bootstrap imports, (b) state research sub-routes in state case block, (c) verify research-plan in verify case block, (d) bootstrap case block. Add stats and config-set-model-profile from upstream.
**Warning signs:** CLI commands like `state add-note` or `verify research-plan` fail with "unknown subcommand."

### Pitfall 5: Duplicate stateExtractField Not Causing Issues
**What goes wrong:** Nothing -- but it looks like a bug. Both upstream and GSD-R have two definitions.
**Why it happens:** Upstream's architecture has a shared helper at top and a re-declaration in the progression engine section.
**How to avoid:** Leave as-is (upstream's code). The second declaration shadows the first in the progression engine section scope. Both implementations are functionally identical.
**Warning signs:** None -- this is a non-issue but worth documenting to prevent unnecessary "cleanup."

## Code Examples

### Frontmatter Key Adaptation (state.cjs line 642)
```javascript
// BEFORE (upstream):
const fm = { gsd_state_version: '1.0' };

// AFTER (GSD-R adaptation):
const fm = { gsd_r_state_version: '1.0' };
```

### Research Functions Separator and Append Pattern
```javascript
// End of upstream code (line ~705):
// (upstream module.exports removed -- will be at end of file)

// === GSD-R Research Extensions ===
// Note Status and Source Gaps operations for research workflow.
// These functions are GSD-R-specific and have no upstream equivalent.

const VALID_NOTE_STATUSES = ['draft', 'reviewed', 'final', 'source-incomplete'];
// ... (paste from current GSD-R state.cjs lines 706-945)

// Combined exports: upstream (16) + research (7) = 23 total
module.exports = {
  // Upstream exports
  stateExtractField,
  stateReplaceField,
  writeStateMd,
  cmdStateLoad,
  cmdStateGet,
  cmdStatePatch,
  cmdStateUpdate,
  cmdStateAdvancePlan,
  cmdStateRecordMetric,
  cmdStateUpdateProgress,
  cmdStateAddDecision,
  cmdStateAddBlocker,
  cmdStateResolveBlocker,
  cmdStateRecordSession,
  cmdStateSnapshot,
  cmdStateJson,
  // GSD-R Research extensions
  ensureStateSections,
  cmdStateAddNote,
  cmdStateUpdateNoteStatus,
  cmdStateGetNotes,
  cmdStateAddGap,
  cmdStateResolveGap,
  cmdStateGetGaps,
};
```

### cmdStats execGit Adaptation (if needed)
```javascript
// If GSD-R execGit returns { exitCode, stdout, stderr }:
const commitCountResult = execGit(cwd, ['rev-list', '--count', 'HEAD']);
gitCommits = parseInt(commitCountResult.stdout.trim(), 10) || 0;
const firstDateResult = execGit(cwd, ['log', '--reverse', '--format=%as', '--max-count=1']);
gitFirstCommitDate = firstDateResult.stdout.trim() || null;
```

### gsd-r-tools.cjs: Adding stats Route
```javascript
case 'stats': {
  const subcommand = args[1] || 'json';
  commands.cmdStats(cwd, subcommand, raw);
  break;
}
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | node:test (Node.js built-in) |
| Config file | none -- uses `node --test` convention |
| Quick run command | `node --test` |
| Full suite command | `node --test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CORE-02 | state.cjs exports 21 functions, research functions work after merge | unit | `node --test test/state.test.cjs` | Yes |
| CORE-02 | gsd_r_state_version frontmatter key preserved | unit | `node --test test/state.test.cjs` | Yes (fixture uses it) |
| CORE-02 | cmdStateUpdateProgress with milestone scoping | unit | `node --test test/state.test.cjs` | No -- Wave 0 |
| CORE-03 | cmdStats produces valid output | unit | `node --test test/state.test.cjs` | No -- Wave 0 |
| CORE-03 | stats CLI route dispatches correctly | integration | `node --test test/e2e.test.cjs` | Partial |
| CORE-04 | N/A | N/A | N/A | N/A |
| CORE-05 | All 160+ existing tests pass | regression | `node --test` | Yes |

### Sampling Rate
- **Per task commit:** `node --test`
- **Per wave merge:** `node --test` (same -- single suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `test/state.test.cjs` -- add test for export count (21 functions) to verify merge completeness
- [ ] `test/state.test.cjs` -- add test for `cmdStateUpdateProgress` milestone scoping
- [ ] Test for `cmdStats` basic output (can be added to state or e2e tests)
- [ ] Verify `gsd_r_state_version` appears in frontmatter after write (existing fixture already uses it but explicit assertion is good)

## Open Questions

1. **`execGit` return type in `cmdStats`**
   - What we know: GSD-R core.cjs `execGit` returns `{ exitCode, stdout, stderr }`. Upstream cmdStats may expect string return.
   - What's unclear: Whether upstream changed `execGit` signature or if cmdStats has a latent bug.
   - Recommendation: During implementation, check cmdStats lines that call execGit. If they do `.trim()` directly, adapt to `.stdout.trim()`. This is a quick fix.

2. **`config-set-model-profile` route dependency**
   - What we know: Upstream gsd-tools.cjs has this route calling `config.cmdConfigSetModelProfile`.
   - What's unclear: Whether GSD-R's config.cjs has this function (it was not synced in Phase 10/11).
   - Recommendation: Check if `config.cjs` exports `cmdConfigSetModelProfile`. If not, skip this route or stub it. This is low priority -- can be addressed in a later phase.

## Sources

### Primary (HIGH confidence)
- Direct file reads of upstream `~/.claude/get-shit-done/bin/lib/state.cjs` (723 lines)
- Direct file reads of upstream `~/.claude/get-shit-done/bin/lib/commands.cjs` (667 lines)
- Direct file reads of upstream `~/.claude/get-shit-done/bin/gsd-tools.cjs` (603 lines)
- Direct file reads of GSD-R `get-shit-done-r/bin/lib/state.cjs` (971 lines)
- Direct file reads of GSD-R `get-shit-done-r/bin/lib/commands.cjs` (549 lines)
- Direct file reads of GSD-R `get-shit-done-r/bin/gsd-r-tools.cjs` (697 lines)
- Direct file reads of `test/state.test.cjs` (411 lines, 160 tests passing)

### Secondary (MEDIUM confidence)
- Phase 10 CONTEXT.md patterns (wholesale overwrite strategy)
- STATE.md project decisions about merge approach

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all files directly read, no external libraries
- Architecture: HIGH - diff analysis performed line-by-line on all three file pairs
- Pitfalls: HIGH - identified from actual code differences, not theoretical

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable -- upstream v1.24.0 is fixed target)
