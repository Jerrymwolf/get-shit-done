---
phase: 21
slug: adaptive-communication
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-20
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in) |
| **Config file** | none — existing test runner at scripts/run-tests.cjs |
| **Quick run command** | `node --test test/tier-adaptation.test.cjs` |
| **Full suite command** | `node scripts/run-tests.cjs` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/tier-adaptation.test.cjs`
- **After every plan wave:** Run `node scripts/run-tests.cjs`
- **Before `/grd:verify-inquiry`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 21-01-01 | 01 | 1 | TEST-06 | unit | `node --test test/tier-adaptation.test.cjs` | no (new) | pending |
| 21-02-01 | 02 | 2 | TIER-02 | grep | `grep -c 'tier:guided' grd/templates/research-note.md && echo PASS` | n/a | pending |
| 21-03-01 | 03 | 2 | TIER-01, TIER-03, TIER-04 | grep | `grep -c 'tier-guided\|researcher_tier' grd/workflows/verify-inquiry.md && echo PASS` | n/a | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

None. New test file `test/tier-adaptation.test.cjs` is created alongside the strip utility implementation. Existing test infrastructure covers framework needs.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Guided tier output reads naturally | TIER-01 | Subjective quality assessment | Set researcher_tier=guided, run a workflow, read output for clarity |
| Expert tier output is terse | TIER-01 | Subjective quality assessment | Set researcher_tier=expert, run same workflow, verify minimal output |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 complete (no MISSING references)
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
