# Codebase Concerns

**Analysis Date:** 2026-03-23

## Tech Debt

**GSD Namespace Residue in Commands Directory:**
- Issue: 26 of 36 command files in `commands/grd/` still declare `name: gsd:` in their YAML frontmatter. Only 10 files use the correct `name: grd:` namespace.
- Files: All files in `commands/grd/` except `settings.md`, `synthesize.md`, `complete-study.md`, `progress.md`, `plan-inquiry.md`, `help.md`, `conduct-inquiry.md`, `new-research.md`, `verify-inquiry.md`, `scope-inquiry.md`
- Impact: Commands registered under `gsd:` namespace instead of `grd:` namespace. Users invoking `/grd:health`, `/grd:debug`, etc. may not find the correct command registration.
- Fix approach: Bulk find-replace `name: gsd:` → `name: grd:` in all `commands/grd/*.md` frontmatter blocks.

**GSD HTML Markers in profile-output.cjs:**
- Issue: `grd/bin/lib/profile-output.cjs` uses `<!-- GSD:profile-start -->`, `<!-- GSD:profile-end -->`, `<!-- GSD:{section}-start -->`, `<!-- GSD:{section}-end -->` as delimiters written into user files. These markers were not renamed during Phase 27 rename.
- Files: `grd/bin/lib/profile-output.cjs` lines 194, 199, 222-223, 234, 236, 241-242, 757, 768, 786-787, 882, 904, 913-914
- Impact: Marker strings written to user CLAUDE.md/project files contain `GSD:` prefix, creating user-facing branding inconsistency and potential parsing issues if any future tool parses by marker name.
- Fix approach: Rename all `GSD:` HTML comment markers to `GRD:` and update detection/parsing logic to match.

**GSD_WORKSTREAM Environment Variable Not Renamed:**
- Issue: `grd/bin/grd-tools.cjs` reads and writes `process.env.GSD_WORKSTREAM` (lines 256, 257, 267). `grd/bin/lib/core.cjs` also reads `process.env.GSD_WORKSTREAM` (line 567). The env var was not renamed to `GRD_WORKSTREAM`.
- Files: `grd/bin/grd-tools.cjs`, `grd/bin/lib/core.cjs`
- Impact: Users setting `GRD_WORKSTREAM` to activate a workstream will see no effect. They must use the old `GSD_WORKSTREAM` name, which contradicts the renamed tool identity.
- Fix approach: Rename env var reads/writes to `GRD_WORKSTREAM` and update documentation.

**Global Config Reads from `~/.gsd/` Paths:**
- Issue: `grd/bin/lib/config.cjs` reads API key files and global defaults from `~/.gsd/` paths (lines 146-154): `~/.gsd/brave_api_key`, `~/.gsd/firecrawl_api_key`, `~/.gsd/exa_api_key`, `~/.gsd/defaults.json`. `grd/bin/lib/init.cjs` mirrors this (lines 266-274).
- Files: `grd/bin/lib/config.cjs`, `grd/bin/lib/init.cjs`
- Impact: GRD users who configure global defaults must place files in the old `~/.gsd/` directory. Creating `~/.grd/` equivalents has no effect.
- Fix approach: Read from `~/.grd/` with `~/.gsd/` as fallback for backward compatibility, then migrate fully to `~/.grd/`.

**Default Git Branch Templates Use `gsd/` Prefix:**
- Issue: Default `phase_branch_template` is `'gsd/phase-{phase}-{slug}'` and `milestone_branch_template` is `'gsd/{milestone}-{slug}'` in `grd/bin/lib/config.cjs` (lines 183-184), `grd/bin/lib/core.cjs` (lines 195-196), and `grd/bin/lib/verify.cjs` (lines 755-756).
- Files: `grd/bin/lib/config.cjs`, `grd/bin/lib/core.cjs`, `grd/bin/lib/verify.cjs`
- Impact: When users create phase/milestone branches with the default template, git branches are named `gsd/phase-01-foo` instead of `grd/phase-01-foo`. Wrong branding emitted into user's git history.
- Fix approach: Change default templates to `grd/phase-{phase}-{slug}` and `grd/{milestone}-{slug}` in all three files.

**reapply-patches.md Patch Directory Paths Not Renamed:**
- Issue: `commands/grd/reapply-patches.md` checks for `gsd-local-patches` directories (lines 18-31) and describes itself as applying patches after "a GSD update" (line 2, 7, 45).
- Files: `commands/grd/reapply-patches.md`
- Impact: Users following the patch backup workflow will store patches in `gsd-local-patches/` directories but the command description no longer matches the GRD identity.
- Fix approach: Rename `gsd-local-patches` → `grd-local-patches` throughout and update description text.

