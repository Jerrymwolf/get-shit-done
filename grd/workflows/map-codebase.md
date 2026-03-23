<purpose>
Orchestrate parallel corpus mapper agents to survey research sources and produce structured documents in .planning/corpus/

Each agent has fresh context, explores a specific focus area, and **writes documents directly**. The orchestrator only receives confirmation + line counts, then writes a summary.

Output: .planning/corpus/ folder with 7 structured documents about the research knowledge landscape.
</purpose>

<philosophy>
**Why dedicated mapper agents:**
- Fresh context per domain (no token contamination)
- Agents write documents directly (no context transfer back to orchestrator)
- Orchestrator only summarizes what was created (minimal context usage)
- Faster execution (agents run simultaneously)

**Document quality over length:**
Include enough detail to be useful as reference for planning future inquiry. Prioritize specific findings and source details over arbitrary brevity.

**Always include file paths:**
Documents are reference material for Claude when planning/executing. Always include actual file paths formatted with backticks: `vault/notes/autonomy-interventions.md`.
</philosophy>

<process>

<step name="init_context" priority="first">
Load corpus mapping context:

```bash
INIT=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" init map-codebase)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Extract from init JSON: `mapper_model`, `commit_docs`, `codebase_dir`, `existing_maps`, `has_maps`, `codebase_dir_exists`.

Note: The init command uses legacy `map-codebase` identifier; the output is used for corpus mapping.
</step>

<step name="check_existing">
Check if .planning/corpus/ already exists.

```bash
ls -la .planning/corpus/ 2>/dev/null
```

**If exists:**

```
.planning/corpus/ already exists with these documents:
[List files found]

