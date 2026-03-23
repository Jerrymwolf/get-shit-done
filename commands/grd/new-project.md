---
name: gsd:new-project
description: Initialize a new project with deep context gathering and PROJECT.md
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
- `--auto` — Automatic mode. After config questions, runs research → requirements → roadmap without further interaction. Expects idea document via @ reference.
</context>

<objective>
Initialize a new project through unified flow: questioning → research (optional) → requirements → roadmap.

**Creates:**
- `.planning/PROJECT.md` — project context
- `.planning/config.json` — workflow preferences
- `.planning/research/` — domain research (optional)
- `.planning/REQUIREMENTS.md` — scoped requirements
- `.planning/ROADMAP.md` — phase structure
- `.planning/STATE.md` — project memory

**After this command:** Run `/grd:plan-phase 1` to start execution.
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/new-project.md
@/Users/jeremiahwolf/.claude/grd/references/questioning.md
@/Users/jeremiahwolf/.claude/grd/references/ui-brand.md
@/Users/jeremiahwolf/.claude/grd/templates/project.md
@/Users/jeremiahwolf/.claude/grd/templates/requirements.md
</execution_context>

<process>
Execute the new-project workflow from @/Users/jeremiahwolf/.claude/grd/workflows/new-project.md end-to-end.
Preserve all workflow gates (validation, approvals, commits, routing).
</process>
