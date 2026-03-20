# PROJECT.md Template

Template for `.planning/PROJECT.md` — the living research prospectus.

<template>

```markdown
# [Study Name]

## Problem Statement

[What problem or question drives this research? 2-3 sentences framing the research gap or need.
Use the researcher's language. Update if the research question evolves.]

## Significance

[Why does this matter? Who benefits from answering this question?
Connect to broader scholarly or practical implications.]

## Epistemological Stance

**Stance:** [positivist / constructivist / pragmatist / critical]
[Brief note on what this means for evidence evaluation in this study.]

## Review Type

**Type:** [systematic / scoping / integrative / critical / narrative]
[Brief note on the methodological implications -- what standards apply.]

## Researcher Tier

**Tier:** [guided / standard / expert]
[Determines communication style throughout the workflow.]

## Research Questions

### Primary

- [ ] [Research Question 1]
- [ ] [Research Question 2]

### Secondary

- [ ] [Research Question 3]
- [ ] [Research Question 4]

### Out of Scope

- [Excluded question] -- [why]
- [Excluded question] -- [why]

## Context

[Background that informs the research:
- Disciplinary context and traditions
- Prior work or existing knowledge
- Target audience for the research output
- Known methodological constraints]

## Constraints

- **[Type]**: [What] -- [Why]
- **[Type]**: [What] -- [Why]

Common types: Timeline, Source availability, Disciplinary boundaries, Language, Access, Methodology

## Methodological Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| [Choice] | [Why] | [Good / Revisit / Pending] |

---
*Last updated: [date] after [trigger]*
```

</template>

<guidelines>

**Problem Statement:**
- Frame the research gap clearly
- State what is unknown or contested
- 2-3 sentences capturing the driving question
- Use the researcher's words and framing
- Update when the research question evolves beyond this description

**Significance:**
- Connect to broader impact -- scholarly advancement, practical application, or social benefit
- Why this research matters to the field and beyond
- Rarely changes; if it does, it signals a significant reorientation

**Epistemological Stance:**
- Positivist, constructivist, pragmatist, or critical
- Shapes what counts as valid evidence throughout the study
- Influences how critical appraisal operates
- Set during research scoping; can be changed via `/grd:settings`

**Review Type:**
- Systematic, scoping, integrative, critical, or narrative
- Determines rigor requirements enforced by the plan-checker
- Each type has associated methodological standards (PRISMA, Arksey & O'Malley, etc.)
- Can be downgraded mid-study; rigor requirements relax, no work is lost

**Researcher Tier:**
- Guided, standard, or expert
- Determines communication style: how much the tool explains along the way
- Does NOT affect rigor -- every tier produces defense-quality output
- Set during research scoping; can be changed via `/grd:settings`

**Research Questions -- Primary:**
- Primary questions drive the study
- These are hypotheses until investigation provides answers
- Move to answered when evidence supports a conclusion

**Research Questions -- Secondary:**
- Secondary questions emerge during investigation
- Often discovered during literature review or analysis
- May be promoted to primary or moved to out of scope

**Research Questions -- Out of Scope:**
- Explicit boundaries on what this study does not investigate
- Always include reasoning (prevents scope creep)
- Includes: considered and excluded, deferred to future work, explicitly out of bounds

**Context:**
- Background that informs the research approach
- Disciplinary context, prior work, target audience
- Known methodological constraints or limitations
- Update as new context emerges

**Constraints:**
- Hard limits on the research
- Timeline, source availability, disciplinary boundaries, language, access, methodology
- Include the "why" -- constraints without rationale get questioned

**Methodological Decisions:**
- Track choices like "excluded grey literature", "focused on post-2010 studies", "prioritized English-language sources"
- Add decisions as they are made throughout the study
- Track outcome when known:
  - Good -- decision proved correct
  - Revisit -- decision may need reconsideration
  - Pending -- too early to evaluate

**Last Updated:**
- Always note when and why the document was updated
- Format: `after Inquiry 2` or `after v1.0 milestone`
- Triggers review of whether content is still accurate

</guidelines>

<evolution>

PROJECT.md evolves throughout the research lifecycle.

**After each inquiry completes:**
1. Research questions refined? -- Update wording, move between Primary/Secondary/Out of Scope
2. Research questions answered? -- Mark answered with inquiry reference
3. New research questions emerged? -- Add to appropriate category
4. Methodological decisions to log? -- Add to Methodological Decisions table
5. Problem Statement still accurate? -- Update if the research focus has shifted

**After each milestone:**
1. Full review of all sections
2. Significance check -- still the right framing?
3. Audit Out of Scope -- reasons still valid?
4. Update Context with current state (findings, new literature, refined understanding)

</evolution>

<brownfield>

For existing research:

1. **Map existing research first** via `/grd:map-codebase`

2. **Identify established findings from existing literature inventory:**
   - What has the research already established?
   - What patterns or themes are documented?
   - What is clearly supported and relied upon?

3. **Gather active research questions** from researcher:
   - Present inferred current state
   - Ask what they want to investigate next

4. **Initialize:**
   - Primary = established findings from existing inventory
   - Secondary = researcher's goals for this work
   - Out of Scope = boundaries researcher specifies
   - Context = includes current research state

</brownfield>

<state_reference>

STATE.md references PROJECT.md:

```markdown
## Project Reference

See: .planning/PROJECT.md (updated [date])

**Research focus:** [One-liner from Problem Statement section]
**Current inquiry:** [Current inquiry name]
```

This ensures Claude reads current PROJECT.md context.

</state_reference>
