---
name: grd:new-research
description: Initialize a new research project with questioning, scoping, and PROJECT.md
argument-hint: "[--auto]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---
<context>
**Flags:**
- `--auto` — Automatic mode. After config questions, runs research → requirements → roadmap without further interaction.
</context>

<objective>
Initialize a new research project through unified flow: questioning → research (optional) → requirements → roadmap.

**Creates:**
- `.planning/PROJECT.md` — research prospectus
- `.planning/config.json` — workflow preferences (review_type, researcher_tier, epistemological_stance)
- `.planning/research/` — domain research (optional)
- `.planning/REQUIREMENTS.md` — research objectives
- `.planning/ROADMAP.md` — study plan with phases as lines of inquiry
- `.planning/STATE.md` — project state

**After this command:** Run `/grd:plan-inquiry 1` to start planning.
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/new-research.md
@/Users/jeremiahwolf/.claude/grd/references/questioning.md
@/Users/jeremiahwolf/.claude/grd/references/research-depth.md
@/Users/jeremiahwolf/.claude/grd/templates/project.md
@/Users/jeremiahwolf/.claude/grd/templates/requirements.md
</execution_context>

<process>
Execute the new-research workflow from @/Users/jeremiahwolf/.claude/grd/workflows/new-research.md end-to-end.
Preserve all workflow gates (validation, approvals, commits, routing).
</process>
