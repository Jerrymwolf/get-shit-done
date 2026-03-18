# Phase 17: Namespace Migration - Research

**Researched:** 2026-03-17
**Domain:** Codebase-wide rename (grd -> grd namespace), file/directory renaming, bulk find-and-replace
**Confidence:** HIGH

## Summary

Phase 17 is a pure mechanical migration: rename the `grd` namespace to `grd` across the entire codebase. There are no new libraries to install, no new patterns to learn, and no architectural decisions to make. The challenge is completeness and atomicity -- every reference must be updated in lockstep to avoid broken intermediate states.

The codebase contains approximately 699 `grd` references across 72 files in `grd/`, plus additional references in 10 test files, `.planning/` documents, `scripts/`, and `CLAUDE.md` (the config also has `vault_path: "grd/bin/lib/vault.cjs"`). The spec table in `docs/GRD-v1.2-Research-Reorientation-Spec.md` lines 440-464 defines the 23-command rename mapping. An additional ~10 commands not in the spec table need prefix-only changes (`grd:` to `grd:`).

**Primary recommendation:** Execute as a sequence of atomic commits: (1) directory + CLI tool rename with all path references, (2) command vocabulary rename with workflow file renames, (3) agent name prefix rename, (4) residual scan test creation. Each commit must leave all 192+ tests passing.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Use the spec table exactly** -- the 23-command mapping from `docs/GRD-v1.2-Research-Reorientation-Spec.md` Section: Command Vocabulary is the source of truth
- Commands NOT in the spec table get **prefix change only**: `grd:` to `grd:` with existing names preserved (e.g., `/grd:validate-phase`, `/grd:add-tests`, `/grd:check-todos`, `/grd:note`, `/grd:add-todo`, `/grd:cleanup`, `/grd:do`, `/grd:map-codebase`, `/grd:update`, `/grd:reapply-patches`)
- **Workflow filenames rename to match new commands**: `execute-phase.md` to `conduct-inquiry.md`, `discuss-phase.md` to `scope-inquiry.md`, `plan-phase.md` to `plan-inquiry.md`, etc. Full consistency between user-facing command names and internal filenames
- Structural operations use spec vocabulary: `add-inquiry`, `remove-inquiry`, `insert-inquiry` (not `add-phase`)
- **Atomic single commit**: `git mv grd/ grd/` + all path reference updates in one commit
- **Update everything**: all `.planning/` docs, `CLAUDE.md`, and runtime code get updated
- Test file `require()` paths updated in the same atomic commit as the directory rename
- `grd-tools.cjs` to `grd-tools.cjs` included in same rename commit
- **Scan scope**: everything under `grd/` AND `.planning/` -- zero tolerance for any `grd` string in either tree
- **Pattern variants**: scan for `grd`, `grd`, `grd`, `GSDR` (case-sensitive per pattern). The repo root folder `GSDR` is the project name, not a namespace reference -- exclude from scan failures
- **Implementation**: `test/namespace.test.cjs` that greps for residual references and fails if any found
- **Rename everywhere**: both `model-profiles.cjs` table AND all `subagent_type` references in workflows/agents change. `grd-planner` to `grd-planner`, etc.
- **Agent prompt content updated too**: `.md` files in `grd/agents/` get `GRD` to `GRD` in descriptions and context sections

