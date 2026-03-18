# Research Template

Template for `.planning/phases/XX-name/{phase_num}-RESEARCH.md` - comprehensive research before planning.

**Purpose:** Document what Claude needs to know to investigate a phase well - not just "which sources" but "what do experts know about this."

---

## File Template

```markdown
# Phase [X]: [Name] - Research

**Researched:** [date]
**Domain:** [primary research domain]
**Confidence:** [HIGH/MEDIUM/LOW]

<user_constraints>
## User Constraints (from CONTEXT.md)

**CRITICAL:** If CONTEXT.md exists from /grd:discuss-phase, copy locked decisions here verbatim. These MUST be honored by the planner.

### Locked Decisions
[Copy from CONTEXT.md `## Decisions` section - these are NON-NEGOTIABLE]
- [Decision 1]
- [Decision 2]

### Claude's Discretion
[Copy from CONTEXT.md - areas where researcher/planner can choose]
- [Area 1]
- [Area 2]

### Deferred Ideas (OUT OF SCOPE)
[Copy from CONTEXT.md - do NOT research or plan these]
- [Deferred 1]
- [Deferred 2]

**If no CONTEXT.md exists:** Write "No user constraints - all decisions at Claude's discretion"
</user_constraints>

<research_summary>
## Summary

[2-3 paragraph executive summary]
- What research domain was investigated
- What the current state of knowledge is
- Key recommendations

**Primary recommendation:** [one-liner actionable guidance]
</research_summary>

<key_sources>
## Key Sources

Seminal papers, authoritative reviews, and landmark studies the planner must ensure are read:

### Foundational
| Source | Author(s) | Year | Type | Why Essential |
|--------|-----------|------|------|---------------|
| [title] | [authors] | [year] | Paper/Review/Book | [what it establishes] |

### Recent Reviews
| Source | Author(s) | Year | Covers | Currency |
|--------|-----------|------|--------|----------|
| [title] | [authors] | [year] | [scope] | [how current] |

### Landmark Studies
| Source | Author(s) | Year | Finding | Methodology |
|--------|-----------|------|---------|-------------|
| [title] | [authors] | [year] | [key finding] | [study design] |

**Citation network:** [Key citation chains to follow]
</key_sources>

<theoretical_framework>
## Theoretical Framework

### Dominant Framework: [Name]
**Core idea:** [description]
**Key constructs:** [list with definitions]
**Evidence base:** [strength of support]

### Competing Models
| Model | Core Difference | When Preferred | Evidence |
|-------|-----------------|----------------|----------|
| [model] | [how it differs] | [conditions] | [support level] |

### Construct Relationships
[How key concepts relate to each other — which causes what, what mediates, what moderates]

