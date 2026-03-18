---
phase: 16
slug: config-schema-and-defaults
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in test runner (node --test) |
| **Config file** | none — uses existing test infrastructure from prior phases |
| **Quick run command** | `node --test test/config-schema.test.cjs` |
| **Full suite command** | `node --test test/config-schema.test.cjs test/state.test.cjs` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/config-schema.test.cjs`
- **After every plan wave:** Run `node --test test/config-schema.test.cjs test/state.test.cjs`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 16-01-01 | 01 | 1 | CFG-01 | unit | `node --test test/config-schema.test.cjs` | ❌ W0 | ⬜ pending |
| 16-01-02 | 01 | 1 | CFG-02 | unit | `node --test test/config-schema.test.cjs` | ❌ W0 | ⬜ pending |
| 16-01-03 | 01 | 1 | CFG-03 | unit | `node --test test/config-schema.test.cjs` | ❌ W0 | ⬜ pending |
| 16-01-04 | 01 | 1 | CFG-04, CFG-05 | unit | `node --test test/config-schema.test.cjs` | ❌ W0 | ⬜ pending |
| 16-01-05 | 01 | 1 | CFG-06 | unit | `node --test test/config-schema.test.cjs` | ❌ W0 | ⬜ pending |
| 16-01-06 | 01 | 1 | CFG-07 | unit | `node --test test/config-schema.test.cjs` | ❌ W0 | ⬜ pending |
| 16-01-07 | 01 | 1 | TRAP-05 | unit | `node --test test/config-schema.test.cjs` | ❌ W0 | ⬜ pending |
| 16-01-08 | 01 | 1 | TEST-04 | unit | `node --test test/config-schema.test.cjs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/config-schema.test.cjs` — stubs for CFG-01 through CFG-07, TRAP-05, TEST-04
- [ ] Test fixtures for v1.1 config (missing new fields) and v1.2 config (all fields present)

*Existing test infrastructure (node --test) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Scoping UX prompts display correctly | CFG-01 | Interactive CLI prompts require human verification | Run `/grd:new-research`, verify tier→type→epistemology order and skip behavior |
| Downgrade confirmation dialog | CFG-06 | Interactive confirmation with diff display | Run `/grd:settings`, change review type to lower rigor, verify confirmation shows toggle changes |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
