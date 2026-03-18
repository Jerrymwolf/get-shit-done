---
project: [Project Name]
domain: [research domain]
date: YYYY-MM-DD
research_notes: 0
decisions: 0
---

# Terminal Deliverable: [Project Name]

<!-- This template produces a GSD --auto input format.
     Fill each section based on your research conclusions, decision log entries,
     and verification results. The output should be a self-contained build spec
     that feeds directly into `gsd --auto` for implementation. -->

## What I Want Built

<!-- Clear description of what to build, derived from research conclusions.
     State the deliverable in concrete terms -- what it does, not how to research it.
     This is the "elevator pitch" for the build phase.

     Sources: Synthesize from your research notes' Key Findings and Implications sections.
     Reference the most important decision log entries that shaped this description. -->

[Concrete description of the system/feature to build, based on research findings]

**Key research-backed constraints:**
- [Constraint from research, e.g. "Must use streaming API per `api-research_2026-03-11.md`"]
- [Constraint from decision, e.g. "PostgreSQL chosen over MongoDB per `db-decision_2026-03-11.md`"]

## Project Context

<!-- Environment, constraints, and team context from the research project.
     Include technical constraints discovered during research.
     Include organizational constraints from the project brief.

     Sources: Pull from research note Implications sections and Decision Log rationales. -->

**Environment:**
- [Runtime, platform, deployment target]
- [Key dependencies and their versions]

**Constraints:**
- [Technical constraints from research findings]
- [Budget/timeline constraints from project brief]
- [Compatibility requirements discovered during research]

**Team:**
- [Relevant team capabilities and experience]
- [Available tooling and infrastructure]

## Milestones

<!-- Phases derived from Decision Log entries and research findings.
     Each milestone should be independently verifiable.
     Order by dependency -- earlier milestones unblock later ones.

     Sources: Map each milestone to the decision(s) and research note(s) that justify it. -->

### Milestone 1: [Name]
- **Based on:** `decision-log-entry_2026-03-11.md`, `research-note_2026-03-11.md`
- **Deliverable:** [What is produced]
- **Depends on:** [Prerequisites, or "None"]

### Milestone 2: [Name]
- **Based on:** `decision-log-entry_2026-03-11.md`
- **Deliverable:** [What is produced]
- **Depends on:** Milestone 1

### Milestone 3: [Name]
- **Based on:** `research-note_2026-03-11.md`
- **Deliverable:** [What is produced]
- **Depends on:** Milestone 2

## Tool Usage

<!-- Tools, frameworks, and libraries recommended by research.
     Each recommendation should cite the research evidence.
     Include version constraints if research identified compatibility issues.

     Sources: Pull from research notes that evaluated tools/frameworks.
     Reference specific findings that justify each choice. -->

| Tool/Framework | Purpose | Evidence | Version |
|----------------|---------|----------|---------|
| [Tool name] | [What it does in this project] | `research-note_2026-03-11.md` | [Version or "latest"] |
| [Framework] | [Role in architecture] | `decision-log_2026-03-11.md` | [Version constraint] |

**Rejected alternatives:**
- [Tool X] -- rejected because [reason from research], see `note_2026-03-11.md`

## Verification Criteria

<!-- Testable criteria derived from research verification results.
     Each criterion should be pass/fail -- no subjective judgments.
     Map criteria back to the research questions they validate.

     Sources: Pull from verifyNote() results and research note Open Questions sections.
     Criteria should confirm that the build implements what the research recommended. -->

- [ ] [Criterion 1: specific, measurable, tied to research finding]
- [ ] [Criterion 2: specific, measurable, tied to decision rationale]
- [ ] [Criterion 3: specific, measurable, tied to tool evaluation]
- [ ] [Criterion 4: integration test confirming end-to-end flow]
- [ ] [Criterion 5: performance target from research benchmarks]

**Research confidence notes:**
- [Any open questions from research that affect verification]
- [Any low-confidence findings that need extra validation during build]
