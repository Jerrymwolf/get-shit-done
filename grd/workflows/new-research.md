<purpose>
Initialize a new project through unified flow: questioning, research (optional), requirements, roadmap. This is the most leveraged moment in any project — deep questioning here means better plans, better execution, better outcomes. One workflow takes you from idea to ready-for-planning.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<auto_mode>
## Auto Mode Detection

Check if `--auto` flag is present in $ARGUMENTS.

**If auto mode:**
- Skip brownfield mapping offer (assume greenfield)
- Skip deep questioning (extract context from provided document)
- Config: YOLO mode is implicit (skip that question), but ask granularity/git/agents FIRST (Step 2a)
- After config: run Steps 6-9 automatically with smart defaults:
  - Research: Always yes
  - Requirements: Include all table stakes + features from provided document
  - Requirements approval: Auto-approve
  - Roadmap approval: Auto-approve

**Document requirement:**
Auto mode requires an idea document — either:
- File reference: `/grd:new-research --auto @prd.md`
- Pasted/written text in the prompt

If no document content provided, error:

```
Error: --auto requires an idea document.

Usage:
  /grd:new-research --auto @your-idea.md
  /grd:new-research --auto [paste or write your idea here]

The document should describe what you want to build.
```
</auto_mode>

<process>

## 1. Setup

**MANDATORY FIRST STEP — Execute these checks before ANY user interaction:**

