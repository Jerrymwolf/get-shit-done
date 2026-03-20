# Research Objectives Template

Template for `.planning/REQUIREMENTS.md` — checkable research objectives that define what "answered" means.

<template>

```markdown
# Research Objectives: [Study Name]

**Defined:** [date]
**Research Focus:** [from PROJECT.md Problem Statement]

## Primary Research Objectives

Research objectives for this study. Each maps to lines of inquiry in the research design.

### [Theme Name]

- [ ] **[THEME]-01**: [Research objective description]
- [ ] **[THEME]-02**: [Research objective description]
- [ ] **[THEME]-03**: [Research objective description]
- [ ] **[THEME]-04**: [Research objective description]

### [Theme 2]

- [ ] **[THEME]-01**: [Research objective description]
- [ ] **[THEME]-02**: [Research objective description]
- [ ] **[THEME]-03**: [Research objective description]

### [Theme 3]

- [ ] **[THEME]-01**: [Research objective description]
- [ ] **[THEME]-02**: [Research objective description]

## Secondary Research Objectives

Deferred to future investigation. Tracked but not in current research design.

### [Theme]

- **[THEME]-01**: [Research objective description]
- **[THEME]-02**: [Research objective description]

## Out of Scope

Explicitly excluded from this study. Documented to prevent scope drift.

| Topic | Reason |
|---------|--------|
| [Topic] | [Why excluded] |
| [Topic] | [Why excluded] |

## Traceability

Which inquiries address which research objectives. Updated during research design creation.

| Objective | Inquiry | Status |
|-------------|-------|--------|
| [THEME]-01 | Inquiry 1 | Pending |
| [THEME]-02 | Inquiry 1 | Pending |
| [THEME]-03 | Inquiry 1 | Pending |
| [THEME]-04 | Inquiry 1 | Pending |
| [REQ-ID] | Inquiry [N] | Pending |

**Coverage:**
- Primary objectives: [X] total
- Mapped to inquiries: [Y]
- Unmapped: [Z] ⚠️

---
*Research objectives defined: [date]*
*Last updated: [date] after [trigger]*
```

</template>

<guidelines>

**Objective Format:**
- ID: `[THEME]-[NUMBER]` (THEO-01, EMPR-02, CULT-03)
- Description: Researcher-defined, verifiable, atomic -- acceptance criteria define what "answered" means
- Checkbox: Only for primary research objectives (secondary are not yet actionable)

**Themes:**
- Derive from Prior Findings thematic clusters
- Keep consistent with domain conventions
- Typical: Theoretical Foundation, Empirical Evidence, Cross-Cultural, Methodological, Synthesis

**Primary vs Secondary:**
- Primary: Committed scope, mapped to inquiries in research design
- Secondary: Acknowledged but deferred to future investigation
- Moving Secondary → Primary requires research design update

**Out of Scope:**
- Explicit exclusions with reasoning
- Prevents "why didn't you investigate X?" later
- Anti-features from research belong here with warnings

**Traceability:**
- Empty initially, populated during research design creation
- Each research objective maps to exactly one inquiry
- Unmapped objectives = research design gap

**Status Values:**
- Pending: Not started
- In Progress: Inquiry is active
- Complete: Objective verified
- Blocked: Waiting on external factor

</guidelines>

<evolution>

**After each inquiry completes:**
1. Mark covered research objectives as Complete
2. Update traceability status
3. Note any research objectives that changed scope

**After research design updates:**
1. Verify all primary research objectives still mapped
2. Add new research objectives if scope expanded
3. Move research objectives to secondary/out of scope if descoped

**Research objective completion criteria:**
- Research objective is "Complete" when:
  - Inquiry is conducted
  - Findings are verified (evidence reviewed, quality assessed)
  - Results are committed

</evolution>

<example>

```markdown
# Research Objectives: SDT-Values Integration Study

**Defined:** 2025-01-14
**Research Focus:** How do Schwartz's value dimensions interact with SDT's basic psychological needs across cultures?

## Primary Research Objectives

### Theoretical Foundation

- [ ] **THEO-01**: Identify where SDT need satisfaction and Schwartz value dimensions overlap in published theoretical models
- [ ] **THEO-02**: Map the proposed causal mechanisms linking values to need satisfaction across major theoretical frameworks

### Empirical Evidence

- [ ] **EMPR-01**: Synthesize empirical findings on the relationship between value orientations and basic psychological need satisfaction
- [ ] **EMPR-02**: Assess the strength and consistency of evidence for value-need interaction effects across study designs

### Cross-Cultural

- [ ] **CULT-01**: Compare patterns of value-need interaction across individualist and collectivist cultural contexts

## Secondary Research Objectives

### Methodological

- **METH-01**: Evaluate the psychometric properties of instruments used to measure both value orientations and need satisfaction simultaneously
- **METH-02**: Identify methodological limitations common across SDT-values integration studies

### Developmental

- **DEVL-01**: Trace how value-need interactions evolve across the lifespan
- **DEVL-02**: Identify critical periods where value formation intersects with need satisfaction patterns

## Out of Scope

| Topic | Reason |
|---------|--------|
| Intervention design | Applied research; this study maps the theoretical landscape |
| Clinical populations | Different need dynamics; separate study warranted |
| Non-Schwartz value models | Scope limited to Schwartz for coherence; other frameworks deferred |

## Traceability

| Objective | Inquiry | Status |
|-------------|-------|--------|
| THEO-01 | Inquiry 1 | Pending |
| THEO-02 | Inquiry 1 | Pending |
| EMPR-01 | Inquiry 2 | Pending |
| EMPR-02 | Inquiry 2 | Pending |
| CULT-01 | Inquiry 3 | Pending |

**Coverage:**
- Primary objectives: 5 total
- Mapped to inquiries: 5
- Unmapped: 0 ✓

---
*Research objectives defined: 2025-01-14*
*Last updated: 2025-01-14 after initial definition*
```

</example>
