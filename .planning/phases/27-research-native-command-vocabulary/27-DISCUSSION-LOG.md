# Phase 27: Research-Native Command Vocabulary - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 27-research-native-command-vocabulary
**Areas discussed:** Cross-reference replacement strategy, Workflow file handling, Test strategy, help.md command listing
**Mode:** Auto (--auto flag, all recommended defaults selected)

---

## Cross-Reference Replacement Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Two-pass (prefixed then bare) | First replace `/grd:old` → `/grd:new` (safe), then context-aware bare identifiers in workflows | ✓ |
| Single aggressive pass | sed all old names everywhere | |

**User's choice:** [auto] Two-pass (recommended — spec section 2.3 defines this approach)
**Notes:** The `/grd:` prefix makes command invocations unambiguous. Bare names in workflows need human-level context judgment.

---

## Workflow File Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Context-aware replacement | Only replace identifiers, not English prose | ✓ |
| Blind sed replacement | Replace all occurrences regardless of context | |

**User's choice:** [auto] Context-aware (recommended — spec provides verified file list)
**Notes:** Spec section 2.3B lists all 17 workflow files and which old refs each contains.

---

## Test Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Two test runs | After file renames, after cross-references | ✓ |
| Per-command test runs | Test after each individual rename | |
| Single final test run | All changes then one test | |

**User's choice:** [auto] Two test runs (recommended — balanced between safety and speed)
**Notes:** None.

---

## help.md Command Listing

| Option | Description | Selected |
|--------|-------------|----------|
| Only new names | Clean break, no transition | ✓ |
| Both old and new | Transition period with aliases | |

**User's choice:** [auto] Only new names (recommended — backward compat out of scope per PROJECT.md)
**Notes:** None.

---

## Claude's Discretion

- Exact commit granularity
- Order of cross-reference updates
- Whether to combine the two passes

## Deferred Ideas

None — discussion stayed within phase scope.
