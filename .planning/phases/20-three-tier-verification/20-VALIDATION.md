---
phase: 20
slug: three-tier-verification
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-20
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in) |
| **Config file** | none — existing test runner at scripts/run-tests.cjs |
| **Quick run command** | `node --test test/verify-sufficiency.test.cjs` |
| **Full suite command** | `node scripts/run-tests.cjs` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/verify-sufficiency.test.cjs`
- **After every plan wave:** Run `node scripts/run-tests.cjs`
- **Before `/grd:verify-inquiry`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | VER-01, VER-02 | unit | `node --test test/verify-sufficiency.test.cjs` | no (new) | pending |
| 20-01-02 | 01 | 1 | VER-01 | integration | `node grd/bin/grd-tools.cjs init verify-work 20 2>&1 \| grep -q '"skip_tier0"' && echo PASS \|\| echo FAIL` | n/a (CLI) | pending |
| 20-02-01 | 02 | 2 | VER-03, TRAP-03 | grep | `grep -q 'CHECKPOINT: Sufficiency Assessment' grd/workflows/verify-inquiry.md && grep -q 'skip-tier0' grd/workflows/verify-inquiry.md && echo PASS \|\| echo FAIL` | n/a (workflow) | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

None. New test file `test/verify-sufficiency.test.cjs` is created alongside implementation in Task 1. Existing test infrastructure covers framework needs.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| TRAP-03 checkpoint displays correctly | TRAP-03 | Requires visual inspection of verify-inquiry flow | Run `/grd:verify-inquiry` on an inquiry with insufficient evidence and verify checkpoint renders |
| Verifier agent runs three passes sequentially | VER-03 | Requires agent execution | Run `/grd:verify-inquiry` and verify VERIFICATION.md contains Tier 0, Tier 1, and Tier 2 sections |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 complete (no MISSING references)
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