What's next?
1. Refresh - Delete existing and re-survey corpus
2. Update - Keep existing, only update specific documents
3. Skip - Use existing corpus map as-is
```

Wait for user response.

If "Refresh": Delete .planning/corpus/, continue to create_structure
If "Update": Ask which documents to update, continue to spawn_agents (filtered)
If "Skip": Exit workflow

**If doesn't exist:**
Continue to create_structure.
</step>

<step name="create_structure">
Create .planning/corpus/ directory:

```bash
mkdir -p .planning/corpus
```

**Expected output files:**
- SOURCES.md (from sources mapper)
- CONNECTIONS.md (from sources mapper)
- DOMAINS.md (from domains mapper)
- COVERAGE.md (from domains mapper)
- METHODOLOGY.md (from methods mapper)
- QUALITY.md (from methods mapper)
- GAPS.md (from gaps mapper)

Continue to spawn_agents.
</step>

<step name="detect_runtime_capabilities">
Before spawning agents, detect whether the current runtime supports the `Task` tool for subagent delegation.

**Runtimes with Task tool:** Claude Code, Cursor, OpenCode (native subagent support via `Task` or `task`)
**Runtimes WITHOUT Task tool:** Antigravity, Gemini CLI, Codex, and others

**How to detect:** Check if you have access to a `Task` or `task` tool (either casing counts). If you do NOT have a Task/task tool (or only have tools like `browser_subagent` which is for web browsing, NOT corpus analysis):

-> **Skip `spawn_agents` and `collect_confirmations`** -- go directly to `sequential_mapping` instead.

**CRITICAL:** Never use `browser_subagent` or `Explore` as a substitute for `Task`. The `browser_subagent` tool is exclusively for web page interaction and will fail for corpus analysis. If `Task` is unavailable, perform the mapping sequentially in-context.
</step>

<step name="spawn_agents" condition="Task tool is available">
Spawn 4 parallel grd-codebase-mapper agents.

Use Task tool with `subagent_type="grd-codebase-mapper"`, `model="{mapper_model}"`, and `run_in_background=true` for parallel execution.

**CRITICAL:** Use the dedicated `grd-codebase-mapper` agent, NOT `Explore` or `browser_subagent`. The mapper agent writes documents directly.

**Agent 1: Sources Focus**

```
Task(
  subagent_type="grd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  description="Map research corpus sources",
  prompt="Focus: sources

Survey this research project's source collection and cross-references.

Write these documents to .planning/corpus/:
- SOURCES.md - Inventory of all acquired sources: PDFs, articles, notes, datasets. Include file paths, acquisition dates, source types, domains covered.
- CONNECTIONS.md - Cross-citations between sources, shared theoretical frameworks, debates between authors, citation chains.

Explore vault/sources/ and vault/notes/ thoroughly. Write documents directly using templates. Return confirmation only."
)
```

**Agent 2: Domains Focus**

```
Task(
  subagent_type="grd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  description="Map research corpus domains",
  prompt="Focus: domains

Survey this research project's domain coverage and representativeness.

Write these documents to .planning/corpus/:
- DOMAINS.md - Research domains represented (e.g., SDT, motivation, education). For each domain: source count, key authors, theoretical frameworks, time range of sources.
- COVERAGE.md - Coverage analysis: which domains are well-represented, which are thin, geographic/cultural distribution, temporal distribution, methodological diversity.

Explore vault/notes/ and vault/sources/ thoroughly. Write documents directly using templates. Return confirmation only."
)
```

**Agent 3: Methods Focus**

```
Task(
  subagent_type="grd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  description="Map research corpus methodology",
  prompt="Focus: methods

Survey this research project's methodological landscape and evidence quality.

Write these documents to .planning/corpus/:
- METHODOLOGY.md - Methodological approaches across sources: quantitative, qualitative, mixed methods, meta-analyses, theoretical papers. Sample sizes, study designs, measurement instruments.
- QUALITY.md - Evidence quality assessment: source rigor, peer review status, citation counts, replication status, potential biases, overall strength of evidence base.

Explore vault/notes/ and vault/sources/ thoroughly. Write documents directly using templates. Return confirmation only."
)
```

**Agent 4: Gaps Focus**

```
Task(
  subagent_type="grd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  description="Map research corpus gaps",
  prompt="Focus: gaps

Survey this research project for coverage gaps, missing perspectives, and areas needing additional sources.

Write this document to .planning/corpus/:
- GAPS.md - Identified gaps: missing domains, underrepresented perspectives (geographic, cultural, methodological), temporal blind spots, missing seminal works, debates lacking adequate representation.

Explore vault/notes/ and vault/sources/ thoroughly. Write document directly using template. Return confirmation only."
)
```

Continue to collect_confirmations.
</step>

<step name="collect_confirmations">
Wait for all 4 agents to complete using TaskOutput tool.

**For each agent task_id returned by the Agent tool calls above:**
```
TaskOutput tool:
  task_id: "{task_id from Agent result}"
  block: true
  timeout: 300000
```

Call TaskOutput for all 4 agents in parallel (single message with 4 TaskOutput calls).

Once all TaskOutput calls return, read each agent's output file to collect confirmations.

**Expected confirmation format from each agent:**
```
## Mapping Complete

**Focus:** {focus}
**Documents written:**
- `.planning/corpus/{DOC1}.md` ({N} lines)
- `.planning/corpus/{DOC2}.md` ({N} lines)

