# Phase 20: Three-Tier Verification - Research

**Researched:** 2026-03-20
**Domain:** Verification pipeline orchestration, sufficiency assessment, research note analysis
**Confidence:** HIGH

## Summary

Phase 20 adds a Tier 0 (sufficiency) verification step before the existing Tier 1 (goal-backward) and Tier 2 (source audit) verification. The implementation follows the established CJS-module-plus-agent-prompt split pattern from Phase 19: structural checks (note count per objective, era coverage, theme convergence heuristic) live in a new `verify-sufficiency.cjs` module, while qualitative assessment (saturation judgment, epistemological consistency) is handled by the verifier agent prompt.

The existing `verify-research.cjs` module provides `parseFrontmatter()` and `extractSection()` which can parse note frontmatter fields (`era`, `review_type`, `inquiry`, `status`) and extract markdown sections (Key Findings, Evidence Quality). The existing `verifyNote()` function in that module runs Tier 1 then Tier 2 sequentially -- Phase 20 inserts Tier 0 before this pipeline. The existing `verify-inquiry.md` workflow orchestrates a single verifier agent; the three-tier pipeline runs as three sequential passes within that same agent spawn.

The saturation gate (TRAP-03) follows the TRAP-02 checkpoint pattern established in Phase 19: a CHECKPOINT box with three options fires only when Tier 0 detects insufficiency. The `--skip-tier0` flag propagates through `init.cjs` similarly to how `--skip-verify` works for plan-checker.

**Primary recommendation:** Create `verify-sufficiency.cjs` with structural check functions, update `verify-inquiry.md` to orchestrate the three-tier pipeline with the saturation gate, and update `init.cjs` to propagate `--skip-tier0`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Multi-signal heuristic** for sufficiency: combine note count vs. expected range, theme coverage against REQUIREMENTS.md objectives, recency (zero contemporary sources), source diversity (methodological mix). Agent weighs signals holistically
- **Coverage depth scaling by review type:**
  - Systematic: every REQUIREMENTS.md objective must have >=3 notes with primary sources AND no objective has only one methodological approach
  - Scoping: every objective has >=1 note AND the overall collection spans the stated disciplinary scope
  - Narrative: >=1 note per objective, no diversity requirement
- **Temporal coverage for systematic and scoping** -- systematic reviews should span at least 3 of 4 eras (foundational/developmental/contemporary/emerging). Scoping reviews should have at least foundational + contemporary. Narrative has no temporal requirement. Uses `era` frontmatter field from Phase 18
- **Theme convergence heuristic for saturation** -- look at the last N notes added: if they introduce zero new themes, signal potential saturation. Agent checks if recent notes are confirming vs. extending. Lightweight, no formal coding required
- **Saturation gate fires on insufficiency findings only** -- gate fires when Tier 0 finds coverage gaps or saturation NOT reached. If everything looks sufficient, no gate
- **Standard checkpoint box** consistent with TRAP-02 pattern. Three options: "Evidence is sufficient" / "Continue investigating" / "Add inquiry"
- **Tier 0 blocks Tier 1 and Tier 2** -- if evidence insufficient, no point checking quality or sources. Tier 0 failure -> saturation gate -> researcher decides
- **One agent, three passes** -- single grd-verifier agent runs all three tiers sequentially
- **CJS module + agent split** -- structural checks in `verify-sufficiency.cjs`, qualitative saturation/epistemological assessment in agent prompt
- **`--skip-tier0` skips silently** -- Tier 0 section shows "Skipped (--skip-tier0)". Tiers 1+2 run normally
- **Epistemological consistency is agent qualitative assessment only** -- verifier reads stance from config, checks note consistency. Warning only, never blocks. Pragmatist auto-pass

