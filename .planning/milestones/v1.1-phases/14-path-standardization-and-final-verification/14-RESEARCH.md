# Phase 14: Path Standardization and Final Verification - Research

**Researched:** 2026-03-16
**Domain:** Path normalization, sed-based find-and-replace, verification scripting
**Confidence:** HIGH

## Summary

Phase 14 is a mechanical find-and-replace operation across markdown files (workflows, agents, commands, references, templates) to convert `$HOME/.claude/` and `~/.claude/` references to absolute paths (`/Users/jeremiahwolf/.claude/`). The codebase currently has ~240 `$HOME` occurrences across 55 actionable files and ~52 `~/.claude` occurrences across 51 actionable files. Additionally, 25 stale namespace references (gsd-debugger, gsd-planner, gsd-plan-checker, gsd-integration-checker, gsd-phase-researcher, gsd-nyquist-auditor) were detected by verify-rename.cjs and must also be fixed in this phase.

A critical exception exists: `bin/install.js` uses `$HOME` as a runtime shell variable in string literals (it writes `$HOME` into output files for portability). Its 16 `$HOME` and 6 `~/.claude` occurrences MUST NOT be converted. Similarly, `get-shit-done-r/bin/lib/model-profiles.cjs` has a comment referencing "upstream get-shit-done" which is a legitimate prose reference. The verify-rename.cjs script must be extended with `$HOME`/`~` detection, and the script's own exclusion list may need updating.

**Primary recommendation:** Process in three waves: (1) extend verify-rename.cjs with `$HOME`/`~` checks, (2) run sed replacements across all markdown files by directory, (3) fix remaining stale namespace references, then validate with extended verify-rename and full test suite.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Replace `$HOME/.claude/get-shit-done-r/` with `/Users/jeremiahwolf/.claude/get-shit-done-r/` everywhere
- Replace `~/` path references with `/Users/jeremiahwolf/` equivalent
- Replace in ALL contexts: executable bash code blocks, inline paths, documentation, examples -- no exceptions
- Zero `$HOME` or `~` references should remain after this phase
- Extend existing `scripts/verify-rename.cjs` to also detect `$HOME` and `~` path references
- Single tool, single command for complete validation: namespace + path standardization
- No new tests needed -- path changes are in markdown files, not CJS library code
- Run existing test suite to confirm zero regressions
- Every `$HOME` reference becomes absolute path -- no preserved exceptions for docs or examples
- Every `~` reference becomes absolute path

### Claude's Discretion
- Batch size for sed replacements (per-directory or per-file)
- Whether to process workflows, agents, references, commands in separate tasks or together
- Order of operations (replace first, then verify, or verify-replace-verify)

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PATH-01 | Standardize all path references to absolute paths (replace $HOME and stale references) | Exact counts and file lists identified; sed replacement patterns documented; bin/install.js exclusion identified |
| PATH-02 | Ensure all /gsd: references in new and updated files use /gsd-r: namespace | 25 stale namespace references identified by verify-rename.cjs across 6 files |
| PATH-03 | Run verify-rename validation to confirm zero namespace leaks | verify-rename.cjs extension pattern documented; check types for $HOME and ~ specified |
| PATH-04 | Full test suite passes after path standardization | Test suite runs with `node --test test/*.test.cjs` (164 tests, all passing pre-phase) |
</phase_requirements>

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| sed | system | In-place text replacement across files | Standard POSIX tool for batch text replacement |
| Node.js | v22.x | verify-rename.cjs execution, test runner | Already used throughout project |
| verify-rename.cjs | custom | Namespace leak + path reference detection | Existing project verification tool being extended |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| grep | Pre/post replacement validation | Counting occurrences before and after to confirm all replaced |
| node --test | Test runner | Final regression check (PATH-04) |

## Architecture Patterns

