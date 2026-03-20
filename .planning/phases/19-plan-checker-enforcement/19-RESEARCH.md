# Phase 19: Plan-Checker Enforcement - Research

**Researched:** 2026-03-19
**Domain:** Plan-checker CJS module extension, workflow integration, interactive gates
**Confidence:** HIGH

## Summary

Phase 19 extends the existing plan-checker infrastructure (4 structural checks in `plan-checker-rules.cjs`) with review-type-aware rigor enforcement. The implementation adds a RIGOR_LEVELS lookup table, 3 new CJS checks (primary source ratio, search strategy existence, inclusion/exclusion criteria existence), graduated enforcement by phase position, and a TRAP-02 interactive gate for review type mismatch. The planner agent prompt and plan-checker agent prompt also need updates to emit and assess new XML blocks.

The existing codebase provides strong patterns to follow: each check is a standalone function returning `{ valid, issues }`, the SMART_DEFAULTS table in config.cjs shows the lookup table pattern, and the revision loop in plan-inquiry.md (steps 10-12) already handles iteration. The primary integration gap is that `loadConfig()` in core.cjs resolves `plan_checker` from `workflow.plan_check` but returns a boolean (true/false), losing the string rigor level (strict/moderate/light). The init for plan-inquiry doesn't propagate the rigor level to downstream agents.

**Primary recommendation:** Follow the established patterns exactly -- RIGOR_LEVELS table mirrors SMART_DEFAULTS, new checks follow `{ valid, issues }` pattern, init.cjs propagates `plan_check_rigor` alongside the boolean `plan_checker_enabled`, and TRAP-02 gate fires after revision loop exhaustion using the existing CHECKPOINT box pattern.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **RIGOR_LEVELS lookup table** in plan-checker-rules.cjs (like SMART_DEFAULTS in config.cjs) -- maps strict/moderate/light to per-check severity (error/warning/skip)
- **Light level: warnings only** -- all 7 checks still run, but non-applicable checks produce advisory warnings instead of blocking errors. Nothing is silently skipped
- **Strict level: hard blocks** -- missing search strategy is a blocking error that goes back to planner for revision
- **Moderate: scoping requires search strategy, integrative/critical get warnings** -- matches the spec table exactly
- **Position-based threshold** -- first ~third of phases are 'early' (advisory), rest are 'late' (blocking). Automatic from roadmap position, no config needed
- **Warnings in checker output** -- checker returns `## VERIFICATION PASSED (with warnings)` for advisory issues
- **Only review-type-specific checks graduate** -- the 4 universal checks always block. Only the 3 new review-type-specific checks graduate by phase position
- **No override knob** -- position-based is automatic and TRAP-02 already handles individual overrides
- **TRAP-02 fires on blocking errors only** -- warnings don't trigger the gate
- **Standard checkpoint box** -- uses GSD checkpoint pattern (CHECKPOINT: Decision Required) with three options
- **Override is per-plan** -- applies to the current plan-inquiry run only
- **Downgrade is permanent** -- actually calls `applySmartDefaults()` to change config.json
- **Gate fires after revision loop exhaustion** -- if the planner can't fix the issue within 3 iterations, the gate presents
- **`tier="primary|secondary|tertiary"` attribute on `<src>` tags** -- checker counts ratio
- **`<search-strategy>` XML block at plan level** -- contains databases, keywords, date-range fields
- **`<criteria>` XML block at plan level** -- contains `<include>` and `<exclude>` sub-elements
- **Disciplinary diversity and methodological diversity are agent-level checks** -- too qualitative for CJS module
- **CJS module handles 5 structural checks** -- 4 existing + 1 new (primary source ratio). Search strategy and criteria block existence also checked by CJS, but content quality is agent-assessed
- **Planner agent prompt updated** -- grd-planner needs to know about `<search-strategy>`, `<criteria>`, and `tier` attribute

