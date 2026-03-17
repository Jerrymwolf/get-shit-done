# Research Note Format

This reference documents the canonical structure of a GSD-R research note. All research notes must follow this format.

## Frontmatter Fields

Every note begins with YAML frontmatter enclosed in `---` delimiters:

```yaml
---
project: [Project Name]
domain: [research domain]
status: draft
date: YYYY-MM-DD
sources: 0
---
```

| Field | Type | Description |
|---|---|---|
| `project` | string | Project name this research belongs to |
| `domain` | string | Research domain (e.g., agent-architecture, graphrag, fine-tuning) |
| `status` | enum | Note lifecycle stage: `draft`, `reviewed`, or `final` |
| `date` | date | Date the note was created or last substantively updated (YYYY-MM-DD) |
| `sources` | integer | Count of files in the `-sources/` folder |

### Status Values

- **draft** -- Initial synthesis from sources. May have gaps, open questions, or low-confidence findings. Has not been verified.
- **reviewed** -- Passed Tier 1 (goal-backward) verification. Research question is answered. Sources are attached. May still have minor formatting issues.
- **final** -- Passed both Tier 1 and Tier 2 verification. Complete, auditable, and ready to inform decisions.

## Required Sections

Every research note has exactly five sections, in this order:

### 1. Key Findings

2-3 sentence summary of what this note concludes. State the main takeaway clearly. This section should be readable in isolation -- someone scanning notes should understand the conclusion from Key Findings alone.

### 2. Analysis

Main body of the research note. Use inline citations as `(Author, Year)` or `[Source Title](relative-path-to-source-file)`. Structure with subheadings as needed.

**Citation format:** Link to the local source file in `-sources/`, not the URL. The URL is recorded in SOURCE-LOG.md for provenance; the note itself references the local copy.

```markdown
According to the LightRAG documentation ([LightRAG README](Orchestration-Frameworks-sources/lightrag-readme_2026-03-10.md)),
the framework supports PostgreSQL via Apache AGE...
```

### 3. Implications for [Project]

How this finding affects the project. The `[Project]` placeholder is replaced with the actual project name. This section must:

- Tie back to project constraints, requirements, and timeline
- Be specific about what changes or confirms in the project plan
- End with an explicit **Recommendation:** if the evidence supports one

### 4. Open Questions

What remains unresolved after this research. Each question should indicate:
- What is unknown
- Why it matters
- What research would resolve it

If a source was unavailable, note it here. If a finding is low-confidence, say so and explain why.

### 5. References

Full list of sources. Every entry **must** have a corresponding file in the `-sources/` folder.

**Format:**
```
1. Author/Org (Year). Title. `filename_in_sources_folder.ext`
```

**Example:**
```markdown
1. HKUDS (2025). LightRAG: Simple and Fast Retrieval-Augmented Generation. `lightrag-readme_2026-03-10.md`
2. Apache AGE (2025). AGE Documentation. `age-postgresql-docs_2026-03-10.md`
3. Chen et al. (2025). KARMA: Augmenting Embodied AI Agents. `karma-arXiv-2502.06472_2026-03-10.pdf`
```

A note without its sources is incomplete. The verification step checks that every reference has a corresponding file.
