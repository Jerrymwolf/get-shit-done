---
name: grd:verify-inquiry
description: Validate research through three-tier verification (sufficiency, goal-backward, source audit)
argument-hint: "<phase-number>"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---
<objective>
Run three-tier verification against the specified phase:
- Tier 0: Sufficiency of evidence
- Tier 1: Goal-backward quality check
- Tier 2: Source audit (every finding traces to a local file)

**After this command:** Run `/grd:synthesize` or `/grd:progress` for next steps.
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/verify-inquiry.md
@/Users/jeremiahwolf/.claude/grd/references/research-verification.md
</execution_context>

<process>
Execute the verify-inquiry workflow from @/Users/jeremiahwolf/.claude/grd/workflows/verify-inquiry.md end-to-end.
Preserve all verification tiers and interactive gates.
</process>