### Claude's Discretion
- Exact RIGOR_LEVELS table values and thresholds (e.g., primary source ratio per level)
- How to compute "first third of phases" from roadmap (e.g., Math.ceil(totalPhases / 3))
- Exact XML schema for `<search-strategy>` and `<criteria>` blocks
- How the grd-plan-checker agent prompt structures qualitative diversity assessment
- Test structure and assertion patterns for TEST-03

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PLAN-01 | Plan-checker validates against review type requirements (7 checks: source budget, no duplication, primary sources, systematic search strategy, multi-disciplinary perspectives, inclusion/exclusion criteria, diverse methodologies) | RIGOR_LEVELS table + 3 new CJS checks + 2 agent-level qualitative checks. Existing 4 CJS checks already cover source budget, duplication, acquisition methods, context budget. New CJS checks: primary source ratio, search-strategy block existence, criteria block existence. Agent prompt handles disciplinary and methodological diversity |
| PLAN-02 | Plan-checker uses graduated enforcement -- advisory warnings in early investigation phases, blocking errors in later phases | Position-based threshold using roadmap phase count. First third = advisory (warnings), rest = blocking (errors). Only the 3 new review-type-specific checks graduate; 4 universal checks always block |
| TRAP-02 | Review type mismatch interactive gate -- when plan-checker detects rigor below review type, offer "Downgrade review type" / "Add rigor" / "Override" | Gate fires after 3-iteration revision loop exhaustion on blocking errors only. Uses CHECKPOINT box pattern. Downgrade calls applySmartDefaults() to permanently change config.json. Override is per-plan only |
| TEST-03 | New tests cover review type enforcement in plan-checker | Tests for all 3 new CJS checks, RIGOR_LEVELS table behavior, graduated enforcement logic, and validateResearchPlan integration with rigor levels |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| node:test | Node built-in | Test framework | Already used in plan-checker-rules.test.cjs |
| node:assert/strict | Node built-in | Assertions | Already used in existing tests |

### Supporting
No new dependencies. All implementation is pure CJS module code extending existing files.

## Architecture Patterns

### Existing File Structure (no new files except tests)
```
grd/bin/lib/
  plan-checker-rules.cjs   # Add RIGOR_LEVELS, 3 new checks, update validateResearchPlan
  config.cjs               # No changes needed (SMART_DEFAULTS already has plan_check values)
  core.cjs                 # loadConfig() needs to propagate plan_check as string
  init.cjs                 # cmdInitPlanPhase needs plan_check_rigor + phase position fields

grd/workflows/
  plan-inquiry.md          # Steps 10-12: pass rigor level and phase position to checker, add TRAP-02 gate after step 12

test/
  plan-checker-rules.test.cjs  # Extend with new test suites for PLAN-01, PLAN-02, TEST-03
```

### Pattern 1: RIGOR_LEVELS Lookup Table
**What:** A constant object keyed by rigor level (strict/moderate/light) mapping each check to a severity (error/warning/skip).
**When to use:** When validateResearchPlan needs to determine whether an issue is blocking or advisory.
**Example:**
```javascript
// Mirrors SMART_DEFAULTS pattern in config.cjs
const RIGOR_LEVELS = {
  strict: {
    primary_source_ratio: 'error',      // >= 50% primary sources required
    search_strategy:      'error',      // <search-strategy> block must exist with all fields
    criteria:             'error',      // <criteria> block with <include> and <exclude> required
  },
  moderate: {
    primary_source_ratio: 'warning',    // advisory
    search_strategy:      'error',      // scoping reviews still require search strategy (Arksey & O'Malley)
    criteria:             'error',      // scoping reviews still require criteria
  },
  light: {
    primary_source_ratio: 'warning',    // advisory
    search_strategy:      'warning',    // advisory
    criteria:             'warning',    // advisory
  },
};
```

**Rationale for moderate level:** The spec table shows "Search strategy is systematic" applies to Systematic + Scoping, and "Inclusion/exclusion criteria stated" applies to Systematic + Scoping. Since scoping maps to moderate via SMART_DEFAULTS, search_strategy and criteria should be errors at moderate. Primary sources applies to Systematic + Integrative + Critical -- at moderate (scoping/integrative/critical), this is advisory since scoping doesn't require primary source prioritization per the spec.

### Pattern 2: Check Function Signature Extension
**What:** Each new check function accepts an optional `rigorLevel` parameter and returns `{ valid, issues, warnings }`.
**When to use:** For every check function, both old and new.
**Example:**
```javascript
/**
 * Check primary source ratio across research tasks.
 * @param {string} planContent
 * @param {string} rigorLevel - 'strict' | 'moderate' | 'light'
 * @returns {{ valid: boolean, issues: string[], warnings: string[] }}
 */
function checkPrimarySourceRatio(planContent, rigorLevel) {
  const issues = [];
  const warnings = [];
  const severity = RIGOR_LEVELS[rigorLevel]?.primary_source_ratio || 'warning';
  const tasks = extractTasks(planContent);

  let totalSources = 0;
  let primarySources = 0;
  for (const task of tasks) {
    if (task.type !== 'research') continue;
    for (const src of task.sources) {
      totalSources++;
      const attrs = parseAttrs(src.attrs);
      if (attrs.tier === 'primary') primarySources++;
    }
  }

  if (totalSources > 0 && primarySources / totalSources < 0.5) {
    const msg = `Primary source ratio ${primarySources}/${totalSources} (${Math.round(primarySources/totalSources*100)}%) is below 50% threshold`;
    if (severity === 'error') issues.push(msg);
    else warnings.push(msg);
  }

  return { valid: issues.length === 0, issues, warnings };
}
```

