# Phase 1: Fork and Foundation - Research

**Researched:** 2026-03-11
**Domain:** CLI meta-prompting fork, npm packaging, Git LFS configuration
**Confidence:** HIGH

## Summary

Phase 1 is a structural fork-and-rename operation. The upstream GSD repo (get-shit-done-cc v1.22.4) is MIT-licensed, 148 files, 1.3MB unpacked. It installs by copying commands, agents, workflows, templates, and references into `~/.claude/`. The fork must rename all `/gsd:*` references to `/grd:*`, rename the `commands/gsd/` directory to `commands/grd/`, rename `get-shit-done/` to `grd/`, rename `gsd-tools.cjs` to `grd-tools.cjs`, and rename all agent files from `gsd-*` to `grd-*`. There are approximately 1,071 string occurrences across all files that reference "gsd" in some form (398 `/gsd:` command references, 322 `get-shit-done` path references, 183 `gsd-tools.cjs` references, and 168 agent name references).

The install.js file (88KB, ~2400 lines) handles multi-runtime installation (Claude, OpenCode, Gemini, Codex). It performs path replacement on all `.md` files during copy, substituting `~/.claude/` with the target runtime's config directory. For GRD, install.js needs the same path replacement but with `grd` as the directory name and `grd-tools.cjs` as the tool entry point.

Git LFS must be configured via `.gitattributes` before any binary files are committed. The project also needs three new templates (research note, SOURCE-LOG, BOOTSTRAP), vault_path in config.json, and a basic filesystem vault write capability.

**Primary recommendation:** Clone the repo, perform a systematic find-and-replace of all gsd->grd patterns using a documented translation table, then layer on the new templates and config extensions. Do NOT hand-edit 148 files individually -- use scripted replacements with manual verification of edge cases.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Clone from https://github.com/gsd-build/get-shit-done (not copy from global install)
- Maintain GSD's five-layer structure: commands/, agents/, workflows/, templates/, references/
- Preserve upstream's zero-dependency CJS architecture
- Rename tooling entry point from gsd-tools.cjs to grd-tools.cjs (or equivalent)
- Scoped npm package name for eventual publication (e.g., @grd/cli or grd)
- All /gsd:* commands become /grd:* commands
- Commands live at project root following GSD's installable structure (not ~/.claude/)
- bin/install.js copies files to ~/.claude/ on npx install (same pattern as upstream)
- Research note template: YAML frontmatter (project, domain, status, date, sources) + Key Findings + Analysis + Implications for [Project] + Open Questions + References
- SOURCE-LOG.md template: table format (Source, URL, Method, File, Status, Notes)
- BOOTSTRAP.md template: three tiers (Established / Partially Established / Not Yet Researched)
- Research task XML template: <task type="research"> with <src method="" format=""> blocks
- Track *.pdf, *.png, *.jpg, *.jpeg, *.gif, *.svg in .gitattributes via Git LFS
- Configure LFS before any binary files are committed
- Add vault_path to config.json schema (string, required for research projects)
- Add commit_research: true as default
- Preserve all existing GSD config fields
- Default write method is direct filesystem (no Obsidian MCP dependency)
- vault_path is an absolute path to the research output directory
- Writing a note creates both the .md file and its -sources/ sibling folder

