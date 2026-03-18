# Phase 16: Config Schema and Defaults - Research

**Researched:** 2026-03-17
**Domain:** Config infrastructure for v1.2 research-oriented fields (CJS, Node.js built-in test)
**Confidence:** HIGH

## Summary

Phase 16 adds three new top-level config fields (`researcher_tier`, `review_type`, `epistemological_stance`), two new workflow toggles (`workflow.critical_appraisal`, `workflow.temporal_positioning`), a smart defaults cascade that auto-configures workflow toggles based on review type, a `configWithDefaults()` function for backward compatibility with v1.1 projects, and review type downgrade support in settings.md. The phase does NOT add the scoping questions to `new-research` (that is Phase 18) -- it only builds the config infrastructure those questions will write to.

The existing config system in `config.cjs` already supports dot-notation nested keys, a `VALID_CONFIG_KEYS` Set for validation, and `setConfigValue()` for programmatic writes. The `loadConfig()` function in `core.cjs` flattens nested config into a flat object for consumption by init commands. Both need extension. The smart defaults table from the spec is a fixed 5x4 lookup -- implement as a constant object, not computed logic.

**Primary recommendation:** Implement smart defaults as a `SMART_DEFAULTS` lookup table in config.cjs, add `configWithDefaults()` as a deep-merge wrapper around raw config reads, extend `VALID_CONFIG_KEYS` and `loadConfig()` for new fields, and update `settings.md` workflow with review type downgrade logic.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Smart defaults cascade uses spec's Smart Defaults table exactly:
  - systematic: critical_appraisal=required, temporal_positioning=required, synthesis=required, plan_check=strict
  - scoping: critical_appraisal=charting, temporal_positioning=recommended, synthesis=recommended, plan_check=moderate
  - integrative: critical_appraisal=proportional, temporal_positioning=recommended, synthesis=required, plan_check=moderate
  - critical: critical_appraisal=proportional, temporal_positioning=recommended, synthesis=required, plan_check=moderate
  - narrative: critical_appraisal=optional, temporal_positioning=optional, synthesis=optional, plan_check=light
- Reset on type change -- when review_type changes, ALL workflow toggles reset to the new type's smart defaults. User overrides do NOT survive type changes. Clean slate.
- Question order for new-research: Tier -> Review type -> Epistemology (but Phase 16 only builds infrastructure, not the questions themselves)
- All three fields skippable with defaults: researcher_tier=standard, review_type=narrative, epistemological_stance=pragmatist
- configWithDefaults() does deep-merge with defaults -- missing keys get defaults, existing keys preserved. No crash, no prompt, no notification.
- Existing v1.1 projects silently get: researcher_tier=standard, review_type=narrative, epistemological_stance=pragmatist, plus all workflow toggles from narrative smart defaults
- Deep-merge means nested objects (workflow.*) merge key-by-key, not replace wholesale
- Downgrades only -- upgrading review type (e.g., narrative -> systematic) is not allowed. Start a new study for higher rigor.
- Confirmation required before downgrade -- show exactly what changes: which toggles relax, from what to what
- Downgrade resets all workflow toggles to the new type's smart defaults

### Claude's Discretion
- Exact implementation of configWithDefaults() deep-merge logic
- How VALID_CONFIG_KEYS is extended for new fields
- Whether smart defaults are stored as a lookup table or computed function
- Test structure and assertion patterns

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CFG-01 | `researcher_tier` field in config.json (guided/standard/expert) with selection during `/grd:new-research` | New field added to VALID_CONFIG_KEYS, configWithDefaults(), loadConfig(); selection UI deferred to Phase 18 |
| CFG-02 | `review_type` field in config.json (systematic/scoping/integrative/critical/narrative) with selection during `/grd:new-research` | New field added to VALID_CONFIG_KEYS, configWithDefaults(), loadConfig(); selection UI deferred to Phase 18 |
| CFG-03 | `epistemological_stance` field in config.json (positivist/constructivist/pragmatist/critical) with pragmatist default if skipped | New field added to VALID_CONFIG_KEYS, configWithDefaults(), loadConfig() |
| CFG-04 | Smart defaults cascade -- selecting a review type auto-configures critical_appraisal, temporal_positioning, synthesis, and plan_check rigor per Smart Defaults table | SMART_DEFAULTS lookup table + applySmartDefaults() function in config.cjs |
| CFG-05 | `configWithDefaults()` function ensuring existing projects get correct defaults for all new fields | Deep-merge function in config.cjs; called by loadConfig() |
| CFG-06 | `config.workflow.critical_appraisal` toggle (skips Evidence Quality section globally) | New workflow toggle, defaults per smart defaults table |
| CFG-07 | `config.workflow.temporal_positioning` toggle (skips era field) | New workflow toggle, defaults per smart defaults table |
| TRAP-05 | Review type downgrade via `/grd:settings` mid-study -- rigor requirements relax, no work lost | Downgrade validation logic + settings.md workflow update |
| TEST-04 | New tests cover config schema with defaults and smart defaults cascade | New test file test/config.test.cjs |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js built-in `node:test` | N/A | Test framework | Already used for all 164+ existing tests |
| Node.js built-in `node:assert/strict` | N/A | Assertions | Already used throughout test suite |

