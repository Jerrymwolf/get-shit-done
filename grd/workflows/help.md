<purpose>
Display the complete GRD command reference. Output ONLY the reference content. Do NOT add project-specific analysis, git status, next-step suggestions, or any commentary beyond the reference.
</purpose>

<reference>
# GRD Command Reference

**GRD** (Get Research Done) manages scholarly inquiry from scoping questions through synthesis and delivery, optimized for solo researchers working with Claude Code.

## Quick Start

1. `/grd:new-research` - Define your research questions, scope, and plan of inquiry
2. `/grd:plan-inquiry 1` - Create a detailed plan for the first line of inquiry
3. `/grd:conduct-inquiry 1` - Execute the inquiry plan

## Staying Updated

GRD evolves fast. Update periodically:

```bash
npx grd@latest
```

## Core Workflow

```
/grd:new-research -> /grd:plan-inquiry -> /grd:conduct-inquiry -> repeat
```

## Research Workflow

### Scoping and Planning

**`/grd:new-research`**
Define research questions, explore the landscape, scope requirements, and create a roadmap of inquiry phases.

One command takes you from research idea to ready-for-planning:
- Deep questioning to understand your research goals and domain
- Optional domain research (spawns 4 parallel researcher agents)
- Requirements definition with v1/v2/out-of-scope scoping
- Roadmap creation with inquiry phase breakdown and success criteria

Creates all `.planning/` artifacts:
- `PROJECT.md` -- research vision and requirements
- `config.json` -- workflow mode (interactive/yolo)
- `research/` -- domain research (if selected)
- `REQUIREMENTS.md` -- scoped requirements with REQ-IDs
- `ROADMAP.md` -- inquiry phases mapped to requirements
- `STATE.md` -- project memory

Usage: `/grd:new-research`

**`/grd:scope-inquiry <number>`**
Articulate your vision for a line of inquiry before planning.

- Captures methodology choices, scope boundaries, and theoretical emphasis
- Creates CONTEXT.md with your vision, essentials, and boundaries
- Use when you have ideas about how an inquiry phase should proceed
- Optional `--batch` asks 2-5 related questions at a time instead of one-by-one

Usage: `/grd:scope-inquiry 2`
Usage: `/grd:scope-inquiry 2 --batch`
Usage: `/grd:scope-inquiry 2 --batch=3`

**`/grd:research-phase <number>`**
Deep ecosystem research for specialized or unfamiliar domains.

- Discovers standard approaches, frameworks, and methodological pitfalls
- Creates RESEARCH.md with "how experts study this" knowledge
- Use for niche domains: neuroscience methods, qualitative coding, corpus linguistics, etc.
- Goes beyond "which framework" to methodological ecosystem knowledge

Usage: `/grd:research-phase 3`

**`/grd:list-phase-assumptions <number>`**
Preview Claude's intended approach before execution.

- Shows Claude's planned methodology for an inquiry phase
- Lets you course-correct if Claude misunderstood your research direction
- No files created -- conversational output only

Usage: `/grd:list-phase-assumptions 3`

**`/grd:plan-inquiry <number>`**
Create detailed execution plan for a line of inquiry.

- Generates `.planning/phases/XX-phase-name/XX-YY-PLAN.md`
- Breaks inquiry into concrete, actionable research tasks
- Includes verification criteria and success measures
- Multiple plans per phase supported (XX-01, XX-02, etc.)

Usage: `/grd:plan-inquiry 1`
Result: Creates `.planning/phases/01-literature-review/01-01-PLAN.md`

**PRD Express Path:** Pass `--prd path/to/requirements.md` to skip scope-inquiry entirely. Your PRD becomes locked decisions in CONTEXT.md. Useful when you already have clear acceptance criteria.

### Conducting Research

**`/grd:conduct-inquiry <phase-number>`**
Execute all plans in an inquiry phase, or run a specific wave.

