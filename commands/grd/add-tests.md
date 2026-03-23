---
name: grd:add-verification
description: Add evidence checks, source coverage assertions, and methodology validation for a completed research phase
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
  Example: /grd:add-verification 12 focus on source coverage for autonomy domain
---
<objective>
Add verification criteria for a completed research phase, using its SUMMARY.md, CONTEXT.md, and VERIFICATION.md as specifications.

Analyzes research outputs (notes, sources, synthesis documents), classifies them into Evidence (source fidelity), Coverage (completeness), or Methodology (soundness) categories, presents a verification plan for user approval, then generates verification criteria and checks.

Output: Verification criteria committed with message `chore(phase-{N}): add verification criteria from add-verification command`
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
Preserve all workflow gates (classification approval, verification plan approval, criteria generation, gap reporting).
</process>