### Claude's Discretion
- Exact ordering of rename operations within the atomic commit
- Whether to use a script for bulk find-and-replace or manual editing
- How to structure the namespace test assertions (individual patterns vs combined regex)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NS-01 | All `/grd:` command references renamed to `/grd:` across all files | Command vocabulary mapping (spec table + prefix-only list) covers all 33+ commands |
| NS-02 | Command vocabulary renamed to research-native terms | Spec table lines 440-464 provides exact 23-command mapping; workflow file rename list derived below |
| NS-03 | `grd-tools.cjs` renamed to `grd-tools.cjs` with all references updated | CLI entry point analysis shows shebang path and `Usage:` line need updating; all workflow `node` invocations reference this file |
| NS-04 | `grd/` directory renamed to `grd/` with all path references updated | ~234 path references across runtime, tests, .planning/, config.json vault_path |
| NS-05 | Agent names in model-profiles.cjs renamed from `grd-*` to `grd-*` | 19 agents identified in model-profiles.cjs; subagent_type references found in 10+ workflow files; init.cjs has 15+ resolveModelInternal calls |
| NS-06 | Zero residual `grd` references in any user-facing output | Namespace regression test design covers all pattern variants |
| TEST-02 | New tests cover namespace migration (zero residual references) | Test design for `test/namespace.test.cjs` detailed below |
</phase_requirements>

## Standard Stack

No new libraries. This phase uses only existing Node.js built-ins and the project's established test framework (Node.js built-in test runner with `node --test`).

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| `git mv` | system | Directory and file renames with history preservation | Standard git operation for renames |
| `node --test` | v22.x | Test runner for namespace regression test | Already used for all 192 existing tests |
| `node:assert` | built-in | Test assertions | Already used across all 10 test files |

## Architecture Patterns

### Rename Scope Inventory

The following inventory categorizes every change needed:

#### Layer 1: Directory + CLI Tool Rename (NS-03, NS-04)
```
git mv grd/ grd/
git mv grd/bin/grd-tools.cjs grd/bin/grd-tools.cjs
```

**Path references to update (~234 occurrences):**
- `grd/` -> `grd/` in all files
- `grd-tools.cjs` -> `grd-tools.cjs` in all files
- `.planning/config.json` vault_path: `"grd/bin/lib/vault.cjs"` -> `"grd/bin/lib/vault.cjs"`
- Test `require()` paths in all 10 test files under `test/`
- CLAUDE.md path references

#### Layer 2: Command Vocabulary (NS-01, NS-02)

**Spec table renames (23 commands):**

| Old Command | New Command | Workflow File Rename |
|-------------|-------------|---------------------|
| `grd:new-project` | `grd:new-research` | `new-project.md` -> `new-research.md` |
| `grd:discuss-phase` | `grd:scope-inquiry` | `discuss-phase.md` -> `scope-inquiry.md` |
| `grd:plan-phase` | `grd:plan-inquiry` | `plan-phase.md` -> `plan-inquiry.md` |
| `grd:execute-phase` | `grd:conduct-inquiry` | `execute-phase.md` -> `conduct-inquiry.md` |
| `grd:verify-work` | `grd:verify-inquiry` | `verify-work.md` -> `verify-inquiry.md` |
| `grd:complete-milestone` | `grd:complete-study` | `complete-milestone.md` -> `complete-study.md` |
| `grd:insert-phase` | `grd:insert-inquiry` | `insert-phase.md` -> `insert-inquiry.md` |
| `grd:add-phase` | `grd:add-inquiry` | `add-phase.md` -> `add-inquiry.md` |
| `grd:remove-phase` | `grd:remove-inquiry` | `remove-phase.md` -> `remove-inquiry.md` |
| `grd:audit-milestone` | `grd:audit-study` | `audit-milestone.md` -> `audit-study.md` |
| `grd:new-milestone` | `grd:new-milestone` | (no rename, prefix only) |
| `grd:settings` | `grd:settings` | (no rename, prefix only) |
| `grd:progress` | `grd:progress` | (no rename, prefix only) |
| `grd:quick` | `grd:quick` | (no rename, prefix only) |
| `grd:debug` | `grd:debug` | (no rename, prefix only -- file is `diagnose-issues.md`) |
| `grd:pause-work` | `grd:pause-work` | (no rename, prefix only) |
| `grd:resume-work` | `grd:resume-work` | (no rename, prefix only) |
| `grd:autonomous` | `grd:autonomous` | (no rename, prefix only) |
| `grd:health` | `grd:health` | (no rename, prefix only) |
| `grd:stats` | `grd:stats` | (no rename, prefix only) |
| `grd:help` | `grd:help` | (no rename, prefix only) |
| `grd:map-codebase` | `grd:map-codebase` | (no rename, prefix only) |