### Claude's Discretion
- Exact note count thresholds per review type for the multi-signal heuristic
- How "last N notes" is determined for theme convergence (e.g., last 3 or last 5)
- Exact structure of verify-sufficiency.cjs module (which functions, what they return)
- How the verifier agent prompt structures the three-pass report
- How to read research notes and their frontmatter for the sufficiency assessment
- Test structure and assertion patterns

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VER-01 | Tier 0 sufficiency verification checks whether enough evidence has been gathered for the selected review type, including saturation assessment and epistemological consistency check | `verify-sufficiency.cjs` structural checks + agent qualitative assessment; `parseFrontmatter()` reads `era`, `review_type`, `inquiry` fields; `extractSection()` reads Key Findings and Evidence Quality |
| VER-02 | Sufficiency criteria scale by review type (systematic=exhaustive, scoping=representative, narrative=adequate coverage) | `SUFFICIENCY_CRITERIA` lookup table in CJS module mirrors `RIGOR_LEVELS` pattern from `plan-checker-rules.cjs`; `SMART_DEFAULTS` in `config.cjs` already maps review types |
| VER-03 | Three-tier pipeline: Tier 0 -> Tier 1 -> Tier 2, with `--skip-tier0` flag | `verify-inquiry.md` workflow update to orchestrate pipeline; `init.cjs` propagation of skip flag; existing `verifyNote()` runs Tier 1+2 |
| TRAP-03 | Saturation interactive gate in Tier 0 verification -- offer "Evidence is sufficient" / "Continue investigating" / "Add inquiry" | Standard CHECKPOINT box in `verify-inquiry.md` matching TRAP-02 pattern from Phase 19 |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js `node:test` | Built-in (v22.x) | Test framework | Already used across all 15 test files |
| Node.js `node:assert/strict` | Built-in | Assertions | Project standard |
| Node.js `node:fs/promises` | Built-in | Async file operations | Used in verify-research.cjs |
| Node.js `node:path` | Built-in | Path manipulation | Used everywhere |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `verify-research.cjs` | Local | `parseFrontmatter()`, `extractSection()`, `verifyTier1()`, `verifyTier2()`, `verifyNote()` | Reading note frontmatter and running existing Tier 1+2 |
| `config.cjs` | Local | `SMART_DEFAULTS`, `configWithDefaults()`, `REVIEW_TYPE_ORDER` | Getting review type and epistemological stance |
| `plan-checker-rules.cjs` | Local | `RIGOR_LEVELS` pattern | Design pattern reference for `SUFFICIENCY_CRITERIA` |

No external dependencies needed. Everything is built on Node.js built-ins and existing CJS modules.

## Architecture Patterns

### New File Structure
```
grd/
├── bin/lib/
│   ├── verify-sufficiency.cjs    # NEW: Tier 0 structural checks
│   ├── verify-research.cjs       # EXISTING: Tier 1 + Tier 2 (unchanged)
│   ├── verify.cjs                # EXISTING: cmdVerifySummary (unchanged)
│   └── config.cjs                # EXISTING: SMART_DEFAULTS (unchanged)
├── workflows/
│   └── verify-inquiry.md         # MODIFIED: Insert Tier 0 + saturation gate
test/
└── verify-sufficiency.test.cjs   # NEW: Tests for Tier 0 structural checks
```

### Pattern 1: SUFFICIENCY_CRITERIA Lookup Table
**What:** A per-review-type configuration object mirroring `RIGOR_LEVELS` from plan-checker-rules.cjs
**When to use:** Every Tier 0 structural check consults this table to determine thresholds
**Example:**
```javascript
// Mirrors plan-checker-rules.cjs RIGOR_LEVELS pattern
const SUFFICIENCY_CRITERIA = {
  systematic: {
    min_notes_per_objective: 3,
    require_primary_sources: true,
    require_methodological_diversity: true,
    min_eras: 3,  // 3 of 4 eras required
    eras_required: true,
  },
  scoping: {
    min_notes_per_objective: 1,
    require_primary_sources: false,
    require_methodological_diversity: false,
    min_eras: 2,  // foundational + contemporary minimum
    eras_required: true,
  },
  integrative: {
    min_notes_per_objective: 1,
    require_primary_sources: false,
    require_methodological_diversity: false,
    min_eras: 0,
    eras_required: false,
  },
  critical: {
    min_notes_per_objective: 1,
    require_primary_sources: false,
    require_methodological_diversity: false,
    min_eras: 0,
    eras_required: false,
  },
  narrative: {
    min_notes_per_objective: 1,
    require_primary_sources: false,
    require_methodological_diversity: false,
    min_eras: 0,
    eras_required: false,
  },
};
```

