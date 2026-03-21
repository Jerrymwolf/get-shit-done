# Phase 21: Adaptive Communication - Research

**Researched:** 2026-03-20
**Domain:** Tier-conditional content stripping, template adaptation, workflow orchestration
**Confidence:** HIGH

## Summary

Phase 21 makes GRD adapt its communication based on the `researcher_tier` config value (guided/standard/expert) without changing underlying rigor. The core mechanism is a CJS `stripTierContent()` utility that strips non-matching tier blocks from prompts (XML format: `<tier-guided>`) and templates (comment format: `<!-- tier:guided -->`). Workflows call this utility before spawning agents or rendering user-facing output.

The implementation surface is well-defined: 7 templates need tier-conditional content, 5-6 workflows need tier-conditional Next Up/checkpoint/error blocks plus orchestrator-level stripping before agent spawns, and the verifier agent prompt needs a tier context block for output formatting. The `researcher_tier` field already propagates through all init calls (Phase 16), so the infrastructure is in place.

The architecture follows an additive/subtractive model: current content IS Standard tier. Guided adds guidance sentences. Expert removes descriptions, leaving headers only. This means no three-way rewrite -- Standard stays as-is, Guided wraps additions in `<!-- tier:guided -->` blocks, and Expert content is the residue after stripping both Guided and Standard description blocks.

**Primary recommendation:** Build and exhaustively test `stripTierContent()` first (it is the linchpin), then layer template adaptation, then workflow adaptation, then verification output adaptation. Each layer depends on the strip utility working correctly.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Tier-conditional syntax:** Agent prompts use inline XML blocks (`<tier-guided>`, `<tier-standard>`, `<tier-expert>`). Templates use conditional comment blocks (`<!-- tier:guided -->` ... `<!-- /tier:guided -->`). Orchestrator strips non-matching blocks before spawning agents
- **CJS utility:** `stripTierContent(content, tier, format='xml'|'comment')` -- one function, two modes
- **User-facing agents only:** Adapt prompts for executor (research notes), verifier (verification feedback), planner (plan descriptions). Internal agents unchanged
- **Checkpoint descriptions adapt** by tier. Next Up routing adapts per spec
- **Key workflows only:** new-research.md, scope-inquiry.md, plan-inquiry.md, conduct-inquiry.md, verify-inquiry.md, progress.md
- **Research-facing templates only:** research-note.md, source-log.md, research-task.md, project.md, bootstrap.md, requirements.md, roadmap.md
- **Standard tier is baseline:** Current content IS Standard. Guided adds guidance, Expert removes descriptions
- **Verification output adapts by tier:** Implemented in verifier agent prompt, not CJS modules
- **Error messages adapt:** Implemented in workflow orchestration
- **Testing:** Strip function unit tests + template content tests + completeness check + round-trip safety tests

### Claude's Discretion
- Exact guidance sentences for each template section
- Which specific checkpoint boxes and error messages to adapt (vs. leaving as-is)
- How the verifier agent prompt structures tier-adaptive output
- Exact content of the `<researcher_tier>` context block per agent
- Test file organization and assertion patterns

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TIER-01 | All agent prompts include researcher tier context and adapt vocabulary, explanations, and information density | Strip utility (XML mode) + `<researcher_tier>` context block per agent + orchestrator stripping before spawn |
| TIER-02 | All templates adapt by tier (Guided=inline guidance, Standard=brief descriptions, Expert=headers only) | Strip utility (comment mode) + additive/subtractive content model + 7 template files |
| TIER-03 | Verification feedback adapts by tier | Tier context block in verifier agent prompt + CJS returns raw, agent formats |
| TIER-04 | Error messages and next-action routing adapt by tier | Tier-conditional blocks in workflow output sections + orchestrator reads tier from init |
| TEST-06 | New tests cover researcher tier template selection and adaptive output | Strip function unit tests, template completeness scan, round-trip safety tests |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js `node:test` | Built-in | Test framework | Already used across all 16 existing test files |
| Node.js `node:assert/strict` | Built-in | Assertions | Already used project-wide |
| Node.js `node:fs` | Built-in | File reading for template/content tests | Already used everywhere |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `scripts/run-tests.cjs` | N/A | Test runner | Already discovers and runs all `test/*.test.cjs` files |