**Unlisted commands (prefix-only change `grd:` -> `grd:`):**
- `validate-phase`, `add-tests`, `check-todos`, `note`, `add-todo`, `cleanup`, `do`, `update`, `reapply-patches`
- `research-phase`, `execute-plan`, `verify-phase`, `discovery-phase`, `list-phase-assumptions`, `plan-milestone-gaps`, `transition`, `ui-phase`, `ui-review`, `set-profile`, `node-repair`, `resume-project`

**Total workflow file renames needed: 10 files**

| Old Filename | New Filename |
|-------------|-------------|
| `new-project.md` | `new-research.md` |
| `discuss-phase.md` | `scope-inquiry.md` |
| `plan-phase.md` | `plan-inquiry.md` |
| `execute-phase.md` | `conduct-inquiry.md` |
| `verify-work.md` | `verify-inquiry.md` |
| `complete-milestone.md` | `complete-study.md` |
| `insert-phase.md` | `insert-inquiry.md` |
| `add-phase.md` | `add-inquiry.md` |
| `remove-phase.md` | `remove-inquiry.md` |
| `audit-milestone.md` | `audit-study.md` |

Cross-references between workflows (Skill() calls) must be updated to reference new command names.

#### Layer 3: Agent Names (NS-05)

All 19 agents in `model-profiles.cjs`:

| Old Name | New Name |
|----------|----------|
| `grd-planner` | `grd-planner` |
| `grd-roadmapper` | `grd-roadmapper` |
| `grd-executor` | `grd-executor` |
| `grd-phase-researcher` | `grd-phase-researcher` |
| `grd-project-researcher` | `grd-project-researcher` |
| `grd-research-synthesizer` | `grd-research-synthesizer` |
| `grd-debugger` | `grd-debugger` |
| `grd-codebase-mapper` | `grd-codebase-mapper` |
| `grd-verifier` | `grd-verifier` |
| `grd-plan-checker` | `grd-plan-checker` |
| `grd-integration-checker` | `grd-integration-checker` |
| `grd-nyquist-auditor` | `grd-nyquist-auditor` |
| `grd-ui-researcher` | `grd-ui-researcher` |
| `grd-ui-checker` | `grd-ui-checker` |
| `grd-ui-auditor` | `grd-ui-auditor` |
| `grd-source-researcher` | `grd-source-researcher` |
| `grd-methods-researcher` | `grd-methods-researcher` |
| `grd-architecture-researcher` | `grd-architecture-researcher` |
| `grd-limitations-researcher` | `grd-limitations-researcher` |

**Files with agent name references:**
- `grd/bin/lib/model-profiles.cjs` (19 keys + comment lines)
- `grd/bin/lib/init.cjs` (15+ `resolveModelInternal()` calls)
- `grd/references/model-profiles.md` (18 references)
- `grd/references/model-profile-resolution.md` (example code)
- 10+ workflow files with `subagent_type="grd-*"` patterns
- Test files: `test/model-profiles.test.cjs` (25+ references), `test/core.test.cjs` (3 references)

#### Layer 4: Brand Text (NS-06)

`GRD` uppercase references in prose/comments -> `GRD`:
- `grd/bin/grd-tools.cjs` header comment
- `grd/bin/lib/state.cjs` section headers and comments (3 occurrences)
- `grd/bin/lib/model-profiles.cjs` JSDoc comments (2 occurrences)
- `grd/bin/lib/config.cjs` comments (2 occurrences)
- `grd/references/note-format.md`, `research-verification.md`, `source-protocol.md` prose
- `grd/workflows/autonomous.md` banner lines (4 occurrences)

### Init.cjs Command Name Mapping

