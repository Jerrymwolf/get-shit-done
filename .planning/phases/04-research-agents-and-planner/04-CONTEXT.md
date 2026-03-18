# Phase 4: Research Agents and Planner - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Create four specialized researcher subagent prompts (source/methods/architecture/limitations), modify the planner to generate research task XML with `<src>` blocks, modify the plan-checker to enforce source discipline, and generate BOOTSTRAP.md during new-project. This phase creates the agent layer that USES the acquisition engine from Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Specialized Researcher Subagents (ORCH-04)
- Four researcher types, each producing research notes via the vault write + source acquisition pipeline:
  - **source-researcher**: Acquires and reads primary sources (papers, docs, repos)
  - **methods-researcher**: Investigates methodologies and approaches
  - **architecture-researcher**: Analyzes system designs and technical architectures
  - **limitations-researcher**: Identifies constraints, risks, and boundary conditions
- Each agent prompt file follows the grd-phase-researcher.md pattern (frontmatter + role + sections)
- Agents are .md files in the agents/ directory with grd- prefix
- Each agent uses the acquire.cjs functions via tool calls during execution

### Research Task XML Template (ORCH-05)
- research-task.md template already exists with correct XML structure
- Planner generates tasks with `<src method="" format="">` blocks
- Valid methods: firecrawl, web_fetch, wget, gh-cli
- Valid formats: md, pdf, png, sql
- Each task specifies acquisition method upfront — no guessing at runtime

### Modified Plan-Checker (ORCH-06)
- Plan-checker validates research-specific rules:
  - No duplication of BOOTSTRAP.md findings
  - Primary sources preferred over secondary
  - Max 3 sources per task
  - Acquisition method specified for every source
- These are additional checks ON TOP of existing plan-checker logic
- Implemented as a validation module that the plan-checker agent loads

### Context-Budget-Aware Splitting (ORCH-07)
- Papers >30 pages get their own dedicated task
- Each task fits ~50% of subagent context (~100K tokens)
- The planner enforces this during task creation, not at runtime
- Plan-checker verifies compliance

### BOOTSTRAP.md Generation (KNOW-01)
- Generated during /grd:new-project
- Three tiers: Established / Partially Established / Not Yet Researched
- Template already exists at grd/templates/bootstrap.md
- Consulted by plan-checker to prevent re-researching known findings
- Updated as research progresses

### Claude's Discretion
- Exact agent prompt wording and structure
- How plan-checker validation rules are structured internally
- Whether to create a separate validation module or extend existing plan-checker
- How BOOTSTRAP.md is populated during new-project (agent logic)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `agents/grd-phase-researcher.md`: Base researcher agent (evicted but pattern known from upstream)
- `agents/grd-plan-checker.md`: Existing plan-checker (evicted but pattern known)
- `agents/grd-planner.md`: Existing planner (evicted but pattern known)
- `grd/templates/research-task.md`: Research task XML template (already created in Phase 1)
- `grd/templates/bootstrap.md`: BOOTSTRAP.md template (already created in Phase 1)
- `grd/bin/lib/acquire.cjs`: Source acquisition engine (Phase 3)

### Established Patterns
- Agent prompts are markdown files with YAML frontmatter (name, description, tools, color)
- Agents follow: role section, upstream_input, process steps, output format
- Plan-checker uses dimension-based verification (8 dimensions in upstream GSD)
- Zero-dependency CJS for any validation logic

### Integration Points
- Researcher agents call acquire.cjs functions during task execution
- Planner reads CONTEXT.md + RESEARCH.md and generates research task XML
- Plan-checker reads BOOTSTRAP.md + plans to validate source discipline
- new-project workflow generates BOOTSTRAP.md (Phase 5 wires this)

</code_context>

<specifics>
## Specific Ideas

- The four researcher types map to different aspects of any research question — this is how you get comprehensive coverage without redundancy
- BOOTSTRAP.md is the project's "what we already know" document — prevents wasting context re-discovering established findings
- Source discipline in the plan-checker is what ensures quality research, not just quantity

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-research-agents-and-planner*
*Context gathered: 2026-03-11*