```bash
INIT=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" init new-project)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse JSON for: `researcher_model`, `synthesizer_model`, `roadmapper_model`, `commit_docs`, `project_exists`, `has_codebase_map`, `planning_exists`, `has_existing_code`, `has_package_file`, `is_brownfield`, `needs_codebase_map`, `has_git`, `project_path`.

**If `project_exists` is true:** Error — project already initialized. Use `/grd:progress`.

**If `has_git` is false:** Initialize git:
```bash
git init
```

## 2. Brownfield Offer

**If auto mode:** Skip to Step 4 (assume greenfield, synthesize PROJECT.md from provided document).

**If `needs_codebase_map` is true** (from init — existing code detected but no codebase map):

Use AskUserQuestion:
- header: "Codebase"
- question: "I detected existing code in this directory. Would you like to map the codebase first?"
- options:
  - "Map codebase first" — Run /grd:map-codebase to understand existing architecture (Recommended)
  - "Skip mapping" — Proceed with project initialization

**If "Map codebase first":**
```
Run `/grd:map-codebase` first, then return to `/grd:new-research`
```
Exit command.

**If "Skip mapping" OR `needs_codebase_map` is false:** Continue to Step 3.

## 2a. Auto Mode Config (auto mode only)

**If auto mode:** Collect config settings upfront before processing the idea document.

YOLO mode is implicit (auto = YOLO). Ask remaining config questions:

**Round 1 — Core settings (3 questions, no Mode question):**

```
AskUserQuestion([
  {
    header: "Granularity",
    question: "How finely should scope be sliced into phases?",
    multiSelect: false,
    options: [
      { label: "Coarse (Recommended)", description: "Fewer, broader phases (3-5 phases, 1-3 plans each)" },
      { label: "Standard", description: "Balanced phase size (5-8 phases, 3-5 plans each)" },
      { label: "Fine", description: "Many focused phases (8-12 phases, 5-10 plans each)" }
    ]
  },
  {
    header: "Execution",
    question: "Run plans in parallel?",
    multiSelect: false,
    options: [
      { label: "Parallel (Recommended)", description: "Independent plans run simultaneously" },
      { label: "Sequential", description: "One plan at a time" }
    ]
  },
  {
    header: "Git Tracking",
    question: "Commit planning docs to git?",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Planning docs tracked in version control" },
      { label: "No", description: "Keep .planning/ local-only (add to .gitignore)" }
    ]
  }
])
```

**Round 2 — Workflow agents (same as Step 5):**

```
AskUserQuestion([
  {
    header: "Research",
    question: "Research before planning each phase? (adds tokens/time)",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Investigate domain, find patterns, surface gotchas" },
      { label: "No", description: "Plan directly from requirements" }
    ]
  },
  {
    header: "Plan Check",
    question: "Verify plans will achieve their goals? (adds tokens/time)",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Catch gaps before execution starts" },
      { label: "No", description: "Execute plans without verification" }
    ]
  },
  {
    header: "Verifier",
    question: "Verify work satisfies requirements after each phase? (adds tokens/time)",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Confirm deliverables match phase goals" },
      { label: "No", description: "Trust execution, skip verification" }
    ]
  },
  {
    header: "AI Models",
    question: "Which AI models for planning agents?",
    multiSelect: false,
    options: [
      { label: "Balanced (Recommended)", description: "Sonnet for most agents — good quality/cost ratio" },
      { label: "Quality", description: "Opus for research/roadmap — higher cost, deeper analysis" },
      { label: "Budget", description: "Haiku where possible — fastest, lowest cost" },
      { label: "Inherit", description: "Use the current session model for all agents (OpenCode /model)" }
    ]
  }
])
```

Create `.planning/config.json` with mode set to "yolo":

```json
{
  "mode": "yolo",
  "granularity": "[selected]",
  "parallelization": true|false,
  "commit_docs": true|false,
  "model_profile": "quality|balanced|budget|inherit",
  "workflow": {
    "research": true|false,
    "plan_check": true|false,
    "verifier": true|false,
    "nyquist_validation": depth !== "quick",
    "auto_advance": true
  }
}
```

**If commit_docs = No:** Add `.planning/` to `.gitignore`.

**Commit config.json:**

```bash
mkdir -p .planning
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" commit "chore: add project config" --files .planning/config.json
```

**Persist auto-advance chain flag to config (survives context compaction):**

```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" config-set workflow._auto_chain_active true
```

Proceed to Step 4 (skip Steps 3 and 5). **But first run Step 3a (Research Scoping) -- tier/type/epistemology selection applies to auto mode too.**

## 3a. Research Scoping

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► RESEARCH SCOPING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Round 1 -- Research Configuration (3 questions):**

```
AskUserQuestion([
  {
    header: "Experience",
    question: "What is your research background?",
    multiSelect: false,
    options: [
      { label: "Guided", description: "Curious non-academic, undergrad, early graduate -- plain language, explains why each step matters" },
      { label: "Standard", description: "Mid-career graduate, doctoral candidate -- academic vocabulary with brief context" },
      { label: "Expert", description: "Post-doc, faculty, established researcher -- precise terminology, maximum efficiency" }
    ]
  },
  {
    header: "Review Type",
    question: "What kind of review is this?",
    multiSelect: false,
    options: [
      { label: "Systematic", description: "PRISMA 2020 protocol, pre-defined search strategy, critical appraisal of every study" },
      { label: "Scoping", description: "Arksey & O'Malley framework, maps extent of evidence, charting rather than appraising" },
      { label: "Integrative", description: "Whittemore & Knafl, combines diverse methodologies, five-stage process" },
      { label: "Critical", description: "Evaluates quality and contribution of literature, identifies gaps and new directions" },
      { label: "Narrative", description: "Broadest, most flexible, suitable for exploring wide topics" }
    ]
  },
  {
    header: "Epistemology",
    question: "What counts as valid evidence for your study? (Skip to default to Pragmatist)",
    multiSelect: false,
    options: [
      { label: "Positivist", description: "Objective reality, testable hypotheses, quantitative evidence prioritized" },
      { label: "Constructivist", description: "Multiple realities, meaning is co-constructed, qualitative evidence valued" },
      { label: "Pragmatist (default)", description: "Whatever works -- mixed methods, problem-centered" },
      { label: "Critical", description: "Knowledge shaped by power structures, research aims at transformation" }
    ]
  }
])
```

**Write to config immediately:**
```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" config-set researcher_tier "[selected_lower]"
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" config-set review_type "[selected_lower]"
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" config-set epistemological_stance "[selected_lower]"
```

**Apply smart defaults for selected review type:**
Smart defaults cascade automatically via configWithDefaults() when init.cjs reads config.

## 3. Deep Questioning

**If auto mode:** Skip (already handled in Step 2a). Extract project context from provided document instead and proceed to Step 4.

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► QUESTIONING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Open the conversation:**

Ask inline (freeform, NOT AskUserQuestion):

"What is your research problem?"

Wait for their response. This gives you the context needed to ask intelligent follow-up questions.

**Follow the thread:**

Based on what they said, ask follow-up questions that dig into their response. Use AskUserQuestion with options that probe what they mentioned — interpretations, clarifications, concrete examples.

Keep following threads. Each answer opens new threads to explore. Ask about:
- What drew them to this topic
- What gap or tension prompted this inquiry
- What they mean by vague terms
- What a successful answer would look like
- What methodological choices are already made

Consult `questioning.md` for techniques:
- Challenge vagueness
- Make abstract concrete
- Surface assumptions
- Find edges
- Reveal motivation

**Check context (background, not out loud):**

As you go, mentally check the context checklist from `questioning.md`. If gaps remain, weave questions naturally. Don't suddenly switch to checklist mode.

**Decision gate:**

When you could write a clear PROJECT.md, use AskUserQuestion:

- header: "Ready?"
- question: "I think I understand your research problem. Ready to create the research prospectus?"
- options:
  - "Create PROJECT.md" — Let's move forward
  - "Keep exploring" — I want to share more / ask me more

If "Keep exploring" — ask what they want to add, or identify gaps and probe naturally.

Loop until "Create PROJECT.md" selected.

## 4. Write PROJECT.md

**If auto mode:** Synthesize from provided document. No "Ready?" gate was shown — proceed directly to commit.

Synthesize into `.planning/PROJECT.md` using the research prospectus template from `templates/project.md`.

**For greenfield projects:**

Initialize requirements as hypotheses:

```markdown
## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