### Pattern 2: CJS Module Returns `{ sufficient, gaps, warnings }` Object
**What:** Each check function returns a structured result. The combined function aggregates.
**When to use:** All verify-sufficiency.cjs functions
**Example:**
```javascript
// Consistent with plan-checker { valid, issues } pattern but adapted for sufficiency
function checkObjectiveCoverage(notes, objectives, reviewType) {
  const criteria = SUFFICIENCY_CRITERIA[reviewType] || SUFFICIENCY_CRITERIA.narrative;
  const gaps = [];

  for (const objective of objectives) {
    const matchingNotes = notes.filter(n => /* keyword match or inquiry match */);
    if (matchingNotes.length < criteria.min_notes_per_objective) {
      gaps.push({
        type: 'objective_coverage',
        objective: objective.id,
        found: matchingNotes.length,
        required: criteria.min_notes_per_objective,
      });
    }
  }

  return { sufficient: gaps.length === 0, gaps };
}
```

### Pattern 3: Agent Three-Pass Report Structure
**What:** The verifier agent prompt structures output as three sequential tier sections
**When to use:** verify-inquiry.md agent prompt
**Example report structure:**
```markdown
## Tier 0: Sufficiency Assessment

### Coverage Summary
| Objective | Notes | Required | Status |
|-----------|-------|----------|--------|
| OBJ-01 | 4 | 3 | PASS |
| OBJ-02 | 1 | 3 | GAP |

### Era Coverage
[foundational: 3, developmental: 2, contemporary: 5, emerging: 1] -- 4/4 eras (PASS)

### Saturation Assessment
Last 3 notes introduced 0 new themes. Evidence appears saturated.

### Epistemological Consistency
Pragmatist stance: methodological flexibility expected. (AUTO-PASS)

**Tier 0 Result:** PASS / INSUFFICIENT

## Tier 1: Goal-Backward Verification
[existing format unchanged]

## Tier 2: Source Audit
[existing format unchanged]
```

### Pattern 4: Checkpoint Box for Saturation Gate (TRAP-03)
**What:** Standard CHECKPOINT matching TRAP-02 established pattern
**When to use:** In verify-inquiry.md, fires only when Tier 0 finds insufficiency
**Example:**
```
CHECKPOINT: Sufficiency Assessment

Tier 0 found the following gaps:
- OBJ-02: only 1 note (systematic requires 3)
- No emerging-era sources found

[1] Evidence is sufficient -- override and proceed to Tier 1
[2] Continue investigating -- return to /grd:conduct-inquiry to gather more evidence
[3] Add inquiry -- route to /grd:add-inquiry to create a new line of inquiry
```

### Anti-Patterns to Avoid
- **Separate agent spawns per tier:** Use one agent, three sequential passes. Context from Tier 0 informs Tier 1.
- **Blocking on epistemological consistency:** This is advisory only. Never block progression.
- **Formal NLP for theme convergence:** Agent reads Key Findings sections and assesses overlap. No tokenization or embedding needed.
- **Running Tier 1/2 when Tier 0 fails:** The pipeline short-circuits. If Tier 0 detects insufficiency and the user doesn't override, Tiers 1 and 2 do not run.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frontmatter parsing | Custom YAML parser | `verify-research.cjs:parseFrontmatter()` | Already handles the note format, extracts era/review_type/inquiry/status |
| Section extraction | Custom regex parsing | `verify-research.cjs:extractSection()` | Already extracts by heading prefix, case-insensitive |
| Review type config | Hardcoded thresholds | `config.cjs:SMART_DEFAULTS` + `configWithDefaults()` | Already has review_type -> workflow mapping |
| Tier 1 + Tier 2 checks | Reimplementation | `verify-research.cjs:verifyTier1()`, `verifyTier2()`, `verifyNote()` | Existing, tested, stable |
| Keyword extraction | NLP library | `verify-research.cjs:extractKeywords()` | Already has stop word filtering |

**Key insight:** The existing verify-research.cjs module already has the parsing infrastructure. Phase 20 adds a new module that calls the same parsers, not rebuilds them.

## Common Pitfalls