### Pattern 3: Graduated Enforcement in validateResearchPlan
**What:** The aggregator function accepts rigor level and phase position, downgrades new checks to warnings when in early phases.
**When to use:** When the caller (plan-inquiry workflow via checker agent) passes phase position info.
**Example:**
```javascript
/**
 * @param {string} planContent
 * @param {string} bootstrapContent
 * @param {object} options
 * @param {string} options.rigorLevel - 'strict' | 'moderate' | 'light'
 * @param {number} options.phaseNumber - current phase number
 * @param {number} options.totalPhases - total phases in roadmap
 */
function validateResearchPlan(planContent, bootstrapContent, options = {}) {
  const { rigorLevel = 'moderate', phaseNumber, totalPhases } = options;
  const allIssues = [];
  const allWarnings = [];

  // 4 universal checks -- always blocking, no graduation
  const universalChecks = [
    checkSourceDuplication(planContent, bootstrapContent),
    checkSourceLimits(planContent),
    checkAcquisitionMethods(planContent),
    checkContextBudget(planContent),
  ];
  for (const check of universalChecks) {
    allIssues.push(...check.issues);
  }

  // Determine effective rigor: downgrade to warnings if early phase
  let effectiveRigor = rigorLevel;
  if (phaseNumber && totalPhases) {
    const earlyThreshold = Math.ceil(totalPhases / 3);
    if (phaseNumber <= earlyThreshold) {
      effectiveRigor = 'light'; // all new checks become advisory in early phases
    }
  }

  // 3 review-type-specific checks -- graduate by phase position
  const newChecks = [
    checkPrimarySourceRatio(planContent, effectiveRigor),
    checkSearchStrategy(planContent, effectiveRigor),
    checkCriteria(planContent, effectiveRigor),
  ];
  for (const check of newChecks) {
    allIssues.push(...check.issues);
    allWarnings.push(...(check.warnings || []));
  }

  return {
    valid: allIssues.length === 0,
    issues: allIssues,
    warnings: allWarnings,
  };
}
```

### Pattern 4: TRAP-02 Gate in plan-inquiry.md
**What:** After revision loop exhaustion (iteration_count >= 3) with remaining blocking issues, present the CHECKPOINT gate instead of the current force/retry/abandon options.
**When to use:** Only when blocking errors remain from review-type-specific checks after 3 iterations.
**Example placement in plan-inquiry.md step 12:**
```markdown
**If iteration_count >= 3 AND blocking issues remain:**

Display:
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: Review Type Mismatch                            ║
╚══════════════════════════════════════════════════════════════╝

The plan-checker found issues that could not be resolved after 3 attempts:
{issue_list}

Current review type: {review_type} (plan_check: {rigor_level})

**Options:**
1. **Downgrade review type** to {lower_type} (relaxes rigor requirements permanently)
2. **Send back to planner** with additional guidance (retry with your input)
3. **Override and proceed** (this plan only; next phase starts fresh)

YOUR ACTION: Enter 1, 2, or 3
```

### Anti-Patterns to Avoid
- **Mutating existing check signatures without backward compatibility:** The existing 4 checks don't need `rigorLevel` -- they're universal. Don't add it to them. Only the 3 new checks and the aggregator need the parameter.
- **Breaking the `{ valid, issues }` return shape:** Existing callers expect this. Add `warnings` as a new optional field. Old code that only checks `valid` and `issues` continues to work.
- **Checking qualitative diversity in CJS:** Disciplinary and methodological diversity require reading comprehension -- these belong in the agent prompt, not the CJS module.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Review type to rigor level mapping | Hardcoded if/else chain | SMART_DEFAULTS in config.cjs already maps review_type -> plan_check level | Single source of truth already exists |
| Config persistence for downgrade | Manual fs.writeFileSync | `applySmartDefaults()` from config.cjs | Already handles the 4 smart default keys correctly |
| Phase position computation | Custom roadmap parser | `roadmap-analyze` command or init.cjs data | Roadmap analysis already extracts phase_count |
| XML attribute parsing | New regex | `parseAttrs()` in plan-checker-rules.cjs | Already handles `method`, `format`, `pages` -- `tier` is a natural addition |