### Out of Scope

- [Exclusion 1] — [why]
- [Exclusion 2] — [why]
```

All Active requirements are hypotheses until shipped and validated.

**For brownfield projects (codebase map exists):**

Infer Validated requirements from existing code:

1. Read `.planning/codebase/ARCHITECTURE.md` and `STACK.md`
2. Identify what the codebase already does
3. These become the initial Validated set

```markdown
## Requirements

### Validated

- ✓ [Existing capability 1] — existing
- ✓ [Existing capability 2] — existing
- ✓ [Existing capability 3] — existing

### Active

- [ ] [New requirement 1]
- [ ] [New requirement 2]

### Out of Scope

- [Exclusion 1] — [why]
```

**Key Decisions:**

Initialize with any decisions made during questioning:

```markdown
## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| [Choice from questioning] | [Why] | — Pending |
```

**Last updated footer:**

```markdown
---
*Last updated: [date] after initialization*
```

Do not compress. Capture everything gathered.

**Commit PROJECT.md:**

```bash
mkdir -p .planning
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" commit "docs: initialize project" --files .planning/PROJECT.md
```

## 5. Workflow Preferences

**If auto mode:** Skip — config was collected in Step 2a. Proceed to Step 5.5.

**Check for global defaults** at `~/.gsd/defaults.json`. If the file exists, offer to use saved defaults:

```
AskUserQuestion([
  {
    question: "Use your saved default settings? (from ~/.gsd/defaults.json)",
    header: "Defaults",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Use saved defaults, skip settings questions" },
      { label: "No", description: "Configure settings manually" }
    ]
  }
])
```

If "Yes": read `~/.gsd/defaults.json`, use those values for config.json, and skip directly to **Commit config.json** below.

If "No" or `~/.gsd/defaults.json` doesn't exist: proceed with the questions below.

**Round 1 — Core workflow settings (4 questions):**

```
questions: [
  {
    header: "Mode",
    question: "How do you want to work?",
    multiSelect: false,
    options: [
      { label: "YOLO (Recommended)", description: "Auto-approve, just execute" },
      { label: "Interactive", description: "Confirm at each step" }
    ]
  },
  {
    header: "Granularity",
    question: "How finely should scope be sliced into phases?",
    multiSelect: false,
    options: [
      { label: "Coarse", description: "Fewer, broader phases (3-5 phases, 1-3 plans each)" },
      { label: "Standard", description: "Balanced phase size (5-8 phases, 3-5 plans each)" },
      { label: "Fine", description: "Many focused phases (8-12 phases, 5-10 plans each)" }
    ]
  },
  {
    header: "Execution",
    question: "Run plans in parallel?",
    multiSelect: false,
    options: [
      { label: "Parallel (Recommended)", description: "Independent plans run simultaneously" },
      { label: "Sequential", description: "One plan at a time" }
    ]
  },
  {
    header: "Git Tracking",
    question: "Commit planning docs to git?",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Planning docs tracked in version control" },
      { label: "No", description: "Keep .planning/ local-only (add to .gitignore)" }
    ]
  }
]
```

**Round 2 — Workflow agents:**

These spawn additional agents during planning/execution. They add tokens and time but improve quality.

| Agent | When it runs | What it does |
|-------|--------------|--------------|
| **Researcher** | Before planning each phase | Investigates domain, finds patterns, surfaces gotchas |
| **Plan Checker** | After plan is created | Verifies plan actually achieves the phase goal |
| **Verifier** | After phase execution | Confirms must-haves were delivered |

All recommended for important projects. Skip for quick experiments.

```
questions: [
  {
    header: "Research",
    question: "Research before planning each phase? (adds tokens/time)",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Investigate domain, find patterns, surface gotchas" },
      { label: "No", description: "Plan directly from requirements" }
    ]
  },
  {
    header: "Plan Check",
    question: "Verify plans will achieve their goals? (adds tokens/time)",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Catch gaps before execution starts" },
      { label: "No", description: "Execute plans without verification" }
    ]
  },
  {
    header: "Verifier",
    question: "Verify work satisfies requirements after each phase? (adds tokens/time)",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Confirm deliverables match phase goals" },
      { label: "No", description: "Trust execution, skip verification" }
    ]
  },
  {
    header: "AI Models",
    question: "Which AI models for planning agents?",
    multiSelect: false,
    options: [
      { label: "Balanced (Recommended)", description: "Sonnet for most agents — good quality/cost ratio" },
      { label: "Quality", description: "Opus for research/roadmap — higher cost, deeper analysis" },
      { label: "Budget", description: "Haiku where possible — fastest, lowest cost" },
      { label: "Inherit", description: "Use the current session model for all agents (OpenCode /model)" }
    ]
  }
]
```

Create `.planning/config.json` with all settings:

```json
{
  "mode": "yolo|interactive",
  "granularity": "coarse|standard|fine",
  "parallelization": true|false,
  "commit_docs": true|false,
  "model_profile": "quality|balanced|budget|inherit",
  "workflow": {
    "research": true|false,
    "plan_check": true|false,
    "verifier": true|false,
    "nyquist_validation": depth !== "quick"
  }
}
```

**If commit_docs = No:**
- Set `commit_docs: false` in config.json
- Add `.planning/` to `.gitignore` (create if needed)

**If commit_docs = Yes:**
- No additional gitignore entries needed

**Commit config.json:**

```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" commit "chore: add project config" --files .planning/config.json
```

**Note:** Run `/grd:settings` anytime to update these preferences.

## 5.5. Resolve Model Profile

Use models from init: `researcher_model`, `synthesizer_model`, `roadmapper_model`.

## 6. Research Decision

**If auto mode:** Default to "Research first" without asking.

Use AskUserQuestion:
- header: "Research"
- question: "Research the domain ecosystem before defining requirements?"
- options:
  - "Research first (Recommended)" — Discover standard stacks, expected features, architecture patterns
  - "Skip research" — I know this domain well, go straight to requirements

**If "Research first":**

Display stage banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► RESEARCHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Researching [domain] ecosystem...
```

