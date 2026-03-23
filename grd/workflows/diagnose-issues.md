<purpose>
Orchestrate parallel diagnosis agents to investigate research gaps and find root causes.

After verification finds gaps in research quality, spawn one diagnosis agent per gap. Each agent investigates autonomously with symptoms pre-filled from verification results. Collect root causes, update verification gaps with diagnosis, then hand off to plan-inquiry --gaps with actual diagnoses.

Orchestrator stays lean: parse gaps, spawn agents, collect results, update verification record.

**Research gaps this workflow investigates:**
- Methodology weaknesses (missing controls, sampling bias, unvalidated instruments)
- Source conflicts (contradictory findings, incompatible theoretical frameworks)
- Missing evidence (claims without sufficient support, citation gaps)
- Analytical dead ends (circular reasoning, unfalsifiable hypotheses, tautological arguments)
- Coverage gaps (underrepresented domains, temporal blind spots, missing perspectives)
</purpose>

<paths>
DEBUG_DIR=.planning/debug

Diagnosis files use the `.planning/debug/` path (hidden directory with leading dot).
</paths>

<core_principle>
**Diagnose before planning resolutions.**

Verification tells us WHAT is weak (symptoms). Diagnosis agents find WHY (root cause). plan-inquiry --gaps then creates targeted resolutions based on actual causes, not guesses.

Without diagnosis: "Source conflict on measurement validity" -> guess at resolution -> maybe wrong
With diagnosis: "Source conflict on measurement validity" -> "Ryan 2017 and Deci 2020 use incompatible operationalizations of autonomy" -> precise resolution (reconcile definitions or scope to one framework)
</core_principle>

<process>

<step name="parse_gaps">
**Extract gaps from verification record:**

Read the "Gaps" section (YAML format):
```yaml
- truth: "All autonomy support claims backed by empirical evidence"
  status: failed
  reason: "Reviewer noted: Section 3.2 cites theoretical framework but lacks empirical validation studies"
  severity: major
  test: 2
  artifacts: []
  missing: []
```

For each gap, also read the corresponding verification check to get full context.

Build gap list:
```
gaps = [
  {truth: "All autonomy support claims backed...", severity: "major", test_num: 2, reason: "..."},
  {truth: "Sources represent balanced perspectives...", severity: "minor", test_num: 5, reason: "..."},
  ...
]
```
</step>

<step name="report_plan">
**Report diagnosis plan to user:**

```
## Diagnosing {N} Research Gaps

Spawning parallel diagnosis agents to investigate root causes:

| Gap (Expected Truth) | Severity |
|----------------------|----------|
| All autonomy claims backed by empirical evidence | major |
| Sources represent balanced perspectives | minor |
| Methodology section addresses validity threats | blocker |

Each agent will:
1. Create DIAGNOSIS-{slug}.md with symptoms pre-filled
2. Investigate autonomously (read notes, trace reasoning, check sources)
3. Return root cause

This runs in parallel - all gaps investigated simultaneously.
```
</step>

<step name="spawn_agents">
**Spawn diagnosis agents in parallel:**

For each gap, fill the debug-subagent-prompt template and spawn:

```
Task(
  prompt=filled_debug_subagent_prompt + "\n\n<files_to_read>\n- {phase_dir}/{phase_num}-VERIFICATION.md\n- .planning/STATE.md\n</files_to_read>",
  subagent_type="grd-debugger",
  isolation="worktree",
  description="Diagnose: {truth_short}"
)
```

**All agents spawn in single message** (parallel execution).

Template placeholders:
- `{truth}`: The expected research quality that failed
- `{expected}`: From verification check
- `{actual}`: Verbatim reviewer description from reason field
- `{errors}`: Any specific problems identified (or "None reported")
- `{reproduction}`: "Check {test_num} in verification"
- `{timeline}`: "Discovered during research verification"
- `{goal}`: `find_root_cause_only` (verification flow - plan-inquiry --gaps handles resolutions)
- `{slug}`: Generated from truth
</step>

