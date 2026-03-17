# Stack Research: GRD v1.2 Research Reorientation

**Domain:** Research workflow tool transformation (GSD-R to GRD)
**Researched:** 2026-03-17
**Confidence:** HIGH (direct file comparison of upstream v1.25.1, GSD-R v1.1 codebase, and v1.2 spec)

## Core Finding: No New Dependencies Required

Every v1.2 feature -- researcher tiers, review type enforcement, synthesis stage, three-tier verification, namespace migration, and upstream sync -- is implementable with the existing zero-dependency stack. The work is CJS module extensions, template/prompt rewrites, config schema additions, and find-and-replace namespace migration.

The only production dependency (`docx ^9.6.1`) and dev dependencies (`c8 ^11.0.0`, `esbuild ^0.24.0`) remain unchanged.

---

## Recommended Stack

### Core Technologies (Unchanged)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | >=18.0.0 (runtime: v22.20.0) | Runtime | Validated across 164 tests. v22 LTS provides stable `node:test`, `node:fs`, `node:child_process` APIs |
| CommonJS (CJS) | N/A | Module system | Entire codebase + upstream GSD is CJS. Migration would break upstream sync pattern |
| node:test | Built-in | Test runner | 164 tests passing. Supports `describe`, `it`, `mock`. Zero-dep test infrastructure |
| node:fs / node:path | Built-in | Filesystem | Vault writes, config CRUD, state management, template loading |
| node:child_process | Built-in | External processes | `spawnSync` for git (upstream v1.25.1 migrated from `execSync`) |

### Supporting Libraries (Unchanged)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| docx | ^9.6.1 | DOCX generation | Export research notes/synthesis to Word format |
| c8 | ^11.0.0 (dev) | Code coverage | Test coverage reporting |
| esbuild | ^0.24.0 (dev) | Bundle hooks | `npm run build:hooks` |

---

## What Changes (Code, Not Stack)

All v1.2 features are implemented through code changes in existing and new CJS modules, templates, workflows, and prompts. No new npm packages.

### Feature 1: Upstream Sync v1.24.0 to v1.25.1

**No new dependencies.** Pure CJS logic changes across shared modules.

#### Sync Manifest (Incremental from v1.1 sync)

| Upstream File | Diff Size | Key v1.25.1 Changes | GSD-R Impact |
|---------------|-----------|---------------------|--------------|
| `core.cjs` | ~43 lines | `spawnSync` replaces `execSync` in `execGit`; `resolveModelInternal` drops `opus`-to-`inherit` mapping; new `stripShippedMilestones()`, `getMilestonePhaseFilter()` | Adopt. GSD-R agent names (`gsd-r-*`) become `grd-*` during namespace migration |
| `config.cjs` | ~138 lines | `ensureConfigFile()` extracted as non-exiting helper; `VALID_CONFIG_KEYS` set; `CONFIG_KEY_SUGGESTIONS` typo correction; model-profiles import | Adopt + extend `VALID_CONFIG_KEYS` with GRD keys |
| `commands.cjs` | ~42 lines | `getMilestonePhaseFilter` scoping; ROADMAP-driven phase discovery; quick task ID (YYMMDD-xxx); archived phase handling | Adopt + namespace fix |
| `init.cjs` | ~100 lines | Milestone phase filtering; archived phase resolution; `normalizePhaseName` padding | Adopt + namespace fix |
| `phase.cjs` | ~104 lines | `stripShippedMilestones` for roadmap scoping; `replaceInCurrentMilestone` for completion; per-phase requirements scoping | Adopt + namespace fix |
| `state.cjs` | ~92 lines | Upstream uses `gsd_state_version`; various improvements | Adopt shared changes; keep `grd_state_version`; preserve Note Status + Source Gaps extensions |
| `verify.cjs` | ~92 lines | Various improvements | Adopt; preserve `verify-research.cjs` extensions |
| `roadmap.cjs` | ~53 lines | `stripShippedMilestones`; milestone phase filtering | Straightforward merge |
| `model-profiles.cjs` | ~4 lines | Minor | Rename `gsd-r-*` agents to `grd-*` |

#### New Upstream Content to Adopt

| File | Type | Purpose | GRD Adaptation |
|------|------|---------|----------------|
| `workflows/do.md` | Workflow | Freeform intent dispatcher | Route to `/grd:` commands. Rename research equivalents |
| `workflows/note.md` | Workflow | Zero-friction idea capture | Useful as-is for research note-taking. Fix paths |

