---
name: grd:export-research
description: Package research notes, sources, and synthesis for delivery (Obsidian vault, manuscript, archive)
argument-hint: "[phase|milestone]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---
<objective>
Package completed research for delivery. Validates research completeness (notes, sources, synthesis),
then assembles deliverables in the chosen export format (Obsidian vault structure, manuscript assembly,
shareable archive).

Orchestrates the export-research workflow end-to-end.
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/export-research.md
</execution_context>

<context>
Phase or milestone: $ARGUMENTS -- optional, defaults to current phase.
</context>

<process>
Execute @/Users/jeremiahwolf/.claude/grd/workflows/export-research.md end-to-end.
Preserve all validation gates and export steps.
</process>
