# Requirements: GRD v1.3 Upstream Sync + Rename + Source Pipeline Wiring

**Defined:** 2026-03-22
**Core Value:** Every research finding is self-contained and auditable -- the note plus its actual source files, never just links

## v1.3 Requirements

Requirements for the Upstream Sync + Rename + Source Pipeline Wiring milestone. Each maps to roadmap phases.

### Upstream Sync

- [x] **SYNC-01**: GRD CJS modules synced with GSD v1.28.0 preserving all research extensions
- [x] **SYNC-02**: GRD workflows synced with GSD v1.28.0 preserving research adaptations
- [x] **SYNC-03**: GRD agent prompts synced with GSD v1.28.0 preserving research-specific agents
- [x] **SYNC-04**: GRD templates synced with GSD v1.28.0 preserving research note templates
- [x] **SYNC-05**: VERSION file updated to 1.28.0
- [x] **SYNC-06**: All tests pass after sync (existing 514+ tests green)

### Rename

- [x] **REN-01**: `commands/gsd-r/` directory renamed to `commands/grd/`
- [x] **REN-02**: All 16 agent files renamed from `gsd-r-*.md` to `grd-*.md`
- [x] **REN-03**: All 3 hook files renamed from `gsd-*.js` to `grd-*.js`
- [x] **REN-04**: Bulk content replacement: zero instances of `gsd-r`, `GSD-R`, `get-shit-done-r` in active files
- [x] **REN-05**: install.js internal references updated (markers, variable names, agent mappings)
- [x] **REN-06**: Config files updated (.gitignore, .claude/settings.local.json, package.json files array)
- [x] **REN-07**: Test files updated with new filenames and paths
- [x] **REN-08**: Old migration scripts deleted (rename-gsd-to-gsd-r.cjs, bulk-rename-planning.cjs)
- [x] **REN-09**: All tests pass after rename

### Command Vocabulary

- [ ] **CMD-01**: 6 command files renamed (new-project->new-research, discuss-phase->scope-inquiry, plan-phase->plan-inquiry, execute-phase->conduct-inquiry, verify-work->verify-inquiry, complete-milestone->complete-study)
- [ ] **CMD-02**: Cross-references updated in all 34 command files
- [ ] **CMD-03**: Cross-references updated in 17 workflow files (context-sensitive, identifier-only)
- [ ] **CMD-04**: Cross-references updated in 16 agent files
- [ ] **CMD-05**: Old command filenames no longer exist in `commands/grd/`
- [ ] **CMD-06**: All tests pass after vocabulary update

### Source Pipeline

- [ ] **SRC-01**: conduct-inquiry workflow spawns source-researcher agent after each plan's executor completes
- [ ] **SRC-02**: atomicWrite() called during note creation (note + sources + SOURCE-LOG + git commit)
- [ ] **SRC-03**: validateReferences() works end-to-end in verify-inquiry with real sources
- [ ] **SRC-04**: Template path resolution works for both local and global installs
- [ ] **SRC-05**: Running conduct-inquiry on a phase with `<src>` blocks produces `-sources/` directories with acquired files

### Documentation

- [ ] **DOC-01**: README.md rewritten with final-state naming, command references, and translation table
- [ ] **DOC-02**: docs/DESIGN.md updated with all naming changes
- [ ] **DOC-03**: All command examples in docs match new invocations
- [ ] **DOC-04**: No stale branding in user-facing documentation

## Future Requirements

### v2.1 -- Obsidian Vault Target

- **OBS-01**: vault_path config option for Obsidian vault directory
- **OBS-02**: atomicWrite() outputs to configured vault path
- **OBS-03**: Obsidian-flavored wikilinks for cross-referencing inquiry notes

### v2.2 -- NotebookLM Verification + Synthesis

- **NLM-01**: Auto-upload acquired sources to NotebookLM notebook
- **NLM-02**: Tier 3 verification via notebook_query() for claim checking
- **NLM-03**: Audio Overview and synthesis artifact generation

### v2.3 -- Academic Database Access

- **ADB-01**: DOI resolver with Unpaywall/Sci-Hub fallback
- **ADB-02**: Semantic Scholar / OpenAlex API integration
- **ADB-03**: Citation graph traversal (depth-limited)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Obsidian vault integration | Deferred to v2.1 -- requires working source pipeline first |
| NotebookLM verification layer | Deferred to v2.2 -- requires working source pipeline first |
| Academic database access | Deferred to v2.3 -- highest complexity, needs solid v2.0 foundation |
| Institutional proxy auth | University-specific, manual setup per institution |
| PRISMA flow diagram generation | Deferred from v1.2, not needed for pipeline wiring |
| Bibliometric mapping | Deferred from v1.2, independent feature |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SYNC-01 | Phase 25 | Complete |
| SYNC-02 | Phase 25 | Complete |
| SYNC-03 | Phase 25 | Complete |
| SYNC-04 | Phase 25 | Complete |
| SYNC-05 | Phase 25 | Complete |
| SYNC-06 | Phase 25 | Complete |
| REN-01 | Phase 26 | Pending |
| REN-02 | Phase 26 | Pending |
| REN-03 | Phase 26 | Pending |
| REN-04 | Phase 26 | Complete |
| REN-05 | Phase 26 | Complete |
| REN-06 | Phase 26 | Complete |
| REN-07 | Phase 26 | Complete |
| REN-08 | Phase 26 | Pending |
| REN-09 | Phase 26 | Complete |
| CMD-01 | Phase 27 | Pending |
| CMD-02 | Phase 27 | Pending |
| CMD-03 | Phase 27 | Pending |
| CMD-04 | Phase 27 | Pending |
| CMD-05 | Phase 27 | Pending |
| CMD-06 | Phase 27 | Pending |
| SRC-01 | Phase 28 | Pending |
| SRC-02 | Phase 28 | Pending |
| SRC-03 | Phase 28 | Pending |
| SRC-04 | Phase 28 | Pending |
| SRC-05 | Phase 28 | Pending |
| DOC-01 | Phase 29 | Pending |
| DOC-02 | Phase 29 | Pending |
| DOC-03 | Phase 29 | Pending |
| DOC-04 | Phase 29 | Pending |

**Coverage:**
- v1.3 requirements: 30 total
- Mapped to phases: 30/30
- Unmapped: 0

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after roadmap creation*