### Pitfall 1: Note Discovery Path
**What goes wrong:** Tier 0 needs to find all research notes across all inquiry phases, not just the current phase being verified.
**Why it happens:** Existing Tier 1/2 verification is phase-scoped (verify notes in one phase). Tier 0 is study-scoped (assess sufficiency across all phases).
**How to avoid:** The CJS module should accept a vault path or note directory and glob for all `*.md` files with research note frontmatter (has `inquiry` field). The agent prompt should specify the scope.
**Warning signs:** Tests only test single-phase note collections.

### Pitfall 2: Objective Parsing from REQUIREMENTS.md
**What goes wrong:** REQUIREMENTS.md objectives have a specific format that needs reliable parsing. The IDs (REQ-01 style or custom like VER-01) and descriptions need to be extracted.
**Why it happens:** Different projects may format objectives differently.
**How to avoid:** Parse the `- [ ] **ID**: description` or `- [x] **ID**: description` format that REQUIREMENTS.md uses. Use regex that matches the actual format in the file.
**Warning signs:** Hardcoded objective lists instead of dynamic parsing.

### Pitfall 3: Era Field May Be Absent
**What goes wrong:** The `era` field is optional (`config.workflow.temporal_positioning: false` skips it). Tier 0 era coverage checks must handle notes without era fields.
**Why it happens:** Narrative reviews default to optional temporal positioning. The field can be `null` or absent.
**How to avoid:** Check `config.workflow.temporal_positioning` before running era coverage checks. If disabled, skip the era check entirely. Also handle individual notes where `era` is missing/null.
**Warning signs:** Era coverage check throws when encountering notes without the field.

### Pitfall 4: Theme Convergence is Agent-Only
**What goes wrong:** Trying to build a CJS function for theme convergence (comparing themes across notes).
**Why it happens:** Theme comparison feels structural but is actually qualitative -- it requires understanding semantic similarity of findings.
**How to avoid:** Theme convergence is explicitly an agent qualitative assessment. The CJS module provides the data (note Key Findings sections), and the agent does the comparison. Don't try to automate this in CJS.
**Warning signs:** Keyword overlap functions being used as theme detection.

### Pitfall 5: init.cjs Flag Propagation
**What goes wrong:** `--skip-tier0` not available to the verifier agent.
**Why it happens:** The flag needs to be parsed from `$ARGUMENTS` in `verify-inquiry.md` and propagated through init.cjs.
**How to avoid:** Follow the pattern of how other flags are propagated. Check how `--skip-verify` flows from the workflow through init.cjs. Add `skip_tier0` to the `cmdInitVerifyWork` result object.
**Warning signs:** Flag works at CLI level but agent doesn't see it.

## Code Examples

### Reading All Notes from Vault
```javascript
// Source: verify-research.cjs parseFrontmatter pattern
const fs = require('node:fs');
const path = require('node:path');
const { parseFrontmatter, extractSection } = require('./verify-research.cjs');

/**
 * Discover all research notes in the vault directory.
 * @param {string} vaultDir - Path to the research vault
 * @returns {Array<{ path: string, frontmatter: Object, keyFindings: string|null }>}
 */
function discoverNotes(vaultDir) {
  const notes = [];
  // Walk subdirectories (inquiry folders)
  const entries = fs.readdirSync(vaultDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const subDir = path.join(vaultDir, entry.name);
    const files = fs.readdirSync(subDir).filter(f => f.endsWith('.md') && !f.startsWith('SOURCE-LOG'));
    for (const file of files) {
      const filePath = path.join(subDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const fm = parseFrontmatter(content);
      if (fm.inquiry || fm.domain) {  // It's a research note
        notes.push({
          path: filePath,
          frontmatter: fm,
          keyFindings: extractSection(content, 'Key Findings'),
        });
      }
    }
  }
  return notes;
}
```

### Objective Coverage Check
```javascript
/**
 * Check if objectives have sufficient note coverage.
 * @param {Array} notes - Discovered notes with frontmatter
 * @param {Array<{id: string, description: string}>} objectives - Parsed objectives
 * @param {string} reviewType - systematic|scoping|narrative|etc.
 * @returns {{ sufficient: boolean, gaps: Array }}
 */
function checkObjectiveCoverage(notes, objectives, reviewType) {
  const criteria = SUFFICIENCY_CRITERIA[reviewType] || SUFFICIENCY_CRITERIA.narrative;
  const gaps = [];

  for (const obj of objectives) {
    // Match notes to objectives by keyword overlap or inquiry number
    const keywords = obj.description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matching = notes.filter(n => {
      const findings = (n.keyFindings || '').toLowerCase();
      return keywords.some(k => findings.includes(k));
    });

    if (matching.length < criteria.min_notes_per_objective) {
      gaps.push({
        type: 'objective_coverage',
        objective: obj.id,
        description: obj.description,
        found: matching.length,
        required: criteria.min_notes_per_objective,
      });
    }
  }

  return { sufficient: gaps.length === 0, gaps };
}
```

