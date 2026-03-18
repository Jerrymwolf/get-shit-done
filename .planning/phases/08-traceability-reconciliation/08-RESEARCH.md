# Phase 8: Traceability Reconciliation - Research

**Researched:** 2026-03-12
**Domain:** Documentation reconciliation (REQUIREMENTS.md, ROADMAP.md, SUMMARY frontmatter)
**Confidence:** HIGH

## Summary

Phase 8 is a pure documentation reconciliation phase. No code is written. The v1.0 milestone audit identified 12 requirements with status discrepancies across three tracking files: REQUIREMENTS.md (checkboxes and traceability table), ROADMAP.md (progress table and plan checkboxes), and Phase 5 SUMMARY files (empty `requirements-completed` frontmatter). The root cause is that plan executors completed code work but did not update upstream tracking documents.

The work is mechanical: read the audit report, cross-reference each discrepancy against actual SUMMARY files (which are the source of truth for what was built), and update the three tracking files to match reality. There are no judgment calls about whether requirements are satisfied -- the audit already made those determinations and Phase 7 closed the integration/wiring gaps. This phase closes the remaining traceability gaps.

**Primary recommendation:** Treat SUMMARY frontmatter as ground truth. Update REQUIREMENTS.md and ROADMAP.md to match what SUMMARYs claim, plus account for Phase 7's gap closures.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SRC-01 | Source Attachment Protocol | Claimed complete in 03-01-SUMMARY.md frontmatter. REQUIREMENTS.md checkbox needs checking, traceability status needs updating to Complete. |
| SRC-02 | Source acquisition fallback chain | Claimed complete in 03-01-SUMMARY.md frontmatter. Same fix as SRC-01. |
| SRC-03 | SOURCE-LOG.md per note | Claimed complete in 03-01-SUMMARY.md frontmatter. Same fix as SRC-01. |
| SRC-05 | Sources in original form | Claimed complete in 03-01-SUMMARY.md frontmatter. Same fix as SRC-01. |
| ORCH-01 | Discuss/plan/execute/verify loop | Audit confirms wiring exists. Phase 5 SUMMARYs need `requirements-completed` update. REQUIREMENTS.md checkbox + traceability need updating. |
| ORCH-02 | Fresh 200K subagent contexts | Inherited from GSD, confirmed wired. Same treatment as ORCH-01. |
| ORCH-03 | Wave parallelism | Inherited from GSD, confirmed wired. Same treatment as ORCH-01. |
| VERI-01 | Goal-backward verification (Tier 1) | `verifyTier1()` implemented in verify-research.cjs per 05-01-SUMMARY. Needs SUMMARY frontmatter + REQUIREMENTS.md updates. |
| VERI-02 | Source audit verification (Tier 2) | `verifyTier2()` implemented in verify-research.cjs per 05-01-SUMMARY. Same treatment as VERI-01. |
| VERI-03 | Two tiers run in order | Enforced in verify-research.cjs per 05-01-SUMMARY. Same treatment as VERI-01. |
</phase_requirements>

## Architecture Patterns

### Pattern: Three-File Reconciliation

The GRD project tracks requirement completion in three places:

1. **SUMMARY frontmatter** (`requirements-completed` arrays in phase SUMMARY files) -- this is the source of truth written at plan completion time
2. **REQUIREMENTS.md** (checkboxes `[x]`/`[ ]` and traceability table `Status` column) -- the user-facing requirements document
3. **ROADMAP.md** (phase checkboxes, plan checkboxes, progress table) -- the user-facing progress tracker

Reconciliation flows one direction: SUMMARY -> REQUIREMENTS.md -> ROADMAP.md.

### Exact Discrepancies Identified

#### Group A: Phase 3 Source Requirements (SRC-01, SRC-02, SRC-03, SRC-05)

**Current state in REQUIREMENTS.md:** Checkboxes are `[ ]` (unchecked). Traceability shows `Pending`.
**Current state in 03-01-SUMMARY.md:** `requirements-completed: [SRC-01, SRC-02, SRC-03, SRC-04, SRC-05]` -- claimed complete.
**Audit evidence:** Integration checker confirms all are wired. Code exists and tests pass.
**Action:** Check the boxes in REQUIREMENTS.md. Update traceability to `Complete`. Phase annotation should show `Phase 3` (no arrow needed since the gap was purely traceability).

