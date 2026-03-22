---
name: grd:synthesize
description: Transform verified notes into structured scholarship (themes, frameworks, gaps, argument)
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---
<objective>
Run synthesis workflow with four activities:
1. Thematic synthesis (THEMES.md)
2. Theoretical integration (FRAMEWORK.md)
3. Gap analysis (GAPS.md)
4. Argument construction (Executive Summary)

**After this command:** Run `/grd:complete-study` to finalize.
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/synthesize.md
</execution_context>

<process>
Execute the synthesize workflow from @/Users/jeremiahwolf/.claude/grd/workflows/synthesize.md end-to-end.
Preserve dependency ordering: themes → framework/gaps (parallel) → argument.
</process>
