# Architecture Research: v1.2 Research Reorientation Integration

**Domain:** CLI research workflow tool (GSD-R to GRD transformation)
**Researched:** 2026-03-17
**Confidence:** HIGH

## System Overview

```
+-----------------------------------------------------------------------+
|                     User-Facing Layer (CLAUDE.md)                      |
|  Skill() registrations: /grd:new-research, /grd:conduct-inquiry, etc. |
+------+----------------------------------------------------------------+
       |
+------v----------------------------------------------------------------+
|                     Workflow Layer (workflows/*.md)                     |
|  41 workflow files: agent prompts, process steps, tool invocations     |
|  NEW: synthesize.md, synthesize-activity.md                            |
+------+----------------------------------------------------------------+
       |
+------v----------------------------------------------------------------+
|                     CLI Router (bin/gsd-r-tools.cjs)                   |
|  Command dispatch, init bootstrapping, atomic operations               |
|  RENAME: bin/grd-tools.cjs                                            |
+------+----------------------------------------------------------------+
       |
+------v----------------------------------------------------------------+
|                     Library Layer (bin/lib/*.cjs)                       |
|  core | state | config | verify-research | plan-checker-rules          |
|  model-profiles | template | vault | acquire | frontmatter             |
|  milestone | phase | roadmap | commands | init | bootstrap             |
|  verify                                                                |
+------+----------------------------------------------------------------+
       |
+------v----------------------------------------------------------------+
|                     Template Layer (templates/*)                        |
|  config.json, research-note.md, project.md, research-project/*.md      |
|  MODIFY: config.json (new fields), research-note.md (Evidence Quality) |
|  NEW: tiered templates, synthesis templates                            |
+------+----------------------------------------------------------------+
       |
+------v----------------------------------------------------------------+
|                     Reference Layer (references/*.md)                   |
|  17 reference docs: source-protocol, verification-patterns, etc.       |
|  NEW: review-type-requirements.md, epistemological-stances.md          |
+------+----------------------------------------------------------------+
       |
+------v----------------------------------------------------------------+
|                     Filesystem / Git Layer                              |
|  .planning/config.json, STATE.md, ROADMAP.md, phases/                  |
|  Vault: {Study}-Research/ with notes + sources                         |
+-----------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | v1.2 Changes |
|-----------|---------------|--------------|
| **CLAUDE.md / Skill()** | Command registration, namespace routing | RENAME all `/gsd-r:*` to `/grd:*`, add `/grd:synthesize` |
| **workflows/*.md** | Agent prompts with process steps | RENAME internal refs, ADD tier-aware language, ADD synthesize workflow |
| **bin/grd-tools.cjs** | CLI entry point, command dispatch | RENAME from gsd-r-tools.cjs, update all internal paths |
| **bin/lib/config.cjs** | Config CRUD (`config-ensure-section`, `config-set`, `config-get`) | ADD default fields: `researcher_tier`, `review_type`, `epistemological_stance`, `workflow.critical_appraisal`, `workflow.temporal_positioning`, `workflow.synthesis` |
| **bin/lib/model-profiles.cjs** | Agent-to-model mapping per profile | RENAME `gsd-r-*` to `grd-*`, ADD `grd-synthesizer`, `grd-sufficiency-checker` |
| **bin/lib/verify-research.cjs** | Two-tier note verification (goal-backward + source audit) | ADD `verifyTier0()` for evidence sufficiency, modify `verifyNote()` to three-tier |
| **bin/lib/plan-checker-rules.cjs** | Plan validation (source limits, duplication, methods) | ADD review-type-specific rule enforcement |
| **bin/lib/template.cjs** | Template selection and filling | ADD tier-aware template selection |
| **bin/lib/init.cjs** | Compound init for workflow bootstrapping | ADD tier/review_type to init output JSON |
| **bin/lib/state.cjs** | STATE.md CRUD | ADD synthesis stage tracking |
| **templates/config.json** | Default project config | ADD new fields with smart defaults |
| **templates/research-note.md** | Research note scaffold | ADD Evidence Quality section, `era` frontmatter, `review_type` frontmatter |
| **templates/research-project/*.md** | Parallel researcher output templates | RENAME: LANDSCAPE->METHODS, QUESTIONS->FINDINGS, FRAMEWORKS->FRAMEWORKS (keep), DEBATES->LIMITATIONS |

## Recommended Project Structure (Post v1.2)

```
get-shit-done-r/                    # Directory name stays (git history)
  bin/
    grd-tools.cjs                   # RENAMED from gsd-r-tools.cjs
    lib/
      acquire.cjs                   # No change
      bootstrap.cjs                 # No change
      commands.cjs                  # Update agent name refs gsd-r-* -> grd-*
      config.cjs                    # ADD new field defaults, smart-defaults-by-review-type
      core.cjs                      # Update namespace refs in error messages
      frontmatter.cjs               # No change
      init.cjs                      # ADD researcher_tier, review_type, epistemological_stance to init output
      milestone.cjs                 # Update namespace refs
      model-profiles.cjs            # RENAME all gsd-r-* agent keys to grd-*, ADD new agents
      phase.cjs                     # Update namespace refs
      plan-checker-rules.cjs        # ADD review-type rule matrix, ADD primary-source enforcement
      roadmap.cjs                   # Update namespace refs
      state.cjs                     # ADD synthesis stage tracking fields
      template.cjs                  # ADD tier-aware template selection logic
      vault.cjs                     # No change
      verify-research.cjs           # ADD verifyTier0(), modify verifyNote() pipeline
      verify.cjs                    # Update namespace refs
  references/
    # existing 17 files: update namespace refs
    review-type-requirements.md     # NEW: rigor matrix per review type
    epistemological-stances.md      # NEW: stance -> evidence priority mapping
    researcher-tiers.md             # NEW: communication style guide per tier
  templates/
    config.json                     # ADD researcher_tier, review_type, epistemological_stance, workflow.* fields
    research-note.md                # ADD Evidence Quality section, era/review_type frontmatter
    synthesis-themes.md             # NEW: THEMES.md template
    synthesis-framework.md          # NEW: FRAMEWORK.md template
    synthesis-gaps.md               # NEW: GAPS.md template
    synthesis-argument.md           # NEW: Executive Summary template
    research-project/
      METHODS.md                    # RENAMED from LANDSCAPE.md (Methodological Landscape)
      FINDINGS.md                   # RENAMED from QUESTIONS.md (Prior Findings & Key Themes)
      FRAMEWORKS.md                 # KEPT (Theoretical Framework Survey - name already fits)
      LIMITATIONS.md                # RENAMED from DEBATES.md (Limitations, Critiques & Debates)
      SUMMARY.md                    # No change
  workflows/
    # existing 41 files: rename namespace refs
    synthesize.md                   # NEW: /grd:synthesize orchestrator
    synthesize-activity.md          # NEW: subagent prompt for synthesis tasks
  VERSION                           # Stays at 1.24.0 until upstream sync