### Replacement Pattern: $HOME
The dominant pattern is `node "$HOME/.claude/get-shit-done-r/bin/gsd-r-tools.cjs"` in bash code blocks within markdown files.

**Sed command:**
```bash
sed -i '' 's|\$HOME/\.claude/|/Users/jeremiahwolf/.claude/|g' <file>
```

### Replacement Pattern: ~/
The dominant pattern is `~/.claude/get-shit-done-r/` in inline references and bash code blocks.

**Sed command:**
```bash
sed -i '' 's|~/\.claude/|/Users/jeremiahwolf/.claude/|g' <file>
```

### Replacement Pattern: Stale Agent Names
References like `gsd-debugger` (not `gsd-r-debugger`), `gsd-planner` (not `gsd-r-planner`), etc.

These require targeted per-file fixes since the patterns are context-dependent (e.g., `gsd-planner` in prose vs. code).

### Anti-Patterns to Avoid
- **Replacing $HOME in JavaScript runtime code:** `bin/install.js` uses `$HOME` as an intentional shell variable in string templates. Replacing it would break the installer.
- **Using overly broad sed patterns:** A pattern like `s/$HOME/\/Users\/jeremiahwolf/g` would miss the `.claude/` part and over-match.
- **Forgetting escaped dollar signs:** In some contexts `$HOME` may appear differently; the sed pattern must handle the literal `$HOME` string.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text replacement | Custom Node.js script | sed -i '' | sed is faster, simpler, and proven for this exact task |
| Finding all occurrences | Manual file inspection | grep -rc pattern dir | Instant count with file breakdown |
| Verification | Manual grep checks | Extended verify-rename.cjs | Single authoritative tool, already exists |

## Common Pitfalls

### Pitfall 1: Replacing $HOME in install.js
**What goes wrong:** bin/install.js has 16 `$HOME` references and 6 `~/.claude` references that are runtime JavaScript code, not markdown path literals. Converting them to absolute paths would break the installer for all users.
**Why it happens:** Grepping `$HOME` catches both markdown path references AND JavaScript string literals.
**How to avoid:** Only run sed on `.md` files. The install.js file and all `.cjs` files MUST be excluded from replacement. The verify-rename.cjs extension should also exclude install.js from the new `$HOME`/`~` checks.
**Warning signs:** Test suite fails or install.js stops working.

### Pitfall 2: sed on macOS requires empty string for -i
**What goes wrong:** `sed -i 's/...' file` fails on macOS because BSD sed requires `sed -i '' 's/...' file`.
**Why it happens:** GNU sed and BSD sed have different `-i` flag syntax.
**How to avoid:** Always use `sed -i ''` on this project (macOS/darwin).

### Pitfall 3: Stale agent names that are intentional
**What goes wrong:** Some stale agent name references (like in model-profiles.cjs comment "upstream get-shit-done") are legitimate prose references to the upstream project, not stale renames.
**Why it happens:** verify-rename.cjs uses pattern matching that can flag legitimate prose.
**How to avoid:** Review each stale reference from verify-rename output individually. The 25 stale references identified are real issues (agent name references in commands/workflows that should use `gsd-r-*`), not false positives.

### Pitfall 4: Missing files in SCAN_DIRS
**What goes wrong:** verify-rename.cjs only scans `commands`, `agents`, `get-shit-done-r`, `bin`, and `scripts`. If `$HOME`/`~` references exist in other locations, they won't be caught.
**Why it happens:** SCAN_DIRS was designed for namespace checks, not path checks.
**How to avoid:** For the $HOME/~ extension, verify that SCAN_DIRS covers all relevant directories. Currently it does -- all actionable `$HOME`/`~` references are in those directories.

## Code Examples

### Extending verify-rename.cjs with $HOME/~ checks

Add two new check blocks after the existing Check 6, inside the line-scanning loop:

