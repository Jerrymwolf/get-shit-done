# Phase 27: Research-Native Command Vocabulary - Research

**Researched:** 2026-03-23
**Domain:** File renaming + bulk cross-reference replacement (markdown command/workflow/agent files)
**Confidence:** HIGH

## Summary

This phase renames 6 core command files from PM-style names to research-native equivalents and updates 275 cross-references across commands, agents, workflows, README.md, and docs/DESIGN.md. The rename spec (docs/GRD-Rename-Spec.md section 2.1-2.4) provides exact file-by-file mapping tables. The toolchain (grd-tools.cjs) and tests are already updated to new names from Phase 26 work.

The key technical challenge is the two-pass replacement strategy: Pass 1 replaces `/grd:`-prefixed command invocations (unambiguous, safe for bulk sed). Pass 2 replaces bare identifiers in 17 workflow files (context-sensitive -- must distinguish command identifiers from English prose). Both old and new command files currently coexist in `commands/grd/`; the old files must be deleted after cross-references are updated.

**Primary recommendation:** Execute as git mv (rename) + bulk sed for `/grd:` prefixed patterns + manual/context-aware replacement for bare workflow identifiers + delete old files + verify with grep.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Rename 6 files via `git mv` in `commands/grd/`: new-project->new-research, discuss-phase->scope-inquiry, plan-phase->plan-inquiry, execute-phase->conduct-inquiry, verify-work->verify-inquiry, complete-milestone->complete-study
- **D-02:** Two-pass approach: (1) Replace `/grd:old-name` -> `/grd:new-name` across all files, (2) Context-aware replacement of bare identifiers in workflow files
- **D-03:** The 6 `/grd:` prefixed replacement patterns are defined (see CONTEXT.md)
- **D-04:** 17 workflow files contain bare command names needing context-aware replacement
- **D-05:** Spec section 2.3B provides the verified 17-file list -- use directly, no re-discovery
- **D-06:** Two test runs: (1) after file renames, (2) after all cross-reference updates
- **D-07:** help.md and autonomous.md show only new names -- no transition period
- **D-08:** `gsd-ui-researcher` and `gsd-ui-checker` agent names in ui-phase.md are upstream GSD agents -- keep as-is

### Claude's Discretion
- Exact commit granularity (per-file-rename vs batched)
- Order of cross-reference updates within each file category
- Whether to combine the two passes (prefixed + bare) or keep them strictly sequential

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CMD-01 | 6 command files renamed | git mv for the 6 files; old files coexist currently -- `git mv` will overwrite since new files already exist (need `git rm` old + keep new instead) |
| CMD-02 | Cross-references updated in all 34 command files | 275 total `/grd:`-prefixed refs across all target scopes; sed replacement is safe |
| CMD-03 | Cross-references updated in 17 workflow files (context-sensitive) | Bare identifiers verified in spec section 2.3B; context-aware manual replacement needed |
| CMD-04 | Cross-references updated in 16 agent files | Agent files use `/grd:` prefix exclusively; same sed patterns as CMD-02 |
| CMD-05 | Old command filenames no longer exist in `commands/grd/` | `git rm` the 6 old files after cross-refs updated |
| CMD-06 | All tests pass after vocabulary update | Tests already reference new names (514 tests pass); no test changes needed |
</phase_requirements>

## Standard Stack

No external libraries needed. This phase is purely file operations (rename, search-replace) on markdown files.

### Tools Used
| Tool | Purpose | Why |
|------|---------|-----|
| `git mv` / `git rm` | File rename and deletion | Preserves git history |
| `sed` | Bulk `/grd:`-prefixed pattern replacement | Unambiguous patterns, safe for bulk ops |
| `grep` | Verification of zero remaining old refs | Phase success criteria check |
| `npm test` | Test suite validation | 514 tests, all must pass |

## Architecture Patterns

### Current State (Important Discovery)

Both old AND new command files already exist in `commands/grd/`:

| Old File | Lines | New File | Lines | Status |
|----------|-------|----------|-------|--------|
| `new-project.md` | 42 | `new-research.md` | 42 | Both exist, different content |
| `discuss-phase.md` | 90 | `scope-inquiry.md` | 31 | Both exist, different content |
| `plan-phase.md` | 45 | `plan-inquiry.md` | 28 | Both exist, different content |
| `execute-phase.md` | 41 | `conduct-inquiry.md` | 28 | Both exist, different content |
| `verify-work.md` | 38 | `verify-inquiry.md` | 29 | Both exist, different content |
| `complete-milestone.md` | 136 | `complete-study.md` | 24 | Both exist, different content |