**Key insight:** Nearly everything Phase 19 needs is an extension of existing infrastructure. The SMART_DEFAULTS pattern, check function pattern, parseAttrs utility, applySmartDefaults function, and revision loop all exist. The work is wiring them together with new fields.

## Common Pitfalls

### Pitfall 1: Boolean vs String plan_check in loadConfig
**What goes wrong:** `loadConfig()` in core.cjs currently resolves `workflow.plan_check` but the init output shows `plan_checker_enabled` as boolean. If the config has `plan_check: "strict"`, the boolean truthiness check works but the string value is lost.
**Why it happens:** The original design only needed on/off. Phase 16 added string values but init still treats it as boolean.
**How to avoid:** Add `plan_check_rigor` to the init output alongside `plan_checker_enabled`. In loadConfig, resolve `plan_check` as its actual value (string or boolean), then let init derive both: `plan_checker_enabled: !!config.plan_check` and `plan_check_rigor: typeof config.plan_check === 'string' ? config.plan_check : 'moderate'`.
**Warning signs:** Checker always getting 'moderate' regardless of config.

### Pitfall 2: Backward Compatibility of validateResearchPlan
**What goes wrong:** Existing callers pass `(planContent, bootstrapContent)` with no options. If the new signature requires options, old callers break.
**Why it happens:** The function is called from the checker agent.
**How to avoid:** Make `options` parameter optional with sensible defaults. When `rigorLevel` is missing, default to 'moderate'. When phase position is missing, skip graduation logic. The existing `{ valid, issues }` return still works -- `warnings` is a new field that old consumers simply ignore.
**Warning signs:** Existing 17 tests failing after changes.

### Pitfall 3: Phase Number Parsing for Graduated Enforcement
**What goes wrong:** Phase numbers can include letters (e.g., "15A") or decimals ("18.1"). `parseInt` of "15A" returns 15 but `parseInt` of "18.1" returns 18, losing precision.
**Why it happens:** Inserted phases use letter suffixes, and the codebase has `normalizePhaseName` and `comparePhaseNum` utilities.
**How to avoid:** Use the numeric comparison that already exists in core.cjs (`comparePhaseNum`). For early/late threshold, just get the phase's ordinal index in the roadmap phases array rather than parsing the phase number itself.
**Warning signs:** Inserted phases always being classified as "early" or "late" incorrectly.

### Pitfall 4: Confusing CJS Checks vs Agent-Level Checks
**What goes wrong:** Trying to implement all 7 spec checks in CJS when disciplinary diversity and methodological diversity are explicitly qualitative.
**Why it happens:** The spec lists 7 checks in a single table.
**How to avoid:** CJS handles 6 structural checks (4 existing + primary ratio + search strategy existence + criteria existence). The plan-checker agent prompt handles disciplinary diversity and methodological diversity qualitatively. The spec table's "Multiple disciplinary perspectives" and "Diverse methodologies" are agent assessments.
**Warning signs:** Trying to regex-match "multiple disciplines" in plan text.

### Pitfall 5: TRAP-02 Gate Placement
**What goes wrong:** Gate fires alongside the revision loop rather than after it.
**Why it happens:** Temptation to add the gate at step 11 (after any check failure).
**How to avoid:** The CONTEXT.md is explicit: gate fires AFTER revision loop exhaustion. Only modify step 12's `iteration_count >= 3` branch to present the CHECKPOINT gate instead of the current force/retry/abandon options.
**Warning signs:** Gate appearing on first check failure before planner has a chance to revise.

## Code Examples

### loadConfig Extension in core.cjs
```javascript
// In the return object of loadConfig(), add:
plan_check: (() => {
  const val = get('plan_check', { section: 'workflow', field: 'plan_check' });
  if (val === true) return 'moderate';  // backward compat
  if (val === false) return false;
  if (typeof val === 'string') return val;
  return 'moderate';  // default
})(),
// Keep existing plan_checker for boolean backward compat:
plan_checker: get('plan_checker', { section: 'workflow', field: 'plan_check' }) ?? defaults.plan_checker,
```