### Supporting
No new dependencies. This phase modifies existing CJS modules only.

**Installation:** None required -- zero external dependencies policy.

## Architecture Patterns

### File Modification Map

```
get-shit-done-r/bin/lib/config.cjs      # PRIMARY: SMART_DEFAULTS, configWithDefaults(),
                                          #   applySmartDefaults(), extended VALID_CONFIG_KEYS,
                                          #   REVIEW_TYPE_ORDER, canDowngrade()
get-shit-done-r/bin/lib/core.cjs         # loadConfig() extended with new fields
get-shit-done-r/templates/config.json    # New fields added to template
get-shit-done-r/workflows/settings.md    # Review type downgrade UI + new toggle questions
get-shit-done-r/bin/lib/init.cjs         # init commands propagate new config fields
test/config.test.cjs                     # NEW: config schema + defaults + smart defaults tests
```

### Pattern 1: Smart Defaults Lookup Table

**What:** A constant object mapping review_type to its workflow toggle defaults
**When to use:** Every time a review_type is set or changed
**Example:**
```javascript
// Source: spec Smart Defaults table + CONTEXT.md locked decision
const SMART_DEFAULTS = {
  systematic: {
    critical_appraisal: 'required',
    temporal_positioning: 'required',
    synthesis: 'required',
    plan_check: 'strict',
  },
  scoping: {
    critical_appraisal: 'charting',
    temporal_positioning: 'recommended',
    synthesis: 'recommended',
    plan_check: 'moderate',
  },
  integrative: {
    critical_appraisal: 'proportional',
    temporal_positioning: 'recommended',
    synthesis: 'required',
    plan_check: 'moderate',
  },
  critical: {
    critical_appraisal: 'proportional',
    temporal_positioning: 'recommended',
    synthesis: 'required',
    plan_check: 'moderate',
  },
  narrative: {
    critical_appraisal: 'optional',
    temporal_positioning: 'optional',
    synthesis: 'optional',
    plan_check: 'light',
  },
};
```

### Pattern 2: configWithDefaults() Deep Merge

**What:** Function that reads raw config.json and fills missing keys with defaults, including smart defaults from review_type
**When to use:** Called by loadConfig() and anywhere a complete config is needed
**Example:**
```javascript
// Source: CONTEXT.md locked decision on deep-merge behavior
function configWithDefaults(rawConfig) {
  const defaults = {
    researcher_tier: 'standard',
    review_type: 'narrative',
    epistemological_stance: 'pragmatist',
  };

  // Start with top-level defaults
  const merged = { ...defaults, ...rawConfig };

  // Determine effective review_type for smart defaults
  const reviewType = merged.review_type || 'narrative';
  const smartDefaults = SMART_DEFAULTS[reviewType] || SMART_DEFAULTS.narrative;

  // Deep-merge workflow: smart defaults < existing config values
  merged.workflow = {
    ...smartDefaults,
    ...(rawConfig.workflow || {}),
  };

  return merged;
}
```

**Key detail:** The deep-merge order is: hardcoded defaults < smart defaults for review_type < user's actual config values. This means a v1.1 project with no `workflow.critical_appraisal` gets `optional` (narrative default), but a project where the user explicitly set `workflow.critical_appraisal = 'required'` keeps that value.

**HOWEVER:** Per the locked decision, when review_type CHANGES (via settings or initial selection), all workflow toggles reset to the new type's smart defaults. The deep-merge only preserves user overrides when loading an existing config WITHOUT changing review_type.

### Pattern 3: Review Type Downgrade Validation