### Era Coverage Check
```javascript
/**
 * Check temporal coverage across eras.
 * @param {Array} notes - Notes with frontmatter.era field
 * @param {string} reviewType - Review type from config
 * @param {boolean} temporalEnabled - config.workflow.temporal_positioning
 * @returns {{ sufficient: boolean, gaps: Array, eraDistribution: Object }}
 */
function checkEraCoverage(notes, reviewType, temporalEnabled) {
  if (!temporalEnabled) {
    return { sufficient: true, gaps: [], eraDistribution: {}, skipped: true };
  }

  const criteria = SUFFICIENCY_CRITERIA[reviewType] || SUFFICIENCY_CRITERIA.narrative;
  if (!criteria.eras_required) {
    return { sufficient: true, gaps: [], eraDistribution: {} };
  }

  const VALID_ERAS = ['foundational', 'developmental', 'contemporary', 'emerging'];
  const eraDistribution = {};
  for (const era of VALID_ERAS) eraDistribution[era] = 0;

  for (const note of notes) {
    const era = note.frontmatter.era;
    if (era && VALID_ERAS.includes(era)) {
      eraDistribution[era]++;
    }
  }

  const erasPresent = Object.values(eraDistribution).filter(c => c > 0).length;
  const gaps = [];

  if (erasPresent < criteria.min_eras) {
    gaps.push({
      type: 'era_coverage',
      erasPresent,
      required: criteria.min_eras,
      distribution: { ...eraDistribution },
    });
  }

  return { sufficient: gaps.length === 0, gaps, eraDistribution };
}
```

### Combined Sufficiency Check
```javascript
/**
 * Run all Tier 0 structural checks.
 * Returns a combined result the agent uses alongside qualitative assessment.
 */
function verifySufficiency(notes, objectives, config) {
  const reviewType = config.review_type || 'narrative';
  const temporalEnabled = config.workflow?.temporal_positioning !== false;

  const coverage = checkObjectiveCoverage(notes, objectives, reviewType);
  const eraCov = checkEraCoverage(notes, reviewType, temporalEnabled);

  const allGaps = [...coverage.gaps, ...eraCov.gaps];

  return {
    sufficient: allGaps.length === 0,
    gaps: allGaps,
    summary: {
      total_notes: notes.length,
      objectives_checked: objectives.length,
      review_type: reviewType,
      era_distribution: eraCov.eraDistribution,
    },
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Two-tier verification (Tier 1 + Tier 2) | Three-tier (Tier 0 + Tier 1 + Tier 2) | Phase 20 (this phase) | Catches insufficient evidence before quality/completeness checks |
| No sufficiency assessment | Multi-signal heuristic per review type | Phase 20 | Prevents premature synthesis with inadequate evidence |
| No saturation detection | Theme convergence heuristic | Phase 20 | Signals when further investigation yields diminishing returns |

**Unchanged from existing:**
- `verifyTier1()` -- goal-backward verification (verify-research.cjs) stays as-is
- `verifyTier2()` -- source audit (verify-research.cjs) stays as-is
- `verifyNote()` -- combined function stays as-is (called after Tier 0 passes/skipped)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in `node:test` (v22.x) |
| Config file | `scripts/run-tests.cjs` (test runner) |
| Quick run command | `node --test test/verify-sufficiency.test.cjs` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VER-01 | Sufficiency check detects insufficient notes per objective | unit | `node --test test/verify-sufficiency.test.cjs` | Wave 0 |
| VER-01 | Saturation heuristic data extraction (Key Findings from last N notes) | unit | `node --test test/verify-sufficiency.test.cjs` | Wave 0 |
| VER-01 | Epistemological consistency: pragmatist auto-pass | unit | `node --test test/verify-sufficiency.test.cjs` | Wave 0 |
| VER-02 | Systematic review requires >=3 notes per objective + era coverage | unit | `node --test test/verify-sufficiency.test.cjs` | Wave 0 |
| VER-02 | Scoping review requires >=1 note + foundational+contemporary eras | unit | `node --test test/verify-sufficiency.test.cjs` | Wave 0 |
| VER-02 | Narrative review requires >=1 note, no era requirement | unit | `node --test test/verify-sufficiency.test.cjs` | Wave 0 |
| VER-03 | Pipeline short-circuits when Tier 0 fails (no Tier 1/2) | integration | `node --test test/verify-sufficiency.test.cjs` | Wave 0 |
| VER-03 | --skip-tier0 skips Tier 0, runs Tier 1+2 normally | unit | `node --test test/verify-sufficiency.test.cjs` | Wave 0 |
| TRAP-03 | Saturation gate checkpoint box format | manual-only | N/A (workflow prompt) | N/A |

### Sampling Rate
- **Per task commit:** `node --test test/verify-sufficiency.test.cjs`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/grd:verify-work`

