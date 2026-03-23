---
phase: 10
slug: core-library-sync
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-15
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in, Node.js) |
| **Config file** | none — uses default node:test discovery |
| **Quick run command** | `node --test test/core.test.cjs` |
| **Full suite command** | `node --test` |
| **Estimated runtime** | ~1 second |

---

## Sampling Rate

- **After every task commit:** Run `node --test`
- **After every plan wave:** Run `node --test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | CORE-01 | regression | `node --test` | Yes | pending |
| 10-01-02 | 01 | 1 | FOUN-02, FOUN-03 | unit | `node --test test/core.test.cjs` | No — created by Task 2 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [x] `test/core.test.cjs` — Task 2 in Plan 01 creates this file (TDD task: tests written before implementation is verified). Covers FOUN-02 (inherit profile), FOUN-03 (stripShippedMilestones, replaceInCurrentMilestone).

*Existing infrastructure covers regression testing (151 tests). Only new behavior tests are Wave 0.*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 2s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** signed