**What:** Ordered hierarchy of review types from most to least rigorous
**When to use:** When user requests a review type change via settings
**Example:**
```javascript
// Rigor ordering: systematic (most) -> narrative (least)
const REVIEW_TYPE_ORDER = ['systematic', 'scoping', 'integrative', 'critical', 'narrative'];

function canDowngrade(currentType, requestedType) {
  const currentIdx = REVIEW_TYPE_ORDER.indexOf(currentType);
  const requestedIdx = REVIEW_TYPE_ORDER.indexOf(requestedType);
  return requestedIdx > currentIdx; // Higher index = less rigorous = valid downgrade
}
```

**Note on ordering:** The spec places scoping and integrative/critical as intermediate types. The exact ordering of scoping vs integrative vs critical is debatable since they serve different purposes, but for the downgrade check what matters is: systematic is the highest bar, narrative is the lowest, everything else is in between. The CONTEXT.md says "downgrade only" meaning moving toward less rigor. A reasonable ordering is systematic > scoping > integrative = critical > narrative.

### Pattern 4: applySmartDefaults() for Type Changes

**What:** Function that takes a config + new review_type and returns config with workflow toggles reset to smart defaults
**When to use:** When review_type is changed via settings (TRAP-05) or set initially
**Example:**
```javascript
function applySmartDefaults(config, newReviewType) {
  const smartDefaults = SMART_DEFAULTS[newReviewType];
  if (!smartDefaults) return config;

  // Clone config, reset workflow toggles to smart defaults
  const updated = { ...config, review_type: newReviewType };
  updated.workflow = {
    ...(config.workflow || {}),
    // Overwrite the 4 smart-default-controlled toggles
    critical_appraisal: smartDefaults.critical_appraisal,
    temporal_positioning: smartDefaults.temporal_positioning,
    synthesis: smartDefaults.synthesis,
    plan_check: smartDefaults.plan_check,
  };
  return updated;
}
```

### Anti-Patterns to Avoid
- **Scattered conditionals for smart defaults:** Do NOT use if/else chains checking review_type in multiple places. Use the SMART_DEFAULTS lookup table as single source of truth.
- **Shallow merge replacing workflow object:** `{ ...defaults, ...config }` destroys nested workflow keys. Must deep-merge `workflow` specifically.
- **Allowing upgrades:** The downgrade validation must be enforced. If a user tries systematic after starting with narrative, error with "Start a new study for higher rigor."
- **Modifying v1.1 config on disk silently:** configWithDefaults() returns a merged object but should NOT write back to disk. The on-disk config stays as-is; defaults are applied in memory. Only explicit user actions (settings, new-research) write to disk.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Deep merge | Custom recursive merge for arbitrary depth | Targeted merge of known structure (top-level + workflow) | Config schema is known and flat-ish; a general deep-merge is overkill and error-prone |
| Schema validation | JSON Schema validator | Simple Set-based VALID_CONFIG_KEYS check + enumerated value validation | Matches existing pattern, zero dependencies |
| Config migration | Generic migration framework | Explicit configWithDefaults() that fills missing keys | Only one migration path needed (v1.1 -> v1.2) |

## Common Pitfalls

### Pitfall 1: loadConfig() Flattens Nested Values
**What goes wrong:** `loadConfig()` in core.cjs currently flattens `workflow.research`, `workflow.plan_check` etc. into top-level keys. New fields need the same treatment.
**Why it happens:** loadConfig() uses a custom `get()` helper that checks both top-level and `parsed[section][field]` paths.
**How to avoid:** Extend the existing `get()` pattern for new fields: `researcher_tier` (top-level), `review_type` (top-level), `epistemological_stance` (top-level), `workflow.critical_appraisal`, `workflow.temporal_positioning`, `workflow.synthesis`.
**Warning signs:** init.cjs commands return `undefined` for new config fields.

### Pitfall 2: Smart Defaults vs User Overrides Confusion
**What goes wrong:** configWithDefaults() applies smart defaults AND the user's explicit overrides get lost, or vice versa.
**Why it happens:** Two different merge semantics: (1) loading existing config = smart defaults as fallback, user values win; (2) changing review type = smart defaults override everything.
**How to avoid:** Two separate code paths: `configWithDefaults()` for loading (user wins), `applySmartDefaults()` for type changes (smart defaults win). Never conflate them.
**Warning signs:** Changing review type doesn't change workflow toggles, or loading existing config overwrites user's explicit settings.

### Pitfall 3: VALID_CONFIG_KEYS Must Accept String Values
**What goes wrong:** `cmdConfigSet()` parses values as booleans/numbers. New fields like `review_type: "systematic"` and `critical_appraisal: "required"` are strings, not booleans.
**Why it happens:** The existing parser converts "true"/"false" to booleans and numeric strings to numbers, but leaves other strings as-is. This should work correctly for new string fields, but the VALID_CONFIG_KEYS Set must include the new key paths.
**How to avoid:** Verify cmdConfigSet works with string enum values. Add the new keys to VALID_CONFIG_KEYS.
**Warning signs:** `config-set review_type systematic` fails with "Unknown config key."

