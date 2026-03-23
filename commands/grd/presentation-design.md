---
name: grd:presentation-design
description: Plan how research findings will be presented (paper, poster, slide deck, report)
argument-hint: "[phase]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - WebFetch
  - AskUserQuestion
  - mcp__context7__*
---
<objective>
Create a presentation design contract (PRESENTATION-SPEC.md) for a research phase.
Determines how findings will be communicated: paper structure, poster layout,
slide deck flow, or report format. Locks structural and narrative decisions
before the researcher assembles final deliverables.

Orchestrates the presentation-design workflow end-to-end.
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/presentation-design.md
</execution_context>

<context>
Phase number: $ARGUMENTS -- optional, auto-detects current phase if omitted.
</context>

<process>
Execute @/Users/jeremiahwolf/.claude/grd/workflows/presentation-design.md end-to-end.
Preserve all workflow gates.
</process>