```

### Structure Rationale

- **Rename gsd-r-tools.cjs to grd-tools.cjs:** The CLI entry point defines the tool identity. All workflow files reference this path via absolute path in `node "..."` calls. Single rename, but ~161 occurrences across 40 files need updating.
- **New lib modules NOT recommended:** Adding `tier.cjs` and `review-type.cjs` is tempting but the actual logic (string interpolation for tier-appropriate messaging) lives in the workflow markdown prompts, not in CJS. The CJS layer only needs to (a) store/retrieve config values and (b) validate them. `config.cjs` already handles both. Adding lib modules for what amounts to prompt engineering would be over-abstraction.
- **Synthesis templates as separate files:** Each synthesis output (THEMES.md, FRAMEWORK.md, GAPS.md, Executive Summary) has distinct structure. Template files keep the workflow prompts clean.
- **Keep workflow filenames unchanged:** Renaming `new-project.md` to `new-research.md` etc. would break git history and all absolute path references. Instead, CLAUDE.md Skill() registrations map `/grd:new-research` -> `workflows/new-project.md`. The indirection is free and already the established pattern.

## Architectural Patterns

### Pattern 1: Config-Driven Behavior Branching

**What:** The `researcher_tier`, `review_type`, and `epistemological_stance` config values propagate through the init system to workflows, which use conditional blocks to vary output.

**When to use:** Every workflow that produces user-facing text or validates research artifacts.

**Trade-offs:** Config values travel through the init JSON pipeline (already established). No new plumbing needed. The downside is that every workflow must check tier/type, creating repetition across 41 files.

**Data flow:**
```
.planning/config.json
    |
    v