#### Sync Strategy

Same pattern as v1.1: upstream wins for shared modules, GRD research extensions layered on top. Namespace changes applied as final pass AFTER sync completes.

**Ordering constraint:** Sync upstream FIRST, then apply namespace migration. Doing namespace first creates merge conflicts on every file.

### Feature 2: Config Schema Extensions

New keys added to `.planning/config.json` template and `VALID_CONFIG_KEYS`:

```json
{
  "researcher_tier": "guided | standard | expert",
  "review_type": "systematic | scoping | integrative | critical | narrative",
  "epistemological_stance": "positivist | constructivist | pragmatist | critical",
  "workflow": {
    "critical_appraisal": true,
    "temporal_positioning": true,
    "synthesis": true
  }
}
```

**Implementation points:**
- `config.cjs`: Add 3 new keys to `VALID_CONFIG_KEYS`. Add suggestions for common misspellings. Add validation for enum values
- `templates/config.json`: Add defaults (`researcher_tier: "standard"`, `review_type: "narrative"`, `epistemological_stance: "pragmatist"`, `workflow.critical_appraisal: true`, `workflow.temporal_positioning: true`, `workflow.synthesis: true`)
- Smart defaults lookup table: Static object in `plan-checker-rules.cjs` mapping `review_type` to boolean flags

### Feature 3: Researcher Tier Adaptive Communication

**No new dependencies.** Three implementation patterns:

| Component | Pattern | Where |
|-----------|---------|-------|
| Message variants | Static lookup object keyed by tier | New `tier.cjs` module (~100 lines) |
| Prompt adaptation | Template string with `{tier_instruction}` placeholder | 17+ agent prompt files |
| Template adaptation | Conditional inline guidance sections | Template files |
| Feedback adaptation | Tier-indexed message table | `verify-research.cjs`, `verify.cjs` |

**New module: `tier.cjs`**

```javascript
// Minimal API surface
function getTierInstruction(tier, context) { ... }  // Returns prompt fragment
function getTierMessage(tier, messageKey) { ... }    // Returns feedback message
function getSmartDefaults(reviewType) { ... }        // Returns config overrides
```

This is a pure-function lookup module. No external dependencies. No I/O. Testable with `node:test`.

### Feature 4: Review Type Enforcement in Plan-Checker

**No new dependencies.** Extend `plan-checker-rules.cjs` (currently 192 lines).

| New Rule | Applies To | Implementation |
|----------|-----------|----------------|
| Search strategy systematic | systematic, scoping | Regex check for database names, keywords, date ranges in `<src>` blocks |
| Inclusion/exclusion criteria present | systematic, scoping | Check CONTEXT.md for criteria section presence |
| Primary source prioritization | systematic, integrative, critical | New `type` attribute on `<src>` tags; flag if missing |
| Disciplinary diversity | interdisciplinary topics | Count unique `discipline` attributes across tasks |
| Diverse methodologies | integrative | Check for methodology variety in source types |
| Smart defaults enforcement | all | Cross-reference `review_type` config against rule applicability table |

**Data needed:** Static rule-applicability matrix (review type x rule). Implemented as a plain object, not a config file.

### Feature 5: Synthesis Stage

**No new dependencies.** Uses existing execution machinery (PLAN.md tasks, subagent dispatch, vault writes, wave parallelism).

| Activity | Input | Output | Dependency |
|----------|-------|--------|------------|
| 6a. Thematic synthesis | All verified notes | THEMES.md | None (runs first) |
| 6b. Theoretical integration | THEMES.md + framework survey | FRAMEWORK.md | 6a |
| 6c. Gap analysis | THEMES.md + FRAMEWORK.md + notes | GAPS.md | 6a |
| 6d. Argument construction | THEMES.md + FRAMEWORK.md + GAPS.md | Executive-Summary.md | 6a, 6b, 6c |

**New files needed:**

| File Type | Files | Purpose |
|-----------|-------|---------|
| Workflow | `workflows/synthesize.md` | Synthesis stage orchestration |
| Reference | `references/synthesis-protocol.md` | Method reference for synthesis agents |
| Agent prompts | 4 files in `agents/` | One per synthesis activity |
| Templates | `templates/themes.md`, `templates/framework.md`, `templates/gaps.md`, `templates/executive-summary.md` | Output format templates |

**Execution model:** Same as investigation phases. Each synthesis activity is a task in a PLAN.md. Fresh subagent per task. Wave parallelism: 6a first, then 6b+6c in parallel, then 6d.