#### Group B: Phase 5 Orchestration/Verification Requirements (ORCH-01, ORCH-02, ORCH-03, VERI-01, VERI-02, VERI-03)

**Current state in REQUIREMENTS.md:** Checkboxes are `[ ]` (unchecked). Traceability shows `Pending`.
**Current state in 05-01-SUMMARY.md:** No `requirements-completed` frontmatter key exists. Empty.
**Current state in 05-02-SUMMARY.md:** No `requirements-completed` frontmatter key exists. Empty.
**Audit evidence:** Code exists (verifyTier1, verifyTier2, verifyNote in verify-research.cjs; workflow wiring in 05-02). Integration checker confirms all wired. ORCH-02 and ORCH-03 are inherited from GSD.
**Action:**
  - Add `requirements-completed: [ORCH-01, VERI-01, VERI-02, VERI-03]` to 05-01-SUMMARY.md frontmatter (these are the requirements that plan 01 implemented)
  - Add `requirements-completed: [ORCH-02, ORCH-03]` to 05-02-SUMMARY.md frontmatter (these are inherited/wired orchestration features confirmed in plan 02)
  - Check the boxes in REQUIREMENTS.md
  - Update traceability to `Complete`

#### Group C: ROADMAP.md Staleness

**Phase checkbox discrepancies:**
- Phase 2 line: `- [ ] **Phase 2: Vault Write and State**` should be `- [x]` (2/2 plans complete)
- Phase 5 line: `- [ ] **Phase 5: Verification and Workflows**` should be `- [x]` (2/2 plans complete, per SUMMARY files)
- Phase 7 line: `- [ ] **Phase 7: CLI Wiring and Agent Integration**` should be `- [x]` (2/2 plans complete)
- Phase 8 line: remains `- [ ]` (not yet complete)

**Plan checkbox discrepancies:**
- Phase 4 plan 04-01: Shows `- [ ] 04-01-PLAN.md` but 04-01-SUMMARY.md exists. Should be `- [x]`
- Phase 5 plans: Show `- [ ] 05-01: TBD` and `- [ ] 05-02: TBD`. Should be `- [x] 05-01-PLAN.md` and `- [x] 05-02-PLAN.md` with descriptions
- Phase 6 plan: Shows `- [ ] 06-01: TBD`. Should be `- [x] 06-01-PLAN.md` with description
- Phase 8 plans: Will need plan entries added once plans are created

**Progress table discrepancies:**
- Phase 5: Shows `0/?` and `Not started`. Should show `2/2` and `Complete` with date `2026-03-11`
- Phase 8: Shows `0/?` and `Not started`. Will update to reflect actual status after this phase

**Phase detail sections:**
- Phase 2: Plans section shows `Plans: TBD` but should show plan count
- Phase 3: Plans section shows `Plans: TBD`
- Phase 5: Plans section shows `Plans: TBD` and plan entries need updating
- Phase 6: Plans section shows `Plans: TBD`

#### Group D: REQUIREMENTS.md Traceability Table

The traceability table needs these specific status changes:

| Requirement | Current Phase Column | Current Status | New Status |
|-------------|---------------------|----------------|------------|
| SRC-01 | Phase 3 -> Phase 8 (traceability) | Pending | Complete |
| SRC-02 | Phase 3 -> Phase 8 (traceability) | Pending | Complete |
| SRC-03 | Phase 3 -> Phase 8 (traceability) | Pending | Complete |
| SRC-05 | Phase 3 -> Phase 8 (traceability) | Pending | Complete |
| ORCH-01 | Phase 5 -> Phase 8 (traceability) | Pending | Complete |
| ORCH-02 | Phase 5 -> Phase 8 (traceability) | Pending | Complete |
| ORCH-03 | Phase 5 -> Phase 8 (traceability) | Pending | Complete |
| VERI-01 | Phase 5 -> Phase 8 (traceability) | Pending | Complete |
| VERI-02 | Phase 5 -> Phase 8 (traceability) | Pending | Complete |
| VERI-03 | Phase 5 -> Phase 8 (traceability) | Pending | Complete |