init.cjs (cmdInitExecutePhase, cmdInitPlanPhase, etc.)
    |
    v
workflow.md reads init JSON, branches on researcher_tier/review_type
    |
    v
User sees tier-appropriate messaging, review-type-appropriate validation
```

**Implementation approach:**

In `init.cjs`, add to every init command output:
```javascript
const result = {
  // ...existing fields...
  researcher_tier: config.researcher_tier || 'standard',
  review_type: config.review_type || 'narrative',
  epistemological_stance: config.epistemological_stance || 'pragmatist',
  critical_appraisal: config.workflow?.critical_appraisal ?? true,
  temporal_positioning: config.workflow?.temporal_positioning ?? true,
  synthesis_enabled: config.workflow?.synthesis ?? true,
};
```

In workflows, branch like:
```markdown
<step name="tier_messaging">
If `researcher_tier` is "guided":
  [verbose explanation with definitions]
If `researcher_tier` is "standard":
  [academic vocabulary with brief context]
If `researcher_tier` is "expert":
  [terse, precise]
</step>
```

### Pattern 2: Layered Verification Pipeline

**What:** Three-tier verification where each tier gates the next: Tier 0 (sufficiency) -> Tier 1 (goal-backward) -> Tier 2 (source audit).

**When to use:** `/grd:verify-inquiry N`

**Trade-offs:** Tier 0 requires cross-note analysis (theme saturation detection) which is more complex than the per-note Tier 1/2 checks. Tier 0 is also the most subjective and review-type-dependent tier.

**Implementation approach:**

`verifyTier0()` in verify-research.cjs:
```javascript
async function verifyTier0(phaseDir, config) {
  const reviewType = config.review_type || 'narrative';
  const conditions = [];

  // Count notes, check coverage against plan tasks
  const notes = await findResearchNotes(phaseDir);
  const plans = await findPlans(phaseDir);

  // Review-type-specific thresholds
  const thresholds = {
    systematic: { minCoverage: 1.0, requireSaturation: true },
    scoping:    { minCoverage: 0.9, requireSaturation: false },
    integrative:{ minCoverage: 0.8, requireSaturation: false },
    critical:   { minCoverage: 0.8, requireSaturation: false },
    narrative:  { minCoverage: 0.7, requireSaturation: false },
  };
  // ... threshold-based checks
}
```

Modify `verifyNote()` to add phase-level function:
```javascript
async function verifyPhase(phaseDir, config, researchQuestion) {
  // Tier 0: sufficiency (phase-level)
  const tier0 = await verifyTier0(phaseDir, config);
  if (!tier0.passed && !config._skipTier0) {
    return { status: 'insufficient', tier0Result: tier0, tier1Results: null, tier2Results: null };
  }

  // Tier 1 + 2: per-note (existing, unchanged)
  const noteResults = [];
  for (const note of notes) {
    noteResults.push(await verifyNote(note.content, note.sourcesDir, note.sourceLogPath, researchQuestion));
  }
  // ...
}
```

**Key architectural decision:** `verifyNote()` stays unchanged (backward-compatible). `verifyPhase()` is new, wrapping Tier 0 around existing per-note verification. This preserves all 164 existing tests.

### Pattern 3: Synthesis as Standard Phase Execution

**What:** The synthesis stage reuses the existing plan-execute-verify pipeline. Each synthesis activity (thematic synthesis, theoretical integration, gap analysis, argument construction) is a task in a PLAN.md. The synthesize.md workflow creates the plan, then delegates to execute-phase.md.

**When to use:** `/grd:synthesize`

**Trade-offs:** Reusing existing machinery means no new execution infrastructure. The downside is that synthesis tasks need different inputs (all verified notes, not individual sources) and produce different outputs (THEMES.md, FRAMEWORK.md, etc., not research notes). The execute-plan.md subagent prompt must handle this variant.

**Implementation:**
```
/grd:synthesize
    |
    v
