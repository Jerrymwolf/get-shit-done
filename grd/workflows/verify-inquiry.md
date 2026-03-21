<purpose>
Validate built features through conversational testing with persistent state. Creates UAT.md that tracks test progress, survives /clear, and feeds gaps into /grd:plan-inquiry --gaps.

User tests, Claude records. One test at a time. Plain text responses.

Flags:
- --skip-tier0: Skip Tier 0 sufficiency check, run only Tier 1 (goal-backward) and Tier 2 (source audit)
</purpose>

<philosophy>
**Show expected, ask if reality matches.**

Claude presents what SHOULD happen. User confirms or describes what's different.
- "yes" / "y" / "next" / empty → pass
- Anything else → logged as issue, severity inferred

No Pass/Fail buttons. No severity questions. Just: "Here's what should happen. Does it?"
</philosophy>

<template>
@/Users/jeremiahwolf/.claude/grd/templates/UAT.md
</template>

<process>

<step name="initialize" priority="first">
If $ARGUMENTS contains a phase number, load context:

```bash
INIT=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" init verify-work "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse JSON for: `planner_model`, `checker_model`, `commit_docs`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `has_verification`, `review_type`, `epistemological_stance`, `researcher_tier`, `temporal_positioning`.

Also parse `$ARGUMENTS` for `--skip-tier0` flag:
```
SKIP_TIER0=false
if [[ "$ARGUMENTS" == *"--skip-tier0"* ]]; then
  SKIP_TIER0=true
fi
```
</step>

<researcher_tier>
## Communication Style: ${researcher_tier}

<tier-guided>
**When reporting verification results:**
- Explain what each check means before stating pass/fail
- When something fails, explain WHY it matters (not just that it failed)
- Suggest specific next steps for each failure
- Use plain language alongside technical terms
</tier-guided>
<tier-standard>
**When reporting verification results:**
- State what failed with the relevant standard
- Include the specific requirement that was not met
- Brief rationale for why the check exists
</tier-standard>
<tier-expert>
**When reporting verification results:**
- Terse failure statements only
- Requirement ID + failure description
- No elaboration unless ambiguous
</tier-expert>
</researcher_tier>

<step name="tier0_sufficiency" priority="after-init">
**Tier 0: Evidence Sufficiency Assessment**

This step runs structural sufficiency checks before the existing UAT-based verification flow.
Tier 0 runs before Tier 1 and Tier 2 in the verification pipeline.

**If --skip-tier0 is present (SKIP_TIER0=true):**

Output in the verification report:
```
## Tier 0: Sufficiency Assessment
Skipped (--skip-tier0)
```

Proceed directly to existing verification (check_active_session).

**If --skip-tier0 is NOT present:**

Run structural sufficiency checks using verify-sufficiency.cjs module:

1. **Discover all research notes in the vault:**
   ```bash
   # Use the project's vault directory structure
   # Notes live in {Study}-Research/ subdirectories organized by inquiry
   ```

2. **Parse objectives from REQUIREMENTS.md:**
   ```bash
   cat .planning/REQUIREMENTS.md
   ```

3. **Run verifySufficiency(notes, objectives, config)** where config includes:
   - review_type: from init JSON (default 'narrative')
   - epistemological_stance: from init JSON (default 'pragmatist')
   - workflow.temporal_positioning: from init JSON

4. **Qualitative assessment** (agent performs these, not CJS):
   - **Saturation check:** Read Key Findings from the last 3 notes (sorted by date). If all 3 confirm existing themes without introducing new concepts, note "Evidence appears saturated." If they extend or introduce new themes, note "Evidence still diversifying."
   - **Epistemological consistency:** If stance is 'pragmatist', output "Pragmatist stance: methodological flexibility expected. (AUTO-PASS)". For other stances, assess whether source selection and evidence quality patterns are consistent with the declared stance. Output as warning only, never blocking.

5. **Format Tier 0 report section:**
   ```markdown
   ## Tier 0: Sufficiency Assessment

   ### Coverage Summary
   | Objective | Notes | Required | Status |
   |-----------|-------|----------|--------|
   | OBJ-01   | 4     | 3        | PASS   |
   | OBJ-02   | 1     | 3        | GAP    |

   ### Era Coverage
   [distribution table] -- X/4 eras (PASS/GAP)

   ### Methodological Diversity
   [per-objective diversity status -- systematic only]

   ### Saturation Assessment
   Last 3 notes introduced N new themes. Evidence appears [saturated/still diversifying].

   ### Epistemological Consistency
   [Assessment or auto-pass message]

   **Tier 0 Result:** PASS / INSUFFICIENT
   ```

6. **If Tier 0 Result is PASS:** Proceed to existing verification (check_active_session for UAT). Include Tier 0 report in verifier agent context for Tier 1/2.

7. **If Tier 0 Result is INSUFFICIENT:** Fire the saturation gate (saturation_gate step).
</step>

<step name="saturation_gate">
**CHECKPOINT: Sufficiency Assessment**

Fires only when Tier 0 finds gaps. Uses the standard CHECKPOINT box pattern matching TRAP-02.

Display:
```
CHECKPOINT: Sufficiency Assessment

