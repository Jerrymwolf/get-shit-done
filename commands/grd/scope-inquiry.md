---
name: grd:scope-inquiry
description: Gather inquiry context through adaptive questioning before planning
argument-hint: "<phase-number> [--auto]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---
<context>
**Flags:**
- `--auto` — Skip interactive questions, use recommended defaults.
</context>

<objective>
Gather phase context through adaptive questioning before planning. Creates CONTEXT.md.

**After this command:** Run `/grd:plan-inquiry <phase>` to create the plan.
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/scope-inquiry.md
@/Users/jeremiahwolf/.claude/grd/references/questioning.md
</execution_context>

<process>
Execute the scope-inquiry workflow from @/Users/jeremiahwolf/.claude/grd/workflows/scope-inquiry.md end-to-end.
Preserve all questioning gates and context gathering.
</process>
