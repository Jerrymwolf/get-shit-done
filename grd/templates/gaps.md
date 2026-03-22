# Gap Analysis Template

Output template for `grd-gap-analyzer` agent. Written to `{vault_path}/00-GAPS.md`.

<template>

```markdown
# Gap Analysis

## Overview
<!-- tier:guided -->
<!-- Describe the scope of the gap analysis: what evidence was examined (THEMES.md, FRAMEWORK.md, all verified notes), what methodology was used (Muller-Bloch & Kranz gap taxonomy + Alvesson & Sandberg problematization), and how many gaps were identified. This section orients the reader before the detailed findings. -->
<!-- /tier:guided -->
<!-- tier:standard -->
[Scope of analysis, methodology (Muller-Bloch & Kranz + Alvesson & Sandberg), and gap count.]
<!-- /tier:standard -->
[Scope of analysis and methodology]

## Identified Gaps

### Gap 1: [Name]
**Type:** [contradictory_evidence | knowledge_void | action_knowledge_conflict | methodological_gap | evaluation_void | theory_application_void]
<!-- tier:guided -->
<!-- The gap type comes from the Muller-Bloch & Kranz (2015) taxonomy. Choose the type that best describes what kind of gap this is:
- contradictory_evidence: Studies reach opposing conclusions
- knowledge_void: No evidence exists on this topic
- action_knowledge_conflict: Practice diverges from research recommendations
- methodological_gap: Current methods cannot answer this question
- evaluation_void: Claims made without empirical evaluation
- theory_application_void: Theory proposed but not tested in this context -->
<!-- /tier:guided -->
**Significance:** [high | medium | low]
<!-- tier:guided -->
<!-- Assess how important this gap is. High = directly affects the research questions or undermines key conclusions. Medium = relevant to the study but does not undermine core findings. Low = worth noting but peripheral to the main inquiry. -->
<!-- /tier:guided -->
**Description:** [What is missing or contradicted]
**Evidence:** [Note: note-name-1], [Note: note-name-2] -- [what the evidence shows or fails to show]
**Implications:** [Why this gap matters for the research and the field]

### Gap 2: [Name]
[Same structure]

## Problematization
<!-- tier:guided -->
<!-- This section goes beyond gap-spotting. Following Alvesson & Sandberg (2011), identify assumptions that underlie the existing research -- things taken for granted without justification. Then challenge those assumptions: what would change if they were wrong? This produces more generative research questions than simply listing what has not been studied. -->
<!-- /tier:guided -->
<!-- tier:standard -->
[Assumptions identified and challenged per Alvesson & Sandberg (2011).]
<!-- /tier:standard -->

### Assumption 1: [What has been assumed without justification]
**Found in:** [Note: note-name-1], [Note: note-name-2]
**Challenge:** [Why this assumption is problematic -- what evidence questions it or what logic undermines it]
**Alternative:** [What would change if this assumption were questioned -- new research directions, revised conclusions, different framework elements]

## Gap Summary
<!-- tier:guided -->
<!-- This table provides a quick overview of all identified gaps. Use it as a reference for the argument construction stage -- the argument agent will draw from this to build the Gaps and Future Directions section of the deliverable. -->
<!-- /tier:guided -->
| Gap | Type | Significance | Implication |
|---|---|---|---|
| [Gap 1] | [contradictory_evidence] | [high] | [Brief implication] |

## Future Research Directions
<!-- tier:guided -->
<!-- Generate specific, actionable research questions that arise directly from the identified gaps and challenged assumptions. These should be concrete enough that a researcher could design a study to address them. Good future directions are not vague ("more research is needed") but specific ("a longitudinal study examining X in context Y would resolve the contradictory evidence about Z"). -->
<!-- /tier:guided -->
<!-- tier:standard -->
[Specific research questions arising from gaps and problematization.]
<!-- /tier:standard -->
[Generative research questions arising from gaps and problematization]
```

</template>

<guidelines>

**Gap typing:** Every gap must be classified using the Muller-Bloch & Kranz (2015) six-type taxonomy. No untyped gaps. If a gap spans multiple types, choose the primary type and note the secondary.

**Significance assessment:** Every gap must be assessed as high, medium, or low significance. Justify the rating based on relevance to the research questions and impact on conclusions.

**Problematization requirement:** The problematization section must contain at least one challenged assumption. Gap analysis without problematization is incomplete.

**Citation format:** All evidence references use `[Note: {note-name}]` inline format. Gaps are identified from evidence (or absence of evidence) -- cite what informed the identification.

**Generativity:** Future research directions must be specific and actionable, not generic. Each direction should trace back to a specific gap or challenged assumption.

</guidelines>