No new dependencies needed. This phase is pure CJS utility code + content editing.

## Architecture Patterns

### Recommended Project Structure
```
grd/
├── bin/lib/
│   └── tier-strip.cjs          # NEW: stripTierContent() utility
├── templates/
│   ├── research-note.md         # MODIFIED: add tier-conditional blocks
│   ├── source-log.md            # MODIFIED: add tier-conditional blocks
│   ├── research-task.md         # MODIFIED: add tier-conditional blocks
│   ├── project.md               # MODIFIED: add tier-conditional blocks
│   ├── bootstrap.md             # MODIFIED: add tier-conditional blocks
│   ├── requirements.md          # MODIFIED: add tier-conditional blocks
│   └── roadmap.md               # MODIFIED: add tier-conditional blocks
├── workflows/
│   ├── new-research.md          # MODIFIED: tier-conditional output
│   ├── scope-inquiry.md         # MODIFIED: tier-conditional output
│   ├── plan-inquiry.md          # MODIFIED: tier-conditional output
│   ├── conduct-inquiry.md       # MODIFIED: tier-conditional output
│   ├── verify-inquiry.md        # MODIFIED: tier-conditional output
│   └── progress.md              # MODIFIED: tier-conditional output
test/
└── tier-strip.test.cjs          # NEW: comprehensive tests
```

### Pattern 1: XML Tier Blocks in Agent Prompts
**What:** Inline XML blocks that the orchestrator strips before spawning agents
**When to use:** Any agent prompt content that varies by tier
**Example:**
```xml
<tier-guided>
I'm now conducting a thematic analysis -- that means I'm looking across all the
evidence we've gathered to find recurring patterns and themes.
</tier-guided>
<tier-standard>
Conducting thematic analysis across gathered evidence.
</tier-standard>
<tier-expert>
Thematic analysis.
</tier-expert>
```

### Pattern 2: Comment Tier Blocks in Templates
**What:** HTML comment blocks that get stripped before template is written to disk
**When to use:** Template files (markdown) where content varies by tier
**Example:**
```markdown
## Key Findings

<!-- tier:guided -->
<!-- Write 2-3 sentences summarizing what this note concludes. State the main takeaway clearly so someone reading only this section understands the core finding. -->
<!-- /tier:guided -->
<!-- tier:standard -->
<!-- 2-3 sentence summary of what this note concludes. State the main takeaway clearly. -->
<!-- /tier:standard -->
<!-- tier:expert -->
<!-- /tier:expert -->
```

### Pattern 3: Researcher Tier Context Block
**What:** A top-level `<researcher_tier>` block at the start of each adapted agent prompt
**When to use:** Every user-facing agent (executor, verifier, planner)
**Example:**
```xml
<researcher_tier>
## Communication Style: Guided

**Vocabulary:** Explain technical terms on first use. Use everyday language alongside academic terms.
**Explanation depth:** Explain what you are doing and why at each step. Provide context for decisions.
**Information density:** Prefer clarity over brevity. One concept per sentence.
**Examples:** Include concrete examples for abstract concepts.
</researcher_tier>
```

### Pattern 4: Orchestrator Strip Before Spawn
**What:** Workflow reads `researcher_tier` from init JSON and strips non-matching blocks
**When to use:** Every workflow that spawns a user-facing agent or renders user-facing output
**Example flow:**
```
1. Workflow reads init JSON → researcher_tier = 'guided'
2. Before spawning executor: strip <tier-standard> and <tier-expert> from prompt
3. Before writing template to disk: strip <!-- tier:standard --> and <!-- tier:expert --> from template
4. In Next Up/checkpoint output: only render the matching tier's content
```