<tier-guided>
Before running the full verification, GRD checks whether you have enough evidence to draw conclusions. This "sufficiency check" looks at whether each research objective has enough notes, whether your sources cover the right time periods, and whether you have methodological diversity.

The check found these gaps:
[List each gap from verifySufficiency result]

You have three options:
[1] **Override and proceed** -- you believe the evidence is sufficient despite the gaps. The verification will continue with Tier 1 (goal-backward) and Tier 2 (source audit) checks. Good if you've intentionally scoped your evidence narrowly.
[2] **Continue investigating** -- go back to gathering more evidence. Good if you agree there are gaps and want to fill them before verifying.
[3] **Add a new inquiry** -- create a new line of investigation to address the gaps. Good if the gaps point to a research question you haven't explored yet.
</tier-guided>
<tier-standard>
Tier 0 found the following gaps:
[List each gap from verifySufficiency result]

[1] Evidence is sufficient -- override and proceed to Tier 1/2 verification
[2] Continue investigating -- return to /grd:conduct-inquiry to gather more evidence
[3] Add inquiry -- route to /grd:add-inquiry to create a new line of inquiry
</tier-standard>
<tier-expert>
Gaps: [List each gap from verifySufficiency result]

[1] Override -- proceed to Tier 1/2  [2] Continue investigating  [3] Add inquiry
</tier-expert>
```

Wait for user response.

- If user selects [1]: Log override in report ("Tier 0: OVERRIDDEN by researcher"). Proceed to check_active_session. Include Tier 0 report (with override note) in verifier agent context for Tier 1/2.
- If user selects [2]: Display "Verification paused. Run `/grd:conduct-inquiry {phase}` to continue investigating." Stop.
- If user selects [3]: Display "Verification paused. Run `/grd:add-inquiry` to add a new line of inquiry, then continue investigating." Stop.
</step>

<step name="check_active_session">
**First: Check for active UAT sessions**

```bash
find .planning/phases -name "*-UAT.md" -type f 2>/dev/null | head -5
```

**If active sessions exist AND no $ARGUMENTS provided:**

Read each file's frontmatter (status, phase) and Current Test section.

Display inline:

```
## Active UAT Sessions

| # | Phase | Status | Current Test | Progress |
|---|-------|--------|--------------|----------|
| 1 | 04-comments | testing | 3. Reply to Comment | 2/6 |
| 2 | 05-auth | testing | 1. Login Form | 0/4 |

Reply with a number to resume, or provide a phase number to start new.
```

Wait for user response.

- If user replies with number (1, 2) → Load that file, go to `resume_from_file`
- If user replies with phase number → Treat as new session, go to `create_uat_file`

**If active sessions exist AND $ARGUMENTS provided:**

Check if session exists for that phase. If yes, offer to resume or restart.
If no, continue to `create_uat_file`.

**If no active sessions AND no $ARGUMENTS:**

```
No active UAT sessions.