### init.cjs Extension for plan-inquiry
```javascript
// In cmdInitPlanPhase result object, add alongside plan_checker_enabled:
plan_check_rigor: config.plan_check || 'moderate',

// Add phase position data for graduated enforcement:
// (Need to get total phases from roadmap analysis)
total_phases: (() => {
  try {
    const roadmapPath = path.join(cwd, '.planning', 'ROADMAP.md');
    const content = stripShippedMilestones(fs.readFileSync(roadmapPath, 'utf-8'));
    const matches = content.match(/#{2,4}\s*Phase\s+\d+[A-Z]?(?:\.\d+)*\s*:/gi);
    return matches ? matches.length : null;
  } catch { return null; }
})(),
```

### Search Strategy Check
```javascript
function checkSearchStrategy(planContent, rigorLevel) {
  const issues = [];
  const warnings = [];
  const severity = RIGOR_LEVELS[rigorLevel]?.search_strategy || 'warning';

  const hasBlock = /<search-strategy>[\s\S]*?<\/search-strategy>/.test(planContent);
  if (!hasBlock) {
    const msg = 'Missing <search-strategy> block (databases, keywords, date-range required)';
    if (severity === 'error') issues.push(msg);
    else warnings.push(msg);
    return { valid: issues.length === 0, issues, warnings };
  }

  // Validate required fields within the block
  const block = planContent.match(/<search-strategy>([\s\S]*?)<\/search-strategy>/)[1];
  const requiredFields = ['databases', 'keywords', 'date-range'];
  for (const field of requiredFields) {
    const fieldRegex = new RegExp(`<${field}>[\\s\\S]*?<\\/${field}>`);
    if (!fieldRegex.test(block)) {
      const msg = `<search-strategy> missing required field: <${field}>`;
      if (severity === 'error') issues.push(msg);
      else warnings.push(msg);
    }
  }

  return { valid: issues.length === 0, issues, warnings };
}
```

### Criteria Check
```javascript
function checkCriteria(planContent, rigorLevel) {
  const issues = [];
  const warnings = [];
  const severity = RIGOR_LEVELS[rigorLevel]?.criteria || 'warning';

  const hasBlock = /<criteria>[\s\S]*?<\/criteria>/.test(planContent);
  if (!hasBlock) {
    const msg = 'Missing <criteria> block (inclusion/exclusion criteria required)';
    if (severity === 'error') issues.push(msg);
    else warnings.push(msg);
    return { valid: issues.length === 0, issues, warnings };
  }

  const block = planContent.match(/<criteria>([\s\S]*?)<\/criteria>/)[1];
  const hasInclude = /<include>[\s\S]*?<\/include>/.test(block);
  const hasExclude = /<exclude>[\s\S]*?<\/exclude>/.test(block);

  if (!hasInclude) {
    const msg = '<criteria> missing <include> sub-element';
    if (severity === 'error') issues.push(msg);
    else warnings.push(msg);
  }
  if (!hasExclude) {
    const msg = '<criteria> missing <exclude> sub-element';
    if (severity === 'error') issues.push(msg);
    else warnings.push(msg);
  }

  return { valid: issues.length === 0, issues, warnings };
}
```

