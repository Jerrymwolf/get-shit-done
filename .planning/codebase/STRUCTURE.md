# Codebase Structure

**Analysis Date:** 2026-03-23

## Directory Layout

```
GSDR/                          # Project root (get-research-done)
├── bin/
│   └── install.js             # CLI installer entry point (npx get-research-done)
├── commands/
│   └── grd/                   # Claude Code slash-command wrappers (38 .md files)
│       ├── conduct-inquiry.md
│       ├── new-research.md
│       ├── plan-inquiry.md
│       └── ...
├── agents/                    # AI subagent definitions (16 .md files)
│   ├── grd-executor.md
│   ├── grd-planner.md
│   ├── grd-verifier.md
│   └── ...
├── grd/                       # Core package payload (installed to ~/.claude/grd/)
│   ├── agents/                # Research synthesis subagent definitions (4 files)
│   │   ├── grd-thematic-synthesizer.md
│   │   ├── grd-framework-integrator.md
│   │   ├── grd-gap-analyzer.md
│   │   └── grd-argument-constructor.md
│   ├── bin/
│   │   ├── grd-tools.cjs      # CLI utility entry point
│   │   └── lib/               # CJS module library (25 files)
│   │       ├── core.cjs       # Shared utilities, path helpers, config loader
│   │       ├── state.cjs      # STATE.md read/write operations
│   │       ├── init.cjs       # Compound init commands for workflow bootstrap
│   │       ├── phase.cjs      # Phase CRUD and lifecycle
│   │       ├── roadmap.cjs    # ROADMAP.md parsing and updates
│   │       ├── config.cjs     # config.json CRUD and smart defaults
│   │       ├── commands.cjs   # Standalone utility commands (slug, todos, etc.)
│   │       ├── frontmatter.cjs # YAML frontmatter parsing and mutation
│   │       ├── acquire.cjs    # Source URL acquisition (wget/firecrawl/web_fetch)
│   │       ├── vault.cjs      # Research note + sources dir writing
│   │       ├── verify.cjs     # SUMMARY.md and phase verification
│   │       ├── verify-research.cjs  # Research note verification logic
│   │       ├── verify-sufficiency.cjs # Source sufficiency checks
│   │       ├── milestone.cjs  # Milestone archival operations
│   │       ├── workstream.cjs # Workstream namespace CRUD and migration
│   │       ├── model-profiles.cjs   # Agent→model mapping per cost profile
│   │       ├── profile-pipeline.cjs # Claude session scanning for user profiling
│   │       ├── profile-output.cjs   # Profile document generation
│   │       ├── plan-checker-rules.cjs # Plan quality rule engine
│   │       ├── security.cjs   # Input validation, prompt injection guards
│   │       ├── bootstrap.cjs  # Project initialization scaffolding
│   │       ├── template.cjs   # Template rendering helpers
│   │       ├── tier-strip.cjs # researcher_tier comment stripping
│   │       ├── uat.cjs        # UAT.md operations
│   │       └── ...
│   ├── workflows/             # Workflow prompt scripts (70 .md files)
│   │   ├── new-research.md    # Initialize research project
│   │   ├── new-project.md     # Initialize software project
│   │   ├── plan-inquiry.md    # Create phase plans
│   │   ├── conduct-inquiry.md # Execute phase plans
│   │   ├── scope-inquiry.md   # Capture phase decisions into CONTEXT.md
│   │   ├── verify-inquiry.md  # Verify built features (UAT)
│   │   ├── synthesize.md      # Research synthesis (themes/framework/gaps/argument)
│   │   ├── execute-phase.md   # Wave-based parallel plan execution
│   │   ├── execute-plan.md    # Single plan execution
│   │   ├── plan-phase.md      # Phase planning orchestration
│   │   ├── map-codebase.md    # Parallel codebase mapping orchestration
│   │   ├── autonomous.md      # Auto-chain pipeline
│   │   └── ...
│   ├── templates/             # Document templates (44 files)
│   │   ├── phase-prompt.md    # PLAN.md template
│   │   ├── research-note.md   # Research note template
│   │   ├── context.md         # CONTEXT.md template
│   │   ├── config.json        # Default config.json template
│   │   ├── project.md         # PROJECT.md template
│   │   ├── phase-prompt.md    # PLAN.md format spec
│   │   ├── codebase/          # Codebase document templates (7 files)
│   │   │   ├── architecture.md
│   │   │   ├── structure.md
│   │   │   ├── stack.md
│   │   │   ├── integrations.md
│   │   │   ├── conventions.md
│   │   │   ├── testing.md
│   │   │   └── concerns.md
│   │   └── research-project/  # Research output templates (5 files)
│   │       ├── PRIOR-FINDINGS.md
│   │       ├── THEORETICAL-FRAMEWORK.md
│   │       ├── METHODOLOGICAL-LANDSCAPE.md
│   │       ├── LIMITATIONS-DEBATES.md
│   │       └── SUMMARY.md
│   ├── references/            # Reusable instruction fragments (19 files)
│   │   ├── source-protocol.md
│   │   ├── verification-patterns.md
│   │   ├── checkpoints.md
│   │   ├── model-profiles.md
│   │   ├── git-integration.md
│   │   ├── research-depth.md
│   │   └── ...
│   ├── VERSION                # Semantic version string (e.g. "1.1.0")
│   ├── grd-check-update.js    # Version check utility (run by hooks)
│   ├── grd-context-monitor.js # Context window monitor
│   └── grd-statusline.js      # Status bar display utility
├── hooks/                     # AI assistant hook scripts
│   ├── grd-check-update.js
│   ├── grd-context-monitor.js
│   └── grd-statusline.js
├── scripts/                   # Dev/build utilities
│   ├── build-hooks.js         # Copies hook files to hooks/dist/
│   ├── bulk-rename.cjs        # Bulk namespace rename utility
│   ├── run-tests.cjs          # Test runner
│   └── generate-pm-report.js  # PM report generator
├── test/                      # Test suite (20 .cjs files)
│   ├── smoke.test.cjs         # Smoke tests (CLI commands)
│   ├── e2e.test.cjs           # End-to-end tests
│   ├── state.test.cjs         # State module tests
│   ├── acquire.test.cjs       # Source acquisition tests
│   ├── verify-research.test.cjs
│   ├── vault.test.cjs
│   └── ...
├── docs/                      # Design documents (not committed docs)
│   ├── DESIGN.md
│   ├── GRD-Rename-Spec.md
│   └── GRD-v1.2-Research-Reorientation-Spec.md
├── .planning/                 # This project's own GRD planning state
│   ├── STATE.md
│   ├── ROADMAP.md
│   ├── PROJECT.md
│   ├── config.json
│   ├── phases/
│   ├── milestones/
│   ├── research/
│   └── codebase/
├── package.json               # npm package manifest
├── package-lock.json
└── README.md
```

