---
name: gsd:map-codebase
description: Survey research corpus with parallel mapper agents to produce .planning/codebase/ analysis documents
argument-hint: "[optional: specific domain to survey, e.g., 'methodology' or 'theoretical framework']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Write
  - Task
---

<objective>
Survey the existing research corpus using parallel grd-codebase-mapper agents to produce structured analysis documents about the knowledge landscape.

Each mapper agent explores a focus area and **writes documents directly** to `.planning/codebase/`. The orchestrator only receives confirmations, keeping context usage minimal.

Output: .planning/codebase/ folder with 7 structured documents about the corpus and knowledge landscape.
</objective>

<execution_context>
@/Users/jeremiahwolf/.claude/grd/workflows/map-codebase.md
</execution_context>

<context>
Focus area: $ARGUMENTS (optional - if provided, tells agents to focus on specific research domain)

**Load project state if exists:**
Check for .planning/STATE.md - loads context if project already initialized

**This command can run:**
- Before /grd:new-research (projects with existing source materials and notes) - creates corpus survey first
- After /grd:new-research (new research projects) - updates corpus survey as sources are acquired
- Anytime to refresh understanding of the research landscape
</context>

<when_to_use>
**Use map-corpus for:**
- Projects with existing source materials and notes (understand existing research first)
- Refreshing corpus survey after acquiring new sources
- Onboarding to an unfamiliar research domain
- Before major analytical reorientation (understand current knowledge state)
- When STATE.md references outdated corpus information

**Skip map-corpus for:**
- New research projects with no existing sources (nothing to survey)
- Trivial projects (<5 source files)
</when_to_use>

<process>
1. Check if .planning/codebase/ already exists (offer to refresh or skip)
2. Create .planning/codebase/ directory structure
3. Spawn 4 parallel grd-codebase-mapper agents:
   - Agent 1: sources focus -> writes STACK.md, INTEGRATIONS.md
   - Agent 2: framework focus -> writes ARCHITECTURE.md, STRUCTURE.md
   - Agent 3: methodology focus -> writes CONVENTIONS.md, TESTING.md
   - Agent 4: gaps focus -> writes CONCERNS.md
4. Wait for agents to complete, collect confirmations (NOT document contents)
5. Verify all 7 documents exist with line counts
6. Commit corpus survey
7. Offer next steps (typically: /grd:new-research or /grd:plan-inquiry)
</process>

<success_criteria>
- [ ] .planning/codebase/ directory created
- [ ] All 7 corpus analysis documents written by mapper agents
- [ ] Documents follow template structure
- [ ] Parallel agents completed without errors
- [ ] User knows next steps
</success_criteria>
