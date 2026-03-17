# Phase 12: Templates and Execution Rigor - Research

**Researched:** 2026-03-15
**Domain:** Template synchronization, execution workflow enhancement (diff-and-merge)
**Confidence:** HIGH

## Summary

Phase 12 is a diff-and-merge synchronization phase. The upstream GSD v1.24.0 has added three significant execution rigor features to its templates and workflows that GSD-R currently lacks: (1) `read_first` fields in task XML that force executors to read files before modifying them, (2) `acceptance_criteria` fields with grep-verifiable conditions per task, and (3) enhanced execute-plan.md with mandatory gates for both features plus pre-commit hook handling and node-repair integration. The upstream also added a `<canonical_refs>` section to context.md templates. GSD-R must adopt these improvements while preserving its research-specific customizations (src blocks, vault paths, gsd-r namespace).

The shared template files between upstream and GSD-R are largely identical except for namespace differences (`/gsd:` vs `/gsd-r:`, `get-shit-done` vs `get-shit-done-r`, `gsd-planner` vs `gsd-r-planner`). Only a few templates have substantive content differences: context.md (missing canonical_refs), phase-prompt.md (missing read_first/acceptance_criteria), execute-plan.md (missing read_first gate, acceptance_criteria check, precommit handling, node-repair), and research.md/requirements.md/state.md (GSD-R research customizations to preserve). No upstream hooks directory exists, so TMPL-03 hook sync has no upstream source.

**Primary recommendation:** Execute three focused plans: (1) phase-prompt.md + execute-plan.md rigor additions, (2) context.md canonical_refs + shared template content sync, (3) research-project/SUMMARY.md merge. Mark TMPL-01 and TMPL-03 as N/A.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Template sync: DIFF AND MERGE (not wholesale overwrite) for shared templates
- Skip copilot-instructions.md and UI-SPEC.md (defer to Phase 13)
- Skip TMPL-01 agent sync (no upstream agents/ directory exists) -- mark N/A
- Keep GSD-R's research-project templates only (DEBATES/FRAMEWORKS/LANDSCAPE/QUESTIONS), do NOT add upstream's ARCHITECTURE/FEATURES/PITFALLS/STACK
- Diff and merge research-project/SUMMARY.md only
- Add read_first + acceptance_criteria alongside existing src blocks in phase-prompt.md
- Diff and merge execute-plan.md (preserve research logic)
- Investigate hooks in upstream install for TMPL-03
- Leave research-specific templates untouched

### Claude's Discretion
- Per-file decision on which shared templates need actual changes vs are already current
- How to structure the read_first and acceptance_criteria fields within the existing task XML
- Whether SUMMARY.md in research-project/ has meaningful differences worth merging
- Hook investigation approach

### Deferred Ideas (OUT OF SCOPE)
- copilot-instructions.md template -- add when UI workflows come in Phase 13
- UI-SPEC.md template -- add when UI workflows come in Phase 13
- Upstream research-project templates (ARCHITECTURE, FEATURES, PITFALLS, STACK) -- intentionally not adding, GSD-R has its own research-focused set
- Agent prompt improvements -- no upstream source exists, defer to future GSD-R-specific improvement pass
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EXEC-01 | Update phase-prompt.md template with read_first and acceptance_criteria fields | Upstream template fully analyzed; exact XML structure and field placement documented below |
| EXEC-02 | Update execute-plan.md with mandatory read_first gate and acceptance_criteria validation | Upstream execute-plan.md diffed; 4 new content blocks identified (read_first gate, acceptance_criteria check, precommit handling, node-repair) |
| TMPL-01 | Sync shared agent prompts with upstream improvements | N/A -- upstream has no agents/ directory. GSD-R's 16 agent files have no upstream equivalent. |
| TMPL-02 | Sync template files with upstream refinements | 23 shared templates analyzed; most differ only in namespace. ~5 have substantive content differences requiring merge. |
| TMPL-03 | Sync hook files with upstream changes | No upstream hooks/ directory exists. No hook references in upstream gsd-tools.cjs. Hooks are GSD-R-specific. Mark N/A. |
| WKFL-05 | Add upstream research-project templates | Partially satisfied per user decision: merge SUMMARY.md only. Do NOT add ARCHITECTURE/FEATURES/PITFALLS/STACK. |
</phase_requirements>

