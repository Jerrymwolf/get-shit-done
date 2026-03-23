---
name: grd:diagnose
description: Systematic diagnosis of methodology gaps, source conflicts, and analytical dead ends in research
argument-hint: [issue description]
allowed-tools:
  - Read
  - Bash
  - Task
  - AskUserQuestion
---

<objective>
Diagnose research issues using systematic investigation with subagent isolation.

**Orchestrator role:** Gather symptoms of the research problem, spawn grd-debugger agent (research diagnostician), handle checkpoints, spawn continuations.

**Why subagent:** Investigation burns context fast (reading notes, forming hypotheses about source conflicts, tracing analytical reasoning). Fresh 200k context per investigation. Main context stays lean for user interaction.

**Research issues this command investigates:**
- Methodology gaps (missing controls, weak sampling, unvalidated instruments)
- Source conflicts (contradictory findings across studies, incompatible frameworks)
- Analytical dead ends (circular reasoning, unfalsifiable claims, insufficient evidence)
- Coverage gaps (missing domains, underrepresented perspectives, temporal gaps)
- Citation integrity issues (broken source chains, missing primary sources)
</objective>

<context>
User's research issue: $ARGUMENTS

Check for active diagnosis sessions:
```bash
ls .planning/debug/*.md 2>/dev/null | grep -v resolved | head -5
```
</context>

<process>

## 0. Initialize Context

```bash
INIT=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Extract `commit_docs` from init JSON. Resolve diagnostician model:
```bash
debugger_model=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" resolve-model grd-debugger --raw)
```

## 1. Check Active Sessions

If active sessions exist AND no $ARGUMENTS:
- List sessions with status, hypothesis, next action
- User picks number to resume OR describes new research issue

If $ARGUMENTS provided OR user describes new issue:
- Continue to symptom gathering

## 2. Gather Research Symptoms (if new issue)

Use AskUserQuestion for each:

1. **Expected finding** - What should the research show or support?
2. **Actual finding** - What does the evidence actually indicate?
3. **Conflicting sources** - Any contradictions between sources? (describe)
4. **Timeline** - When did you notice the problem? Was the analysis ever coherent?
5. **Scope** - Which notes, sources, or domains are involved?

After all gathered, confirm ready to investigate.

## 3. Spawn Research Diagnostician Agent

Fill prompt and spawn:

```markdown
<objective>
Investigate research issue: {slug}

**Summary:** {trigger}
</objective>

<symptoms>
expected_finding: {expected}
actual_finding: {actual}
conflicting_sources: {conflicts}
scope: {scope}
timeline: {timeline}
</symptoms>

<mode>
symptoms_prefilled: true
goal: find_and_fix
</mode>

<debug_file>
Create: .planning/debug/{slug}.md
</debug_file>
```

```
Task(
  prompt=filled_prompt,
  subagent_type="grd-debugger",
  model="{debugger_model}",
  description="Diagnose {slug}"
)
```

## 4. Handle Agent Return

**If `## ROOT CAUSE FOUND`:**
- Display root cause and evidence summary
- Offer options:
  - "Address now" - spawn resolution subagent
  - "Plan resolution" - suggest /grd:plan-inquiry --gaps
  - "Manual resolution" - done

**If `## CHECKPOINT REACHED`:**
- Present checkpoint details to user
- Get user response
- If checkpoint type is `human-verify`:
  - If user confirms resolved: continue so agent can finalize/resolve/archive
  - If user reports issues: continue so agent returns to investigation
- Spawn continuation agent (see step 5)

**If `## INVESTIGATION INCONCLUSIVE`:**
- Show what was checked and eliminated
- Offer options:
  - "Continue investigating" - spawn new agent with additional context
  - "Manual investigation" - done
  - "Add more context" - gather more symptoms, spawn again

## 5. Spawn Continuation Agent (After Checkpoint)

When user responds to checkpoint, spawn fresh agent:

```markdown
<objective>
Continue diagnosing {slug}. Evidence is in the diagnosis file.
</objective>

<prior_state>
<files_to_read>
- .planning/debug/{slug}.md (Diagnosis session state)
</files_to_read>
</prior_state>

<checkpoint_response>
**Type:** {checkpoint_type}
**Response:** {user_response}
</checkpoint_response>

<mode>
goal: find_and_fix
</mode>
```

```
Task(
  prompt=continuation_prompt,
  subagent_type="grd-debugger",
  model="{debugger_model}",
  description="Continue diagnosis {slug}"
)
```

</process>

<success_criteria>
- [ ] Active sessions checked
- [ ] Research symptoms gathered (if new)
- [ ] Research diagnostician spawned with context
- [ ] Checkpoints handled correctly
- [ ] Root cause confirmed before resolving
</success_criteria>