- Groups plans by wave (from frontmatter), executes waves sequentially
- Plans within each wave run in parallel via Task tool
- Optional `--wave N` flag executes only Wave `N` and stops unless the phase is now fully complete
- Verifies inquiry phase goal after all plans complete
- Updates REQUIREMENTS.md, ROADMAP.md, STATE.md

Usage: `/grd:conduct-inquiry 5`
Usage: `/grd:conduct-inquiry 5 --wave 2`

**`/grd:map-corpus`**
Survey existing sources and the knowledge landscape of a research project.

- Analyzes corpus with parallel mapper agents
- Creates `.planning/corpus/` with 7 structured documents:
  - SOURCES.md -- source inventory (what has been acquired and where)
  - DOMAINS.md -- domain coverage (which research areas are represented)
  - METHODOLOGY.md -- methodological approaches across sources
  - COVERAGE.md -- evidence quality distribution
  - GAPS.md -- missing domains, perspectives, and temporal gaps
  - CONNECTIONS.md -- cross-citations, shared frameworks, debates
  - QUALITY.md -- overall corpus breadth, depth, recency, diversity
- Use before `/grd:new-research` on existing corpora, or anytime to refresh understanding

Usage: `/grd:map-corpus`

**`/grd:add-verification <phase>`**
Add evidence checks, source coverage assertions, and methodology validation for a completed inquiry phase.

- Analyzes research outputs (notes, sources, synthesis documents)
- Classifies checks into Evidence (source fidelity), Coverage (completeness), or Methodology (soundness)
- Presents verification plan for approval, then generates criteria
- Commits verification criteria for the phase

Usage: `/grd:add-verification 12`
Usage: `/grd:add-verification 12 focus on source coverage for autonomy domain`

**`/grd:diagnose [issue]`**
Investigate methodology gaps, source conflicts, and analytical dead ends with persistent diagnosis sessions.

- Gathers symptoms through adaptive questioning about the research problem
- Creates `.planning/debug/[slug].md` to track the investigation
- Uses systematic method: evidence -> hypothesis -> test
- Survives `/clear` -- run `/grd:diagnose` with no args to resume
- Archives resolved issues to `.planning/debug/resolved/`

Research issues this command investigates:
- Methodology gaps (missing controls, weak sampling, unvalidated instruments)
- Source conflicts (contradictory findings, incompatible frameworks)
- Analytical dead ends (circular reasoning, unfalsifiable claims, insufficient evidence)
- Coverage gaps (missing domains, underrepresented perspectives)
- Citation integrity issues (broken source chains, missing primary sources)

Usage: `/grd:diagnose "contradictory findings on autonomy and motivation"`
Usage: `/grd:diagnose` (resume active session)

**`/grd:verify-inquiry [phase]`**
Validate research findings through structured acceptance testing.

- Extracts testable deliverables from SUMMARY.md files
- Presents verification criteria one at a time (yes/no responses)
- Automatically diagnoses failures and creates remediation plans
- Ready for re-execution if issues found

Usage: `/grd:verify-inquiry 3`

### Synthesis and Delivery

**`/grd:synthesize`**
Transform verified notes into structured scholarship.

Runs four synthesis activities:
1. Thematic synthesis (THEMES.md) -- identifies cross-cutting patterns
2. Theoretical integration (FRAMEWORK.md) -- builds conceptual scaffolding
3. Gap analysis (GAPS.md) -- maps what remains unknown
4. Argument construction (Executive Summary) -- assembles the scholarly narrative

Usage: `/grd:synthesize`

**`/grd:presentation-design [phase]`**
Plan how research findings will be presented -- paper, poster, slide deck, or report.

- Creates PRESENTATION-SPEC.md with structural and narrative decisions
- Determines communication format and audience framing
- Locks presentation design before final deliverable assembly

Usage: `/grd:presentation-design`
Usage: `/grd:presentation-design 4`

