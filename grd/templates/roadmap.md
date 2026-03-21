# Research Design Template

Template for `.planning/ROADMAP.md`.

## Initial Research Design (v1.0 Greenfield)

```markdown
# Research Design: [Study Name]

## Overview

<!-- tier:guided -->
<!-- Write one paragraph describing the research journey from formulation to synthesis. This is a high-level narrative of what you plan to investigate, in what order, and why that order makes sense. -->
<!-- /tier:guided -->
<!-- tier:standard -->
[One paragraph describing the research journey from formulation to synthesis]
<!-- /tier:standard -->

## Lines of Inquiry

<!-- tier:guided -->
<!-- Each inquiry below represents a focused line of investigation into one aspect of your research questions. Later inquiries can depend on earlier ones if findings build on each other. Integer inquiries (1, 2, 3) are planned; decimal inquiries (2.1, 2.2) are urgent insertions added mid-study. -->
<!-- /tier:guided -->
<!-- tier:standard -->
**Inquiry Numbering:**
- Integer inquiries (1, 2, 3): Planned lines of investigation
- Decimal inquiries (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal inquiries appear between their surrounding integers in numeric order.
<!-- /tier:standard -->

- [ ] **Inquiry 1: [Name]** - [One-line description]
- [ ] **Inquiry 2: [Name]** - [One-line description]
- [ ] **Inquiry 3: [Name]** - [One-line description]
- [ ] **Inquiry 4: [Name]** - [One-line description]

## Inquiry Details

### Inquiry 1: [Name]
**Goal**: [What this inquiry investigates]
**Depends on**: Nothing (first inquiry)
**Requirements**: [REQ-01, REQ-02, REQ-03]  <!-- brackets optional, parser handles both formats -->
**Success Criteria** (what must be TRUE):
  1. [Observable outcome from the researcher's perspective]
  2. [Observable outcome from the researcher's perspective]
  3. [Observable outcome from the researcher's perspective]
**Plans**: [Number of plans, e.g., "3 plans" or "TBD"]

<!-- tier:guided -->
<!-- Each plan is a concrete work package within this inquiry. Plans are executed in order. The plan list is populated during the planning stage. -->
<!-- /tier:guided -->

Plans:
- [ ] 01-01: [Brief description of first plan]
- [ ] 01-02: [Brief description of second plan]
- [ ] 01-03: [Brief description of third plan]

### Inquiry 2: [Name]
**Goal**: [What this inquiry investigates]
**Depends on**: Inquiry 1
**Requirements**: [REQ-04, REQ-05]
**Success Criteria** (what must be TRUE):
  1. [Observable outcome from the researcher's perspective]
  2. [Observable outcome from the researcher's perspective]
**Plans**: [Number of plans]

Plans:
- [ ] 02-01: [Brief description]
- [ ] 02-02: [Brief description]

### Inquiry 2.1: Critical Fix (INSERTED)
**Goal**: [Urgent work inserted between inquiries]
**Depends on**: Inquiry 2
**Success Criteria** (what must be TRUE):
  1. [What the fix achieves]
**Plans**: 1 plan

Plans:
- [ ] 02.1-01: [Description]

### Inquiry 3: [Name]
**Goal**: [What this inquiry investigates]
**Depends on**: Inquiry 2
**Requirements**: [REQ-06, REQ-07, REQ-08]
**Success Criteria** (what must be TRUE):
  1. [Observable outcome from the researcher's perspective]
  2. [Observable outcome from the researcher's perspective]
  3. [Observable outcome from the researcher's perspective]
**Plans**: [Number of plans]

Plans:
- [ ] 03-01: [Brief description]
- [ ] 03-02: [Brief description]

### Inquiry 4: [Name]
**Goal**: [What this inquiry investigates]
**Depends on**: Inquiry 3
**Requirements**: [REQ-09, REQ-10]
**Success Criteria** (what must be TRUE):
  1. [Observable outcome from the researcher's perspective]
  2. [Observable outcome from the researcher's perspective]
**Plans**: [Number of plans]

Plans:
- [ ] 04-01: [Brief description]

## Progress

**Execution Order:**
Inquiries execute in numeric order: 2 → 2.1 → 2.2 → 3 → 3.1 → 4

| Inquiry | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. [Name] | 0/3 | Not started | - |
| 2. [Name] | 0/2 | Not started | - |
| 3. [Name] | 0/2 | Not started | - |
| 4. [Name] | 0/1 | Not started | - |
```

<guidelines>
**Initial planning (v1.0):**
- Inquiry count depends on granularity setting (coarse: 3-5, standard: 5-8, fine: 8-12)
- Each inquiry investigates a coherent line of research
- Inquiries can have 1+ search protocols (split if >3 tasks or multiple subsystems)
- Plans use naming: {phase}-{plan}-PLAN.md (e.g., 01-02-PLAN.md)
- No time estimates (this isn't enterprise PM)
- Progress table updated by execute workflow
- Plan count can be "TBD" initially, refined during planning

**Success criteria:**
- 2-5 observable outcomes per inquiry (from the researcher's perspective)
- Cross-checked against research objectives during research design creation
- Flow downstream to `must_haves` in plan-phase
- Verified by verify-phase after execution
- Format: "Researcher can [action]" or "[Finding/Synthesis] exists"

**After studies complete:**
- Collapse completed milestones in `<details>` tags
- Add new milestone sections for upcoming work
- Keep continuous inquiry numbering (never restart at 01)
</guidelines>

<status_values>
- `Not started` - Haven't begun
- `In progress` - Currently working
- `Complete` - Done (add completion date)
- `Deferred` - Pushed to later (with reason)
</status_values>

## Milestone-Grouped Research Design (After v1.0 Ships)

After completing first milestone, reorganize with milestone groupings:

```markdown
# Research Design: [Study Name]

## Milestones

- ✅ **v1.0 Initial Study** - Inquiries 1-4 (completed YYYY-MM-DD)
- 🚧 **v1.1 [Name]** - Inquiries 5-6 (in progress)
- 📋 **v2.0 [Name]** - Inquiries 7-10 (planned)

## Lines of Inquiry

<details>
<summary>✅ v1.0 Initial Study (Inquiries 1-4) - COMPLETED YYYY-MM-DD</summary>

### Inquiry 1: [Name]
**Goal**: [What this inquiry investigated]
**Plans**: 3 plans

Plans:
- [x] 01-01: [Brief description]
- [x] 01-02: [Brief description]
- [x] 01-03: [Brief description]

[... remaining v1.0 inquiries ...]

</details>

### 🚧 v1.1 [Name] (In Progress)

**Milestone Goal:** [What v1.1 investigates]

#### Inquiry 5: [Name]
**Goal**: [What this inquiry investigates]
**Depends on**: Inquiry 4
**Plans**: 2 plans

Plans:
- [ ] 05-01: [Brief description]
- [ ] 05-02: [Brief description]

[... remaining v1.1 inquiries ...]

### 📋 v2.0 [Name] (Planned)

**Milestone Goal:** [What v2.0 investigates]

[... v2.0 inquiries ...]

## Progress

| Inquiry | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 3/3 | Complete | YYYY-MM-DD |
| 2. Theoretical | v1.0 | 2/2 | Complete | YYYY-MM-DD |
| 5. Integration | v1.1 | 0/2 | Not started | - |
```

**Notes:**
- Milestone emoji: ✅ completed, 🚧 in progress, 📋 planned
- Completed milestones collapsed in `<details>` for readability
- Current/future milestones expanded
- Continuous inquiry numbering (01-99)
- Progress table includes milestone column
