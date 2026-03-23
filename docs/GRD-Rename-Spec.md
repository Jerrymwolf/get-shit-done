# GRD v2.0 Spec: Rename + Research-Native Commands + Source Pipeline Wiring

**Goal:** Three workstreams that transform GSD-R into GRD:

1. **Rename** — Eliminate all "GSD-R" / "Get Shit Done R" / "get-shit-done-r" branding
2. **Research-native command vocabulary** — Replace PM-style command names with research-native equivalents
3. **Wire the source acquisition pipeline** — Connect the built-but-unwired components that make GRD actually acquire and verify sources

**Execution order:** Workstream 1 must complete before Workstream 2 starts (W2 operates on already-renamed files). Workstream 3 is independent and can run in parallel with W2 or after it.

---

## Workstream 1: Rename (GSD-R → GRD)

### 1.1 GitHub Repo Rename

**Manual step (do first — affects all URL references):**

- Go to https://github.com/Jerrymwolf/get-shit-done → Settings → Repository name
- Change to `get-research-done`
- GitHub auto-redirects old URLs, but update all hardcoded references anyway

### 1.2 File & Directory Renames

#### Command Directory

```
commands/gsd-r/  →  commands/grd/
```

All 34 command files move with the directory. Some will also be renamed in Workstream 2.

#### Agent Files (16 files in `agents/`)

These are the orchestration-level agents that get installed by `bin/install.js`:

```
agents/gsd-r-architecture-researcher.md  →  agents/grd-architecture-researcher.md
agents/gsd-r-codebase-mapper.md          →  agents/grd-codebase-mapper.md
agents/gsd-r-debugger.md                 →  agents/grd-debugger.md
agents/gsd-r-executor.md                 →  agents/grd-executor.md
agents/gsd-r-integration-checker.md      →  agents/grd-integration-checker.md
agents/gsd-r-limitations-researcher.md   →  agents/grd-limitations-researcher.md
agents/gsd-r-methods-researcher.md       →  agents/grd-methods-researcher.md
agents/gsd-r-nyquist-auditor.md          →  agents/grd-nyquist-auditor.md
agents/gsd-r-phase-researcher.md         →  agents/grd-phase-researcher.md
agents/gsd-r-plan-checker.md             →  agents/grd-plan-checker.md
agents/gsd-r-planner.md                  →  agents/grd-planner.md
agents/gsd-r-project-researcher.md       →  agents/grd-project-researcher.md
agents/gsd-r-research-synthesizer.md     →  agents/grd-research-synthesizer.md
agents/gsd-r-roadmapper.md              →  agents/grd-roadmapper.md
agents/gsd-r-source-researcher.md        →  agents/grd-source-researcher.md
agents/gsd-r-verifier.md                →  agents/grd-verifier.md
```

**Note:** There are also 4 research-specific agents in `grd/agents/` (grd-argument-constructor.md, grd-framework-integrator.md, grd-gap-analyzer.md, grd-thematic-synthesizer.md). These already use `grd` naming and are clean — no changes needed. These are bundled inside the `grd/` library directory (installed to `~/.claude/grd/agents/`), separate from the top-level `agents/` directory (installed to `~/.claude/agents/`).

#### Hook Files (3 files)

```
hooks/gsd-check-update.js    →  hooks/grd-check-update.js
hooks/gsd-statusline.js      →  hooks/grd-statusline.js
hooks/gsd-context-monitor.js →  hooks/grd-context-monitor.js
```

Hook file **contents** are already clean (verified: 0 internal references to old naming).

#### Other Files

```
GSD-R-Fork-Plan.md  →  GRD-Fork-Plan.md
```

#### Scripts Directory — Cleanup

These are migration tools from the original GSD-to-GSD-R rename. They should be **deleted** (no longer needed):

```
scripts/rename-gsd-to-gsd-r.cjs   →  DELETE
scripts/bulk-rename-planning.cjs   →  DELETE
```

`scripts/verify-rename.cjs` should be **rewritten** to verify the GRD rename instead (update all patterns from `gsd-r` to `grd`). Alternatively, delete it and rely on the grep-based verification checklist at the end of this spec.

### 1.3 Bulk Content Replacements