The `init.cjs` file uses function names like `cmdInitExecutePhase`, `cmdInitPlanPhase`, etc. These are internal JavaScript function names, NOT user-facing. However, the **mapping from init subcommand to function** happens in `grd-tools.cjs` (the CLI entry point). The init subcommand names (`execute-phase`, `plan-phase`, etc.) should be updated to match the new workflow names for consistency:

- `init execute-phase` -> `init conduct-inquiry`
- `init plan-phase` -> `init plan-inquiry`
- `init new-project` -> `init new-research`
- `init verify-work` -> `init verify-inquiry`

**Critical:** The actual JavaScript function names (e.g., `cmdInitExecutePhase`) can stay as-is or be renamed -- this is internal code, not user-facing. But the CLI subcommand strings in the switch/case must change because workflow `.md` files invoke them.

### Workflow Cross-Reference Pattern

Workflows reference each other via Skill() calls:
```
Skill(skill="grd:plan-phase", args="${PHASE_NUM}")
Skill(skill="grd:execute-phase", args="${PHASE_NUM} --no-transition")
Skill(skill="grd:audit-milestone")
Skill(skill="grd:complete-milestone", args="${milestone_version}")
Skill(skill="grd:cleanup")
```

These must all be updated to new command names:
```
Skill(skill="grd:plan-inquiry", args="${PHASE_NUM}")
Skill(skill="grd:conduct-inquiry", args="${PHASE_NUM} --no-transition")
Skill(skill="grd:audit-study")
Skill(skill="grd:complete-study", args="${milestone_version}")
Skill(skill="grd:cleanup")
```

### Config.json Update

`.planning/config.json` contains:
```json
"vault_path": "grd/bin/lib/vault.cjs"
```
Must become:
```json
"vault_path": "grd/bin/lib/vault.cjs"
```

### Scripts Directory

`scripts/verify-rename.cjs` contains `grd` references in its verification logic (checking for stale `gsd-` references that should be `grd-`). This script needs updating to check for stale `grd` references that should be `grd-`. The existing script may be superseded by the new `test/namespace.test.cjs`.

`scripts/rename-gsd-to-grd.cjs` is a historical migration script that can be left as-is (it documents the v1.0->v1.1 migration) or noted as legacy.

### Anti-Patterns to Avoid
- **Partial commits:** Never commit a directory rename without updating all path references in the same commit. This creates a broken intermediate state where `require()` paths fail.
- **Regex over-matching:** When replacing `grd` with `grd`, be careful not to accidentally match within larger strings (e.g., file paths in `.planning/` historical documents that reference old phases). The user decision says to update `.planning/` docs too, but be aware of historical context in archived milestones.
- **Missing the init.cjs subcommand mapping:** The CLI tool routes `init execute-phase` etc. -- if workflow files change to call `grd-tools.cjs init conduct-inquiry`, the CLI must accept that subcommand name.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bulk find-and-replace | Manual file-by-file editing | Node.js script or `sed` batch | 72 files with 699 occurrences -- manual is error-prone |
| Residual detection | Manual grep | Automated test (`namespace.test.cjs`) | Must be durable/repeatable; catches future regressions |
| Directory rename | `fs.rename` + manual git staging | `git mv` | Preserves git history for blame/log |

## Common Pitfalls

### Pitfall 1: Init Subcommand Mismatch
**What goes wrong:** Workflow files call `grd-tools.cjs init conduct-inquiry` but the CLI still only accepts `init execute-phase`.
**Why it happens:** The init subcommand routing in the CLI entry point is easy to overlook since it is a string-matching switch, not a dynamic dispatch.
**How to avoid:** Update the switch/case in the CLI entry point to accept new subcommand names. Either add aliases for backward compat or do a clean rename.
**Warning signs:** Tests pass but workflow execution fails at runtime.

