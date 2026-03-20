---
phase: 19
slug: plan-checker-enforcement
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-19
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in) |
| **Config file** | none — existing test runner at scripts/run-tests.cjs |
| **Quick run command** | `node --test test/plan-checker-rules.test.cjs` |
| **Full suite command** | `node scripts/run-tests.cjs` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/plan-checker-rules.test.cjs`
- **After every plan wave:** Run `node scripts/run-tests.cjs`
- **Before `/grd:verify-inquiry`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | PLAN-01, PLAN-02, TEST-03 | unit | `node --test test/plan-checker-rules.test.cjs` | yes (extending) | pending |
| 19-01-02 | 01 | 1 | PLAN-01 | integration | `node grd/bin/grd-tools.cjs init plan-inquiry 19 2>&1 \| grep -q '"plan_check_rigor"' && echo PASS \|\| echo FAIL` | n/a (CLI check) | pending |
| 19-02-01 | 02 | 2 | TRAP-02, PLAN-01 | grep | `grep -q 'CHECKPOINT: Review Type Mismatch' grd/workflows/plan-inquiry.md && grep -q 'PLAN_CHECK_RIGOR.*jq' grd/workflows/plan-inquiry.md && echo PASS \|\| echo FAIL` | n/a (workflow file) | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

None. All tests extend the existing `test/plan-checker-rules.test.cjs` file. No new test scaffolds needed before execution.

*Existing test infrastructure (node:test, run-tests.cjs) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| TRAP-02 checkpoint box displays correctly | TRAP-02 | Requires visual inspection of plan-inquiry flow | Run `/grd:plan-inquiry` on a test phase with rigor violations and verify checkpoint renders |
| Planner emits new XML blocks | PLAN-01 | Requires agent execution | Run `/grd:plan-inquiry` and verify plans contain `<search-strategy>`, `<criteria>`, `tier=` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 complete (no MISSING references)
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
