# Executive Summary Template

Output template for `grd-argument-constructor` agent. Written to `{vault_path}/00-Executive-Summary.md`.

<template>

```markdown
# Executive Summary

## Introduction
<!-- tier:guided -->
<!-- State the research questions and their significance, drawn from PROJECT.md. This section frames the entire argument -- a reader should understand what was investigated and why it matters before encountering any findings. Connect to the epistemological stance and review type to establish the methodological context. -->
<!-- /tier:guided -->
<!-- tier:standard -->
[Research questions, significance, and methodological context from PROJECT.md.]
<!-- /tier:standard -->
[Research questions and significance from PROJECT.md]

## Key Themes
<!-- tier:guided -->
<!-- Synthesize the major themes from THEMES.md into a narrative. Do not simply copy the themes -- interpret them in the context of the research questions. Each theme should advance the argument. Use inline citations to connect every claim to its source notes. This section should read as a coherent analysis, not a list of findings. -->
<!-- /tier:guided -->
<!-- tier:standard -->
[Major themes synthesized into narrative with inline [Note: {note-name}] citations.]
<!-- /tier:standard -->
[Synthesized from THEMES.md -- major patterns with inline citations]

## Theoretical Implications
<!-- tier:guided -->
<!-- Draw from FRAMEWORK.md to show how the evidence maps to theory. Where does the evidence confirm existing theory? Where does it challenge or extend it? This section connects empirical findings to the broader theoretical landscape. If the framework was modified during integration, explain what changed and why it matters. -->
<!-- /tier:guided -->
<!-- tier:standard -->
[Evidence-to-theory mapping from FRAMEWORK.md with modification highlights.]
<!-- /tier:standard -->
[From FRAMEWORK.md -- how evidence maps to theory]

## Gaps and Future Directions
<!-- tier:guided -->
<!-- Draw from GAPS.md to communicate what remains unknown and why it matters. Prioritize gaps by significance. Include at least one challenged assumption from the problematization analysis. Future directions should be specific enough that a researcher could act on them. This section transforms gaps from weaknesses into opportunities. -->
<!-- /tier:guided -->
<!-- tier:standard -->
[Key gaps and challenged assumptions from GAPS.md with future directions.]
<!-- /tier:standard -->
[From GAPS.md -- what remains unknown and why it matters]

## Conclusion
<!-- tier:guided -->
<!-- This is the argument -- the reason this review exists. Do not merely summarize what was found. State what this body of evidence, taken together, means and advances. What does the field now understand that it did not before? What should change as a result? A good conclusion advances beyond summary into interpretation and contribution. -->
<!-- /tier:guided -->
<!-- tier:standard -->
[The argument: what the evidence means and advances beyond summary.]
<!-- /tier:standard -->
[The argument: what this body of evidence, taken together, means and advances]

---
**Citation Format:** All claims reference research notes as [Note: {note-name}].
**Deliverable Format:** [literature_review | research_brief | build_spec | custom]
```

</template>

<guidelines>

**Argument, not summary:** The Executive Summary must advance beyond restating findings. The conclusion states what this evidence means and contributes -- interpretation, not recitation.

**Citation format:** All claims use `[Note: {note-name}]` inline citations. Every assertion must be traceable to a specific research note. Unsupported claims are not permitted.

**Format adaptation:** The template above shows the baseline scholarly structure. The `grd-argument-constructor` agent adapts this structure based on the `deliverable_format` field in PROJECT.md (literature_review, research_brief, build_spec, or custom).

**Theme coverage:** All themes identified in THEMES.md must be referenced in the argument. No themes silently dropped.

**Coherence:** Sections build on each other: Introduction frames the questions, Key Themes presents evidence, Theoretical Implications connects to theory, Gaps identifies what remains, Conclusion synthesizes everything into the argument.

</guidelines>
