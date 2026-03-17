---
phase: 12
slug: templates-and-execution-rigor
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-16
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in, Node.js) + grep (template content) |
| **Config file** | none — uses default node:test discovery |
| **Quick run command** | `node --test` |
| **Full suite command** | `node --test test/*.test.cjs` |
| **Estimated runtime** | ~1 second |

---

## Sampling Rate

- **After every task commit:** Grep checks for expected content in modified templates + `node --test`
- **After every plan wave:** Run `node --test`
- **Before `/gsd:verify-work`:** Full suite must be green + template content verified
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-T1 | 01 | 1 | EXEC-01 | grep (template content) | `grep -c 'read_first' get-shit-done-r/templates/phase-prompt.md` | Yes | green |
| 12-01-T2 | 01 | 1 | EXEC-02 | grep (template content) | `grep -c 'MANDATORY read_first gate' get-shit-done-r/workflows/execute-plan.md` | Yes | green |
| 12-02-T1 | 02 | 1 | TMPL-02 | grep (template content) | `grep -c '<canonical_refs>' get-shit-done-r/templates/context.md` | Yes | green |
| 12-02-T2 | 02 | 1 | TMPL-01, TMPL-03, WKFL-05 | N/A verification | N/A (documented N/A decisions) | N/A | green |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

*None — this phase modifies markdown templates only. Existing test infrastructure covers regression. Template content correctness is verified via grep-based acceptance criteria in each plan task.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| phase-prompt.md has read_first field | EXEC-01 | Template file, not executable | `grep 'read_first' get-shit-done-r/templates/phase-prompt.md` (returns 6) |
| phase-prompt.md has acceptance_criteria | EXEC-01 | Template file | `grep 'acceptance_criteria' get-shit-done-r/templates/phase-prompt.md` (returns 10) |
| execute-plan.md has rigor gates | EXEC-02 | Workflow file | `grep 'MANDATORY read_first gate' get-shit-done-r/workflows/execute-plan.md` (returns 1) |
| context.md has canonical_refs | TMPL-02 | Template file | `grep '<canonical_refs>' get-shit-done-r/templates/context.md` (returns 1) |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 2s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved

---

## Validation Audit 2026-03-16

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

**Notes:** Phase 12 modifies markdown templates only (phase-prompt.md, execute-plan.md, context.md). All requirements are verified via grep-based content checks — the correct approach for non-executable template files. TMPL-01 and TMPL-03 are documented N/A (no upstream source exists). Regression coverage provided by existing test suite (164 tests, 0 failures). No automated test generation needed.
