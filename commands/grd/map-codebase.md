---
name: grd:map-corpus
description: Survey existing sources, notes, and knowledge landscape of a research project
argument-hint: "[optional: specific domain to map, e.g., 'autonomy' or 'methodology']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Write
  - Task
---

<objective>
Survey the existing research corpus using parallel mapper agents to produce structured knowledge landscape documents.

Each mapper agent explores a focus area and **writes documents directly** to `.planning/corpus/`. The orchestrator only receives confirmations, keeping context usage minimal.

Output: .planning/corpus/ folder with 7 structured documents about the research landscape.

**What this command maps:**
- Source inventory (what has been acquired and where it lives)
- Domain coverage (which research domains are represented)
- Methodological approaches (what methods appear across sources)
- Evidence quality distribution (how strong is the evidence base)
- Coverage gaps (what domains/perspectives are missing)
- Connections between sources (cross-citations, shared frameworks, debates)
- Overall corpus quality (breadth, depth, recency, diversity)
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/map-codebase.md
</execution_context>

<context>
Focus area: $ARGUMENTS (optional - if provided, tells agents to focus on specific domain)

**Load project state if exists:**
Check for .planning/STATE.md - loads context if project already initialized

**This command can run:**
- Before /grd:new-research (existing corpus) - maps what sources already exist
- After /grd:new-research (active project) - surveys corpus as research progresses
- Anytime to refresh understanding of the knowledge landscape
</context>

<when_to_use>
**Use map-corpus for:**
- Projects with existing sources before initialization (understand what you already have)
- Refreshing corpus map after significant source acquisition
- Identifying coverage gaps before the next line of inquiry
- Before synthesis phases (understand the full evidence base)
- When STATE.md references outdated corpus information

**Skip map-corpus for:**
- Brand new research topics with no sources yet (nothing to map)
- Trivial corpora (<5 sources)
</when_to_use>

<process>
1. Check if .planning/corpus/ already exists (offer to refresh or skip)
2. Create .planning/corpus/ directory structure
3. Spawn 4 parallel grd-codebase-mapper agents:
   - Agent 1: sources focus -> writes SOURCES.md, CONNECTIONS.md
   - Agent 2: domains focus -> writes DOMAINS.md, COVERAGE.md
   - Agent 3: methods focus -> writes METHODOLOGY.md, QUALITY.md
   - Agent 4: gaps focus -> writes GAPS.md
4. Wait for agents to complete, collect confirmations (NOT document contents)
5. Verify all 7 documents exist with line counts
6. Commit corpus map
7. Offer next steps (typically: /grd:new-research or /grd:plan-inquiry)
</process>

<success_criteria>
- [ ] .planning/corpus/ directory created
- [ ] All 7 corpus documents written by mapper agents
- [ ] Documents follow template structure
- [ ] Parallel agents completed without errors
- [ ] User knows next steps
</success_criteria>
