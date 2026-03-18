# Phase 3: Source Acquisition - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Source Attachment Protocol implementation: fallback chain for acquiring sources (firecrawl -> web_fetch -> wget/curl -> mark unavailable), SOURCE-LOG.md population, original format preservation, and finding-to-source traceability. This phase builds ON the atomic vault write from Phase 2 and is consumed BY the research agents in Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Acquisition Fallback Chain
- Order is fixed: firecrawl -> web_fetch -> wget/curl -> mark unavailable
- For PDFs specifically: wget direct -> web_fetch -> alternative host search -> unavailable
- Each attempt logged in SOURCE-LOG.md regardless of success/failure
- Unavailable sources do NOT block task completion — gap is documented and flagged
- The acquireSource() function accepts a URL and returns { filePath, status, method } or { status: 'unavailable', reason }

### Original Format Preservation (SRC-05)
- PDFs stay as PDFs (never convert to text)
- HTML pages scraped to markdown (preserving structure — headings, lists, code blocks)
- Screenshots saved as PNG
- GitHub issues/READMEs saved as markdown
- SQL dumps saved as .sql
- The format is determined by source type, not by what's easiest to process

### SOURCE-LOG.md Population
- Every acquisition attempt gets a row in SOURCE-LOG.md (including failures)
- Table columns: Source | URL | Method | File | Status | Notes
- Status values: acquired, partial, paywall, unavailable, rate-limited
- Multiple rows per source are normal (shows fallback chain in action)
- The updateSourceLog() function appends rows to the existing table in SOURCE-LOG.md

### Finding-to-Source Traceability (SRC-06, SRC-07)
- Every claim in Analysis references a local file in -sources/ (not a URL)
- References section uses backtick-wrapped filenames: `filename_date.ext`
- Two-hop verifiability: Executive Summary -> research note -> source file
- Verification (Phase 5) will check these links; this phase just ensures they're created correctly

### File Naming Convention
- Already decided in Phase 1: `{descriptive-slug}_{date-acquired}.{ext}`
- generateSourceFilename() from vault.cjs handles this
- Slugs are sanitized: lowercase, non-alphanumeric replaced with hyphens

### Claude's Discretion
- Internal implementation of the fallback chain (sequential await vs retry pattern)
- HTTP timeout values for each acquisition method
- How to detect source type from URL (regex patterns, content-type headers)
- Whether to use a single acquireSource() or per-type acquisition functions
- Test structure and mocking strategy for external HTTP calls

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `vault.cjs` atomicWrite(): Already creates note + sources/ + SOURCE-LOG.md + git commit — source acquisition plugs into this by writing files into the sources/ dir BEFORE atomicWrite commits
- `vault.cjs` generateSourceFilename(): Already handles slug sanitization and date stamping
- `source-log.md` template: Already has correct table format with status values documented
- `source-protocol.md` reference: Comprehensive guide for acquisition by source type

### Established Patterns
- Zero-dependency CJS architecture — acquisition must use Node built-ins (http/https, child_process for wget/curl)
- Exception: firecrawl CLI and web_fetch are external tools called via child_process
- TDD with node:test runner — proven in Phase 1 and 2
- gitRunner injection pattern for mocking — extend to httpRunner or fetchRunner for mocking HTTP calls

### Integration Points
- acquireSource() will be called by research executor agents (Phase 4/5)
- Results feed into atomicWrite() — source files written to sourcesDir, then atomicWrite commits everything
- SOURCE-LOG.md updates happen via updateSourceLog() which modifies the file created by atomicWrite
- State gap reporting (cmdStateAddGap from Phase 2) called when sources are unavailable

</code_context>

<specifics>
## Specific Ideas

- User requirement: "V1 should include extracting the source documents in their original form. When the executive summary says a thing, I want it to tell me where so I can read the paper and verify for myself."
- The source acquisition module is the heart of what makes GRD different from GSD — without it, research notes are just summaries with dead links
- firecrawl is already installed on the system as a CLI tool

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-source-acquisition*
*Context gathered: 2026-03-11*