Run these in order across all files **excluding** `.planning/`, `node_modules/`, and `package-lock.json`.

**Important:** Passes are ordered from most-specific to least-specific to prevent double-replacement. Run each pass completely before starting the next.

| Pass | Find | Replace | Notes |
|---|---|---|---|
| 1 | `/gsd-r:` | `/grd:` | Command prefix. Safe — unique delimiter means no false positives |
| 2 | `GSD-R` | `GRD` | Branded name. Case-sensitive, no false positives. Exception: keep upstream "GSD" (no hyphen-R) attribution as-is |
| 3 | `get-shit-done-r` | `grd` | All path and package refs. Do NOT also run a separate pass for `~/.claude/get-shit-done-r` — this pass catches it |
| 4 | `gsd-r-tools.cjs` | `grd-tools.cjs` | Tool binary filename (if any stragglers after pass 3) |
| 5 | `gsd_state_version` | `grd_state_version` | State variable name in tests and README |
| 6 | `gsd-r-` (agent name prefix) | `grd-` | Agent name references inside install.js CODEX_AGENT_SANDBOX mapping and any remaining agent cross-refs |

**What about bare `get-shit-done` (without `-r`)?** There are ~26 instances in `bin/install.js` but they all refer to the **upstream GSD package** installation path — these are intentional and correct. Do NOT change them.

**What about bare `gsd-` (without `-r`)?** The `.gitignore` has patterns like `.github/agents/gsd-*` and `.github/skills/gsd-*`. These refer to Codex/Copilot skill directories that the installer creates. Update them — see section 1.5.

### 1.4 install.js Internal Renames

| Find | Replace |
|---|---|
| `GSD_CODEX_MARKER` | `GRD_CODEX_MARKER` |
| `GSD_COPILOT_INSTRUCTIONS_MARKER` | `GRD_COPILOT_INSTRUCTIONS_MARKER` |
| `GSD Agent Configuration` (string literal) | `GRD Agent Configuration` |
| `GSD Configuration` (string literal) | `GRD Configuration` |
| `codexGsdPath` | `codexGrdPath` |
| All `gsd-r-` agent name mappings in CODEX_AGENT_SANDBOX | `grd-` equivalents |
| Banner/help text referencing "Get Shit Done" for this fork | Update to "Get Research Done" / "GRD" |

**Note:** install.js also manages the upstream GSD package (`get-shit-done-cc`). Leave those references intact — they handle coexistence between GSD and GRD installs.

### 1.5 Config File Updates

#### .gitignore

```
.github/agents/gsd-*          →  .github/agents/grd-*
.github/skills/gsd-*          →  .github/skills/grd-*
.github/get-shit-done/*       →  .github/grd/*
.github/skills/get-shit-done  →  .github/skills/grd
```

#### .claude/settings.local.json

```
get-shit-done-r/bin/lib/*.cjs  →  grd/bin/lib/*.cjs
get-shit-done-r/workflows/*.md →  grd/workflows/*.md
Skill(gsd:*)                   →  Skill(grd:*)
```

#### package.json

The `files` array currently includes `"get-research-done"` but **this directory does not exist** — the actual directory is `grd/`. Fix:

```json
"files": [
  "bin",
  "commands",
  "grd",
  "agents",
  "hooks/dist",
  "scripts"
]
```

The `name` field stays `"get-research-done"` (npm package name).

### 1.6 Test Updates

#### test/smoke.test.cjs

- Update all 16 agent filename references: `gsd-r-*.md` → `grd-*.md`
- Update command directory: `commands/gsd-r/` → `commands/grd/`

#### test/state.test.cjs

- `gsd_state_version` → `grd_state_version`

### 1.7 docs/DESIGN.md

This file contains **65 instances** of `/gsd-r:` command references throughout. Apply the same bulk replacements as the rest of the codebase:

- `/gsd-r:` → `/grd:`
- `GSD-R` → `GRD`

Then in Workstream 2, also apply the command vocabulary renames.

### 1.8 Verify `grd/` Directory

The root `grd/` directory already exists with:
- `grd/agents/` (4 research-specific agents) — **verified clean**
- `grd/bin/grd-tools.cjs` and `grd/bin/lib/` (21 .cjs files) — **verified clean**
- `grd/references/` — **verified clean**
- `grd/templates/` — **verified clean**
- `grd/workflows/` (42 files) — **17 files contain old command vocabulary** (addressed in Workstream 2)

