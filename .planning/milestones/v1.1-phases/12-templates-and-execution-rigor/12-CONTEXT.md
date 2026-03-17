# Phase 12: Templates and Execution Rigor - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Sync shared template files with upstream v1.24.0 improvements via diff-and-merge (not wholesale overwrite). Add execution rigor fields (read_first, acceptance_criteria) to phase-prompt.md and execute-plan.md while preserving GSD-R research `<src>` blocks. Sync hooks if upstream source found. Skip agent prompt sync (no upstream agents/ directory) and skip adding upstream-only templates (copilot-instructions.md, UI-SPEC.md).

</domain>

<decisions>
## Implementation Decisions

### Template sync strategy
- Diff and merge shared template files (~20 files) -- NOT wholesale overwrite
- Reason: Some shared templates may have GSD-R-specific sections (research src blocks, research-note references) that would be destroyed by wholesale overwrite
- Researcher must diff each shared template to identify upstream improvements vs GSD-R customizations
- GSD-R's 6 research-specific templates (research-note, source-log, decision-log, terminal-deliverable, research-task, bootstrap) are completely untouched
- Skip copilot-instructions.md and UI-SPEC.md -- defer to Phase 13 when UI workflows are added

### Research-project templates (WKFL-05)
- Keep GSD-R's existing set: DEBATES.md, FRAMEWORKS.md, LANDSCAPE.md, QUESTIONS.md
- Do NOT add upstream's ARCHITECTURE.md, FEATURES.md, PITFALLS.md, STACK.md
- Diff and merge SUMMARY.md (the one file both sets share)
- WKFL-05 is partially satisfied: SUMMARY.md synced, but upstream's 4 project templates are intentionally not added

### Agent prompt sync (TMPL-01)
- Skip entirely -- upstream has no agents/ directory
- GSD-R's 16 agent files in agents/ are fork-specific and have no upstream equivalent to sync from
- Research-specific agents (source-researcher, architecture-researcher, limitations-researcher, methods-researcher) left untouched
- TMPL-01 marked as N/A (no upstream source exists)

### Execution rigor fields (EXEC-01, EXEC-02)
- EXEC-01: Add `read_first` and `acceptance_criteria` fields to phase-prompt.md task XML template
- These sit alongside existing GSD-R `<src>` blocks -- both serve execution quality but for different purposes
- `read_first`: Files executor must read before modifying anything
- `acceptance_criteria`: Grep-verifiable conditions proving task correctness
- EXEC-02: Diff and merge execute-plan.md with upstream to gain mandatory rigor gates
- Preserve GSD-R's research-specific logic (vault writes, source acquisition) during merge
- Do NOT overwrite execute-plan.md wholesale -- research workflow logic would be destroyed

### Hook sync (TMPL-03)
- Investigate whether upstream hook logic exists in install or elsewhere
- GSD-R has 3 hooks: gsd-check-update.js, gsd-context-monitor.js, gsd-statusline.js
- Upstream has no visible hooks/ directory -- hooks may be embedded in upstream's install process
- If upstream source found: diff and merge. If not found: skip TMPL-03

### Template sync (TMPL-02)
- Shared template files (VALIDATION.md, debug templates, etc.) follow the diff-and-merge strategy above
- No special handling -- they are part of the ~20 shared template files

### Claude's Discretion
- Per-file decision on which shared templates need actual changes vs are already current
- How to structure the read_first and acceptance_criteria fields within the existing task XML
- Whether SUMMARY.md in research-project/ has meaningful differences worth merging
- Hook investigation approach

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Upstream sync targets (v1.24.0)
- `~/.claude/get-shit-done/templates/` -- All upstream template files (27 files) -- diff source for shared templates
- `~/.claude/get-shit-done/templates/phase-prompt.md` -- Upstream's task template with read_first + acceptance_criteria fields
- `~/.claude/get-shit-done/templates/research-project/SUMMARY.md` -- Upstream's SUMMARY.md for diff comparison

### Current GSD-R implementation
- `get-shit-done-r/templates/` -- All GSD-R template files (32 files) -- diff targets
- `get-shit-done-r/templates/phase-prompt.md` -- GSD-R's task template with research `<src>` blocks
- `get-shit-done-r/templates/research-project/` -- GSD-R's research-project templates (DEBATES, FRAMEWORKS, LANDSCAPE, QUESTIONS, SUMMARY)

### Execution workflow
- `~/.claude/get-shit-done/workflows/execute-plan.md` -- Upstream's execute-plan workflow (diff source for rigor gates)
- GSD-R's execute-plan.md equivalent (location TBD by researcher -- may be in workflows/ or templates/)

### Hook files
- `hooks/gsd-check-update.js` -- GSD-R's update checker hook
- `hooks/gsd-context-monitor.js` -- GSD-R's context monitor hook
- `hooks/gsd-statusline.js` -- GSD-R's statusline hook

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing template structure: Markdown with frontmatter, XML task blocks, section-based organization
- Phase-prompt.md already has research `<src method="" format="">` blocks in task XML
- 16 agent prompt files with established gsd-r-* naming convention
- 3 hook JS files with established patterns

### Established Patterns
- Templates use `{placeholder}` syntax for variable substitution
- Task XML uses `<task>`, `<action>`, `<verify>`, `<done>` structure
- Research-specific fields: `<src>` blocks with method and format attributes
- Frontmatter uses YAML-style `key: value` pairs

### Integration Points
- phase-prompt.md is consumed by gsd-planner agent to generate PLAN.md files
- execute-plan.md is consumed by gsd-executor agent during plan execution
- Templates are referenced by workflows and agents via file paths
- Hooks are loaded by Claude Code's hook system from hooks/ directory

### Files NOT in scope (untouched)
- agents/ -- all 16 agent files (TMPL-01 skipped)
- Research-specific templates (research-note, source-log, decision-log, terminal-deliverable, research-task, bootstrap)
- copilot-instructions.md, UI-SPEC.md (deferred to Phase 13)
- Upstream research-project templates ARCHITECTURE/FEATURES/PITFALLS/STACK (not adding)

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

- copilot-instructions.md template -- add when UI workflows come in Phase 13
- UI-SPEC.md template -- add when UI workflows come in Phase 13
- Upstream research-project templates (ARCHITECTURE, FEATURES, PITFALLS, STACK) -- intentionally not adding, GSD-R has its own research-focused set
- Agent prompt improvements -- no upstream source exists, defer to future GSD-R-specific improvement pass

</deferred>

---

*Phase: 12-templates-and-execution-rigor*
*Context gathered: 2026-03-15*