**`/grd:output-review [phase]`**
Audit quality of research deliverables across six scholarly dimensions.

- Argument coherence -- does the narrative hold together?
- Evidence quality -- are claims supported by strong sources?
- Citation coverage -- are all assertions properly sourced?
- Methodology transparency -- are methods clearly described?
- Presentation clarity -- is the writing accessible to the audience?
- Completeness -- are all required sections present?

Produces OUTPUT-REVIEW.md with scored assessment and actionable findings.

Usage: `/grd:output-review`
Usage: `/grd:output-review 4`

**`/grd:export-research [phase|milestone]`**
Package completed research for delivery -- Obsidian vault, manuscript assembly, or shareable archive.

- Validates research completeness (notes, sources, synthesis)
- Packages deliverables in chosen export format
- Tracks export status in STATE.md

Prerequisites: Phase verified, research notes and sources exist.

Usage: `/grd:export-research 4` or `/grd:export-research`

**`/grd:export-clean [target-dir]`**
Create clean research package without .planning/ artifacts for sharing or submission.

- Classifies content: research artifacts (include), planning metadata (exclude), GRD internals (exclude)
- Copies only notes, sources, synthesis documents, and SOURCE-LOGs
- Generates MANIFEST.md with contents summary

Usage: `/grd:export-clean` or `/grd:export-clean ./submission/`

### Inquiry Management

**`/grd:add-phase <description>`**
Add a new line of inquiry to the current milestone.

- Appends to ROADMAP.md
- Uses next sequential number
- Updates phase directory structure

Usage: `/grd:add-phase "Survey motivation frameworks in education literature"`

**`/grd:insert-phase <after> <description>`**
Insert urgent inquiry between existing phases.

- Creates intermediate phase (e.g., 7.1 between 7 and 8)
- Useful for discovered work that must happen mid-milestone
- Maintains phase ordering

Usage: `/grd:insert-phase 7 "Address conflicting SDT findings before synthesis"`
Result: Creates Phase 7.1

**`/grd:remove-phase <number>`**
Remove a future inquiry phase and renumber subsequent phases.

- Deletes phase directory and all references
- Renumbers all subsequent phases to close the gap
- Only works on future (unstarted) phases
- Git commit preserves historical record

Usage: `/grd:remove-phase 17`
Result: Phase 17 deleted, phases 18-20 become 17-19

**`/grd:new-milestone <name>`**
Start a new research milestone through unified flow.

- Deep questioning to understand the next body of inquiry
- Optional domain research (spawns 4 parallel researcher agents)
- Requirements definition with scoping
- Roadmap creation with phase breakdown
- Optional `--reset-phase-numbers` flag restarts numbering at Phase 1

Mirrors `/grd:new-research` flow for ongoing projects (existing PROJECT.md).

Usage: `/grd:new-milestone "v2.0 Empirical Validation"`
Usage: `/grd:new-milestone --reset-phase-numbers "v2.0 Empirical Validation"`

**`/grd:complete-study <version>`**
Archive completed milestone and prepare for next body of work.

- Creates MILESTONES.md entry with stats
- Archives full details to milestones/ directory
- Creates git tag for the milestone
- Prepares workspace for next version

Usage: `/grd:complete-study 1.0.0`

## Smart Router

**`/grd:do <description>`**
Route freeform text to the right GRD command automatically.

- Analyzes natural language input to find the best matching GRD command
- Acts as a dispatcher -- never does the work itself
- Resolves ambiguity by asking you to pick between top matches
- Use when you know what you want but don't know which `/grd:*` command to run

Usage: `/grd:do find gaps in my source coverage`
Usage: `/grd:do I want to start synthesizing my findings`
Usage: `/grd:do map what sources I already have`

## Quick Mode

**`/grd:quick [--full] [--discuss] [--research]`**
Execute small, ad-hoc research tasks with GRD guarantees but skip optional agents.