### Framework for This Phase
[Which framework(s) this phase's research operates within and why]
</theoretical_framework>

<existing_syntheses>
## Existing Syntheses

Prior literature reviews, meta-analyses, and systematic reviews — don't duplicate, build on them:

| Synthesis | Author(s) | Year | Scope | Findings | Gaps |
|-----------|-----------|------|-------|----------|------|
| [title] | [authors] | [year] | [what it covered] | [key conclusions] | [what it missed] |

**Key insight:** [what these syntheses tell us about the state of knowledge]
</existing_syntheses>

<common_misconceptions>
## Common Misconceptions

### Misconception 1: [Name]
**The claim:** [what's commonly believed]
**The reality:** [what evidence actually shows]
**Why it persists:** [why people keep believing it]
**Source:** [who debunked it, when]

### Misconception 2: [Name]
**The claim:** [what's commonly believed]
**The reality:** [what evidence actually shows]
**Why it persists:** [why people keep believing it]
**Source:** [who debunked it, when]
</common_misconceptions>

<key_evidence>
## Key Evidence

Landmark findings with methodology details:

### [Finding 1]
**Study:** [author, year, title]
**Design:** [experimental/correlational/longitudinal/meta-analysis]
**Sample:** [size, characteristics, population]
**Key result:** [effect size, significance, practical significance]
**Replication status:** [replicated/not replicated/mixed/not yet attempted]
**Limitations:** [acknowledged limitations]

### [Finding 2]
[Same structure]

### Evidence Quality Summary
| Finding | Effect Size | Sample | Replicated? | Confidence |
|---------|-------------|--------|-------------|------------|
| [finding] | [size] | [N] | [status] | HIGH/MEDIUM/LOW |
</key_evidence>

<current_consensus>
## Current Consensus

### Settled
| Finding | Evidence Base | Confidence |
|---------|-------------|------------|
| [what's agreed upon] | [type and volume of evidence] | HIGH |

### Evolving
| Area | Current Position | Direction of Change | Key Recent Work |
|------|-----------------|---------------------|-----------------|
| [area] | [where things stand] | [where heading] | [recent papers] |

### Recent Paradigm Shifts
| Old View | New View | Precipitated By | Year |
|----------|---------|-----------------|------|
| [former consensus] | [current understanding] | [what changed it] | [when] |

**Field trajectory:** [where the field is heading overall]
</current_consensus>

<open_questions>
## Open Questions

Things that couldn't be fully resolved:

1. **[Question]**
   - What we know: [partial info]
   - What's unclear: [the gap]
   - Recommendation: [how to handle during planning/execution]

2. **[Question]**
   - What we know: [partial info]
   - What's unclear: [the gap]
   - Recommendation: [how to handle]
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Context7 library ID] - [topics fetched]
- [Official docs URL] - [what was checked]

### Secondary (MEDIUM confidence)
- [WebSearch verified with official source] - [finding + verification]

### Tertiary (LOW confidence - needs validation)
- [WebSearch only] - [finding, marked for validation during implementation]
</sources>

<metadata>
## Metadata

**Research scope:**
- Research domain: [what]
- Key sources: [sources explored]
- Frameworks: [frameworks researched]
- Misconceptions: [areas checked]

**Confidence breakdown:**
- Key sources: [HIGH/MEDIUM/LOW] - [reason]
- Theoretical framework: [HIGH/MEDIUM/LOW] - [reason]
- Misconceptions: [HIGH/MEDIUM/LOW] - [reason]
- Key evidence: [HIGH/MEDIUM/LOW] - [reason]

**Research date:** [date]
**Valid until:** [estimate - 30 days for stable fields, 7 days for fast-moving]
</metadata>

---

*Phase: XX-name*
*Research completed: [date]*
*Ready for planning: [yes/no]*
```

---

## Good Example

```markdown
# Phase 2: Autonomy & Competence in SDT - Research

**Researched:** 2025-06-15
**Domain:** Self-Determination Theory — intrinsic motivation research
**Confidence:** HIGH

<research_summary>
## Summary

Researched the Self-Determination Theory (SDT) literature on autonomy and competence as predictors of intrinsic motivation. SDT is the dominant framework in motivation science, with strong empirical support across education, work, health, and sport domains.

Key finding: Autonomy and competence are necessary but not sufficient for intrinsic motivation. The interaction between them matters more than either alone — autonomy without competence produces anxiety, competence without autonomy produces compliance but not engagement.

**Primary recommendation:** Treat autonomy and competence as interacting constructs, not independent predictors. Use the mini-theories (CET, OIT) to structure sub-questions rather than the macro-theory alone.
</research_summary>

<key_sources>
## Key Sources

### Foundational
| Source | Author(s) | Year | Type | Why Essential |
|--------|-----------|------|------|---------------|
| Intrinsic Motivation and Self-Determination in Human Behavior | Deci & Ryan | 1985 | Book | Established SDT as a formal theory |
| Self-Determination Theory and the Facilitation of Intrinsic Motivation | Ryan & Deci | 2000 | Review | Most-cited overview, defines the three basic needs |

### Recent Reviews
| Source | Author(s) | Year | Covers | Currency |
|--------|-----------|------|--------|----------|
| Self-Determination Theory: Basic Psychological Needs in Motivation, Development, and Wellness | Ryan & Deci | 2017 | Book | Comprehensive update with 30+ years of evidence |
| A meta-analysis of SDT interventions | Ntoumanis et al. | 2021 | Meta-analysis | Synthesizes intervention studies across domains |

### Landmark Studies
| Source | Author(s) | Year | Finding | Methodology |
|--------|-----------|------|---------|-------------|
| Undermining children's intrinsic interest | Lepper, Greene & Nisbett | 1973 | Extrinsic rewards reduce intrinsic motivation | Experimental (children, drawing task) |
| Competence and the overjustification effect | Deci | 1971 | Monetary rewards decrease task interest | Experimental (SOMA puzzle) |

**Citation network:** Deci (1971) → Deci & Ryan (1985) → Ryan & Deci (2000) → Ryan & Deci (2017). Follow Vansteenkiste and Ntoumanis for recent empirical extensions.
</key_sources>

<theoretical_framework>
## Theoretical Framework

### Dominant Framework: Self-Determination Theory (SDT)
**Core idea:** Humans have three basic psychological needs — autonomy, competence, relatedness — whose satisfaction drives intrinsic motivation and well-being
**Key constructs:** Autonomy (sense of volition), Competence (sense of efficacy), Relatedness (sense of belonging), Intrinsic/Extrinsic motivation continuum
**Evidence base:** HIGH — thousands of studies, multiple meta-analyses, cross-cultural validation

### Competing Models
| Model | Core Difference | When Preferred | Evidence |
|-------|-----------------|----------------|----------|
| Achievement Goal Theory | Focuses on mastery vs. performance goals, not needs | When studying academic/sport achievement specifically | Strong in education, weaker outside |
| Expectancy-Value Theory | Motivation = expectancy of success x subjective value | When predicting specific task choices | Strong for choice prediction, weaker for sustained engagement |
| Flow Theory (Csikszentmihalyi) | Optimal experience from challenge-skill balance | When studying moment-to-moment engagement | Complementary to SDT, not competing |

### Construct Relationships
Autonomy and competence interact: autonomy-supportive contexts enhance the positive effect of competence feedback. Competence feedback in controlling contexts has reduced (sometimes negative) effects on intrinsic motivation.

### Framework for This Phase
Operating within SDT, specifically Cognitive Evaluation Theory (CET) — the mini-theory addressing how external events affect intrinsic motivation through their impact on perceived autonomy and competence.
</theoretical_framework>

<existing_syntheses>
## Existing Syntheses

| Synthesis | Author(s) | Year | Scope | Findings | Gaps |
|-----------|-----------|------|-------|----------|------|
| SDT meta-analysis | Van den Broeck et al. | 2016 | Work motivation | Need satisfaction predicts well-being and performance | Limited to workplace, misses education |
| SDT interventions meta-analysis | Ntoumanis et al. | 2021 | Intervention studies | Autonomy support interventions effective, effect sizes moderate | Doesn't examine autonomy x competence interaction |

**Key insight:** Existing meta-analyses treat needs as independent predictors. The interaction between autonomy and competence is under-studied at the meta-analytic level — this is a genuine gap.
</existing_syntheses>

<common_misconceptions>
## Common Misconceptions

### Misconception 1: Autonomy means independence
**The claim:** Autonomy means doing things alone, without guidance
**The reality:** Autonomy in SDT means volitional endorsement — acting from one's own values, even when following others' advice
**Why it persists:** Everyday English conflates autonomy with independence
**Source:** Ryan & Deci (2006) clarified this distinction explicitly

### Misconception 2: Extrinsic rewards always undermine intrinsic motivation
**The claim:** All external rewards reduce interest in a task
**The reality:** Only expected, tangible, task-contingent rewards reliably undermine intrinsic motivation. Unexpected rewards, verbal praise, and informational feedback can enhance it
**Why it persists:** The "overjustification effect" is often taught without its boundary conditions
**Source:** Deci, Koestner & Ryan (1999) meta-analysis of 128 studies
</common_misconceptions>

<key_evidence>
## Key Evidence

### The Overjustification Effect
**Study:** Deci (1971), Effects of externally mediated rewards on intrinsic motivation
**Design:** Experimental (between-subjects)
**Sample:** 24 college students, SOMA puzzle task
**Key result:** Monetary reward group showed decreased free-choice persistence (d = -0.68)
**Replication status:** Replicated extensively; meta-analysis confirms (Deci, Koestner & Ryan, 1999, k = 128)
**Limitations:** Lab setting, short-term, college students

### Autonomy-Competence Interaction
**Study:** Zuckerman et al. (1978), On the importance of self-determination for intrinsically motivated behavior
**Design:** 2x2 experimental (choice x positive feedback)
**Sample:** 60 undergraduates, puzzle task
**Key result:** Choice + positive feedback produced highest intrinsic motivation; neither alone matched the combination
**Replication status:** Conceptually replicated across domains
**Limitations:** Lab setting, limited ecological validity

### Evidence Quality Summary
| Finding | Effect Size | Sample | Replicated? | Confidence |
|---------|-------------|--------|-------------|------------|
| Rewards undermine intrinsic motivation | d = -0.68 (tangible, expected) | k=128 studies | Yes (meta-analysis) | HIGH |
| Autonomy x Competence interaction | Significant interaction, moderate effect | Multiple studies | Conceptually yes | MEDIUM |
</key_evidence>

<current_consensus>
## Current Consensus

### Settled
| Finding | Evidence Base | Confidence |
|---------|-------------|------------|
| Three basic needs (autonomy, competence, relatedness) predict motivation | Thousands of studies, multiple meta-analyses | HIGH |
| Expected tangible rewards can undermine intrinsic motivation | Meta-analysis of 128 studies | HIGH |
| Autonomy support enhances intrinsic motivation across cultures | Cross-cultural studies in 30+ countries | HIGH |

### Evolving
| Area | Current Position | Direction of Change | Key Recent Work |
|------|-----------------|---------------------|-----------------|
| Need frustration (vs. mere absence) | Frustration has distinct negative effects beyond low satisfaction | Growing evidence for dual-process model | Vansteenkiste & Ryan (2013) |
| Dark side of autonomy | Very high autonomy without structure can be harmful | Nuancing the "more autonomy = better" assumption | Reeve (2009) |

### Recent Paradigm Shifts
| Old View | New View | Precipitated By | Year |
|----------|---------|-----------------|------|
| Needs are independent | Needs interact and compensate | Interaction studies | 2010s |
| Intrinsic/extrinsic is dichotomy | Continuum with internalization | Organismic Integration Theory | 2000s |

**Field trajectory:** Moving from establishing that needs matter to understanding how they interact and when they fail — more nuanced, less binary.
</current_consensus>

<sources>
## Sources

### Primary (HIGH confidence)
- Ryan & Deci (2000, 2017) - core SDT texts
- Deci, Koestner & Ryan (1999) - rewards meta-analysis

### Secondary (MEDIUM confidence)
- Van den Broeck et al. (2016) - workplace meta-analysis
- Ntoumanis et al. (2021) - interventions meta-analysis

### Tertiary (LOW confidence - needs validation)
- None - all findings verified against primary sources
</sources>

<metadata>
## Metadata

**Research scope:**
- Research domain: Self-Determination Theory, intrinsic motivation
- Key sources: Deci & Ryan corpus, meta-analyses, intervention studies
- Frameworks: SDT, CET, OIT, competing motivation theories
- Misconceptions: Autonomy definition, reward effects boundary conditions

**Confidence breakdown:**
- Key sources: HIGH - seminal works well-established
- Theoretical framework: HIGH - dominant theory with extensive evidence
- Misconceptions: HIGH - explicitly addressed in primary literature
- Key evidence: HIGH - meta-analytically supported findings

**Research date:** 2025-06-15
**Valid until:** 2025-07-15 (30 days - established field, slow-moving)
</metadata>

---

*Phase: 02-autonomy-competence*
*Research completed: 2025-06-15*
*Ready for planning: yes*
```

---

## Guidelines

**When to create:**
- Before planning phases in niche/complex domains
- When Claude's training data is likely stale or sparse
- When "what do experts know about this" matters more than "which source"

**Structure:**
- Use XML tags for section markers (matches GSD templates)
- Seven core sections: summary, key_sources, theoretical_framework, existing_syntheses, common_misconceptions, key_evidence, current_consensus
- All sections required (drives comprehensive research)

**Content quality:**
- Key sources: Specific citations with authors and years, not just titles
- Theoretical framework: Include actual construct definitions and evidence base
- Existing syntheses: Be explicit about what prior reviews covered and what they missed
- Misconceptions: Include what persists and why, not just "this is wrong"
- Sources: Mark confidence levels honestly

**Integration with planning:**
- RESEARCH.md loaded as @context reference in PLAN.md
- Key sources inform reading priorities
- Existing syntheses prevent duplicated effort
- Misconceptions inform what to watch out for
- Key evidence can be referenced in task actions

**After creation:**
- File lives in phase directory: `.planning/phases/XX-name/{phase_num}-RESEARCH.md`
- Referenced during planning workflow
- plan-phase loads it automatically when present