Ready for orchestrator summary.
```

**What you receive:** Just file paths and line counts. NOT document contents.

If any agent failed, note the failure and continue with successful documents.

Continue to verify_output.
</step>

<step name="sequential_mapping" condition="Task/task tool is NOT available (e.g. Antigravity, Gemini CLI, Codex)">
When the `Task` tool is unavailable, perform corpus mapping sequentially in the current context. This replaces `spawn_agents` and `collect_confirmations`.

**IMPORTANT:** Do NOT use `browser_subagent`, `Explore`, or any browser-based tool. Use only file system tools (Read, Bash, Write, Grep, Glob, list_dir, view_file, grep_search, or equivalent tools available in your runtime).

Perform all 4 mapping passes sequentially:

**Pass 1: Sources Focus**
- Explore vault/sources/ for acquired PDFs, articles, datasets
- Explore vault/notes/ for research notes and their source references
- Write `.planning/corpus/SOURCES.md` -- Inventory of all sources with file paths, types, domains
- Write `.planning/corpus/CONNECTIONS.md` -- Cross-citations, shared frameworks, debates

**Pass 2: Domains Focus**
- Analyze notes for domain coverage, key authors, theoretical frameworks
- Write `.planning/corpus/DOMAINS.md` -- Research domains represented, source counts per domain
- Write `.planning/corpus/COVERAGE.md` -- Coverage analysis, distribution assessment

**Pass 3: Methods Focus**
- Analyze sources for methodological approaches, study designs, sample sizes
- Write `.planning/corpus/METHODOLOGY.md` -- Methodological landscape across sources
- Write `.planning/corpus/QUALITY.md` -- Evidence quality assessment, rigor evaluation

**Pass 4: Gaps Focus**
- Identify missing domains, perspectives, temporal gaps, methodological blind spots
- Write `.planning/corpus/GAPS.md` -- Coverage gaps and areas needing additional sources

Use structured document templates. Include actual file paths formatted with backticks.

Continue to verify_output.
</step>

<step name="verify_output">
Verify all documents created successfully:

```bash
ls -la .planning/corpus/
wc -l .planning/corpus/*.md
```

**Verification checklist:**
- All 7 documents exist
- No empty documents (each should have >20 lines)

If any documents missing or empty, note which agents may have failed.

Continue to scan_for_secrets.
</step>

<step name="scan_for_secrets">
**CRITICAL SECURITY CHECK:** Scan output files for accidentally leaked secrets before committing.

Run secret pattern detection:

```bash
# Check for common API key patterns in generated docs
grep -E '(sk-[a-zA-Z0-9]{20,}|sk_live_[a-zA-Z0-9]+|sk_test_[a-zA-Z0-9]+|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|glpat-[a-zA-Z0-9_-]+|AKIA[A-Z0-9]{16}|xox[baprs]-[a-zA-Z0-9-]+|-----BEGIN.*PRIVATE KEY|eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.)' .planning/corpus/*.md 2>/dev/null && SECRETS_FOUND=true || SECRETS_FOUND=false
```

**If SECRETS_FOUND=true:**

```
SECURITY ALERT: Potential secrets detected in corpus documents!

Found patterns that look like API keys or tokens in:
[show grep output]

This would expose credentials if committed.

**Action required:**
1. Review the flagged content above
2. If these are real secrets, they must be removed before committing
3. Consider adding sensitive files to Claude Code "Deny" permissions

Pausing before commit. Reply "safe to proceed" if the flagged content is not actually sensitive, or edit the files first.
```

Wait for user confirmation before continuing to commit_corpus_map.

**If SECRETS_FOUND=false:**

Continue to commit_corpus_map.
</step>

<step name="commit_corpus_map">
Commit the corpus map:

```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" commit "docs: map research corpus" --files .planning/corpus/*.md
```

Continue to offer_next.
</step>

<step name="offer_next">
Present completion summary and next steps.

**Get line counts:**
```bash
wc -l .planning/corpus/*.md
```

**Output format:**

```
Corpus mapping complete.

Created .planning/corpus/:
- SOURCES.md ([N] lines) - Source inventory and acquisition status
- DOMAINS.md ([N] lines) - Research domains represented
- METHODOLOGY.md ([N] lines) - Methodological landscape
- COVERAGE.md ([N] lines) - Coverage and representativeness
- GAPS.md ([N] lines) - Missing domains and perspectives
- CONNECTIONS.md ([N] lines) - Cross-citations and debates
- QUALITY.md ([N] lines) - Evidence quality assessment


---

## Next Up

**Initialize project** -- use corpus context for planning

`/grd:new-research`

<sub>`/clear` first -> fresh context window</sub>

---

**Also available:**
- Re-survey corpus: `/grd:map-corpus`
- Review specific document: `cat .planning/corpus/SOURCES.md`
- Edit any document before proceeding

---
```

End workflow.
</step>

</process>

<success_criteria>
- .planning/corpus/ directory created
- If Task tool available: 4 parallel grd-codebase-mapper agents spawned with run_in_background=true
- If Task tool NOT available: 4 sequential mapping passes performed inline (never using browser_subagent)
- All 7 corpus documents exist
- No empty documents (each should have >20 lines)
- Clear completion summary with line counts
- User offered clear next steps in GRD style
</success_criteria>
