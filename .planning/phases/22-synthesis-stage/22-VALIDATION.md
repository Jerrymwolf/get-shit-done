---
phase: 22
slug: synthesis-stage
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in) |
| **Config file** | none — uses node --test directly |
| **Quick run command** | `node --test test/tier-strip.test.cjs` |
| **Full suite command** | `node --test test/*.test.cjs` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/tier-strip.test.cjs` (quick check — existing tests still pass)
- **After plan completion:** Run `node --test test/*.test.cjs` (full suite)

---

## Validation Architecture

### Wave 0: Test Foundation
- Verify existing test infrastructure works
- Add synthesis-specific test file: `test/synthesize.test.cjs`

### Wave 1: Workflow & Agent Tests
- Test synthesize workflow readiness validation logic
- Test dependency ordering (themes before framework/gaps, all before argument)
- Test skip flag validation (--skip-themes, --skip-framework, --skip-gaps)
- Test TRAP-04 interactive gate options
- Test config.workflow.synthesis toggle behavior

### Wave 2: Integration Tests
- Test complete-study synthesis validation step
- Test deliverable_format field in PROJECT.md template
- Test model-profiles.cjs contains 4 new synthesis agent entries

---

## Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Synthesis agents can't find verified notes | Test note discovery logic with mock vault structure |
| Skip flags allow invalid dependency chains | Test that --skip-themes blocks framework/gaps |
| Complete-study proceeds without synthesis | Test validation gate checks config.workflow.synthesis |
