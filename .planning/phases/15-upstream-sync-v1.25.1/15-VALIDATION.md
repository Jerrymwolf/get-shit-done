---
phase: 15
slug: upstream-sync-v1-25-1
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in) |
| **Config file** | none — uses node --test directly |
| **Quick run command** | `node --test test/*.test.cjs` |
| **Full suite command** | `node --test test/*.test.cjs` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/*.test.cjs`
- **After every plan wave:** Run `node --test test/*.test.cjs`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | SYNC-01 | integration | `node --test test/*.test.cjs` | yes | pending |
| 15-01-02 | 01 | 1 | SYNC-01 | integration | `node --test test/*.test.cjs` | yes | pending |
| 15-02-01 | 02 | 2 | SYNC-03 | integration | `node --test test/*.test.cjs` | yes | pending |
| 15-03-01 | 03 | 3 | SYNC-05 | integration | `node --test test/*.test.cjs` | yes | pending |

*Status: pending*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. 164 tests across 9 test files already validate core module behavior, vault writes, source acquisition, plan-checker rules, state management, and bootstrap generation.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| VERSION file reads 1.25.1 | SYNC-05 | Simple file content check | `cat get-shit-done-r/VERSION` should output `1.25.1` |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