Quick mode uses the same system with a shorter path:
- Spawns planner + executor (skips researcher, checker, verifier by default)
- Quick tasks live in `.planning/quick/` separate from planned phases
- Updates STATE.md tracking (not ROADMAP.md)

Flags enable additional quality steps:
- `--discuss` -- Lightweight discussion to surface gray areas before planning
- `--research` -- Focused research agent investigates approaches before planning
- `--full` -- Adds plan-checking (max 2 iterations) and post-execution verification

Flags are composable: `--discuss --research --full` gives the complete quality pipeline for a single task.

Usage: `/grd:quick`
Usage: `/grd:quick --research --full`
Result: Creates `.planning/quick/NNN-slug/PLAN.md`, `.planning/quick/NNN-slug/SUMMARY.md`

---

**`/grd:fast [description]`**
Execute a trivial task inline -- no subagents, no planning files, no overhead.

For tasks too small to justify planning: typo fixes, config changes, forgotten commits, simple additions. Runs in the current context, makes the change, commits, and logs to STATE.md.

- No PLAN.md or SUMMARY.md created
- No subagent spawned (runs inline)
- <= 3 file edits -- redirects to `/grd:quick` if task is non-trivial
- Atomic commit with conventional message

Usage: `/grd:fast "fix the typo in README"`
Usage: `/grd:fast "add .env to gitignore"`

## Utility

**`/grd:progress`**
Check research progress and intelligently route to next action.

- Shows visual progress bar and completion percentage
- Summarizes recent research from SUMMARY files
- Displays current position and what's next
- Lists key decisions and open issues
- Offers to execute next plan or create it if missing
- Detects 100% milestone completion

Usage: `/grd:progress`

**`/grd:stats`**
Display project statistics -- phases, plans, requirements, git metrics, and timeline.

- Shows phase progress across milestones
- Reports plan execution metrics and velocity
- Tracks requirements completion
- Summarizes git history and project timeline

Usage: `/grd:stats`

**`/grd:health [--repair]`**
Diagnose .planning/ directory integrity and optionally repair issues.

- Checks for missing files, invalid configurations, inconsistent state
- Detects orphaned plans and broken references
- Optional `--repair` flag automatically fixes recoverable issues
- Reports actionable findings for manual issues

Usage: `/grd:health`
Usage: `/grd:health --repair`

**`/grd:resume-work`**
Resume research from previous session with full context restoration.

- Reads STATE.md for project context
- Shows current position and recent progress
- Offers next actions based on project state

Usage: `/grd:resume-work`

**`/grd:pause-work`**
Create context handoff when pausing mid-inquiry.

- Creates .continue-here file with current state
- Updates STATE.md session continuity section
- Captures in-progress work context

Usage: `/grd:pause-work`

**`/grd:note <text>`**
Zero-friction idea capture -- one command, instant save, no questions.

- Saves timestamped note to `.planning/notes/` (or `$HOME/.claude/notes/` globally)
- Three subcommands: append (default), list, promote
- Promote converts a note into a structured todo
- Works without a project (falls back to global scope)

Usage: `/grd:note refactor the theoretical framework`
Usage: `/grd:note list`
Usage: `/grd:note promote 3`
Usage: `/grd:note --global cross-project idea`

**`/grd:add-todo [description]`**
Capture research task or idea as structured todo.

- Extracts context from conversation (or uses provided description)
- Creates structured todo file in `.planning/todos/pending/`
- Infers area from file paths for grouping
- Checks for duplicates before creating
- Updates STATE.md todo count

Usage: `/grd:add-todo` (infers from conversation)
Usage: `/grd:add-todo Revisit autonomy measurement instruments`

**`/grd:check-todos [area]`**
Review pending todos and select one to work on.

- Lists all pending todos with title, area, age
- Optional area filter (e.g., `/grd:check-todos methodology`)
- Loads full context for selected todo
- Routes to appropriate action (work now, add to phase, brainstorm)
- Moves todo to done/ when work begins