### Wave 0 Gaps
- [ ] `test/verify-sufficiency.test.cjs` -- covers VER-01, VER-02, VER-03
- [ ] Framework install: none needed -- `node:test` is built-in

## Open Questions

1. **Note-to-objective matching strategy**
   - What we know: Notes have `inquiry` frontmatter field (phase number) and Key Findings text. Objectives in REQUIREMENTS.md have IDs and descriptions.
   - What's unclear: Whether to match by inquiry number (phase -> objectives) or by keyword overlap between Key Findings and objective descriptions. Inquiry number is more reliable but may not always align.
   - Recommendation: Use inquiry number as primary match (notes from a phase map to that phase's objectives), fall back to keyword overlap. CJS provides the data, agent makes final judgment.

2. **Vault path discovery**
   - What we know: Research notes live in a vault directory. The `vault_path` config key exists in config.json. Notes are organized by inquiry (phase subdirectories).
   - What's unclear: Exact directory structure may vary between projects. The vault path in config.json currently points to `grd/bin/lib/vault.cjs` (the module, not a directory).
   - Recommendation: The verify-inquiry.md workflow should determine the vault path from the project structure (similar to how conduct-inquiry finds notes). The CJS module accepts a notes array, not a path -- separation of concerns.

3. **Last N notes for theme convergence**
   - What we know: Need to check if recent notes add new themes.
   - What's unclear: What "last N" means -- last by date? Last by file creation order? How many?
   - Recommendation: Use last 3 notes sorted by frontmatter date field. 3 is a good threshold: if all 3 most recent notes only confirm existing themes, saturation is likely. The agent makes the qualitative call.

## Sources

### Primary (HIGH confidence)
- `grd/bin/lib/verify-research.cjs` -- existing Tier 1/2 implementation, parseFrontmatter(), extractSection()
- `grd/bin/lib/plan-checker-rules.cjs` -- RIGOR_LEVELS pattern, validateResearchPlan() structure
- `grd/bin/lib/config.cjs` -- SMART_DEFAULTS, configWithDefaults(), REVIEW_TYPE_ORDER
- `grd/workflows/verify-inquiry.md` -- existing verification workflow
- `grd/bin/lib/init.cjs` -- cmdInitVerifyWork, cmdInitExecutePhase flag propagation patterns
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` -- Stage 5 specification (lines 171-194)
- `.planning/phases/20-three-tier-verification/20-CONTEXT.md` -- locked decisions

### Secondary (MEDIUM confidence)
- `grd/templates/research-note.md` -- note template with frontmatter fields
- `grd/references/research-verification.md` -- verification reference patterns
- `test/verify-research.test.cjs` -- test patterns and fixtures

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all Node.js built-ins and existing local modules, no external dependencies
- Architecture: HIGH -- follows established patterns (RIGOR_LEVELS, CJS+agent split, checkpoint boxes)
- Pitfalls: HIGH -- derived from direct code reading of existing modules and their constraints
- Code examples: MEDIUM -- patterns are correct but exact API signatures may need adjustment during implementation

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable -- internal tooling, no external dependency drift)
