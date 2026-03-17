---
name: gsd:ui-phase
description: Generate UI design contract (UI-SPEC.md) for frontend phases
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
Create a UI design contract (UI-SPEC.md) for a frontend phase.
Orchestrates gsd-r-ui-researcher and gsd-r-ui-checker.
Flow: Validate -> Research UI -> Verify UI-SPEC -> Done
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/get-shit-done-r/workflows/ui-phase.md
@/Users/jeremiahwolf/.claude/get-shit-done-r/references/ui-brand.md
</execution_context>

<context>
Phase number: $ARGUMENTS — optional, auto-detects next unplanned phase if omitted.
</context>

<process>
Execute @/Users/jeremiahwolf/.claude/get-shit-done-r/workflows/ui-phase.md end-to-end.
Preserve all workflow gates.
</process>
