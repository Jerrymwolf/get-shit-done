---
phase: 11
slug: state-commands-and-remaining-modules
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in, Node.js) |
| **Config file** | none — uses default node:test discovery |
| **Quick run command** | `node --test` |
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
| 11-01-01 | 01 | 1 | CORE-02 | unit + regression | `node --test` | Yes (existing) | pending |
| 11-01-02 | 01 | 1 | CORE-02 | unit | `node --test test/state.test.cjs` | Partial — Wave 0 additions | pending |
| 11-02-01 | 02 | 1 | CORE-03 | unit + regression | `node --test` | Yes (existing) | pending |
| 11-02-02 | 02 | 1 | CORE-03 | unit | `node --test test/state.test.cjs` | Partial — Wave 0 additions | pending |
| 11-03-01 | 03 | 1 | CORE-05 | regression | `node --test` | Yes | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `test/state.test.cjs` — add test for export count (21 functions) to verify merge completeness
- [ ] `test/state.test.cjs` — add test for `cmdStateUpdateProgress` milestone scoping (if upstream changed it)
- [ ] Test for `cmdStats` basic output (can be added to state or e2e tests)
- [ ] Verify `gsd_r_state_version` appears in frontmatter after write

*Existing infrastructure covers regression testing (160 tests). Only new behavior tests are Wave 0.*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
