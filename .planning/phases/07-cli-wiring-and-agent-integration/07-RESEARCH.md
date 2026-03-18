# Phase 7: CLI Wiring and Agent Integration - Research

**Researched:** 2026-03-12
**Domain:** CLI routing, agent prompt wiring, CommonJS module integration
**Confidence:** HIGH

## Summary

Phase 7 is a gap-closure phase that connects already-implemented library functions to the CLI tool layer (`grd-tools.cjs`) and updates agent prompts to invoke those CLI commands. All the core logic already exists and is fully tested (132 tests passing) -- the work is purely wiring: adding `case` branches to the CLI router's `switch` statement and updating markdown agent prompt files.

There are three categories of work: (1) state note/gap subcommands that exist in `state.cjs` but have no CLI routes, (2) a `verify research-plan` route that needs to call `validateResearchPlan()` from `plan-checker-rules.cjs`, and (3) a `bootstrap generate` route that needs to call `generateBootstrap()` from `bootstrap.cjs`. On the agent prompt side, the plan-checker needs to invoke `verify research-plan` during validation, and all four researcher agents need `onUnavailable` wiring instructions that call `state add-gap`.

**Primary recommendation:** Follow the existing CLI routing pattern exactly -- each new subcommand gets a `case` branch in the `state`/`verify`/`bootstrap` switch blocks, parsing `--args` from `process.argv`, and calling the already-exported function. Agent prompt updates are markdown edits only.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| KNOW-02 | STATE.md extended with note-status tracker | state.cjs already exports `cmdStateAddNote`, `cmdStateUpdateNoteStatus`, `cmdStateGetNotes` -- need CLI routes in grd-tools.cjs |
| KNOW-03 | STATE.md extended with source-gap reporting table | state.cjs already exports `cmdStateAddGap`, `cmdStateResolveGap`, `cmdStateGetGaps` -- need CLI routes in grd-tools.cjs |
| ORCH-06 | Modified plan-checker validates source discipline | plan-checker-rules.cjs exports `validateResearchPlan()` -- needs `verify research-plan` CLI route and plan-checker agent prompt update |
| VERI-04 | Verification failures generate fix tasks via /grd:quick | verify-research.cjs exists -- needs `verify research-plan` CLI route so plan-checker prompt can invoke it |
| SRC-04 | Unavailable sources documented, gap flagged | Researcher agent prompts need `onUnavailable` -> `state add-gap` wiring instructions |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| node:fs | built-in | File I/O for STATE.md, BOOTSTRAP.md reading | Zero-dep project constraint |
| node:path | built-in | Path resolution | Zero-dep project constraint |
| node:test | built-in | Test runner | Established project convention |
| node:assert/strict | built-in | Test assertions | Established project convention |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| core.cjs | internal | `output()`, `error()` helpers | Every CLI command uses these |
| frontmatter.cjs | internal | YAML frontmatter extraction | STATE.md frontmatter sync |

### Alternatives Considered
None -- this phase uses only existing internal modules. No new dependencies required.

## Architecture Patterns

### Existing CLI Router Pattern (MUST follow)

The CLI router in `grd-tools.cjs` uses a consistent pattern for all commands:

```javascript
// Pattern: top-level command with subcommand routing
case 'state': {
  const subcommand = args[1];
  if (subcommand === 'add-note') {
    // Parse named args
    const noteIdx = args.indexOf('--note');
    const statusIdx = args.indexOf('--status');
    state.cmdStateAddNote(cwd, {
      note: noteIdx !== -1 ? args[noteIdx + 1] : null,
      status: statusIdx !== -1 ? args[statusIdx + 1] : null,
    }, raw);
  }
  // ... more subcommands
  break;
}
```

**Key conventions:**
1. Named arguments use `--flag value` pattern (not positional)
2. Parse with `args.indexOf('--flag')` then `args[idx + 1]`
3. Pass `cwd` and `raw` through to library functions
4. Library functions call `output()` for JSON or `error()` for failures
5. The `switch` falls through to a final `else` with available subcommand list

### New Routes Needed