synthesize.md workflow:
  1. Check all investigation phases verified
  2. Create synthesis phase directory (e.g., 99-synthesis/)
  3. Generate synthesis PLAN.md with 4 activities as tasks
  4. Wave structure: [6a] -> [6b, 6c] -> [6d]
  5. Delegate to execute-phase machinery
    |
    v
execute-plan.md (existing) with synthesis-aware subagent prompt:
  - Input: all notes from vault (not individual sources)
  - Output: THEMES.md / FRAMEWORK.md / GAPS.md / Executive Summary
  - Commit: vault write as usual
```

### Pattern 4: Namespace Migration as Mechanical Transformation

**What:** `/gsd-r:` -> `/grd:` and `gsd-r-tools.cjs` -> `grd-tools.cjs` and `gsd-r-*` agent names -> `grd-*`. These are string replacements with known patterns, not behavioral changes.

**When to use:** Phase 1 of v1.2, done once, affects everything downstream.

**Trade-offs:** Must be complete (359 `/gsd-r:` occurrences across 56 files, 161 `gsd-r-tools` occurrences across 40 files, 19 agent name entries in model-profiles.cjs). Partial migration causes runtime failures. Benefits: clean break, consistent identity.

**Implementation rules:**
1. `gsd-r-tools.cjs` -> `grd-tools.cjs` (file rename + all path references)
2. `/gsd-r:command-name` -> `/grd:command-name` (Skill registrations + workflow cross-refs)
3. `gsd-r-agent-name` -> `grd-agent-name` (model-profiles.cjs + all workflow agent refs)
4. Also update command vocabulary in user-facing text: `new-project` -> `new-research`, `discuss-phase` -> `scope-inquiry`, etc. (but workflow FILES stay named as-is)
5. The directory `get-shit-done-r/` stays unchanged (git history preservation)

## Data Flow

### Config Propagation Flow (New)

```
/grd:new-research (Stage 1)
    |
    v  (user answers scoping questions)
config.cjs -> writes to .planning/config.json:
  {
    "researcher_tier": "guided",
    "review_type": "systematic",
    "epistemological_stance": "pragmatist",
    "workflow": {
      "critical_appraisal": true,
      "temporal_positioning": true,
      "synthesis": true,
      ...existing fields
    }
  }
    |
    v  (every subsequent command)
init.cjs -> reads config.json -> adds to init JSON output
    |
    v
workflow.md -> parses init JSON -> branches on tier/type/stance
    |
    v
User-facing output varies by tier:
  Guided:  "Now we'll map out what's already known..."
  Standard: "Conduct your state-of-the-field assessment..."
  Expert:  "State-of-the-field assessment. PRISMA-ScR applies."
```

### Verification Flow (Modified)

```
/grd:verify-inquiry N
    |
    v
verify-work.md workflow
    |
    +-- Tier 0: verifyTier0(phaseDir, config)    [NEW - phase-level]
    |   Checks: coverage, saturation, epistemological consistency
    |   Skippable: --skip-tier0, config.workflow.verifier: false
    |
    +-- Tier 1: verifyTier1(noteContent, question) [EXISTING - per-note]
    |   Checks: Key Findings, Analysis, Implications, keyword overlap
    |
    +-- Tier 2: verifyTier2(noteContent, sourcesDir, logPath) [EXISTING - per-note]
        Checks: SOURCE-LOG.md, source files, frontmatter count, orphans
```

### Synthesis Flow (New)

```
/grd:synthesize
    |
    v
synthesize.md:
  1. Load all verified notes from investigation phases
  2. Check: are all investigation phases verified? (gate)
  3. Create synthesis phase directory (e.g., 99-synthesis/)
  4. Auto-generate PLAN.md with 4 tasks in 3 waves:
     Wave 1: [6a: Thematic synthesis]
     Wave 2: [6b: Theoretical integration, 6c: Gap analysis]
     Wave 3: [6d: Argument construction]
  5. Execute via existing execute-phase machinery
    |
    v
