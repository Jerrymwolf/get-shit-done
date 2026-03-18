---
phase: 1
slug: fork-and-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in test runner + shell scripts |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `node --test test/*.test.cjs` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/*.test.cjs`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | FORK-01 | script | `ls commands/grd/ agents/grd/ workflows/ templates/ references/` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | FORK-02 | script | `grep -r '/grd:' commands/grd/ \| head -5` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | FORK-03 | script | `node -e "const p=require('./package.json'); console.log(p.name, p.bin)"` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | FORK-04 | script | `cat .gitattributes \| grep -c lfs` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | FOUN-01 | script | `node bin/grd-tools.cjs vault-write --test` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | FOUN-02 | unit | `node --test test/naming.test.cjs` | ❌ W0 | ⬜ pending |
| 1-02-03 | 02 | 1 | FOUN-03 | manual | Inspect template output | N/A | ⬜ pending |
| 1-02-04 | 02 | 1 | FOUN-04 | script | `node -e "const c=require('./.planning/config.json'); console.log(c.vault_path)"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/structure.test.cjs` — verify five-layer directory structure exists
- [ ] `test/naming.test.cjs` — verify file naming convention function
- [ ] `test/config.test.cjs` — verify config.json schema with vault_path

*Test infrastructure is scaffolding — this phase creates the project structure that later phases test more deeply.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Research note template quality | FOUN-03 | Template content is subjective | Create a note from template, verify all sections present and frontmatter valid |
| npm pack succeeds | FORK-03 | Requires npm registry interaction | Run `npm pack` and verify tarball contents |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
