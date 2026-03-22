# GRD: Research-Oriented Fork of GSD

## What This Is

GRD is a fork of [get-shit-done-cc](https://github.com/gsd-build/get-shit-done) that replaces code commits with research notes as the atomic unit of work. Where GSD's atomic deliverable is a git commit with source code, GRD's is a research note with its source material physically attached (PDFs, scraped markdown, screenshots in a sibling `-sources/` folder). Everything else stays: fresh subagent contexts, discuss/plan/execute/verify loop, STATE.md, wave parallelism, aggressive atomicity, goal-backward verification.

Shipped v1.0 (MVP) and v1.1 (upstream sync to v1.24.0). ~32K LOC across CJS modules, agent prompts, templates, workflows, and references. Installable via npx like the original GSD. 164 tests passing.

## Core Value

Every research finding is self-contained and auditable — the note plus its actual source files, never just links — so the research survives even if every source URL goes dead.

## Requirements

### Validated

- ✓ Clone and restructure get-shit-done-cc repo as GRD — v1.0
- ✓ Modify executor: vault write + git commit replaces code-only git commit — v1.0
- ✓ Modify task template: research notes with `<src>` blocks replace code file outputs — v1.0
- ✓ Implement Source Attachment Protocol (acquire, name, log, fallback chain) — v1.0
- ✓ Implement SOURCE-LOG.md generation per note — v1.0
- ✓ Modify verification: goal-backward + source audit two-tier system — v1.0
- ✓ Modify researcher subagents: source/methods/architecture/limitations — v1.0
- ✓ Modify planner: research task XML with `<src method="" format="">` blocks, ≤3 sources per task — v1.0
- ✓ Modify plan-checker: source duplication, primary vs. secondary, context budget, BOOTSTRAP.md conflicts — v1.0
- ✓ Create research note template with frontmatter and all required sections — v1.0
- ✓ Create BOOTSTRAP.md template (Established / Partially Established / Not Yet Researched) — v1.0
- ✓ Create SOURCE-LOG.md template — v1.0
- ✓ Add `vault_path` to config.json — v1.0
- ✓ Add `commit_research: true` default to config.json — v1.0
- ✓ Implement note-status tracker in STATE.md — v1.0
- ✓ Implement source-gap reporting in STATE.md — v1.0
- ✓ Modify new-project: add BOOTSTRAP.md generation — v1.0
- ✓ Modify discuss-phase: unchanged (carry over as-is) — v1.0
- ✓ Rename all `/gsd:*` commands to `/grd:*` — v1.0
- ✓ Filesystem-based vault write as default — v1.0
- ✓ Auto-commit research notes to git — v1.0
- ✓ Firecrawl as primary scraper in fallback chain — v1.0
- ✓ Decision Log format support — v1.0
- ✓ Successfully complete one full research project end-to-end using GRD — v1.0
- ✓ Sync core.cjs with v1.24.0 (model-profiles extraction, milestone scoping, profile inheritance) — v1.1
- ✓ Sync state.cjs with v1.24.0 preserving Note Status + Source Gaps — v1.1
- ✓ Add autonomous execution, UI, node repair, and stats workflows — v1.1
- ✓ Add model-profiles.cjs module with 19 GRD agents — v1.1
- ✓ Add execution rigor gates (read_first, acceptance_criteria) — v1.1
- ✓ Standardize all paths (absolute paths, zero namespace leaks) — v1.1
- ✓ Sync 61 workflow and command files with upstream v1.24.0 — v1.1
- ✓ Add VERSION file tracking upstream base version (1.24.0) — v1.1

### Active

<!-- v1.2 Research Reorientation — defined via /grd:new-milestone -->
(Being defined — see REQUIREMENTS.md)

### Out of Scope

- Obsidian MCP as required dependency — filesystem is default, MCP is future enhancement
- Mobile or web UI — CLI only, like GSD
- Real-time collaboration — single-user research tool
- Automatic paper summarization via LLM — GRD acquires and organizes sources, the human/subagent synthesizes
- Backward compatibility with GSD commands — this is a separate tool with `/grd:*` namespace

## Context

- **Shipped:** v1.0 on 2026-03-12 (8 phases, 15 plans, 24 requirements); v1.1 on 2026-03-16 (6 phases, 11 plans, 27 requirements)
- **Upstream base:** GSD v1.24.0
- **Tech stack:** Node.js CommonJS, zero external dependencies, node:test runner
- **Lines of code:** ~32K across CJS modules, agent prompts, templates, references
- **Tests:** 300+ tests across 12+ test files, all passing
- **Upstream repo**: https://github.com/gsd-build/get-shit-done (also https://github.com/Jerrymwolf/get-shit-done)
- **Upstream local:** ~/.claude/get-shit-done/ (v1.24.0 installed)
- **Source acquisition tools available**: Firecrawl CLI, web_fetch, wget/curl, gh CLI
- **Research note convention**: Every `Foo.md` has a sibling `Foo-sources/` folder containing acquired source files + SOURCE-LOG.md

## Constraints

- **Architecture**: Mirrors GSD's structure (commands/, agents/, workflows/, templates/, references/)
- **Context budget**: ≤3 sources per task, each task fits ~50% subagent context. 30-page papers get their own task
- **Atomic deliverable**: Note file + sources folder + SOURCE-LOG.md — all three exist or task is incomplete
- **Source naming**: `{descriptive-slug}_{date-acquired}.{ext}`
- **Fallback chain**: firecrawl → web_fetch → wget/curl → mark unavailable in SOURCE-LOG.md
- **Git**: Auto-commit every vault write. The vault write + git commit is the atomic unit

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fork from GitHub repo, not copy from global install | Clean base, proper git history, publishable structure | ✓ Good |
| Filesystem vault write as default | No external dependencies required; Obsidian MCP optional later | ✓ Good |
| Auto-commit research notes | Consistent with GSD's git-centric model; full history for free | ✓ Good |
| General-purpose from day one | ValuesPrism is test case, not hard-coded; domain set in PROJECT.md per-project | ✓ Good |
| `/grd:*` namespace in separate repo | Clean separation from GSD; both can coexist on same machine | ✓ Good |
| Zero external dependencies for core modules | node:fs, node:path, node:test only — keeps install fast and reliable | ✓ Good |
| Two-tier verification (goal-backward + source audit) | Catches both research quality issues and source completeness gaps | ✓ Good |
| Dependency injection for tool calls in tests | No real HTTP in tests; toolRunner pattern for all external tool calls | ✓ Good |
| GSD upstream wins for v1.1 sync | Minimizes drift; research layer applied on top of latest upstream | ✓ Good |
| Keep Note Status + Source Gaps in state.cjs | Research completeness visibility worth the added complexity | ✓ Good |
| CORE-04 (install.js) N/A for v1.1 | Upstream has no install.js; GRD's installer is fork-specific | ✓ Good |
| TMPL-01/03 N/A for v1.1 | No upstream agents/ or hooks/ directory; GRD versions are fork-specific | ✓ Good |
| Keep GRD research-project templates over upstream | DEBATES/FRAMEWORKS/LANDSCAPE/QUESTIONS better fit research workflow | ✓ Good |

## Known Tech Debt

- Duplicate `stateExtractField` in state.cjs (dead code at line 12)
- `config-set-model-profile` stub in grd-tools.cjs
- stats.md research-specific metrics deferred
- 2 stale Skill() namespace calls (plan-phase.md:529, discuss-phase.md:682)
- `replaceInCurrentMilestone` exported but unused

## Current Milestone: v1.3 Upstream Sync + Rename + Source Pipeline Wiring

**Goal:** Sync GRD to upstream GSD v1.28.0, eliminate all GSD-R branding, adopt research-native command vocabulary, and wire the source acquisition pipeline.

**Target features:**
- Upstream sync from v1.25.1 → v1.28.0 (upstream wins, re-apply research layer)
- Bulk rename GSD-R → GRD across files, directories, and content
- Research-native command vocabulary — 6 core command renames with cross-reference updates
- Wire source acquisition pipeline — connect acquire.cjs, vault.cjs, source-researcher to conduct-inquiry
- README + docs/DESIGN.md rewrite with final-state naming

---
*Last updated: 2026-03-22 after milestone v1.3 started*