Create research directory:
```bash
mkdir -p .planning/research
```

**Determine milestone context:**

Check if this is greenfield or subsequent milestone:
- If no "Validated" requirements in PROJECT.md → Greenfield (building from scratch)
- If "Validated" requirements exist → Subsequent milestone (adding to existing app)

Display spawning indicator:
```
◆ Spawning 4 researchers in parallel...
  → Methodological Landscape
  → Prior Findings & Key Themes
  → Theoretical Framework Survey
  → Limitations, Critiques & Debates
```

Spawn 4 parallel grd-project-researcher agents with path references:

```
Task(prompt="<research_type>
Project Research — Methodological Landscape for [domain].
</research_type>

<milestone_context>
[greenfield OR subsequent]

Greenfield: What methods, instruments, datasets, and research designs have been used to study [domain]?
Subsequent: What methods have been used to study [target area] within [domain]? Don't re-research already-covered ground.
</milestone_context>

<question>
What methods, instruments, datasets, and research designs have been used to study [domain]? What validated scales or interview protocols exist?
</question>

<files_to_read>
- {project_path} (Project context and goals)
</files_to_read>

<downstream_consumer>
Your METHODOLOGICAL-LANDSCAPE.md feeds into search protocol development. Be prescriptive:
- Methods taxonomy with design types identified
- Validated instruments listed with references
- Research design patterns catalogued
</downstream_consumer>

<quality_gate>
- [ ] Methods inventory with design types identified
- [ ] Validated instruments listed with references
- [ ] Research design patterns catalogued
</quality_gate>

<output>
Write to: .planning/research/METHODOLOGICAL-LANDSCAPE.md
Use template: /Users/jeremiahwolf/.claude/grd/templates/research-project/METHODOLOGICAL-LANDSCAPE.md
</output>
", subagent_type="grd-project-researcher", model="{researcher_model}", description="Methodological Landscape research")

Task(prompt="<research_type>
Project Research — Prior Findings & Key Themes for [domain].
</research_type>

<milestone_context>
[greenfield OR subsequent]

Greenfield: What has the field established empirically about [domain]? What are the recurring themes?
Subsequent: What findings exist for [target area] within [domain]? Don't re-research already-covered ground.
</milestone_context>

<question>
What has the field established empirically about [domain]? What are the recurring themes and convergent findings across studies?
</question>

<files_to_read>
- {project_path} (Project context)
</files_to_read>

<downstream_consumer>
Your PRIOR-FINDINGS.md feeds into research objectives definition. Apply thematic analysis principles (Braun & Clarke, 2006). Categorize clearly:
- Thematic clusters grouping findings by theme
- Convergent vs. divergent findings distinguished
- Evidence strength assessed per theme
</downstream_consumer>

<quality_gate>
- [ ] Findings grouped by theme not chronology
- [ ] Convergent vs. divergent findings distinguished
- [ ] Evidence strength assessed per theme
</quality_gate>

<output>
Write to: .planning/research/PRIOR-FINDINGS.md
Use template: /Users/jeremiahwolf/.claude/grd/templates/research-project/PRIOR-FINDINGS.md
</output>
", subagent_type="grd-project-researcher", model="{researcher_model}", description="Prior Findings research")

Task(prompt="<research_type>
Project Research — Theoretical Framework Survey for [domain].
</research_type>

<milestone_context>
[greenfield OR subsequent]

Greenfield: What theories organize [domain]? How do major constructs relate? Where do theoretical traditions diverge?
Subsequent: What frameworks apply to [target area] within [domain]? Don't re-research already-covered ground.
</milestone_context>

<question>
What theories organize [domain]? How do major constructs relate? Where do theoretical traditions diverge?
</question>

<files_to_read>
- {project_path} (Project context)
</files_to_read>

<downstream_consumer>
Your THEORETICAL-FRAMEWORK.md informs inquiry structure in the research design. Include:
- Dominant framework with constructs
- Competing models and when each is preferred
- Integration attempts and relationships between frameworks
</downstream_consumer>

<quality_gate>
- [ ] Dominant framework clearly articulated with constructs
- [ ] Competing models identified with differentiators
- [ ] Relationships between frameworks mapped
</quality_gate>

<output>
Write to: .planning/research/THEORETICAL-FRAMEWORK.md
Use template: /Users/jeremiahwolf/.claude/grd/templates/research-project/THEORETICAL-FRAMEWORK.md
</output>
", subagent_type="grd-project-researcher", model="{researcher_model}", description="Theoretical Framework research")

Task(prompt="<research_type>
Project Research — Limitations, Critiques & Debates for [domain].
</research_type>

<milestone_context>
[greenfield OR subsequent]

Greenfield: Where do prominent scholars disagree about [domain]? What methodological weaknesses recur? What assumptions remain untested?
Subsequent: What debates and limitations surround [target area] within [domain]? Don't re-research already-covered ground.
</milestone_context>

<question>
Where do prominent scholars disagree about [domain]? What methodological weaknesses recur? What assumptions remain untested? What findings have failed to replicate?
</question>

<files_to_read>
- {project_path} (Project context)
</files_to_read>

<downstream_consumer>
Your LIMITATIONS-DEBATES.md prevents blind spots in research design (critical appraisal per CASP UK, 2024; problematization per Alvesson & Sandberg, 2011). For each issue:
- Key positions with proponents
- Methodological disputes affecting evidence evaluation
- Replication failures and untested assumptions
</downstream_consumer>

<quality_gate>
- [ ] Debates are specific to this domain (not generic academic issues)
- [ ] Key positions identified with proponents
- [ ] Replication failures and untested assumptions catalogued
</quality_gate>

<output>
Write to: .planning/research/LIMITATIONS-DEBATES.md
Use template: /Users/jeremiahwolf/.claude/grd/templates/research-project/LIMITATIONS-DEBATES.md
</output>
", subagent_type="grd-project-researcher", model="{researcher_model}", description="Limitations & Debates research")
```