**State subcommands (6 new routes in existing `case 'state'` block):**
```
state add-note --note <name> --status <status> [--sources <N>] [--date <date>]
state update-note-status --note <name> --status <status>
state get-notes
state add-gap --note <name> --source <source> [--reason <reason>] [--impact <impact>]
state resolve-gap --note <name> --source <source>
state get-gaps
```

**Verify subcommand (1 new route in existing `case 'verify'` block):**
```
verify research-plan <plan-file> [--bootstrap <bootstrap-file>]
```

This route must:
1. Read plan file content from disk
2. Read BOOTSTRAP.md content (from arg or default `.planning/BOOTSTRAP.md`)
3. Call `validateResearchPlan(planContent, bootstrapContent)`
4. Output result via `output()`

**Bootstrap subcommand (new top-level `case 'bootstrap'` block):**
```
bootstrap generate --data <json-string>
```

This route must:
1. Parse JSON data from `--data` argument
2. Call `generateBootstrap(data)`
3. Output the generated markdown

### Agent Prompt Update Pattern

Agent prompts are markdown files in `agents/`. Updates are purely textual -- adding sections or instructions.

**Plan-checker update:** Add a step in the verification process that runs:
```bash
node "$HOME/.claude/grd/bin/grd-tools.cjs" verify research-plan "$PLAN_PATH" --bootstrap "$BOOTSTRAP_PATH"
```

**Researcher agent updates:** Each of the four researcher prompts needs an `onUnavailable` section explaining how to report source gaps:
```bash
node "$HOME/.claude/grd/bin/grd-tools.cjs" state add-gap \
  --note "<note-name>" \
  --source "<source-description>" \
  --reason "<unavailable|paywall|rate-limited>" \
  --impact "<what this means for the research>"
```

### Anti-Patterns to Avoid
- **Creating new modules:** All logic already exists. Do not create wrapper files or new library modules.
- **Changing function signatures:** The `cmd*` functions in state.cjs are already designed for CLI invocation. Do not modify their interfaces.
- **Duplicating validation logic:** The plan-checker prompt should call the CLI tool, not reproduce the validation rules inline.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Argument parsing | Custom parser | Existing `args.indexOf` pattern | Consistent with 50+ existing routes |
| Research plan validation | Inline logic in prompt | `verify research-plan` CLI route | Rules already tested in plan-checker-rules.test.cjs |
| Note status tracking | Manual STATE.md edits in prompts | `state add-note` / `state update-note-status` CLI | Handles section creation, table rebuilding, frontmatter sync |
| Source gap reporting | Manual STATE.md edits in prompts | `state add-gap` CLI | Handles section creation, table rebuilding, frontmatter sync |

**Key insight:** Every function being wired already has unit tests. The CLI routes are thin wrappers that parse args and delegate. The agent prompt updates are markdown text additions.

## Common Pitfalls

### Pitfall 1: Forgetting to require() new modules
**What goes wrong:** Adding a `case 'bootstrap'` block but forgetting to `require('./lib/bootstrap.cjs')` at the top of grd-tools.cjs.
**Why it happens:** The existing `bootstrap.cjs` is only required by `plan-checker-rules.cjs`, not by grd-tools.cjs.
**How to avoid:** Add `const bootstrap = require('./lib/bootstrap.cjs');` near the top of grd-tools.cjs alongside other requires.
**Warning signs:** `ReferenceError: bootstrap is not defined` at runtime.

### Pitfall 2: Forgetting to require() plan-checker-rules.cjs
**What goes wrong:** The `verify research-plan` route needs plan-checker-rules.cjs, which is not currently required by grd-tools.cjs.
**Why it happens:** plan-checker-rules.cjs was only used directly by tests, not through the CLI.
**How to avoid:** Either require it directly in grd-tools.cjs or add a delegating function in verify.cjs. The simplest approach is to add the require directly.
**Warning signs:** Module not found error.

### Pitfall 3: Inconsistent error messages in else clause
**What goes wrong:** When adding new subcommands to existing `case` blocks (state, verify), the `else` error message at the bottom that lists available subcommands must be updated to include the new ones.
**Why it happens:** Easy to forget the error message when adding routes.
**How to avoid:** Always update the `else` clause error message when adding new subcommands.

