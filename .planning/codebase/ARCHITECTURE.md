# Architecture

**Analysis Date:** 2026-03-23

## Pattern Overview

**Overall:** Meta-prompting system — a CLI installer that deploys AI agent instructions, workflow scripts, and a Node.js CLI tool into an AI coding assistant's configuration directory.

**Key Characteristics:**
- There is no application runtime in the traditional sense; the "runtime" is the AI assistant (Claude Code, GitHub Copilot, OpenCode, etc.)
- The Node.js CLI (`grd-tools.cjs`) is a pure utility layer — it reads/writes planning state files and outputs JSON to stdout for consumption by workflow markdown files
- Workflow `.md` files embedded in `grd/workflows/` are the primary control-flow layer; they are prompts executed by the AI assistant, not code executed by Node
- Agent `.md` files in `agents/` and `grd/agents/` are subagent definitions the AI runtime can spawn
- The system has a research orientation: it extends an upstream productivity system (get-shit-done-cc) with source acquisition, vault writing, note verification, and synthesis pipelines

## Layers

**CLI Installer Layer:**
- Purpose: Deploys package assets into the user's AI assistant config directory (~/.claude/, ~/.opencode/, etc.)
- Location: `bin/install.js`
- Contains: Interactive runtime selection, asset copying, config injection
- Depends on: Nothing (pure Node.js stdlib)
- Used by: End user via `npx get-research-done` or `npm install -g`

**Node.js Utility Library (grd-tools):**
- Purpose: Provides atomic operations for workflow markdown files to call via bash — state management, phase CRUD, config, roadmap parsing, frontmatter handling, model resolution
- Location: `grd/bin/grd-tools.cjs` (entry point), `grd/bin/lib/` (all modules)
- Contains: ~25 CJS modules handling specific domains (state, phase, roadmap, config, vault, acquire, verify, etc.)
- Depends on: Node.js stdlib, `docx` npm package (for Word output)
- Used by: Workflow `.md` files via bash `node grd-tools.cjs <command>`

**Workflow Layer:**
- Purpose: Orchestrates multi-step research and planning processes; each `.md` file is a prompt script that an AI assistant follows
- Location: `grd/workflows/` (70 files)
- Contains: XML-tagged instruction blocks (`<purpose>`, `<process>`, `<step>`, `<core_principle>`) with embedded bash blocks calling `grd-tools.cjs`
- Depends on: `grd-tools.cjs` for state reads/writes; agent definitions for subagent spawning
- Used by: Commands layer, which wires `/grd:*` slash commands to these workflows

**Commands Layer:**
- Purpose: Thin Claude Code slash-command wrappers; each `.md` file defines a `/grd:*` command
- Location: `commands/grd/` (38 files)
- Contains: Frontmatter (`name`, `description`, `allowed-tools`), objective, and `@reference` to a workflow in `grd/workflows/`
- Depends on: Workflow layer
- Used by: User typing `/grd:command-name` in AI assistant

**Agent Definitions:**
- Purpose: Named subagent personas with specific tools, skills, and roles; spawned by orchestrator workflows
- Location: `agents/` (16 `.md` files, top-level, deployed to `~/.claude/agents/`), `grd/agents/` (4 research-specific synthesis agents)
- Contains: YAML frontmatter (`name`, `tools`, `color`, `skills`), role description, execution flow referencing `grd-tools.cjs`
- Depends on: `grd-tools.cjs`, workflow files
- Used by: Orchestrator workflows via `Task(subagent_type="grd-*", ...)`

**Templates Layer:**
- Purpose: Document templates for planning artifacts and research outputs
- Location: `grd/templates/` (44 files), `grd/templates/codebase/`, `grd/templates/research-project/`
- Contains: Markdown templates for PLAN.md, SUMMARY.md, research-note.md, context.md, phase-prompt.md, etc.
- Depends on: Nothing
- Used by: Agent and workflow prompts via `@` file references

**Reference Library:**
- Purpose: Reusable instruction fragments for common patterns (verification, git, model resolution, etc.)
- Location: `grd/references/` (19 files)
- Contains: Short `.md` files covering topics like `source-protocol.md`, `checkpoints.md`, `model-profiles.md`, `verification-patterns.md`
- Depends on: Nothing
- Used by: Workflow and agent files via `@` file references in `<required_reading>` blocks