After all 4 agents complete, spawn synthesizer to create SUMMARY.md:

```
Task(prompt="
<task>
Synthesize research outputs into SUMMARY.md.
</task>

<files_to_read>
- .planning/research/METHODOLOGICAL-LANDSCAPE.md
- .planning/research/PRIOR-FINDINGS.md
- .planning/research/THEORETICAL-FRAMEWORK.md
- .planning/research/LIMITATIONS-DEBATES.md
</files_to_read>

<output>
Write to: .planning/research/SUMMARY.md
Use template: /Users/jeremiahwolf/.claude/grd/templates/research-project/SUMMARY.md
Commit after writing.
</output>
", subagent_type="grd-research-synthesizer", model="{synthesizer_model}", description="Synthesize research")
```

Display research complete banner and key findings:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► RESEARCH COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Key Findings

**Methodological Landscape:** [from SUMMARY.md]
**Prior Findings:** [from SUMMARY.md]
**Limitations & Debates:** [from SUMMARY.md]

Files: `.planning/research/`
```

**If "Skip research":** Continue to Step 7.

## 7. Define Requirements

Display stage banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► DEFINING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Load context:**

Read PROJECT.md and extract:
- Core value (the ONE thing that must work)
- Stated constraints (budget, timeline, tech limitations)
- Any explicit scope boundaries

**If research exists:** Read research/PRIOR-FINDINGS.md and extract research question categories.

**If auto mode:**
- Auto-include all table stakes features (users expect these)
- Include features explicitly mentioned in provided document
- Auto-defer differentiators not mentioned in document
- Skip per-category AskUserQuestion loops
- Skip "Any additions?" question
- Skip requirements approval gate
- Generate REQUIREMENTS.md and commit directly

**Present features by category (interactive mode only):**

```
Here are the features for [domain]:

