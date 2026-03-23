<purpose>
Generate a presentation design contract (PRESENTATION-SPEC.md) for a research phase. Determines how findings will be communicated -- paper structure, poster layout, slide deck flow, or report format. Locks structural and narrative decisions before the researcher assembles final deliverables.

PRESENTATION-SPEC.md defines the argument arc, evidence placement, section structure, and audience framing. This prevents ad-hoc formatting decisions during final assembly.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>

## 1. Initialize

```bash
INIT=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" init plan-inquiry "$PHASE")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse JSON for: `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `padded_phase`, `has_context`, `has_research`, `commit_docs`.

**File paths:** `state_path`, `roadmap_path`, `requirements_path`, `context_path`, `research_path`.

**If `planning_exists` is false:** Error -- run `/grd:new-research` first.

## 2. Parse and Validate Phase

Extract phase number from $ARGUMENTS. If not provided, detect current phase.

```bash
PHASE_INFO=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" roadmap get-phase "${PHASE}")
```

**If `found` is false:** Error with available phases.

## 3. Check Prerequisites

**If `has_context` is false:**
```
No CONTEXT.md found for Phase {N}.
Recommended: run /grd:scope-inquiry {N} first to capture presentation preferences.
Continuing without -- presentation designer will ask all questions.
```
Continue (non-blocking).

## 4. Check Existing PRESENTATION-SPEC

```bash
PRES_SPEC_FILE=$(ls "${PHASE_DIR}"/*-PRESENTATION-SPEC.md 2>/dev/null | head -1)
```

**If exists:** Use AskUserQuestion:
- header: "Existing PRESENTATION-SPEC"
- question: "PRESENTATION-SPEC.md already exists for Phase {N}. What would you like to do?"
- options:
  - "Update -- revise with current findings as baseline"
  - "View -- display current spec and exit"
  - "Skip -- keep current spec, proceed to verification"

If "View": display file contents, exit.
If "Skip": proceed to step 7 (verification).
If "Update": continue to step 5.

## 5. Gather Research Context

Collect all completed research for this phase:
- SUMMARY.md files (what was found)
- SOURCE-LOG.md files (what evidence exists)
- Synthesis documents (if /grd:synthesize was run)
- CONTEXT.md (user preferences and audience)

## 6. Design Presentation Structure

Ask user for presentation format:

```
AskUserQuestion:
  question: "What format will this research be presented in?"
  options:
    - label: "Research Paper"
      description: "Structured academic paper (intro, methods, findings, discussion, conclusion)"
    - label: "Conference Poster"
      description: "Visual summary for poster session (key findings, supporting evidence, methods)"
    - label: "Slide Deck"
      description: "Sequential presentation (narrative arc, evidence slides, takeaways)"
    - label: "Research Report"
      description: "Comprehensive report (executive summary, detailed findings, recommendations)"
    - label: "Other"
      description: "Specify a custom format"
```

Based on selection, generate PRESENTATION-SPEC.md with:

### For Research Paper:
- Abstract structure (problem, method, key finding, implication)
- Section outline with evidence mapping (which findings go where)
- Argument arc (thesis, support, counterarguments, synthesis)
- Citation strategy (which sources support which claims)
- Figure/table plan (what data to visualize)

### For Conference Poster:
- Layout grid (sections, visual hierarchy)
- Key findings selection (top 3-5 for poster format)
- Evidence visualization plan
- Narrative flow (how a reader scans the poster)

### For Slide Deck:
- Slide sequence with narrative arc
- Evidence-per-slide mapping
- Transition logic between sections
- Audience engagement points

### For Research Report:
- Executive summary structure
- Section hierarchy with detail levels
- Evidence appendix plan
- Recommendation framework

Write to: `{phase_dir}/{padded_phase}-PRESENTATION-SPEC.md`

## 7. Verify Presentation Spec

Review the generated PRESENTATION-SPEC.md against these dimensions:

1. **Coverage** -- Does the spec account for all major findings?
2. **Evidence mapping** -- Is every claim linked to a source?
3. **Narrative coherence** -- Does the argument flow logically?
4. **Audience fit** -- Is the framing appropriate for the intended audience?
5. **Completeness** -- Are all required sections specified?

Report any gaps. If critical gaps found, offer to revise.

## 8. Present Final Status

Display:
```
-------------------------------------------------------------------
 GRD > PRESENTATION SPEC READY

 Phase {N}: {Name} -- Presentation design approved

 Format: {selected format}
 Sections: {count}
 Evidence mapped: {count} sources linked to claims

-------------------------------------------------------------------

Next:
  /grd:export-research {N} -- package for delivery
  /grd:output-review {N} -- audit deliverable quality

-------------------------------------------------------------------
```

## 9. Commit (if configured)

```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" commit "docs(${padded_phase}): presentation design contract" --files "${PHASE_DIR}/${PADDED_PHASE}-PRESENTATION-SPEC.md"
```

## 10. Update State

```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" state record-session \
  --stopped-at "Phase ${PHASE} presentation spec approved" \
  --resume-file "${PHASE_DIR}/${PADDED_PHASE}-PRESENTATION-SPEC.md"
```

</process>

<success_criteria>
- [ ] Phase validated against roadmap
- [ ] Prerequisites checked (CONTEXT.md -- non-blocking warning)
- [ ] Existing PRESENTATION-SPEC handled (update/view/skip)
- [ ] Presentation format selected by user
- [ ] PRESENTATION-SPEC.md created with format-specific structure
- [ ] Evidence mapped to presentation sections
- [ ] Verification dimensions checked
- [ ] Final status displayed with next steps
- [ ] PRESENTATION-SPEC.md committed (if commit_docs enabled)
- [ ] State updated
</success_criteria>