---

## Workstream 2: Research-Native Command Vocabulary

Replace PM-style command names with research-native equivalents. This affects command filenames, workflow cross-references, docs, and the README.

**Prerequisite:** Workstream 1 must be complete. All files are already under `commands/grd/` and use `/grd:` prefix.

### 2.1 Core Workflow Commands (6 Renames)

| Old File (post-W1) | New File | Old Invocation (post-W1) | New Invocation |
|---|---|---|---|
| `commands/grd/new-project.md` | `commands/grd/new-research.md` | `/grd:new-project` | `/grd:new-research` |
| `commands/grd/discuss-phase.md` | `commands/grd/scope-inquiry.md` | `/grd:discuss-phase` | `/grd:scope-inquiry` |
| `commands/grd/plan-phase.md` | `commands/grd/plan-inquiry.md` | `/grd:plan-phase` | `/grd:plan-inquiry` |
| `commands/grd/execute-phase.md` | `commands/grd/conduct-inquiry.md` | `/grd:execute-phase` | `/grd:conduct-inquiry` |
| `commands/grd/verify-work.md` | `commands/grd/verify-inquiry.md` | `/grd:verify-work` | `/grd:verify-inquiry` |
| `commands/grd/complete-milestone.md` | `commands/grd/complete-study.md` | `/grd:complete-milestone` | `/grd:complete-study` |

### 2.2 Commands That Keep Their Names (28 commands — no rename)

These are already domain-neutral: `new-milestone`, `audit-milestone`, `progress`, `help`, `update`, `quick`, `debug`, `health`, `settings`, `set-profile`, `add-todo`, `check-todos`, `pause-work`, `resume-work`, `map-codebase`, `stats`, `autonomous`, `cleanup`, `add-phase`, `insert-phase`, `remove-phase`, `validate-phase`, `plan-milestone-gaps`, `research-phase`, `add-tests`, `reapply-patches`, `ui-phase`, `ui-review`.

### 2.3 Cross-Reference Updates

The old command names appear in **three locations** that all need updating:

#### A. Command files (`commands/grd/*.md`)

Command files cross-reference each other (e.g., `help.md` lists all commands, `autonomous.md` chains commands). Use these **exact search patterns** to avoid false-positives on prose:

| Find (regex) | Replace |
|---|---|
| `/grd:new-project` | `/grd:new-research` |
| `/grd:discuss-phase` | `/grd:scope-inquiry` |
| `/grd:plan-phase` | `/grd:plan-inquiry` |
| `/grd:execute-phase` | `/grd:conduct-inquiry` |
| `/grd:verify-work` | `/grd:verify-inquiry` |
| `/grd:complete-milestone` | `/grd:complete-study` |

These are safe because the `/grd:` prefix makes them unambiguous.

#### B. Workflow files (`grd/workflows/*.md`) — 17 files with old vocabulary

Workflow files use bare names (without `/grd:` prefix) as internal routing identifiers. These need **context-aware replacement** — only replace when the name is used as a workflow/command identifier, not in English prose.

**Files requiring updates (verified list):**

| File | Old refs found |
|---|---|
| `autonomous.md` | `execute-phase`, `discuss-phase`, `complete-milestone`, `plan-phase` |
| `conduct-inquiry.md` | `plan-phase`, `execute-phase` |
| `scope-inquiry.md` | `discuss-phase`, `plan-phase`, `execute-phase` |
| `plan-inquiry.md` | `discuss-phase`, `execute-phase` |
| `verify-inquiry.md` | `plan-phase` |
| `new-milestone.md` | `discuss-phase`, `plan-phase`, `execute-phase` |
| `quick.md` | `execute-phase` |
| `audit-study.md` | `execute-phase` |
| `verify-phase.md` | `execute-phase` |
| `settings.md` | `plan-phase`, `execute-phase` |
| `ui-phase.md` | `discuss-phase`, `plan-phase` |
| `diagnose-issues.md` | `plan-phase`, `verify-work` |
| `synthesize.md` | `execute-phase` |
| `list-phase-assumptions.md` | `discuss-phase` |
| `resume-project.md` | `discuss-phase` |
| `discovery-phase.md` | `plan-phase` |
| `help.md` | `discuss-phase` |

