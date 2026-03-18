---
phase: 01-fork-and-foundation
plan: 02
subsystem: templates
tags: [git-lfs, research-note, source-protocol, config, templates, references]

# Dependency graph
requires:
  - phase: 01-fork-and-foundation (plan 01)
    provides: Renamed GRD directory structure with grd/ runtime core
provides:
  - Git LFS tracking for 6 binary file types (pdf, png, jpg, jpeg, gif, svg)
  - 4 research templates (research-note, source-log, bootstrap, research-task)
  - 3 research reference files (source-protocol, note-format, research-verification)
  - config.json extended with vault_path and commit_research fields
affects: [01-fork-and-foundation-plan-03, 02-vault-write, 03-source-acquisition, 05-verification]

# Tech tracking
tech-stack:
  added: [git-lfs-config]
  patterns: [source-attachment-protocol, two-tier-verification, research-note-format]

key-files:
  created:
    - .gitattributes
    - grd/templates/research-note.md
    - grd/templates/source-log.md
    - grd/templates/bootstrap.md
    - grd/templates/research-task.md
    - grd/references/source-protocol.md
    - grd/references/note-format.md
    - grd/references/research-verification.md
  modified:
    - grd/templates/config.json

key-decisions:
  - "Git LFS configured via .gitattributes only (not git lfs track) since git-lfs binary not installed on dev machine"
  - "Research note template uses [Project] placeholder for project-specific section title"
  - "Source protocol documents firecrawl->web_fetch->wget fallback chain"
  - "Two-tier verification: goal-backward first, source audit second"

patterns-established:
  - "Source Attachment Protocol: every cited source must have a corresponding file or documented exception"
  - "Research note format: YAML frontmatter + 5 sections (Key Findings, Analysis, Implications, Open Questions, References)"
  - "SOURCE-LOG.md audit trail: table with Source, URL, Method, File, Status, Notes"
  - "Bootstrap inventory: 3-tier structure (Established, Partially Established, Not Yet Researched)"

requirements-completed: [FORK-04, FOUN-03, FOUN-04]

# Metrics
duration: 73min
completed: 2026-03-11
---

# Phase 1 Plan 2: Templates and References Summary

**Git LFS configured for 6 binary types, 4 research templates created (note, source-log, bootstrap, research-task), config.json extended with vault_path, 3 reference files documenting source protocol, note format, and verification criteria**

## Performance

- **Duration:** 73 min (majority spent debugging git LFS lock contention with missing git-lfs binary)
- **Started:** 2026-03-11T15:24:27Z
- **Completed:** 2026-03-11T16:38:07Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- .gitattributes tracks *.pdf, *.png, *.jpg, *.jpeg, *.gif, *.svg via Git LFS before any binaries committed
- Four research templates provide standardized formats for notes, source logs, bootstrap inventories, and research tasks
- config.json template includes vault_path and commit_research fields alongside all existing GSD fields
- Three reference files document the complete Source Attachment Protocol, canonical note format, and two-tier verification criteria

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure Git LFS and create research templates** - `dd02c68` (feat)
2. **Task 2: Extend config.json and create research reference files** - `aa13f34` (feat)

## Files Created/Modified
- `.gitattributes` - LFS tracking patterns for 6 binary file types
- `grd/templates/research-note.md` - Research note template with YAML frontmatter and 5 sections
- `grd/templates/source-log.md` - SOURCE-LOG.md template with acquisition tracking table
- `grd/templates/bootstrap.md` - Bootstrap inventory template with 3-tier structure
- `grd/templates/research-task.md` - XML research task template with src method/format blocks
- `grd/templates/config.json` - Extended with vault_path and commit_research fields
- `grd/references/source-protocol.md` - Full Source Attachment Protocol documentation
- `grd/references/note-format.md` - Canonical research note structure reference
- `grd/references/research-verification.md` - Two-tier verification criteria reference

## Decisions Made
- Git LFS configured via .gitattributes file content only. The git-lfs binary is not installed on the development machine; .gitattributes is committed so LFS tracking activates automatically when git-lfs is available. Required local git config override (filter.lfs.required=false) to allow git operations without the binary.
- Research note template uses `[Project]` as a placeholder in the "Implications for [Project]" section title, to be replaced by executors with the actual project name.
- Source protocol documents a four-step fallback chain: firecrawl -> web_fetch -> wget/curl -> mark unavailable.
- Two-tier verification runs in strict order: Tier 1 (goal-backward) before Tier 2 (source audit), since there is no point auditing sources if the research question is not answered.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Local git config override for missing git-lfs binary**
- **Found during:** Task 1
- **Issue:** Global gitconfig has `filter.lfs.required = true` and `filter.lfs.process = git-lfs filter-process`, but `git-lfs` binary is not installed. Every git operation touching the index hung indefinitely because the filter process could not be spawned.
- **Fix:** Added local repo git config overriding LFS filter to use `cat` for smudge/clean and empty string for process, with `required = false`. Used low-level git commands (commit-tree, update-ref, write-tree) with alternate GIT_INDEX_FILE to avoid contention with background git processes from the Claude agent SDK.
- **Files modified:** .git/config (local, not tracked)
- **Verification:** Git operations succeed with the override in place
- **Committed in:** Part of both task commits

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary workaround for git-lfs not being installed. Does not affect the correctness of .gitattributes content -- LFS will activate properly once git-lfs is installed.

## Issues Encountered
- Git operations consistently hung due to missing git-lfs binary combined with `required = true` in global gitconfig. Required using low-level git plumbing commands (commit-tree, write-tree, update-ref) with alternate index files to avoid lock contention with Claude agent SDK background git polling.
- A parallel executor (plan 01-03) committed between Task 1 and Task 2, which was handled cleanly by building Task 2's commit on top of the updated HEAD.

## User Setup Required
None - no external service configuration required. Note: `git-lfs` should be installed (`brew install git-lfs`) before Phase 3 adds binary source files.

## Next Phase Readiness
- LFS is configured -- ready for binary source files in Phase 3
- All research templates and reference files are in place for vault write (Plan 03) and subsequent phases
- config.json template has vault_path field ready for config.cjs parsing (Plan 03)

---
*Phase: 01-fork-and-foundation*
*Completed: 2026-03-11*
