# Source Attachment Protocol

The Source Attachment Protocol is GRD's equivalent of GSD's git commit protocol. Every research subagent follows it.

## The Rule

**Every source cited in a note's References section must have a corresponding file in the note's `-sources/` folder, or a documented exception in `SOURCE-LOG.md`.** A note without its sources is like a commit without its files -- incomplete.

## Folder Convention

Every note `Foo.md` has a sibling folder `Foo-sources/`:

```
01-Agent-Architecture/
+-- Orchestration-Frameworks.md
+-- Orchestration-Frameworks-sources/
|   +-- SOURCE-LOG.md
|   +-- langgraph-readme_2026-03-10.md
|   +-- crewai-docs_2026-03-10.md
|   +-- autogen-readme_2026-03-10.md
+-- Concordance-Patterns.md
+-- Concordance-Patterns-sources/
    +-- SOURCE-LOG.md
    +-- karma-arXiv-2502.06472_2026-03-10.pdf
    +-- logos-arXiv-2509.24294_2026-03-10.pdf
```

Writing a note **always** creates both the `.md` file and its `-sources/` sibling folder. Both must exist for the note to be considered complete.

## File Naming Convention

```
{descriptive-slug}_{date-acquired}.{ext}
```

**Examples:**
- `karma-arXiv-2502.06472_2026-03-10.pdf`
- `lightrag-readme_2026-03-10.md`
- `age-postgresql-docs_2026-03-10.md`
- `lightrag-issue-2696_2026-03-10.md`
- `supabase-schema-dump_2026-03-10.sql`

The date stamp prevents confusion when a source is re-acquired after an update.

## Acquisition Protocol by Source Type

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
| Web page (general) | `web_fetch` then save response | `.md` | `ollama-model-library_2026-03-10.md` |
| Diagram / architecture screenshot | `playwright screenshot` or download | `.png` | `graphrag-architecture_2026-03-10.png` |

## Fallback Chain

If the primary acquisition method fails, the subagent tries the next method before marking the source as unavailable:

```
firecrawl scrape -> web_fetch -> wget/curl -> mark unavailable in SOURCE-LOG.md
```

For PDFs specifically:
```
wget direct PDF URL -> web_fetch PDF URL -> search for alternative host -> mark unavailable
```

**A source marked unavailable does NOT block the task.** The subagent:
1. Documents the failure in `SOURCE-LOG.md`
2. Continues synthesis from available sources
3. Flags the gap in the note's Open Questions section
4. The verification step will catch it

## SOURCE-LOG.md Format

Every `-sources/` folder contains a `SOURCE-LOG.md`. This is the audit trail. Every source either has a file or has a documented reason why not.

```markdown
# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
| KARMA paper | https://arxiv.org/pdf/2502.06472 | wget | karma-arXiv-2502.06472_2026-03-10.pdf | acquired | 28 pages |
| LOGOS paper | https://arxiv.org/pdf/2509.24294 | wget | logos-arXiv-2509.24294_2026-03-10.pdf | acquired | 15 pages |
| Graphiti repo | https://github.com/getzep/graphiti | firecrawl | -- | unavailable | 403 rate-limited |
| Graphiti repo | https://github.com/getzep/graphiti | web_fetch | graphiti-readme_2026-03-10.md | acquired | fallback |
```

**Status values:**
- `acquired` -- File successfully downloaded/scraped and saved
- `partial` -- Only part of the source was obtainable (e.g., abstract only)
- `paywall` -- Source behind paywall, could not acquire full text
- `unavailable` -- Source URL dead, 404, or otherwise inaccessible
- `rate-limited` -- Temporarily blocked; may retry later

## Citation Format

In the research note's References section, link to the local source file, not the URL:

```markdown
## References

1. HKUDS (2025). LightRAG: Simple and Fast RAG. `lightrag-readme_2026-03-10.md`
2. Apache AGE (2025). AGE Documentation. `age-postgresql-docs_2026-03-10.md`
```

The backtick-wrapped filename corresponds to a file in the `-sources/` folder. Verification checks this mapping.
