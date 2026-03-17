<div align="center">

# GSD-R

**Research-grade context engineering for AI-assisted academic workflows.**

[![npm version](https://img.shields.io/npm/v/get-shit-done-r?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-shit-done-r)
[![npm downloads](https://img.shields.io/npm/dm/get-shit-done-r?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-shit-done-r)
[![Tests](https://img.shields.io/github/actions/workflow/status/glittercowboy/get-shit-done-r/test.yml?branch=main&style=for-the-badge&logo=github&label=Tests)](https://github.com/glittercowboy/get-shit-done-r/actions/workflows/test.yml)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<br>

```bash
npx get-shit-done-r@latest
```

**Works on Mac, Windows, and Linux.**

</div>

---

## Attribution

GSD-R is a research-oriented fork of [Get Shit Done](https://github.com/glittercowboy/get-shit-done-cc) by [Lex Christopherson](https://github.com/glittercowboy) ([@gsd_foundation](https://x.com/gsd_foundation)). The original GSD system's architecture — wave parallelism, fresh subagent contexts, plan/execute/verify loop, and state management — is carried over intact. GSD-R adapts the intellectual scaffolding for academic research workflows with source attachment.

GSD-R was itself built using GSD.

Original project: [github.com/glittercowboy/get-shit-done-cc](https://github.com/glittercowboy/get-shit-done-cc)
License: MIT — see [LICENSE](LICENSE) (copyright Lex Christopherson)

---

## What This Is

AI-assisted research tools degrade as context accumulates. The longer a session runs, the more prior conversation competes with the task at hand — citations get muddled, sources are paraphrased from memory rather than quoted from text, and the quality of synthesis drops. GSD solved this problem for code development by giving each agent a fresh context window and a structured plan. GSD-R extends the same architecture to research: literature reviews, systematic analysis, doctoral work, and any project where rigorous source handling matters. The atomic unit shifts from git commits to research notes with physically attached source material.

GSD-R orchestrates AI agents through a discuss/plan/execute/verify loop. Each agent receives a fresh context window scoped to a single task. For research, this means sources are downloaded and saved locally — not just linked — so the research corpus is self-contained and auditable even if every URL goes dead tomorrow. Notes follow a consistent template with structured frontmatter, analysis, implications, and references. Every citation has a corresponding file in a sibling `-sources/` folder. Verification checks that research questions are actually answered and that the source audit trail is complete.

GSD-R also works for code. It inherits the full GSD code development capabilities — atomic git commits, test verification, parallel execution. If a project involves both research and implementation (investigate a domain, then build the thing), GSD-R handles the full lifecycle without switching tools.

---

## How It Works

> **Already have code?** Run `/gsd-r:map-codebase` first. It spawns parallel agents to analyze your stack, architecture, conventions, and concerns. Then `/gsd-r:new-project` knows your codebase — questions focus on what you're adding, and planning automatically loads your patterns.

### 1. Initialize Project

```
/gsd-r:new-project
```

One command, one flow. The system:

1. **Questions** — Asks until it understands your research goals completely (questions, constraints, existing literature, scope boundaries)
2. **Research** — Spawns parallel agents to investigate the domain (optional but recommended)
3. **Requirements** — Extracts research questions with acceptance criteria for "answered"
4. **Roadmap** — Creates phases mapped to requirements

You approve the roadmap. Now you're ready to research.

GSD-R includes a bootstrap step that inventories existing research to prevent re-investigating known findings. See [docs/DESIGN.md](docs/DESIGN.md) for full detail.

**Creates:** `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `.planning/research/`

---

### 2. Discuss Phase

```
/gsd-r:discuss-phase 1
```

**This is where you lock in decisions before research runs.**

Your roadmap has a sentence or two per phase. That's not enough context to direct a research investigation the way *you* intend it. This step captures your commitments and constraints before anything gets planned or executed.

The system analyzes the phase and identifies gray areas:

- **Scope boundaries** — What's in, what's out, what's already settled
- **Methodological preferences** — Quantitative vs. qualitative, primary vs. secondary sources, depth vs. breadth
- **Known constraints** — Hardware limits, timeline, non-negotiable decisions
- **Open questions** — What the research should resolve vs. what's already decided

For each area you select, it asks until you're satisfied. The output — `CONTEXT.md` — feeds directly into the next two steps:

1. **Researcher reads it** — Knows what sources to prioritize and what's already settled
2. **Planner reads it** — Knows which decisions are locked and which are open for investigation

The deeper you go here, the more targeted the research becomes. Skip it and you get reasonable defaults. Use it and you get focused, efficient investigation.

**Creates:** `{phase_num}-CONTEXT.md`

---

### 3. Plan Phase

```
/gsd-r:plan-phase 1
```

The system:

1. **Researches** — Investigates how to approach this phase, guided by your CONTEXT.md decisions
2. **Plans** — Creates 2-3 atomic task plans with XML structure
3. **Verifies** — Checks plans against requirements, loops until they pass

Research-specific agents replace the standard code researchers:

| GSD Code Researcher | GSD-R Researcher |
|---|---|
| Stack researcher | Source researcher — find papers, repos, docs; verify URLs are live; identify PDFs vs. HTML |
| Features researcher | Methods researcher — how have others investigated this? What methodologies, what findings? |
| Architecture researcher | Architecture researcher — theoretical structure, construct relationships, boundary conditions |
| Pitfalls researcher | Limitations researcher — known failures, edge cases, epistemological limitations, retractions |

Each task uses `<src>` blocks specifying the acquisition method, format, and URL so the executor knows exactly how to obtain each source before synthesis begins.

**Creates:** `{phase_num}-RESEARCH.md`, `{phase_num}-{N}-PLAN.md`

---

### 4. Execute Phase

```
/gsd-r:execute-phase 1
```

The system:

1. **Runs plans in waves** — Parallel where possible, sequential when dependent
2. **Fresh context per plan** — 200k tokens purely for source acquisition and synthesis, zero accumulated context
3. **Source acquisition + vault write as atomic deliverable** — Every task produces a research note, its `-sources/` folder with acquired files, and a `SOURCE-LOG.md` audit trail
4. **Verifies against goals** — Checks that the research question is answered and sources are attached

Walk away, come back to completed research with a full source audit trail.

**How Wave Execution Works:**

Plans are grouped into "waves" based on dependencies. Within each wave, plans run in parallel. Waves run sequentially.

```
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE EXECUTION                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  WAVE 1 (parallel)          WAVE 2 (parallel)          WAVE 3       │
│  ┌─────────┐ ┌─────────┐    ┌─────────┐ ┌─────────┐    ┌─────────┐ │
│  │ Plan 01 │ │ Plan 02 │ →  │ Plan 03 │ │ Plan 04 │ →  │ Plan 05 │ │
│  │         │ │         │    │         │ │         │    │         │ │
│  │ User    │ │ Product │    │ Orders  │ │ Cart    │    │ Checkout│ │
│  │ Model   │ │ Model   │    │ API     │ │ API     │    │ UI      │ │
│  └─────────┘ └─────────┘    └─────────┘ └─────────┘    └─────────┘ │
│       │           │              ↑           ↑              ↑       │
│       └───────────┴──────────────┴───────────┘              │       │
│              Dependencies: Plan 03 needs Plan 01            │       │
│                          Plan 04 needs Plan 02              │       │
│                          Plan 05 needs Plans 03 + 04        │       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Why waves matter:**
- Independent plans → Same wave → Run in parallel
- Dependent plans → Later wave → Wait for dependencies
- File conflicts → Sequential plans or same plan

For research, independent topics (e.g., "survey orchestration frameworks" and "survey graph databases") run in the same wave. Synthesis tasks that depend on multiple notes wait for their inputs.

**Creates:** `{phase_num}-{N}-SUMMARY.md`, `{phase_num}-VERIFICATION.md`

---

### 5. Verify Work

```
/gsd-r:verify-work 1
```

**Two-tier verification for research:**

**Tier 1 — Goal-backward:** Does the research actually answer the question? The system extracts testable deliverables from the phase goals and walks you through each one. If a question remains unanswered, it identifies which note is missing or incomplete and creates fix tasks.

**Tier 2 — Source audit:** For each note in the phase, the system checks that frontmatter is complete, every reference has a corresponding file in `-sources/`, SOURCE-LOG.md accounts for all sources, and no finding contradicts the bootstrap inventory without explicit justification.

If everything passes, you move on. If something's broken, you don't manually fix it — you run `/gsd-r:execute-phase` again with the fix plans it created.

**Creates:** `{phase_num}-UAT.md`, fix plans if issues found

---

### 6. Repeat → Complete → Next Milestone

```
/gsd-r:discuss-phase 2
/gsd-r:plan-phase 2
/gsd-r:execute-phase 2
/gsd-r:verify-work 2
...
/gsd-r:complete-milestone
/gsd-r:new-milestone
```

Loop **discuss → plan → execute → verify** until milestone complete.

Each phase gets your input (discuss), proper source investigation (plan), clean execution with fresh context (execute), and two-tier verification (verify). Context stays fresh. Quality stays high.

When all phases are done, `/gsd-r:complete-milestone` archives the milestone and tags the release.

Then `/gsd-r:new-milestone` starts the next version — same flow as `new-project` but for your existing research corpus. You describe what you want to investigate next, the system researches the domain, you scope requirements, and it creates a fresh roadmap. Each milestone is a clean cycle: define → research → verify.

### Translation Table

| GSD (Code) | GSD-R (Research) |
|---|---|
| Git commit | Research note + sources written to vault |
| Source code files | Source material (PDF, scraped .md, screenshot) |
| Test passes | Note passes format + citation + source-attachment check |
| `git bisect` | Note-level rollback |
| Build succeeds | Research question answered |

For the full design rationale, see [docs/DESIGN.md](docs/DESIGN.md).

---

## The Research Workflow

### Source Attachment Protocol

Every source cited in a note's References section must have a corresponding file in the note's `-sources/` folder. A note without its sources is like a commit without its files — incomplete.

Every note `Foo.md` has a sibling folder `Foo-sources/`:

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

Files follow the naming convention `{descriptive-slug}_{date-acquired}.{ext}`. The date stamp prevents confusion when a source is re-acquired after an update.

**Acquisition methods by source type:**

| Source Type | Acquire With | Save As | Example |
|---|---|---|---|
| arXiv paper | `wget` direct PDF URL | `.pdf` | `karma-arXiv-2502.06472_2026-03-10.pdf` |
| arXiv HTML | `firecrawl scrape` or `web_fetch` on `/html/` URL | `.md` | `karma-arXiv-2502.06472-html_2026-03-10.md` |
| GitHub README | `firecrawl scrape` or `web_fetch` raw URL | `.md` | `lightrag-readme_2026-03-10.md` |
| GitHub issue | `gh issue view` or `web_fetch` | `.md` | `lightrag-issue-2696_2026-03-10.md` |
| Documentation site | `firecrawl scrape` or `web_fetch` | `.md` | `age-postgresql-docs_2026-03-10.md` |
| Conference paper | `wget` PDF from proceedings URL | `.pdf` | `logos-aaai-2026_2026-03-10.pdf` |
| Web page (general) | `web_fetch` → save response | `.md` | `ollama-model-library_2026-03-10.md` |
| Diagram / screenshot | `playwright screenshot` or download | `.png` | `graphrag-architecture_2026-03-10.png` |

**Fallback chain:** If the primary acquisition method fails, the subagent tries the next method before marking the source as unavailable: `firecrawl scrape → web_fetch → wget/curl → mark unavailable in SOURCE-LOG.md`. A source marked unavailable does not block the task — the subagent documents the failure, continues synthesis from available sources, and flags the gap.

### Research Note Template

The system will produce notes following this template:

```markdown
---
project: [Project]
domain: [domain]
status: draft | reviewed | final
date: 2026-03-10
sources: 5          # count of files in -sources/ folder
---

# [Title]

## Key Findings

[2-3 sentence summary of what this note concludes]

## Analysis

[Main body. Inline citations as (Author, Year) or [Source Title](relative-path-to-source-file).
Link to the local source file in -sources/, not the URL.]

## Implications for [Project]

[How this finding affects the research — always tie back to project constraints, goals, and timeline.
End with an explicit **Recommendation:** if the evidence supports one.]

## Open Questions

[What remains unresolved. If a source was unavailable, note it here.
If a finding is low-confidence, say so and say why.]

## References

[Full list. Every entry has a corresponding file in -sources/ folder.
Format: Author/Org (Year). Title. `filename_in_sources_folder.ext`]

1. Author/Org (Year). Title. `source-file_2026-03-10.ext`
2. ...
```

### Two-Tier Verification

GSD-R will verify research output at two levels. **Tier 1 (goal-backward)** asks: "What must be TRUE for this research question to be answered?" — then checks each condition against the notes produced. **Tier 2 (source audit)** checks structural integrity: frontmatter completeness, reference-to-file correspondence in `-sources/`, SOURCE-LOG.md accounting, and consistency with the bootstrap inventory. Tier 1 catches incomplete research; Tier 2 catches incomplete documentation.

### BOOTSTRAP.md

During project initialization, GSD-R will inventory existing research — findings already established, findings partially established that should be extended rather than restarted, and topics not yet researched. This inventory is saved as BOOTSTRAP.md and loaded by every subsequent phase to prevent re-investigating known findings. See [docs/DESIGN.md](docs/DESIGN.md) for the full bootstrap format and workflow.

---

## Quick Mode

```
/gsd-r:quick
```

**For ad-hoc tasks that don't need full planning.**

Quick mode gives you GSD-R guarantees (source attachment, state tracking) with a faster path:

- **Same agents** — Planner + executor, same quality
- **Skips optional steps** — No research, no plan checker, no verifier
- **Separate tracking** — Lives in `.planning/quick/`, not phases

Use for: targeted fixes to individual notes, small additions, one-off source acquisition.

```
/gsd-r:quick
> What do you want to do? "Add the missing LOGOS paper source to Concordance-Patterns"
```

Use `--full` to add plan-checking and verification. Use `--discuss` to gather context first.

**Creates:** `.planning/quick/001-add-logos-paper/PLAN.md`, `SUMMARY.md`

---

## Commands

### Core Workflow

| Command | What it does |
|---------|--------------|
| `/gsd-r:new-project [--auto]` | Full initialization: questions → research → requirements → roadmap |
| `/gsd-r:discuss-phase [N] [--auto]` | Capture implementation decisions before planning |
| `/gsd-r:plan-phase [N] [--auto]` | Research + plan + verify for a phase |
| `/gsd-r:execute-phase <N>` | Execute all plans in parallel waves, verify when complete |
| `/gsd-r:verify-work [N]` | Manual user acceptance testing ¹ |
| `/gsd-r:audit-milestone` | Verify milestone achieved its definition of done |
| `/gsd-r:complete-milestone` | Archive milestone, tag release |
| `/gsd-r:new-milestone [name]` | Start next version: questions → research → requirements → roadmap |

### Navigation

| Command | What it does |
|---------|--------------|
| `/gsd-r:progress` | Where am I? What's next? |
| `/gsd-r:help` | Show all commands and usage guide |
| `/gsd-r:update` | Update GSD-R with changelog preview |

### Brownfield

| Command | What it does |
|---------|--------------|
| `/gsd-r:map-codebase` | Analyze existing codebase before new-project |

### Phase Management

| Command | What it does |
|---------|--------------|
| `/gsd-r:add-phase` | Append phase to roadmap |
| `/gsd-r:insert-phase [N]` | Insert urgent work between phases |
| `/gsd-r:remove-phase [N]` | Remove future phase, renumber |
| `/gsd-r:list-phase-assumptions [N]` | See Claude's intended approach before planning |
| `/gsd-r:plan-milestone-gaps` | Create phases to close gaps from audit |

### Session

| Command | What it does |
|---------|--------------|
| `/gsd-r:pause-work` | Create handoff when stopping mid-phase |
| `/gsd-r:resume-work` | Restore from last session |

### Utilities

| Command | What it does |
|---------|--------------|
| `/gsd-r:settings` | Configure model profile and workflow agents |
| `/gsd-r:set-profile <profile>` | Switch model profile (quality/balanced/budget) |
| `/gsd-r:add-todo [desc]` | Capture idea for later |
| `/gsd-r:check-todos` | List pending todos |
| `/gsd-r:debug [desc]` | Systematic debugging with persistent state |
| `/gsd-r:quick [--full] [--discuss]` | Execute ad-hoc task with GSD-R guarantees (`--full` adds plan-checking and verification, `--discuss` gathers context first) |
| `/gsd-r:health [--repair]` | Validate `.planning/` directory integrity, auto-repair with `--repair` |

<sup>¹ Contributed by reddit user OracleGreyBeard</sup>

---

## Configuration

GSD-R stores project settings in `.planning/config.json`. Configure during `/gsd-r:new-project` or update later with `/gsd-r:settings`.

### Core Settings

| Setting | Options | Default | What it controls |
|---------|---------|---------|------------------|
| `mode` | `yolo`, `interactive` | `interactive` | Auto-approve vs confirm at each step |
| `granularity` | `coarse`, `standard`, `fine` | `standard` | Phase granularity — how finely scope is sliced (phases × plans) |

### Model Profiles

Control which Claude model each agent uses. Balance quality vs token spend.

| Profile | Planning | Execution | Verification |
|---------|----------|-----------|--------------|
| `quality` | Opus | Opus | Sonnet |
| `balanced` (default) | Opus | Sonnet | Sonnet |
| `budget` | Sonnet | Sonnet | Haiku |

Switch profiles:
```
/gsd-r:set-profile budget
```

Or configure via `/gsd-r:settings`.

### Workflow Agents

These spawn additional agents during planning/execution. They improve quality but add tokens and time.

| Setting | Default | What it does |
|---------|---------|--------------|
| `workflow.research` | `true` | Researches domain before planning each phase |
| `workflow.plan_check` | `true` | Verifies plans achieve phase goals before execution |
| `workflow.verifier` | `true` | Confirms must-haves were delivered after execution |
| `workflow.auto_advance` | `false` | Auto-chain discuss → plan → execute without stopping |

Use `/gsd-r:settings` to toggle these, or override per-invocation:
- `/gsd-r:plan-phase --skip-research`
- `/gsd-r:plan-phase --skip-verify`

### Execution

| Setting | Default | What it controls |
|---------|---------|------------------|
| `parallelization.enabled` | `true` | Run independent plans simultaneously |
| `planning.commit_docs` | `true` | Track `.planning/` in git |

### Git Branching

Control how GSD-R handles branches during execution.

| Setting | Options | Default | What it does |
|---------|---------|---------|--------------|
| `git.branching_strategy` | `none`, `phase`, `milestone` | `none` | Branch creation strategy |
| `git.phase_branch_template` | string | `gsd/phase-{phase}-{slug}` | Template for phase branches |
| `git.milestone_branch_template` | string | `gsd/{milestone}-{slug}` | Template for milestone branches |

**Strategies:**
- **`none`** — Commits to current branch (default behavior)
- **`phase`** — Creates a branch per phase, merges at phase completion
- **`milestone`** — Creates one branch for entire milestone, merges at completion

At milestone completion, GSD-R offers squash merge (recommended) or merge with history.

---

## Getting Started

```bash
npx get-shit-done-r@latest
```

The installer prompts you to choose:
1. **Runtime** — Claude Code, OpenCode, Gemini, Codex, or all
2. **Location** — Global (all projects) or local (current project only)

Verify with:
- Claude Code / Gemini: `/gsd-r:help`
- OpenCode: `/gsd-help`
- Codex: `$gsd-help`

> [!NOTE]
> Codex installation uses skills (`skills/gsd-*/SKILL.md`) rather than custom prompts.

### Staying Updated

GSD-R evolves fast. Update periodically:

```bash
npx get-shit-done-r@latest
```

<details>
<summary><strong>Non-interactive Install (Docker, CI, Scripts)</strong></summary>

```bash
# Claude Code
npx get-shit-done-r --claude --global   # Install to ~/.claude/
npx get-shit-done-r --claude --local    # Install to ./.claude/

# OpenCode (open source, free models)
npx get-shit-done-r --opencode --global # Install to ~/.config/opencode/

# Gemini CLI
npx get-shit-done-r --gemini --global   # Install to ~/.gemini/

# Codex (skills-first)
npx get-shit-done-r --codex --global    # Install to ~/.codex/
npx get-shit-done-r --codex --local     # Install to ./.codex/

# All runtimes
npx get-shit-done-r --all --global      # Install to all directories
```

Use `--global` (`-g`) or `--local` (`-l`) to skip the location prompt.
Use `--claude`, `--opencode`, `--gemini`, `--codex`, or `--all` to skip the runtime prompt.

</details>

<details>
<summary><strong>Development Installation</strong></summary>

Clone the repository and run the installer locally:

```bash
git clone https://github.com/glittercowboy/get-shit-done-r.git
cd get-shit-done-r
node bin/install.js --claude --local
```

Installs to `./.claude/` for testing modifications before contributing.

</details>

### Recommended: Skip Permissions Mode

GSD-R is designed for frictionless automation. Run Claude Code with:

```bash
claude --dangerously-skip-permissions
```

> [!TIP]
> This is how GSD-R is intended to be used — stopping to approve `date` and `git commit` 50 times defeats the purpose.

<details>
<summary><strong>Alternative: Granular Permissions</strong></summary>

If you prefer not to use that flag, add this to your project's `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(date:*)",
      "Bash(echo:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(wc:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(sort:*)",
      "Bash(grep:*)",
      "Bash(tr:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git tag:*)"
    ]
  }
}
```

</details>

---

## Security

### Protecting Sensitive Files

GSD-R's codebase mapping and analysis commands read files to understand your project. **Protect files containing secrets** by adding them to Claude Code's deny list:

1. Open Claude Code settings (`.claude/settings.json` or global)
2. Add sensitive file patterns to the deny list:

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/secrets/*)",
      "Read(**/*credential*)",
      "Read(**/*.pem)",
      "Read(**/*.key)"
    ]
  }
}
```

This prevents Claude from reading these files entirely, regardless of what commands you run.

> [!IMPORTANT]
> GSD-R includes built-in protections against committing secrets, but defense-in-depth is best practice. Deny read access to sensitive files as a first line of defense.

---

## Troubleshooting

**Commands not found after install?**
- Restart your runtime to reload commands/skills
- Verify files exist in `~/.claude/commands/gsd-r/` (global) or `./.claude/commands/gsd-r/` (local)
- For Codex, verify skills exist in `~/.codex/skills/gsd-*/SKILL.md` (global) or `./.codex/skills/gsd-*/SKILL.md` (local)

**Commands not working as expected?**
- Run `/gsd-r:help` to verify installation
- Re-run `npx get-shit-done-r` to reinstall

**Updating to the latest version?**
```bash
npx get-shit-done-r@latest
```

**Using Docker or containerized environments?**

If file reads fail with tilde paths (`~/.claude/...`), set `CLAUDE_CONFIG_DIR` before installing:
```bash
CLAUDE_CONFIG_DIR=/home/youruser/.claude npx get-shit-done-r --global
```
This ensures absolute paths are used instead of `~` which may not expand correctly in containers.

### Uninstalling

To remove GSD-R completely:

```bash
# Global installs
npx get-shit-done-r --claude --global --uninstall
npx get-shit-done-r --opencode --global --uninstall
npx get-shit-done-r --codex --global --uninstall

# Local installs (current project)
npx get-shit-done-r --claude --local --uninstall
npx get-shit-done-r --opencode --local --uninstall
npx get-shit-done-r --codex --local --uninstall
```

This removes all GSD-R commands, agents, hooks, and settings while preserving your other configurations.

---

## Community Ports

OpenCode, Gemini CLI, and Codex are now natively supported via `npx get-shit-done-r`.

These community ports pioneered multi-runtime support:

| Project | Platform | Description |
|---------|----------|-------------|
| [gsd-opencode](https://github.com/rokicool/gsd-opencode) | OpenCode | Original OpenCode adaptation |
| gsd-gemini (archived) | Gemini CLI | Original Gemini adaptation by uberfuzzy |

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**AI makes research faster. GSD-R makes it rigorous.**

</div>
