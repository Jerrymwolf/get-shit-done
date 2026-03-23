# Phase 9: Foundation Module Creation - Research

**Researched:** 2026-03-15
**Domain:** CommonJS module extraction, model profile data structures, version tracking
**Confidence:** HIGH

## Summary

Phase 9 creates `get-shit-done-r/bin/lib/model-profiles.cjs` as a standalone module that mirrors the upstream API surface exactly, but with `gsd-r-*` agent name prefixes and additional research-specific agents. The module exports `MODEL_PROFILES`, `VALID_PROFILES`, `formatAgentToModelMapAsTable`, and `getAgentToModelMapForProfile`. A `get-shit-done-r/VERSION` file is also created containing `1.24.0`.

The upstream reference implementation at `~/.claude/get-shit-done/bin/lib/model-profiles.cjs` is 68 lines of straightforward CommonJS -- a data constant plus two utility functions. The GSD-R version adds 7 agents to the upstream's 15 (3 UI agents already present upstream, plus 4 GSD-R-only research agents from the codebase). core.cjs is NOT modified in this phase; it keeps its inline MODEL_PROFILES until Phase 10 rewires the import.

**Primary recommendation:** Copy upstream's model-profiles.cjs structure verbatim, replace all `gsd-` prefixes with `gsd-r-`, add the 4 research agents with tier assignments from CONTEXT.md, and write comprehensive tests covering profile resolution, edge cases, and the VERSION file.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Include all 15 upstream agents with `gsd-r-*` prefixes (including ui-researcher, ui-checker, ui-auditor -- Phase 13 UI workflows will need them)
- Add GSD-R-only research agents: `gsd-r-source-researcher`, and any others the codebase actually invokes
- Profile tier assignments for research agents match their closest upstream analogue:
  - `gsd-r-source-researcher` matches `gsd-r-phase-researcher` (opus/sonnet/haiku)
  - `gsd-r-verify-research` matches `gsd-r-verifier` (sonnet/sonnet/haiku)
- Match upstream's exact API surface: `MODEL_PROFILES`, `VALID_PROFILES`, `formatAgentToModelMapAsTable`, `getAgentToModelMapForProfile`
- Same function signatures as upstream -- only the data differs (gsd-r-* agent names + research agents added)
- core.cjs is left untouched -- it keeps its inline MODEL_PROFILES until Phase 10 rewires it to import from model-profiles.cjs
- VERSION file: plain text containing `1.24.0` (single line, no trailing metadata)
- Location: `get-shit-done-r/VERSION` (inside the distributable package)

### Claude's Discretion
- Exact test structure (test file naming, assertion patterns)
- Whether to add a helper function for reading VERSION at runtime
- How to handle edge cases in profile resolution (unknown agent names, missing profiles)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | Create model-profiles.cjs with GSD-R agent entries (gsd-r-source-researcher, gsd-r-verifier, etc.) | Full upstream API surface documented; complete agent roster identified (19 agents); tier assignments specified |
| FOUN-04 | Add VERSION file tracking upstream base version (1.24.0) | Simple plain text file at `get-shit-done-r/VERSION`; optional runtime reader helper |
| FOUN-05 | Tests verify model profile resolution, inheritance, and milestone filtering | Test patterns documented; specific test cases enumerated for profile resolution and edge cases |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| node:test | built-in (Node 22) | Test runner | Already used by all existing tests in this project |
| node:assert/strict | built-in (Node 22) | Assertions | Already used by all existing tests |
| node:fs | built-in | File reading (VERSION) | Zero-dependency project policy |
| node:path | built-in | Path joining | Zero-dependency project policy |

### Supporting
No external dependencies. This project has a strict zero-external-dependency policy for runtime code.

### Alternatives Considered
None -- the stack is fully determined by project conventions (CommonJS, node built-ins only).

## Architecture Patterns

### File Location
```
get-shit-done-r/
├── bin/
│   └── lib/
│       ├── model-profiles.cjs   # NEW — Phase 9 deliverable
│       └── core.cjs             # UNCHANGED — keeps inline MODEL_PROFILES until Phase 10
├── VERSION                      # NEW — contains "1.24.0"
test/
└── model-profiles.test.cjs      # NEW — Phase 9 tests
```

