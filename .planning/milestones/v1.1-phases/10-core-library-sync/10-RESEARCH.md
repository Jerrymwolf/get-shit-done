# Phase 10: Core Library Sync - Research

**Researched:** 2026-03-15
**Domain:** CommonJS module sync -- overwrite core.cjs with upstream v1.24.0, rewire MODEL_PROFILES import, add milestone scoping functions
**Confidence:** HIGH

## Summary

Phase 10 is a mechanical sync operation. The upstream core.cjs (at `~/.claude/get-shit-done/bin/lib/core.cjs`) has exactly 7 differences from the current GSD-R core.cjs (at `get-shit-done-r/bin/lib/core.cjs`). The diff is clean and well-bounded: remove the inline MODEL_PROFILES table, add an import from `./model-profiles.cjs`, add two new exported functions (`stripShippedMilestones`, `replaceInCurrentMilestone`), update `getRoadmapPhaseInternal` to use `stripShippedMilestones` and a flexible goal regex, add `inherit` profile pass-through to `resolveModelInternal`, and update `getMilestoneInfo`/`getMilestonePhaseFilter` to use the new stripping helper.

There is exactly one consumer that imports MODEL_PROFILES from core.cjs: `commands.cjs` line 7. This must be updated to import MODEL_PROFILES from `./model-profiles.cjs` instead. All other core.cjs consumers import only utility functions (not MODEL_PROFILES) and need no changes.

**Primary recommendation:** Copy upstream core.cjs wholesale, then make one adaptation: the import path must read `require('./model-profiles.cjs')` (matching the local module). Then update commands.cjs to import MODEL_PROFILES from model-profiles.cjs. Write targeted tests for the 3 new behaviors. Run full suite to confirm zero regressions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Remove inline MODEL_PROFILES from core.cjs entirely
- Import MODEL_PROFILES from `./model-profiles.cjs` (created in Phase 9)
- Drop MODEL_PROFILES from core.cjs exports -- consumers must import from model-profiles.cjs directly
- resolveModelInternal stays in core.cjs (matches upstream), imports MODEL_PROFILES from model-profiles.cjs
- Fix all existing consumers of `require('./core.cjs').MODEL_PROFILES` to use `require('./model-profiles.cjs').MODEL_PROFILES` in this phase
- Copy `stripShippedMilestones` and `replaceInCurrentMilestone` verbatim from upstream
- Wire stripShippedMilestones into `getRoadmapPhaseInternal`, `getMilestonePhaseFilter`, and `getMilestoneInfo` (matching upstream)
- Export both new functions from core.cjs
- Adopt upstream's flexible goal regex: `Goal(?:\*\*:|\*?\*?:\*\*)` instead of current rigid pattern
- Add `if (profile === 'inherit') return 'inherit';` to resolveModelInternal (matching upstream)
- Overwrite core.cjs with upstream's version wholesale, then verify import path is `./model-profiles.cjs` and no upstream-specific paths leak in
- Run existing test suite for regression
- Write new targeted tests for: stripShippedMilestones, replaceInCurrentMilestone, inherit profile handling

### Claude's Discretion
- Test file structure and assertion patterns for new tests
- Order of operations within the overwrite (copy-then-verify vs staged patches)
- Whether to add integration tests or keep unit-level only

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-02 | Update core.cjs with profile inheritance support (resolveModelInternal returns 'inherit') | Upstream diff shows exact change: add `if (profile === 'inherit') return 'inherit';` after profile extraction and `String(...).toLowerCase()` normalization |
| FOUN-03 | Add milestone scoping utilities to core.cjs (getMilestonePhaseFilter, stripShippedMilestones, replaceInCurrentMilestone) | Upstream has both functions verbatim. getMilestonePhaseFilter already exists in GSD-R but needs stripShippedMilestones wired in. stripShippedMilestones and replaceInCurrentMilestone are new additions |
| CORE-01 | Sync core.cjs with upstream v1.24.0 while preserving GSD-R-specific logic | Full diff analyzed below. GSD-R has NO unique logic in core.cjs beyond the inline MODEL_PROFILES (which gets removed). Wholesale overwrite is safe |
</phase_requirements>