The new files have research-native descriptions and are already the correct final-state versions. The old files are legacy. This means **CMD-01 is NOT a git mv operation** -- the new files already exist. CMD-01 is actually: verify new files are correct, then `git rm` the 6 old files.

### Infrastructure Already Updated

The following are already using new command names (from Phase 26 or earlier work):
- `grd-tools.cjs` -- init workflow cases use `conduct-inquiry`, `plan-inquiry`, `verify-inquiry`, `new-research`, `scope-inquiry`
- `test/smoke.test.cjs` -- command file list and init tests reference new names only
- All 514 tests pass with current state

### Cross-Reference Counts (Exact, Verified)

Old `/grd:`-prefixed references remaining in target scope (`commands/`, `agents/`, `grd/workflows/`, `README.md`, `docs/DESIGN.md`):

| Pattern | Count |
|---------|-------|
| `/grd:new-project` | 44 |
| `/grd:discuss-phase` | 48 |
| `/grd:plan-phase` | 97 |
| `/grd:execute-phase` | 47 |
| `/grd:verify-work` | 26 |
| `/grd:complete-milestone` | 23 |
| **Total** | **285** |

### Bare Identifier Instances in Workflow Files

From the spec's verified 17-file list, bare (non-`/grd:` prefixed) old identifiers appear in workflow routing contexts:

| Bare Identifier | Approximate Count (workflow files) |
|-----------------|-----|
| `new-project` (as identifier) | ~5 |
| `discuss-phase` (as identifier) | ~8 |
| `plan-phase` (as identifier) | ~7 |
| `execute-phase` (as identifier) | ~9 |
| `verify-work` (as identifier) | ~5 |
| `complete-milestone` (as identifier) | ~6 |

These require context-aware replacement -- only when used as routing/identifier, not English prose.

### Replacement Strategy

**Pass 1 (Safe Bulk):** sed replacement of 6 `/grd:` prefixed patterns across all target files. These are unambiguous because the `/grd:` prefix makes them command invocations, never prose.

```bash
# Example for one pattern:
sed -i '' 's|/grd:new-project|/grd:new-research|g' <files>
```

**Pass 2 (Context-Aware):** For the 17 workflow files with bare identifiers, replace only when the name appears as:
- `Skill(skill="grd:discuss-phase"...)` -- command routing
- `"grd:execute-phase"` -- quoted identifier
- `discuss-phase` following routing verbs (route to, spawn, after, etc.)
- `discuss-phase` in checklist items about workflow behavior

Do NOT replace when:
- "discuss the phase" (English prose -- but note this exact old name `discuss-phase` with hyphen is almost always an identifier, not prose)
- "Brownfield equivalent of new-project" (description prose referencing the concept)

**Key insight:** The hyphens in the old names (`discuss-phase`, `execute-phase`) make them highly unlikely to appear as natural English prose. The main ambiguity is in descriptive comments like "Smart discuss is an autonomous-optimized variant of the `grd:discuss-phase` skill" where the backticked reference should still be updated.

### Anti-Patterns to Avoid
- **Double replacement:** Running both passes on the same file simultaneously risks replacing `/grd:discuss-phase` to `/grd:scope-inquiry` and then also catching the bare `discuss-phase` in a different context. Run Pass 1 completely first.
- **Replacing in .planning/:** Historical records must not be modified. Exclude `.planning/` from all replacements.
- **Touching gsd-ui-researcher/gsd-ui-checker:** Per D-08, these are upstream GSD agents. Leave as-is.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pattern matching | Custom regex parser | Simple `sed 's\|old\|new\|g'` | `/grd:` prefix makes patterns unambiguous |
| Verification | Custom test script | `grep -rn` with piped patterns | Same command the success criteria specifies |
| File discovery | Recursive file scanner | Spec section 2.3B verified list | Already enumerated -- no re-discovery needed |

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None -- command names are not stored in databases or state files | None |
| Live service config | None -- this is a CLI tool, no live services | None |
| OS-registered state | None -- no OS registrations reference command names | None |
| Secrets/env vars | None -- command names not used in env vars | None |
| Build artifacts | Tests already reference new names; `grd-tools.cjs` already maps new names | None -- already updated |