**Replacement patterns for workflows:**

| Find | Replace |
|---|---|
| `new-project` (as identifier/filename ref) | `new-research` |
| `discuss-phase` (as identifier/filename ref) | `scope-inquiry` |
| `plan-phase` (as identifier/filename ref) | `plan-inquiry` |
| `execute-phase` (as identifier/filename ref) | `conduct-inquiry` |
| `verify-work` (as identifier/filename ref) | `verify-inquiry` |
| `complete-milestone` (as identifier/filename ref) | `complete-study` |

**Guidance for executor:** In workflow files, these names appear in contexts like `→ route to discuss-phase`, `spawn execute-phase`, `after plan-phase completes`. Replace the identifier. If the phrase appears in a sentence like "discuss the phase goals" — that's English prose, leave it alone.

#### C. Agent files (`agents/grd-*.md`)

Agent files suggest next commands to the user. Apply the same `/grd:` prefixed replacements as section A.

#### D. docs/DESIGN.md

Apply the same command vocabulary renames (65 instances already updated to `/grd:` in W1 — now update the command names themselves).

### 2.4 ui-phase.md Agent References

`grd/workflows/ui-phase.md` references `gsd-ui-researcher` and `gsd-ui-checker` agent names. These are **upstream GSD agents** (not GSD-R agents). Decide:
- If GRD still uses these agents → keep the names
- If GRD has its own UI agents → rename them

**Recommendation:** Keep as-is unless GRD-specific UI agents exist.

---

## Workstream 3: Wire the Source Acquisition Pipeline

### 3.1 The Problem

All source acquisition components are built, tested, and passing — but no workflow actually calls them. GRD currently plans and executes research without downloading a single paper.

### 3.2 Components (Built, Not Wired)

| Component | Location | Status |
|---|---|---|
| `acquire.cjs` — fallback chain (firecrawl → web_fetch → wget) | `grd/bin/lib/acquire.cjs` (412 lines) | Built, tested, **not called by any workflow** |
| `vault.cjs` — atomicWrite (note + sources + SOURCE-LOG + git) | `grd/bin/lib/vault.cjs` (193 lines) | Built, tested, **not called by any workflow** |
| `grd-source-researcher.md` — agent that acquires papers | `agents/grd-source-researcher.md` (157 lines) | Built, **not spawned by any orchestrator** |
| SOURCE-LOG.md template | `grd/templates/source-log.md` (22 lines) | Built, referenced by vault.cjs |
| Source protocol spec | `grd/references/source-protocol.md` (113 lines) | Defines `-sources/` convention |
| `validateReferences()` | `grd/bin/lib/acquire.cjs` line 313 | Built, called by verify-research.cjs |
| `verify-research.cjs` — Tier 2 source audit | `grd/bin/lib/verify-research.cjs` | Built, imported by verify-inquiry workflow |

**Key exports that need callers:**

```javascript
// acquire.cjs
acquireSource({ url, outputPath, toolRunner, typeInfo? }) → Promise<{ filePath?, status, method?, reason? }>
updateSourceLog(sourceLogPath, entry) → Promise<void>
validateReferences(noteContent, sourcesDir, sourceLogPath?) → Promise<{ valid, missing, orphans, referenced, noteRefs }>

// vault.cjs
atomicWrite({ vaultPath, notePath, content, sources?, gitRunner? }) → Promise<{ notePath, sourcesDir, sourceLogPath, commitHash }>
```

### 3.3 What Needs Wiring (4 Integration Points)

#### Integration Point 1: conduct-inquiry.md → source-researcher agent

**File:** `grd/workflows/conduct-inquiry.md`

**Current behavior:** Coordinates plan execution across waves. Runs executor agents. Does not acquire sources.

**Required change:** After each plan's executor completes, spawn the `grd-source-researcher` agent to:
1. Parse the plan's `<src>` blocks for URLs and acquisition methods
2. Call `acquireSource()` for each source via the fallback chain
3. Call `updateSourceLog()` for each result (success or failure)
4. Create the `-sources/` directory structure via `atomicWrite()`

