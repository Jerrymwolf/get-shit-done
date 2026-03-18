# Phase 1: Fork and Foundation - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Clone get-shit-done-cc from https://github.com/gsd-build/get-shit-done, restructure as GRD with all templates, references, and project scaffolding. Rename all /gsd:* commands to /grd:*. Configure Git LFS for binaries. Set up npm package structure for eventual publication. Create research note template, SOURCE-LOG.md template, and BOOTSTRAP.md template. Add vault_path to config.json. Establish filesystem vault write as default.

</domain>

<decisions>
## Implementation Decisions

### Fork Strategy
- Clone from https://github.com/gsd-build/get-shit-done (not copy from global install)
- Maintain GSD's five-layer structure: commands/, agents/, workflows/, templates/, references/
- Preserve upstream's zero-dependency CJS architecture
- Rename tooling entry point from gsd-tools.cjs to grd-tools.cjs (or equivalent)
- Scoped npm package name for eventual publication (e.g., @grd/cli or grd)

### Command Namespace
- All /gsd:* commands become /grd:* commands
- Commands live at project root following GSD's installable structure (not ~/.claude/)
- bin/install.js copies files to ~/.claude/ on npx install (same pattern as upstream)

### Templates to Create
- Research note template: YAML frontmatter (project, domain, status, date, sources) + Key Findings + Analysis + Implications for [Project] + Open Questions + References
- SOURCE-LOG.md template: table format (Source, URL, Method, File, Status, Notes)
- BOOTSTRAP.md template: three tiers (Established / Partially Established / Not Yet Researched)
- Research task XML template: <task type="research"> with <src method="" format=""> blocks

### Git LFS Configuration
- Track *.pdf, *.png, *.jpg, *.jpeg, *.gif, *.svg in .gitattributes
- Configure before any binary files are committed
- This is scaffolding — actual binary acquisition happens in Phase 3

### Config Extensions
- Add vault_path to config.json schema (string, required for research projects)
- Add commit_research: true as default
- Preserve all existing GSD config fields (mode, granularity, parallelization, etc.)

### Filesystem Vault Write
- Default write method is direct filesystem (no Obsidian MCP dependency)
- vault_path is an absolute path to the research output directory
- Writing a note creates both the .md file and its -sources/ sibling folder
- Phase 1 creates the basic write capability; Phase 2 makes it atomic with git commit

### Claude's Discretion
- Exact scoped package name choice
- Whether to rename internal file references immediately or incrementally
- .gitignore contents beyond standard Node.js defaults
- README.md content for the forked repo

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Upstream GSD repo at https://github.com/gsd-build/get-shit-done provides the complete base
- GSD v1.22.4 installed globally at ~/.claude/ shows the runtime structure
- gsd-tools.cjs (193KB across 12 files) handles init, commit, state, config operations

### Established Patterns
- Commands are thin 1-2KB markdown shims that reference workflows
- Workflows are 5-35KB imperative orchestration files
- Agents are 5-43KB behavioral prompts with fresh 200K contexts
- Templates define output formats; References provide domain knowledge
- All state in .planning/ directory — survives /clear

### Integration Points
- bin/install.js is the npm entry point that copies files to ~/.claude/
- package.json bin field maps the npx command
- Commands reference workflows via @-references in execution_context

</code_context>

<specifics>
## Specific Ideas

- GRD-Fork-Plan.md in project root is the authoritative spec — consult it for detailed file structure, naming conventions, and translation table
- The fork plan's "Implementation: What to Actually Fork" section (line 475+) lists exactly which files need modification vs carry-over
- Preserve GSD's questioning.md, ui-brand.md, and other domain-agnostic references as-is
- Research-specific references to add: source-protocol.md, note-format.md, research-verification.md

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-fork-and-foundation*
*Context gathered: 2026-03-11*
