---
phase: 14
slug: path-standardization-and-final-verification
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-16
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in) |
| **Config file** | package.json test script |
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
| 14-01-01 | 01 | 1 | PATH-01 | grep | `grep -rn '\$HOME' get-shit-done-r/ agents/ commands/ hooks/ --include='*.md' \| grep '\.claude' \| wc -l` (expect 0) | ✅ | ✅ green |
| 14-01-02 | 01 | 1 | PATH-01 | grep | `grep -rn '"~/\.' get-shit-done-r/ agents/ commands/ hooks/ \| wc -l` (expect 0) | ✅ | ✅ green |
| 14-02-01 | 02 | 2 | PATH-02, PATH-03 | script | `node scripts/verify-rename.cjs` → PASS | ✅ | ✅ green |
| 14-02-02 | 02 | 2 | PATH-04 | unit | `node --test test/*.test.cjs` → 164 pass, 0 fail | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test framework or fixtures needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| install.js excluded from path replacement | PATH-01 | Semantic: $HOME is runtime code not stale ref | Verify install.js still contains $HOME references (intentional) |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved

## Validation Audit 2026-03-16

| Metric | Count |
|--------|-------|
| Gaps found | 1 |
| Resolved | 1 |
| Escalated | 0 |

Corrupted `<required_reading>` tag in execute-plan.md:5 fixed (stale gsd-tools.cjs text in XML attribute). verify-rename.cjs now PASS. 164 unit tests green.
