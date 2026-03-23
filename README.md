<div align="center">

# GRD

**Research-grade context engineering for AI-assisted academic workflows.**

<!-- BADGE SETUP NEEDED — see "Fixing the Badges" section at the bottom of this file -->
[![npm version](https://img.shields.io/npm/v/get-research-done?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-research-done)
[![npm downloads](https://img.shields.io/npm/dm/get-research-done?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-research-done)
[![Tests](https://img.shields.io/github/actions/workflow/status/Jerrymwolf/get-research-done/test.yml?branch=main&style=for-the-badge&logo=github&label=Tests)](https://github.com/Jerrymwolf/get-research-done/actions/workflows/test.yml)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<br>

```bash
npx get-research-done@latest
```

**Works on Mac, Windows, and Linux.**

</div>

## The Problem

AI assistants degrade as context accumulates. The longer a session runs, the more prior conversation competes with the task at hand — citations get muddled, sources are paraphrased from memory rather than quoted from text, and the quality of synthesis drops. For research work — literature reviews, systematic analysis, dissertation chapters — this isn't a minor inconvenience. It's a structural failure.

## What GRD Does

GRD orchestrates AI agents through a **scope → plan → execute → verify** loop. Each agent receives a fresh context window scoped to a single task — no accumulated conversation, no degraded attention. Sources are downloaded and saved locally, not linked, so the research corpus is self-contained and auditable even if every URL goes dead. Verification checks that research questions are actually answered and that every cited source has a corresponding local file.

GRD also handles code. It inherits full development capabilities — atomic git commits, test verification, parallel execution. If a project involves both research and implementation, GRD covers the full lifecycle.

## What It Produces

Every research phase generates notes with locally attached sources:

```
01-Agent-Architecture/
├── Orchestration-Frameworks.md
├── Orchestration-Frameworks-sources/
│   ├── SOURCE-LOG.md
│   ├── langgraph-readme_2026-03-10.md
│   ├── crewai-docs_2026-03-10.md
│   └── autogen-readme_2026-03-10.md
├── Concordance-Patterns.md
├── Concordance-Patterns-sources/
│   ├── SOURCE-LOG.md
│   ├── karma-arXiv-2502.06472_2026-03-10.pdf
│   └── logos-arXiv-2509.24294_2026-03-10.pdf
```

Every citation links to a local file. Every file is date-stamped. Every acquisition is logged. If a source goes offline tomorrow, your research still stands.

## Quickstart

```bash
npx get-research-done@latest          # 1. Install
```

```
/grd:new-research                      # 2. Initialize — questions, research, requirements, roadmap
/grd:scope-inquiry 1                   # 3. Scope — lock in decisions before research runs
/grd:plan-inquiry 1                    # 4. Plan — research + plan + verify for the phase
/grd:conduct-inquiry 1                 # 5. Execute — parallel agents, fresh contexts, source acquisition
/grd:verify-inquiry 1                  # 6. Verify — goal-backward check + source audit
```

Repeat steps 3–6 for each phase. When the milestone is complete: `/grd:complete-study`.

> **Building on an existing codebase?** Run `/grd:map-codebase` first. It spawns parallel agents to analyze your project's structure, patterns, and conventions.

## How It Works

### 1. Initialize

`/grd:new-research` runs a single flow:

1. **Questions** — Asks until it understands your research goals, scope, constraints, and existing literature
2. **Research** — Spawns parallel agents to investigate the domain (optional but recommended)
3. **Requirements** — Extracts research questions with acceptance criteria for "answered"
4. **Roadmap** — Creates phases mapped to requirements

You approve the roadmap. GRD includes a bootstrap step that inventories existing research to prevent re-investigating known findings.

### 2. Scope

`/grd:scope-inquiry 1` captures your decisions before research runs.

Your roadmap has a sentence or two per phase — not enough to direct a research investigation the way you intend it. This step identifies gray areas (scope boundaries, methodological preferences, known constraints, open questions) and asks until you're satisfied. The output feeds directly into the researcher and planner.

Skip it and the system uses reasonable defaults. Use it and the investigation stays focused.

### 3. Plan

`/grd:plan-inquiry 1` creates atomic task plans.

The system researches how to approach the phase, creates 2–3 task plans with source acquisition specifications, and verifies plans against requirements. Research-specific agents handle source discovery, methodology analysis, theoretical architecture, and limitations assessment.

### 4. Execute

`/grd:conduct-inquiry 1` runs plans in parallel waves.

```
┌──────────────────────────────────────────────────────────────────┐
│  PHASE EXECUTION                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  WAVE 1 (parallel)        WAVE 2 (parallel)        WAVE 3       │
│  ┌────────┐ ┌────────┐   ┌────────┐ ┌────────┐   ┌────────┐   │
│  │Plan 01 │ │Plan 02 │ → │Plan 03 │ │Plan 04 │ → │Plan 05 │   │
│  │Survey  │ │Survey  │   │Compare │ │Assess  │   │Synthe- │   │
│  │Topic A │ │Topic B │   │Methods │ │Limits  │   │sis     │   │
│  └────────┘ └────────┘   └────────┘ └────────┘   └────────┘   │
│      │          │             ↑          ↑             ↑        │
│      └──────────┴─────────────┴──────────┘             │        │
│            Dependencies: Plan 03 needs Plan 01         │        │
│                         Plan 04 needs Plan 02          │        │
│                         Plan 05 needs Plans 03 + 04    │        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

Each plan gets a **fresh 200k-token context** — purely for source acquisition and synthesis, zero accumulated baggage. Every task produces a research note, its `-sources/` folder with acquired files, and a `SOURCE-LOG.md` audit trail.

### 5. Verify

`/grd:verify-inquiry 1` runs two-tier verification:

- **Tier 1 — Goal-backward:** Does the research answer the question? Extracts testable conditions and checks each against the notes produced.
- **Tier 2 — Source audit:** Checks frontmatter completeness, reference-to-file correspondence, SOURCE-LOG accounting, and bootstrap inventory consistency.

If gaps remain, it creates fix plans. Run `/grd:conduct-inquiry` again to close them.

### 6. Repeat

Loop **scope → plan → execute → verify** for each phase. When all phases pass, `/grd:complete-study` archives the milestone and tags the release. Then `/grd:new-milestone` starts the next cycle.

## Commands

### Core Workflow

| Command | What it does |
|---------|-------------|
| `/grd:new-research [--auto]` | Initialize: questions → research → requirements → roadmap |
| `/grd:scope-inquiry [N] [--auto]` | Capture research decisions before planning |
| `/grd:plan-inquiry [N] [--auto]` | Research + plan + verify for a phase |
| `/grd:conduct-inquiry <N>` | Execute plans in parallel waves |
| `/grd:verify-inquiry [N]` | Two-tier verification (goal-backward + source audit) |
| `/grd:complete-study` | Archive milestone, tag release |
| `/grd:new-milestone [name]` | Start next version with fresh roadmap |

### Navigation & Management

| Command | What it does |
|---------|-------------|
| `/grd:progress` | Where am I? What's next? |
| `/grd:help` | All commands and usage |
| `/grd:update` | Update GRD with changelog preview |
| `/grd:map-codebase` | Analyze existing codebase before starting |
| `/grd:add-phase` | Append phase to roadmap |
| `/grd:insert-phase [N]` | Insert urgent work between phases |
| `/grd:remove-phase [N]` | Remove future phase, renumber |
| `/grd:list-phase-assumptions [N]` | See Claude's intended approach before planning |
| `/grd:plan-milestone-gaps` | Create phases to close gaps from audit |
| `/grd:audit-milestone` | Verify milestone achieved its definition of done |

### Session & Utilities

| Command | What it does |
|---------|-------------|
| `/grd:pause-work` | Create handoff when stopping mid-phase |
| `/grd:resume-work` | Restore from last session |
| `/grd:quick [--full] [--discuss]` | Ad-hoc task with GRD guarantees |
| `/grd:settings` | Configure model profile and workflow agents |
| `/grd:set-profile <profile>` | Switch model profile (quality/balanced/budget) |
| `/grd:add-todo [desc]` | Capture idea for later |
| `/grd:check-todos` | List pending todos |
| `/grd:debug [desc]` | Systematic debugging with persistent state |
| `/grd:health [--repair]` | Validate `.planning/` integrity |

<sup>Verify command contributed by reddit user OracleGreyBeard</sup>

## Quick Mode

```
/grd:quick
```

For ad-hoc tasks that don't need full planning. Same agents and source attachment, shorter path — no research, no plan checker, no verifier. Lives in `.planning/quick/`, separate from phases.

Use `--full` to add plan-checking and verification. Use `--discuss` to gather context first.

<details>
<summary><strong>Configuration</strong></summary>

GRD stores settings in `.planning/config.json`. Configure during `/grd:new-research` or update with `/grd:settings`.

**Core Settings**

| Setting | Options | Default |
|---------|---------|---------|
| `mode` | `yolo`, `interactive` | `interactive` |
| `granularity` | `coarse`, `standard`, `fine` | `standard` |

**Model Profiles**

| Profile | Planning | Execution | Verification |
|---------|----------|-----------|--------------|
| `quality` | Opus | Opus | Sonnet |
| `balanced` (default) | Opus | Sonnet | Sonnet |
| `budget` | Sonnet | Sonnet | Haiku |

Switch with `/grd:set-profile budget` or configure via `/grd:settings`.

**Workflow Agents**

| Setting | Default | What it does |
|---------|---------|-------------|
| `workflow.research` | `true` | Research domain before planning each phase |
| `workflow.plan_check` | `true` | Verify plans achieve phase goals before execution |
| `workflow.verifier` | `true` | Confirm deliverables after execution |
| `workflow.auto_advance` | `false` | Auto-chain scope → plan → execute without stopping |

Override per-invocation: `/grd:plan-inquiry --skip-research` or `/grd:plan-inquiry --skip-verify`

**Execution**

| Setting | Default | What it controls |
|---------|---------|-----------------|
| `parallelization.enabled` | `true` | Run independent plans simultaneously |
| `planning.commit_docs` | `true` | Track `.planning/` in git |

**Git Branching**

| Setting | Options | Default |
|---------|---------|---------|
| `git.branching_strategy` | `none`, `phase`, `milestone` | `none` |
| `git.phase_branch_template` | string | `gsd/phase-{phase}-{slug}` |
| `git.milestone_branch_template` | string | `gsd/{milestone}-{slug}` |

- **`none`** — Commits to current branch
- **`phase`** — Branch per phase, merge at completion
- **`milestone`** — One branch for entire milestone, merge at completion

</details>

## Getting Started

```bash
npx get-research-done@latest
```

The installer prompts you to choose:
1. **Runtime** — Claude Code, OpenCode, Gemini, Codex, or all
2. **Location** — Global (all projects) or local (current project only)

Verify with `/grd:help` (Claude Code / Gemini) or `/gsd-help` (OpenCode / Codex).

### Recommended: Skip Permissions

GRD runs many small commands automatically. Approving each one individually interrupts the workflow significantly.

```bash
claude --dangerously-skip-permissions
```

<details>
<summary><strong>Granular permissions alternative</strong></summary>

Add to `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(date:*)", "Bash(echo:*)", "Bash(cat:*)", "Bash(ls:*)",
      "Bash(mkdir:*)", "Bash(wc:*)", "Bash(head:*)", "Bash(tail:*)",
      "Bash(sort:*)", "Bash(grep:*)", "Bash(tr:*)",
      "Bash(git add:*)", "Bash(git commit:*)", "Bash(git status:*)",
      "Bash(git log:*)", "Bash(git diff:*)", "Bash(git tag:*)"
    ]
  }
}
```

</details>

<details>
<summary><strong>Non-interactive install (Docker, CI, scripts)</strong></summary>

```bash
# Claude Code
npx get-research-done --claude --global   # Install to ~/.claude/
npx get-research-done --claude --local    # Install to ./.claude/

# OpenCode
npx get-research-done --opencode --global # Install to ~/.config/opencode/

# Gemini CLI
npx get-research-done --gemini --global   # Install to ~/.gemini/

# Codex
npx get-research-done --codex --global    # Install to ~/.codex/
npx get-research-done --codex --local     # Install to ./.codex/

# All runtimes
npx get-research-done --all --global
```

Use `--global` (`-g`) or `--local` (`-l`) to skip the location prompt.

</details>

<details>
<summary><strong>Development install</strong></summary>

```bash
git clone https://github.com/Jerrymwolf/get-research-done.git
cd get-research-done
node bin/install.js --claude --local
```

</details>

<details>
<summary><strong>Docker / containers</strong></summary>

If file reads fail with tilde paths (`~/.claude/...`):

```bash
CLAUDE_CONFIG_DIR=/home/youruser/.claude npx get-research-done --global
```

</details>

<details>
<summary><strong>Protecting sensitive files</strong></summary>

GRD reads files to understand your project. Protect secrets by adding them to Claude Code's deny list in `.claude/settings.json`:

```json
{
  "permissions": {
    "deny": [
      "Read(.env)", "Read(.env.*)", "Read(**/secrets/*)",
      "Read(**/*credential*)", "Read(**/*.pem)", "Read(**/*.key)"
    ]
  }
}
```

</details>

<details>
<summary><strong>Uninstalling</strong></summary>

```bash
npx get-research-done --claude --global --uninstall
npx get-research-done --opencode --global --uninstall
npx get-research-done --codex --global --uninstall

# Local installs
npx get-research-done --claude --local --uninstall
npx get-research-done --opencode --local --uninstall
npx get-research-done --codex --local --uninstall
```

</details>

<details>
<summary><strong>Troubleshooting</strong></summary>

**Commands not found?** Restart your runtime. Verify files exist in `~/.claude/commands/grd/` (global) or `./.claude/commands/grd/` (local).

**Commands not working?** Run `/grd:help` to verify installation, or re-run `npx get-research-done` to reinstall.

</details>

## Attribution

GRD is a research-oriented fork of [Get Shit Done](https://github.com/gsd-build/get-shit-done) by [Lex Christopherson](https://github.com/glittercowboy) ([@gsd_foundation](https://x.com/gsd_foundation)). The original architecture — wave parallelism, fresh subagent contexts, plan/execute/verify loop, and state management — is carried over intact. GRD adapts the scaffolding for academic research workflows with source attachment. GRD was itself built using GSD.

## Community Ports

OpenCode, Gemini CLI, and Codex are supported via `npx get-research-done`.

| Project | Platform | Description |
|---------|----------|-------------|
| [gsd-opencode](https://github.com/rokicool/gsd-opencode) | OpenCode | Original OpenCode adaptation |
| gsd-gemini (archived) | Gemini CLI | Original Gemini adaptation by uberfuzzy |

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**AI makes research faster. GRD makes it rigorous.**

</div>