### Feature 6: Three-Tier Verification

**No new dependencies.** Extend `verify-research.cjs` (currently 436 lines).

| Tier | Status | Implementation |
|------|--------|----------------|
| Tier 0: Sufficiency | NEW | Note count vs review type expectations; theme overlap heuristic for saturation; epistemological consistency check |
| Tier 1: Goal-backward | Existing | Unchanged |
| Tier 2: Source audit | Existing | Unchanged |

**Sufficiency heuristic:** Compare extracted theme keywords from recent notes against earlier notes using Set intersection. If overlap exceeds threshold (e.g., 80%), signal potential saturation. This is string comparison -- no NLP library needed.

**New in `verify-research.cjs`:**
- `checkSufficiency(notes, reviewType, stance)` function (~80-100 lines)
- Review type expectations table (systematic: exhaustive; narrative: representative)
- Saturation detection via keyword overlap

### Feature 7: Namespace Migration

**No new dependencies.** Scripted find-and-replace.

| Scope | File Count | Pattern |
|-------|-----------|---------|
| Commands | ~36 | `/gsd-r:` to `/grd:` |
| Workflows | ~39 | `/gsd-r:` to `/grd:` |
| Agent prompts | ~17 | `/gsd-r:` to `/grd:` |
| References | ~14 | `/gsd-r:` to `/grd:` |
| Templates | ~10 | `/gsd-r:` to `/grd:` |
| CJS modules | ~17 | `gsd-r-` agent names to `grd-` |
| Tests | ~9 | Namespace assertions |
| Package/config | ~3 | `get-shit-done-r` to `get-research-done` |
| Binary | 1 | `gsd-r-tools.cjs` to `grd-tools.cjs` |

**Approach:** Adapt existing `scripts/rename-gsd-to-gsd-r.cjs` for the `/gsd-r:` to `/grd:` transformation. Run full test suite after to validate.

**Command name mapping** (from spec):

| v1.1 | v1.2 | Function |
|------|------|----------|
| `/gsd-r:new-project` | `/grd:new-research` | Research formulation |
| `/gsd-r:discuss-phase N` | `/grd:scope-inquiry N` | Inquiry scoping |
| `/gsd-r:plan-phase N` | `/grd:plan-inquiry N` | Search protocol |
| `/gsd-r:execute-phase N` | `/grd:conduct-inquiry N` | Investigation |
| `/gsd-r:verify-work` | `/grd:verify-inquiry N` | Three-tier verification |
| *(new)* | `/grd:synthesize` | Synthesis stage |
| `/gsd-r:complete-milestone` | `/grd:complete-study` | Completion |

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Static tier message lookups | Template engine (Handlebars, EJS) | Never -- adds dependency for 3-variant string selection |
| Regex-based plan validation | JSON Schema (ajv) | Never -- validates XML-in-markdown, not JSON structures |
| Keyword overlap for saturation | NLP library (compromise, natural) | Future milestone if semantic analysis needed |
| node:test | Jest, Vitest | Never -- 164 tests already written, zero migration benefit |
| CJS modules | ESM | Not for v1.2 -- upstream is CJS, matching reduces sync friction |
| Filesystem state (STATE.md) | SQLite | Never -- human-readable, git-trackable state is a design principle |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Any npm production dependency | Zero-dep core constraint is a key design decision validated across v1.0 and v1.1 | Node.js built-in modules (`node:fs`, `node:path`, `node:test`, `node:child_process`) |
| Template engine | Tier messages are 3-variant lookups, not complex interpolation | Static objects with string keys |
| YAML parser (js-yaml) | Frontmatter parsing works via line-by-line splitting in existing `parseFrontmatter()` | Existing implementation in `verify-research.cjs` and `frontmatter.cjs` |
| JSON Schema validator | Config validation is simple key membership + enum checking | Upstream's `VALID_CONFIG_KEYS` Set pattern |
| NLP library | Saturation detection is keyword overlap (Set intersection), not semantic similarity | `Set` built-in |
| Database | All state is markdown. Human-readable, git-trackable by design | Filesystem + STATE.md |
| TypeScript | CJS codebase, upstream is CJS. Would break sync pattern | JSDoc annotations if type safety needed |
| Research methodology library | Review type rules are static lookup tables, not computed | Plain objects |

---

## New Files to Create (Authored, Not Installed)