**Key finding:** The `grd-tools.cjs` init switch/case and `test/smoke.test.cjs` command list are ALREADY using new names. This means `npm test` will continue passing throughout the rename because tests don't reference the old names at all.

## Common Pitfalls

### Pitfall 1: git mv When Target Already Exists
**What goes wrong:** `git mv old.md new.md` fails with "destination exists" because the new-name files already exist in `commands/grd/`.
**Why it happens:** Phase 26 or an earlier step already created the new command files.
**How to avoid:** Use `git rm` on old files instead of `git mv`. The new files are already tracked.
**Warning signs:** `git mv` exit code 128.

### Pitfall 2: Replacing Bare Identifiers in Prose
**What goes wrong:** Replacing `new-project` in "Brownfield equivalent of new-project" creates nonsensical text.
**Why it happens:** The bare identifier appears in a descriptive sentence, not a routing directive.
**How to avoid:** For the 17 workflow files, review each bare replacement in context. The `/grd:`-prefixed pass is safe; only the bare pass needs care.
**Warning signs:** Sentences that read oddly after replacement (e.g., "equivalent of new-research" is actually fine semantically).

### Pitfall 3: Missing Scope in Replacement
**What goes wrong:** Old refs remain in files outside the expected scope.
**Why it happens:** The CONTEXT.md lists 34 command files, 17 workflow files, 16 agent files, README.md, and docs/DESIGN.md. Missing any file category leaves stale refs.
**How to avoid:** Run the verification grep across ALL target directories after completion.
**Warning signs:** Phase success criteria grep returning non-zero count.

### Pitfall 4: Accidental Replacement in Skill() Calls with Old Base Name
**What goes wrong:** `Skill(skill="grd:plan-phase"...)` in autonomous.md needs `grd:plan-inquiry` but could be missed if only looking for `/grd:plan-phase`.
**Why it happens:** Skill() calls use `grd:` prefix without the leading `/`.
**How to avoid:** Include both `grd:plan-phase` (no slash) AND `/grd:plan-phase` (with slash) in replacement patterns. Or use a pattern that matches both: `(?<![a-z])grd:plan-phase`.
**Warning signs:** `grep -rn 'grd:plan-phase' grd/workflows/autonomous.md` still returns results.

## Code Examples

### Pass 1: Safe Bulk Replacement (All 6 Patterns)
```bash
# Target directories (exclude .planning/, node_modules/, package-lock.json)
TARGET_FILES=$(grep -rl '/grd:new-project\|/grd:discuss-phase\|/grd:plan-phase\|/grd:execute-phase\|/grd:verify-work\|/grd:complete-milestone' commands/ agents/ grd/workflows/ README.md docs/DESIGN.md)

# Run each replacement
sed -i '' 's|/grd:new-project|/grd:new-research|g' $TARGET_FILES
sed -i '' 's|/grd:discuss-phase|/grd:scope-inquiry|g' $TARGET_FILES
sed -i '' 's|/grd:plan-phase|/grd:plan-inquiry|g' $TARGET_FILES
sed -i '' 's|/grd:execute-phase|/grd:conduct-inquiry|g' $TARGET_FILES
sed -i '' 's|/grd:verify-work|/grd:verify-inquiry|g' $TARGET_FILES
sed -i '' 's|/grd:complete-milestone|/grd:complete-study|g' $TARGET_FILES
```

### Important: Also Replace Non-Slash grd: Prefix
```bash
# Skill() calls in autonomous.md use "grd:" without leading "/"
# e.g., Skill(skill="grd:plan-phase", ...)
# Must also replace these:
sed -i '' 's|"grd:execute-phase"|"grd:conduct-inquiry"|g' grd/workflows/autonomous.md
sed -i '' 's|"grd:plan-phase"|"grd:plan-inquiry"|g' grd/workflows/autonomous.md
sed -i '' 's|"grd:discuss-phase"|"grd:scope-inquiry"|g' grd/workflows/autonomous.md
sed -i '' 's|"grd:complete-milestone"|"grd:complete-study"|g' grd/workflows/autonomous.md
sed -i '' 's|"grd:verify-work"|"grd:verify-inquiry"|g' grd/workflows/autonomous.md
```