### Pitfall 4: Plan-checker file path in agent prompt
**What goes wrong:** Using wrong path to grd-tools.cjs in agent prompts.
**Why it happens:** The plan-checker already uses `$HOME/.claude/grd/bin/grd-tools.cjs` -- must use this exact path.
**How to avoid:** Copy the path pattern from existing tool invocations in the same prompt file.

### Pitfall 5: verify research-plan needs file reading
**What goes wrong:** `validateResearchPlan()` takes string content, not file paths. The CLI route must read files first.
**Why it happens:** Library functions work on content strings; CLI routes handle file I/O.
**How to avoid:** Read plan file and bootstrap file with `fs.readFileSync()` before calling `validateResearchPlan()`.

## Code Examples

### CLI Route: state add-note (in existing state switch block)
```javascript
// Source: Follows pattern of cmdStateAddDecision route at line 214-226 of grd-tools.cjs
} else if (subcommand === 'add-note') {
  const noteIdx = args.indexOf('--note');
  const statusIdx = args.indexOf('--status');
  const sourcesIdx = args.indexOf('--sources');
  const dateIdx = args.indexOf('--date');
  state.cmdStateAddNote(cwd, {
    note: noteIdx !== -1 ? args[noteIdx + 1] : null,
    status: statusIdx !== -1 ? args[statusIdx + 1] : null,
    sources: sourcesIdx !== -1 ? args[sourcesIdx + 1] : null,
    date: dateIdx !== -1 ? args[dateIdx + 1] : null,
  }, raw);
}
```

### CLI Route: verify research-plan
```javascript
// Source: Follows pattern of verify plan-structure at line 332-334 of grd-tools.cjs
// NOTE: requires plan-checker-rules.cjs to be loaded at top of file
} else if (subcommand === 'research-plan') {
  const planPath = path.resolve(cwd, args[2]);
  const bootstrapIdx = args.indexOf('--bootstrap');
  const bootstrapPath = bootstrapIdx !== -1
    ? path.resolve(cwd, args[bootstrapIdx + 1])
    : path.join(cwd, '.planning', 'BOOTSTRAP.md');
  const planContent = fs.readFileSync(planPath, 'utf-8');
  let bootstrapContent = '';
  try { bootstrapContent = fs.readFileSync(bootstrapPath, 'utf-8'); } catch {}
  const result = planCheckerRules.validateResearchPlan(planContent, bootstrapContent);
  output(result, raw, result.valid ? 'true' : 'false');
}
```

### CLI Route: bootstrap generate
```javascript
// New top-level case block
case 'bootstrap': {
  const subcommand = args[1];
  if (subcommand === 'generate') {
    const dataIdx = args.indexOf('--data');
    if (dataIdx === -1) { error('--data required for bootstrap generate'); break; }
    const data = JSON.parse(args[dataIdx + 1]);
    const result = bootstrap.generateBootstrap(data);
    output({ content: result }, raw, result);
  } else {
    error('Unknown bootstrap subcommand. Available: generate');
  }
  break;
}
```

### Agent Prompt: onUnavailable wiring for researcher agents
```markdown
<source_gap_reporting>
## Reporting Unavailable Sources

When a source cannot be acquired after exhausting the fallback chain, report the gap to STATE.md:

\`\`\`bash
node "$HOME/.claude/grd/bin/grd-tools.cjs" state add-gap \
  --note "<note-name>" \
  --source "<source-description>" \
  --reason "<unavailable|paywall|rate-limited>" \
  --impact "<what this means for the research>"
\`\`\`

This is the `onUnavailable` callback -- it ensures every acquisition failure is tracked
centrally in STATE.md's Source Gaps table, not just locally in SOURCE-LOG.md.

**Always call this** when marking a source as unavailable in SOURCE-LOG.md. Both records
must exist: the local SOURCE-LOG.md entry AND the STATE.md gap entry.
</source_gap_reporting>
```