### Pattern 5: Additive/Subtractive Content Model
**What:** Standard is the baseline. Guided adds to it. Expert subtracts from it.
**When to use:** Designing tier-conditional content for templates
**Implementation:**
- Content that ONLY Guided sees: wrap in `<!-- tier:guided -->`
- Content that ONLY Standard sees: wrap in `<!-- tier:standard -->`
- Content that ONLY Expert sees: wrap in `<!-- tier:expert -->`
- Content visible to ALL tiers: leave unwrapped (no tier block)

### Anti-Patterns to Avoid
- **Three full rewrites:** Do NOT create three separate versions of each template. Use conditional blocks within a single file. The additive/subtractive model keeps maintenance manageable.
- **Adapting internal agents:** Do NOT adapt researcher, synthesizer, or other internal agents. Their output is consumed by other agents, not by users.
- **CJS-level output formatting for verification:** The verifier agent formats its own output based on the tier context block. CJS modules (`verify-research.cjs`, `verify-sufficiency.cjs`) return raw structured results. Do not add tier logic to CJS verification modules.
- **Wrapping ALL content in tier blocks:** Most content is tier-neutral. Only wrap the parts that actually differ. Over-wrapping makes templates unreadable and maintenance-heavy.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XML block stripping | Custom regex per call site | `stripTierContent(content, tier, 'xml')` | Regex edge cases (nested tags, multiline, whitespace normalization) |
| Comment block stripping | Inline regex in each workflow | `stripTierContent(content, tier, 'comment')` | Must handle nested markdown, preserve non-tier comments |
| Tier validation | Ad-hoc checks | Validate tier against `['guided', 'standard', 'expert']` in the strip function | Single point of validation |

**Key insight:** The strip function is the single point of failure. Getting it wrong means agents see wrong-tier content or templates render with orphaned tags. Exhaustive testing of the strip function prevents cascading bugs across all templates and workflows.

## Common Pitfalls

### Pitfall 1: Orphaned Tier Tags After Stripping
**What goes wrong:** Strip function removes content but leaves behind empty lines, orphaned closing tags, or broken markdown structure
**Why it happens:** Naive regex that matches content but not surrounding whitespace/newlines
**How to avoid:** Strip function must clean up trailing blank lines left by removed blocks. Round-trip safety tests verify remaining content is valid markdown with no orphaned tags.
**Warning signs:** Double blank lines in output, `<!-- /tier:guided -->` appearing in Expert templates

### Pitfall 2: Nested XML Breaking the Strip
**What goes wrong:** A `<tier-guided>` block contains other XML-like content (e.g., `<src>` blocks in research-task.md), and the strip regex terminates early
**Why it happens:** Greedy or non-greedy matching interacts poorly with nested XML
**How to avoid:** Use a specific regex that matches `<tier-{name}>` ... `</tier-{name}>` pairs, not generic XML. The inner content is opaque. Test with templates that contain nested XML.
**Warning signs:** Partial block removal, content from one tier leaking into another

### Pitfall 3: Forgetting to Strip Before Agent Spawn
**What goes wrong:** An agent receives all three tiers' worth of content, wasting tokens and potentially confusing the model
**Why it happens:** A workflow is updated to add tier blocks but the orchestrator step that calls stripTierContent is missed
**How to avoid:** Completeness test scans all adapted workflows for the strip call pattern. Document the integration point clearly in each workflow.
**Warning signs:** Agent output contains content from wrong tier