| Category | Files | Estimated Lines |
|----------|-------|-----------------|
| CJS module | `tier.cjs` (tier resolution + smart defaults) | ~100-150 |
| Plan-checker extensions | In `plan-checker-rules.cjs` (review type rules) | ~150 added |
| Verification extensions | In `verify-research.cjs` (Tier 0 sufficiency) | ~100 added |
| Config extensions | In `config.cjs` (new keys, validation) | ~30 added |
| Synthesis workflow | `workflows/synthesize.md` | ~200 |
| Synthesis reference | `references/synthesis-protocol.md` | ~150 |
| Agent prompts | 4-6 new files (synthesis + tier-aware variants) | ~400 total |
| Templates | 4-5 new (THEMES, FRAMEWORK, GAPS, Executive-Summary, updated note template) | ~200 total |
| Tests | 3-4 new test files (tier, review-type, synthesis, namespace) | ~400 total |
| Namespace script | Adapted rename script | ~100 |

**Estimated total new code:** ~1,500-2,000 lines across all file types.

---

## Version Compatibility

| Component | Current (v1.1) | After v1.2 | Notes |
|-----------|---------------|------------|-------|
| Node.js | >=18.0.0 | >=18.0.0 | No change. `spawnSync` available since Node 0.12 |
| Upstream GSD base | v1.24.0 | v1.25.1 | Key: `spawnSync`, `stripShippedMilestones`, config validation, quick ID format |
| docx | ^9.6.1 | ^9.6.1 | No change |
| c8 | ^11.0.0 | ^11.0.0 | No change |
| esbuild | ^0.24.0 | ^0.24.0 | No change |
| Package name | get-shit-done-r | get-research-done | Namespace migration |
| Binary | gsd-r-tools.cjs | grd-tools.cjs | Namespace migration |
| Agent prefix | gsd-r-* | grd-* | 19 agents renamed |
| Tests | 164 | ~200+ | New coverage for tier, review type, synthesis, namespace |

---

## Upstream Sync Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Agent name triple-rename confusion (`gsd-*` upstream, `gsd-r-*` current, `grd-*` target) | HIGH | Sync upstream first with `gsd-r-*` names (proven v1.1 pattern), then batch rename to `grd-*` as final step |
| `VALID_CONFIG_KEYS` rejects GRD keys | MEDIUM | Extend the Set immediately after merge. Add `researcher_tier`, `review_type`, `epistemological_stance`, `workflow.critical_appraisal`, `workflow.temporal_positioning`, `workflow.synthesis` |
| `stripShippedMilestones` interaction with research state | LOW | Function operates on ROADMAP.md content only; research extensions are in STATE.md |
| `spawnSync` migration in `execGit` | LOW | Drop-in behavioral replacement. Adopt directly |
| Quick task ID format change (sequential int to YYMMDD-xxx) | LOW | Adopt upstream format. Better collision resistance for parallel agents |
| v1.25.1 has features not in v1.24.0 that break assumptions | LOW | Diff is ~43 lines in core.cjs. Changes are additive, not breaking |

---

## Phase Ordering Implications for Roadmap

Based on dependency analysis:

1. **Upstream sync first** -- All other features build on the synced codebase. Config validation, milestone scoping, and `spawnSync` are foundational.
2. **Config schema + tier module second** -- `researcher_tier`, `review_type`, `epistemological_stance` must exist in config before plan-checker, templates, or verification can reference them.
3. **Plan-checker + verification extensions third** -- These consume config values and are independently testable.
4. **Synthesis stage fourth** -- New workflow + templates + agents. Independent of namespace but depends on verification being complete (Tier 0 must exist for synthesis to be verifiable).
5. **Namespace migration last** -- Pure rename operation across all files. Must happen after all other content changes are complete to avoid double-editing every file.

---

## Sources

- Upstream GSD v1.25.1: `~/.claude/get-shit-done/` (direct file comparison) -- HIGH confidence
- GSD-R v1.1 codebase: `/Users/jeremiahwolf/Desktop/Projects/APPs/GSDR/` (direct inspection) -- HIGH confidence
- GRD v1.2 spec: `docs/GRD-v1.2-Research-Reorientation-Spec.md` -- HIGH confidence (authoritative requirements)
- Node.js v22.20.0 runtime: verified via `node --version` -- HIGH confidence
- v1.1 STACK.md: Previous sync manifest for merge pattern reference -- HIGH confidence

---
*Stack research for: GRD v1.2 Research Reorientation*
*Researched: 2026-03-17*
