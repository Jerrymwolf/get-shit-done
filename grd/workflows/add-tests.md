<purpose>
Add verification criteria for a completed research phase based on its SUMMARY.md, CONTEXT.md, and research artifacts. Classifies each research artifact into Evidence Check (source verification), Coverage Assertion (completeness check), or Skip categories, presents a verification plan for user approval, then generates verification criteria.

Users currently hand-craft `/grd:quick` prompts for verification after each phase. This workflow standardizes the process with proper classification, quality gates, and gap reporting.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>

<step name="parse_arguments">
Parse `$ARGUMENTS` for:
- Phase number (integer, decimal, or letter-suffix) -> store as `$PHASE_ARG`
- Remaining text after phase number -> store as `$EXTRA_INSTRUCTIONS` (optional)

Example: `/grd:add-verification 12 focus on source coverage` -> `$PHASE_ARG=12`, `$EXTRA_INSTRUCTIONS="focus on source coverage"`

If no phase argument provided:

```
ERROR: Phase number required
Usage: /grd:add-verification <phase> [additional instructions]
Example: /grd:add-verification 12
Example: /grd:add-verification 12 focus on source coverage in the methodology section
```

Exit.
</step>

<step name="init_context">
Load phase operation context:

```bash
INIT=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" init phase-op "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Extract from init JSON: `phase_dir`, `phase_number`, `phase_name`.

Verify the phase directory exists. If not:
```
ERROR: Phase directory not found for phase ${PHASE_ARG}
Ensure the phase exists in .planning/phases/
```
Exit.

Read the phase artifacts (in order of priority):
1. `${phase_dir}/*-SUMMARY.md` — what was researched, findings produced, sources acquired
2. `${phase_dir}/CONTEXT.md` — acceptance criteria, decisions
3. `${phase_dir}/*-VERIFICATION.md` — previously verified findings (if verification was done)

If no SUMMARY.md exists:
```
ERROR: No SUMMARY.md found for phase ${PHASE_ARG}
This command works on completed phases. Run /grd:conduct-inquiry first.
```
Exit.

Present banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► ADD VERIFICATION — Phase ${phase_number}: ${phase_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

<step name="analyze_implementation">
Extract the list of research artifacts produced by the phase from SUMMARY.md ("Files Changed" or equivalent section).

For each artifact, classify into one of three categories:

| Category | Criteria | Verification Type |
|----------|----------|-----------|
| **Evidence Check** | Research notes with specific claims that can be verified against sources | Source verification |
| **Coverage Assertion** | Research phases where completeness of coverage can be assessed | Completeness check |
| **Skip** | Not meaningfully verifiable or administrative | None |

**Evidence Check classification — apply when:**
- Factual claims: statistical assertions, empirical findings, quoted data
- Methodology descriptions: claims about how research was conducted
- Source attributions: specific findings attributed to specific sources
- Theoretical claims: assertions about frameworks, models, or relationships
- Comparative analyses: claims about similarities, differences, or trends

**Coverage Assertion classification — apply when:**
- Literature completeness: whether key works in the domain are represented
- Methodology coverage: whether multiple methods/approaches are considered
- Analytical breadth: whether all relevant dimensions are addressed
- Cross-referencing completeness: whether sources are triangulated appropriately
- Domain coverage: whether all subfields mentioned in CONTEXT.md have corresponding notes

**Skip classification — apply when:**
- Planning documents: phase plans, context files, configuration
- Administrative notes: templates, boilerplate, organizational artifacts
- Source logs: SOURCE-LOG.md files (metadata, not claims)
- State files: STATE.md, ROADMAP.md updates

Read each artifact to verify classification. Don't classify based on filename alone.
</step>

<step name="present_classification">
Present the classification to the user for confirmation before proceeding:

```
AskUserQuestion(
  header: "Verification Classification",
  question: |
    ## Research artifacts classified for verification

    ### Evidence Checks — {N} artifacts
    {list of artifacts with brief reason}

    ### Coverage Assertions — {M} artifacts
    {list of artifacts with brief reason}

    ### Skip — {K} artifacts
    {list of artifacts with brief reason}

    {if $EXTRA_INSTRUCTIONS: "Additional instructions: ${EXTRA_INSTRUCTIONS}"}

    How would you like to proceed?
  options:
    - "Approve and generate verification plan"
    - "Adjust classification (I'll specify changes)"
    - "Cancel"
)
```

If user selects "Adjust classification": apply their changes and re-present.
If user selects "Cancel": exit gracefully.
</step>

<step name="discover_test_structure">
Before generating the verification plan, discover the project's existing verification structure:

```bash
# Find existing verification documents
find . -type f -name "*VERIFICATION*" -o -name "*verification*" 2>/dev/null | head -20
# Find existing evidence check patterns
find .planning/phases -type f -name "*-SUMMARY.md" 2>/dev/null | head -20
# Check for prior verification criteria
ls .planning/phases/*/VERIFICATION.md 2>/dev/null
```

Identify:
- Existing verification documents and their structure
- How prior phases documented verification criteria
- Evidence quality standards established in earlier phases
- Source coverage patterns used in the project

If verification structure is ambiguous, ask the user:
```
AskUserQuestion(
  header: "Verification Structure",
  question: "I found multiple verification patterns. Which approach should I follow?",
  options: [list discovered patterns]
)
```
</step>

<step name="generate_test_plan">
For each approved artifact, create a detailed verification plan.

**For Evidence Check artifacts**, plan source verification:
1. Identify verifiable claims in the research note
2. For each claim: list the claim, the source it references, and how to verify (cross-reference, recalculation, independent source)
3. Note: since research is complete, verification confirms accuracy — flag contradictions as findings

**For Coverage Assertion artifacts**, plan completeness assessment:
1. Identify completeness criteria from CONTEXT.md (what domains, sources, or methods should be covered)
2. For each criterion: describe what adequate coverage looks like, what gaps would indicate incomplete research
3. Note: Coverage gaps are research findings, not failures — they identify areas for future inquiry

Present the complete verification plan:

```
AskUserQuestion(
  header: "Verification Plan",
  question: |
    ## Verification Plan

    ### Evidence Checks ({N} checks across {M} artifacts)
    {for each artifact: verification file path, list of claims to verify}

    ### Coverage Assertions ({P} assertions across {Q} artifacts)
    {for each artifact: assessment scope, completeness criteria}

    ### Verification Approach
    - Evidence: Cross-reference claims against acquired sources
    - Coverage: Compare scope against CONTEXT.md criteria

    Ready to generate?
  options:
    - "Generate all"
    - "Cherry-pick (I'll specify which)"
    - "Adjust plan"
)
```

If "Cherry-pick": ask user which verifications to include.
If "Adjust plan": apply changes and re-present.
</step>

<step name="execute_tdd_generation">
For each approved Evidence Check:

1. **Identify verifiable claims** in the research note — factual assertions, statistical claims, source attributions

2. **Write verification criteria** with clear structure:
   ```
   // Claim — the specific assertion being verified
   // Source — the source material referenced
   // Verification — how the claim was checked (cross-reference, recalculation, independent source)
   // Result — verified, contradicted, or unsupported
   ```

3. **Verify the claim against sources:**
   - Read the referenced source material
   - Cross-reference the claim against the source
   - Check for accuracy, completeness, and fair representation

4. **Evaluate result:**
   - **Claim verified**: The source supports the assertion. Document the verification.
   - **Claim contradicted or unsupported**: This is a research finding, not an error. Flag it:
     ```
     Finding: {claim description}
     Source says: {what the source actually states}
     Note says: {what the research note claims}
     Artifact: {research note path}
     ```
     Do NOT modify the research note — this is a verification command, not an editing command. Record the finding.
   - **Source unavailable**: Cannot verify. Note the gap and recommend source acquisition.
</step>

<step name="execute_e2e_generation">
For each approved Coverage Assertion:

1. **Check for existing coverage assessments** for the same domain:
   ```bash
   grep -r "{domain keyword}" .planning/phases/*-SUMMARY.md 2>/dev/null
   ```
   If found, extend rather than duplicate.

2. **Assess source coverage completeness** against CONTEXT.md criteria:
   - Check whether all domains mentioned in CONTEXT.md have corresponding notes/sources
   - Identify which key works or perspectives are missing
   - Evaluate analytical breadth

3. **Evaluate result:**
   - **Adequate coverage**: Domain is well-represented. Document what was found.
   - **Coverage gaps identified**: Report gaps as research findings:
     ```
     Coverage gap: {domain or topic}
     Expected: {what CONTEXT.md specified}
     Found: {what sources/notes exist}
     Recommendation: {what additional sources or inquiry would fill the gap}
     ```
   - **Cannot assess**: Report blocker. Do NOT mark as complete.
     ```
     Assessment blocked: {reason coverage cannot be evaluated}
     ```

**No-skip rule:** If coverage cannot be assessed (missing context, unclear criteria), report the blocker and mark the assessment as incomplete. Never mark success without actually evaluating coverage.
</step>

<step name="summary_and_commit">
Create a verification report and present to user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► VERIFICATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Results

| Category             | Generated | Verified | Contradictions | Blocked |
|----------------------|-----------|----------|----------------|---------|
| Evidence Checks      | {N}       | {n1}     | {n2}           | {n3}    |
| Coverage Assertions  | {M}       | {m1}     | {m2}           | {m3}    |

## Files Created/Modified
{list of verification files with paths}

## Coverage Gaps
{areas where source coverage is incomplete and why}

## Contradictions or Gaps Discovered
{any claims contradicted by sources or unsupported findings}
```

Record verification in project state:
```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" state-snapshot
```

If there are verification criteria to commit:

```bash
git add {verification files}
git commit -m "verify(phase-${phase_number}): add verification criteria from add-verification command"
```

Present next steps:

```
---

## Next Up

{if contradictions discovered:}
**Investigate contradictions:** `/grd:quick investigate the {N} contradictions discovered in phase ${phase_number}`

{if coverage gaps:}
**Fill coverage gaps:** {description of what additional sources or inquiry is needed}

{otherwise:}
**All verification criteria met!** Phase ${phase_number} findings are well-supported.

---

**Also available:**
- `/grd:add-verification {next_phase}` — verify another phase
- `/grd:verify-inquiry {phase_number}` — run full inquiry verification

---
```
</step>

</process>

<success_criteria>
- [ ] Phase artifacts loaded (SUMMARY.md, CONTEXT.md, optionally VERIFICATION.md)
- [ ] All research artifacts classified into Evidence Check/Coverage Assertion/Skip categories
- [ ] Classification presented to user and approved
- [ ] Existing verification structure discovered (documents, patterns, standards)
- [ ] Verification plan presented to user and approved
- [ ] Evidence checks generated with claim/source/verification structure
- [ ] Coverage assertions generated targeting CONTEXT.md completeness criteria
- [ ] All verification criteria evaluated — no unverified items marked as passing
- [ ] Contradictions discovered by verification flagged (not corrected)
- [ ] Verification files committed with proper message
- [ ] Coverage gaps documented
- [ ] Next steps presented to user
</success_criteria>