## Exact Diff Analysis

The diff between GSD-R core.cjs and upstream core.cjs contains exactly these changes (verified by reading both files):

### Changes in upstream that GSD-R lacks

| # | Location | Change | Lines Affected |
|---|----------|--------|----------------|
| 1 | Line 8 | Add `const { MODEL_PROFILES } = require('./model-profiles.cjs');` | +1 |
| 2 | Lines 15-31 | Remove inline MODEL_PROFILES object | -17 |
| 3 | Lines 313-340 | Add `stripShippedMilestones()` and `replaceInCurrentMilestone()` functions | +28 |
| 4 | Line 351 | `getRoadmapPhaseInternal`: wrap content read with `stripShippedMilestones()` | ~1 |
| 5 | Line 364 | `getRoadmapPhaseInternal`: flexible goal regex `Goal(?:\*\*:\|\*?\*?:\*\*)` | ~1 |
| 6 | Line 389 | `resolveModelInternal`: `String(...).toLowerCase()` on profile | ~1 |
| 7 | Line 392 | `resolveModelInternal`: add `if (profile === 'inherit') return 'inherit';` | +1 |
| 8 | Line 429 | `getMilestoneInfo`: use `stripShippedMilestones()` instead of inline regex | ~1 |
| 9 | Line 457 | `getMilestonePhaseFilter`: use `stripShippedMilestones()` instead of raw read | ~1 |
| 10 | Exports | Remove `MODEL_PROFILES`, add `stripShippedMilestones`, `replaceInCurrentMilestone` | ~3 |

### GSD-R-specific code in core.cjs

**None.** The only GSD-R difference is the inline MODEL_PROFILES table (which uses `gsd-r-*` prefixed agent names). This table is being moved to model-profiles.cjs (already done in Phase 9). The rest of core.cjs is identical to upstream. This makes the wholesale overwrite safe.

## Consumer Impact Analysis

### MODEL_PROFILES consumers that need updating

| File | Current Import | Required Change |
|------|---------------|-----------------|
| `get-shit-done-r/bin/lib/commands.cjs` (line 7) | `MODEL_PROFILES` from `./core.cjs` | Import `MODEL_PROFILES` from `./model-profiles.cjs` instead |

**Only one file needs updating.** All other core.cjs consumers import only utility functions.

### commands.cjs MODEL_PROFILES usage (line 209)

```javascript
const agentModels = MODEL_PROFILES[agentType];
const result = agentModels
  ? { model, profile }
  : { model, profile, unknown_agent: true };
```

This is a simple lookup -- no API change needed. Just change the import source.

### New exports consumers can use (but no existing code needs them yet)

- `stripShippedMilestones(content)` -- available for future milestone-aware operations
- `replaceInCurrentMilestone(content, pattern, replacement)` -- available for future roadmap writes

## Architecture Patterns

### Recommended Approach: Wholesale Overwrite

1. Copy upstream `~/.claude/get-shit-done/bin/lib/core.cjs` to `get-shit-done-r/bin/lib/core.cjs`
2. Verify the import reads `require('./model-profiles.cjs')` (it already does -- upstream uses the same relative path)
3. Update `commands.cjs` line 7 to import MODEL_PROFILES from `./model-profiles.cjs`
4. Run full test suite
5. Write new targeted tests

### Why wholesale overwrite is safe

- GSD-R core.cjs has zero unique functions beyond the inline MODEL_PROFILES
- Every utility function (loadConfig, findPhaseInternal, etc.) is identical between upstream and GSD-R
- The MODEL_PROFILES import path `./model-profiles.cjs` is already correct in upstream (same relative path convention)