**Recommended approach:** Spawn the source-researcher as a **separate agent per plan** (not inline in the executor). Rationale: source acquisition is I/O-heavy (network downloads) and benefits from its own fresh context window. The executor focuses on synthesis; the source-researcher focuses on acquisition. This matches GRD's existing architectural pattern of specialized agents with fresh contexts.

**Sequencing within a wave:**
1. Executor agent runs plan → produces research note draft
2. Source-researcher agent runs → acquires all `<src>` sources, creates `-sources/` dir
3. `atomicWrite()` bundles note + sources + SOURCE-LOG + git commit

#### Integration Point 2: atomicWrite() in the execution path

**File:** `grd/bin/lib/vault.cjs`

**Current behavior:** `atomicWrite()` exists and works (tested in smoke tests). Nothing calls it.

**Required change:** The source-researcher agent (or conduct-inquiry orchestrator) must call `atomicWrite()` instead of raw file writes when creating research notes. This ensures:
- Note and its `-sources/` folder are created together
- SOURCE-LOG.md is initialized from template
- Git commit bundles the entire unit atomically
- Rollback on failure

**How to call it from a workflow/agent:** The agent markdown file should instruct the agent to use `grd/bin/lib/vault.cjs` via `node -e` or by requiring it in a bash step. Reference: the smoke test at `test/smoke.test.cjs` lines 605-707 demonstrates the full call sequence.

#### Integration Point 3: validateReferences() in verify-inquiry.md

**File:** `grd/workflows/verify-inquiry.md`

**Current behavior:** Tier 2 source audit calls `verifyTier2()` in `verify-research.cjs`, which internally calls `validateReferences()`. This part is **already partially wired**.

**Required change:** Verify that the wiring works end-to-end now that sources will actually exist. Specific checks:
- Does `verifyTier2()` correctly resolve the `-sources/` directory path relative to the note?
- Does it handle both local (`./`) and global (`~/.claude/grd/`) install paths?
- Does it correctly read `SOURCE-LOG.md` for unavailable-source exemptions?

#### Integration Point 4: Template path resolution for global installs

**File:** `grd/bin/lib/vault.cjs` (line 95)

The SOURCE-LOG.md template is read from a path relative to the `grd/` directory. For global installs (`~/.claude/grd/`), verify:
1. `bin/install.js` copies `grd/templates/` to the install target
2. `vault.cjs` resolves the template path using `__dirname` or a passed config, not a hardcoded relative path
3. The `expandTilde()` helper in vault.cjs handles this correctly

### 3.4 Expected End-to-End Flow (After Wiring)

```
/grd:conduct-inquiry 1
  → Orchestrator reads phase plans
  → Per plan (within wave):
      1. Executor agent runs → produces research note draft with citations
      2. Source-researcher agent runs → acquires sources from <src> blocks
         → acquireSource() per URL (firecrawl → web_fetch → wget fallback)
         → updateSourceLog() per result
      3. atomicWrite() bundles: note + -sources/ dir + SOURCE-LOG.md + git commit
  → -sources/ directories exist with real acquired files
  → SOURCE-LOG.md documents every acquisition attempt

/grd:verify-inquiry 1
  → Tier 0: sufficiency check (are all research questions addressed?)
  → Tier 1: goal-backward verification (do findings answer the phase goals?)
  → Tier 2: validateReferences() confirms every citation has a local file
      → Missing files flagged
      → Orphaned files flagged
      → Unavailable sources exempted if documented in SOURCE-LOG.md
  → All tiers pass because sources were actually acquired
```

---

## README.md: Full Rewrite Summary

The README incorporates all three workstreams. All changes are listed here in one place for the README-rewrite phase.

### Header

```markdown
# GRD

**Research-grade context engineering for AI-assisted academic workflows.**
```

(Badge URLs already point to `get-research-done` — no changes needed.)

### Attribution

```markdown
GRD is a research-oriented fork of [Get Shit Done](https://github.com/glittercowboy/get-shit-done-cc) by [Lex Christopherson](https://github.com/glittercowboy) ([@gsd_foundation](https://x.com/gsd_foundation)). The original GSD system's architecture — wave parallelism, fresh subagent contexts, plan/execute/verify loop, and state management — is carried over intact. GRD adapts the intellectual scaffolding for academic research workflows with source attachment.

GRD was itself built using GSD.
```

