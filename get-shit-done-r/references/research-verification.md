# Research Verification

Two-tier verification criteria for GSD-R research notes. Verification runs in order: Tier 1 first, Tier 2 second. Both tiers must pass for a note to reach `final` status.

## Tier 1: Goal-Backward Verification (Primary)

**Question:** "What must be TRUE for this research question to be answered?"

This is the primary verification. It checks whether the research actually accomplished its goal. Tier 1 is evaluated before Tier 2 -- there is no point auditing source attachment if the research question is not answered.

### Process

For each note in the phase:

1. State the research question the note was meant to answer
2. List the conditions that must be TRUE for it to be answered
3. Check each condition against the note's content
4. If any condition is FALSE, identify what is missing or incomplete

### Example

```
Phase: Agent Architecture
Note: Orchestration-Frameworks.md
Research question: "Which orchestration framework is optimal for a 6-agent
pipeline on M4 16GB with local Gemma inference?"

Conditions:
- TRUE: "I can name the optimal framework and I have evidence"
- TRUE: "The recommendation accounts for overhead, local model support,
  and concordance routing"
- TRUE: "At least 3 frameworks were compared on the same criteria"
- FALSE: "Memory overhead per framework is documented with benchmarks"
  -> Missing: No concrete memory measurements found. Open Question added.
```

### Outcome

- All TRUE: Tier 1 passes. Proceed to Tier 2.
- Any FALSE: Note is incomplete. Generate fix tasks via `/gsd-r:quick`.

## Tier 2: Source Audit (Secondary)

**Purpose:** Structural completeness check. Equivalent to linting in code projects.

### Checklist

For each note in the phase, verify:

- [ ] **Frontmatter complete** -- all five fields present (project, domain, status, date, sources)
- [ ] **sources count accurate** -- frontmatter `sources` field matches actual file count in `-sources/` folder
- [ ] **"Implications for [Project]" section exists** and is substantive (not a placeholder)
- [ ] **References section lists primary sources** -- at minimum 3 primary sources (papers, repos, official docs -- not blog summaries or secondary commentary)
- [ ] **Every reference has a file** -- each entry in References corresponds to a file in the `-sources/` folder
- [ ] **SOURCE-LOG.md exists** -- present in the `-sources/` folder
- [ ] **SOURCE-LOG.md is complete** -- accounts for every source (acquired or documented failure)
- [ ] **No orphan files** -- no unreferenced files in `-sources/` (every file is either referenced in the note or documented in SOURCE-LOG.md)
- [ ] **No contradictions with BOOTSTRAP.md** -- if a finding contradicts an established finding from BOOTSTRAP.md, the contradiction is explicitly justified in the Analysis section
- [ ] **Status in STATE.md matches** -- the note's actual state matches what STATE.md reports

### Status Mapping

| Condition | Status |
|---|---|
| Tier 1 passes + Tier 2 passes | `final` |
| Tier 1 passes + Tier 2 has minor issues | `reviewed` |
| Tier 1 fails | `draft` (needs more research) |
| Sources missing | `draft` with source-incomplete flag in STATE.md |

## Fix Task Generation

When verification fails, generate targeted fix tasks using `/gsd-r:quick`:

- **Tier 1 failure:** Create a research task to fill the identified gap. The task should have specific sources and a focused research question.
- **Tier 2 failure (missing source):** Create an acquisition task targeting the specific missing source with the fallback chain.
- **Tier 2 failure (formatting):** Create a cleanup task -- these are fast and can be batched.

Fix tasks follow the same research task template with `<src>` blocks and verification criteria.

## Verification Order

```
1. Run Tier 1 (goal-backward) for all notes in the phase
   -> If any fail, generate fix tasks and re-execute
   -> If all pass, proceed to Tier 2

2. Run Tier 2 (source audit) for all notes in the phase
   -> If any fail, generate fix tasks and re-execute
   -> If all pass, phase verification complete

3. Update STATE.md with final note statuses
```

Verification is phase-scoped: all notes in a phase are verified together after all research tasks in that phase are complete.
