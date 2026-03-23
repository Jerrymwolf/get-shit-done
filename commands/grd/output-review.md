---
name: grd:output-review
description: Audit quality of research deliverables -- completeness, citation coverage, argument coherence
argument-hint: "[phase]"
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
Conduct a scholarly quality audit of research deliverables. Evaluates six research
dimensions: argument coherence, evidence quality, citation coverage, methodology
transparency, presentation clarity, and completeness. Produces OUTPUT-REVIEW.md
with scored assessment and actionable findings.

Works on any completed research phase.
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/output-review.md
</execution_context>

<context>
Phase: $ARGUMENTS -- optional, defaults to last completed phase.
</context>

<process>
Execute @/Users/jeremiahwolf/.claude/grd/workflows/output-review.md end-to-end.
Preserve all workflow gates.
</process>
