---
phase: 27
slug: research-native-command-vocabulary
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 27 — Validation Strategy

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
- **Before `/grd:verify-inquiry`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 27-01-01 | 01 | 1 | CMD-01 | file | `test -f commands/grd/new-research.md && test -f commands/grd/scope-inquiry.md && test -f commands/grd/plan-inquiry.md && test -f commands/grd/conduct-inquiry.md && test -f commands/grd/verify-inquiry.md && test -f commands/grd/complete-study.md` | ✅ | ⬜ pending |
| 27-01-02 | 01 | 1 | CMD-05 | file | `! test -f commands/grd/new-project.md && ! test -f commands/grd/discuss-phase.md && ! test -f commands/grd/plan-phase.md && ! test -f commands/grd/execute-phase.md && ! test -f commands/grd/verify-work.md && ! test -f commands/grd/complete-milestone.md` | ✅ | ⬜ pending |
| 27-02-01 | 02 | 2 | CMD-02 | grep | `grep -rn "/grd:new-project\|/grd:discuss-phase\|/grd:plan-phase\|/grd:execute-phase\|/grd:verify-work\|/grd:complete-milestone" commands/ \| wc -l` (expect 0) | ✅ | ⬜ pending |
| 27-02-02 | 02 | 2 | CMD-03 | grep | `grep -rn "/grd:new-project\|/grd:discuss-phase\|/grd:plan-phase\|/grd:execute-phase\|/grd:verify-work\|/grd:complete-milestone" grd/workflows/ \| wc -l` (expect 0) | ✅ | ⬜ pending |
| 27-02-03 | 02 | 2 | CMD-04 | grep | `grep -rn "/grd:new-project\|/grd:discuss-phase\|/grd:plan-phase\|/grd:execute-phase\|/grd:verify-work\|/grd:complete-milestone" agents/ \| wc -l` (expect 0) | ✅ | ⬜ pending |
| 27-02-04 | 02 | 2 | CMD-06 | suite | `npm test` (all pass) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
