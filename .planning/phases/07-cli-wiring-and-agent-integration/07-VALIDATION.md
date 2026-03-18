---
phase: 7
slug: cli-wiring-and-agent-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in, v20+) |
| **Config file** | none — uses `node --test` directly |
| **Quick run command** | `node --test test/state.test.cjs && node --test test/plan-checker-rules.test.cjs` |
| **Full suite command** | `node --test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/state.test.cjs && node --test test/plan-checker-rules.test.cjs`
- **After every plan wave:** Run `node --test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | KNOW-02 | integration | `node --test test/cli-routes.test.cjs` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | KNOW-03 | integration | `node --test test/cli-routes.test.cjs` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | ORCH-06 | integration | `node --test test/cli-routes.test.cjs` | ❌ W0 | ⬜ pending |
| 07-01-04 | 01 | 1 | VERI-04 | smoke | `node grd/bin/grd-tools.cjs verify research-plan test/fixtures/sample-plan.md` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 1 | ORCH-06 | manual-only | Prompt text review | N/A | ⬜ pending |
| 07-02-02 | 02 | 1 | SRC-04 | manual-only | Prompt text review | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/cli-routes.test.cjs` — CLI-level integration tests for new routes (state subcommands, verify research-plan, bootstrap generate) using `execFileSync`

*Existing unit tests cover library functions; Wave 0 adds CLI routing layer tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Plan-checker prompt calls `verify research-plan` | ORCH-06 | Markdown prompt content, not executable code | Verify `grd-plan-checker.md` contains `verify research-plan` invocation |
| Researcher agent prompts include `onUnavailable` wiring | SRC-04 | Markdown prompt content, not executable code | Verify all 4 researcher prompts contain `state add-gap` instructions |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