## Diff Analysis: What Actually Needs Changing

### Category A: Substantive Content Additions (must merge)

These files have upstream content that GSD-R genuinely lacks.

| File | What's New Upstream | GSD-R Preservation |
|------|--------------------|--------------------|
| `templates/phase-prompt.md` | `<read_first>` field, `<acceptance_criteria>` field, anti-pattern examples for both, concrete good-example block | Keep `<src>` blocks, `~/.claude/get-shit-done-r` paths |
| `workflows/execute-plan.md` | Mandatory read_first gate in execute step, mandatory acceptance_criteria check, `<precommit_failure_handling>` section, `<verification_failure_gate>` with node-repair | Keep `gsd-r-*` agent names, `$HOME/.claude/get-shit-done-r` paths, research workflow logic |
| `templates/context.md` | `<canonical_refs>` section with downstream agent references, mandatory note at bottom | Keep `gsd-r-*` agent names |
| `templates/research-project/SUMMARY.md` | Different section headings (STACK vs LANDSCAPE, FEATURES vs QUESTIONS, ARCHITECTURE vs FRAMEWORKS) | Keep GSD-R's research-focused headings entirely; only merge structural improvements if any |

### Category B: Namespace-Only Differences (no content merge needed)

These files differ ONLY in namespace (`/gsd:` vs `/gsd-r:`, path prefixes). They are already functionally current.

| File | Difference Type |
|------|----------------|
| `templates/VALIDATION.md` | `/gsd:verify-work` vs `/gsd-r:verify-work` |
| `templates/DEBUG.md` | `/gsd:debug` vs `/gsd-r:debug` |
| `templates/UAT.md` | `/gsd:plan-phase --gaps` vs `/gsd-r:plan-phase --gaps`, `/gsd:verify-work` vs `/gsd-r:verify-work` |
| `templates/summary.md` | Identical content |
| `templates/milestone.md` | Identical content |
| `templates/milestone-archive.md` | Identical content |
| `templates/roadmap.md` | Identical content |
| `templates/continue-here.md` | Identical content |
| `templates/retrospective.md` | Identical content |
| `templates/user-setup.md` | Identical content |
| `templates/verification-report.md` | Identical content |
| `templates/summary-complex.md` | Identical content |
| `templates/summary-minimal.md` | Identical content |
| `templates/summary-standard.md` | Identical content |

### Category C: GSD-R Research Customizations (preserve, don't merge)

These files have intentional GSD-R differences that must NOT be overwritten.

| File | GSD-R Customization |
|------|---------------------|
| `templates/config.json` | Has `vault_path` and `commit_research` fields |
| `templates/state.md` | Has `## Note Status` section with sources table |
| `templates/research.md` | Research-focused language ("investigate" vs "implement") |
| `templates/requirements.md` | References QUESTIONS.md themes instead of FEATURES.md categories |
| `templates/discovery.md` | GSD-R research workflow references |
| `templates/bootstrap.md` | GSD-R-specific (no upstream equivalent) |
| `templates/research-note.md` | GSD-R-specific |
| `templates/source-log.md` | GSD-R-specific |
| `templates/decision-log.md` | GSD-R-specific |
| `templates/terminal-deliverable.md` | GSD-R-specific |
| `templates/research-task.md` | GSD-R-specific |

### Category D: Upstream-Only (skip per user decision)

| File | Reason to Skip |
|------|---------------|
| `templates/copilot-instructions.md` | Deferred to Phase 13 |
| `templates/UI-SPEC.md` | Deferred to Phase 13 |
| `templates/research-project/ARCHITECTURE.md` | User decided: keep GSD-R set only |
| `templates/research-project/FEATURES.md` | User decided: keep GSD-R set only |
| `templates/research-project/PITFALLS.md` | User decided: keep GSD-R set only |
| `templates/research-project/STACK.md` | User decided: keep GSD-R set only |

## Architecture Patterns

### Pattern 1: XML Field Addition (phase-prompt.md)

**What:** Add `<read_first>` and `<acceptance_criteria>` XML fields to the task template alongside existing `<src>` blocks.
**When to use:** EXEC-01 implementation.

The upstream task XML structure places these fields as follows:

```xml
<task type="auto">
  <name>Task 1: [Action-oriented name]</name>
  <files>path/to/file.ext, another/file.ext</files>
  <read_first>path/to/reference.ext, path/to/source-of-truth.ext</read_first>
  <action>[Specific implementation - what to do, how to do it, what to avoid and WHY. Include CONCRETE values.]</action>
  <verify>[Command or check to prove it worked]</verify>
  <acceptance_criteria>
    - [Grep-verifiable condition: "file.ext contains 'exact string'"]
    - [Measurable condition: "output.ext uses 'expected-value', NOT 'wrong-value'"]
  </acceptance_criteria>
  <done>[Measurable acceptance criteria]</done>
</task>
```

**GSD-R integration:** The `<src>` blocks (unique to GSD-R) should remain. Final GSD-R task structure will have: `<name>`, `<files>`, `<read_first>`, `<src>` (GSD-R only), `<action>`, `<verify>`, `<acceptance_criteria>`, `<done>`.

### Pattern 2: Execute-Plan Gate Addition

**What:** Add mandatory processing gates to execute-plan.md's execute step.
**When to use:** EXEC-02 implementation.

Upstream adds these to the execute step (step name="execute"):

1. **read_first gate** (before task execution): "MANDATORY read_first gate: If the task has a `<read_first>` field, you MUST read every listed file BEFORE making any edits."
2. **acceptance_criteria check** (after task execution): "MANDATORY acceptance_criteria check: After completing each task, if it has `<acceptance_criteria>`, verify EVERY criterion before moving to the next task."
3. **precommit_failure_handling** (new section): Guidance for handling pre-commit hook failures during commits.
4. **verification_failure_gate enhancement**: Node-repair integration with config check and budget.

### Pattern 3: Canonical References in Context Template

**What:** Add `<canonical_refs>` section to context.md template.
**When to use:** TMPL-02 implementation for context.md.

Upstream added a mandatory `<canonical_refs>` section that lists specs, ADRs, and design docs that downstream agents must read. This section goes after the existing decisions/specifics sections and before the deferred section.

### Anti-Patterns to Avoid
- **Wholesale overwrite of any shared template:** Many have GSD-R namespace paths that must be preserved.
- **Adding upstream research-project templates:** User explicitly decided against this.
- **Modifying agent files:** TMPL-01 is N/A, no agent changes in this phase.
- **Touching research-specific templates:** bootstrap, research-note, source-log, etc. are untouched.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Template diffing | Custom diff tool | Direct file comparison + manual merge | Templates are markdown; structural diffs are human-readable |
| XML field ordering | Schema validator | Follow upstream's established ordering | Upstream already validated the task XML structure |
| Namespace conversion | Automated sed replacement | Manual review per file | Only ~5 files need content changes; automated replacement risks breaking markdown code blocks |

## Common Pitfalls

### Pitfall 1: Destroying GSD-R src Blocks in phase-prompt.md
**What goes wrong:** Overwriting phase-prompt.md loses the `<src method="" format="">` blocks unique to GSD-R.
**Why it happens:** The upstream version has no `<src>` blocks at all.
**How to avoid:** Add `<read_first>` and `<acceptance_criteria>` to the existing GSD-R template, don't copy from upstream.
**Warning signs:** Missing `<src>` in the final template.

### Pitfall 2: Breaking execute-plan.md Research Logic
**What goes wrong:** Wholesale copy of upstream execute-plan.md destroys GSD-R's `gsd-r-*` agent names and `$HOME/.claude/get-shit-done-r` paths.
**Why it happens:** The execute-plan.md has ~40 path/namespace differences mixed with ~4 substantive content additions.
**How to avoid:** Add the 4 new content blocks to the existing GSD-R execute-plan.md. Don't copy the whole file.
**Warning signs:** References to `gsd-executor` instead of `gsd-r-executor`, or `/Users/jeremiahwolf/.claude/get-shit-done/` absolute paths.

### Pitfall 3: Merging SUMMARY.md Headings Incorrectly
**What goes wrong:** The research-project/SUMMARY.md files have fundamentally different section headings (STACK vs LANDSCAPE, FEATURES vs QUESTIONS, etc.) because GSD-R is research-focused.
**Why it happens:** Both have SUMMARY.md but they serve different domains.
**How to avoid:** Only merge structural/formatting improvements. Do NOT change GSD-R's research-focused headings to upstream's software-development headings.
**Warning signs:** Headings like "Recommended Stack" or "Expected Features" appearing in GSD-R's research template.