### Pitfall 4: Comment Blocks Conflicting with Existing Comments
**What goes wrong:** Templates already use `<!-- ... -->` comments for guidance. Adding `<!-- tier:X -->` blocks gets confused with existing comments.
**Why it happens:** The strip regex matches unrelated comments
**How to avoid:** Use the exact pattern `<!-- tier:guided -->` ... `<!-- /tier:guided -->` with the opening and closing tags on their own lines. The regex should only match this specific pattern, not arbitrary comments.
**Warning signs:** Existing template guidance comments getting stripped

### Pitfall 5: Standard Content Disappearing for Standard Tier
**What goes wrong:** Content that should be visible to Standard tier gets wrapped in `<!-- tier:standard -->` and stripped for the Standard tier
**Why it happens:** Misunderstanding the additive/subtractive model. Current content IS Standard -- it should NOT be wrapped.
**How to avoid:** Only wrap content that is EXCLUSIVE to Standard (i.e., visible to Standard but not to Expert). In practice, this means: unwrapped content = all tiers. `<!-- tier:guided -->` = Guided-only additions. `<!-- tier:standard -->` = content visible to Standard but stripped for Expert. `<!-- tier:expert -->` = Expert-only content.
**Warning signs:** Standard tier templates have less content than expected

### Pitfall 6: Workflow Tier Blocks in Non-User-Facing Sections
**What goes wrong:** Tier-conditional blocks added to workflow sections that are processed by machines (CLI commands, JSON parsing), not shown to users
**Why it happens:** Over-enthusiastic adaptation
**How to avoid:** Only add tier blocks to: Next Up sections, checkpoint descriptions, error messages, and status reports. Never in bash commands, JSON parsing, or agent spawn parameters.
**Warning signs:** Broken bash commands, JSON parse errors

## Code Examples

### stripTierContent() -- XML Mode
```javascript
// grd/bin/lib/tier-strip.cjs
'use strict';

const VALID_TIERS = ['guided', 'standard', 'expert'];

/**
 * Strip tier-conditional content blocks, keeping only the specified tier.
 *
 * @param {string} content - The content containing tier blocks
 * @param {string} tier - The tier to keep ('guided', 'standard', 'expert')
 * @param {'xml'|'comment'} format - Block format ('xml' for prompts, 'comment' for templates)
 * @returns {string} Content with only the specified tier's blocks retained
 */
function stripTierContent(content, tier, format = 'xml') {
  if (!VALID_TIERS.includes(tier)) {
    throw new Error(`Invalid tier: ${tier}. Must be one of: ${VALID_TIERS.join(', ')}`);
  }

  let result = content;

  if (format === 'xml') {
    // For each tier, either keep content (remove tags only) or remove entire block
    for (const t of VALID_TIERS) {
      if (t === tier) {
        // Keep this tier's content, remove the wrapping tags
        result = result.replace(
          new RegExp(`<tier-${t}>\\n?([\\s\\S]*?)<\\/tier-${t}>\\n?`, 'g'),
          '$1'
        );
      } else {
        // Remove this tier's entire block (content + tags)
        result = result.replace(
          new RegExp(`<tier-${t}>[\\s\\S]*?<\\/tier-${t}>\\n?`, 'g'),
          ''
        );
      }
    }
  } else if (format === 'comment') {
    // Comment format: <!-- tier:name --> ... <!-- /tier:name -->
    for (const t of VALID_TIERS) {
      if (t === tier) {
        // Keep content, remove comment markers
        result = result.replace(
          new RegExp(`<!-- tier:${t} -->\\n?([\\s\\S]*?)<!-- \\/tier:${t} -->\\n?`, 'g'),
          '$1'
        );
      } else {
        // Remove entire block
        result = result.replace(
          new RegExp(`<!-- tier:${t} -->[\\s\\S]*?<!-- \\/tier:${t} -->\\n?`, 'g'),
          ''
        );
      }
    }
  }

  // Clean up multiple consecutive blank lines (max 2)
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

module.exports = { stripTierContent, VALID_TIERS };
```

