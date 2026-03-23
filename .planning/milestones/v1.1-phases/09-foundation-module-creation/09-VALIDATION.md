---
phase: 9
slug: foundation-module-creation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in test runner (node --test) |
| **Config file** | package.json scripts |
| **Quick run command** | `node --test test/model-profiles.test.cjs` |
| **Full suite command** | `node --test test/*.test.cjs` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/model-profiles.test.cjs`
- **After every plan wave:** Run `node --test test/*.test.cjs`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | FOUN-01 | unit | `node --test test/model-profiles.test.cjs` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | FOUN-04 | unit | `node --test test/model-profiles.test.cjs` | ❌ W0 | ⬜ pending |
| 09-01-03 | 01 | 1 | FOUN-05 | unit | `node --test test/model-profiles.test.cjs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/model-profiles.test.cjs` — stubs for FOUN-01, FOUN-04, FOUN-05
- [ ] Model profiles module created before tests can run

*Existing test infrastructure (node --test) covers framework needs.*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
