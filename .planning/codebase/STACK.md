# Technology Stack

**Analysis Date:** 2026-03-23

## Languages

**Primary:**
- JavaScript (CommonJS) - All library code in `grd/bin/lib/*.cjs`, hooks, scripts, tests
- JavaScript (ESM/Node shebang scripts) - `bin/install.js`, `scripts/build-hooks.js`, `scripts/generate-pm-report.js`
- Markdown - Command definitions (`commands/grd/*.md`), agent prompts (`agents/*.md`), templates (`grd/templates/`)

**Secondary:**
- None detected (no TypeScript, Python, Rust, or Go)

## Runtime

**Environment:**
- Node.js >=18.0.0 (required per `package.json` engines field)
- Tested on Node.js v22.20.0

**Package Manager:**
- npm 10.9.3
- Lockfile: `package-lock.json` present and committed

## Frameworks

**Core:**
- None — pure Node.js stdlib only for all production code

**Testing:**
- Node.js built-in test runner (`node --test`) — no external test framework installed
- Tests in `test/*.test.cjs` run via `scripts/run-tests.cjs`

**Build/Dev:**
- `esbuild` ^0.24.0 (devDependency) — listed but currently unused; hooks are plain-copied via `scripts/build-hooks.js`, not bundled
- `c8` ^11.0.0 (devDependency) — coverage collection via `NODE_V8_COVERAGE` env var

## Key Dependencies

**Critical:**
- `docx` ^9.6.1 — used exclusively in `scripts/generate-pm-report.js` for generating `.docx` report files; not used in any production library code

**Infrastructure:**
- All other functionality uses Node.js stdlib only: `fs`, `path`, `os`, `child_process`, `crypto`, `readline`

## Configuration

**Environment:**
- No `.env` file present; no dotenv dependency
- Runtime detection uses env vars: `CLAUDE_CONFIG_DIR`, `OPENCODE_CONFIG_DIR`, `OPENCODE_CONFIG`, `XDG_CONFIG_HOME`, `GEMINI_API_KEY`, `COPILOT_CONFIG_DIR`, `ANTIGRAVITY_CONFIG_DIR`
- Project-level config lives in `.planning/config.json` (JSON, not env vars)

**Project Config Keys (`config.json`):**
- `mode`, `granularity`, `parallelization`, `commit_docs`, `model_profile`
- `vault_path` — absolute path to research vault (GRD-specific)
- `commit_research` — whether to auto-commit research notes
- `researcher_tier`, `review_type`, `epistemological_stance` — v1.2 research config
- `workflow.*` — feature flags for workflow steps
- `brave_search`, `firecrawl`, `exa_search` — optional search integration toggles
- `git.*` — branching strategy config

**Build:**
- `scripts/build-hooks.js` — copies hook files from `hooks/` to `hooks/dist/` for npm packaging
- `prepublishOnly` npm script runs build before publish
- `hooks/dist/` is committed to npm but excluded from git (per `.gitignore`)

## Platform Requirements

**Development:**
- Node.js >=18.0.0
- npm (any recent version)
- git (used by library code via `execSync` for git operations)
- Optional: `gh` CLI (GitHub CLI) — used by `acquire.cjs` for GitHub issue fetching
- Optional: `wget` or `curl` — used by `acquire.cjs` for PDF/web source acquisition

**Production:**
- Distributed via npm as `get-research-done` (package name) or `get-shit-done-cc` (upstream)
- Installed globally or locally into AI coding assistant config directories
- Supported AI runtimes: Claude Code (`~/.claude`), OpenCode (`~/.config/opencode`), Gemini CLI (`~/.gemini`), Codex (`~/.codex`), GitHub Copilot (`~/.copilot`/`.github`), Antigravity (`~/.gemini/antigravity`)
- Tool is invoked by AI agents as a CLI tool (`grd-tools`) or as slash commands

---

*Stack analysis: 2026-03-23*