<step name="collect_results">
**Collect root causes from agents:**

Each agent returns with:
```
## ROOT CAUSE FOUND

**Diagnosis Session:** ${DEBUG_DIR}/{slug}.md

**Root Cause:** {specific cause with evidence}

**Evidence Summary:**
- {key finding 1}
- {key finding 2}
- {key finding 3}

**Sources/Notes Involved:**
- {note1}: {what's problematic}
- {source1}: {related issue}

**Suggested Resolution Direction:** {brief hint for plan-inquiry --gaps}
```

Parse each return to extract:
- root_cause: The diagnosed cause
- artifacts: Sources/notes involved
- debug_path: Path to diagnosis session file
- suggested_resolution: Hint for gap closure plan

If agent returns `## INVESTIGATION INCONCLUSIVE`:
- root_cause: "Investigation inconclusive - manual review needed"
- Note which issue needs manual attention
- Include remaining possibilities from agent return
</step>

<step name="update_verification">
**Update verification record gaps with diagnosis:**

For each gap in the Gaps section, add artifacts and missing fields:

```yaml
- truth: "All autonomy support claims backed by empirical evidence"
  status: failed
  reason: "Reviewer noted: Section 3.2 cites theoretical framework but lacks empirical validation studies"
  severity: major
  test: 2
  root_cause: "Section 3.2 relies on Ryan & Deci 2000 theoretical paper; no empirical studies from 2015+ acquired for autonomy support interventions"
  artifacts:
    - path: "vault/notes/autonomy-support-theory.md"
      issue: "Cites only theoretical framework, no empirical validation"
  missing:
    - "Acquire empirical studies on autonomy support interventions (2015-2024)"
    - "Add evidence from intervention trials to Section 3.2"
  debug_session: .planning/debug/autonomy-claims-unsupported.md
```

Update status in frontmatter to "diagnosed".

Commit the updated verification record:
```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" commit "docs({phase_num}): add root causes from diagnosis" --files ".planning/phases/XX-name/{phase_num}-VERIFICATION.md"
```
</step>

<step name="report_results">
**Report diagnosis results and hand off:**

Display:
```
---
 GRD - DIAGNOSIS COMPLETE
---

| Gap (Expected Truth) | Root Cause | Sources/Notes |
|----------------------|------------|---------------|
| Autonomy claims backed by evidence | Missing empirical studies post-2015 | autonomy-support-theory.md |
| Balanced perspectives represented | Western-centric source selection | 8 of 10 sources US/UK only |
| Methodology addresses validity | No construct validity discussion | methodology-note.md |

Diagnosis sessions: ${DEBUG_DIR}/

Proceeding to plan resolutions...
```

Return to verify-inquiry orchestrator for automatic planning.
Do NOT offer manual next steps - verify-inquiry handles the rest.
</step>

</process>

<context_efficiency>
Agents start with symptoms pre-filled from verification (no symptom gathering).
Agents only diagnose -- plan-inquiry --gaps handles resolutions (no fix application).
</context_efficiency>

<failure_handling>
**Agent fails to find root cause:**
- Mark gap as "needs manual review"
- Continue with other gaps
- Report incomplete diagnosis

**Agent times out:**
- Check DIAGNOSIS-{slug}.md for partial progress
- Can resume with /grd:diagnose

**All agents fail:**
- Something systemic (missing notes, corrupted vault, etc.)
- Report for manual investigation
- Fall back to plan-inquiry --gaps without root causes (less precise)
</failure_handling>

<success_criteria>
- [ ] Gaps parsed from verification record
- [ ] Diagnosis agents spawned in parallel
- [ ] Root causes collected from all agents
- [ ] Verification gaps updated with artifacts and missing items
- [ ] Diagnosis sessions saved to ${DEBUG_DIR}/
- [ ] Hand off to verify-inquiry for automatic planning
</success_criteria>
