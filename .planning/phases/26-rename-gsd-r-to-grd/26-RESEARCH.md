# Phase 26: Rename GSD-R to GRD - Research

**Researched:** 2026-03-23
**Domain:** File/directory rename + bulk string replacement across a Node.js CLI project
**Confidence:** HIGH

## Summary

This phase is a mechanical rename operation: move directories, rename files, and do bulk find/replace across ~60 active files to eliminate all GSD-R branding. The rename spec (`docs/GRD-Rename-Spec.md`) is comprehensive and prescriptive -- it lists every file, every find/replace pattern, every edge case, and a verification checklist. The CONTEXT.md locks the execution order and commit strategy.

The codebase currently has 37 command files in `commands/gsd-r/`, 16 agent files with `gsd-r-` prefix, 3 hook files with `gsd-` prefix, and ~371 content references to `gsd-r`/`GSD-R`/`get-shit-done-r` across active files (excluding .planning/, node_modules/, package-lock.json, and spec docs). The `grd/` directory already exists with clean research-specific components.

**Primary recommendation:** Follow the rename spec sections 1.1-1.8 exactly, in the order specified by CONTEXT.md decision D-01. Use `git mv` for all renames. Run `npm test` after each major category to catch regressions early.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Organize by file type, then apply replacement passes within each category. Sequence: (1) directory moves (`commands/gsd-r/` -> `commands/grd/`), (2) agent file renames (`gsd-r-*.md` -> `grd-*.md`), (3) hook file renames (`gsd-*.js` -> `grd-*.js`), (4) bulk content replacements across all files (6 passes in spec order), (5) install.js internal renames, (6) config file updates, (7) test file updates.
- **D-02:** Bulk content replacement passes run in spec order (most-specific to least-specific): `/gsd-r:` -> `/grd:`, `GSD-R` -> `GRD`, `get-shit-done-r` -> `grd`, `gsd-r-tools.cjs` -> `grd-tools.cjs`, `gsd_state_version` -> `grd_state_version`, `gsd-r-` (agent prefix) -> `grd-`.
- **D-03:** Run `npm test` after each major rename category to catch regressions early.
- **D-04:** Final verification uses grep-based checklist from rename spec (three grep commands returning zero results).
- **D-05:** Use `git mv` for all file and directory renames to preserve blame history.
- **D-06:** One commit per major rename category.
- **D-07:** Delete `scripts/rename-gsd-to-gsd-r.cjs` and `scripts/bulk-rename-planning.cjs`.
- **D-08:** Delete `scripts/verify-rename.cjs` rather than rewriting it.
- **D-09:** Bare `get-shit-done` (without `-r`) in `bin/install.js` refers to upstream GSD -- leave intact.
- **D-10:** `.gitignore` patterns `.github/agents/gsd-*`, `.github/skills/gsd-*` refer to Codex/Copilot directories -- update to `grd-*`.
- **D-11:** `GSD-R-Fork-Plan.md` at repo root -> rename to `GRD-Fork-Plan.md`.
- **D-12:** `package.json` `files` array fix: replace `"get-research-done"` with `"grd"`.

### Claude's Discretion
- Exact commit granularity within each major category
- Order of file processing within agent renames
- Whether to combine small related changes into fewer commits

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REN-01 | `commands/gsd-r/` directory renamed to `commands/grd/` | Step 1 of D-01 sequence; `git mv commands/gsd-r commands/grd`; 37 files move with directory |
| REN-02 | All 16 agent files renamed from `gsd-r-*.md` to `grd-*.md` | Step 2 of D-01; 16 files confirmed in `agents/` directory; use individual `git mv` commands |
| REN-03 | All 3 hook files renamed from `gsd-*.js` to `grd-*.js` | Step 3 of D-01; 3 files confirmed: gsd-check-update.js, gsd-statusline.js, gsd-context-monitor.js |
| REN-04 | Bulk content replacement: zero instances of gsd-r, GSD-R, get-shit-done-r | Step 4 of D-01; 6-pass replacement in spec order (D-02); ~371 content references across active files |
| REN-05 | install.js internal references updated | Step 5 of D-01; 4 direct gsd-r references + marker constants, variable names, agent mappings per spec 1.4 |
| REN-06 | Config files updated (.gitignore, .claude/settings.local.json, package.json) | Step 6 of D-01; .gitignore lines 33-36, settings.local.json obsolete paths, package.json files array |
| REN-07 | Test files updated with new filenames and paths | Step 7 of D-01; smoke.test.cjs (16 agent names + command dir), namespace.test.cjs exemption cleanup |
| REN-08 | Old migration scripts deleted | D-07; 3 files confirmed present: rename-gsd-to-gsd-r.cjs, bulk-rename-planning.cjs, verify-rename.cjs |
| REN-09 | All tests pass after rename | D-03 incremental + D-04 final grep verification; currently 1 test fails (namespace pre-existing) |
</phase_requirements>