### Pitfall 4: Template config.json vs Existing Project Config
**What goes wrong:** templates/config.json gets new fields, but existing projects already have a config.json without them.
**Why it happens:** templates/config.json is only used when creating NEW projects. Existing projects rely on configWithDefaults() to fill gaps.
**How to avoid:** Update BOTH: templates/config.json (for new projects) AND configWithDefaults() (for existing projects). Test both paths.
**Warning signs:** New project works, but opening v1.1 project crashes on missing key.

### Pitfall 5: Downgrade Ordering Ambiguity
**What goes wrong:** Is scoping more or less rigorous than integrative? The spec doesn't give a strict total ordering for intermediate types.
**Why it happens:** Different review types serve different purposes -- scoping maps breadth, integrative combines methods, critical evaluates quality. They're not strictly comparable.
**How to avoid:** Use the REVIEW_TYPE_ORDER array as the canonical ordering. The key constraint is: systematic is top, narrative is bottom. For intermediate types, a reasonable ordering (scoping > integrative = critical) suffices since mid-range downgrades are uncommon.
**Warning signs:** User can't downgrade from scoping to integrative, or vice versa when they should be able to.

## Code Examples

### Extending VALID_CONFIG_KEYS
```javascript
// In config.cjs, add to the existing Set:
const VALID_CONFIG_KEYS = new Set([
  // ... existing keys ...
  // GSD-R v1.2 research extensions
  'vault_path', 'commit_research',
  'researcher_tier', 'review_type', 'epistemological_stance',
  'workflow.critical_appraisal', 'workflow.temporal_positioning',
  'workflow.synthesis',
]);
```

### Extending loadConfig() in core.cjs
```javascript
// Inside loadConfig(), add to the return object:
return {
  // ... existing fields ...
  researcher_tier: get('researcher_tier') ?? 'standard',
  review_type: get('review_type') ?? 'narrative',
  epistemological_stance: get('epistemological_stance') ?? 'pragmatist',
  critical_appraisal: get('critical_appraisal', { section: 'workflow', field: 'critical_appraisal' })
    ?? SMART_DEFAULTS[get('review_type') ?? 'narrative'].critical_appraisal,
  temporal_positioning: get('temporal_positioning', { section: 'workflow', field: 'temporal_positioning' })
    ?? SMART_DEFAULTS[get('review_type') ?? 'narrative'].temporal_positioning,
  synthesis: get('synthesis', { section: 'workflow', field: 'synthesis' })
    ?? SMART_DEFAULTS[get('review_type') ?? 'narrative'].synthesis,
};
```

**Note:** loadConfig() will need to import SMART_DEFAULTS from config.cjs. This creates a potential circular dependency since config.cjs already imports from core.cjs (indirectly). Resolution: either move SMART_DEFAULTS to core.cjs or to a new `config-defaults.cjs` module.

### Updating templates/config.json
```json
{
  "researcher_tier": "standard",
  "review_type": "narrative",
  "epistemological_stance": "pragmatist",
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "auto_advance": false,
    "critical_appraisal": "optional",
    "temporal_positioning": "optional",
    "synthesis": "optional",
    "nyquist_validation": true
  }
}
```