**Autonomous Workflow References Old `gsd:scope-inquiry` Skill:**
- Issue: `grd/workflows/autonomous.md` line 263 references `` `gsd:scope-inquiry` `` in a user-visible note about the smart discuss feature.
- Files: `grd/workflows/autonomous.md`
- Impact: User-facing documentation refers to non-existent `gsd:scope-inquiry` command. Should reference `grd:scope-inquiry`.
- Fix approach: Replace `gsd:scope-inquiry` with `grd:scope-inquiry` at line 263.

---

## Known Bugs

**temporal_positioning Config Property Always True (CFG-07):**
- Symptoms: Era coverage checks in `cmdInitVerifyWork` never respect a user's disabled `temporal_positioning` setting. The check always runs as if temporal positioning is enabled.
- Files: `grd/bin/lib/init.cjs` line 506
- Trigger: Set `temporal_positioning: false` in `.planning/config.json`; run `grd-tools init verify-inquiry`. The returned `temporal_positioning` value is always `true`.
- Root cause: `init.cjs:506` evaluates `config.temporal_positioning !== false && config.temporal_positioning !== 'optional'`. `loadConfig()` returns `temporal_positioning` as a top-level key, so this is correct. However, `verifySufficiency()` in `grd/bin/lib/verify-sufficiency.cjs` receives the config as `{ workflow: { temporal_positioning: value } }` (line 581 of `grd-tools.cjs`). Inside `verifySufficiency`, line 319 reads `config.workflow.temporal_positioning === false`, which will work correctly when called via CLI. The `init.cjs` path at line 506 reads the correct flattened config. Workaround: None — bug confirmed per v1.2 milestone audit.

**Init Subcommand Name Mismatch — 8 Workflow Files Broken:**
- Symptoms: Running `/grd:execute-phase`, `/grd:plan-inquiry` (old name), `/grd:verify-inquiry`, `/grd:synthesize`, `/grd:complete-study` all fail at Step 1 with "Unknown init workflow" error.
- Files:
  - `grd/workflows/execute-phase.md` line 64: calls `init execute-phase` (should be `init conduct-inquiry`)
  - `grd/workflows/execute-plan.md` line 18: calls `init execute-phase` (should be `init conduct-inquiry`)
  - `grd/workflows/complete-milestone.md` line 533: calls `init execute-phase` (should be `init conduct-inquiry`)
  - `grd/workflows/plan-phase.md` line 25: calls `init plan-phase` (should be `init plan-inquiry`)
  - `grd/workflows/new-project.md` line 53: calls `init new-project` (should be `init new-research`)
  - `grd/workflows/verify-work.md` line 27: calls `init verify-work` (should be `init verify-inquiry`)
  - `grd/workflows/manager.md` lines 225, 260: calls both `init plan-phase` and `init execute-phase`
- Trigger: Invoke any of these workflows. CLI switch at `grd-tools.cjs:855` hits `default` error case.
- Root cause: Phase 17 renamed CLI cases in `grd-tools.cjs` but did not update workflow callers atomically. Confirmed in v1.2 milestone audit as CRITICAL.
- Fix approach: Replace old names with new names in all 8 workflow files.

---

## Security Considerations

**Security Module Not Applied to All User Input Entry Points:**
- Risk: `grd/bin/lib/security.cjs` provides `validatePath`, `sanitizeForPrompt`, `validateFieldName`, `safeJsonParse` but only `state.cjs`, `commands.cjs`, and one spot in `grd-tools.cjs` import and use it. The large `grd-tools.cjs` CLI router handles many user-supplied file paths and strings without consistent validation.
- Files: `grd/bin/grd-tools.cjs`, `grd/bin/lib/security.cjs`
- Current mitigation: Path traversal prevented in `state.cjs` writes; prompt injection sanitized in `commands.cjs` search paths.
- Recommendations: Audit all `args[N]` usages in `grd-tools.cjs` where values become file paths. Apply `validatePath()` before any `fs.readFileSync`/`fs.writeFileSync` on user-supplied paths.