## Directory Purposes

**`bin/`:**
- Purpose: npm binary entry point
- Contains: `install.js` — the only file users directly invoke via `npx get-research-done`
- Key files: `bin/install.js`

**`commands/grd/`:**
- Purpose: Slash-command definitions deployed to `~/.claude/commands/grd/` (Claude Code) or runtime equivalent
- Contains: Thin `.md` wrappers; each file maps one `/grd:*` command to a workflow via `@` reference in `<execution_context>`
- Key files: `commands/grd/conduct-inquiry.md`, `commands/grd/new-research.md`, `commands/grd/plan-inquiry.md`

**`agents/`:**
- Purpose: Subagent persona definitions deployed to `~/.claude/agents/`
- Contains: YAML frontmatter + role prompts; orchestrators spawn these by name
- Key files: `agents/grd-executor.md`, `agents/grd-planner.md`, `agents/grd-verifier.md`, `agents/grd-plan-checker.md`, `agents/grd-phase-researcher.md`

**`grd/bin/lib/`:**
- Purpose: Modular CJS library powering `grd-tools.cjs`; each file handles one domain
- Contains: Pure Node.js modules (no framework); all export named functions consumed by `grd-tools.cjs` command router
- Key files: `core.cjs`, `state.cjs`, `init.cjs`, `phase.cjs`, `config.cjs`, `acquire.cjs`, `vault.cjs`

**`grd/workflows/`:**
- Purpose: AI workflow prompt scripts; each is a prose+XML instruction document the AI assistant follows step by step
- Contains: `<purpose>`, `<process>`, `<step>` blocks with embedded bash calling `grd-tools.cjs`; no executable code
- Key files: `new-research.md`, `conduct-inquiry.md`, `plan-inquiry.md`, `synthesize.md`, `scope-inquiry.md`

**`grd/templates/`:**
- Purpose: Canonical document format definitions for all planning artifacts
- Contains: Markdown templates with frontmatter schemas and section guides
- Key files: `phase-prompt.md` (PLAN.md format), `research-note.md`, `context.md`, `project.md`

**`grd/references/`:**
- Purpose: Reusable instruction fragments; included in workflow/agent prompts via `@` file references
- Contains: Short, single-topic `.md` files on cross-cutting patterns
- Key files: `source-protocol.md`, `verification-patterns.md`, `model-profiles.md`, `checkpoints.md`

**`test/`:**
- Purpose: Test suite for `grd-tools.cjs` library modules
- Contains: `.cjs` test files using Node's built-in `assert`; no test framework binary
- Key files: `smoke.test.cjs`, `e2e.test.cjs`, `state.test.cjs`, `acquire.test.cjs`

**`hooks/`:**
- Purpose: Hook scripts invoked by AI assistant at session events (context warnings, update checks)
- Contains: Standalone JS files; built from source by `scripts/build-hooks.js` into `hooks/dist/`
- Key files: `hooks/grd-context-monitor.js`, `hooks/grd-check-update.js`, `hooks/grd-statusline.js`

## Key File Locations