### Template Adaptation Example (research-note.md Key Findings section)
```markdown
## Key Findings

<!-- tier:guided -->
<!-- Write 2-3 sentences summarizing what this note concludes. What is the single most important thing someone should take away from reading this? State it clearly enough that a reader who only reads this section understands the core finding. -->
<!-- /tier:guided -->
<!-- tier:standard -->
<!-- 2-3 sentence summary of what this note concludes. State the main takeaway clearly. -->
<!-- /tier:standard -->
```
Note: Expert tier has no guidance comment -- just the heading. Unwrapped content (the heading itself) is visible to all tiers.

### Workflow Next Up Adaptation Example
```markdown
## ▶ Next Up

<tier-guided>
Your search protocol is ready. The next step runs all the plans we just created --
each one acquires specific sources and synthesizes them into research notes.

**Execute Inquiry {X}** -- run all {N} plans

`/grd:conduct-inquiry {X}`

<sub>`/clear` first -- this gives you a fresh context window for execution</sub>
</tier-guided>
<tier-standard>
**Execute Inquiry {X}** -- run all {N} plans

`/grd:conduct-inquiry {X}`

<sub>`/clear` first -- fresh context window</sub>
</tier-standard>
<tier-expert>
`/grd:conduct-inquiry {X}`
</tier-expert>
```

### Researcher Tier Context Block for Verifier
```xml
<researcher_tier>
## Communication Style: {tier}

<!-- tier-guided context -->
**When reporting verification results:**
- Explain what each check means before stating pass/fail
- When something fails, explain WHY it matters (not just that it failed)
- Suggest specific next steps for each failure
- Use plain language alongside technical terms

<!-- tier-standard context -->
**When reporting verification results:**
- State what failed with the relevant standard
- Include the specific requirement that was not met
- Brief rationale for why the check exists

<!-- tier-expert context -->
**When reporting verification results:**
- Terse failure statements only
- Requirement ID + failure description
- No elaboration unless ambiguous
</researcher_tier>
```

