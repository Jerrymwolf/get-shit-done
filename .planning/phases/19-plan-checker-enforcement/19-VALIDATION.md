---
phase: 19
slug: plan-checker-enforcement
status: draft
nyquist_compliant: false
wave_0_complete: false
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
| **Quick run command** | `node --test test/plan-checker-*.test.cjs` |
| **Full suite command** | `node scripts/run-tests.cjs` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/plan-checker-*.test.cjs`
- **After every plan wave:** Run `node scripts/run-tests.cjs`
- **Before `/grd:verify-inquiry`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | PLAN-01 | unit | `node --test test/plan-checker-rigor.test.cjs` | ❌ W0 | ⬜ pending |
| 19-01-02 | 01 | 1 | PLAN-01 | unit | `node --test test/plan-checker-rigor.test.cjs` | ❌ W0 | ⬜ pending |
| 19-02-01 | 02 | 1 | PLAN-02 | unit | `node --test test/plan-checker-graduated.test.cjs` | ❌ W0 | ⬜ pending |
| 19-03-01 | 03 | 2 | TRAP-02 | integration | `node --test test/plan-checker-gate.test.cjs` | ❌ W0 | ⬜ pending |
| 19-04-01 | 04 | 2 | TEST-03 | unit | `node --test test/plan-checker-*.test.cjs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/plan-checker-rigor.test.cjs` — stubs for PLAN-01 (RIGOR_LEVELS table, new check functions)
- [ ] `test/plan-checker-graduated.test.cjs` — stubs for PLAN-02 (position-based threshold, advisory vs blocking)
- [ ] `test/plan-checker-gate.test.cjs` — stubs for TRAP-02 (checkpoint presentation logic)

*Existing test infrastructure (node:test, run-tests.cjs) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| TRAP-02 checkpoint box displays correctly | TRAP-02 | Requires visual inspection of plan-inquiry flow | Run `/grd:plan-inquiry` on a test phase with rigor violations and verify checkpoint renders |
| Planner emits new XML blocks | PLAN-01 | Requires agent execution | Run `/grd:plan-inquiry` and verify plans contain `<search-strategy>`, `<criteria>`, `tier=` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