**Entry Points:**
- `bin/install.js`: npm binary; runs interactively on `npx get-research-done`
- `grd/bin/grd-tools.cjs`: CLI utility called by all workflows

**Configuration:**
- `package.json`: npm package metadata, `files` array controls what gets published
- `grd/templates/config.json`: Default `.planning/config.json` written on project init
- `.planning/config.json`: Per-project config at runtime (not in this repo, in user's project)

**Core Logic:**
- `grd/bin/lib/core.cjs`: Path helpers, config loader, project root detection
- `grd/bin/lib/init.cjs`: Compound init commands (one call loads all context a workflow needs)
- `grd/bin/lib/state.cjs`: STATE.md read/write (current phase, status, milestone)
- `grd/bin/lib/acquire.cjs`: Source acquisition for research notes
- `grd/bin/lib/vault.cjs`: Research note + sources directory writing

**Agents:**
- `agents/*.md`: Top-level agent definitions (deployed to AI runtime)
- `grd/agents/*.md`: Synthesis-specific agents (same format, grouped separately)

**Testing:**
- `test/`: All test files co-located in root `test/`
- `scripts/run-tests.cjs`: Test runner (no test framework binary; uses Node `assert`)

## Naming Conventions

**Files:**
- Workflow files: `kebab-case.md` matching the `/grd:command-name` they implement (e.g., `conduct-inquiry.md` → `/grd:conduct-inquiry`)
- Library modules: `kebab-case.cjs` named after the domain (e.g., `state.cjs`, `acquire.cjs`)
- Agent files: `grd-<role>.md` prefixed with `grd-` (e.g., `grd-executor.md`, `grd-planner.md`)
- Test files: `<subject>.test.cjs`
- Planning artifacts: `UPPERCASE.md` (STATE.md, ROADMAP.md, REQUIREMENTS.md, PLAN.md, SUMMARY.md)

**Directories:**
- Phase directories: `<padded-number>-<slug>/` (e.g., `01-fork-and-foundation/`)
- Milestone archives: `v<X.Y>-phases/` inside `.planning/milestones/`
- Source directories: `<note-name>-sources/` sibling to research note files

**Identifiers:**
- Agent type names: `grd-<role>` used in both frontmatter `name:` and `Task(subagent_type=...)` calls
- Config keys: `snake_case` for top-level, `dot.notation` for nested (e.g., `workflow.synthesis`, `git.branching_strategy`)
- Requirement IDs: `REQ-XX` format, referenced in PLAN.md frontmatter `requirements:` array

## Where to Add New Code

**New slash command:**
- Command wrapper: `commands/grd/<command-name>.md` (frontmatter + `@workflow` reference)
- Workflow logic: `grd/workflows/<command-name>.md`
- Register in: `bin/install.js` if it needs a new agent or hook

**New subagent type:**
- Agent definition: `agents/grd-<role>.md` (YAML frontmatter + role prompt)
- Add to model profiles: `grd/bin/lib/model-profiles.cjs` `MODEL_PROFILES` object
- Register sandbox in: `bin/install.js` `CODEX_AGENT_SANDBOX` map
- Add Copilot tool mapping if needed: `bin/install.js` `claudeToCopilotTools`

**New `grd-tools.cjs` command:**
- Implementation module: `grd/bin/lib/<domain>.cjs`
- Wire to router: `grd/bin/grd-tools.cjs` switch/dispatch block
- Add test: `test/<domain>.test.cjs`
- Document in: top-of-file JSDoc comment in `grd-tools.cjs`

**New config key:**
- Add to: `grd/bin/lib/config.cjs` `VALID_CONFIG_KEYS` set
- Add default if needed: `configWithDefaults()` function in `config.cjs`
- Document in: `grd/references/planning-config.md`

**New planning artifact template:**
- Template file: `grd/templates/<name>.md`
- Reference from: workflow or agent `<required_reading>` blocks via `@` path

**New reference fragment:**
- File: `grd/references/<topic>.md`
- Include via: `@/Users/.../.claude/grd/references/<topic>.md` in workflow/agent `<required_reading>`

## Special Directories

**`.planning/` (in user's project, not this repo):**
- Purpose: All per-project planning state for a GRD-initialized project
- Generated: Yes, by `/grd:new-research` or `/grd:new-project`
- Committed: Yes (planning docs are committed alongside code)

**`grd/bin/lib/`:**
- Purpose: CJS module library for `grd-tools.cjs`
- Generated: No (hand-authored source)
- Committed: Yes

**`hooks/dist/` (if present):**
- Purpose: Built hook files ready for deployment
- Generated: Yes, by `npm run build:hooks` (`scripts/build-hooks.js`)
- Committed: Yes (included in `files` array in `package.json`)

**`node_modules/`:**
- Purpose: npm dependencies (`docx`, `c8`, `esbuild`)
- Generated: Yes
- Committed: No

**`.claude/worktrees/`:**
- Purpose: Parallel agent worktrees used during concurrent phase execution
- Generated: Yes, by Claude Code agent spawning
- Committed: No

---

*Structure analysis: 2026-03-23*