### Pattern 1: Exact Upstream API Mirroring
**What:** The new model-profiles.cjs must export the same 4 symbols with identical function signatures as upstream.
**When to use:** Always -- this is a locked decision.

Upstream exports (from `~/.claude/get-shit-done/bin/lib/model-profiles.cjs`):
```javascript
module.exports = {
  MODEL_PROFILES,        // Object<string, {quality: string, balanced: string, budget: string}>
  VALID_PROFILES,        // string[] — derived from MODEL_PROFILES keys of first agent
  formatAgentToModelMapAsTable,  // (agentToModelMap: Object<string, string>) => string
  getAgentToModelMapForProfile,  // (normalizedProfile: string) => Object<string, string>
};
```

### Pattern 2: CommonJS Module with Bottom Exports
**What:** All project modules use `module.exports = { ... }` at the bottom of the file.
**When to use:** Always for `.cjs` files in this project.

### Pattern 3: Test File Conventions
**What:** Tests live in `test/` directory, named `{module}.test.cjs`, use `node:test` with `describe`/`it`/`assert.equal`/`assert.deepEqual`.
**When to use:** All new test files.

Example from existing codebase (`test/vault.test.cjs`):
```javascript
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
// ... require module under test ...

describe('functionName', () => {
  it('describes expected behavior', () => {
    const result = functionUnderTest(input);
    assert.equal(result, expected);
  });
});
```

### Anti-Patterns to Avoid
- **Modifying core.cjs:** This phase creates model-profiles.cjs as a standalone file. core.cjs is NOT touched until Phase 10.
- **Using `gsd-` without `-r-` prefix:** All agent names MUST use `gsd-r-*` prefix. The upstream uses `gsd-*`.
- **Adding external dependencies:** Project policy is zero external deps.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table formatting | Custom table renderer | Copy upstream's `formatAgentToModelMapAsTable` exactly | Upstream version handles column width calculation correctly with Unicode box-drawing characters |
| Profile validation | Custom validator | Derive `VALID_PROFILES` from data: `Object.keys(MODEL_PROFILES['gsd-r-planner'])` | Upstream pattern; keeps valid profiles in sync with data automatically |

## Common Pitfalls

### Pitfall 1: Agent Name Prefix Mismatch
**What goes wrong:** Using `gsd-` instead of `gsd-r-` for agent keys, or mixing both styles.
**Why it happens:** Copy-pasting from upstream without renaming.
**How to avoid:** After creating the file, verify every key in MODEL_PROFILES starts with `gsd-r-`. A test should assert this.
**Warning signs:** `resolveModelInternal` returning `'sonnet'` fallback for agents that should resolve to specific models.

### Pitfall 2: Missing Research Agents
**What goes wrong:** Only including the 12 agents currently in core.cjs, forgetting the 3 UI agents and 4 research-specific agents.
**Why it happens:** Copying from current core.cjs instead of building the complete roster.
**How to avoid:** The full roster is 19 agents (see Code Examples section below). Cross-reference with upstream's 15 + 4 GSD-R-only.
**Warning signs:** Agent file exists in `agents/` directory but has no MODEL_PROFILES entry.

### Pitfall 3: VALID_PROFILES Derivation Key
**What goes wrong:** Using a research agent key to derive VALID_PROFILES instead of a standard agent.
**Why it happens:** Alphabetical ordering might put a research agent first.
**How to avoid:** Explicitly use `MODEL_PROFILES['gsd-r-planner']` as the derivation key (matching upstream pattern of using the planner).

### Pitfall 4: VERSION File Trailing Newline
**What goes wrong:** Adding trailing newline, BOM, or metadata to VERSION file.
**Why it happens:** Text editors auto-add newlines; developers add metadata "for context."
**How to avoid:** Decision is locked: single line, plain text, `1.24.0` only. Test should verify exact content.

## Code Examples

### Complete Agent Roster (19 agents)

The full MODEL_PROFILES data combining upstream's 15 agents (renamed to `gsd-r-*`) plus 4 GSD-R-only research agents:

```javascript
// Source: Upstream model-profiles.cjs (15 agents) + CONTEXT.md decisions (4 research agents)
const MODEL_PROFILES = {
  // --- Upstream agents (renamed gsd-* -> gsd-r-*) ---
  'gsd-r-planner':              { quality: 'opus',   balanced: 'opus',   budget: 'sonnet' },
  'gsd-r-roadmapper':           { quality: 'opus',   balanced: 'sonnet', budget: 'sonnet' },
  'gsd-r-executor':             { quality: 'opus',   balanced: 'sonnet', budget: 'sonnet' },
  'gsd-r-phase-researcher':     { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-project-researcher':   { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-research-synthesizer': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-debugger':             { quality: 'opus',   balanced: 'sonnet', budget: 'sonnet' },
  'gsd-r-codebase-mapper':      { quality: 'sonnet', balanced: 'haiku',  budget: 'haiku' },
  'gsd-r-verifier':             { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-plan-checker':         { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-integration-checker':  { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-nyquist-auditor':      { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-ui-researcher':        { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-ui-checker':           { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-ui-auditor':           { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  // --- GSD-R-only research agents ---
  'gsd-r-source-researcher':       { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },  // matches phase-researcher
  'gsd-r-methods-researcher':      { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },  // matches phase-researcher
  'gsd-r-architecture-researcher': { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },  // matches phase-researcher
  'gsd-r-limitations-researcher':  { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },  // matches phase-researcher
};
```

**Note on research agents:** The CONTEXT.md specifies `gsd-r-source-researcher` and "any others the codebase actually invokes." The `agents/` directory contains 4 research-specific agents: `gsd-r-source-researcher`, `gsd-r-methods-researcher`, `gsd-r-architecture-researcher`, `gsd-r-limitations-researcher`. All 4 should be included. The CONTEXT.md also mentions `gsd-r-verify-research` matching verifier tier -- however, `verify-research` is a library module (`get-shit-done-r/bin/lib/verify-research.cjs`), not an agent. It does not appear in `agents/` and is not invoked via `resolveModelInternal`. It should NOT be added to MODEL_PROFILES unless it is actually used as an agent name in model resolution. This is a discretionary call -- recommend omitting it since no code resolves it as an agent.

### Utility Functions (copy from upstream verbatim)

```javascript
// Source: ~/.claude/get-shit-done/bin/lib/model-profiles.cjs
const VALID_PROFILES = Object.keys(MODEL_PROFILES['gsd-r-planner']);

function formatAgentToModelMapAsTable(agentToModelMap) {
  const agentWidth = Math.max('Agent'.length, ...Object.keys(agentToModelMap).map((a) => a.length));
  const modelWidth = Math.max(
    'Model'.length,
    ...Object.values(agentToModelMap).map((m) => m.length)
  );
  const sep = '\u2500'.repeat(agentWidth + 2) + '\u253C' + '\u2500'.repeat(modelWidth + 2);
  const header = ' ' + 'Agent'.padEnd(agentWidth) + ' \u2502 ' + 'Model'.padEnd(modelWidth);
  let agentToModelTable = header + '\n' + sep + '\n';
  for (const [agent, model] of Object.entries(agentToModelMap)) {
    agentToModelTable += ' ' + agent.padEnd(agentWidth) + ' \u2502 ' + model.padEnd(modelWidth) + '\n';
  }
  return agentToModelTable;
}

function getAgentToModelMapForProfile(normalizedProfile) {
  const agentToModelMap = {};
  for (const [agent, profileToModelMap] of Object.entries(MODEL_PROFILES)) {
    agentToModelMap[agent] = profileToModelMap[normalizedProfile];
  }
  return agentToModelMap;
}
```

### VERSION File

```
1.24.0
```

Location: `get-shit-done-r/VERSION`

### Optional: VERSION Reader Helper