## Authentication
**Table stakes:**
- Sign up with email/password
- Email verification
- Password reset
- Session management

**Differentiators:**
- Magic link login
- OAuth (Google, GitHub)
- 2FA

**Research notes:** [any relevant notes]

---

## [Next Category]
...
```

**If no research:** Gather requirements through conversation instead.

Ask: "What are the main things users need to be able to do?"

For each capability mentioned:
- Ask clarifying questions to make it specific
- Probe for related capabilities
- Group into categories

**Scope each category:**

For each category, use AskUserQuestion:

- header: "[Category]" (max 12 chars)
- question: "Which [category] features are in v1?"
- multiSelect: true
- options:
  - "[Feature 1]" — [brief description]
  - "[Feature 2]" — [brief description]
  - "[Feature 3]" — [brief description]
  - "None for v1" — Defer entire category

Track responses:
- Selected features → v1 requirements
- Unselected table stakes → v2 (users expect these)
- Unselected differentiators → out of scope

**Identify gaps:**

Use AskUserQuestion:
- header: "Additions"
- question: "Any requirements research missed? (Features specific to your vision)"
- options:
  - "No, research covered it" — Proceed
  - "Yes, let me add some" — Capture additions

**Validate core value:**

Cross-check requirements against Core Value from PROJECT.md. If gaps detected, surface them.

**Generate REQUIREMENTS.md:**

Create `.planning/REQUIREMENTS.md` with:
- v1 Requirements grouped by category (checkboxes, REQ-IDs)
- v2 Requirements (deferred)
- Out of Scope (explicit exclusions with reasoning)
- Traceability section (empty, filled by roadmap)

**REQ-ID format:** `[CATEGORY]-[NUMBER]` (AUTH-01, CONTENT-02)

**Requirement quality criteria:**

Good requirements are:
- **Specific and testable:** "User can reset password via email link" (not "Handle password reset")
- **User-centric:** "User can X" (not "System does Y")
- **Atomic:** One capability per requirement (not "User can login and manage profile")
- **Independent:** Minimal dependencies on other requirements

Reject vague requirements. Push for specificity:
- "Handle authentication" → "User can log in with email/password and stay logged in across sessions"
- "Support sharing" → "User can share post via link that opens in recipient's browser"

**Present full requirements list (interactive mode only):**

Show every requirement (not counts) for user confirmation:

```
## v1 Requirements