Provide a phase number to start testing (e.g., /grd:verify-inquiry 4)
```

**If no active sessions AND $ARGUMENTS provided:**

Continue to `create_uat_file`.
</step>

<step name="find_summaries">
**Find what to test:**

Use `phase_dir` from init (or run init if not already done).

```bash
ls "$phase_dir"/*-SUMMARY.md 2>/dev/null
```

Read each SUMMARY.md to extract testable deliverables.
</step>

<step name="extract_tests">
**Extract testable deliverables from SUMMARY.md:**

Parse for:
1. **Accomplishments** - Features/functionality added
2. **User-facing changes** - UI, workflows, interactions

Focus on USER-OBSERVABLE outcomes, not implementation details.

For each deliverable, create a test:
- name: Brief test name
- expected: What the user should see/experience (specific, observable)

Examples:
- Accomplishment: "Added comment threading with infinite nesting"
  → Test: "Reply to a Comment"
  → Expected: "Clicking Reply opens inline composer below comment. Submitting shows reply nested under parent with visual indentation."

Skip internal/non-observable items (refactors, type changes, etc.).

**Cold-start smoke test injection:**

After extracting tests from SUMMARYs, scan the SUMMARY files for modified/created file paths. If ANY path matches these patterns:

`server.ts`, `server.js`, `app.ts`, `app.js`, `index.ts`, `index.js`, `main.ts`, `main.js`, `database/*`, `db/*`, `seed/*`, `seeds/*`, `migrations/*`, `startup*`, `docker-compose*`, `Dockerfile*`

Then **prepend** this test to the test list:

- name: "Cold Start Smoke Test"
- expected: "Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query (health check, homepage load, or basic API call) returns live data."

This catches bugs that only manifest on fresh start — race conditions in startup sequences, silent seed failures, missing environment setup — which pass against warm state but break in production.
</step>

<step name="create_uat_file">
**Create UAT file with all tests:**

```bash
mkdir -p "$PHASE_DIR"
```

Build test list from extracted deliverables.

Create file:

```markdown
---
status: testing
phase: XX-name
source: [list of SUMMARY.md files]
started: [ISO timestamp]
updated: [ISO timestamp]
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: [first test name]
expected: |
  [what user should observe]
awaiting: user response

## Tests

### 1. [Test Name]
expected: [observable behavior]
result: [pending]

### 2. [Test Name]
expected: [observable behavior]
result: [pending]

...

## Summary

total: [N]
passed: 0
issues: 0
pending: [N]
skipped: 0

## Gaps

[none yet]
```

Write to `.planning/phases/XX-name/{phase_num}-UAT.md`

Proceed to `present_test`.
</step>

<step name="present_test">
**Present current test to user:**

Read Current Test section from UAT file.

Display using checkpoint box format:

```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: Verification Required                           ║
╚══════════════════════════════════════════════════════════════╝

**Test {number}: {name}**

{expected}

──────────────────────────────────────────────────────────────
→ Type "pass" or describe what's wrong
──────────────────────────────────────────────────────────────
```

Wait for user response (plain text, no AskUserQuestion).
</step>

<step name="process_response">
**Process user response and update file:**

**If response indicates pass:**
- Empty response, "yes", "y", "ok", "pass", "next", "approved", "✓"

Update Tests section:
```
### {N}. {name}
expected: {expected}
result: pass
```

**If response indicates skip:**
- "skip", "can't test", "n/a"

Update Tests section:
```
### {N}. {name}
expected: {expected}
result: skipped
reason: [user's reason if provided]
```

**If response is anything else:**
- Treat as issue description

Infer severity from description:
- Contains: crash, error, exception, fails, broken, unusable → blocker
- Contains: doesn't work, wrong, missing, can't → major
- Contains: slow, weird, off, minor, small → minor
- Contains: color, font, spacing, alignment, visual → cosmetic
- Default if unclear: major

Update Tests section:
```
### {N}. {name}
expected: {expected}
result: issue
reported: "{verbatim user response}"
severity: {inferred}
```

Append to Gaps section (structured YAML for plan-phase --gaps):
```yaml
- truth: "{expected behavior from test}"
  status: failed
  reason: "User reported: {verbatim user response}"
  severity: {inferred}
  test: {N}
  artifacts: []  # Filled by diagnosis
  missing: []    # Filled by diagnosis
```

**After any response:**

Update Summary counts.
Update frontmatter.updated timestamp.

If more tests remain → Update Current Test, go to `present_test`
If no more tests → Go to `complete_session`
</step>

<step name="resume_from_file">
**Resume testing from UAT file:**

Read the full UAT file.

Find first test with `result: [pending]`.

Announce:
```
Resuming: Phase {phase} UAT
Progress: {passed + issues + skipped}/{total}
Issues found so far: {issues count}

Continuing from Test {N}...
```

Update Current Test section with the pending test.
Proceed to `present_test`.
</step>

<step name="complete_session">
**Complete testing and commit:**

Update frontmatter:
- status: complete
- updated: [now]

Clear Current Test section:
```
## Current Test

[testing complete]
```

Commit the UAT file:
```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" commit "test({phase_num}): complete UAT - {passed} passed, {issues} issues" --files ".planning/phases/XX-name/{phase_num}-UAT.md"
```

Present summary:
```
## UAT Complete: Phase {phase}

| Result | Count |
|--------|-------|
| Passed | {N}   |
| Issues | {N}   |
| Skipped| {N}   |

[If issues > 0:]
### Issues Found

[List from Issues section]
```

**If issues > 0:** Proceed to `diagnose_issues`

**If issues == 0:**
```
All tests passed. Ready to continue.

- `/grd:plan-inquiry {next}` — Plan next phase
- `/grd:conduct-inquiry {next}` — Execute next phase
- `/grd:ui-review {phase}` — visual quality audit (if frontend files were modified)
```
</step>

<step name="diagnose_issues">
**Diagnose root causes before planning fixes:**

```
---

{N} issues found. Diagnosing root causes...

Spawning parallel debug agents to investigate each issue.
```

- Load diagnose-issues workflow
- Follow @/Users/jeremiahwolf/.claude/grd/workflows/diagnose-issues.md
- Spawn parallel debug agents for each issue
- Collect root causes
- Update UAT.md with root causes
- Proceed to `plan_gap_closure`

Diagnosis runs automatically - no user prompt. Parallel agents investigate simultaneously, so overhead is minimal and fixes are more accurate.
</step>

<step name="plan_gap_closure">
**Auto-plan fixes from diagnosed gaps:**

Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► PLANNING FIXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning planner for gap closure...
```

Spawn gsd-planner in --gaps mode:

```
Task(
  prompt="""
<planning_context>

**Phase:** {phase_number}
**Mode:** gap_closure

<files_to_read>
- {phase_dir}/{phase_num}-UAT.md (UAT with diagnoses)
- .planning/STATE.md (Project State)
- .planning/ROADMAP.md (Roadmap)
</files_to_read>

</planning_context>

<downstream_consumer>
Output consumed by /grd:conduct-inquiry
Plans must be executable prompts.
</downstream_consumer>
""",
  subagent_type="grd-planner",
  model="{planner_model}",
  description="Plan gap fixes for Phase {phase}"
)
```

On return:
- **PLANNING COMPLETE:** Proceed to `verify_gap_plans`
- **PLANNING INCONCLUSIVE:** Report and offer manual intervention
</step>

<step name="verify_gap_plans">
**Verify fix plans with checker:**

Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► VERIFYING FIX PLANS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning plan checker...
```

Initialize: `iteration_count = 1`

Spawn gsd-plan-checker:

```
Task(
  prompt="""
<verification_context>

**Phase:** {phase_number}
**Phase Goal:** Close diagnosed gaps from UAT

<files_to_read>
- {phase_dir}/*-PLAN.md (Plans to verify)
</files_to_read>

</verification_context>

<expected_output>
Return one of:
- ## VERIFICATION PASSED — all checks pass
- ## ISSUES FOUND — structured issue list
</expected_output>
""",
  subagent_type="grd-plan-checker",
  model="{checker_model}",
  description="Verify Phase {phase} fix plans"
)
```

On return:
- **VERIFICATION PASSED:** Proceed to `present_ready`
- **ISSUES FOUND:** Proceed to `revision_loop`
</step>

<step name="revision_loop">
**Iterate planner ↔ checker until plans pass (max 3):**

**If iteration_count < 3:**

Display: `Sending back to planner for revision... (iteration {N}/3)`

Spawn gsd-planner with revision context:

```
Task(
  prompt="""
<revision_context>

**Phase:** {phase_number}
**Mode:** revision

<files_to_read>
- {phase_dir}/*-PLAN.md (Existing plans)
</files_to_read>

**Checker issues:**
{structured_issues_from_checker}

</revision_context>

<instructions>
Read existing PLAN.md files. Make targeted updates to address checker issues.
Do NOT replan from scratch unless issues are fundamental.
</instructions>
""",
  subagent_type="grd-planner",
  model="{planner_model}",
  description="Revise Phase {phase} plans"
)
```

After planner returns → spawn checker again (verify_gap_plans logic)
Increment iteration_count

**If iteration_count >= 3:**

Display: `Max iterations reached. {N} issues remain.`

Offer options:
1. Force proceed (execute despite issues)
2. Provide guidance (user gives direction, retry)
3. Abandon (exit, user runs /grd:plan-inquiry manually)

Wait for user response.
</step>

<step name="present_ready">
**Present completion and next steps:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► FIXES READY ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {X}: {Name}** — {N} gap(s) diagnosed, {M} fix plan(s) created

| Gap | Root Cause | Fix Plan |
|-----|------------|----------|
| {truth 1} | {root_cause} | {phase}-04 |
| {truth 2} | {root_cause} | {phase}-04 |

Plans verified and ready for execution.

───────────────────────────────────────────────────────────────

## ▶ Next Up

<tier-guided>
Fix plans are ready. The next step executes them -- each plan addresses a specific gap found during verification. After execution, you can re-verify to confirm the gaps are closed.

**Execute fixes** -- run the fix plans

`/clear` then `/grd:conduct-inquiry {phase} --gaps-only`
</tier-guided>
<tier-standard>
**Execute fixes** -- run fix plans

`/clear` then `/grd:conduct-inquiry {phase} --gaps-only`
</tier-standard>
<tier-expert>
`/clear` then `/grd:conduct-inquiry {phase} --gaps-only`
</tier-expert>

───────────────────────────────────────────────────────────────
```
</step>

</process>

<update_rules>
**Batched writes for efficiency:**

Keep results in memory. Write to file only when:
1. **Issue found** — Preserve the problem immediately
2. **Session complete** — Final write before commit
3. **Checkpoint** — Every 5 passed tests (safety net)

| Section | Rule | When Written |
|---------|------|--------------|
| Frontmatter.status | OVERWRITE | Start, complete |
| Frontmatter.updated | OVERWRITE | On any file write |
| Current Test | OVERWRITE | On any file write |
| Tests.{N}.result | OVERWRITE | On any file write |
| Summary | OVERWRITE | On any file write |
| Gaps | APPEND | When issue found |

On context reset: File shows last checkpoint. Resume from there.
</update_rules>

<severity_inference>
**Infer severity from user's natural language:**

| User says | Infer |
|-----------|-------|
| "crashes", "error", "exception", "fails completely" | blocker |
| "doesn't work", "nothing happens", "wrong behavior" | major |
| "works but...", "slow", "weird", "minor issue" | minor |
| "color", "spacing", "alignment", "looks off" | cosmetic |

Default to **major** if unclear. User can correct if needed.

**Never ask "how severe is this?"** - just infer and move on.
</severity_inference>

<success_criteria>
- [ ] UAT file created with all tests from SUMMARY.md
- [ ] Tests presented one at a time with expected behavior
- [ ] User responses processed as pass/issue/skip
- [ ] Severity inferred from description (never asked)
- [ ] Batched writes: on issue, every 5 passes, or completion
- [ ] Committed on completion
- [ ] If issues: parallel debug agents diagnose root causes
- [ ] If issues: gsd-planner creates fix plans (gap_closure mode)
- [ ] If issues: gsd-plan-checker verifies fix plans
- [ ] If issues: revision loop until plans pass (max 3 iterations)
- [ ] Ready for `/grd:conduct-inquiry --gaps-only` when complete
</success_criteria>