```javascript
// Check 7: Stale $HOME path references (should be absolute paths)
// Exclude install.js which uses $HOME as a runtime variable
if (/\$HOME/.test(line)) {
  issues.push({
    file: relPath,
    line: lineNum,
    type: 'stale $HOME path reference',
    text: line.trim().substring(0, 120),
  });
}

// Check 8: Stale ~ path references (should be absolute paths)
if (/~\/\.claude/.test(line)) {
  issues.push({
    file: relPath,
    line: lineNum,
    type: 'stale ~ path reference',
    text: line.trim().substring(0, 120),
  });
}
```

The EXCLUDE_BASENAMES array should be updated to include `install.js`:
```javascript
const EXCLUDE_BASENAMES = ['LICENSE', 'verify-rename.cjs', 'rename-gsd-to-gsd-r.cjs', 'install.js'];
```

### Batch sed replacement across a directory

```bash
# Workflows (largest scope: 177 $HOME refs across 41 files)
find get-shit-done-r/workflows -name '*.md' -exec sed -i '' 's|\$HOME/\.claude/|/Users/jeremiahwolf/.claude/|g' {} +
find get-shit-done-r/workflows -name '*.md' -exec sed -i '' 's|~/\.claude/|/Users/jeremiahwolf/.claude/|g' {} +

# References
find get-shit-done-r/references -name '*.md' -exec sed -i '' 's|\$HOME/\.claude/|/Users/jeremiahwolf/.claude/|g' {} +
find get-shit-done-r/references -name '*.md' -exec sed -i '' 's|~/\.claude/|/Users/jeremiahwolf/.claude/|g' {} +

# Templates
find get-shit-done-r/templates -name '*.md' -exec sed -i '' 's|\$HOME/\.claude/|/Users/jeremiahwolf/.claude/|g' {} +
find get-shit-done-r/templates -name '*.md' -exec sed -i '' 's|~/\.claude/|/Users/jeremiahwolf/.claude/|g' {} +

# Agents
find agents -name '*.md' -exec sed -i '' 's|\$HOME/\.claude/|/Users/jeremiahwolf/.claude/|g' {} +
find agents -name '*.md' -exec sed -i '' 's|~/\.claude/|/Users/jeremiahwolf/.claude/|g' {} +

# Commands
find commands/gsd-r -name '*.md' -exec sed -i '' 's|\$HOME/\.claude/|/Users/jeremiahwolf/.claude/|g' {} +
find commands/gsd-r -name '*.md' -exec sed -i '' 's|~/\.claude/|/Users/jeremiahwolf/.claude/|g' {} +
```

### Bare ~ replacement (not followed by /.claude/)

Some `~` references may use patterns like `~/.claude` without trailing slash. A broader pattern:
```bash
sed -i '' 's|~/\.claude\b|/Users/jeremiahwolf/.claude|g' <file>
```

## Current Baseline (Pre-Phase Counts)

### $HOME references by directory (actionable, excluding .planning/ and node_modules/)
| Directory | Files | Occurrences |
|-----------|-------|-------------|
| get-shit-done-r/workflows/ | 35 | ~144 |
| get-shit-done-r/references/ | 5 | ~18 |
| get-shit-done-r/templates/ | 0 | 0 |
| agents/ | 12 | 41 |
| commands/gsd-r/ | 1 | 6 |
| bin/install.js | 1 (EXCLUDE) | 16 (EXCLUDE) |
| **Total actionable** | **53** | **~209** |

### ~/ references by directory (actionable)
| Directory | Files | Occurrences |
|-----------|-------|-------------|
| get-shit-done-r/workflows/ | 8 | ~27 |
| get-shit-done-r/templates/ | 2 | ~13 |
| get-shit-done-r/references/ | 2 | ~2 |
| agents/ | 4 | 8 |
| commands/gsd-r/ | 34 | 81 |
| bin/install.js | 1 (EXCLUDE) | 6 (EXCLUDE) |
| **Total actionable** | **~50** | **~131** |