### All Command References (Combined W1 + W2 Mapping)

Every command invocation in the README needs this final-state mapping:

| README Currently Shows | Final State |
|---|---|
| `/gsd-r:new-project` | `/grd:new-research` |
| `/gsd-r:discuss-phase` | `/grd:scope-inquiry` |
| `/gsd-r:plan-phase` | `/grd:plan-inquiry` |
| `/gsd-r:execute-phase` | `/grd:conduct-inquiry` |
| `/gsd-r:verify-work` | `/grd:verify-inquiry` |
| `/gsd-r:complete-milestone` | `/grd:complete-study` |
| `/gsd-r:new-milestone` | `/grd:new-milestone` |
| `/gsd-r:audit-milestone` | `/grd:audit-milestone` |
| `/gsd-r:quick` | `/grd:quick` |
| `/gsd-r:help` | `/grd:help` |
| `/gsd-r:update` | `/grd:update` |
| `/gsd-r:map-codebase` | `/grd:map-codebase` |
| `/gsd-r:progress` | `/grd:progress` |
| `/gsd-r:settings` | `/grd:settings` |
| `/gsd-r:set-profile` | `/grd:set-profile` |
| `/gsd-r:add-phase` | `/grd:add-phase` |
| `/gsd-r:insert-phase` | `/grd:insert-phase` |
| `/gsd-r:remove-phase` | `/grd:remove-phase` |
| `/gsd-r:list-phase-assumptions` | `/grd:list-phase-assumptions` |
| `/gsd-r:plan-milestone-gaps` | `/grd:plan-milestone-gaps` |
| `/gsd-r:pause-work` | `/grd:pause-work` |
| `/gsd-r:resume-work` | `/grd:resume-work` |
| `/gsd-r:add-todo` | `/grd:add-todo` |
| `/gsd-r:check-todos` | `/grd:check-todos` |
| `/gsd-r:debug` | `/grd:debug` |
| `/gsd-r:health` | `/grd:health` |

### Prose Updates

| Find in README | Replace |
|---|---|
| All `GSD-R` (branded name) | `GRD` |
| `commands/gsd-r/` (troubleshooting paths) | `commands/grd/` |
| `gsd-help` (OpenCode invocation) | `grd-help` |
| `$gsd-help` (Codex invocation) | `$grd-help` |
| `skills/gsd-*/SKILL.md` | `skills/grd-*/SKILL.md` |

### Translation Table

| GSD (Code) | GRD (Research) |
|---|---|
| Git commit | Research note + sources written to vault |
| Source code files | Source material (PDF, scraped .md, screenshot) |
| Test passes | Note passes format + citation + source-attachment check |
| `git bisect` | Note-level rollback |
| Build succeeds | Research question answered |

### Footer

```markdown
**AI makes research faster. GRD makes it rigorous.**
```

---

## Verification Checklist

### Rename Verification (W1)

```bash
# All three must return zero results:
grep -r "gsd-r" --include="*.md" --include="*.js" --include="*.cjs" --include="*.json" . | grep -v node_modules | grep -v .planning | grep -v package-lock
grep -r "GSD-R" --include="*.md" --include="*.js" --include="*.cjs" --include="*.json" . | grep -v node_modules | grep -v .planning | grep -v package-lock
grep -r "get-shit-done-r" --include="*.md" --include="*.js" --include="*.cjs" --include="*.json" . | grep -v node_modules | grep -v .planning | grep -v package-lock
```

- [ ] All three grep commands return zero results
- [ ] All 16 agents exist as `agents/grd-*.md`
- [ ] All 34 commands exist in `commands/grd/`
- [ ] `commands/gsd-r/` directory no longer exists
- [ ] `agents/gsd-r-*.md` files no longer exist
- [ ] `package.json` `files` array includes `"grd"` (not `"get-research-done"`)

### Command Vocabulary Verification (W2)

