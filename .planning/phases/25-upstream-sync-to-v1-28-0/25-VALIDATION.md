---
phase: 25
slug: upstream-sync-to-v1-28-0
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 25 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in) |
| **Config file** | none — uses node --test directly |
| **Quick run command** | `node --test test/smoke.test.cjs` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/smoke.test.cjs`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 25-01-01 | 01 | 1 | SYNC-01 | integration | `npm test` | ✅ | ⬜ pending |
| 25-02-01 | 02 | 2 | SYNC-02 | integration | `npm test` | ✅ | ⬜ pending |
| 25-03-01 | 03 | 2 | SYNC-03 | integration | `npm test` | ✅ | ⬜ pending |
| 25-04-01 | 04 | 2 | SYNC-04 | integration | `npm test` | ✅ | ⬜ pending |
| 25-05-01 | 05 | 3 | SYNC-05 | unit | `grep 1.28.0 grd/VERSION` | ✅ | ⬜ pending |
| 25-06-01 | 06 | 3 | SYNC-06 | integration | `npm test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. 514+ tests already exist.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Research extensions preserved | SYNC-01 | Requires visual inspection of merged modules | Verify acquire.cjs, vault.cjs, verify-research.cjs functions still present and exported |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
