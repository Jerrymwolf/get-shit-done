---
phase: 13
slug: workflow-sync
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-16
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in) |
| **Config file** | package.json test script |
| **Quick run command** | `node --test test/*.test.cjs` |
| **Full suite command** | `node --test test/*.test.cjs` |
| **Estimated runtime** | ~85 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/`
- **After every plan wave:** Run `node --test test/`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | WKFL-01/02 | file-exists | `ls get-shit-done-r/workflows/ui-phase.md get-shit-done-r/workflows/ui-review.md get-shit-done-r/templates/UI-SPEC.md get-shit-done-r/templates/copilot-instructions.md` | ✅ | ✅ green |
| 13-01-02 | 01 | 1 | EXEC-03/04/05 | file-exists | `ls get-shit-done-r/workflows/autonomous.md get-shit-done-r/workflows/node-repair.md get-shit-done-r/workflows/stats.md` | ✅ | ✅ green |
| 13-02-01 | 02 | 1 | WKFL-03 | grep + test | `grep -r '/gsd:' get-shit-done-r/workflows/ \| grep -v '/gsd-r:' \| grep -v 'gsd:xxx' \| wc -l` (expect 0) | ✅ | ✅ green |
| 13-02-02 | 02 | 1 | WKFL-03 | grep | `grep -r 'gsd-r-tools.cjs' get-shit-done-r/workflows/ \| head -5` | ✅ | ✅ green |
| 13-03-01 | 03 | 2 | WKFL-04 | grep + test | `grep -r '/gsd:' commands/gsd-r/ \| grep -v '/gsd-r:' \| grep -v 'gsd:xxx' \| grep -v 'name:' \| wc -l` (expect 0) | ✅ | ✅ green |
| 13-XX-XX | all | all | CORE-05 | unit | `node --test test/*.test.cjs` (164 pass, 0 fail) | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. This phase modifies markdown workflow/command files — no new test dependencies needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Research logic preserved in verify-phase.md | WKFL-03 | Source audit section requires semantic review | Verify two-tier verification (goal-backward + source audit) sections present |
| Namespace consistency across 70+ files | PATH-02 (Phase 14 validates) | Volume requires grep sweep | `grep -r '/gsd:' get-shit-done-r/ commands/` returns 0 matches |

*Most behaviors are verifiable via grep/file-exists — manual review limited to semantic preservation.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved

## Validation Audit 2026-03-16

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

All 6 verification tasks pass. 164 unit tests green. Zero namespace leaks confirmed.
