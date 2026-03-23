<purpose>
Add verification criteria for a completed research phase based on its SUMMARY.md, CONTEXT.md, and research outputs. Classifies each research artifact into Evidence (source fidelity), Coverage (completeness), or Methodology (soundness) categories, presents a verification plan for user approval, then generates verification criteria and checks.

Researchers currently hand-craft verification after each phase. This workflow standardizes the process with proper classification, quality gates, and gap reporting.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>

<step name="parse_arguments">
Parse `$ARGUMENTS` for:
- Phase number (integer, decimal, or letter-suffix) -> store as `$PHASE_ARG`
- Remaining text after phase number -> store as `$EXTRA_INSTRUCTIONS` (optional)

Example: `/grd:add-verification 12`
Example: `/grd:add-verification 12 focus on source coverage for autonomy domain`

If no phase argument provided:

```
ERROR: Phase number required
Usage: /grd:add-verification <phase> [additional instructions]
Example: /grd:add-verification 12
Example: /grd:add-verification 12 focus on source coverage for autonomy domain
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
1. `${phase_dir}/*-SUMMARY.md` -- what was researched, notes created, sources acquired
2. `${phase_dir}/CONTEXT.md` -- research objectives, scope decisions
3. `${phase_dir}/*-VERIFICATION.md` -- verification scenarios (if already exists)

If no SUMMARY.md exists:
```
ERROR: No SUMMARY.md found for phase ${PHASE_ARG}
This command works on completed phases. Run /grd:conduct-inquiry first.
```
Exit.

Present banner:
```
---
 GRD - ADD VERIFICATION -- Phase ${phase_number}: ${phase_name}
---
```
</step>

<step name="analyze_research_outputs">
Extract the list of research outputs (notes, sources, synthesis documents) from SUMMARY.md ("Files Created/Modified" or equivalent section).

For each artifact, classify into one of three categories:

| Category | Criteria | Verification Type |
|----------|----------|-------------------|
| **Evidence** | Source-backed claims that can be checked for fidelity | Source fidelity checks |
| **Coverage** | Completeness assessable by scope/domain analysis | Coverage assertions |
| **Methodology** | Methodological choices that can be evaluated for soundness | Methodology validation |

**Evidence classification -- apply when:**
- Research notes with claims attributed to specific sources
- Synthesis documents making cross-source assertions
- Notes citing specific findings, statistics, or quotes
- Source summaries that can be verified against originals

**Coverage classification -- apply when:**
- Domain coverage that should meet a completeness threshold
- Source diversity (geographic, temporal, methodological, theoretical)
- Representation of different perspectives on a debate
- Breadth of search strategy (databases searched, date ranges)

**Methodology classification -- apply when:**
- Research design choices (inclusion/exclusion criteria, search strategy)
- Analytical approach (thematic coding, systematic review, narrative synthesis)
- Evidence quality assessment approach
- Citation and referencing practices
- Synthesis methodology (how sources were combined into findings)

**Skip classification -- apply when:**
- Administrative artifacts (SOURCE-LOG.md, frontmatter-only files)
- Configuration or planning documents
- Files with no substantive research content

Read each artifact to verify classification. Don't classify based on filename alone.
</step>

<step name="present_classification">
Present the classification to the user for confirmation before proceeding:

```
AskUserQuestion(
  header: "Verification Classification",
  question: |
    ## Research artifacts classified for verification

    ### Evidence (Source Fidelity Checks) -- {N} artifacts
    {list of notes/sources with brief reason}

    ### Coverage (Completeness Assertions) -- {M} artifacts
    {list of domains/areas with brief reason}

    ### Methodology (Soundness Validation) -- {K} artifacts
    {list of methodological choices with brief reason}

    ### Skip -- {J} artifacts
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

<step name="discover_verification_structure">
Before generating the verification plan, discover existing verification patterns in the project:

```bash
# Find existing verification files
find .planning -name "*VERIFICATION*" -o -name "*verification*" 2>/dev/null | head -20
# Check for existing verification criteria format
ls .planning/phases/*/VERIFICATION.md 2>/dev/null | head -5
```

Identify:
- Verification file location and naming convention
- Criteria format (YAML, markdown checklist, structured sections)
- Whether previous phases have verification criteria to match

If verification structure is ambiguous, ask the user:
```
AskUserQuestion(
  header: "Verification Structure",
  question: "I found multiple verification formats. Which should I follow?",
  options: [list discovered formats]
)
```
</step>

<step name="generate_verification_plan">
For each approved artifact, create a detailed verification plan.

**For Evidence artifacts**, plan source fidelity checks:
1. Identify claims in notes attributed to specific sources
2. For each claim: specify the source, the note's representation, what to verify
3. Include: direct quote checks, finding accuracy, context preservation, citation completeness

**For Coverage artifacts**, plan completeness assertions:
1. Identify domain/scope expectations from CONTEXT.md
2. For each domain: expected coverage, actual coverage, what constitutes sufficient
3. Include: source count thresholds, diversity metrics, temporal range checks

**For Methodology artifacts**, plan soundness validation:
1. Identify methodological choices and their justifications
2. For each choice: what standard it should meet, how to evaluate
3. Include: search strategy completeness, inclusion criteria clarity, synthesis rigor

Present the complete verification plan:

```
AskUserQuestion(
  header: "Verification Plan",
  question: |
    ## Verification Criteria Plan

    ### Evidence Checks ({N} checks across {M} notes)
    {for each note: verification criteria, source to check against}

    ### Coverage Assertions ({P} assertions across {Q} domains)
    {for each domain: coverage threshold, what to verify}

    ### Methodology Validation ({R} validations)
    {for each method: standard to meet, how to evaluate}

    Ready to generate?
  options:
    - "Generate all"
    - "Cherry-pick (I'll specify which)"
    - "Adjust plan"
)
```

If "Cherry-pick": ask user which criteria to include.
If "Adjust plan": apply changes and re-present.
</step>

<step name="execute_evidence_checks">
For each approved evidence check:

1. **Create verification entry** following discovered project conventions

2. **Write source fidelity check** with clear structure:
   ```
   Claim: [what the note asserts]
   Source: [which source it's attributed to]
   Check: [read source, verify claim is accurately represented]
   Expected: [what the source should say if the claim is faithful]
   ```

3. **Execute the check** (read the source, compare to the note's claim):
   ```bash
   # Read the relevant source and note
   ```

4. **Evaluate result:**
   - **Fidelity confirmed**: Good -- the note accurately represents the source.
   - **Fidelity issue found**: Flag it:
     ```
     EVIDENCE ISSUE: {check name}
     Note claims: {what the note says}
     Source says: {what the source actually says}
     Note: {path to note}
     Source: {path to source}
     ```
     Do NOT fix the note -- this is a verification command, not a correction command. Record the finding.
   - **Source unavailable**: Record as gap -- source needs to be acquired.
</step>

<step name="execute_coverage_assertions">
For each approved coverage assertion:

1. **Check for existing coverage data:**
   ```bash
   # Count sources in relevant domain
   grep -r "{domain keyword}" vault/notes/ 2>/dev/null | wc -l
   ```
   If corpus map exists, use .planning/corpus/COVERAGE.md data.

2. **Create coverage assertion** targeting domain completeness:
   ```
   Domain: [research domain]
   Threshold: [minimum source count / diversity requirement]
   Actual: [what exists in the corpus]
   Status: [met / not met / partially met]
   ```

3. **Evaluate result:**
   - **Coverage met**: Record success
   - **Coverage gap**: Flag it:
     ```
     COVERAGE GAP: {domain}
     Expected: {threshold}
     Actual: {what exists}
     Missing: {what's needed}
     ```
   - **Cannot assess**: Report why and mark as needs-manual-review.
</step>

<step name="execute_methodology_validation">
For each approved methodology validation:

1. **Read the methodology description** in relevant notes/CONTEXT.md

2. **Evaluate against standards:**
   ```
   Method: [methodological choice]
   Standard: [what good practice requires]
   Evaluation: [how the project's approach compares]
   Status: [sound / needs improvement / inadequate]
   ```

3. **Evaluate result:**
   - **Sound methodology**: Record strength
   - **Needs improvement**: Flag it:
     ```
     METHODOLOGY NOTE: {method}
     Current: {what the project does}
     Standard: {what good practice requires}
     Gap: {specific improvement needed}
     ```
   - **Cannot evaluate**: Record limitation.
</step>

<step name="summary_and_commit">
Create a verification report and present to user:

```
---
 GRD - VERIFICATION CRITERIA COMPLETE
---

## Results

| Category     | Generated | Confirmed | Issues  | Gaps    |
|-------------|-----------|-----------|---------|---------|
| Evidence    | {N}       | {n1}      | {n2}    | {n3}    |
| Coverage    | {M}       | {m1}      | {m2}    | {m3}    |
| Methodology | {K}       | {k1}      | {k2}    | {k3}    |

## Files Created/Modified
{list of verification files with paths}

## Coverage Gaps
{areas that couldn't be verified and why}

## Issues Discovered
{any fidelity issues or methodology weaknesses found}
```

Record verification in project state:
```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" state-snapshot
```

If there are verification criteria to commit:

```bash
git add {verification files}
git commit -m "chore(phase-${phase_number}): add verification criteria from add-verification command"
```

Present next steps:

```
---

## Next Up

{if issues discovered:}
**Address discovered issues:** `/grd:quick address the {N} verification issues discovered in phase ${phase_number}`

{if coverage gaps:}
**Fill coverage gaps:** `/grd:plan-inquiry` to plan additional source acquisition

{otherwise:}
**All verification criteria confirmed!** Phase ${phase_number} research outputs are well-supported.

---

**Also available:**
- `/grd:add-verification {next_phase}` -- verify another phase
- `/grd:verify-inquiry {phase_number}` -- run full research verification

---
```
</step>

</process>

<success_criteria>
- [ ] Phase artifacts loaded (SUMMARY.md, CONTEXT.md, optionally VERIFICATION.md)
- [ ] All research outputs classified into Evidence/Coverage/Methodology/Skip categories
- [ ] Classification presented to user and approved
- [ ] Existing verification structure discovered
- [ ] Verification plan presented to user and approved
- [ ] Evidence checks generated with source fidelity structure
- [ ] Coverage assertions generated with domain completeness thresholds
- [ ] Methodology validations generated with standards-based evaluation
- [ ] All checks executed -- no unverified criteria marked as confirmed
- [ ] Issues discovered by checks flagged (not fixed)
- [ ] Verification files committed with proper message
- [ ] Coverage gaps documented
- [ ] Next steps presented to user
</success_criteria>