## Standard Stack

No external libraries needed. This phase uses only:

| Tool | Purpose | Notes |
|------|---------|-------|
| `git mv` | File/directory renames | Preserves blame history per D-05 |
| `sed` or manual edit | Bulk content replacement | 6-pass find/replace per spec |
| `npm test` | Regression testing | Node.js built-in test runner (node:test) |
| `grep` | Verification | Three-command verification checklist |

## Architecture Patterns

### Rename Execution Sequence (from CONTEXT.md D-01)

```
Step 1: git mv commands/gsd-r commands/grd           # Directory move (37 files)
Step 2: git mv agents/gsd-r-*.md agents/grd-*.md     # 16 agent files
Step 3: git mv hooks/gsd-*.js hooks/grd-*.js          # 3 hook files
Step 4: Bulk content replacement (6 passes)            # ~371 references
Step 5: install.js internal renames                    # Markers, variables, mappings
Step 6: Config file updates                            # .gitignore, settings, package.json
Step 7: Test file updates                              # smoke.test.cjs, namespace.test.cjs
```

### Bulk Replacement Pass Order (from spec, locked by D-02)

Must run most-specific to least-specific to prevent double-replacement:

| Pass | Find | Replace | Scope |
|------|------|---------|-------|
| 1 | `/gsd-r:` | `/grd:` | Command prefix (unique delimiter) |
| 2 | `GSD-R` | `GRD` | Branded name (case-sensitive) |
| 3 | `get-shit-done-r` | `grd` | All path and package refs |
| 4 | `gsd-r-tools.cjs` | `grd-tools.cjs` | Tool binary filename stragglers |
| 5 | `gsd_state_version` | `grd_state_version` | State variable name |
| 6 | `gsd-r-` (agent prefix) | `grd-` | Agent name references |

### Anti-Patterns to Avoid
- **Running passes out of order:** Pass 3 (`get-shit-done-r` -> `grd`) must run after Pass 1 (`/gsd-r:` -> `/grd:`) to avoid corrupting command prefixes
- **Replacing bare `get-shit-done`:** ~26 instances in install.js are upstream GSD references -- leave them (D-09)
- **Replacing bare `gsd-` in .gitignore:** Lines 33-36 use `gsd-*` for Codex/Copilot directories; these DO need updating to `grd-*` (D-10), but do NOT apply this pattern globally
- **Touching .planning/ files:** Historical records, excluded from scope

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bulk string replacement | Custom Node.js script | `sed -i '' 's/old/new/g'` or direct file edits | One-time operation; sed handles it cleanly for simple patterns |
| Rename verification | Custom verify script | Three grep commands from spec section 1.8 | D-08 explicitly says delete verify-rename.cjs; grep checklist is more comprehensive |

## Runtime State Inventory

This is a rename/refactor phase. Answering each runtime state category:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None -- no databases store "gsd-r" as keys. State files use `grd_state_version` already (verified: state.test.cjs checks for absence of bare `gsd_state_version`). | None |
| Live service config | `.claude/settings.local.json` -- permission patterns reference `get-shit-done-r` in 2 Bash command strings (obsolete paths to directories that no longer exist). File is gitignored. | Update patterns for correctness, though not caught by verification grep |
| OS-registered state | None -- no OS-level registrations embed "gsd-r". The package installs to `~/.claude/` via `bin/install.js` which will write new names on next install. | None -- next install regenerates all paths |
| Secrets/env vars | None -- no secret keys or env vars reference "gsd-r" by name. | None |
| Build artifacts | `hooks/dist/` -- compiled hook bundles may embed old filenames. Directory is gitignored and rebuilt. | Rebuild hooks after rename if distribution is needed |

**The canonical question:** After every file in the repo is updated, what runtime systems still have the old string cached, stored, or registered?