### Authentication
- [ ] **AUTH-01**: User can create account with email/password
- [ ] **AUTH-02**: User can log in and stay logged in across sessions
- [ ] **AUTH-03**: User can log out from any page

### Content
- [ ] **CONT-01**: User can create posts with text
- [ ] **CONT-02**: User can edit their own posts

[... full list ...]

---

Does this capture what you're building? (yes / adjust)
```

If "adjust": Return to scoping.

**Commit requirements:**

```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" commit "docs: define v1 requirements" --files .planning/REQUIREMENTS.md
```

## 8. Create Roadmap

Display stage banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► CREATING ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning roadmapper...
```

Spawn grd-roadmapper agent with path references:

```
Task(prompt="
<planning_context>

<files_to_read>
- .planning/PROJECT.md (Project context)
- .planning/REQUIREMENTS.md (v1 Requirements)
- .planning/research/SUMMARY.md (Research findings - if exists)
- .planning/config.json (Granularity and mode settings)
</files_to_read>

</planning_context>

<instructions>
Create roadmap:
1. Derive phases from requirements (don't impose structure)
2. Map every v1 requirement to exactly one phase
3. Derive 2-5 success criteria per phase (observable user behaviors)
4. Validate 100% coverage
5. Write files immediately (ROADMAP.md, STATE.md, update REQUIREMENTS.md traceability)
6. Return ROADMAP CREATED with summary

Write files first, then return. This ensures artifacts persist even if context is lost.
</instructions>
", subagent_type="grd-roadmapper", model="{roadmapper_model}", description="Create roadmap")
```

**Handle roadmapper return:**

**If `## ROADMAP BLOCKED`:**
- Present blocker information
- Work with user to resolve
- Re-spawn when resolved

**If `## ROADMAP CREATED`:**

Read the created ROADMAP.md and present it nicely inline:

```
---

## Proposed Roadmap

**[N] phases** | **[X] requirements mapped** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | [Name] | [Goal] | [REQ-IDs] | [count] |
| 2 | [Name] | [Goal] | [REQ-IDs] | [count] |
| 3 | [Name] | [Goal] | [REQ-IDs] | [count] |
...

### Phase Details

**Phase 1: [Name]**
Goal: [goal]
Requirements: [REQ-IDs]
Success criteria:
1. [criterion]
2. [criterion]
3. [criterion]

**Phase 2: [Name]**
Goal: [goal]
Requirements: [REQ-IDs]
Success criteria:
1. [criterion]
2. [criterion]

[... continue for all phases ...]

---
```