```javascript
// Discretionary -- recommended for future use in Phase 10+
function getVersion() {
  const versionPath = path.join(__dirname, '..', '..', 'VERSION');
  try {
    return fs.readFileSync(versionPath, 'utf-8').trim();
  } catch {
    return 'unknown';
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline MODEL_PROFILES in core.cjs | Extracted to model-profiles.cjs | Upstream v1.22.4 -> v1.24.0 | Enables independent profile management; core.cjs imports from module |
| 12 agents in GSD-R core.cjs | 15 upstream + 4 research = 19 agents | This phase | Full agent coverage including UI and research agents |

## Open Questions

1. **Should `gsd-r-verify-research` be in MODEL_PROFILES?**
   - What we know: CONTEXT.md mentions it with verifier tier mapping. However, `verify-research` is a library module, not an agent. No code in `init.cjs` resolves it via `resolveModelInternal`.
   - What's unclear: Whether any future workflow will invoke it as a subagent with model resolution.
   - Recommendation: Omit from MODEL_PROFILES for now. It can be added later if a workflow needs it. Including unused entries is harmless but adds noise. This is Claude's discretion per CONTEXT.md.

2. **Research agent tier assignments beyond source-researcher**
   - What we know: CONTEXT.md explicitly maps `gsd-r-source-researcher` to phase-researcher tier. The 3 other research agents (`methods-researcher`, `architecture-researcher`, `limitations-researcher`) are the same type of specialized researcher.
   - Recommendation: All 4 research agents get the same tier as `phase-researcher` (opus/sonnet/haiku). This is consistent with their role as domain-specific research subagents.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | node:test (built-in, Node 22) |
| Config file | none -- uses `node --test` CLI |
| Quick run command | `node --test test/model-profiles.test.cjs` |
| Full suite command | `node --test test/*.test.cjs` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUN-01 | MODEL_PROFILES contains all 19 gsd-r-* agents | unit | `node --test test/model-profiles.test.cjs` | No -- Wave 0 |
| FOUN-01 | All agent keys start with `gsd-r-` | unit | `node --test test/model-profiles.test.cjs` | No -- Wave 0 |
| FOUN-01 | getAgentToModelMapForProfile returns correct map for each profile | unit | `node --test test/model-profiles.test.cjs` | No -- Wave 0 |
| FOUN-01 | formatAgentToModelMapAsTable produces valid table string | unit | `node --test test/model-profiles.test.cjs` | No -- Wave 0 |
| FOUN-01 | VALID_PROFILES equals ['quality', 'balanced', 'budget'] | unit | `node --test test/model-profiles.test.cjs` | No -- Wave 0 |
| FOUN-04 | VERSION file exists at get-shit-done-r/VERSION | unit | `node --test test/model-profiles.test.cjs` | No -- Wave 0 |
| FOUN-04 | VERSION file contains exactly "1.24.0" | unit | `node --test test/model-profiles.test.cjs` | No -- Wave 0 |
| FOUN-05 | Profile resolution for known agents returns correct model | unit | `node --test test/model-profiles.test.cjs` | No -- Wave 0 |
| FOUN-05 | Profile resolution for unknown agent returns undefined (not crash) | unit | `node --test test/model-profiles.test.cjs` | No -- Wave 0 |
| FOUN-05 | Agent count matches expected (19) | unit | `node --test test/model-profiles.test.cjs` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `node --test test/model-profiles.test.cjs`
- **Per wave merge:** `node --test test/*.test.cjs`
- **Phase gate:** Full suite green before `/gsd-r:verify-work`

### Wave 0 Gaps
- [ ] `test/model-profiles.test.cjs` -- covers FOUN-01, FOUN-04, FOUN-05
- No framework install needed -- node:test is built-in
- No shared fixtures needed -- tests are self-contained

## Sources

### Primary (HIGH confidence)
- Upstream `~/.claude/get-shit-done/bin/lib/model-profiles.cjs` -- exact API surface, function signatures, data structure (68 lines, read in full)
- Upstream `~/.claude/get-shit-done/bin/lib/core.cjs` -- import pattern: `const { MODEL_PROFILES } = require('./model-profiles.cjs')`
- GSD-R `get-shit-done-r/bin/lib/core.cjs` -- current inline MODEL_PROFILES (12 agents), resolveModelInternal logic
- GSD-R `agents/` directory listing -- 16 agent files total, 4 are research-specific
- GSD-R `test/vault.test.cjs` -- test pattern reference (node:test, describe/it/assert)

### Secondary (MEDIUM confidence)
- CONTEXT.md tier assignments for research agents -- user-specified, verified against upstream tiers

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero-dependency CommonJS, fully determined by project conventions
- Architecture: HIGH -- upstream reference implementation read in full; exact API surface documented
- Pitfalls: HIGH -- identified from direct code analysis of current vs. target state

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable -- upstream target is fixed at v1.24.0)