### Pitfall 4: Missing the canonical_refs in context.md
**What goes wrong:** Forgetting to add the `<canonical_refs>` section to context.md means downstream agents won't get spec references.
**Why it happens:** context.md has many sections; the canonical_refs addition is at the end.
**How to avoid:** The section must appear after decisions and before the closing guidance. Include the mandatory note at the bottom about never silently omitting it.

## Code Examples

### read_first + acceptance_criteria in GSD-R Task XML

The GSD-R task XML after merge should look like this (combining upstream rigor with GSD-R research fields):

```xml
<task type="auto">
  <name>Task 1: [Action-oriented name]</name>
  <files>path/to/file.ext, another/file.ext</files>
  <read_first>path/to/reference.ext, path/to/source-of-truth.ext</read_first>
  <src method="acquire" format="pdf">path/to/source.pdf</src>
  <action>[Specific implementation - what to do, how to do it, what to avoid and WHY. Include CONCRETE values: exact identifiers, parameters, expected outputs, file paths, command arguments. Never say "align X with Y" without specifying the exact target state.]</action>
  <verify>[Command or check to prove it worked]</verify>
  <acceptance_criteria>
    - [Grep-verifiable condition: "file.ext contains 'exact string'"]
    - [Measurable condition: "output.ext uses 'expected-value', NOT 'wrong-value'"]
  </acceptance_criteria>
  <done>[Measurable acceptance criteria]</done>
</task>
```

### Execute Step with read_first + acceptance_criteria Gates

Add to GSD-R's execute-plan.md step name="execute", in the per-task loop:

```markdown
2. Per task:
   - **MANDATORY read_first gate:** If the task has a `<read_first>` field, you MUST read every listed file BEFORE making any edits. This is not optional. Do not skip files because you "already know" what's in them -- read them. The read_first files establish ground truth for the task.
   - `type="auto"`: if `tdd="true"` -> TDD execution. Implement with deviation rules + auth gates. Verify done criteria. Commit (see task_commit). Track hash for Summary.
   - `type="checkpoint:*"`: STOP -> checkpoint_protocol -> wait for user -> continue only after confirmation.
   - **MANDATORY acceptance_criteria check:** After completing each task, if it has `<acceptance_criteria>`, verify EVERY criterion before moving to the next task. Use grep, file reads, or CLI commands to confirm each criterion. If any criterion fails, fix the implementation before proceeding. Do not skip criteria or mark them as "will verify later".
```

### Precommit Failure Handling Section

New section to add to GSD-R's execute-plan.md (after tdd_plan_execution, before task_commit):

```markdown
<precommit_failure_handling>
## Pre-commit Hook Failure Handling

Your commits may trigger pre-commit hooks. Auto-fix hooks handle themselves transparently -- files get fixed and re-staged automatically.

If a commit is BLOCKED by a hook:

1. The `git commit` command fails with hook error output
2. Read the error -- it tells you exactly which hook and what failed
3. Fix the issue (type error, lint violation, secret leak, etc.)
4. `git add` the fixed files
5. Retry the commit
6. Do NOT use `--no-verify`

This is normal and expected. Budget 1-2 retry cycles per commit.
</precommit_failure_handling>
```

### Verification Failure Gate Enhancement

Replace GSD-R's simple verification_failure_gate with the upstream version that includes node-repair:

```markdown
<step name="verification_failure_gate">
If verification fails:

**Check if node repair is enabled** (default: on):
\`\`\`bash
NODE_REPAIR=$(node "$HOME/.claude/get-shit-done-r/bin/gsd-r-tools.cjs" config-get workflow.node_repair 2>/dev/null || echo "true")
\`\`\`

If `NODE_REPAIR` is `true`: invoke `@$HOME/.claude/get-shit-done-r/workflows/node-repair.md` with:
- FAILED_TASK: task number, name, done-criteria
- ERROR: expected vs actual result
- PLAN_CONTEXT: adjacent task names + phase goal
- REPAIR_BUDGET: `workflow.node_repair_budget` from config (default: 2)

Node repair will attempt RETRY, DECOMPOSE, or PRUNE autonomously. Only reaches this gate again if repair budget is exhausted (ESCALATE).

If `NODE_REPAIR` is `false` OR repair returns ESCALATE: STOP. Present: "Verification failed for Task [X]: [name]. Expected: [criteria]. Actual: [result]. Repair attempted: [summary of what was tried]." Options: Retry | Skip (mark incomplete) | Stop (investigate). If skipped -> SUMMARY "Issues Encountered".
</step>
```