### Agent Prompt: plan-checker research-plan validation
```markdown
## Research Plan Validation (after Step 2, before Step 4)

If this is a research project (config.json `workflow.research: true`), validate
research-specific rules:

\`\`\`bash
RESEARCH_CHECK=$(node "$HOME/.claude/grd/bin/grd-tools.cjs" verify research-plan "$PLAN_PATH" --bootstrap "$BOOTSTRAP_PATH")
\`\`\`

Parse the JSON result. If `valid: false`, add all `issues` as blockers in dimension
`research_plan_validation`. The plan-checker does NOT reproduce these rules -- it
delegates to the tool.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Functions implemented but only callable from test imports | CLI routes wire functions into tool layer | Phase 7 | Agent prompts can invoke functions via bash |
| Agent prompts describe behavior but don't reference specific CLI commands | Agent prompts include exact CLI invocations | Phase 7 | Agents mechanically execute, not interpret |
| Source gaps logged only in local SOURCE-LOG.md | Dual logging: SOURCE-LOG.md + STATE.md gap table via CLI | Phase 7 | Central visibility of all gaps across all notes |

## Open Questions

1. **bootstrap generate input format**
   - What we know: `generateBootstrap()` takes `{ established, partial, notResearched }` object
   - What's unclear: Whether `--data` as a JSON string on command line is the best UX for potentially large inputs
   - Recommendation: Support `--data-file` as alternative to `--data` for reading JSON from a file. But start with `--data` for simplicity since new-project workflow will construct the call.

2. **Plan-checker: when to skip research validation**
   - What we know: Not all projects are research projects. Config has `workflow.research: true/false`.
   - What's unclear: Whether the plan-checker should silently skip or explicitly note skipping.
   - Recommendation: Check `config.json` `workflow.research` flag. If false or absent, skip silently (no noise).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | node:test (built-in, v20+) |
| Config file | none -- uses `node --test` directly |
| Quick run command | `node --test test/state.test.cjs` |
| Full suite command | `node --test` (runs all test/*.test.cjs) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| KNOW-02 | state add-note, update-note-status, get-notes CLI routes | integration | `node --test test/state.test.cjs` | Existing (unit tests for functions) |
| KNOW-03 | state add-gap, resolve-gap, get-gaps CLI routes | integration | `node --test test/state.test.cjs` | Existing (unit tests for functions) |
| ORCH-06 | verify research-plan CLI route | integration | `node --test test/plan-checker-rules.test.cjs` | Existing (unit tests for validateResearchPlan) |
| VERI-04 | verify research-plan invocable from plan-checker | smoke | `node grd/bin/grd-tools.cjs verify research-plan test/fixtures/sample-plan.md` | No fixture yet |
| SRC-04 | onUnavailable -> state add-gap in agent prompts | manual-only | Prompt text review | N/A -- markdown edit |

### Sampling Rate
- **Per task commit:** `node --test test/state.test.cjs && node --test test/plan-checker-rules.test.cjs`
- **Per wave merge:** `node --test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `test/cli-routes.test.cjs` -- CLI-level integration tests for new routes (state subcommands, verify research-plan, bootstrap generate) using `execFileSync` to invoke grd-tools.cjs and verify JSON output

These tests would invoke grd-tools.cjs via `execFileSync` and verify JSON output. The existing unit tests cover the library functions but not the CLI routing layer.

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `grd-tools.cjs` (593 lines) -- full CLI router structure
- Direct code inspection of `state.cjs` (971 lines) -- all 6 note/gap functions exist and are exported
- Direct code inspection of `plan-checker-rules.cjs` (193 lines) -- `validateResearchPlan()` exported
- Direct code inspection of `bootstrap.cjs` (167 lines) -- `generateBootstrap()` exported
- Direct code inspection of 4 researcher agent prompts -- current structure documented
- Direct code inspection of `grd-plan-checker.md` -- current verification process documented
- Test suite: 132 tests, 0 failures (all library functions fully tested)

### Secondary (MEDIUM confidence)
- None needed -- all research is from direct code inspection

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - zero-dep Node.js project, no new dependencies
- Architecture: HIGH - direct code inspection of existing patterns
- Pitfalls: HIGH - identified from actual code structure gaps
- Code examples: HIGH - derived from existing CLI routing patterns in same file

**Research date:** 2026-03-12
**Valid until:** Indefinite (internal codebase patterns, not external dependencies)