**If auto mode:** Skip approval gate — auto-approve and commit directly.

**CRITICAL: Ask for approval before committing (interactive mode only):**

Use AskUserQuestion:
- header: "Roadmap"
- question: "Does this roadmap structure work for you?"
- options:
  - "Approve" — Commit and continue
  - "Adjust phases" — Tell me what to change
  - "Review full file" — Show raw ROADMAP.md

**If "Approve":** Continue to commit.

**If "Adjust phases":**
- Get user's adjustment notes
- Re-spawn roadmapper with revision context:
  ```
  Task(prompt="
  <revision>
  User feedback on roadmap:
  [user's notes]

  <files_to_read>
  - .planning/ROADMAP.md (Current roadmap to revise)
  </files_to_read>

  Update the roadmap based on feedback. Edit files in place.
  Return ROADMAP REVISED with changes made.
  </revision>
  ", subagent_type="grd-roadmapper", model="{roadmapper_model}", description="Revise roadmap")
  ```
- Present revised roadmap
- Loop until user approves

**If "Review full file":** Display raw `cat .planning/ROADMAP.md`, then re-ask.

**Commit roadmap (after approval or auto mode):**

```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" commit "docs: create roadmap ([N] phases)" --files .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md
```

## 9. Done

Present completion summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► PROJECT INITIALIZED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[Project Name]**

| Artifact       | Location                    |
|----------------|-----------------------------|
| Project        | `.planning/PROJECT.md`      |
| Config         | `.planning/config.json`     |
| Research       | `.planning/research/`       |
| Requirements   | `.planning/REQUIREMENTS.md` |
| Roadmap        | `.planning/ROADMAP.md`      |

**[N] phases** | **[X] requirements** | Ready to build ✓
```

**If auto mode:**

```
╔══════════════════════════════════════════╗
║  AUTO-ADVANCING → DISCUSS PHASE 1        ║
╚══════════════════════════════════════════╝
```

Exit skill and invoke SlashCommand("/grd:scope-inquiry 1 --auto")

**If interactive mode:**

```
───────────────────────────────────────────────────────────────

## ▶ Next Up

**Phase 1: [Phase Name]** — [Goal from ROADMAP.md]

/grd:scope-inquiry 1 — gather context and clarify approach

<sub>/clear first → fresh context window</sub>

---

**Also available:**
- /grd:plan-inquiry 1 — skip discussion, plan directly

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.planning/PROJECT.md`
- `.planning/config.json`
- `.planning/research/` (if research selected)
  - `METHODOLOGICAL-LANDSCAPE.md`
  - `PRIOR-FINDINGS.md`
  - `THEORETICAL-FRAMEWORK.md`
  - `LIMITATIONS-DEBATES.md`
  - `SUMMARY.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`

</output>

<success_criteria>

- [ ] .planning/ directory created
- [ ] Git repo initialized
- [ ] Brownfield detection completed
- [ ] Deep questioning completed (threads followed, not rushed)
- [ ] PROJECT.md captures full context → **committed**
- [ ] config.json has workflow mode, granularity, parallelization → **committed**
- [ ] Research completed (if selected) — 4 parallel agents spawned → **committed**
- [ ] Requirements gathered (from research or conversation)
- [ ] User scoped each category (v1/v2/out of scope)
- [ ] REQUIREMENTS.md created with REQ-IDs → **committed**
- [ ] grd-roadmapper spawned with context
- [ ] Roadmap files written immediately (not draft)
- [ ] User feedback incorporated (if any)
- [ ] ROADMAP.md created with phases, requirement mappings, success criteria
- [ ] STATE.md initialized
- [ ] REQUIREMENTS.md traceability updated
- [ ] User knows next step is `/grd:scope-inquiry 1`

**Atomic commits:** Each phase commits its artifacts immediately. If context is lost, artifacts persist.

</success_criteria>