**Hardcoded Absolute Paths Not Rewritten by Installer:**
- Risk: Workflow files in `grd/workflows/` embed absolute paths like `"/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs"` (confirmed in 58 workflow files, 13 agent files, 36 command files). The installer (`bin/install.js`) only replaces `~/.claude/` and `$HOME/.claude/` patterns via regex — quoted absolute paths with `/Users/jeremiahwolf/` are never matched and never replaced.
- Files: `grd/workflows/*.md` (58 files), `agents/*.md` (13 files), `commands/grd/*.md` (36 files), `bin/install.js`
- Current mitigation: None — absolute paths remain verbatim after install for any user other than the author.
- Impact: Any user who installs this package will have workflows that call `node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs"` — a path that does not exist on their machine. All bash steps in all workflows will fail for other users.
- Recommendations: Change source files to use `$HOME/.claude/grd/bin/grd-tools.cjs` or `~/.claude/grd/bin/grd-tools.cjs` format so the installer's existing regex replacements handle them. Alternatively, add an absolute-path regex to the installer that detects `/Users/[^/]+/.claude/` and replaces it with the computed `pathPrefix`.

---

## Performance Bottlenecks

**Large Monolithic CLI Router:**
- Problem: `grd/bin/grd-tools.cjs` is a single 900+ line file containing all CLI routing logic with many inline requires inside case branches.
- Files: `grd/bin/grd-tools.cjs`
- Cause: Modules like `verify-sufficiency.cjs` are lazy-required at runtime inside case branches rather than top-level. This is intentional for startup speed but creates deep indirection for debugging.
- Improvement path: Low priority — lazy loading is a reasonable optimization. Not a current bottleneck for single-command invocations.

**State and Core Modules Are Large:**
- Problem: `grd/bin/lib/state.cjs` (1209 lines) and `grd/bin/lib/core.cjs` (1192 lines) contain many unrelated responsibilities.
- Files: `grd/bin/lib/state.cjs`, `grd/bin/lib/core.cjs`
- Cause: Accumulated functionality without extraction to focused modules.
- Improvement path: Extract waiting-state logic from `state.cjs` (lines 880-960) into a dedicated `waiting.cjs` module; extract slug/path utilities from `core.cjs` into `utils.cjs`.

---

## Fragile Areas

**Workflow-to-CLI Contract (Init Subcommands):**
- Files: All files in `grd/workflows/` that call `grd-tools.cjs init <subcommand>`, `grd/bin/grd-tools.cjs` (switch at line 801)
- Why fragile: Workflow markdown files reference CLI subcommand names by string. There is no type-checking or compile-time validation. Renaming a CLI case requires finding all callers in markdown files manually.
- Safe modification: When adding or renaming an `init` subcommand in `grd-tools.cjs`, immediately grep all workflow and command files for the old name. The v1.2 audit shows this was missed for 8 files.
- Test coverage: `test/smoke.test.cjs` tests `init plan-inquiry` but does not test all init subcommands. The broken subcommands (`execute-phase`, `plan-phase`, `verify-work`, `new-project`) have no failing tests because the workflow files are not tested by the test suite.

**verify-sufficiency.cjs Has No Runtime Callers via Named Workflow:**
- Files: `grd/bin/lib/verify-sufficiency.cjs`, `grd/workflows/verify-inquiry.md`
- Why fragile: The module is fully implemented (364 lines) and wired to the CLI via `grd-tools.cjs verify sufficiency`, but `verify-inquiry.md` instructs the agent to call it without specifying the CLI command path. Agent must infer or guess the invocation.
- Safe modification: Add explicit bash block to `verify-inquiry.md` showing exact CLI invocation: `node "..." verify sufficiency`.
- Test coverage: 20 unit tests in `test/verify-sufficiency.test.cjs` — module is well-tested but workflow integration is untested.

**checkEpistemologicalConsistency Auto-Pass Stub:**
- Files: `grd/bin/lib/verify-sufficiency.cjs` lines 288-305
- Why fragile: `checkEpistemologicalConsistency()` always returns `{ consistent: true }` for non-pragmatist stances with a comment "actual qualitative assessment done by agent." This means epistemological consistency is never checked programmatically for non-pragmatist research designs. If a future phase adds real logic here, tests will need significant updates.
- Safe modification: Treat this function as intentionally hollow for non-pragmatist stances. Do not add logic that depends on it returning `false` without adding test coverage.
- Test coverage: `test/verify-sufficiency.test.cjs` tests the function but does not assert on non-pragmatist behavior.

**tier-strip.cjs Has Zero Runtime Consumers:**
- Files: `grd/bin/lib/tier-strip.cjs`, `test/tier-strip.test.cjs`
- Why fragile: Module is implemented and tested but never called at runtime. Tier-conditional content in workflows is processed by the LLM reading XML/comment blocks directly, not by CJS code. If a future phase integrates `tier-strip.cjs` programmatically, the integration point will need to be discovered from scratch.
- Safe modification: If tier stripping is needed at runtime, import from this module rather than reimplementing. The API is `stripTier(content, tier)`.

