# Phase 25: Upstream Sync to v1.28.0 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-22
**Phase:** 25-upstream-sync-to-v1-28-0
**Areas discussed:** New module strategy, Merge strategy, Workflow/agent scope, Tech debt pass

---

## New Module Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Adopt all | Copy all 5 new modules into grd/bin/lib/. They add capabilities without conflicting with research extensions. | ✓ |
| Evaluate each | Let the researcher analyze each module first, then decide per-module which to adopt | |
| Skip non-essential | Only adopt modules that existing workflows reference; defer the rest | |

**User's choice:** Adopt all (Recommended)
**Notes:** None — straightforward decision.

---

## Merge Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Diff v1.25.1 to v1.28.0 | Single diff across all 3 versions. Simpler, but larger deltas per file. | ✓ |
| Step through versions | Sync to v1.26, then v1.27, then v1.28 sequentially. Smaller diffs but 3x the work | |
| Upstream overwrite + re-apply | Take v1.28.0 files wholesale, then re-apply research extensions | |

**User's choice:** Diff v1.25.1 to v1.28.0 (Recommended)
**Notes:** Intermediate versions don't matter, only final state.

---

## Workflow/Agent Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full sync | Sync all upstream workflow, agent, and command changes. Adopt new files, update existing. | ✓ |
| Modules + commands only | Sync CJS modules and command files. Leave workflows/agents for a separate pass. | |
| Modules only | Only sync the 12 shared CJS modules + adopt 5 new ones. Minimal scope. | |

**User's choice:** Full sync (Recommended)
**Notes:** Same thoroughness as Phase 15.

---

## Tech Debt Pass

| Option | Description | Selected |
|--------|-------------|----------|
| Opportunistic | Fix items when already modifying the file during sync. No separate tasks. | ✓ |
| Dedicated cleanup pass | Separate plan/tasks specifically for tech debt after sync | |
| Defer to later | Carry the debt into v1.3. Focus sync on upstream changes only. | |

**User's choice:** Opportunistic (Recommended)
**Notes:** 5 items carried from v1.2 to clean up while modifying affected files.

---

## Claude's Discretion

- Exact order of module sync within each group
- How to handle unexpected upstream changes
- Commit granularity

## Deferred Ideas

None — discussion stayed within phase scope.