### Suggested XML Schema for Planner Prompt
```xml
<!-- Plan-level blocks (outside <tasks>) -->
<search-strategy>
  <databases>PubMed, PsycINFO, Web of Science, Google Scholar</databases>
  <keywords>self-determination theory AND values, intrinsic motivation AND personal values</keywords>
  <date-range>2000-2026</date-range>
</search-strategy>

<criteria>
  <include>
    - Peer-reviewed empirical studies
    - English language
    - SDT or values theory as primary framework
  </include>
  <exclude>
    - Non-peer-reviewed grey literature (unless seminal)
    - Studies without empirical data
    - Publications before 2000
  </exclude>
</criteria>

<!-- Source-level attribute -->
<src method="firecrawl" format="md" tier="primary">https://doi.org/10.1234/example</src>
<src method="web_fetch" format="md" tier="secondary">https://review-article.com</src>
<src method="firecrawl" format="md" tier="tertiary">https://textbook.com/chapter</src>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| plan_check: boolean (on/off) | plan_check: string (strict/moderate/light) | Phase 16 (config.cjs) | SMART_DEFAULTS already maps review types to rigor levels |
| 4 universal structural checks | 7 checks (4 universal + 3 review-type-specific) | Phase 19 (this phase) | Enables review-type-appropriate validation |
| Binary pass/fail for all checks | Graduated error/warning by phase position | Phase 19 (this phase) | Early phases get advisory feedback, late phases get blocking |

## Open Questions

1. **Exactly how plan-inquiry.md currently passes data to checker agent**
   - What we know: Steps 10-12 show the checker prompt template with `{phase_number}`, `{goal from ROADMAP}`, and file paths. The checker reads plan files directly.
   - What's unclear: Whether the CJS `validateResearchPlan` is called from within the checker agent prompt or from plan-inquiry.md itself before spawning the checker.
   - Recommendation: Based on the code, `plan-checker-rules.cjs` is a CJS module called via `grd-tools.cjs` or directly by the checker agent. The checker agent prompt should be updated to instruct the checker to use the CJS module with rigor level and phase position parameters. The plan-inquiry workflow passes these values in the checker prompt context.

2. **Where the checker agent prompt lives**
   - What we know: model-profiles.md lists `grd-plan-checker` at sonnet quality. The checker prompt is constructed inline in plan-inquiry.md step 10.
   - What's unclear: Whether there's a separate agent system prompt file for grd-plan-checker.
   - Recommendation: The checker prompt is inline in plan-inquiry.md. Updates to the checker's qualitative assessment instructions go in step 10's prompt template.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | node:test (built-in) |
| Config file | none -- uses node --test directly |
| Quick run command | `node --test test/plan-checker-rules.test.cjs` |
| Full suite command | `node grd/bin/grd-tools.cjs run-tests` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PLAN-01 | RIGOR_LEVELS table maps levels to severities | unit | `node --test test/plan-checker-rules.test.cjs` | Extend existing |
| PLAN-01 | checkPrimarySourceRatio detects low ratio | unit | `node --test test/plan-checker-rules.test.cjs` | Extend existing |
| PLAN-01 | checkSearchStrategy validates block and fields | unit | `node --test test/plan-checker-rules.test.cjs` | Extend existing |
| PLAN-01 | checkCriteria validates include/exclude | unit | `node --test test/plan-checker-rules.test.cjs` | Extend existing |
| PLAN-01 | validateResearchPlan with rigor levels | unit | `node --test test/plan-checker-rules.test.cjs` | Extend existing |
| PLAN-02 | Early phase downgrades new checks to warnings | unit | `node --test test/plan-checker-rules.test.cjs` | Extend existing |
| PLAN-02 | Late phase keeps new checks as errors | unit | `node --test test/plan-checker-rules.test.cjs` | Extend existing |
| PLAN-02 | Universal checks never graduate | unit | `node --test test/plan-checker-rules.test.cjs` | Extend existing |
| TRAP-02 | applySmartDefaults correctly downgrades | unit | `node --test test/config.test.cjs` | Existing (Phase 16) |
| TEST-03 | All new review type enforcement tests pass | unit | `node --test test/plan-checker-rules.test.cjs` | Extend existing |

### Sampling Rate
- **Per task commit:** `node --test test/plan-checker-rules.test.cjs`
- **Per wave merge:** `node grd/bin/grd-tools.cjs run-tests`
- **Phase gate:** Full suite green before `/grd:verify-inquiry`

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. Tests extend the existing `test/plan-checker-rules.test.cjs` file.

## Sources

### Primary (HIGH confidence)
- `grd/bin/lib/plan-checker-rules.cjs` -- existing 4 checks, extractTasks(), parseAttrs() utilities (read directly)
- `grd/bin/lib/config.cjs` -- SMART_DEFAULTS table, applySmartDefaults(), canDowngrade() (read directly)
- `grd/bin/lib/core.cjs` -- loadConfig() with plan_checker resolution (read directly)
- `grd/bin/lib/init.cjs` -- cmdInitPlanPhase output structure (read directly)
- `grd/workflows/plan-inquiry.md` -- steps 10-12 checker invocation and revision loop (read directly)
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` -- Stage 3 plan-checker table, Smart Defaults, Trap Door Inventory (read directly)
- `test/plan-checker-rules.test.cjs` -- existing test patterns and fixtures (read directly)
- `.planning/phases/19-plan-checker-enforcement/19-CONTEXT.md` -- locked decisions (read directly)

### Secondary (MEDIUM confidence)
None needed -- all findings from direct code inspection.

### Tertiary (LOW confidence)
None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, extending existing CJS modules
- Architecture: HIGH -- all patterns directly observed in existing code
- Pitfalls: HIGH -- identified from direct code inspection of loadConfig, init, and plan-inquiry
- Code examples: HIGH -- based on existing patterns with trivial extensions

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable -- internal codebase, no external dependency drift)