### Pitfall 2: Cross-Reference Breakage in Workflow Files
**What goes wrong:** Workflow A references workflow B by old name in a Skill() call.
**Why it happens:** 41 workflow files with extensive cross-references; easy to miss one.
**How to avoid:** After bulk replacement, grep for any remaining `grd:` in the entire `grd/` tree.
**Warning signs:** Automated scan finds residual references.

### Pitfall 3: Test Assertion Values Not Updated
**What goes wrong:** Tests pass structurally but assert against old `grd-*` agent names.
**Why it happens:** `test/model-profiles.test.cjs` has 25+ hardcoded `grd-*` strings in test expectations.
**How to avoid:** Include test files in the bulk rename scope. The model-profiles test explicitly checks that "every agent key starts with grd-" -- this must become "starts with grd-".
**Warning signs:** Tests fail immediately after rename (this is actually the desired outcome -- failing fast is good).

### Pitfall 4: .planning/ Config Not Updated
**What goes wrong:** Runtime cannot find vault module.
**Why it happens:** `config.json` has `vault_path: "grd/bin/lib/vault.cjs"` which is loaded at runtime.
**How to avoid:** Include `config.json` in the update scope.
**Warning signs:** Any operation that uses vault fails at runtime.

### Pitfall 5: Scaffold Template Contains Old References
**What goes wrong:** Newly scaffolded files (via `cmdScaffold` in commands.cjs) contain stale `grd:discuss-phase` text.
**Why it happens:** Template strings are embedded in `commands.cjs` function `cmdScaffold`.
**How to avoid:** Check the scaffold function's template strings for command references.
**Warning signs:** Namespace test catches it after a scaffold operation.

## Code Examples

### Namespace Regression Test Pattern

```javascript
// test/namespace.test.cjs
const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function findFiles(dir, extensions, results) {
  results = results || [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      findFiles(fullPath, extensions, results);
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function scanForPattern(dir, pattern, extensions) {
  const files = findFiles(dir, extensions);
  const hits = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    if (pattern.test(content)) {
      hits.push(path.relative(ROOT, file));
    }
  }
  return hits;
}

describe('namespace: zero residual grd references', () => {
  const exts = ['.cjs', '.md', '.js'];

  it('no "grd" in grd/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, 'grd'), /grd/g, exts);
    assert.deepStrictEqual(hits, [], 'Residual grd found in: ' + hits.join(', '));
  });

  it('no "grd" in grd/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, 'grd'), /grd/g, exts);
    assert.deepStrictEqual(hits, [], 'Residual grd found in: ' + hits.join(', '));
  });

  it('no "grd" in test/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, 'test'), /grd/g, ['.cjs']);
    assert.deepStrictEqual(hits, [], 'Residual grd in tests: ' + hits.join(', '));
  });
});
```

### Bulk Rename Approach (Discretion: Script vs Manual)

**Recommendation: Use a Node.js script** for the bulk find-and-replace. With 699 occurrences across 72 files, manual editing is not viable. A simple approach:

```javascript
// Pseudocode for bulk rename ordering
const replacements = [
  // 1. Long paths first (avoid partial matches)
  ['grd', 'grd'],
  ['grd-tools.cjs', 'grd-tools.cjs'],
  // 2. Agent name prefix (before generic grd: prefix)
  ['grd-', 'grd-'],
  // 3. Command prefix
  ['grd:', 'grd:'],
  // 4. Brand text
  ['GRD', 'GRD'],
  // 5. Underscore variant
  ['grd', 'grd'],
];
// Apply to all .cjs, .md, .js files in grd/, test/, scripts/
```