Output in vault:
  {Study}-Research/
    00-THEMES.md
    00-FRAMEWORK.md
    00-GAPS.md
    00-Executive-Summary.md
```

### Plan-Checker Enforcement Flow (Modified)

```
/grd:plan-inquiry N
    |
    v
plan-phase.md workflow
    |
    v
plan-checker-rules.cjs:
  existing checks (all review types):
    - checkSourceDuplication()
    - checkSourceLimit() (<=3 per task)
    - checkAcquisitionMethod()
    - checkLargePaperDedication()
  NEW checks (review-type-specific):
    - checkPrimarySourcePriority()     [systematic, integrative, critical]
    - checkSearchStrategy()            [systematic, scoping]
    - checkInclusionExclusion()        [systematic, scoping]
    - checkMethodologicalDiversity()   [integrative]
    |
    v
review_type from config.json determines which checks run
```

## Integration Points

### Internal Boundaries

| Boundary | Communication | v1.2 Changes |
|----------|---------------|--------------|
| Workflow -> CLI tools | `node "grd-tools.cjs" <command>` (stdout JSON) | PATH rename, new init fields |
| CLI tools -> lib modules | Direct `require()` calls | New function exports |
| Workflows -> Templates | `@/path/to/template.md` references | New template paths, renamed templates |
| Workflows -> References | `@/path/to/reference.md` references | New reference files |
| Config -> Everything | `config.json` read via `loadConfig(cwd)` | New fields propagated through init pipeline |
| CLAUDE.md -> Workflows | `Skill()` registration maps commands to workflow files | All registrations renamed |

### Key File Touch Points per Feature

| Feature | Files Modified | Files Created | Scope |
|---------|---------------|---------------|-------|
| Namespace migration (`/gsd-r:` -> `/grd:`) | 56 files (359 occurrences) | 0 | Mechanical |
| CLI rename (`gsd-r-tools` -> `grd-tools`) | 40 files (161 occurrences) + 1 file rename | 0 | Mechanical |
| Agent rename (`gsd-r-*` -> `grd-*`) | model-profiles.cjs + all workflow agent refs | 0 | Mechanical |
| Command vocabulary (PM -> research terms) | help.md, CLAUDE.md, all cross-referencing workflows | 0 | Mechanical |
| Config new fields | config.cjs, templates/config.json | 0 | Small |
| Config propagation to init | init.cjs (all 6 init commands) | 0 | Small |
| Researcher tier (adaptive communication) | All 41 workflow files, 3 summary templates | references/researcher-tiers.md | Large (breadth) |
| Review type enforcement | plan-checker-rules.cjs | references/review-type-requirements.md | Medium |
| Epistemological stance | new-project workflow, verify-research.cjs (Tier 0) | references/epistemological-stances.md | Small |
| Research note template update | templates/research-note.md | 0 | Small |
| Parallel researcher rename | 4 template files in research-project/ | 0 | Small |
| Synthesis stage | execute-phase.md (minor), execute-plan.md (minor) | synthesize.md, synthesize-activity.md, 4 synthesis templates | Medium |
| Three-tier verification | verify-research.cjs, verify-work.md | 0 | Medium |
| Upstream sync (v1.24.0 -> v1.25.1) | Potentially all CJS + workflow files | 0 | Unknown until diff analyzed |

## Suggested Build Order

The build order must respect three constraints: (1) dependencies between features, (2) test stability (don't break 164 existing tests until migration is complete), and (3) risk isolation (do the hardest thing when the codebase is cleanest).

```
Phase 1: Namespace Migration ─────────────── (foundation, no deps)
    |
    v
Phase 2: Config Schema + Propagation ─────── (depends on Phase 1)
    |
    v
Phase 3: Research Note Template + ─────────── (depends on Phase 2)
         Parallel Researcher Rename
    |
    v
Phase 4: Review Type Enforcement ──────────── (depends on Phase 2)
         in Plan-Checker
    |
    v
Phase 5: Three-Tier Verification ──────────── (depends on Phase 2, 3)
    |
    v