**Answer:** Only the user's local `~/.claude/` install directory will have old agent filenames until they run `node bin/install.js` again. The install.js script itself will be updated to write the new names, so the next install corrects everything. No data migration needed.

## Common Pitfalls

### Pitfall 1: Double-Replacement in Bulk Content Passes
**What goes wrong:** Running Pass 6 (`gsd-r-` -> `grd-`) before Pass 1 (`/gsd-r:` -> `/grd:`) could turn `/gsd-r:help` into `/grd:help` via the wrong pass, then the remaining passes corrupt it further.
**Why it happens:** The 6 patterns overlap. `gsd-r-` is a substring of `gsd-r-tools.cjs` and `get-shit-done-r` contains `gsd-r`.
**How to avoid:** Run passes in exact spec order (most-specific to least-specific). Each pass completes across ALL files before the next starts.
**Warning signs:** Strings like `/grd-r:` or `ggrd` appearing in output.

### Pitfall 2: Accidentally Replacing Upstream GSD References
**What goes wrong:** `bin/install.js` has ~26 references to bare `get-shit-done` (without `-r`) for upstream GSD coexistence. Replacing these breaks dual-install support.
**Why it happens:** Over-eager regex that matches `get-shit-done` without requiring the `-r` suffix.
**How to avoid:** All 6 replacement passes include `-r` in the search pattern. Never run a bare `get-shit-done` -> anything replacement. Per D-09.
**Warning signs:** `get-research-done` or `grd` appearing where `get-shit-done` (upstream) was expected in install.js.

### Pitfall 3: Forgetting to Update install.js Marker Constants
**What goes wrong:** `GSD_CODEX_MARKER` and `GSD_COPILOT_INSTRUCTIONS_MARKER` constants are used as sentinel strings in install.js. If the constant names change but not the string literals they contain, or vice versa, the installer breaks.
**Why it happens:** These are defined once and referenced multiple times. Partial rename leaves mismatches.
**How to avoid:** install.js has only 4 direct `gsd-r`/`GSD-R` references (verified). The marker constants use `GSD_` prefix (no `-r`), which maps to spec section 1.4: rename `GSD_CODEX_MARKER` -> `GRD_CODEX_MARKER` etc. These are NOT caught by the 6 bulk replacement passes because they use bare `GSD_` not `GSD-R`. They need explicit attention in Step 5.
**Warning signs:** install.js tests or smoke tests failing after bulk replacement but before install.js-specific updates.

### Pitfall 4: Namespace Test Currently Failing
**What goes wrong:** `test/namespace.test.cjs` subtest "no old long path in .planning/ tree" currently fails because `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, and `.planning/phases/26-rename-gsd-r-to-grd/26-CONTEXT.md` contain `get-shit-done-r`.
**Why it happens:** The namespace test exempts milestones/ and SUMMARY/VERIFICATION files but not REQUIREMENTS.md, ROADMAP.md, or CONTEXT.md files.
**How to avoid:** After all renames complete, either (a) the test exclusion list needs to expand to cover these planning files, or (b) the planning files need to not contain the old name (unlikely since they're historical). The planner should plan a test fix for this pre-existing failure.
**Warning signs:** `npm test` shows 1 failure even before any rename work starts.

### Pitfall 5: .claude/settings.local.json is Gitignored
**What goes wrong:** This file is in `.claude/` which is gitignored (line 9 of `.gitignore`). Changes here won't appear in git status or be committed.
**Why it happens:** The settings file is local-only, designed to not be shared.
**How to avoid:** Update the file for local correctness but understand it won't be verified by the grep checklist (which only checks tracked files). Document that users need to update their own settings after install.
**Warning signs:** None visible in CI/verification -- purely local.

### Pitfall 6: `git mv` with Agent Files Requires Individual Commands
**What goes wrong:** `git mv agents/gsd-r-*.md agents/grd-*.md` won't work as a single glob because git mv can't map source globs to destination patterns.
**Why it happens:** `git mv` accepts one source and one destination, or moves files into a directory.
**How to avoid:** Use a loop: `for f in agents/gsd-r-*.md; do git mv "$f" "agents/grd-${f#agents/gsd-r-}"; done`
**Warning signs:** Git error about ambiguous destination.

## Code Examples

### Directory Move (Step 1)
```bash
git mv commands/gsd-r commands/grd
```
This moves the entire directory with all 37 files in one operation.

### Agent File Rename Loop (Step 2)
```bash
for f in agents/gsd-r-*.md; do
  newname="agents/grd-${f#agents/gsd-r-}"
  git mv "$f" "$newname"