### Claude's Discretion
- Exact scoped package name choice
- Whether to rename internal file references immediately or incrementally
- .gitignore contents beyond standard Node.js defaults
- README.md content for the forked repo

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FORK-01 | GSD repo cloned and restructured as GRD | Upstream repo is 148 files, MIT licensed. Clone + systematic rename with translation table (see Renaming Patterns section). |
| FORK-02 | All `/gsd:*` commands renamed to `/grd:*` with clean namespace separation | 398 `/gsd:` references across all files. Commands directory renamed from `commands/gsd/` to `commands/grd/`. Frontmatter `name:` field in each command file. |
| FORK-03 | Package renamed and scoped for npm publication | Upstream is `get-shit-done-cc`. Use `grd` (unscoped) per upstream pattern. `bin` field, `files` field, `engines` field all documented. |
| FORK-04 | Git LFS configured for binary files before first binary commit | `.gitattributes` with LFS tracking for *.pdf, *.png, *.jpg, *.jpeg, *.gif, *.svg. Must be committed before Phase 3 source acquisition. |
| FOUN-01 | Filesystem vault write -- notes and sources written to disk at configurable vault_path | New `vault.cjs` module in `bin/lib/`. Uses `fs/promises.writeFile()` + `fs/promises.mkdir()`. Creates note + sibling `-sources/` folder atomically. |
| FOUN-02 | File naming convention enforced: `{descriptive-slug}_{date-acquired}.{ext}` | Convention documented in GRD-Fork-Plan.md. Implement as a `generateSourceFilename(slug, ext)` utility in vault.cjs. |
| FOUN-03 | Research note template with frontmatter and fixed sections | Template format fully specified in GRD-Fork-Plan.md (see Research Note Template section). Create as `templates/research-note.md`. |
| FOUN-04 | vault_path configurable in config.json | Add to `templates/config.json` template. Parse in `lib/config.cjs`. Validate as absolute path in vault.cjs. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | >=18.0.0 | Runtime | GSD targets >=16.7.0 but Node 16 is EOL. Node 18 is LTS floor. |
| CommonJS (.cjs) | N/A | Module format | GSD is entirely CJS. Preserve this. |
| node:fs/promises | Built-in | File operations | Vault writes, template copies, directory creation |
| node:child_process | Built-in | Git operations | `execFile` for git commands (not `exec` -- avoids shell injection) |
| node:path | Built-in | Path manipulation | Standard. Used throughout GSD. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| git lfs | System binary | Large file storage | Configured via .gitattributes, used automatically by git |
| esbuild | ^0.24.0 | Build hooks | Already in GSD upstream as devDependency |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Unscoped `grd` | Scoped `@grd/cli` | Scoped requires npm org setup, `--access public` on first publish, but avoids all name conflicts. Unscoped matches upstream pattern and simplifies `npx` invocation. **Recommend: `grd` (unscoped)** -- simpler for users, matches upstream convention. |
| Scripted find-and-replace | Manual file editing | Manual editing of 148 files is error-prone. Script is essential. |

**Installation:**
```bash
# Clone upstream
git clone https://github.com/gsd-build/get-shit-done.git grd
cd grd

# No production dependencies to install
npm install  # installs only devDeps: esbuild, c8
```

## Architecture Patterns

### Upstream GSD File Organization (from npm pack inspection)

```
get-shit-done-cc/                  # npm package root
  package.json                     # bin, files, engines, scripts
  LICENSE                          # MIT
  README.md                        # 26.7KB
  bin/
    install.js                     # 88KB -- entry point for npx, copies to ~/.claude/
  commands/
    gsd/                           # 32 command files (thin shims, 0.4-5.5KB each)
      new-project.md
      plan-phase.md
      execute-phase.md
      verify-work.md
      ... (28 more)
  agents/                          # 12 agent files (5-43KB each)
    gsd-executor.md
    gsd-planner.md
    gsd-phase-researcher.md
    gsd-verifier.md
    gsd-plan-checker.md
    ... (7 more)
  get-shit-done/                   # Runtime core
    VERSION
    bin/
      gsd-tools.cjs               # 23KB main entry
      lib/
        commands.cjs               # 18KB
        config.cjs                 # 5.2KB
        core.cjs                   # 18.7KB
        frontmatter.cjs            # 12KB
        init.cjs                   # 23KB
        milestone.cjs              # 8.7KB
        phase.cjs                  # 30KB
        roadmap.cjs                # 10.6KB
        state.cjs                  # 28KB
        template.cjs               # 7.2KB
        verify.cjs                 # 31KB
    references/                    # 13 reference files
    templates/                     # 26 template files + subdirs
    workflows/                     # 34 workflow files
  hooks/
    dist/                          # 3 pre-built JS hook files
  scripts/
    build-hooks.js
    run-tests.cjs
```

### GRD Target Structure (after fork)

