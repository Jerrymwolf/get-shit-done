<!-- Research Task Template

Use this template when creating research tasks in PLAN.md files.
Each task acquires sources, synthesizes a note, and verifies source attachment.

Valid method values for <src>:
  - firecrawl: Scrape web page to markdown via Firecrawl MCP
  - web_fetch: Fetch URL content directly
  - wget: Download file via wget/curl (best for PDFs)
  - gh-cli: Use GitHub CLI (gh issue view, gh api, etc.)
  - scholar-search: Google Scholar search via Firecrawl (for academic discovery)
  - citation-trace: Follow citation network from a known paper via Firecrawl

Valid format values for <src>:
  - md: Markdown (scraped pages, READMEs, docs, issues)
  - pdf: PDF document (papers, reports)
  - png: Screenshot or diagram image
  - sql: Database query or schema dump

## Source Type Examples

The planner should generate <src> blocks using the appropriate method/format
combination for each source type:

### arXiv Paper (PDF)
```xml
<src method="wget" format="pdf">https://arxiv.org/pdf/2502.06472</src>
```

### arXiv Paper (HTML version)
```xml
<src method="firecrawl" format="md">https://arxiv.org/html/2502.06472</src>
```

### GitHub Repository README
```xml
<src method="firecrawl" format="md">https://github.com/HKUDS/LightRAG</src>
```

### Documentation Site
```xml
<src method="firecrawl" format="md">https://docs.example.com/guide/getting-started</src>
```

### GitHub Issue or Discussion
```xml
<src method="gh-cli" format="md">gh issue view 2696 --repo HKUDS/LightRAG</src>
```

### GitHub API (structured data)
```xml
<src method="gh-cli" format="md">gh api repos/HKUDS/LightRAG/releases/latest</src>
```

### General Web Page
```xml
<src method="web_fetch" format="md">https://ollama.com/library</src>
```

### Conference Paper (direct PDF)
```xml
<src method="wget" format="pdf">https://proceedings.neurips.cc/paper/2025/file/example.pdf</src>
```

### Google Scholar Search (via Firecrawl)
```xml
<src method="firecrawl" format="md">https://scholar.google.com/scholar?q=%22Self-Determination+Theory%22+meta-analysis</src>
```

### Citation Trace (follow references from a known paper)
```xml
<src method="firecrawl" format="md">https://scholar.google.com/scholar?cites=CITATION_ID</src>
```

### SSRN Working Paper
```xml
<src method="wget" format="pdf">https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1234567</src>
```

### Systematic Search (documented multi-database search)
```xml
<!-- For systematic reviews: document search terms, databases, date ranges -->
<src method="firecrawl" format="md">https://pubmed.ncbi.nlm.nih.gov/?term=mindfulness+intervention+RCT&filter=dates.2020-2026</src>
```

## Source Limits

To keep tasks focused and within subagent context budgets:

- **Maximum 3 sources per task.** If a topic requires more sources, split into
  multiple tasks that produce separate notes. The synthesizer can merge later.

- **Papers over 30 pages get a dedicated task.** A single long paper should be
  the sole source in its task so the subagent can read it thoroughly.

- **Prefer fewer, higher-quality sources** over many shallow ones. One official
  doc page is worth more than three blog posts.

## Context Budget

Each research task should produce work that fits within approximately 50% of the
subagent's context window. This leaves room for the agent prompt, source protocol,
templates, and synthesis output. In practice:

- **1-2 short sources** (README, docs page): Comfortable fit.
- **1 medium source** (10-20 page paper): Comfortable fit.
- **1 long source** (30+ pages): Tight fit -- dedicate the full task to it.
- **3 sources of any size**: Maximum. The subagent needs room to synthesize.

If unsure, err on the side of fewer sources per task. Under-loaded tasks complete
faster and produce higher-quality notes than over-loaded ones.
-->

<task type="research">
  <n>[Read and synthesize TOPIC]</n>
  <sources>
    <src method="firecrawl" format="md">[URL]</src>
    <src method="wget" format="pdf">[URL]</src>
    <src method="gh-cli" format="md">[gh command]</src>
    <src method="web_fetch" format="md">[URL]</src>
  </sources>
  <o>[vault-path/Note-Name.md]</o>
  <action>
    Acquire all sources per the Source Attachment Protocol. Read and synthesize
    into a single note following the research-note template. Focus on:
    [specific research questions to answer].
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