done
```

### Hook File Renames (Step 3)
```bash
git mv hooks/gsd-check-update.js hooks/grd-check-update.js
git mv hooks/gsd-statusline.js hooks/grd-statusline.js
git mv hooks/gsd-context-monitor.js hooks/grd-context-monitor.js
```

### Bulk Content Replacement Pass Example (Step 4)
```bash
# Pass 1: Command prefix (most specific)
# Find all active files, exclude .planning/, node_modules/, package-lock.json
find . -type f \( -name "*.md" -o -name "*.js" -o -name "*.cjs" -o -name "*.json" \) \
  ! -path "./.planning/*" ! -path "./node_modules/*" ! -name "package-lock.json" \
  -exec sed -i '' 's|/gsd-r:|/grd:|g' {} +
```

### install.js Specific Renames (Step 5)
```
GSD_CODEX_MARKER         -> GRD_CODEX_MARKER
GSD_COPILOT_INSTRUCTIONS_MARKER -> GRD_COPILOT_INSTRUCTIONS_MARKER
"GSD Agent Configuration" -> "GRD Agent Configuration"
"GSD Configuration"       -> "GRD Configuration"
codexGsdPath              -> codexGrdPath
gsd-r- agent mappings     -> grd- equivalents
```
Note: These use `GSD_` prefix (no hyphen-R) so bulk passes 1-6 may NOT catch them all. Step 5 must explicitly handle marker constants.

### Verification (Final)
```bash
# All three must return zero results:
grep -r "gsd-r" --include="*.md" --include="*.js" --include="*.cjs" --include="*.json" . | grep -v node_modules | grep -v .planning | grep -v package-lock
grep -r "GSD-R" --include="*.md" --include="*.js" --include="*.cjs" --include="*.json" . | grep -v node_modules | grep -v .planning | grep -v package-lock
grep -r "get-shit-done-r" --include="*.md" --include="*.js" --include="*.cjs" --include="*.json" . | grep -v node_modules | grep -v .planning | grep -v package-lock
```

## File Inventory (Verified)

### Files to Rename

| Category | Count | Current Pattern | New Pattern |
|----------|-------|-----------------|-------------|
| Command directory | 1 dir (37 files) | `commands/gsd-r/` | `commands/grd/` |
| Agent files | 16 | `agents/gsd-r-*.md` | `agents/grd-*.md` |
| Hook files | 3 | `hooks/gsd-*.js` | `hooks/grd-*.js` |
| Root doc | 1 | `GSD-R-Fork-Plan.md` | `GRD-Fork-Plan.md` |

### Files to Delete

| File | Reason |
|------|--------|
| `scripts/rename-gsd-to-gsd-r.cjs` | Obsolete migration script (D-07) |
| `scripts/bulk-rename-planning.cjs` | Obsolete migration script (D-07) |
| `scripts/verify-rename.cjs` | One-time-use, grep checklist is better (D-08) |

### Files with Content References (top by count, excluding spec docs)

| File | Approx References | Notes |
|------|-------------------|-------|
| README.md | 69 | Heaviest file; all command examples + prose |
| docs/DESIGN.md | 16 | Command references and architecture descriptions |
| agents/gsd-r-planner.md | 18 | Heavy cross-referencing (file moves + content) |
| agents/gsd-r-plan-checker.md | 17 | Cross-referencing |
| agents/gsd-r-executor.md | 16 | Cross-referencing |
| bin/install.js | 4 | Direct references + additional GSD_ markers |
| test/smoke.test.cjs | 7 | Agent filename assertions |
| .gitignore | 4 (lines 33-36) | Codex/Copilot patterns |

### Files Already Clean (No Changes Needed)
- `grd/agents/` -- 4 research-specific agents already use `grd` naming
- `grd/bin/` -- All CJS modules already clean
- `grd/references/` -- Already clean
- `grd/templates/` -- Already clean

## State of the Art

Not applicable -- this is a mechanical rename operation, not a technology choice.

## Open Questions

1. **Namespace test pre-existing failure**
   - What we know: `test/namespace.test.cjs` subtest 5 ("no old long path in .planning/ tree") fails because REQUIREMENTS.md, ROADMAP.md, and 26-CONTEXT.md contain `get-shit-done-r`
   - What's unclear: Should the test exclusion list be expanded, or should these planning files be updated?
   - Recommendation: Expand the test exclusion to cover `REQUIREMENTS.md`, `ROADMAP.md`, and `*-CONTEXT.md` since these are planning artifacts that naturally reference the rename. This keeps .planning/ as a historical record.

2. **install.js GSD_ marker constants**
   - What we know: `GSD_CODEX_MARKER` and `GSD_COPILOT_INSTRUCTIONS_MARKER` use `GSD_` prefix (no hyphen-R). The 6 bulk passes target `gsd-r`/`GSD-R`/`get-shit-done-r` patterns, so these markers may not be caught.
   - What's unclear: Will bulk Pass 2 (`GSD-R` -> `GRD`) catch `GSD_CODEX_MARKER`? No -- it's `GSD_` not `GSD-R`.
   - Recommendation: Step 5 (install.js internals) must explicitly rename all `GSD_` prefixed constants to `GRD_`. This is a separate, manual operation from the bulk passes.

3. **docs/GRD-Rename-Spec.md and other spec docs**
   - What we know: `docs/GRD-Rename-Spec.md` has 68 references to old patterns. `docs/GRD-v1.2-Research-Reorientation-Spec.md` has 31. `docs/superpowers/` has 63.
   - What's unclear: Should spec documents be updated? They describe the rename operation itself so naturally reference old names.
   - Recommendation: These should be excluded from bulk replacement (they document the rename). The grep verification already excludes .planning/ but does NOT exclude docs/GRD-Rename-Spec.md. The planner needs to decide: either (a) exclude spec docs from verification grep, or (b) update them. Given that the spec is a reference document for the rename, option (a) is cleaner.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in test runner (node:test) |
| Config file | `scripts/run-tests.cjs` (custom runner) |
| Quick run command | `npm test` |
| Full suite command | `npm test` (same -- runs all 20 test files, ~870ms) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REN-01 | commands/grd/ exists, commands/gsd-r/ does not | smoke | `npm test` (smoke.test.cjs checks command dir) | Needs update |
| REN-02 | All 16 agents exist as grd-*.md | smoke | `npm test` (smoke.test.cjs checks 16 agent filenames) | Needs update |
| REN-03 | All 3 hooks renamed | smoke | `ls hooks/grd-*.js` verification | No dedicated test |
| REN-04 | Zero gsd-r/GSD-R/get-shit-done-r in active files | namespace | `npm test` (namespace.test.cjs) | Exists, currently failing |
| REN-05 | install.js references updated | smoke | `npm test` (smoke.test.cjs) | Exists |
| REN-06 | Config files updated | manual | `grep` verification commands | No dedicated test |
| REN-07 | Test files updated with new paths | meta | Tests themselves verify this -- if filenames wrong, tests fail | Self-verifying |
| REN-08 | Old scripts deleted | manual | `ls scripts/rename-gsd-to-gsd-r.cjs` should fail | No dedicated test |
| REN-09 | All tests pass | suite | `npm test` | Exists |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** `npm test` + three grep verification commands

### Wave 0 Gaps
- [ ] Fix `test/namespace.test.cjs` subtest 5 exclusion list to handle REQUIREMENTS.md, ROADMAP.md, CONTEXT.md files in .planning/
- [ ] Update `test/smoke.test.cjs` agent filename array from `gsd-r-*` to `grd-*`
- [ ] Update `test/smoke.test.cjs` command directory reference from `gsd-r` to `grd`

## Sources

### Primary (HIGH confidence)
- `docs/GRD-Rename-Spec.md` -- Complete rename specification (read in full)
- `.planning/phases/26-rename-gsd-r-to-grd/26-CONTEXT.md` -- User decisions
- Direct codebase inspection via grep, ls, and file reads

### Secondary (MEDIUM confidence)
- None needed -- all findings from direct codebase inspection

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no external dependencies, purely mechanical rename
- Architecture: HIGH -- rename spec is prescriptive, CONTEXT.md locks execution order
- Pitfalls: HIGH -- verified through direct codebase inspection (grep counts, file listings, test output)

**Research date:** 2026-03-23
**Valid until:** No expiry -- codebase-specific findings, not library-dependent