The Phase column annotations (e.g., `Phase 3 -> Phase 8 (traceability)`) should be simplified to just the implementing phase (e.g., `Phase 3`) since the traceability gap is being closed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Automated reconciliation script | A script that parses and patches markdown | Manual edits to three files | The edits are mechanical but few (~30 line changes total). A script would take longer to write and verify than the edits themselves. |

## Common Pitfalls

### Pitfall 1: Updating REQUIREMENTS.md Checkboxes Without Updating Traceability Table
**What goes wrong:** The checkbox section says `[x]` but the traceability table at the bottom still says `Pending`.
**Why it happens:** They are in separate sections of the same file, easy to miss one.
**How to avoid:** Always update both sections in the same edit. The traceability table is at the bottom of REQUIREMENTS.md.

### Pitfall 2: Incorrect SUMMARY Frontmatter Key
**What goes wrong:** Using wrong key name (e.g., `requirements_completed` with underscore vs `requirements-completed` with hyphen).
**How to avoid:** Match the existing convention from 03-01-SUMMARY.md which uses `requirements-completed` (hyphen).

### Pitfall 3: Assigning Requirements to Wrong SUMMARY File
**What goes wrong:** Putting VERI-01 in 05-02-SUMMARY.md when it was actually implemented in 05-01-PLAN.md.
**Why it happens:** Not checking which plan actually implemented each requirement.
**How to avoid:** Cross-reference the audit report's `claimed_by_plans` field. VERI-01/02/03 map to 05-01 (verification engine). ORCH-01/02/03 split: ORCH-01 spans both plans (loop wiring), ORCH-02/03 are inherited (confirmed in 05-02).

### Pitfall 4: Leaving Phase Arrow Annotations in Traceability
**What goes wrong:** Traceability says `Phase 3 -> Phase 8 (traceability) | Complete` which is confusing -- the arrow implies ongoing work.
**How to avoid:** Simplify to just `Phase 3 | Complete` since the reconciliation is the final state.

### Pitfall 5: Not Updating ROADMAP Plan Descriptions
**What goes wrong:** Phase 5 plans still show `05-01: TBD` and `05-02: TBD` even though the plans have descriptions.
**How to avoid:** Pull plan descriptions from the actual PLAN.md files or SUMMARY files.

## Code Examples

### SUMMARY Frontmatter Addition (05-01-SUMMARY.md)

The existing frontmatter for 05-01-SUMMARY.md has no `requirements-completed` key. Add it after the existing keys:

```yaml
---
phase: 05-verification-and-workflows
plan: 01
subsystem: verification
tags: [tdd, verification, research-quality, source-audit]
# ... existing keys ...
requirements-completed: [ORCH-01, VERI-01, VERI-02, VERI-03]
duration: 15min
completed: 2026-03-11
---
```

### SUMMARY Frontmatter Addition (05-02-SUMMARY.md)

```yaml
---
phase: 05-verification-and-workflows
plan: 02
completed: 2026-03-11
status: complete
tasks_completed: 3
tasks_total: 3
requirements-completed: [ORCH-02, ORCH-03]
key_files:
  - agents/grd-verifier.md
  - grd/workflows/verify-phase.md
---
```

### REQUIREMENTS.md Checkbox Changes

From:
```markdown
- [ ] **SRC-01**: Source Attachment Protocol...
```
To:
```markdown
- [x] **SRC-01**: Source Attachment Protocol...
```

Same pattern for: SRC-02, SRC-03, SRC-05, ORCH-01, ORCH-02, ORCH-03, VERI-01, VERI-02, VERI-03

### ROADMAP.md Phase Checkbox Changes

