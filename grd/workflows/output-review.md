<purpose>
Scholarly quality audit of completed research deliverables. Standalone command that works on any research project -- GRD-managed or not. Evaluates six research dimensions and produces a scored OUTPUT-REVIEW.md with actionable findings.

The six research dimensions replace the former UI-centric pillars with scholarly evaluation criteria.
</purpose>

<process>

## 0. Initialize

```bash
INIT=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" init phase-op "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse: `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `padded_phase`, `commit_docs`.

Display banner:
```
-------------------------------------------------------------------
 GRD > OUTPUT REVIEW -- PHASE {N}: {name}
-------------------------------------------------------------------
```

## 1. Detect Input State

```bash
SUMMARY_FILES=$(ls "${PHASE_DIR}"/*-SUMMARY.md 2>/dev/null)
PRES_SPEC_FILE=$(ls "${PHASE_DIR}"/*-PRESENTATION-SPEC.md 2>/dev/null | head -1)
OUTPUT_REVIEW_FILE=$(ls "${PHASE_DIR}"/*-OUTPUT-REVIEW.md 2>/dev/null | head -1)
```

**If `SUMMARY_FILES` empty:** Exit -- "Phase {N} not executed. Run /grd:conduct-inquiry {N} first."

**If `OUTPUT_REVIEW_FILE` non-empty:** Use AskUserQuestion:
- header: "Existing Output Review"
- question: "OUTPUT-REVIEW.md already exists for Phase {N}."
- options:
  - "Re-review -- run fresh audit"
  - "View -- display current review and exit"

If "View": display file, exit.
If "Re-review": continue.

## 2. Gather Context Paths

Build file list for review:
- All SUMMARY.md files in phase dir (what was produced)
- All PLAN.md files in phase dir (what was intended)
- PRESENTATION-SPEC.md (if exists -- review against design contract)
- CONTEXT.md (if exists -- locked decisions and audience)
- SOURCE-LOG.md files (evidence inventory)
- Synthesis documents (if /grd:synthesize was run)

## 3. Conduct Scholarly Review

Evaluate research deliverables on six dimensions, scoring each 1-4:

### Dimension 1: Argument Coherence (1-4)
- Is there a clear thesis or research question?
- Do findings follow logically from evidence?
- Are counterarguments acknowledged?
- Is the argument arc complete (claim -> evidence -> interpretation)?

### Dimension 2: Evidence Quality (1-4)
- Are sources primary, secondary, or tertiary?
- Is evidence relevant and current?
- Are sources diverse (not all from one perspective)?
- Is the evidence sufficient to support claims?

### Dimension 3: Citation Coverage (1-4)
- Are all claims backed by cited sources?
- Are SOURCE-LOGs complete (no missing entries)?
- Are sources properly attributed?
- Could a reader trace every claim to its source?

### Dimension 4: Methodology Transparency (1-4)
- Is the research approach documented?
- Are search strategies and inclusion criteria stated?
- Are limitations acknowledged?
- Could another researcher reproduce the approach?

### Dimension 5: Presentation Clarity (1-4)
- Is the structure logical and easy to follow?
- Are findings clearly distinguished from interpretation?
- Is the writing precise and unambiguous?
- Are figures/tables (if any) well-labeled and referenced?

### Dimension 6: Completeness (1-4)
- Does the work address the original research question?
- Are all planned topics covered?
- Are gaps identified and explained?
- Is there a clear conclusion or synthesis?

## 4. Generate OUTPUT-REVIEW.md

Write to `{phase_dir}/{padded_phase}-OUTPUT-REVIEW.md`:

```markdown
# Output Review: Phase {N} -- {Name}

**Reviewed:** {date}
**Overall Score:** {total}/24

## Dimension Scores

| Dimension | Score | Assessment |
|-----------|-------|------------|
| Argument Coherence | {N}/4 | {one-line assessment} |
| Evidence Quality | {N}/4 | {one-line assessment} |
| Citation Coverage | {N}/4 | {one-line assessment} |
| Methodology Transparency | {N}/4 | {one-line assessment} |
| Presentation Clarity | {N}/4 | {one-line assessment} |
| Completeness | {N}/4 | {one-line assessment} |

## Detailed Findings

### Argument Coherence
{detailed assessment with specific examples}

### Evidence Quality
{detailed assessment with specific examples}

### Citation Coverage
{detailed assessment with specific examples}

### Methodology Transparency
{detailed assessment with specific examples}

### Presentation Clarity
{detailed assessment with specific examples}

### Completeness
{detailed assessment with specific examples}

## Priority Improvements

1. {highest-impact improvement}
2. {second improvement}
3. {third improvement}

## Strengths

{what the research does well}
```

## 5. Present Results

Display:
```
-------------------------------------------------------------------
 GRD > OUTPUT REVIEW COMPLETE

 Phase {N}: {Name} -- Overall: {score}/24

 | Dimension                  | Score |
 |----------------------------|-------|
 | Argument Coherence         | {N}/4 |
 | Evidence Quality           | {N}/4 |
 | Citation Coverage          | {N}/4 |
 | Methodology Transparency   | {N}/4 |
 | Presentation Clarity       | {N}/4 |
 | Completeness               | {N}/4 |

 Top improvements:
 1. {improvement}
 2. {improvement}
 3. {improvement}

 Full review: {path to OUTPUT-REVIEW.md}

-------------------------------------------------------------------

Next:
  /grd:verify-inquiry {N} -- formal verification pass
  /grd:export-research {N} -- package for delivery

-------------------------------------------------------------------
```

## 6. Commit (if configured)

```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" commit "docs(${padded_phase}): output quality review" --files "${PHASE_DIR}/${PADDED_PHASE}-OUTPUT-REVIEW.md"
```

</process>

<success_criteria>
- [ ] Phase validated
- [ ] SUMMARY.md files found (research completed)
- [ ] Existing review handled (re-review/view)
- [ ] All six research dimensions evaluated and scored
- [ ] OUTPUT-REVIEW.md created in phase directory
- [ ] Score summary displayed to user
- [ ] Priority improvements listed
- [ ] Next steps presented
</success_criteria>
