# Research Summary Template

Template for `.planning/research/SUMMARY.md` — executive summary of project research with roadmap implications.

<template>

```markdown
# Project Research Summary

**Project:** [name from PROJECT.md]
**Domain:** [inferred domain type]
**Researched:** [date]
**Confidence:** [HIGH/MEDIUM/LOW]

## Executive Summary

[2-3 paragraph overview of research findings]

- What type of product this is and how experts build it
- The recommended approach based on research
- Key risks and how to mitigate them

## Key Findings

### Research Landscape

[Summary from LANDSCAPE.md — 1-2 paragraphs]

**Key Authors & Seminal Works:**
- [Author] ([Institution]): [contribution]
- [Author] ([Institution]): [contribution]
- [Author] ([Institution]): [contribution]

### Research Questions

[Summary from QUESTIONS.md]

**Central questions (open):**
- [Question] — active investigation
- [Question] — active investigation

**Sub-questions (tractable):**
- [Question] — approachable with current methods
- [Question] — approachable with current methods

**Settled (no further investigation needed):**
- [Question] — consensus established

### Theoretical Frameworks

[Summary from FRAMEWORKS.md — 1 paragraph]

**Key Frameworks:**
1. [Framework] — [relationship to research] — [evidence base]
2. [Framework] — [relationship to research] — [evidence base]
3. [Framework] — [relationship to research] — [evidence base]

### Active Debates

[Top 3-5 from DEBATES.md]

1. **[Debate]** — [positions held]
2. **[Debate]** — [positions held]
3. **[Debate]** — [positions held]

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: [Name]
**Rationale:** [why this comes first based on research]
**Delivers:** [what this phase produces]
**Addresses:** [questions from QUESTIONS.md]
**Engages:** [debate from DEBATES.md]

### Phase 2: [Name]
**Rationale:** [why this order]
**Delivers:** [what this phase produces]
**Uses:** [framework from FRAMEWORKS.md]
**Implements:** [architecture component]

### Phase 3: [Name]
**Rationale:** [why this order]
**Delivers:** [what this phase produces]

[Continue for suggested phases...]

### Phase Ordering Rationale

- [Why this order based on dependencies discovered]
- [Why this grouping based on architecture patterns]
- [How this avoids pitfalls from research]

### Research Flags

Phases likely needing deeper research during planning:
- **Phase [X]:** [reason — e.g., "complex integration, needs API research"]
- **Phase [Y]:** [reason — e.g., "niche domain, sparse documentation"]

Phases with standard patterns (skip research-phase):
- **Phase [X]:** [reason — e.g., "well-documented, established patterns"]

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Landscape | [HIGH/MEDIUM/LOW] | [reason] |
| Questions | [HIGH/MEDIUM/LOW] | [reason] |
| Frameworks | [HIGH/MEDIUM/LOW] | [reason] |
| Debates | [HIGH/MEDIUM/LOW] | [reason] |

**Overall confidence:** [HIGH/MEDIUM/LOW]

### Gaps to Address

[Any areas where research was inconclusive or needs validation during implementation]

- [Gap]: [how to handle during planning/execution]
- [Gap]: [how to handle during planning/execution]

## Sources

### Primary (HIGH confidence)
- [Context7 library ID] — [topics]
- [Official docs URL] — [what was checked]

### Secondary (MEDIUM confidence)
- [Source] — [finding]

### Tertiary (LOW confidence)
- [Source] — [finding, needs validation]

---
*Research completed: [date]*
*Ready for roadmap: yes*
```

</template>

<guidelines>

**Executive Summary:**
- Write for someone who will only read this section
- Include the key recommendation and main risk
- 2-3 paragraphs maximum

**Key Findings:**
- Summarize, don't duplicate full documents
- Link to detailed docs (LANDSCAPE.md, QUESTIONS.md, etc.)
- Focus on what matters for roadmap decisions

**Implications for Roadmap:**
- This is the most important section
- Directly informs roadmap creation
- Be explicit about phase suggestions and rationale
- Include research flags for each suggested phase

**Confidence Assessment:**
- Be honest about uncertainty
- Note gaps that need resolution during planning
- HIGH = verified with official sources
- MEDIUM = community consensus, multiple sources agree
- LOW = single source or inference

**Integration with roadmap creation:**
- This file is loaded as context during roadmap creation
- Phase suggestions here become starting point for roadmap
- Research flags inform phase planning

</guidelines>
