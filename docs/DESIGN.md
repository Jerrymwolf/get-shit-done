# GSD-R Design

GSD-R adapts [GSD](https://github.com/glittercowboy/get-shit-done-cc)'s context engineering architecture for academic research workflows. This document describes the design decisions, protocols, and extensions that differentiate GSD-R from its upstream. GSD-R was itself built using GSD.

For installation and usage, see [README.md](../README.md).

---

## The One Change

**GSD's atomic unit is a git commit. GSD-R's atomic unit is a research note with its source material physically attached.**

"Physically attached" means the actual file — the PDF, the scraped markdown, the screenshot — lives in a sibling folder next to the note. Not a URL. Not a link. The genuine article, saved locally, so the research is self-contained and auditable even if every source URL goes dead tomorrow.

Everything else stays: fresh subagent contexts, discuss/plan/execute/verify loop, STATE.md, SUMMARY.md, plan-checker, wave parallelism, aggressive atomicity (2-3 tasks per plan at ~50% context), goal-backward verification.

---

## Translation Table

| GSD (Code) | GSD-R (Research) | Notes |
|---|---|---|
| Git commit | Research note + sources written to vault | One note per task. The vault write IS the commit. |
| Source code files | Source material (PDF, scraped .md, screenshot) | Physically in `{Note}-sources/` folder — never just a link |
| Test passes | Note passes format + citation + source-attachment check | Every cited source has a corresponding file |
| `git bisect` | Note-level rollback | Delete or revise individual notes without affecting others |
| Build succeeds | Research question answered | Goal-backward: "Can I now answer X?" |
| PLAN.md | PLAN.md (unchanged) | Same XML task format, same 2-3 task limit |
| SUMMARY.md | SUMMARY.md (unchanged) | Subagent returns: key findings, implications, open questions, confidence |
| CONTEXT.md | CONTEXT.md (unchanged) | Accumulated decisions from discuss phase |
| STATE.md | STATE.md (unchanged) | Tracks note statuses: draft / reviewed / final / source-incomplete |
| PROJECT.md | PROJECT.md (unchanged) | Research questions, constraints, codebook, hardware limits |
| REQUIREMENTS.md | REQUIREMENTS.md (unchanged) | Required notes inventory with acceptance criteria |
| ROADMAP.md | ROADMAP.md (unchanged) | Milestones and phases |
| `.planning/` | `.planning/` (unchanged) | All state files live here |
| `.planning/research/` | `.planning/research/` (unchanged) | GSD already has research subagents — promoted to primary |

**Research templates (project-level):** LANDSCAPE.md (replaces STACK.md), QUESTIONS.md (replaces FEATURES.md), FRAMEWORKS.md (replaces ARCHITECTURE.md), DEBATES.md (replaces PITFALLS.md)

---

## Source Attachment Protocol

This is GSD-R's equivalent of GSD's git commit protocol. Every subagent follows it.

### The Rule

**Every source cited in a note's References section must have a corresponding file in the note's `-sources/` folder, or a documented exception in `SOURCE-LOG.md`.** A note without its sources is like a commit without its files — incomplete.

### Folder Convention

Every note `Foo.md` has a sibling folder `Foo-sources/`:

```
01-Agent-Architecture/
├── Orchestration-Frameworks.md
├── Orchestration-Frameworks-sources/
│   ├── SOURCE-LOG.md
│   ├── langgraph-readme_2026-03-10.md
│   ├── crewai-docs_2026-03-10.md
│   ├── autogen-readme_2026-03-10.md
│   ├── agno-readme_2026-03-10.md
│   └── claude-agent-sdk-docs_2026-03-10.md
├── Concordance-Patterns.md
├── Concordance-Patterns-sources/
│   ├── SOURCE-LOG.md
│   ├── karma-arXiv-2502.06472_2026-03-10.pdf
│   └── logos-arXiv-2509.24294_2026-03-10.pdf
```

### File Naming Convention

```
{descriptive-slug}_{date-acquired}.{ext}
```

Examples:
- `karma-arXiv-2502.06472_2026-03-10.pdf`
- `lightrag-readme_2026-03-10.md`
- `age-postgresql-docs_2026-03-10.md`
- `lightrag-issue-2696_2026-03-10.md`
- `supabase-schema-dump_2026-03-10.sql`

Date stamp prevents confusion when a source is re-acquired after an update.

### Acquisition Protocol by Source Type

| Source Type | Acquire With | Save As | Example |
|---|---|---|---|
| arXiv paper | `wget https://arxiv.org/pdf/XXXX.XXXXX` | `.pdf` | `karma-arXiv-2502.06472_2026-03-10.pdf` |
| arXiv HTML | `firecrawl scrape` or `web_fetch` on `/html/` URL | `.md` | `karma-arXiv-2502.06472-html_2026-03-10.md` |
| GitHub README | `firecrawl scrape` or `web_fetch` raw URL | `.md` | `lightrag-readme_2026-03-10.md` |
| GitHub issue | `gh issue view N --repo X` or `web_fetch` | `.md` | `lightrag-issue-2696_2026-03-10.md` |
| Documentation site | `firecrawl scrape` or `web_fetch` | `.md` | `age-postgresql-docs_2026-03-10.md` |
| Conference paper (ACL, AAAI, NeurIPS) | `wget` PDF from proceedings URL | `.pdf` | `logos-aaai-2026_2026-03-10.pdf` |
| Database query results | Run query, save output | `.sql` + `.md` | `supabase-schema-dump_2026-03-10.sql` |
| Existing vault note | No acquisition needed | wikilink in References | `[[Bootstrap-Summary]]` |
| Web page (general) | `web_fetch` → save response | `.md` | `ollama-model-library_2026-03-10.md` |
| Diagram / architecture screenshot | `playwright screenshot` or download | `.png` | `graphrag-architecture_2026-03-10.png` |

### Fallback Chain

If the primary acquisition method fails, the subagent tries the next method before marking the source as unavailable:

```
firecrawl scrape → web_fetch → wget/curl → mark unavailable in SOURCE-LOG.md
```

For PDFs specifically:
```
wget direct PDF URL → web_fetch PDF URL → search for alternative host → mark unavailable
```

**A source marked unavailable does NOT block the task.** The subagent documents the failure in `SOURCE-LOG.md`, continues synthesis from available sources, and flags the gap in the note's Open Questions section. The verification step will catch it.

### SOURCE-LOG.md Format

Every `-sources/` folder contains a `SOURCE-LOG.md`:

```markdown
# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
| KARMA paper | https://arxiv.org/pdf/2502.06472 | wget | karma-arXiv-2502.06472_2026-03-10.pdf | acquired | 28 pages |
| LOGOS paper | https://arxiv.org/pdf/2509.24294 | wget | logos-arXiv-2509.24294_2026-03-10.pdf | acquired | 15 pages |
| Graphiti repo | https://github.com/getzep/graphiti | firecrawl | — | unavailable | 403 rate-limited; used web_fetch fallback |
| Graphiti repo | https://github.com/getzep/graphiti | web_fetch | graphiti-readme_2026-03-10.md | acquired | fallback succeeded |
```

This is the audit trail. Every source either has a file or has a documented reason why not.

---

## What Changes in Each GSD Stage

### `/gsd-r:new-project`

Same questioning → research → requirements → roadmap flow. Three additions:

1. **Source inventory prompt**: "What existing research, notes, or data already exists?" Produces a `BOOTSTRAP.md` that every subsequent phase loads. Prevents re-researching known findings.

2. **Research questions framing**: REQUIREMENTS.md is organized as questions to answer, not features to build. Each requirement = a question + the note(s) that will answer it + acceptance criteria for "answered."

3. **Final deliverable format**: If the project's terminal output is a build spec for a follow-on GSD code project, REQUIREMENTS.md explicitly states: "The Executive Summary must conform to GSD `--auto` input format (What I Want Built / Project Context / Milestones / Tool Usage / Verification Criteria)."

**BOOTSTRAP.md format:**

```markdown
# Bootstrap: Existing Research Inventory

## Already Established (do not re-research)

| Finding | Source Note | Confidence | Date |
|---|---|---|---|
| LightRAG supports PostgreSQL via AGE + pgvector natively since v1.4.10 | [[GraphRAG-Research-9Mar]] | High | 2026-03-09 |
| [Hardware constraint finding — e.g., model size vs. available VRAM] | [[GraphRAG-Research-9Mar]] | High | 2026-03-09 |
| ... | ... | ... | ... |

## Partially Established (extend, don't restart)

| Finding | What's Known | What's Missing | Source Note |
|---|---|---|---|
| KARMA achieves 83.1% correctness | Headline metric known | Don't know concordance mechanism details | [[GraphRAG-Research-9Mar]] |

## Not Yet Researched

| Topic | Why It Matters | Target Note |
|---|---|---|
| LoRA fine-tuning on Apple Silicon M4 | Core build dependency | Fine-Tuning/LoRA-Strategy.md |
```

### `/gsd-r:discuss-phase`

Identical to GSD. Locks in what the human already believes, what's negotiable, and what's load-bearing before any research runs. Output: `{phase}-CONTEXT.md`.

Critical for research: this is where you say "PostgreSQL is non-negotiable" or "a core architectural decision is already settled" so subagents don't waste context re-evaluating settled decisions.

### `/gsd-r:plan-phase`

Same three-agent flow: researcher → planner → plan-checker.

**Researcher** scouts sources (papers, repos, docs) rather than stack/libraries. Four parallel research subagents become:

| GSD Code Researcher | GSD-R Researcher |
|---|---|
| Stack researcher | Source researcher — find papers, repos, docs; verify URLs are live; identify PDFs vs. HTML |
| Features researcher | Methods researcher — how have others investigated this? What methodologies, what findings? |
| Architecture researcher | Architecture researcher — theoretical structure, construct relationships, boundary conditions |
| Pitfalls researcher | Limitations researcher — known failures, edge cases, epistemological limitations, retractions |

The **source researcher** has an additional responsibility: for every source identified, record whether it's available as PDF, HTML, or requires Firecrawl scraping. This feeds the planner's `<src>` blocks so the executor knows the acquisition method in advance.

**Planner** creates PLAN.md with 2-3 tasks. Each task:

```xml
<task type="research">
  <n>Read and synthesize LightRAG PostgreSQL implementation</n>
  <sources>
    <src method="firecrawl" format="md">https://github.com/HKUDS/LightRAG</src>
    <src method="gh-cli" format="md">gh issue list --repo HKUDS/LightRAG --label postgresql --limit 10</src>
    <src method="web_fetch" format="md">https://age.apache.org/age-manual/intro/overview.html</src>
  </sources>
  <o>{Project}-Research/02-GraphRAG/PostgreSQL-Architecture.md</o>
  <action>
    Acquire all sources per the Source Attachment Protocol. Read and synthesize
    into a single note following the research-note template. Focus on: Does
    AGE + pgvector work in a single PostgreSQL instance? What are the known
    limitations at scale? How does LightRAG's implementation handle incremental
    updates?
  </action>
  <verify>
    1. Note exists at output path with complete frontmatter.
    2. "Implications for [Project]" section present and substantive.
    3. Every source in References has a corresponding file in -sources/ folder.
    4. SOURCE-LOG.md exists and accounts for every source (acquired or documented failure).
    5. Note answers the research question OR Open Questions section explicitly states what remains.
    6. No finding contradicts BOOTSTRAP.md without explicit justification.
  </verify>
  <done>Note + sources written. SOURCE-LOG.md complete. SUMMARY.md updated.</done>
</task>
```

**Plan-checker** verifies:
- Does this plan duplicate work from existing notes or BOOTSTRAP.md?
- Are the sources primary (papers, repos, official docs — not blog summaries)?
- Does each task fit in ~50% context? (Rule of thumb: ≤3 sources per task. If a source is a 30-page paper, it gets its own task.)
- Is the acquisition method specified for every source?

### `/gsd-r:execute-phase`

Identical mechanics to GSD. Fresh subagent per task. Each subagent:

1. Reads PLAN.md task
2. **Acquires sources** per the Source Attachment Protocol:
   - Download/scrape each source using the method specified in `<src>`
   - Save to `{Note}-sources/` with naming convention `{slug}_{date}.{ext}`
   - Log each acquisition (success or failure) in `SOURCE-LOG.md`
   - If primary method fails, follow the fallback chain
3. **Reads acquired source files** (not the URLs — the local copies)
4. **Writes the research note** to the vault following the note template
5. **Cross-checks**: every source cited in References has a file in `-sources/`
6. Writes SUMMARY.md with: key findings, implications, open questions, confidence level, source acquisition status
7. Returns to orchestrator

**The vault write IS the commit.** The atomic deliverable is: note file + sources folder + SOURCE-LOG.md. All three exist, or the task is incomplete.

**Wave parallelism works the same way.** Independent research tasks run in parallel waves. Synthesis tasks that depend on multiple notes wait for their inputs.

### `/gsd-r:verify-work`

Two-tier verification, run in order:

**Tier 1 — Goal-backward (primary):**

"What must be TRUE for this research question to be answered?"

```
Phase verification example:
- TRUE: "I can name the optimal orchestration framework for [tie back to
  project constraints, goals, and timeline], and I have evidence."
- TRUE: "The recommendation accounts for overhead, local model support,
  and concordance routing."
- TRUE: "At least 3 frameworks were compared on the same criteria."
- If any FALSE → identify which note is missing or incomplete →
  create fix tasks via /gsd-r:quick
```

**Tier 2 — Source audit (secondary, equivalent to linting):**

```
For each note in this phase:
  ✓ Frontmatter complete (project, domain, status, date, sources count)
  ✓ "Implications for [Project]" section exists and is substantive
  ✓ References section lists ≥3 primary sources
  ✓ Every reference has a file in -sources/ folder
  ✓ SOURCE-LOG.md exists and accounts for all sources
  ✓ No unreferenced files in -sources/ (no orphans)
  ✓ No finding contradicts BOOTSTRAP.md without justification
  ✓ Status in STATE.md matches actual note state
```

---

## Vault Write Protocol

GSD's commit protocol is: `git add -A && git commit -m "feat(phase): description"`. GSD-R's equivalent:

### Primary Method: Obsidian MCP

```
# 1. Create the sources folder contents first
vault_create path="{note}-sources/SOURCE-LOG.md" content="..."
# (source files saved via file system — MCP for metadata, fs for binaries)

# 2. Write the research note
vault_create path="{note-path}.md" content="..."

# 3. Verify the write
vault_read path="{note-path}.md"    # confirm note exists
vault_list path="{note}-sources/"    # confirm sources exist
```

### Fallback: Direct File System

If Obsidian MCP is unavailable, write files directly to the vault directory on disk. The subagent must know the vault's absolute path (set in `config.json` as `vault_path`).

```bash
# Write note
cat > "${VAULT_PATH}/{note-path}.md" << 'EOF'
...note content...
EOF

# Write sources
cp acquired-source.pdf "${VAULT_PATH}/{note}-sources/{slug}_{date}.pdf"

# Verify
ls -la "${VAULT_PATH}/{note}-sources/"
```

### Note Versioning

Research notes are revised in place (overwritten). The audit trail lives in three places:
- **SOURCE-LOG.md** records when sources were acquired (date-stamped file names)
- **Decision Log** records when conclusions changed and why
- **Git** (optional but recommended): if the Obsidian vault is git-tracked, the vault write is also a git commit, giving full history for free

---

## STATE.md Research Extensions

GSD's STATE.md tracks phases and tasks. GSD-R adds a note-status tracker:

```markdown
## Note Status

| Note Path | Status | Sources | Last Updated |
|---|---|---|---|
| 01-Agent-Architecture/Orchestration-Frameworks.md | final | 5/5 acquired | 2026-03-12 |
| 01-Agent-Architecture/Concordance-Patterns.md | draft | 2/3 acquired (1 unavailable) | 2026-03-12 |
| 02-GraphRAG/Framework-Comparison.md | not started | — | — |

## Source Gaps

| Note | Missing Source | Reason | Impact |
|---|---|---|---|
| Concordance-Patterns.md | LOGOS full text | Paywall | Low — abstract + related work sufficient for concordance analysis |
```

---

## File Structure

```
.planning/
├── PROJECT.md              # Research questions, constraints, codebook
├── REQUIREMENTS.md         # Required notes as questions with acceptance criteria
├── ROADMAP.md              # Milestones and phases
├── STATE.md                # Progress tracker (phase status + note status + source gaps)
├── BOOTSTRAP.md            # Existing research inventory (Phase 0 output)
├── config.json             # GSD-R settings incl. vault_path, source acquisition prefs
├── research/               # Phase 0 domain research (from new-project)
└── phases/
    ├── 00-bootstrap/
    │   ├── 00-CONTEXT.md
    │   ├── PLAN_0_1.md
    │   └── SUMMARY.md
    ├── 01-[domain]/
    │   ├── 01-CONTEXT.md
    │   ├── PLAN_1_1.md
    │   ├── PLAN_1_2.md
    │   └── SUMMARY.md
    └── ...

{Project}-Research/                                # The deliverables (vault notes)
├── 00-Executive-Summary.md                        # Terminal output — GSD --auto format if next step is build
├── 01-[Domain]/
│   ├── [Topic].md
│   ├── [Topic]-sources/
│   │   ├── SOURCE-LOG.md
│   │   ├── source-a_2026-03-10.md
│   │   └── source-b_2026-03-10.md
│   ├── [Topic-2].md
│   ├── [Topic-2]-sources/
│   │   ├── SOURCE-LOG.md
│   │   └── ...
│   └── ...
├── 02-[Domain]/
│   └── ... (same pattern)
├── 03-[Domain]/
│   └── ... (same pattern)
├── 04-[Domain]/
│   └── ... (same pattern)
└── 05-Decision-Log.md
```

---

## Decision Log Format

```markdown
| # | Decision | Options Considered | Evidence | Chosen | Rationale | Reversible? | Date |
|---|----------|-------------------|----------|--------|-----------|-------------|------|
| 1 | Graph database | Neo4j, AGE, Memgraph | [[PostgreSQL-Architecture]] | AGE | Single-instance with existing PG; no new infra | Yes (data portable) | 2026-03-12 |
```

---

## Research Note Template

```markdown
---
project: [Project]
domain: [domain]
status: draft | reviewed | final
date: 2026-03-10
sources: 5          # count of files in -sources/ folder
---

# [Title]

## Key Findings

[2-3 sentence summary of what this note concludes]

## Analysis

[Main body. Inline citations as (Author, Year) or [Source Title](relative-path-to-source-file).
Link to the local source file in -sources/, not the URL.]

## Implications for [Project]

[How this finding affects the research — always tie back to project constraints, goals, and timeline.
End with an explicit **Recommendation:** if the evidence supports one.]

## Open Questions

[What remains unresolved. If a source was unavailable, note it here.
If a finding is low-confidence, say so and say why.]

## References

[Full list. Every entry has a corresponding file in -sources/ folder.
Format: Author/Org (Year). Title. `filename_in_sources_folder.ext`]

1. HKUDS (2025). LightRAG: Simple and Fast Retrieval-Augmented Generation. `lightrag-readme_2026-03-10.md`
2. Apache AGE (2025). AGE Documentation. `age-postgresql-docs_2026-03-10.md`
3. ...
```

---

## What Does NOT Change

- Fresh 200k subagent contexts per task
- Orchestrator stays at 30-40% context
- 2-3 tasks per PLAN.md, each fitting ~50% context
- Wave parallelism for independent tasks
- Plan-checker agent validates before execution
- STATE.md tracks progress across sessions
- CONTEXT.md carries discuss-phase decisions forward
- `/clear` safety — all state is in files, never in context
- SUMMARY.md contract — every subagent reports back structured findings
- Aggressive atomicity — if a task is too big, split it
- Quick mode (`/gsd-r:quick`) for targeted fixes to individual notes