Phase 6: Adaptive Communication ───────────── (depends on Phase 2)
         (Researcher Tier)                     Highest breadth change
    |
    v
Phase 7: Synthesis Stage ──────────────────── (depends on all above)
    |
    v
Phase 8: Upstream Sync ────────────────────── (depends on all above)
         (v1.24.0 -> v1.25.1)                  Highest risk, do last
```

### Phase 1: Namespace Migration (Foundation)

**Rationale:** Everything downstream references the namespace. Do this first so all subsequent work uses the final names. Mechanical, low risk, high coverage.

**Subphases:**
1. **1a: CLI rename** -- `gsd-r-tools.cjs` -> `grd-tools.cjs` (file + 161 path refs in 40 files)
2. **1b: Agent name rename** -- `gsd-r-*` -> `grd-*` in model-profiles.cjs + workflow refs
3. **1c: Command namespace** -- `/gsd-r:*` -> `/grd:*` (359 occurrences in 56 files)
4. **1d: Command vocabulary** -- PM names -> research names in help text and cross-references (`new-project` -> `new-research`, `discuss-phase` -> `scope-inquiry`, etc.)
5. **1e: Test updates** -- Update all 164 tests to use new names

**Dependencies:** None. Self-contained.

**Risk:** Medium -- volume is high but changes are mechanical. Command vocabulary rename (1d) requires care because it changes user-visible names without renaming files.

**Key decision: rename workflow files or just update registrations?** Keep workflow filenames unchanged (`new-project.md` stays `new-project.md`). The mapping `/grd:new-research -> workflows/new-project.md` is handled in CLAUDE.md Skill() registration. Renaming files creates churn with no functional benefit and breaks git history.

### Phase 2: Config Schema + Propagation

**Rationale:** Subsequent features need `researcher_tier`, `review_type`, and `epistemological_stance` available in config. Wire the plumbing before building features that depend on it.

**Work:**
1. Update `templates/config.json` with new fields and smart defaults by review type
2. Update `config.cjs` `cmdConfigEnsureSection()` with new default fields
3. Update all init commands in `init.cjs` to include new fields in output JSON
4. Update `new-project.md` workflow to ask the three new scoping questions (tier, review type, epistemological stance)
5. Update `settings.md` workflow to allow changing tier/type/stance mid-study
6. Create `references/review-type-requirements.md`, `references/epistemological-stances.md`, `references/researcher-tiers.md`

**Dependencies:** Phase 1 (namespace must be complete).
**Risk:** Low. Config CRUD and prompt engineering.

### Phase 3: Research Note Template + Parallel Researcher Rename

**Rationale:** Small, self-contained template changes that unlock downstream features (Evidence Quality section needed for review-type enforcement, `era` field needed for temporal positioning).

**Work:**
1. Update `templates/research-note.md` with Evidence Quality section, `era` and `review_type` frontmatter
2. Rename research-project templates: LANDSCAPE -> METHODS, QUESTIONS -> FINDINGS, DEBATES -> LIMITATIONS
3. Update research-project template content to match revised scholarly functions
4. Update workflow files that reference these template names

**Dependencies:** Phase 1 (namespace), Phase 2 (review_type available in config).
**Risk:** Low.

### Phase 4: Review Type Enforcement in Plan-Checker

**Rationale:** The plan-checker is the enforcement mechanism for review type rigor. Must exist before verification changes.

**Work:**
1. Add review-type-specific rule functions to `plan-checker-rules.cjs` (4 new checks)
2. Add config-reading to determine which rules apply per review type
3. Implement smart defaults table from spec (systematic=strict, narrative=light, etc.)
4. Tests for each review type's rule set

**Dependencies:** Phase 2 (review_type in config).
**Risk:** Medium. Well-patterned -- plan-checker already has 4 rules; adding 4 conditional ones follows the same structure.

### Phase 5: Three-Tier Verification

**Rationale:** Tier 0 (sufficiency) is the new verification capability. Requires review_type and epistemological_stance to function.

**Work:**
1. Add `verifyTier0()` to verify-research.cjs (phase-level, not per-note)
2. Add `verifyPhase()` wrapping Tier 0 around existing `verifyNote()` calls
3. Update verify-work.md workflow to invoke Tier 0 before per-note checks
4. Add `--skip-tier0` flag handling
5. Tests for Tier 0 across review types

**Dependencies:** Phase 2 (config), Phase 3 (updated note template for era/review_type validation).
**Risk:** Medium. Tier 0 is phase-level (cross-note analysis), unlike existing per-note tiers. New analysis pattern but contained to one module.

### Phase 6: Adaptive Communication (Researcher Tier)

**Rationale:** Highest-breadth change -- touches all 41 workflow files. Do after namespace migration is stable and config propagation is wired.

**Work:**
1. Establish tier-conditional block pattern (e.g., XML blocks: `<tier_guided>`, `<tier_standard>`, `<tier_expert>`)
2. Add tier branches to workflows in priority order:
   - new-project (new-research) -> scope-inquiry -> plan-inquiry -> conduct-inquiry -> verify-inquiry (core workflow)
   - progress -> help -> autonomous (secondary)
   - remaining workflows (tertiary)
3. Update 3 summary templates with tier awareness
4. Update error messages in CJS modules where user-facing

**Dependencies:** Phase 2 (tier in config and init output).
**Risk:** High (breadth, not depth). Each workflow needs tier branches. Recommend workflow-by-workflow approach with testing between each.

### Phase 7: Synthesis Stage

**Rationale:** Net-new workflow and templates. No existing code depends on it. Build last among functional features to ensure all prerequisites are stable.

**Work:**
1. Create `workflows/synthesize.md` (orchestrator: validates readiness, creates synthesis plan, delegates to execute-phase)
2. Create `workflows/synthesize-activity.md` (subagent prompt for synthesis tasks)
3. Create 4 synthesis templates: `synthesis-themes.md`, `synthesis-framework.md`, `synthesis-gaps.md`, `synthesis-argument.md`
4. Add `grd-synthesizer` agent to model-profiles.cjs
5. Add synthesis tracking to state.cjs (synthesis phase status, output files)
6. Wire into autonomous.md (auto-synthesize after all investigation phases verified)
7. Wire into progress.md (show synthesis status)
8. Tests for synthesis workflow

**Dependencies:** All prior phases (namespace, config, templates, verification).
**Risk:** Medium. Net-new code but reuses existing execute-phase machinery.

### Phase 8: Upstream Sync (v1.24.0 -> v1.25.1)

**Rationale:** Do LAST. 1,077 commits is a large delta. After all v1.2 features are stable, conflicts are between known GRD code and upstream changes, not between in-progress features and upstream.

**Work:**
1. Analyze upstream diff (v1.24.0 -> v1.25.1) to identify relevant changes
2. Categorize: (a) core.cjs changes, (b) workflow changes, (c) new features, (d) N/A for GRD
3. Apply relevant changes with GRD research layer preserved
4. Re-apply GRD namespace (now `/grd:` not `/gsd-r:`) to synced files
5. Run full test suite after each merge step

**Dependencies:** All prior phases complete and tests passing.
**Risk:** HIGH. 1,077 commits is significant. Unknown scope until diff analyzed. May require its own multi-phase plan.

**Pre-phase recommendation:** Spend 1 hour analyzing the upstream v1.24.0->v1.25.1 diff BEFORE committing to this build order. If the upstream has breaking architectural changes (e.g., module restructuring), it may need to come FIRST to avoid double-migration. If the changes are incremental (like v1.22.4->v1.24.0 was), last is correct.

## Anti-Patterns

### Anti-Pattern 1: Tier Logic in CJS Modules

**What people do:** Create `tier.cjs` with functions like `getGuidedMessage(key)`, `getStandardMessage(key)`, `getExpertMessage(key)` and call them from workflows.

**Why it's wrong:** Tier-appropriate messaging is prompt engineering (natural language), not code logic. CJS modules process data; workflow markdown files shape agent behavior. Putting tier messages in CJS creates a translation layer that adds complexity without adding capability.

**Do this instead:** Pass `researcher_tier` through init JSON. Branch in workflow markdown with conditional blocks. Keep CJS modules for validation only ("is this a valid tier value?").

### Anti-Pattern 2: Renaming Workflow Files to Match New Commands

**What people do:** Rename `new-project.md` to `new-research.md`, `discuss-phase.md` to `scope-inquiry.md`, etc.

**Why it's wrong:** Git history breaks. All absolute path references (161+ occurrences of the tools path) break. The mapping between command name and workflow file is already handled by Skill() registration.

**Do this instead:** Keep workflow filenames. Update CLAUDE.md Skill() registrations to map `/grd:new-research` -> `workflows/new-project.md`. Update help.md to show new command names.

### Anti-Pattern 3: Big-Bang Namespace Migration

**What people do:** Write a single sed script that replaces everything in one pass.

**Why it's wrong:** Three distinct namespace patterns overlap (`/gsd-r:command`, `gsd-r-tools.cjs` path, `gsd-r-agent-name`). A global replace might create false matches. Tests must pass after each logical group.

**Do this instead:** Migrate in 4 sub-phases (1a-1d). Run tests after each. Commit after each. Contained blast radius.

### Anti-Pattern 4: Synthesis as Separate Infrastructure

**What people do:** Build entirely new execution pipeline for synthesis (new subagent spawning, new state tracking, new commit handling).

**Why it's wrong:** The existing execute-phase -> execute-plan pipeline already handles wave-based parallel execution with subagent spawning. Synthesis activities are structurally identical to investigation tasks.

**Do this instead:** Model synthesis as a special phase. `synthesize.md` generates a PLAN.md, delegates to execute-phase.md. Only difference: subagent prompt (synthesize-activity.md instead of phase-prompt.md) and input scope (all notes instead of individual sources).

### Anti-Pattern 5: Upstream Sync Before Feature Stabilization

**What people do:** Sync upstream first "to have the latest base" before building v1.2 features.

**Why it's wrong:** Building on an unexamined 1,077-commit delta means any architectural changes in upstream could invalidate v1.2 design decisions. v1.1 already synced to v1.24.0; the existing base is stable and tested. Building features on a known-good base, then syncing, means conflicts are between two understood codebases.

**Do this instead:** Build all v1.2 features on the current v1.24.0 base. Analyze the upstream diff as a pre-phase. Sync last, when both sides are stable and understood.

## Scaling Considerations

Not applicable in traditional sense (single-user CLI tool). Relevant "scaling" dimensions:

| Dimension | Current | v1.2 Impact | Maintenance Concern |
|-----------|---------|-------------|---------------------|
| Config fields | 12 fields | ~18 fields (6 new) | Low -- `config-get`/`config-set` handle arbitrary keys |
| Workflow conditionals | ~0 tier branches | ~120+ tier branches (3 per workflow x 41) | HIGH -- every workflow update must consider 3 tiers |
| Verification checks | 2 tiers, 7 checks | 3 tiers, ~12 checks | Medium -- Tier 0 is new analysis pattern |
| Plan-checker rules | 4 rules | ~8 rules (4 conditional) | Low -- well-patterned |
| Agent profiles | 19 agents | ~21 agents (2 new) | Low |
| Template files | ~35 files | ~41 files (6 new) | Low |
| Reference files | 17 files | ~20 files (3 new) | Low |

**Main maintenance concern:** Tier-conditional blocks across 41 workflows. Mitigation: establish a consistent pattern (e.g., `<tier_guided>`, `<tier_standard>`, `<tier_expert>` XML blocks) and document in `references/researcher-tiers.md` so every workflow follows the same structure.

## Sources

- GRD v1.2 Spec: `docs/GRD-v1.2-Research-Reorientation-Spec.md` (PRIMARY -- full feature specification)
- PROJECT.md: `.planning/PROJECT.md` (PRIMARY -- project context, tech debt, constraints)
- Direct codebase inspection of all 17 CJS modules, 41 workflow files, templates, and references (PRIMARY)
- Namespace occurrence counts via grep analysis of the live codebase (PRIMARY)
- Confidence: HIGH -- all findings based on direct code inspection and spec analysis, no external sources needed

---
*Architecture research for: GRD v1.2 Research Reorientation*
*Researched: 2026-03-17*
