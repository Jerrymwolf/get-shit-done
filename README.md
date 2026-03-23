<div align="center">

# GRD

**Research-grade context engineering for AI-assisted academic workflows.**

[![npm version](https://img.shields.io/npm/v/get-research-done?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-research-done)
[![npm downloads](https://img.shields.io/npm/dm/get-research-done?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-research-done)
[![Tests](https://img.shields.io/github/actions/workflow/status/Jerrymwolf/get-research-done/test.yml?branch=main&style=for-the-badge&logo=github&label=Tests)](https://github.com/Jerrymwolf/get-research-done/actions/workflows/test.yml)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<br>

```bash
npx get-research-done@latest
```

Works with [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [OpenCode](https://github.com/opencode-ai/opencode), and [Codex](https://github.com/openai/codex) on Mac, Windows, and Linux.

</div>

## The Problem

AI assistants degrade as context accumulates. The longer a session runs, the more prior conversation competes with the task at hand — citations get muddled, sources are paraphrased from memory rather than quoted from text, and the quality of synthesis drops. For research work — literature reviews, systematic analysis, dissertation chapters — this isn't a minor inconvenience. It's a structural failure.

## What GRD Does

GRD orchestrates AI agents through a **scope → plan → execute → verify** loop. Each agent receives a fresh context window scoped to a single task — no accumulated conversation, no degraded attention. Sources are downloaded and saved locally, not linked, so the research corpus is self-contained and auditable even if every URL goes dead. Verification checks that research questions are actually answered and that every cited source has a corresponding local file.

GRD also handles code — atomic git commits, test verification, parallel execution — so projects that mix research and implementation don't need to switch tools.

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
└── Concordance-Patterns-sources/
    ├── SOURCE-LOG.md
    ├── karma-arXiv-2502.06472_2026-03-10.pdf
    └── logos-arXiv-2509.24294_2026-03-10.pdf
```

Every citation links to a local file. Every file is date-stamped. Every acquisition is logged. If a source goes offline tomorrow, your research still stands.

For the full source attachment protocol, research note template, and two-tier verification details, see [docs/DESIGN.md](docs/DESIGN.md).

## Getting Started

```bash
npx get-research-done@latest
```

The installer prompts for your **runtime** (Claude Code, OpenCode, Gemini, Codex, or all) and **location** (global or local). Verify with `/grd:help`.

GRD runs many small commands automatically. For the smoothest experience:

```bash
claude --dangerously-skip-permissions
```

<details>
<summary>Granular permissions, non-interactive install, Docker, dev install, uninstalling</summary>

**Granular permissions alternative**

If you prefer not to skip permissions, add to `.claude/settings.json`:

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

**Non-interactive install (Docker, CI, scripts)**

```bash
npx get-research-done --claude --global   # Install to ~/.claude/
npx get-research-done --claude --local    # Install to ./.claude/
npx get-research-done --opencode --global # Install to ~/.config/opencode/
npx get-research-done --gemini --global   # Install to ~/.gemini/
npx get-research-done --codex --global    # Install to ~/.codex/
npx get-research-done --all --global      # All runtimes
```

Use `--global` (`-g`) or `--local` (`-l`) to skip the location prompt.

**Docker / containers**

If file reads fail with tilde paths (`~/.claude/...`):

```bash
CLAUDE_CONFIG_DIR=/home/youruser/.claude npx get-research-done --global
```

**Development install**

```bash
git clone https://github.com/Jerrymwolf/get-research-done.git
cd get-research-done
node bin/install.js --claude --local
```

**Uninstalling**

```bash
npx get-research-done --claude --global --uninstall
npx get-research-done --opencode --global --uninstall
npx get-research-done --codex --global --uninstall
# For local installs, replace --global with --local
```

**Protecting sensitive files**

Add to `.claude/settings.json` to prevent GRD from reading secrets:

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

**Troubleshooting**

Commands not found? Restart your runtime. Verify files exist in `~/.claude/commands/grd/` (global) or `./.claude/commands/grd/` (local). Re-run `npx get-research-done` to reinstall.

</details>

## How It Works

> **Building on an existing codebase?** Run `/grd:map-codebase` first to analyze your project's structure before starting research.

### 1. Initialize — `/grd:new-research`

One command, one flow:

1. **Questions** — Asks until it understands your research goals, scope, constraints, and existing literature
2. **Research** — Spawns parallel agents to investigate the domain (optional but recommended)
3. **Requirements** — Extracts research questions with acceptance criteria for "answered"
4. **Roadmap** — Creates phases mapped to requirements

You approve the roadmap. GRD includes a bootstrap step that inventories existing research to prevent re-investigating known findings.

### 2. Scope — `/grd:scope-inquiry 1`

Your roadmap has a sentence or two per phase — not enough to direct a research investigation the way you intend it. This step identifies gray areas (scope boundaries, methodological preferences, known constraints, open questions) and asks until you're satisfied. The output feeds directly into the researcher and planner.

Skip it and the system uses reasonable defaults. Use it and the investigation stays focused.

### 3. Plan — `/grd:plan-inquiry 1`

The system researches how to approach the phase, creates 2–3 atomic task plans with source acquisition specifications, and verifies plans against requirements. Research-specific agents handle source discovery, methodology analysis, theoretical architecture, and limitations assessment.

### 4. Execute — `/grd:conduct-inquiry 1`

Plans run in parallel waves — independent tasks in the same wave, dependent tasks in later waves:

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

### 5. Verify — `/grd:verify-inquiry 1`

Two-tier verification:

- **Tier 1 — Goal-backward:** Does the research answer the question? Extracts testable conditions and checks each against the notes produced.
- **Tier 2 — Source audit:** Checks frontmatter completeness, reference-to-file correspondence, SOURCE-LOG accounting, and bootstrap inventory consistency.

If gaps remain, it creates fix plans. Run `/grd:conduct-inquiry` again to close them.

### 6. Repeat

```
/grd:scope-inquiry 2 → /grd:plan-inquiry 2 → /grd:conduct-inquiry 2 → /grd:verify-inquiry 2
...
/grd:complete-study      # Archive milestone, tag release
/grd:new-milestone       # Start next cycle
```

Use `--auto` on any core command to skip interactive prompts and use reasonable defaults.

## Commands

| Command | What it does |
|---------|-------------|
| **Core Workflow** | |
| `/grd:new-research` | Initialize: questions → research → requirements → roadmap |
| `/grd:scope-inquiry [N]` | Capture research decisions before planning |
| `/grd:plan-inquiry [N]` | Research + plan + verify for a phase |
| `/grd:conduct-inquiry <N>` | Execute plans in parallel waves |
| `/grd:verify-inquiry [N]` | Two-tier verification (goal-backward + source audit) <sup>1</sup> |
| `/grd:complete-study` | Archive milestone, tag release |
| `/grd:new-milestone [name]` | Start next version with fresh roadmap |
| | |
| **Navigation** | |
| `/grd:progress` | Where am I? What's next? |
| `/grd:help` | All commands and usage |
| `/grd:update` | Update GRD with changelog preview |
| `/grd:map-codebase` | Analyze existing codebase before starting |
| | |
| **Phase Management** | |
| `/grd:add-phase` | Append phase to roadmap |
| `/grd:insert-phase [N]` | Insert urgent work between phases |
| `/grd:remove-phase [N]` | Remove future phase, renumber |
| `/grd:list-phase-assumptions [N]` | See Claude's intended approach before planning |
| `/grd:plan-milestone-gaps` | Create phases to close gaps from audit |
| `/grd:audit-milestone` | Verify milestone achieved its definition of done |
| | |
| **Session & Utilities** | |
| `/grd:pause-work` | Create handoff when stopping mid-phase |
| `/grd:resume-work` | Restore from last session |
| `/grd:quick [--full] [--discuss]` | Ad-hoc task with source attachment, shorter path |
| `/grd:settings` | Configure model profile and workflow agents |
| `/grd:set-profile <profile>` | Switch model profile (quality / balanced / budget) |
| `/grd:add-todo [desc]` | Capture idea for later |
| `/grd:check-todos` | List pending todos |
| `/grd:debug [desc]` | Systematic debugging with persistent state |
| `/grd:health [--repair]` | Validate `.planning/` integrity |

<sup>1</sup> Verify command contributed by reddit user OracleGreyBeard. All core commands accept `--auto` to skip interactive prompts.

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

Switch with `/grd:set-profile budget` or via `/grd:settings`.

**Workflow Agents**

| Setting | Default | What it does |
|---------|---------|-------------|
| `workflow.research` | `true` | Research domain before planning each phase |
| `workflow.plan_check` | `true` | Verify plans achieve phase goals before execution |
| `workflow.verifier` | `true` | Confirm deliverables after execution |
| `workflow.auto_advance` | `false` | Auto-chain scope → plan → execute without stopping |

Override per-invocation: `/grd:plan-inquiry --skip-research` or `--skip-verify`

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

## Attribution

GRD is a research-oriented fork of [Get Shit Done](https://github.com/gsd-build/get-shit-done) by [Lex Christopherson](https://github.com/glittercowboy) ([@gsd_foundation](https://x.com/gsd_foundation)). The original architecture — wave parallelism, fresh subagent contexts, plan/execute/verify loop, and state management — is carried over intact. GRD adapts it for academic research workflows with source attachment.

OpenCode, Gemini CLI, and Codex support was pioneered by community ports: [gsd-opencode](https://github.com/rokicool/gsd-opencode) and gsd-gemini (archived, by uberfuzzy).

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**AI makes research faster. GRD makes it rigorous.**

</div>