Note: The node-repair.md workflow itself is Phase 13 (EXEC-03). The gate references it but it won't exist until Phase 13. This is fine -- the config check defaults gracefully.

## Hooks Investigation (TMPL-03)

**Finding:** No upstream hooks exist. Confidence: HIGH.

- No `hooks/` directory under `~/.claude/get-shit-done/`
- No hook references in `gsd-tools.cjs`
- Upstream `bin/` contains only `gsd-tools.cjs` and `lib/`
- GSD-R's 3 hook files (`gsd-check-update.js`, `gsd-context-monitor.js`, `gsd-statusline.js`) are fork-specific with no upstream equivalent

**Recommendation:** Mark TMPL-03 as N/A. The hooks are GSD-R-specific implementations with no upstream source to sync from.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in test runner (node:test) |
| Config file | package.json test script |
| Quick run command | `node --test test/e2e.test.cjs` |
| Full suite command | `node --test test/*.test.cjs` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EXEC-01 | phase-prompt.md contains read_first and acceptance_criteria fields | manual-only | Grep verification in plan tasks | N/A - template file |
| EXEC-02 | execute-plan.md contains mandatory gates | manual-only | Grep verification in plan tasks | N/A - workflow file |
| TMPL-01 | Agent prompts synced | N/A | Skipped per user decision | N/A |
| TMPL-02 | Template files synced with upstream | manual-only | Grep verification in plan tasks | N/A - markdown files |
| TMPL-03 | Hook files synced | N/A | No upstream source exists | N/A |
| WKFL-05 | Research-project SUMMARY.md merged | manual-only | Grep verification in plan tasks | N/A - template file |

### Sampling Rate
- **Per task commit:** Grep checks for expected content in modified templates
- **Per wave merge:** `node --test test/*.test.cjs` (existing tests still pass)
- **Phase gate:** Full suite green + manual template content verification

### Wave 0 Gaps
None -- this phase modifies markdown templates only. Existing test infrastructure covers regression (ensuring no code breaks). Template content correctness is verified via grep-based acceptance criteria in each plan task.

## Open Questions

1. **node-repair.md workflow dependency**
   - What we know: execute-plan.md's verification_failure_gate references node-repair.md, which is EXEC-03 (Phase 13)
   - What's unclear: Whether adding the gate now (before node-repair.md exists) could cause issues
   - Recommendation: Add the gate now. The config check `workflow.node_repair` defaults to checking if the file exists, and the fallback path (STOP and present to user) matches current GSD-R behavior. Safe to add.

2. **planner-subagent-prompt.md and debug-subagent-prompt.md differences**
   - What we know: Both have namespace differences plus agent-name differences (`gsd-planner` vs `gsd-r-planner`, `gsd-debugger` vs `gsd-r-debugger`)
   - What's unclear: Whether upstream has content improvements beyond namespace
   - Recommendation: These are Category B (namespace-only). The substantive content (prompt structure, instructions) is identical. No merge needed.

## Sources

### Primary (HIGH confidence)
- Direct file diffs between `~/.claude/get-shit-done/` (upstream v1.24.0) and `get-shit-done-r/` (GSD-R fork)
- Upstream phase-prompt.md -- read in full, line-by-line comparison with GSD-R version
- Upstream execute-plan.md -- read in full, line-by-line comparison with GSD-R version
- Upstream templates/ directory listing -- 27 files enumerated
- GSD-R templates/ directory listing -- 32 files enumerated
- Upstream hooks/ directory -- confirmed nonexistent
- Upstream bin/ directory -- confirmed contains only gsd-tools.cjs and lib/

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - direct file diffs, no ambiguity about what changed
- Architecture: HIGH - upstream XML structure is explicit and documented
- Pitfalls: HIGH - based on actual observed differences between files

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable -- template format is well-established)
