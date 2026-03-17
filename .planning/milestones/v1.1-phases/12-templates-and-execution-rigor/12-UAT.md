---
status: complete
phase: 12-templates-and-execution-rigor
source: 12-01-SUMMARY.md, 12-02-SUMMARY.md
started: 2026-03-16T02:30:00Z
updated: 2026-03-16T03:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. read_first field in phase-prompt.md task template
expected: Open `get-shit-done-r/templates/phase-prompt.md`. Each auto task example should contain a `<read_first>` XML field listing files the executor must read before modifying anything. There should be at least 4 occurrences of `<read_first>` across the template examples.
result: pass

### 2. acceptance_criteria field in phase-prompt.md task template
expected: In the same file, each auto task example should contain an `<acceptance_criteria>` XML field with grep-verifiable conditions. There should be at least 4 occurrences of `<acceptance_criteria>`. The field order should be: name, files, read_first, action, verify, acceptance_criteria, done.
result: pass

### 3. Anti-pattern for missing rigor fields
expected: `get-shit-done-r/templates/phase-prompt.md` should contain an anti-pattern example or guideline warning against tasks that omit read_first or acceptance_criteria fields.
result: pass

### 4. MANDATORY read_first gate in execute-plan.md
expected: Open `get-shit-done-r/workflows/execute-plan.md`. It should contain a "MANDATORY" read_first gate section that requires the executor to read listed files before starting any task modifications.
result: pass

### 5. MANDATORY acceptance_criteria check in execute-plan.md
expected: Same file should contain a "MANDATORY" acceptance_criteria check section that validates grep-verifiable conditions after task completion, before committing.
result: issue
reported: "Ordering issue. In the execute step, the type=auto bullet (line 140) sequences as: implement → verify done criteria → Commit → track hash. The acceptance_criteria check is a separate bullet after that, meaning it runs after the commit, not before it. If you want acceptance_criteria verified before committing, the check should be folded into the type=auto flow between Verify done criteria and Commit."
severity: major

### 6. Precommit failure handling in execute-plan.md
expected: `get-shit-done-r/workflows/execute-plan.md` should contain a `precommit_failure_handling` section with guidance on retry cycles when pre-commit hooks fail.
result: pass

### 7. Node-repair-aware verification gate in execute-plan.md
expected: The file should contain a verification_failure_gate that references `gsd-r-tools.cjs` and node-repair workflow for handling task verification failures.
result: pass

### 8. canonical_refs section in context.md template
expected: Open `get-shit-done-r/templates/context.md`. It should contain a `<canonical_refs>` section positioned between `</specifics>` and `<code_context>`, with guidance about listing specs/ADRs/design docs with full relative paths for downstream agents.
result: issue
reported: "Section is correctly positioned and formatted, but the 3 good examples (Examples 1-3, lines 105-290) do not include canonical_refs sections — they were written before this section was added. Could cause downstream agents or discuss agent to omit canonical_refs when following examples as patterns."
severity: minor

### 9. GSD-R namespace preserved
expected: Both `get-shit-done-r/templates/phase-prompt.md` and `get-shit-done-r/workflows/execute-plan.md` should use `gsd-r-` prefixes for agent names and `gsd-r-tools.cjs` for CLI references — zero `gsd-tools.cjs` or bare `gsd-` agent name references.
result: issue
reported: "Two stale gsd-tools references in execute-plan.md comments/prose (line 38: 'gsd-tools config-get' and line 368: 'Update STATE.md using gsd-tools:'). These lack the .cjs extension so namespace grep didn't catch them. Should be gsd-r-tools."
severity: minor

## Summary

total: 9
passed: 6
issues: 3
pending: 0
skipped: 0

## Gaps

- truth: "acceptance_criteria check validates conditions before committing"
  status: failed
  reason: "User reported: acceptance_criteria check runs as separate bullet after the commit step, not before it. Should be folded into type=auto flow between verify and commit."
  severity: major
  test: 5
  artifacts: []
  missing: []

- truth: "context.md template examples include canonical_refs sections"
  status: failed
  reason: "User reported: 3 good examples (lines 105-290) lack canonical_refs sections, could mislead downstream agents"
  severity: minor
  test: 8
  artifacts: []
  missing: []

- truth: "zero bare gsd-tools references in execute-plan.md"
  status: failed
  reason: "User reported: line 38 has 'gsd-tools config-get' and line 368 has 'Update STATE.md using gsd-tools:' — both missing -r prefix"
  severity: minor
  test: 9
  artifacts: []
  missing: []