**Important ordering:** Apply `grd` replacement BEFORE `grd` replacement to avoid partial matches. The `grd-tools.cjs` replacement should happen before the generic `grd-` agent prefix replacement.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `grd` namespace | `grd` namespace | Phase 17 (this phase) | All user-facing commands, paths, agent names |
| PM vocabulary (execute-phase) | Research vocabulary (conduct-inquiry) | Phase 17 (this phase) | Command names match research mental model |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in test runner v22.x |
| Config file | None (uses `node --test test/*.test.cjs`) |
| Quick run command | `node --test test/namespace.test.cjs` |
| Full suite command | `node --test test/*.test.cjs` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NS-01 | No `/grd:` command refs remain | integration | `node --test test/namespace.test.cjs` | No -- Wave 0 |
| NS-02 | Command vocabulary uses research terms | integration | `node --test test/namespace.test.cjs` | No -- Wave 0 |
| NS-03 | `grd-tools.cjs` exists, `grd-tools.cjs` gone | integration | `node --test test/namespace.test.cjs` | No -- Wave 0 |
| NS-04 | `grd/` exists, `grd/` gone | integration | `node --test test/namespace.test.cjs` | No -- Wave 0 |
| NS-05 | All 19 agents use `grd-*` prefix | unit | `node --test test/model-profiles.test.cjs` | Yes (needs updating) |
| NS-06 | Zero residual `grd` anywhere | integration | `node --test test/namespace.test.cjs` | No -- Wave 0 |
| TEST-02 | Namespace test exists and runs | meta | `node --test test/namespace.test.cjs` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `node --test test/namespace.test.cjs && node --test test/model-profiles.test.cjs`
- **Per wave merge:** `node --test test/*.test.cjs` (full suite, 192+ tests)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `test/namespace.test.cjs` -- covers NS-01, NS-02, NS-03, NS-04, NS-06, TEST-02
- [ ] Update `test/model-profiles.test.cjs` -- existing file needs `grd-*` -> `grd-*` in assertions

## Open Questions

1. **Init subcommand backward compatibility**
   - What we know: The CLI routes init subcommands like `execute-phase`, `plan-phase` via string matching
   - What's unclear: Whether to maintain old subcommand names as aliases or do a clean break
   - Recommendation: Clean break. This is an internal tool with no external consumers. Old names just add confusion.

2. **Scripts directory disposition**
   - What we know: `scripts/verify-rename.cjs` checks for stale `gsd-` (non `grd-`) references; `scripts/rename-gsd-to-grd.cjs` is a historical migration script
   - What's unclear: Whether to update these scripts or mark them as legacy
   - Recommendation: Update `verify-rename.cjs` to check for stale `grd` -> `grd` OR replace it entirely since `test/namespace.test.cjs` subsumes its purpose. Leave `rename-gsd-to-grd.cjs` as historical artifact.

3. **`.planning/` historical documents scope**
   - What we know: User decision says "update everything" in `.planning/` docs. There are 200+ `grd` references in `.planning/` across PLAN.md, RESEARCH.md, SUMMARY.md files from prior phases.
   - What's unclear: Whether archived milestone docs (`.planning/milestones/`) should also be updated
   - Recommendation: Update current milestone `.planning/phases/` documents. Archived milestones are historical records and could be left as-is OR updated -- the namespace test should exclude `.planning/milestones/` if they are left historical.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis: `grd/bin/lib/model-profiles.cjs` -- 19 agent names verified
- Direct codebase analysis: `grd/bin/lib/init.cjs` -- init subcommand routing verified
- Direct codebase analysis: `grd/bin/lib/commands.cjs` -- scaffold templates verified
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` lines 440-464 -- 23-command mapping table
- `test/model-profiles.test.cjs` -- test assertions with hardcoded agent names verified
- `.planning/config.json` -- vault_path reference verified
- `grep -rc` analysis: 699 grd references in 72 files, 234 grd path references

### Secondary (MEDIUM confidence)
- Workflow cross-reference analysis via grep -- Skill() call patterns identified in 5 files; may be more

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, pure mechanical rename
- Architecture: HIGH - exhaustive inventory of all reference types from direct codebase analysis
- Pitfalls: HIGH - all derived from actual code inspection, not hypothetical

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable -- no external dependencies to go stale)