- [ ] `commands/grd/new-research.md` exists
- [ ] `commands/grd/scope-inquiry.md` exists
- [ ] `commands/grd/plan-inquiry.md` exists
- [ ] `commands/grd/conduct-inquiry.md` exists
- [ ] `commands/grd/verify-inquiry.md` exists
- [ ] `commands/grd/complete-study.md` exists
- [ ] Old files (`new-project.md`, `discuss-phase.md`, `plan-phase.md`, `execute-phase.md`, `verify-work.md`, `complete-milestone.md`) no longer exist in `commands/grd/`

```bash
# Check for stale command vocabulary in active files (not .planning/):
grep -rn "\/grd:new-project\|\/grd:discuss-phase\|\/grd:plan-phase\|\/grd:execute-phase\|\/grd:verify-work\|\/grd:complete-milestone" commands/ agents/ grd/workflows/ README.md docs/DESIGN.md
```

- [ ] Returns zero results

### Source Pipeline Verification (W3)

- [ ] `grd/workflows/conduct-inquiry.md` references source-researcher agent or acquireSource()
- [ ] `atomicWrite()` is called during note creation in the execution path
- [ ] Running `/grd:conduct-inquiry` on a phase with `<src>` blocks creates `-sources/` directories with actual files
- [ ] Running `/grd:verify-inquiry` with real sources passes Tier 2 source audit
- [ ] Template path (`grd/templates/source-log.md`) resolves correctly for both local and global installs
- [ ] `npm test` passes (existing smoke/e2e tests still green)

### General

- [ ] `/grd:help` works after reinstall
- [ ] README renders correctly on GitHub
- [ ] `docs/DESIGN.md` uses new naming throughout

---

## Scope Exclusions

- **`.planning/` directory** — Historical records, do not modify
- **`package-lock.json`** — Auto-regenerated by npm
- **`node_modules/`** — Auto-regenerated
- **Upstream GSD attribution** — References to the original "Get Shit Done" project by Lex Christopherson stay as-is
- **Upstream GSD install paths in install.js** — ~26 references to `get-shit-done` (without `-r`) that manage coexistence with upstream GSD. Leave them.
- **npm package name** — Already `get-research-done`, no change needed
- **`grd/agents/`, `grd/bin/`, `grd/references/`, `grd/templates/`** — Already clean, verified

---

## Suggested Phasing for GSD Execution

### Phase 1: Rename (Workstream 1)

All file renames, directory moves, and bulk string replacements. Mechanical, high volume, low risk.

**Acceptance criteria:** All three grep verification commands return zero results. `npm test` passes.

### Phase 2: Command Vocabulary (Workstream 2)

Rename the 6 core command files. Update all cross-references in 34 command files, 16 agent files, 17 workflow files, README, and docs/DESIGN.md. Requires context-sensitive replacement (use `/grd:` prefix to disambiguate command invocations from prose).

**Acceptance criteria:** Old command names absent from active files. `/grd:help` lists new names.

### Phase 3: Source Pipeline Wiring (Workstream 3)

4 integration points: spawn source-researcher in conduct-inquiry, call atomicWrite() during execution, verify validateReferences() works end-to-end, fix template path resolution.

**Acceptance criteria:** Running `/grd:conduct-inquiry` on a test phase with `<src>` blocks produces real `-sources/` directories with acquired files and passes Tier 2 verification.

### Phase 4: README + docs/DESIGN.md Rewrite

Final pass applying all naming changes to user-facing documentation. Can be done concurrently with Phase 3.

**Acceptance criteria:** README renders correctly. All command examples match new invocations. No stale branding.

---

## Future Milestones (v2.1 – v2.3)

These build on v2.0's working source pipeline. Each is a clean, separable milestone — do not mix into v2.0.

### v2.1 — Obsidian Vault Target

**Scope:** Configure GRD's vault output (`atomicWrite()`) to write directly into an Obsidian vault.

**Why it's trivial:** GRD already produces standard markdown files with `-sources/` attachment directories. Obsidian reads markdown natively. The only work is:

1. Add a `vault_path` config option to GRD settings (e.g., `~/Research/vault/`)
2. Point `atomicWrite()` at the configured vault path instead of the project's `.planning/` directory
3. Add Obsidian-flavored wikilinks (`[[note-name]]`) to cross-reference related inquiry notes
4. Ensure `-sources/` directories land inside the vault's attachment folder convention

