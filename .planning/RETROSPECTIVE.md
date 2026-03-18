# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — GRD MVP

**Shipped:** 2026-03-12
**Phases:** 8 | **Plans:** 15 | **Sessions:** ~4

### What Was Built
- Complete research-note workflow fork of GSD with atomic vault writes, source acquisition, and two-tier verification
- 4 specialized researcher subagents with plan-checker source discipline enforcement
- Full CLI tool layer (8 routes) connecting all library functions to agent-invocable commands
- 33 requirements satisfied across fork/foundation, vault, sources, agents, verification, output formats, CLI wiring, and traceability

### What Worked
- TDD approach throughout — failing tests first, then implementation — caught issues early and kept velocity high
- Dependency injection (toolRunner pattern) for all external calls eliminated flaky tests entirely
- Zero external dependencies kept the build simple and installation fast
- Phase-by-phase execution with clear dependency ordering prevented rework
- Gap-closure phases (7-8) after milestone audit caught tracking discrepancies before shipping

### What Was Inefficient
- SUMMARY frontmatter `requirements-completed` was not always populated by executors, requiring Phase 8 reconciliation
- ROADMAP.md plan checkboxes fell out of sync during rapid execution — need better executor discipline
- Phase 5 plans showed `TBD` in roadmap despite having been fully planned and executed

### Patterns Established
- CommonJS modules with node:test runner — zero-dep testing convention
- `cmd*` function naming for CLI-callable library functions
- `onUnavailable` callback pattern for loose coupling between modules
- Three-file reconciliation flow: SUMMARY → REQUIREMENTS.md → ROADMAP.md

### Key Lessons
1. Executor agents should update ALL tracking surfaces (REQUIREMENTS.md, ROADMAP.md checkboxes) at task completion time, not defer to a reconciliation phase
2. Plan-checker verification adds real value — caught missing requirement coverage and dependency issues before execution
3. Research phase before planning is worth the time even for "obvious" phases — Phase 7 research identified 5 pitfalls that would have caused debugging

### Cost Observations
- Model mix: ~70% opus (executors, planners), ~30% sonnet (verifiers, plan-checkers)
- Sessions: ~4 sessions across 2 days
- Notable: Phases 2-4 averaged 5 min/plan execution — very fast for TDD workflow

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~4 | 8 | Established TDD + zero-dep + gap-closure pattern |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 132+ | High (all library functions) | 0 (all node built-ins) |

### Top Lessons (Verified Across Milestones)

1. Gap-closure phases after audit are cheaper than fixing tracking debt incrementally
2. Zero external dependencies pays compound interest in reliability and test speed