Usage: `/grd:check-todos`
Usage: `/grd:check-todos methodology`

**`/grd:plant-seed [idea]`**
Capture a forward-looking idea with trigger conditions for automatic surfacing.

- Seeds preserve WHY, WHEN to surface, and breadcrumbs to related work
- Auto-surfaces during `/grd:new-milestone` when trigger conditions match
- Better than deferred items -- triggers are checked, not forgotten

Usage: `/grd:plant-seed "explore longitudinal methods when we study developmental trajectories"`

**`/grd:review --phase N [--all]`**
Cross-AI peer review of inquiry plans.

- Detects available CLIs (gemini, claude, codex)
- Each CLI reviews plans independently with the same structured prompt
- Produces REVIEWS.md with per-reviewer feedback and consensus summary
- Feed reviews back into planning: `/grd:plan-inquiry N --reviews`

Usage: `/grd:review --phase 3 --all`

**`/grd:audit-milestone [version]`**
Audit milestone completion against original intent.

- Reads all phase VERIFICATION.md files
- Checks requirements coverage
- Spawns integration checker for cross-phase wiring
- Creates MILESTONE-AUDIT.md with gaps and outstanding items

Usage: `/grd:audit-milestone`

**`/grd:plan-milestone-gaps`**
Create inquiry phases to close gaps identified by audit.

- Reads MILESTONE-AUDIT.md and groups gaps into phases
- Prioritizes by requirement priority (must/should/nice)
- Adds gap closure phases to ROADMAP.md
- Ready for `/grd:plan-inquiry` on new phases

Usage: `/grd:plan-milestone-gaps`

**`/grd:audit-uat`**
Cross-phase audit of all outstanding verification items.

- Scans every phase for pending, skipped, blocked, and human-needed items
- Cross-references against research outputs to detect stale documentation
- Produces prioritized verification plan grouped by testability
- Use before starting a new milestone to clear verification debt

Usage: `/grd:audit-uat`

**`/grd:cleanup`**
Archive phase directories from completed milestones.

- Identifies phases from completed milestones still in `.planning/phases/`
- Shows dry-run summary before moving anything
- Moves phase dirs to `.planning/milestones/v{X.Y}-phases/`
- Use after multiple milestones to reduce `.planning/phases/` clutter

Usage: `/grd:cleanup`

**`/grd:join-discord`**
Join the GRD community.

- Get help, share what you're researching, stay updated
- Connect with other GRD users

Usage: `/grd:join-discord`

## Configuration

**`/grd:settings`**
Configure workflow toggles and model profile interactively.

- Toggle researcher, plan checker, verifier agents
- Select model profile (quality/balanced/budget/inherit)
- Updates `.planning/config.json`

Usage: `/grd:settings`

**`/grd:set-profile <profile>`**
Quick switch model profile for GRD agents.

- `quality` -- Opus everywhere except verification
- `balanced` -- Opus for planning, Sonnet for execution (default)
- `budget` -- Sonnet for writing, Haiku for research/verification
- `inherit` -- Use current session model for all agents (OpenCode `/model`)

Usage: `/grd:set-profile budget`

**`/grd:update`**
Update GRD to latest version with changelog preview.

- Shows installed vs latest version comparison
- Displays changelog entries for versions you've missed
- Highlights breaking changes
- Confirms before running install

Usage: `/grd:update`

**`/grd:help`**
Show this command reference.

## Files & Structure