```
grd/                   # npm package root (renamed)
  package.json                     # name: "grd", bin: "grd"
  LICENSE                          # MIT (preserve upstream + add fork attribution)
  bin/
    install.js                     # Forked: replaces gsd -> grd patterns
  commands/
    grd/                         # Renamed from gsd/
      new-project.md               # All 32 commands, renamed references
      ...
  agents/
    grd-executor.md              # All 12 agents, renamed
    grd-planner.md
    ...
  grd/                 # Runtime core (renamed)
    VERSION
    bin/
      grd-tools.cjs              # Renamed from gsd-tools.cjs
      lib/
        commands.cjs               # Internal files keep names (no external refs)
        config.cjs
        core.cjs
        frontmatter.cjs
        init.cjs
        milestone.cjs
        phase.cjs
        roadmap.cjs
        state.cjs
        template.cjs
        verify.cjs
        vault.cjs                  # NEW: vault write operations
    references/
      (all 13 existing + 3 new: source-protocol.md, note-format.md, research-verification.md)
    templates/
      (all 26 existing + 4 new: research-note.md, source-log.md, bootstrap.md, research-task.md)
      config.json                  # Modified: +vault_path, +commit_research
    workflows/
      (all 34 existing, modified references)
  hooks/
    dist/
  scripts/
```

### Renaming Patterns -- Complete Translation Table

The following string replacements must be applied systematically across all `.md`, `.cjs`, and `.js` files:

| Pattern | Replacement | Occurrence Count | Files Affected |
|---------|-------------|-----------------|----------------|
| `gsd:` (in command names, frontmatter `name:` field) | `grd:` | ~398 | commands/, workflows/, agents/ |
| `get-shit-done` (directory paths) | `grd` | ~322 | workflows/, commands/, agents/, install.js |
| `gsd-tools.cjs` (tool invocations) | `grd-tools.cjs` | ~183 | workflows/, agents/ |
| `gsd-executor` (agent name) | `grd-executor` | ~17 | workflows/, commands/ |
| `gsd-planner` (agent name) | `grd-planner` | ~38 | workflows/, commands/ |
| `gsd-phase-researcher` (agent name) | `grd-phase-researcher` | ~20 | workflows/, commands/ |
| `gsd-project-researcher` (agent name) | `grd-project-researcher` | ~12 | workflows/, commands/ |
| `gsd-plan-checker` (agent name) | `grd-plan-checker` | ~17 | workflows/, commands/ |
| `gsd-verifier` (agent name) | `grd-verifier` | ~12 | workflows/, commands/ |
| `grdoadmapper` (agent name) | `grd-roadmapper` | ~13 | workflows/, commands/ |
| `grdesearch-synthesizer` (agent name) | `grd-research-synthesizer` | ~7 | workflows/, commands/ |
| `gsd-codebase-mapper` (agent name) | `grd-codebase-mapper` | ~15 | workflows/, commands/ |
| `gsd-debugger` (agent name) | `grd-debugger` | ~14 | workflows/, commands/ |
| `gsd-integration-checker` (agent name) | `grd-integration-checker` | ~5 | workflows/, commands/ |
| `gsd-nyquist-auditor` (agent name) | `grd-nyquist-auditor` | ~8 | workflows/, commands/ |
| `commands/gsd` (directory reference) | `commands/grd` | ~4 | install.js |
| `get-shit-done-cc` (package name) | `grd` | package.json, install.js |

**Order matters:** Replace longer patterns first to avoid partial matches. Specifically:
1. Agent names (longest first): `grdesearch-synthesizer` before `grdesearcher`
2. Tool name: `gsd-tools.cjs` before bare `gsd`
3. Command namespace: `/gsd:` -> `/grd:`
4. Directory: `get-shit-done` -> `grd`
5. Package name: `get-shit-done-cc` -> `grd`

**Edge cases to watch:**
- The string `gsd` appears inside words like `gsd-build` (GitHub org name) -- do NOT rename
- URLs containing `gsd-build/get-shit-done` should be preserved (they reference upstream)
- The `gsd_state_version` YAML key in STATE.md should become `grd_state_version` or be kept as-is for backward compatibility
- install.js has hardcoded regex patterns like `/gsd-/` for cleaning old agents -- must update