### Test Pattern: Completeness Scan
```javascript
// Verify every adapted template has content for all three tiers
const ADAPTED_TEMPLATES = [
  'research-note.md', 'source-log.md', 'research-task.md',
  'project.md', 'bootstrap.md', 'requirements.md', 'roadmap.md',
];

for (const template of ADAPTED_TEMPLATES) {
  it(`${template} has content for all three tiers`, () => {
    const content = fs.readFileSync(
      path.join(ROOT, 'grd', 'templates', template), 'utf-8'
    );
    // At minimum, guided and standard should have tier blocks
    // Expert may have none (headers only), but guided and standard must exist
    assert.ok(
      content.includes('<!-- tier:guided -->'),
      `${template} missing guided tier blocks`
    );
    // Standard blocks are optional if current content serves as standard baseline
    // But at least guided must be present since it adds to the baseline
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single-tier content | Tier-conditional blocks with strip utility | Phase 21 (this phase) | All user-facing output adapts to researcher experience |
| Agent formats own output | Orchestrator strips before spawn, agent sees only its tier | Phase 21 (this phase) | Cleaner agent context, fewer wasted tokens |

**Already established (not new):**
- `researcher_tier` field in config.json (Phase 16)
- `researcher_tier` propagation in all init calls (Phase 16)
- RIGOR_LEVELS lookup table pattern in plan-checker-rules.cjs (Phase 19) -- good model for tier content mapping

## Open Questions

1. **How should `grd-tools.cjs` expose the strip utility?**
   - What we know: Executors and workflows both need to strip templates. Workflows can call the CJS module directly via inline code in the prompt instructions. But if executors (subagents) need to strip templates, they may need a CLI command.
   - What's unclear: Do executor subagents strip templates themselves, or does the orchestrator (conduct-inquiry.md) strip templates before passing them to subagents?
   - Recommendation: Orchestrator strips templates before passing to subagents. This is simpler and keeps the strip logic in one place. If a CLI command is needed later, it can be added. Start without `grd-tools.cjs` integration.

2. **Which checkpoint boxes to adapt vs. leave as-is?**
   - What we know: CONTEXT.md says checkpoint descriptions adapt. The saturation gate (TRAP-03) and review type mismatch gate (TRAP-02) are the main interactive gates.
   - What's unclear: How many total checkpoint/gate instances exist across the 6 key workflows
   - Recommendation: Adapt the major interactive gates (TRAP-02, TRAP-03) and the standard Next Up sections. Leave minor error messages and edge case outputs as-is initially -- they can be adapted in a follow-up if needed.

3. **How does the orchestrator actually call stripTierContent?**
   - What we know: Workflows are markdown prompt files executed by Claude, not Node.js scripts. They can run bash commands.
   - What's unclear: Whether to add a CLI command to grd-tools.cjs or inline the stripping logic
   - Recommendation: Add a `strip-tier` command to grd-tools.cjs that reads stdin or a file and outputs stripped content. Workflows can pipe through it. Alternatively, the orchestrator prompt instructions simply tell the agent to strip mentally (not ideal) or the tier blocks are written inline in the workflow markdown and the orchestrator selects the right one. Given that workflow markdown is the prompt itself (not a file being piped), the most practical approach is: **workflow markdown contains all three tier variants inline, and the orchestrator agent selects the matching one based on init JSON**. This is already how the spec envisions it for Next Up and error messages.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in test runner (node:test) |
| Config file | scripts/run-tests.cjs |
| Quick run command | `node --test test/tier-strip.test.cjs` |
| Full suite command | `node scripts/run-tests.cjs` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TIER-01 | Agent prompts have tier context blocks | content scan | `node --test test/tier-strip.test.cjs` | Wave 0 |
| TIER-02 | Templates adapt by tier (guided/standard/expert) | content scan + unit | `node --test test/tier-strip.test.cjs` | Wave 0 |
| TIER-03 | Verification feedback adapts by tier | manual-only | Manual -- verifier agent behavior | N/A |
| TIER-04 | Error messages and routing adapt by tier | content scan | `node --test test/tier-strip.test.cjs` | Wave 0 |
| TEST-06 | Strip function unit + template completeness + round-trip | unit | `node --test test/tier-strip.test.cjs` | Wave 0 |

### Sampling Rate
- **Per task commit:** `node --test test/tier-strip.test.cjs`
- **Per wave merge:** `node scripts/run-tests.cjs`
- **Phase gate:** Full suite green before `/grd:verify-work`

### Wave 0 Gaps
- [ ] `test/tier-strip.test.cjs` -- covers TEST-06 (strip function unit tests, template completeness, round-trip safety)
- [ ] `grd/bin/lib/tier-strip.cjs` -- the strip utility module itself (tested by above)

## Sources

### Primary (HIGH confidence)
- Project codebase analysis: `grd/bin/lib/config.cjs`, `grd/bin/lib/init.cjs` -- verified researcher_tier propagation
- Project codebase analysis: `grd/workflows/` (6 key workflows) -- verified Next Up and checkpoint patterns
- Project codebase analysis: `grd/templates/` (7 target templates) -- verified current content structure
- Project codebase analysis: `test/` (16 test files) -- verified test framework and patterns
- `docs/GRD-v1.2-Research-Reorientation-Spec.md` lines 333-361 -- canonical tier adaptation examples

### Secondary (MEDIUM confidence)
- `21-CONTEXT.md` -- user decisions from scope-inquiry (locked decisions)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, pure CJS + existing test framework
- Architecture: HIGH -- patterns well-established in codebase (XML blocks, comment blocks, init JSON propagation)
- Pitfalls: HIGH -- derived from analysis of actual template/workflow structure and regex edge cases
- Strip utility design: HIGH -- straightforward regex-based approach, well-bounded problem

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable domain, no external dependencies)