```
.planning/
+-- PROJECT.md            # Research vision and requirements
+-- ROADMAP.md            # Inquiry phase breakdown
+-- STATE.md              # Project memory & context
+-- RETROSPECTIVE.md      # Living retrospective (updated per milestone)
+-- config.json           # Workflow mode & gates
+-- todos/                # Captured ideas and tasks
|   +-- pending/          # Todos waiting to be worked on
|   +-- done/             # Completed todos
+-- debug/                # Active diagnosis sessions
|   +-- resolved/         # Archived resolved issues
+-- corpus/               # Knowledge landscape map
|   +-- SOURCES.md        # Source inventory
|   +-- DOMAINS.md        # Domain coverage
|   +-- METHODOLOGY.md    # Methodological approaches
|   +-- COVERAGE.md       # Evidence quality distribution
|   +-- GAPS.md           # Coverage gaps
|   +-- CONNECTIONS.md    # Cross-citations and shared frameworks
|   +-- QUALITY.md        # Overall corpus quality
+-- milestones/
|   +-- v1.0-ROADMAP.md       # Archived roadmap snapshot
|   +-- v1.0-REQUIREMENTS.md  # Archived requirements
|   +-- v1.0-phases/          # Archived phase dirs (via /grd:cleanup)
|       +-- 01-literature-review/
|       +-- 02-theoretical-framework/
+-- phases/
    +-- 01-literature-review/
    |   +-- 01-01-PLAN.md
    |   +-- 01-01-SUMMARY.md
    +-- 02-theoretical-framework/
        +-- 02-01-PLAN.md
        +-- 02-01-SUMMARY.md
```

## Workflow Modes

Set during `/grd:new-research`:

**Interactive Mode**

- Confirms each major decision
- Pauses at checkpoints for approval
- More guidance throughout

**YOLO Mode**

- Auto-approves most decisions
- Executes plans without confirmation
- Only stops for critical checkpoints

Change anytime by editing `.planning/config.json`

## Planning Configuration

Configure how planning artifacts are managed in `.planning/config.json`:

**`planning.commit_docs`** (default: `true`)
- `true`: Planning artifacts committed to git (standard workflow)
- `false`: Planning artifacts kept local-only, not committed

When `commit_docs: false`:
- Add `.planning/` to your `.gitignore`
- Useful for keeping planning metadata private while sharing research outputs
- All planning files still work normally, just not tracked in git

**`planning.search_gitignored`** (default: `false`)
- `true`: Add `--no-ignore` to broad ripgrep searches
- Only needed when `.planning/` is gitignored and you want project-wide searches to include it

Example config:
```json
{
  "planning": {
    "commit_docs": false,
    "search_gitignored": true
  }
}
```

## Common Workflows

**Starting a new research project:**

```
/grd:new-research        # Unified flow: questioning -> research -> requirements -> roadmap
/clear
/grd:plan-inquiry 1       # Create plans for first inquiry phase
/clear
/grd:conduct-inquiry 1    # Execute all plans in phase
```

**Resuming research after a break:**

```
/grd:progress  # See where you left off and continue
```

**Adding urgent mid-milestone inquiry:**

```
/grd:insert-phase 5 "Address conflicting findings on intrinsic motivation"
/grd:plan-inquiry 5.1
/grd:conduct-inquiry 5.1
```

**Completing a milestone:**

```
/grd:complete-study 1.0.0
/clear
/grd:new-milestone  # Start next milestone (questioning -> research -> requirements -> roadmap)
```

**Capturing ideas during research:**

```
/grd:add-todo                                      # Capture from conversation context
/grd:add-todo Revisit autonomy measurement scales   # Capture with explicit description
/grd:check-todos                                    # Review and work on todos
/grd:check-todos methodology                        # Filter by area
```

**Diagnosing a research issue:**

```
/grd:diagnose "contradictory findings on autonomy across studies"  # Start diagnosis
# ... investigation happens, context fills up ...
/clear
/grd:diagnose                                                       # Resume from where you left off
```

## Getting Help

- Read `.planning/PROJECT.md` for research vision
- Read `.planning/STATE.md` for current context
- Check `.planning/ROADMAP.md` for inquiry phase status
- Run `/grd:progress` to check where you're up to
</reference>
