# Phase 16: Config Schema and Defaults - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Add researcher_tier, review_type, and epistemological_stance to config.json with smart defaults cascade, configWithDefaults() for backward compatibility, workflow toggles (critical_appraisal, temporal_positioning), and review type downgrade support via /grd:settings.

</domain>

<decisions>
## Implementation Decisions

### Smart Defaults Cascade
- Use the spec's Smart Defaults table exactly as defined:
  - systematic: critical_appraisal=required, temporal_positioning=required, synthesis=required, plan_check=strict
  - scoping: critical_appraisal=charting, temporal_positioning=recommended, synthesis=recommended, plan_check=moderate
  - integrative: critical_appraisal=proportional, temporal_positioning=recommended, synthesis=required, plan_check=moderate
  - critical: critical_appraisal=proportional, temporal_positioning=recommended, synthesis=required, plan_check=moderate
  - narrative: critical_appraisal=optional, temporal_positioning=optional, synthesis=optional, plan_check=light
- **Reset on type change** -- when review_type changes, ALL workflow toggles reset to the new type's smart defaults. User overrides do NOT survive type changes. Clean slate.

### Scoping UX in new-research
- Question order: **Tier → Review type → Epistemology** (tier first so language adapts for subsequent questions)
- **All three are skippable** with sensible defaults:
  - researcher_tier: defaults to `standard`
  - review_type: defaults to `narrative`
  - epistemological_stance: defaults to `pragmatist`
- Epistemology at Guided tier uses plain-language framing per spec: "How do you think about evidence? (a) numbers and data, (b) context and perspective, (c) whatever helps answer the question, (d) challenge power structures"

### configWithDefaults() Behavior
- **Deep-merge with defaults** -- missing keys get defaults, existing keys preserved
- No crash, no prompt, no notification
- Existing v1.1 projects silently get: researcher_tier=standard, review_type=narrative, epistemological_stance=pragmatist, plus all workflow toggles from narrative smart defaults
- Deep-merge means nested objects (workflow.*) merge key-by-key, not replace wholesale

### Review Type Downgrade
- **Downgrades only** -- upgrading review type (e.g., narrative → systematic) is not allowed. Start a new study for higher rigor.
- **Confirmation required** before downgrade -- show exactly what changes: which toggles relax, from what to what
- Downgrade resets all workflow toggles to the new type's smart defaults (same reset-on-change behavior as initial selection)
- Existing notes are unaffected -- only future enforcement changes

### Claude's Discretion
- Exact implementation of configWithDefaults() deep-merge logic
- How VALID_CONFIG_KEYS is extended for new fields
- Whether smart defaults are stored as a lookup table or computed function
- Test structure and assertion patterns

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Config Schema
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Trap Door Inventory → Config Toggles -- exact config.json schema with all fields
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Smart Defaults by Review Type -- the 5×4 defaults table
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` §Stage 1 -- scoping question definitions, tier descriptions, review type descriptions, epistemological stance options

### Existing Config Infrastructure
- `get-shit-done-r/bin/lib/config.cjs` -- VALID_CONFIG_KEYS, ensureConfigFile(), setConfigValue(), cmdConfigSetModelProfile() (just synced in Phase 15)
- `get-shit-done-r/bin/lib/init.cjs` -- config propagation to workflows
- `get-shit-done-r/templates/config.json` -- default config template

### Requirements
- `.planning/REQUIREMENTS.md` -- CFG-01 through CFG-07, TRAP-05, TEST-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `config.cjs:VALID_CONFIG_KEYS` -- Set of valid config keys, needs extension with new fields
- `config.cjs:ensureConfigFile()` -- Creates config if missing, good foundation for configWithDefaults()
- `config.cjs:setConfigValue()` -- Handles nested key paths (e.g., workflow.critical_appraisal), already supports dot notation
- `config.cjs:validateKnownConfigKeyPath()` -- Key path validation with suggestions, extend for new keys
- `init.cjs` -- Propagates config values to workflow JSON, needs to include new fields

### Established Patterns
- Config keys use dot notation for nesting: `workflow.research`, `workflow.plan_check`
- `VALID_CONFIG_KEYS` is a flat Set of dot-notation strings
- Config template at `templates/config.json` sets initial defaults for new projects
- `gsd-r-tools.cjs` routes CLI commands to config functions

### Integration Points
- `new-project.md` / `new-milestone.md` workflows prompt for config during project creation -- will need the 3 new scoping questions added
- `settings.md` workflow handles config changes -- will need review type downgrade logic
- `init.cjs` outputs config values in the init JSON consumed by all workflows

</code_context>

<specifics>
## Specific Ideas

- Smart defaults table is the source of truth -- implement as a lookup, not scattered conditionals
- Deep-merge must handle the case where workflow.* has some keys but not others (partial v1.1 config)
- The 3 scoping questions will be added to new-research in Phase 18, not in this phase -- Phase 16 only builds the config infrastructure

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 16-config-schema-and-defaults*
*Context gathered: 2026-03-17*