### Stale namespace references (from verify-rename.cjs)
| File | Issue Count | Stale Names |
|------|-------------|-------------|
| commands/gsd-r/debug.md | 4 | gsd-debugger |
| commands/gsd-r/plan-phase.md | 3 | gsd-planner, gsd-plan-checker |
| commands/gsd-r/quick.md | 2 | gsd-executor, gsd-planner |
| get-shit-done-r/workflows/audit-milestone.md | 2 | gsd-integration-checker |
| get-shit-done-r/workflows/research-phase.md | 2 | gsd-phase-researcher |
| get-shit-done-r/workflows/validate-phase.md | 4 | gsd-nyquist-auditor |
| get-shit-done-r/workflows/verify-work.md | 6 | gsd-planner, gsd-plan-checker |
| get-shit-done-r/templates/copilot-instructions.md | 1 | get-shit-done (prose) |
| get-shit-done-r/bin/lib/model-profiles.cjs | 1 | get-shit-done (comment) |
| **Total** | **25** | |

### Test suite baseline
- Command: `node --test test/*.test.cjs`
- Result: 164 tests, 47 suites, 0 failures
- Note: `node --test test/` fails with MODULE_NOT_FOUND; must use glob pattern `test/*.test.cjs`

## Open Questions

1. **model-profiles.cjs comment**
   - What we know: Line 4 says "Based on upstream get-shit-done model-profiles.cjs" -- flagged as stale by verify-rename
   - What's unclear: Whether this is a legitimate upstream project name reference or should be changed
   - Recommendation: Keep as-is (it is an upstream project name reference) and add to verify-rename exclusions, OR change to "get-shit-done-r" if the convention is to fully rename all references

2. **copilot-instructions.md prose reference**
   - What we know: "Use the get-shit-done skill" is flagged as stale
   - What's unclear: Whether this is intentional brand name or should be "get-shit-done-r"
   - Recommendation: Change to "get-shit-done-r" to maintain consistency

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in test runner (v22.x) |
| Config file | none (convention-based) |
| Quick run command | `node --test test/*.test.cjs` |
| Full suite command | `node --test test/*.test.cjs` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PATH-01 | Zero $HOME/~ path refs in actionable files | smoke | `grep -rc '\$HOME' agents/ commands/ get-shit-done-r/ \| grep -v ':0$'` | N/A (grep command) |
| PATH-02 | Zero stale /gsd: namespace leaks | smoke | `node scripts/verify-rename.cjs` | verify-rename.cjs exists |
| PATH-03 | verify-rename reports clean | smoke | `node scripts/verify-rename.cjs` (extended with $HOME/~ checks) | verify-rename.cjs exists, needs extension |
| PATH-04 | Full test suite passes | unit/integration | `node --test test/*.test.cjs` | All 9 test files exist |

### Sampling Rate
- **Per task commit:** `node scripts/verify-rename.cjs && node --test test/*.test.cjs`
- **Per wave merge:** Same (single wave phase)
- **Phase gate:** verify-rename clean + 164/164 tests pass

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. verify-rename.cjs extension is a phase deliverable, not a prerequisite.

## Sources

### Primary (HIGH confidence)
- Direct codebase grep analysis for $HOME and ~ counts
- Direct reading of scripts/verify-rename.cjs source code
- Direct execution of verify-rename.cjs (25 stale references observed)
- Direct execution of test suite (164 pass, 0 fail)
- Direct reading of bin/install.js to confirm $HOME is runtime code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- sed and grep are verified POSIX tools; patterns tested against actual file content
- Architecture: HIGH -- replacement patterns derived from actual codebase grep output
- Pitfalls: HIGH -- bin/install.js exclusion verified by reading source code; macOS sed behavior confirmed on this platform
- Counts: MEDIUM -- grep counts are point-in-time snapshots; actual counts may differ slightly due to unstaged changes

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable -- mechanical replacement, no dependency drift risk)