### Old File Cleanup
```bash
git rm commands/grd/new-project.md
git rm commands/grd/discuss-phase.md
git rm commands/grd/plan-phase.md
git rm commands/grd/execute-phase.md
git rm commands/grd/verify-work.md
git rm commands/grd/complete-milestone.md
```

### Verification
```bash
# Must return zero results:
grep -rn '/grd:new-project\|/grd:discuss-phase\|/grd:plan-phase\|/grd:execute-phase\|/grd:verify-work\|/grd:complete-milestone' commands/ agents/ grd/workflows/ README.md docs/DESIGN.md

# Also check bare grd: (no slash):
grep -rn '"grd:new-project"\|"grd:discuss-phase"\|"grd:plan-phase"\|"grd:execute-phase"\|"grd:verify-work"\|"grd:complete-milestone"' commands/ agents/ grd/workflows/ README.md docs/DESIGN.md

# Tests must pass:
npm test
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `new-project` | `new-research` | Phase 27 | Research-native vocabulary |
| `discuss-phase` | `scope-inquiry` | Phase 27 | Aligns with research scoping |
| `plan-phase` | `plan-inquiry` | Phase 27 | Research planning framing |
| `execute-phase` | `conduct-inquiry` | Phase 27 | "Conduct" matches research methodology |
| `verify-work` | `verify-inquiry` | Phase 27 | Verification of research output |
| `complete-milestone` | `complete-study` | Phase 27 | Study completion framing |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js test runner (built-in) |
| Config file | None (uses `--test` flag in package.json) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CMD-01 | 6 new command files exist | smoke | `npm test` (smoke.test.cjs checks file list) | Existing |
| CMD-02 | Cross-refs updated in commands | grep | `grep -rn '/grd:discuss-phase' commands/` returns 0 | Manual verification |
| CMD-03 | Cross-refs updated in workflows | grep | `grep -rn '/grd:plan-phase' grd/workflows/` returns 0 | Manual verification |
| CMD-04 | Cross-refs updated in agents | grep | `grep -rn '/grd:execute-phase' agents/` returns 0 | Manual verification |
| CMD-05 | Old files deleted | smoke | `npm test` (file list already excludes old names) | Existing |
| CMD-06 | All tests pass | full suite | `npm test` | Existing |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + verification grep returns zero results

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. Tests already reference new command names exclusively.

## Open Questions

1. **Bare identifier false positives in prose**
   - What we know: The spec says "context-aware replacement" for bare identifiers. Hyphenated old names like `discuss-phase` are almost always identifiers, not prose.
   - What's unclear: Whether ANY instance of bare `discuss-phase` in the 17 workflow files is genuinely English prose that should be preserved.
   - Recommendation: Replace all bare hyphenated instances -- the hyphen makes them command identifiers in every observed context. Review the ~3 borderline cases manually (e.g., "equivalent of new-project" in new-milestone.md).

2. **Workflow files with BOTH old file names (as workflow filenames)**
   - What we know: Some workflow files in `grd/workflows/` share names with old commands (`execute-phase.md`, `discuss-phase.md`, `plan-phase.md`, `verify-work.md`, `new-project.md`). These are workflow instruction files, not command files.
   - What's unclear: Are the workflow files themselves also being renamed? The spec section 2.3B lists them by their current names. The CONTEXT.md only mentions renaming command files in `commands/grd/`.
   - Recommendation: Workflow files keep their current names (some already have new names like `conduct-inquiry.md`, `scope-inquiry.md`). Only `commands/grd/` files are renamed per D-01. The workflow directory already has both old and new named files coexisting.

## Sources

### Primary (HIGH confidence)
- `docs/GRD-Rename-Spec.md` section 2.1-2.4 -- Exact mapping tables, verified 17-file workflow list
- `27-CONTEXT.md` -- Locked decisions D-01 through D-08
- `.planning/REQUIREMENTS.md` -- CMD-01 through CMD-06 definitions
- Direct file system inspection -- Verified file existence, line counts, cross-reference counts

### Secondary (MEDIUM confidence)
- `test/smoke.test.cjs` -- Verified tests already use new names
- `grd/bin/grd-tools.cjs` -- Verified toolchain already uses new names

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- purely file operations, no libraries
- Architecture: HIGH -- verified exact file state and cross-reference counts via direct inspection
- Pitfalls: HIGH -- discovered critical finding (new files already exist, git mv will fail)

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (stable -- no external dependencies)
