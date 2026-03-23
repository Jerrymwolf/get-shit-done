# External Integrations

**Analysis Date:** 2026-03-23

## APIs & External Services

**AI Model Providers (via agent host runtimes — not direct API calls):**
- Anthropic Claude (opus, sonnet, haiku) — models referenced in `grd/bin/lib/model-profiles.cjs`; model selection resolved via profile system, not direct API
- Model profiles: `quality` (opus-heavy), `balanced` (sonnet-heavy), `budget` (haiku-heavy)
- The tool does not make direct HTTP calls to Anthropic; it runs inside Claude Code or other AI runtimes

**npm Registry:**
- `npm view get-shit-done-cc version` — queried at session start to check for updates
- Called via `execSync` inside a detached child process in `hooks/grd-check-update.js`
- Result cached to `~/{config-dir}/cache/gsd-update-check.json`

**Optional Search Integrations (agent-level, not library-level):**
- Brave Search — referenced in agent prompts (`agents/grd-phase-researcher.md`, `agents/grd-project-researcher.md`) when `brave_search: true` in config; invoked by the AI agent, not by library code
- Firecrawl — used by `grd/bin/lib/acquire.cjs` as first-choice web scraping method; invoked via `toolRunner('firecrawl', ['scrape', url, '--format', 'markdown'])` — requires Firecrawl to be available as a CLI tool in the agent's environment
- Exa Search — referenced as a config key (`exa_search`) in `grd/bin/lib/config.cjs`; not yet wired into agent prompts (config key defined, integration pending)

## Data Storage

**Databases:**
- None — no database dependency of any kind

**File Storage:**
- Local filesystem only
- Planning state: `.planning/` directory in project root
- Research vault: configurable path via `vault_path` in `.planning/config.json` (default shown as `grd/bin/lib/vault.cjs`); vault structure managed by `grd/bin/lib/vault.cjs`
- Research notes written to `{vault_path}/{topic}/note.md` with sibling `{topic}/note-sources/` directory
- Session context bridge: `/tmp/claude-ctx-{session_id}.json` (ephemeral, written by statusline hook)
- Update check cache: `~/{config-dir}/cache/gsd-update-check.json`

**Caching:**
- Local file cache only (update check result)
- No in-memory cache layer; all state is read from filesystem on each invocation

## Authentication & Identity

**Auth Provider:**
- None — no user authentication system
- The tool is a local CLI/agent tool; identity is the OS user
- AI runtime credentials (API keys) are managed entirely by the host AI coding assistant (Claude Code, OpenCode, etc.), not by this tool

## Monitoring & Observability

**Error Tracking:**
- None — no error tracking service (Sentry, Rollbar, etc.)

**Logs:**
- All output is to stdout/stderr via `process.stdout.write` and `console.error`
- Hooks fail silently (`process.exit(0)`) to never block tool execution
- Context metrics written to `/tmp/claude-ctx-{session_id}.json` for intra-session monitoring

## CI/CD & Deployment

**Hosting:**
- npm registry (`get-research-done` package, forked from `get-shit-done-cc`)
- No server hosting; purely a local install tool

**CI Pipeline:**
- None detected (no `.github/workflows/`, no CI config files)
- Tests run locally via `npm test`

## External Tool Dependencies (Runtime)

These are not npm dependencies but external CLI tools the library invokes via `child_process`:

**git:**
- Used extensively in `grd/bin/lib/core.cjs` via `execSync`/`execFileSync`
- Required for phase commit, branch management, worktree detection
- No auth — relies on user's existing git configuration

**GitHub CLI (`gh`):**
- Used in `grd/bin/lib/acquire.cjs` (`gh issue view`) for fetching GitHub issue content as sources
- Optional — falls back to `web_fetch` if `gh-cli` method fails
- Requires user to be authenticated with `gh auth login`

**wget / curl:**
- Used in `grd/bin/lib/acquire.cjs` for downloading PDFs and web pages
- Optional — fallback methods after firecrawl/web_fetch
- Standard system tools, no auth required

**Firecrawl CLI:**
- Used in `grd/bin/lib/acquire.cjs` as primary web scraping method
- Invoked as `firecrawl scrape <url> --format markdown`
- Optional — falls back to `web_fetch` if unavailable

## MCP (Model Context Protocol) Integrations

**Context7:**
- Referenced in agent prompts: `mcp__context7__resolve-library-id` and `mcp__context7__query-docs`
- Used by `grd-phase-researcher`, `grd-project-researcher`, `grd-planner` agents for library documentation lookup
- Requires Context7 MCP server to be configured in the user's AI runtime
- Not a direct npm dependency — invoked as an MCP tool by the AI agent

## Webhooks & Callbacks

**Incoming:**
- None — no web server, no webhook endpoints

**Outgoing:**
- None — no outbound webhooks

## Environment Configuration

**Required env vars:**
- None strictly required for basic operation

**Optional env vars:**
- `CLAUDE_CONFIG_DIR` — override Claude config directory location
- `OPENCODE_CONFIG_DIR` / `OPENCODE_CONFIG` — override OpenCode config directory
- `XDG_CONFIG_HOME` — standard XDG base dir for OpenCode config resolution
- `COPILOT_CONFIG_DIR` — override Copilot config directory
- `ANTIGRAVITY_CONFIG_DIR` — override Antigravity config directory
- `GEMINI_API_KEY` — detected by `hooks/grd-context-monitor.js` to identify Gemini runtime (uses `AfterTool` instead of `PostToolUse` hook event name)

**Secrets location:**
- No secrets stored by this tool
- AI runtime API keys are managed by the host AI coding assistant configuration (outside this project)

---

*Integration audit: 2026-03-23*