**profile-output.cjs — GSD HTML Markers Embedded in User Files:**
- Files: `grd/bin/lib/profile-output.cjs`
- Why fragile: The `<!-- GSD:profile-start -->` and `<!-- GSD:{section}-start -->` markers are written into user's CLAUDE.md/project files. If these markers are renamed in the source, existing user files will have the old markers and the detection/update logic will stop working correctly — it will append new sections instead of updating existing ones.
- Safe modification: If renaming markers, also provide a migration pass that detects old-style `GSD:` markers and renames them before writing new content.

---

## Scaling Limits

**Workflow Files Embed Machine-Specific Absolute Paths:**
- Current capacity: Works for single-user development on the author's machine.
- Limit: Breaks for any other user because `"/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs"` does not exist on other machines.
- Scaling path: Change source files to use `$HOME/.claude/grd/bin/grd-tools.cjs` so the installer's existing replacement handles them.

---

## Dependencies at Risk

**Upstream `get-shit-done-cc` Dependency:**
- Risk: This project is a fork of `get-shit-done-cc`. It has been synced through upstream v1.28.0 (Phase 25). Future upstream changes to `grd-tools.cjs`, templates, or workflow conventions require periodic sync phases. The v1.2 audit notes that 5 of 8 phases lacked Nyquist compliance auditing.
- Impact: Divergence accumulates with each upstream release. Sync complexity grows over time.
- Migration plan: Establish a scheduled sync cadence (e.g. each upstream minor release). Use Phase 25 patterns as the template for future sync phases.

**`docx` Package as Only Runtime Dependency:**
- Risk: `docx@^9.6.1` is listed as the sole runtime dependency (`package.json`). If the DOCX export feature is unused or rarely used, this is dead weight for installation size. If `docx` has a breaking change or security issue, it blocks publishing.
- Impact: No immediate impact but adds install overhead for users who never use DOCX export.
- Migration plan: Move `docx` to optional or peer dependency; gate import with a runtime check.

---

## Missing Critical Features

**No Failing Tests for Known-Broken Init Subcommands:**
- Problem: `test/smoke.test.cjs` tests `init plan-inquiry` but does not test `init execute-phase`, `init plan-phase`, `init verify-work`, or `init new-project` — the four names that break at runtime.
- Blocks: These bugs went undetected through Phase 17 verification because per-module unit tests passed even though workflow callers were not updated.
- Priority: High — add negative test cases asserting these old names return an error, and positive test cases asserting the new names work.

**No Integration Tests for Workflow-to-CLI Contract:**
- Problem: The test suite has unit tests for CJS modules and a smoke test for the CLI, but no integration test that executes a workflow file's bash init block and checks it succeeds.
- Blocks: Any future rename of init subcommand names will silently break without failing tests.
- Priority: Medium — add a test that parses each workflow's init bash block and validates the subcommand name against the CLI's known-good list.

---

## Test Coverage Gaps

**profile-output.cjs — No Dedicated Test File:**
- What's not tested: Section marker detection, user file update logic, idempotency of multiple `set-profile` runs.
- Files: `grd/bin/lib/profile-output.cjs` (952 lines)
- Risk: Profile injection into user's CLAUDE.md could duplicate sections or corrupt content if marker logic is wrong.
- Priority: High — this is user-facing and writes to user config files.

**workstream.cjs — No Dedicated Test File:**
- What's not tested: Workstream creation, switching, path resolution in flat vs. workstream mode.
- Files: `grd/bin/lib/workstream.cjs` (491 lines)
- Risk: Workstream path resolution errors could cause reads/writes to wrong directories silently.
- Priority: Medium.

**roadmap.cjs and milestone.cjs — No Dedicated Test Files:**
- What's not tested: Roadmap analysis, phase ordering, milestone archiving.
- Files: `grd/bin/lib/roadmap.cjs` (329 lines), `grd/bin/lib/milestone.cjs` (252 lines)
- Risk: Phase ordering bugs could cause incorrect phase sequencing in `autonomous.md`.
- Priority: Medium.

**Workflow Bash Block Correctness — Not Tested:**
- What's not tested: The bash `INIT=$(node ... init <subcommand>)` blocks in workflow files are parsed and executed at agent runtime, but never validated by the test suite.
- Files: All `grd/workflows/*.md` files
- Risk: Subcommand name regressions (like the current 8 broken workflows) go undetected until a user hits them.
- Priority: High — this is what caused the v1.2 milestone's 6 broken flows.

---

*Concerns audit: 2026-03-23*