From:
```markdown
- [ ] **Phase 2: Vault Write and State**...
- [ ] **Phase 5: Verification and Workflows**...
- [ ] **Phase 7: CLI Wiring and Agent Integration**...
```
To:
```markdown
- [x] **Phase 2: Vault Write and State**...
- [x] **Phase 5: Verification and Workflows**...
- [x] **Phase 7: CLI Wiring and Agent Integration**...
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual verification (documentation-only phase) |
| Config file | N/A |
| Quick run command | `grep -c '\- \[x\]' .planning/REQUIREMENTS.md` (count checked boxes) |
| Full suite command | Manual cross-reference of all three files |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SRC-01 | REQUIREMENTS.md checkbox checked | manual | `grep 'SRC-01' .planning/REQUIREMENTS.md` | N/A |
| SRC-02 | REQUIREMENTS.md checkbox checked | manual | `grep 'SRC-02' .planning/REQUIREMENTS.md` | N/A |
| SRC-03 | REQUIREMENTS.md checkbox checked | manual | `grep 'SRC-03' .planning/REQUIREMENTS.md` | N/A |
| SRC-05 | REQUIREMENTS.md checkbox checked | manual | `grep 'SRC-05' .planning/REQUIREMENTS.md` | N/A |
| ORCH-01 | Checkbox + SUMMARY frontmatter | manual | `grep 'ORCH-01' .planning/REQUIREMENTS.md` | N/A |
| ORCH-02 | Checkbox + SUMMARY frontmatter | manual | `grep 'ORCH-02' .planning/REQUIREMENTS.md` | N/A |
| ORCH-03 | Checkbox + SUMMARY frontmatter | manual | `grep 'ORCH-03' .planning/REQUIREMENTS.md` | N/A |
| VERI-01 | Checkbox + SUMMARY frontmatter | manual | `grep 'VERI-01' .planning/REQUIREMENTS.md` | N/A |
| VERI-02 | Checkbox + SUMMARY frontmatter | manual | `grep 'VERI-02' .planning/REQUIREMENTS.md` | N/A |
| VERI-03 | Checkbox + SUMMARY frontmatter | manual | `grep 'VERI-03' .planning/REQUIREMENTS.md` | N/A |

### Sampling Rate
- **Per task commit:** Visual inspection of changed lines
- **Per wave merge:** Cross-reference all three files against audit report
- **Phase gate:** All 33 requirements show consistent status across REQUIREMENTS.md checkboxes, traceability table, and SUMMARY frontmatter

### Wave 0 Gaps
None -- this is a documentation-only phase with no test infrastructure needed.

## Complete Edit Inventory

### File 1: `.planning/REQUIREMENTS.md`
- **10 checkbox changes:** SRC-01, SRC-02, SRC-03, SRC-05, ORCH-01, ORCH-02, ORCH-03, VERI-01, VERI-02, VERI-03 from `[ ]` to `[x]`
- **10 traceability table changes:** Same 10 requirements from `Pending` to `Complete`, simplify phase annotations

### File 2: `.planning/phases/05-verification-and-workflows/05-01-SUMMARY.md`
- **1 frontmatter addition:** Add `requirements-completed: [ORCH-01, VERI-01, VERI-02, VERI-03]`

### File 3: `.planning/phases/05-verification-and-workflows/05-02-SUMMARY.md`
- **1 frontmatter addition:** Add `requirements-completed: [ORCH-02, ORCH-03]`

### File 4: `.planning/ROADMAP.md`
- **3 phase checkbox changes:** Phase 2, 5, 7 from `[ ]` to `[x]`
- **1 plan checkbox change:** Phase 4 plan 04-01 from `[ ]` to `[x]`
- **4 plan entry updates:** Phase 5 plans (2), Phase 6 plan (1) -- add descriptions, check boxes
- **1 progress table fix:** Phase 5 row from `0/?`/`Not started` to `2/2`/`Complete`/`2026-03-11`
- **3+ plan count updates:** Phase 2, 3, 5, 6 detail sections from `Plans: TBD` to actual counts

**Total: ~30 discrete edits across 4 files.**

## Sources

### Primary (HIGH confidence)
- `.planning/v1.0-MILESTONE-AUDIT.md` -- comprehensive gap analysis identifying all discrepancies
- `.planning/REQUIREMENTS.md` -- current state of checkboxes and traceability table
- `.planning/ROADMAP.md` -- current state of progress tracking
- `.planning/phases/05-verification-and-workflows/05-01-SUMMARY.md` -- missing requirements-completed
- `.planning/phases/05-verification-and-workflows/05-02-SUMMARY.md` -- missing requirements-completed
- `.planning/phases/03-source-acquisition/03-01-SUMMARY.md` -- has requirements-completed (reference format)

## Metadata

**Confidence breakdown:**
- Discrepancy identification: HIGH -- directly verified by reading all source files
- Edit inventory: HIGH -- enumerated every change against current file contents
- Requirement attribution: HIGH -- cross-referenced audit `claimed_by_plans` with SUMMARY content

**Research date:** 2026-03-12
**Valid until:** N/A (one-time reconciliation, not technology research)