### Anti-Patterns to Avoid
- **Cherry-picking individual changes:** The diff is small enough that wholesale overwrite is simpler and less error-prone than applying 10 individual patches
- **Keeping MODEL_PROFILES in core.cjs alongside the import:** The decision is to remove it entirely and import from model-profiles.cjs

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Milestone content stripping | Custom regex per call site | `stripShippedMilestones()` | Already duplicated inline in GSD-R's getMilestoneInfo -- upstream extracted it into a reusable function |
| Current-milestone-only replacement | Manual string slicing | `replaceInCurrentMilestone()` | Edge cases around missing `</details>` tags are already handled |
| Goal regex variations | Per-site regex | Upstream's flexible pattern | Handles `**Goal:**`, `**Goal**:`, and other markdown variations |

## Common Pitfalls

### Pitfall 1: Forgetting the commands.cjs consumer update
**What goes wrong:** After removing MODEL_PROFILES from core.cjs exports, commands.cjs throws `undefined` when resolving models
**Why it happens:** The import still references core.cjs
**How to avoid:** Update commands.cjs line 7 to add a second require for model-profiles.cjs
**Warning signs:** `cmdResolveModel` returns `unknown_agent: true` for all agents

### Pitfall 2: Upstream path leak in import
**What goes wrong:** core.cjs tries to import from a path that doesn't exist in GSD-R
**Why it happens:** Upstream uses the same `./model-profiles.cjs` relative path, so this is actually NOT a risk here
**How to avoid:** Verify after overwrite that `require('./model-profiles.cjs')` resolves correctly
**Warning signs:** `MODULE_NOT_FOUND` error on require

### Pitfall 3: Test regression from stripShippedMilestones integration
**What goes wrong:** getRoadmapPhaseInternal, getMilestonePhaseFilter, or getMilestoneInfo return different results
**Why it happens:** stripShippedMilestones removes `<details>` blocks that might contain phase data
**How to avoid:** Run full test suite (151 tests currently passing). The existing tests should catch regressions since GSD-R's ROADMAP.md uses the same `<details>` format
**Warning signs:** Phase lookup or milestone info tests fail

### Pitfall 4: Missing String().toLowerCase() on profile
**What goes wrong:** Profile comparison fails for mixed-case config values
**Why it happens:** GSD-R's current code does `config.model_profile || 'balanced'` without normalization
**How to avoid:** The wholesale overwrite includes the `String(...).toLowerCase()` fix automatically

## Code Examples

### stripShippedMilestones (verbatim from upstream)
```javascript
// Source: ~/.claude/get-shit-done/bin/lib/core.cjs lines 323-325
function stripShippedMilestones(content) {
  return content.replace(/<details>[\s\S]*?<\/details>/gi, '');
}
```

### replaceInCurrentMilestone (verbatim from upstream)
```javascript
// Source: ~/.claude/get-shit-done/bin/lib/core.cjs lines 332-341
function replaceInCurrentMilestone(content, pattern, replacement) {
  const lastDetailsClose = content.lastIndexOf('</details>');
  if (lastDetailsClose === -1) {
    return content.replace(pattern, replacement);
  }
  const offset = lastDetailsClose + '</details>'.length;
  const before = content.slice(0, offset);
  const after = content.slice(offset);
  return before + after.replace(pattern, replacement);
}
```

### resolveModelInternal inherit support (from upstream)
```javascript
// Source: ~/.claude/get-shit-done/bin/lib/core.cjs lines 389-394
const profile = String(config.model_profile || 'balanced').toLowerCase();
const agentModels = MODEL_PROFILES[agentType];
if (!agentModels) return 'sonnet';
if (profile === 'inherit') return 'inherit';
const resolved = agentModels[profile] || agentModels['balanced'] || 'sonnet';
return resolved === 'opus' ? 'inherit' : resolved;
```

### Flexible goal regex (from upstream)
```javascript
// Source: ~/.claude/get-shit-done/bin/lib/core.cjs line 364
const goalMatch = section.match(/\*\*Goal(?:\*\*:|\*?\*?:\*\*)\s*([^\n]+)/i);
```