### Pattern: install.js Path Replacement

**What:** install.js reads every `.md` file and replaces `~/.claude/` with the target runtime path using regex. It also replaces `$HOME/.claude/` and `./.claude/` patterns. For GRD, the same mechanism applies but with `grd` paths.

**Key install.js functions to modify:**
- `copyWithPathReplacement()` -- the core copy function (line 1117)
- `install()` -- main install function (line 1875), references `get-shit-done` directory
- `copyFlattenedCommands()` -- OpenCode flat command structure (line 998)
- `copyCommandsAsCodexSkills()` -- Codex skills structure (line 1056)
- Agent cleanup: line 1972 has `file.startsWith('gsd-')` -- change to `grd-`
- Banner text (line 177): update from GSD to GRD
- Codex config constants (line 19): `CODEX_AGENT_SANDBOX` maps agent names to permissions

### Pattern: Command Structure

**What:** Each command is a thin markdown file with YAML frontmatter declaring `name`, `description`, `argument-hint`, `allowed-tools`. The body has `<execution_context>` with `@` references to workflows and templates using absolute paths (`@~/.claude/get-shit-done/workflows/...`).

**Example transformation:**
```markdown
# Before (GSD)
---
name: gsd:execute-phase
agent: gsd-planner
---
<execution_context>
@~/.claude/get-shit-done/workflows/execute-phase.md
@~/.claude/get-shit-done/references/ui-brand.md
</execution_context>

# After (GRD)
---
name: grd:execute-phase
agent: grd-planner
---
<execution_context>
@~/.claude/grd/workflows/execute-phase.md
@~/.claude/grd/references/ui-brand.md
</execution_context>
```

