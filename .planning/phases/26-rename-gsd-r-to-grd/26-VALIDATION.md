---
phase: 26
slug: rename-gsd-r-to-grd
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 26 — Validation Strategy

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
| 26-01-01 | 01 | 1 | REN-01 | smoke | `test -d commands/grd && ! test -d commands/gsd-r` | ✅ | ⬜ pending |
| 26-01-02 | 01 | 1 | REN-02 | smoke | `ls agents/grd-*.md \| wc -l` (expect 16) | ✅ | ⬜ pending |
| 26-01-03 | 01 | 1 | REN-03 | smoke | `ls hooks/grd-*.js \| wc -l` (expect 3) | ✅ | ⬜ pending |
| 26-02-01 | 02 | 2 | REN-04 | grep | `grep -r "gsd-r\|GSD-R\|get-shit-done-r" --include="*.md" --include="*.js" --include="*.cjs" --include="*.json" . \| grep -v node_modules \| grep -v .planning \| grep -v package-lock` (expect 0) | ✅ | ⬜ pending |
| 26-02-02 | 02 | 2 | REN-05 | grep | `grep "GSD_CODEX_MARKER\|codexGsdPath" bin/install.js` (expect 0) | ✅ | ⬜ pending |
| 26-03-01 | 03 | 3 | REN-06 | grep | `grep "get-shit-done-r" .gitignore package.json` (expect 0) | ✅ | ⬜ pending |
| 26-03-02 | 03 | 3 | REN-07 | unit | `npm test` (all pass) | ✅ | ⬜ pending |
| 26-03-03 | 03 | 3 | REN-08 | file | `! test -f scripts/rename-gsd-to-gsd-r.cjs && ! test -f scripts/bulk-rename-planning.cjs` | ✅ | ⬜ pending |
| 26-03-04 | 03 | 3 | REN-09 | suite | `npm test` (all pass after full rename) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed — verification uses grep commands, file existence checks, and existing test suite.

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
