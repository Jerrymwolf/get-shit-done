---
name: gsd:add-tests
description: Add verification criteria for a completed research phase based on findings and evidence quality
argument-hint: "<phase> [additional instructions]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
argument-instructions: |
  Parse the argument as a phase number (integer, decimal, or letter-suffix), plus optional free-text instructions.
  Example: /grd:add-verification 12
  Example: /grd:add-verification 12 focus on source coverage in the methodology section
---
<objective>
Add evidence checks and source coverage assertions for a completed research phase, using its SUMMARY.md and CONTEXT.md as specifications for what needs verification.

Analyzes research artifacts, classifies them into Evidence Check (source verification), Coverage Assertion (completeness check), or Skip categories, presents a verification plan for user approval, then generates verification criteria.

Output: Verification criteria committed with message `verify(phase-{N}): add verification criteria from add-verification command`
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/add-tests.md
</execution_context>

<context>
Phase: $ARGUMENTS

@.planning/STATE.md
@.planning/ROADMAP.md
</context>

<process>
Execute the add-verification workflow from @/Users/jeremiahwolf/.claude/grd/workflows/add-tests.md end-to-end.
Preserve all workflow gates (classification approval, verification plan approval, evidence checking, gap reporting).
</process>
