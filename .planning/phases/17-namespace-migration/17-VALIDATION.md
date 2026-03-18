---
phase: 17
slug: namespace-migration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in test runner (node --test) |
| **Config file** | none — uses existing test infrastructure |
| **Quick run command** | `node --test test/namespace.test.cjs` |
| **Full suite command** | `node --test test/*.test.cjs` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/namespace.test.cjs`
- **After every plan wave:** Run `node --test test/*.test.cjs`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | NS-03, NS-04 | integration | `node --test test/namespace.test.cjs` | ❌ W0 | ⬜ pending |
| 17-01-02 | 01 | 1 | NS-01, NS-02 | integration | `node --test test/namespace.test.cjs` | ❌ W0 | ⬜ pending |
| 17-01-03 | 01 | 1 | NS-05 | integration | `node --test test/namespace.test.cjs` | ❌ W0 | ⬜ pending |
| 17-02-01 | 02 | 2 | NS-06, TEST-02 | unit | `node --test test/namespace.test.cjs` | ❌ W0 | ⬜ pending |
| 17-02-02 | 02 | 2 | NS-01 | integration | `node --test test/*.test.cjs` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/namespace.test.cjs` — namespace residual scan tests for NS-06 and TEST-02
- [ ] Test fixtures for expected zero-residual patterns (grd, grd, grd)

*Existing test infrastructure (node --test) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Command autocomplete shows grd: prefix | NS-01 | Depends on Claude Code skill registration | Type `/grd:` in Claude Code, verify autocomplete shows research-native names |
| Agent prompts use GRD terminology in output | NS-05 | Runtime LLM output cannot be unit-tested | Run a workflow, verify agent output uses GRD not GRD |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