**What you get for free:**
- Knowledge graph across all research notes (backlinks, graph view)
- Daily notes tied to research sessions
- Dataview queries across SOURCE-LOG.md files (e.g., "show all sources with status: failed")
- Non-linear exploration of linear inquiry phases
- Community plugins: Zotero integration, PDF annotation, citation tools

**Estimated effort:** ~1 phase, mostly config. The Obsidian skill is already available.

### v2.2 — NotebookLM as Verification + Synthesis Layer

**Scope:** After source acquisition, automatically upload acquired materials to a Google NotebookLM notebook for Gemini-powered cross-source verification and synthesis.

**Integration architecture:**

```
/grd:conduct-inquiry
  → acquireSource() downloads papers to -sources/
  → Upload acquired files to NotebookLM notebook (via MCP tools already connected)
  → NotebookLM indexes all sources with Gemini

/grd:verify-inquiry
  → Tier 2: validateReferences() (local file check — existing)
  → Tier 3 (NEW): notebook_query() asks Gemini to verify claims against uploaded sources
      → "Does the evidence in the uploaded sources support the claim that X?"
      → Citation-backed, grounded responses (no hallucination)
      → Flags unsupported claims that passed Tier 2 (file exists but doesn't say what the note claims)

/grd:complete-study
  → Generate Audio Overview (podcast-style summary of findings)
  → Generate Study Guide or Briefing Doc as synthesis artifact
  → Export to Google Docs for committee review
```

**Why NotebookLM and not just GRD alone:**
- GRD verifies that sources **exist** (Tier 2). NotebookLM verifies that sources **say what you claim** (Tier 3).
- Gemini reads the full content of uploaded PDFs — Claude's source-researcher downloads them but doesn't read 50-page papers cover to cover.
- Audio Overviews are genuinely useful for doctoral students who need to absorb literature during commutes.
- The MCP server is already connected. No new dependencies — just workflow orchestration.

**What you DON'T need:** The `notebooklm-py` repo (teng-lin/notebooklm-py). Your MCP server (`mcp__notebooklm-mcp__*`) already exposes every NotebookLM operation. The Python repo is a standalone client for the same API — redundant.

**Estimated effort:** ~2 phases. One for upload wiring, one for Tier 3 verification logic.

### v2.3 — Academic Database Access + Citation Graph Traversal

**Scope:** The hardest milestone. Move from "acquire what the user gives URLs for" to "autonomously discover and acquire the literature."

**Components:**

| Component | What it does | Complexity |
|---|---|---|
| DOI resolver | Given a DOI, find the PDF via Unpaywall, Sci-Hub fallback, or institutional proxy | Medium |
| Citation graph crawler | Given a seed paper, extract its references, then acquire those papers recursively (depth-limited) | High |
| Semantic Scholar / OpenAlex API integration | Search academic databases by keyword, author, topic — returns structured metadata + DOIs | Medium |
| Deduplication engine | Detect when the same paper was acquired from multiple sources (DOI-based + title fuzzy match) | Medium |
| Institutional proxy auth | Authenticate through university library proxy (EZproxy, OpenAthens) for paywalled content | High (university-specific) |

**What this enables:**
- `/grd:new-research "Self-Determination Theory and intrinsic motivation"` → automatically discovers 40+ relevant papers, acquires open-access PDFs, builds citation graph, identifies seminal works vs recent contributions
- True systematic literature review capability
- Gap analysis: "these 3 papers cite each other but none cite X — potential gap"

**Estimated effort:** Full milestone (4+ phases). The DOI resolver and Semantic Scholar integration are achievable. Institutional proxy auth is university-specific and may require manual setup per institution.

### Milestone Dependency Chain

```
v2.0  Rename + Commands + Source Pipeline Wiring
  │   (sources are acquired and verified locally)
  │
  ├─→ v2.1  Obsidian Vault Target
  │         (research notes become a navigable knowledge graph)
  │
  ├─→ v2.2  NotebookLM Verification + Synthesis
  │         (Gemini verifies claims against source content)
  │
  └─→ v2.3  Academic DB + Citation Graphs
            (autonomous literature discovery)
```

v2.1 and v2.2 are independent of each other — can be done in either order or in parallel. v2.3 depends on v2.0's source pipeline being solid but not on v2.1 or v2.2.