### Settings Downgrade Flow (settings.md addition)
```
When user selects review_type change:
1. Check canDowngrade(current, requested)
2. If upgrade attempt: "Cannot upgrade review type mid-study. Start a new study with /grd:new-research for higher rigor."
3. If valid downgrade: Show diff table:
   "Downgrading from systematic to scoping will change:
    - critical_appraisal: required -> charting
    - temporal_positioning: required -> recommended
    - synthesis: required -> recommended
    - plan_check: strict -> moderate
    Existing notes are unaffected. Only future enforcement changes.
    Confirm? [Yes/No]"
4. On confirm: call applySmartDefaults(config, newType), write to disk
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat config with boolean toggles only | Enum-valued workflow toggles (required/charting/proportional/optional) | v1.2 | Workflow toggles are now strings, not just booleans |
| No review type concept | review_type drives smart defaults cascade | v1.2 | Config becomes the source of rigor enforcement |
| Manual config editing for all fields | configWithDefaults() auto-fills missing fields | v1.2 | Backward compatibility without user intervention |

## Open Questions

1. **Circular dependency: config.cjs <-> core.cjs**
   - What we know: config.cjs imports from core.cjs (`output`, `error`). core.cjs has `loadConfig()` which will need SMART_DEFAULTS.
   - What's unclear: Whether moving SMART_DEFAULTS into core.cjs is cleaner than creating a separate module.
   - Recommendation: Define SMART_DEFAULTS in config.cjs and have loadConfig() in core.cjs import it. Check that config.cjs does NOT import loadConfig from core.cjs (it doesn't -- it imports `output` and `error` only). So the dependency is one-way: config.cjs -> core.cjs for output/error, core.cjs -> config.cjs for SMART_DEFAULTS. This is fine as long as Node's CJS require handles the circular reference (it does, since one side only uses the export after module initialization).

2. **init.cjs propagation of new fields**
   - What we know: Multiple cmdInit* functions read loadConfig() and propagate values to their result objects.
   - What's unclear: Which init commands need the new fields. Phase 18 (new-research) and settings will need them. Execute-phase may need critical_appraisal and temporal_positioning for note template selection.
   - Recommendation: Add new fields to cmdInitExecutePhase (for note template decisions) and cmdInitPhaseOp (for settings/general use). Other init commands can add fields as needed in later phases.

3. **plan_check rigor values and enforcement**
   - What we know: The smart defaults include plan_check with values strict/moderate/light. Currently plan_check is boolean (true/false).
   - What's unclear: How plan-checker interprets these graduated values. That's Phase 19's concern.
   - Recommendation: Store the string value now. Phase 19 will read it and enforce accordingly. For backward compat, treat boolean `true` as `moderate` and `false` as disabled in configWithDefaults().

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in `node:test` |
| Config file | None -- tests run directly with `node --test` |
| Quick run command | `node --test test/config.test.cjs` |
| Full suite command | `node --test test/*.test.cjs` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CFG-01 | researcher_tier field accepted in VALID_CONFIG_KEYS and has default | unit | `node --test test/config.test.cjs` | Wave 0 |
| CFG-02 | review_type field accepted in VALID_CONFIG_KEYS and has default | unit | `node --test test/config.test.cjs` | Wave 0 |
| CFG-03 | epistemological_stance field with pragmatist default | unit | `node --test test/config.test.cjs` | Wave 0 |
| CFG-04 | Smart defaults cascade for all 5 review types | unit | `node --test test/config.test.cjs` | Wave 0 |
| CFG-05 | configWithDefaults() deep-merges missing keys | unit | `node --test test/config.test.cjs` | Wave 0 |
| CFG-06 | critical_appraisal toggle exists with correct defaults | unit | `node --test test/config.test.cjs` | Wave 0 |
| CFG-07 | temporal_positioning toggle exists with correct defaults | unit | `node --test test/config.test.cjs` | Wave 0 |
| TRAP-05 | Downgrade allowed, upgrade blocked, toggles reset | unit | `node --test test/config.test.cjs` | Wave 0 |
| TEST-04 | Config schema tests exist and pass | unit | `node --test test/config.test.cjs` | Wave 0 |

### Sampling Rate
- **Per task commit:** `node --test test/config.test.cjs`
- **Per wave merge:** `node --test test/*.test.cjs`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `test/config.test.cjs` -- covers CFG-01 through CFG-07, TRAP-05, TEST-04
- No framework install needed (node:test already in use)
- No shared fixtures needed (config tests are self-contained with temp directories)

## Sources

### Primary (HIGH confidence)
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` -- Smart Defaults table (lines 427-435), Config Toggles schema (lines 369-393), Stage 1 scoping (lines 37-63)
- `get-shit-done-r/bin/lib/config.cjs` -- Current VALID_CONFIG_KEYS, ensureConfigFile(), setConfigValue() patterns
- `get-shit-done-r/bin/lib/core.cjs` -- Current loadConfig() implementation with get() helper
- `get-shit-done-r/templates/config.json` -- Current template structure
- `get-shit-done-r/workflows/settings.md` -- Current settings UI pattern
- `.planning/phases/16-config-schema-and-defaults/16-CONTEXT.md` -- All locked decisions

### Secondary (MEDIUM confidence)
- `get-shit-done-r/bin/lib/init.cjs` -- Init command patterns for config propagation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing tooling
- Architecture: HIGH -- extends well-documented existing patterns in config.cjs and core.cjs
- Pitfalls: HIGH -- identified from direct code reading of current implementation
- Smart defaults table: HIGH -- copied verbatim from spec, locked in CONTEXT.md

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable -- internal project, no external dependency changes)