**Planning State (user project data):**
- Purpose: Per-project working state — roadmap, phases, research notes, config
- Location: `.planning/` (inside the user's project, not this repo)
- Contains: `STATE.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `PROJECT.md`, `phases/`, `research/`, `codebase/`, `config.json`
- Depends on: Written/read by `grd-tools.cjs`
- Used by: All workflows and agents at runtime

## Data Flow

**Research Project Initialization (`/grd:new-research`):**

1. User runs `/grd:new-research` in AI assistant
2. `commands/grd/new-research.md` routes to `grd/workflows/new-research.md`
3. Workflow calls `grd-tools.cjs init new-research` → returns JSON with project context
4. Workflow drives questioning conversation with user
5. Optionally spawns `grd-roadmapper` subagent to draft ROADMAP.md
6. `grd-tools.cjs` writes `STATE.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `PROJECT.md` to `.planning/`

**Investigation Phase Execution (`/grd:conduct-inquiry`):**

1. User runs `/grd:conduct-inquiry <phase>`
2. Workflow calls `grd-tools.cjs init conduct-inquiry <phase>` → returns phase info, models, plan list
3. Workflow reads PLAN.md files, groups them into dependency waves
4. Per wave: spawns `grd-executor` subagents in parallel with plan file paths
5. Each executor: reads PLAN.md, executes tasks, commits changes, writes SUMMARY.md
6. Workflow collects completions, verifies via `grd-tools.cjs verify-summary`
7. `grd-tools.cjs state update` advances STATE.md current phase

**Plan Creation (`/grd:plan-inquiry`):**

1. Optionally spawns `grd-phase-researcher` for background research
2. Spawns `grd-planner` to produce PLAN.md files (wave-tagged, dependency-mapped)
3. Spawns `grd-plan-checker` to review quality; revision loop up to 3 iterations
4. Plans written to `.planning/phases/<N>-<slug>/`

**Research Note Lifecycle:**

1. `grd-source-researcher` or `grd-phase-researcher` acquires sources via `grd/bin/lib/acquire.cjs` (wget, firecrawl, web_fetch)
2. Sources stored in vault under `<note>-sources/` sibling directory via `grd/bin/lib/vault.cjs`
3. Notes written with frontmatter (project, domain, inquiry, era, status, review_type) via `grd/templates/research-note.md`
4. `/grd:verify-inquiry` calls `grd/bin/lib/verify-research.cjs` and `verify-sufficiency.cjs` to check source attachment and claim support
5. `/grd:synthesize` orchestrates 4-wave synthesis (themes → framework → gaps → argument) via synthesis agents in `grd/agents/`

**State Management:**
- `STATE.md` is the single source of truth for current phase, milestone, and project status
- Frontmatter parsed and written by `grd/bin/lib/state.cjs` and `grd/bin/lib/frontmatter.cjs`
- All workflow init calls return state-derived JSON to minimize redundant reads

## Key Abstractions

**grd-tools.cjs commands:**
- Purpose: Shell-friendly atomic operations; workflows call these via bash and parse JSON stdout
- Examples: `grd/bin/grd-tools.cjs`, `grd/bin/lib/init.cjs` (compound init commands)
- Pattern: `const result = JSON.parse(stdout)` — every command emits either raw JSON or structured output

**Model Profiles:**
- Purpose: Maps each agent type to a specific Claude model (opus/sonnet/haiku) per cost profile (quality/balanced/budget)
- Examples: `grd/bin/lib/model-profiles.cjs`
- Pattern: `MODEL_PROFILES['grd-planner'] = { quality: 'opus', balanced: 'opus', budget: 'sonnet' }`; resolved at init time per agent

**Workstream Namespacing:**
- Purpose: Enables parallel milestones by scoping planning files under `.planning/workstreams/<name>/`
- Examples: `grd/bin/lib/workstream.cjs`
- Pattern: When workstreams exist, `planningPaths(cwd)` returns paths under the active workstream directory; flat mode is backward-compatible default

**Researcher Tier Communication:**
- Purpose: Adapts workflow prose verbosity to user expertise (`guided` / `standard` / `expert`)
- Examples: `grd/workflows/scope-inquiry.md`, `grd/templates/research-note.md`
- Pattern: `<!-- tier:guided -->` / `<!-- tier:standard -->` / `<!-- tier:expert -->` conditional blocks stripped at render time

**Review Type Smart Defaults:**
- Purpose: Configures critical appraisal, synthesis, and plan-checker behavior based on declared review type (systematic / scoping / integrative / critical / narrative)
- Examples: `grd/bin/lib/config.cjs` `SMART_DEFAULTS` map
- Pattern: Declared in `config.json` as `review_type`; `configWithDefaults()` merges hardcoded defaults → smart defaults → user overrides

## Entry Points

**`bin/install.js`:**
- Location: `bin/install.js`
- Triggers: `npx get-research-done`, `npm install -g get-research-done`
- Responsibilities: Copies `grd/`, `agents/`, `commands/`, `hooks/dist/`, `scripts/` into target AI runtime config directory; injects agent list into runtime config; interactive runtime selection

**`grd/bin/grd-tools.cjs`:**
- Location: `grd/bin/grd-tools.cjs`
- Triggers: `node grd-tools.cjs <command>` called from workflow bash blocks
- Responsibilities: Routes CLI commands to lib modules, outputs JSON to stdout; handles `@file:` response format for large payloads

**`commands/grd/*.md` (slash commands):**
- Location: `commands/grd/`
- Triggers: User typing `/grd:<name>` in AI assistant
- Responsibilities: Provide `$ARGUMENTS` context, load `@workflow` via `execution_context`, optionally load project state files

**`agents/*.md` (subagent entry points):**
- Location: `agents/`
- Triggers: Spawned via `Task(subagent_type="grd-executor", ...)` in orchestrator workflows
- Responsibilities: Load project context, call `grd-tools.cjs init <agent-type>`, execute specialized task, return result to orchestrator

## Error Handling

**Strategy:** Fail-fast with structured JSON errors; workflow prompts instruct the AI to surface errors directly to user.

**Patterns:**
- `grd-tools.cjs` calls `error(message)` helper which writes JSON `{ error: message }` to stdout and exits 1
- Workflows check JSON fields like `phase_found`, `project_exists`, `state_exists` before proceeding
- Subagent completion fallback: if orchestrator never receives a signal, it checks filesystem (SUMMARY.md exists + commits visible) and treats as success

## Cross-Cutting Concerns

**Logging:** No logging framework; `grd-tools.cjs` outputs structured JSON to stdout, workflows surface output to user as conversational prose.

**Validation:** `grd/bin/lib/security.cjs` provides path traversal prevention and prompt injection sanitization for user-supplied text flowing into planning markdown files (which become LLM prompts).

**Authentication:** No authentication. Tool operates on local filesystem only; external API keys (Brave, Firecrawl, Exa) are read from environment variables passed to `grd-tools.cjs` websearch command.

**Model Resolution:** Every agent-spawning workflow calls `grd-tools.cjs resolve-model <agent-type>` or reads `resolver_model` from init JSON; resolved against `model_profile` in `config.json`.

---

*Architecture analysis: 2026-03-23*