### Anti-Patterns to Avoid
- **Hand-editing 148 files individually:** Use scripted replacement with verification. Manual edits are error-prone with 1,071+ occurrences.
- **Partial rename (some files gsd, some grd):** Creates runtime failures when renamed commands reference unrenamed workflows. All-or-nothing rename.
- **Modifying lib/*.cjs internal filenames:** These are internal modules with no external name references. Renaming `config.cjs` to `grd-config.cjs` adds zero value and creates unnecessary churn.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Git LFS configuration | Custom binary tracking logic | `.gitattributes` + `git lfs track` | LFS is battle-tested; custom solutions miss edge cases (renamed files, history rewriting) |
| String replacement across 148 files | Manual find-and-replace per file | A single Node.js rename script | Consistency, repeatability, verifiability |
| npm package publishing flow | Custom publish scripts | Standard `npm publish` + `npm pack --dry-run` for verification | npm handles scoping, access control, registry interaction |
| YAML frontmatter parsing | Regex-based parsing | `gray-matter` (if needed later) or GSD's existing frontmatter.cjs | GSD already has frontmatter.cjs that handles parsing for STATE.md and PLAN.md |
| Path validation for vault_path | Ad-hoc string checks | `node:path.isAbsolute()` + `node:fs.accessSync()` | Built-in, cross-platform |

## Common Pitfalls

### Pitfall 1: Partial Rename Breaks Runtime
**What goes wrong:** Some files reference `/gsd:execute-phase` while others reference `/grd:execute-phase`. Claude Code cannot resolve the mixed namespace and commands silently fail.
**Why it happens:** Renaming 1,071+ occurrences across 148 files by hand guarantees missed references.
**How to avoid:** Use a scripted rename with a verification step that greps for any remaining bare `gsd` references (excluding URLs and comments). Run the verification AFTER the rename.
**Warning signs:** `grep -r '/gsd:' commands/grd/` returns matches after rename.

### Pitfall 2: install.js Self-References Break
**What goes wrong:** install.js has its own internal references to `gsd-` prefixed agent names (line 19: CODEX_AGENT_SANDBOX, line 1972: agent cleanup). If these are not updated, the installer silently skips agent installation or fails cleanup.
**Why it happens:** install.js is 88KB with many hardcoded string patterns. Easy to miss internal constants and regex patterns.
**How to avoid:** Search install.js specifically for ALL occurrences of `gsd-` and `get-shit-done` and update each one. There are approximately 50+ references in install.js alone.
**Warning signs:** `npx grd` runs but agents directory is empty or contains old `gsd-` named files.

### Pitfall 3: Git LFS Not Initialized Before Binary Commit
**What goes wrong:** A binary PDF is committed to git without LFS tracking. Retroactively adding LFS requires `git lfs migrate import` which rewrites all history and requires force-push.
**Why it happens:** `.gitattributes` is forgotten or committed after the first binary.
**How to avoid:** `.gitattributes` with LFS patterns must be the FIRST commit in the repo, before any binary files exist. Phase 1 creates this. Phase 3 (source acquisition) adds binaries.
**Warning signs:** `git lfs ls-files` returns nothing after binary commits.

### Pitfall 4: vault_path Tilde Expansion
**What goes wrong:** User sets `vault_path: "~/research-vault"` in config.json. Node.js does NOT expand `~` natively. All file writes fail with ENOENT.
**Why it happens:** Shell expands `~` but Node.js `fs` APIs do not. This is a well-documented Node.js behavior (nodejs/node#684).
**How to avoid:** In vault.cjs, expand tilde manually: `if (p.startsWith('~/')) p = path.join(os.homedir(), p.slice(2))`. GSD's install.js already has an `expandTilde()` function -- reuse it.
**Warning signs:** ENOENT errors when vault_path starts with `~`.

### Pitfall 5: npm Package Missing Files
**What goes wrong:** `npx grd` installs but commands/agents/workflows are missing because the `files` field in package.json doesn't include the renamed directories.
**Why it happens:** The `files` field in package.json is an allowlist. Renamed directories (`grd/` instead of `get-shit-done/`) must be explicitly listed.
**How to avoid:** Update `package.json` `files` field immediately after directory rename. Verify with `npm pack --dry-run` which lists all files that would be published.
**Warning signs:** `npm pack --dry-run` shows fewer files than expected.

## Code Examples

### Git LFS .gitattributes Configuration
```
# Source: Git LFS documentation
# Configure BEFORE any binary files are committed

# PDF documents (research papers)
*.pdf filter=lfs diff=lfs merge=lfs -text

# Images
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
*.jpeg filter=lfs diff=lfs merge=lfs -text
*.gif filter=lfs diff=lfs merge=lfs -text
*.svg filter=lfs diff=lfs merge=lfs -text
```

### Rename Script Pattern (Node.js)
```javascript
// Source: project-specific implementation pattern
const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
  // Order: longest patterns first to avoid partial matches
  ['grdesearch-synthesizer', 'grd-research-synthesizer'],
  ['gsd-integration-checker', 'grd-integration-checker'],
  ['gsd-project-researcher', 'grd-project-researcher'],
  ['gsd-phase-researcher', 'grd-phase-researcher'],
  ['gsd-codebase-mapper', 'grd-codebase-mapper'],
  ['gsd-nyquist-auditor', 'grd-nyquist-auditor'],
  ['gsd-plan-checker', 'grd-plan-checker'],
  ['grdoadmapper', 'grd-roadmapper'],
  ['gsd-executor', 'grd-executor'],
  ['gsd-debugger', 'grd-debugger'],
  ['gsd-planner', 'grd-planner'],
  ['gsd-verifier', 'grd-verifier'],
  ['gsd-tools.cjs', 'grd-tools.cjs'],
  ['get-shit-done-cc', 'grd'],
  ['get-shit-done', 'grd'],  // directory paths
  ['/gsd:', '/grd:'],                  // command namespace
  ['commands/gsd/', 'commands/grd/'],   // directory references
];

// Apply replacements to file content (NOT to URLs referencing upstream)
function renameContent(content) {
  for (const [from, to] of REPLACEMENTS) {
    content = content.replaceAll(from, to);
  }
  return content;
}
```

### config.json Template (Extended for GRD)
```json
{
  "mode": "interactive",
  "granularity": "standard",
  "vault_path": "",
  "commit_research": true,
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "auto_advance": false,
    "nyquist_validation": true
  },
  "planning": {
    "commit_docs": true,
    "search_gitignored": false
  },
  "parallelization": {
    "enabled": true,
    "plan_level": true,
    "task_level": false,
    "skip_checkpoints": true,
    "max_concurrent_agents": 3,
    "min_plans_for_parallel": 2
  },
  "gates": {
    "confirm_project": true,
    "confirm_phases": true,
    "confirm_roadmap": true,
    "confirm_breakdown": true,
    "confirm_plan": true,
    "execute_next_plan": true,
    "issues_review": true,
    "confirm_transition": true
  },
  "safety": {
    "always_confirm_destructive": true,
    "always_confirm_external_services": true
  }
}
```

### Filesystem Vault Write (vault.cjs skeleton)
```javascript
// Source: pattern from GRD-Fork-Plan.md vault write protocol
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

function expandTilde(p) {
  if (p && p.startsWith('~/')) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
}

async function ensureVaultDir(vaultPath, notePath) {
  const resolvedVault = expandTilde(vaultPath);
  if (!path.isAbsolute(resolvedVault)) {
    throw new Error(`vault_path must be absolute, got: ${vaultPath}`);
  }
  const fullDir = path.dirname(path.join(resolvedVault, notePath));
  await fs.mkdir(fullDir, { recursive: true });
  return resolvedVault;
}

async function writeNote(vaultPath, notePath, content) {
  const resolved = await ensureVaultDir(vaultPath, notePath);
  const fullPath = path.join(resolved, notePath);

  // Create -sources/ sibling folder
  const sourcesDir = fullPath.replace(/\.md$/, '-sources');
  await fs.mkdir(sourcesDir, { recursive: true });

  // Write the note
  await fs.writeFile(fullPath, content, 'utf8');

  return { notePath: fullPath, sourcesDir };
}

function generateSourceFilename(slug, ext) {
  const date = new Date().toISOString().split('T')[0];
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  return `${safeSlug}_${date}.${ext}`;
}

module.exports = { writeNote, ensureVaultDir, generateSourceFilename, expandTilde };
```

### package.json for GRD
```json
{
  "name": "grd",
  "version": "0.1.0",
  "description": "A research-oriented fork of get-shit-done-cc. Meta-prompting system for AI research workflows with source attachment.",
  "bin": {
    "grd": "bin/install.js"
  },
  "files": [
    "bin",
    "commands",
    "grd",
    "agents",
    "hooks/dist",
    "scripts"
  ],
  "keywords": [
    "claude",
    "claude-code",
    "ai",
    "research",
    "meta-prompting",
    "context-engineering"
  ],
  "author": "Jeremiah Wolf",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "devDependencies": {
    "c8": "^11.0.0",
    "esbuild": "^0.24.0"
  },
  "scripts": {
    "build:hooks": "node scripts/build-hooks.js",
    "prepublishOnly": "npm run build:hooks",
    "test": "node scripts/run-tests.cjs"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GSD v1.22.4 (current upstream) | Fork as GRD | Now (Phase 1) | New atomic unit: research note instead of git commit |
| Single `gsd-tools.cjs` entry | Same pattern, renamed to `grd-tools.cjs` | Phase 1 | New `vault.cjs` lib module added |
| No vault write capability | Filesystem vault write at configurable path | Phase 1 | Foundation for all research workflow features |

**Upstream license:** MIT. Fork, rename, and redistribute are explicitly permitted. Must preserve copyright notice.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in test runner + custom `scripts/run-tests.cjs` |
| Config file | `scripts/run-tests.cjs` (inherited from upstream) |
| Quick run command | `node scripts/run-tests.cjs` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORK-01 | Repo cloned and restructured | smoke | `ls commands/grd/ agents/ grd/bin/grd-tools.cjs` | -- Wave 0 |
| FORK-02 | All /gsd:* renamed to /grd:* | unit | `grep -r '/gsd:' commands/ agents/ grd/ \| grep -v 'grd:' \| grep -v http` | -- Wave 0 |
| FORK-03 | Package scoped for npm | smoke | `npm pack --dry-run 2>&1 \| grep 'grd'` | -- Wave 0 |
| FORK-04 | Git LFS configured | smoke | `cat .gitattributes \| grep 'filter=lfs'` | -- Wave 0 |
| FOUN-01 | Vault write creates note + sources dir | unit | `node -e "require('./grd/bin/lib/vault.cjs')"` | -- Wave 0 |
| FOUN-02 | File naming convention | unit | Test `generateSourceFilename('test-slug', 'pdf')` output format | -- Wave 0 |
| FOUN-03 | Research note template exists | smoke | `test -f grd/templates/research-note.md` | -- Wave 0 |
| FOUN-04 | vault_path in config.json template | smoke | `grep vault_path grd/templates/config.json` | -- Wave 0 |

### Sampling Rate
- **Per task commit:** `node scripts/run-tests.cjs` (quick)
- **Per wave merge:** `npm test` + manual verification of rename completeness
- **Phase gate:** Full suite green + `grep -r '/gsd:' commands/grd/ grd/ agents/` returns zero matches (excluding URLs)

### Wave 0 Gaps
- [ ] `scripts/verify-rename.cjs` -- validates no stale `gsd` references remain (excludes URLs to upstream)
- [ ] `scripts/test-vault.cjs` -- unit tests for vault.cjs (writeNote, generateSourceFilename, expandTilde)
- [ ] Existing `scripts/run-tests.cjs` may need updating to reference `grd/` paths

## Open Questions

1. **Exact scoped package name**
   - What we know: Upstream is `get-shit-done-cc` (unscoped). Fork plan mentions both `@grd/cli` and `grd`.
   - What's unclear: Whether to scope or not.
   - Recommendation: Use `grd` (unscoped) for simplicity. Matches upstream convention. Avoids npm org setup. Can always add a scoped alias later.

2. **install.js multi-runtime support**
   - What we know: GSD supports Claude, OpenCode, Gemini, Codex. Each has different directory structures and command formats.
   - What's unclear: Whether GRD needs all four runtimes or just Claude.
   - Recommendation: Keep all runtime support for now (it's already built). Rename patterns apply to all runtimes. Cut runtimes later if needed.

3. **Git LFS availability on user systems**
   - What we know: Git LFS is NOT installed on the current development machine. It requires separate installation (`brew install git-lfs` on macOS).
   - What's unclear: Whether to make LFS a hard requirement or graceful degradation.
   - Recommendation: Document LFS as a requirement. Add a check in install.js or new-project workflow. Phase 3 (source acquisition) is where binaries actually arrive -- so LFS just needs to be configured, not necessarily installed on every contributor's machine yet.

4. **Whether `gsd_state_version` YAML key should be renamed**
   - What we know: STATE.md uses `gsd_state_version: 1.0` in frontmatter. This is parsed by `state.cjs`.
   - What's unclear: Whether renaming to `grd_state_version` breaks backward compatibility.
   - Recommendation: Rename to `grd_state_version` since this is a clean fork, not a backward-compatible extension. No existing GRD projects to break.

## Sources

### Primary (HIGH confidence)
- GSD npm package v1.22.4 (`npm pack --dry-run` + extracted tarball at `/tmp/package/`) -- complete file inventory, package.json structure, install.js logic
- GSD installed at `~/.claude/` -- runtime directory structure
- GRD-Fork-Plan.md in project root -- authoritative spec for fork strategy, templates, naming conventions
- CONTEXT.md (01-CONTEXT.md) -- locked decisions from discuss phase

### Secondary (MEDIUM confidence)
- Git LFS documentation (Atlassian) -- `.gitattributes` configuration patterns
- npm documentation -- scoped packages, `files` field, `bin` field, `--access public`

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- directly inspected upstream package, zero ambiguity
- Architecture: HIGH -- examined all 148 upstream files, counted all renaming patterns
- Pitfalls: HIGH -- derived from actual code inspection (install.js hardcoded patterns, path replacement logic, tilde expansion gap)
- Renaming patterns: HIGH -- actual grep counts from extracted npm package

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable domain -- fork structure unlikely to change)
