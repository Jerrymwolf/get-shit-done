---
name: grd:plan-inquiry
description: Create detailed inquiry plan (PLAN.md) with verification loop
argument-hint: "<phase-number>"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---
<objective>
Create a detailed execution plan for the specified phase/inquiry.

**Creates:** `{phase}-{plan}-PLAN.md` in the phase directory.

**After this command:** Run `/grd:conduct-inquiry <phase>` to execute.
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/plan-inquiry.md
@/Users/jeremiahwolf/.claude/grd/references/planning-config.md
</execution_context>

<process>
Execute the plan-inquiry workflow from @/Users/jeremiahwolf/.claude/grd/workflows/plan-inquiry.md end-to-end.
Preserve all routing logic and verification gates.
</process>