### commands.cjs consumer fix
```javascript
// Before (line 7):
const { ..., MODEL_PROFILES, ... } = require('./core.cjs');

// After (line 7-8):
const { ..., /* remove MODEL_PROFILES */ ... } = require('./core.cjs');
const { MODEL_PROFILES } = require('./model-profiles.cjs');
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | node:test (built-in, Node.js) |
| Config file | none -- uses default node:test discovery |
| Quick run command | `node --test test/model-profiles.test.cjs` |
| Full suite command | `node --test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUN-02 | resolveModelInternal returns 'inherit' when profile is 'inherit' | unit | `node --test test/core.test.cjs` | No -- Wave 0 |
| FOUN-03a | stripShippedMilestones removes `<details>` blocks | unit | `node --test test/core.test.cjs` | No -- Wave 0 |
| FOUN-03b | replaceInCurrentMilestone only replaces after last `</details>` | unit | `node --test test/core.test.cjs` | No -- Wave 0 |
| FOUN-03c | getMilestonePhaseFilter uses stripShippedMilestones | unit | `node --test test/core.test.cjs` | No -- Wave 0 |
| CORE-01 | All 151 existing tests pass after overwrite | regression | `node --test` | Yes -- all existing test files |

### Sampling Rate
- **Per task commit:** `node --test`
- **Per wave merge:** `node --test`
- **Phase gate:** Full suite green (151+ tests) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `test/core.test.cjs` -- new file covering FOUN-02 (inherit profile), FOUN-03 (stripShippedMilestones, replaceInCurrentMilestone, flexible goal regex)
- Framework install: not needed (node:test is built-in)

### Recommended Test Structure for core.test.cjs

```javascript
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  stripShippedMilestones,
  replaceInCurrentMilestone,
  resolveModelInternal,
  getRoadmapPhaseInternal,
  getMilestonePhaseFilter,
} = require('../get-shit-done-r/bin/lib/core.cjs');

describe('stripShippedMilestones', () => {
  it('removes <details> blocks', () => { /* ... */ });
  it('handles content with no details blocks', () => { /* ... */ });
  it('removes multiple details blocks', () => { /* ... */ });
});

describe('replaceInCurrentMilestone', () => {
  it('replaces only after last </details>', () => { /* ... */ });
  it('replaces everywhere when no details blocks', () => { /* ... */ });
});

describe('resolveModelInternal - inherit', () => {
  it('returns inherit when profile is inherit', () => { /* ... */ });
});
```

Unit-level tests are sufficient -- no integration tests needed since these are pure functions with no side effects (except resolveModelInternal which reads config, and can be tested with a temp directory).

## Open Questions

None. The diff is fully analyzed, the consumer impact is bounded to one file, and the overwrite strategy is straightforward.

## Sources

### Primary (HIGH confidence)
- Upstream core.cjs: `~/.claude/get-shit-done/bin/lib/core.cjs` -- read in full, 507 lines
- GSD-R core.cjs: `get-shit-done-r/bin/lib/core.cjs` -- read in full, 493 lines
- GSD-R model-profiles.cjs: `get-shit-done-r/bin/lib/model-profiles.cjs` -- read in full, 73 lines
- Upstream model-profiles.cjs: `~/.claude/get-shit-done/bin/lib/model-profiles.cjs` -- read in full, 69 lines
- Diff analysis: direct line-by-line comparison of both core.cjs files
- Consumer grep: searched all .cjs files for MODEL_PROFILES and core.cjs imports
- Full test suite: 151 tests passing in 114ms

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, CommonJS only, node:test for testing
- Architecture: HIGH - wholesale overwrite confirmed safe by diff analysis showing zero GSD-R-specific logic
- Pitfalls: HIGH - only 1 consumer needs updating, verified by grep

**Research date:** 2026-03-15
**Valid until:** stable -- this is a one-time sync operation against a fixed upstream version (v1.24.0)
