---
name: grd:conduct-inquiry
description: Execute all plans in a phase with wave-based parallelization
argument-hint: "<phase-number>"
allowed-tools:
  - Read
  - Bash
  - Write
  - Edit
  - Task
  - AskUserQuestion
---
<objective>
Execute all plans in the specified phase, creating research notes with source attachment.

**After this command:** Run `/grd:verify-inquiry <phase>` to verify.
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/conduct-inquiry.md
@/Users/jeremiahwolf/.claude/grd/references/source-protocol.md
@/Users/jeremiahwolf/.claude/grd/references/note-format.md
</execution_context>

<process>
Execute the conduct-inquiry workflow from @/Users/jeremiahwolf/.claude/grd/workflows/conduct-inquiry.md end-to-end.
Preserve all execution gates, atomic commits, and state management.
</process>
