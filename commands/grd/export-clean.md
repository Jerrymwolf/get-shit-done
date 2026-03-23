---
name: grd:export-clean
description: Package research notes without .planning/ artifacts for sharing or submission
argument-hint: "[target-dir]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---
<objective>
Create a clean research package by filtering out .planning/ artifacts (STATE.md, PLAN.md,
SUMMARY.md, CONTEXT.md, etc.). The export contains only research deliverables -- notes,
sources, synthesis documents -- ready for sharing with collaborators or submission.

Uses selective copying to rebuild a clean directory structure.
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/export-clean.md
</execution_context>

<context>
Target directory: $ARGUMENTS -- optional, defaults to `./export/`.
</context>

<process>
Execute @/Users/jeremiahwolf/.claude/grd/workflows/export-clean.md end-to-end.
Preserve all filtering and verification steps.
</process>
