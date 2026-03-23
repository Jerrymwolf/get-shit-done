<purpose>
Orchestrate parallel corpus mapper agents to analyze research sources and produce structured documents in .planning/codebase/

Each agent has fresh context, explores a specific focus area, and **writes documents directly**. The orchestrator only receives confirmation + line counts, then writes a summary.

Output: .planning/codebase/ folder with 7 structured documents about the research corpus and knowledge landscape.
</purpose>

<philosophy>
**Why dedicated mapper agents:**
- Fresh context per domain (no token contamination)
- Agents write documents directly (no context transfer back to orchestrator)
- Orchestrator only summarizes what was created (minimal context usage)
- Faster execution (agents run simultaneously)

**Document quality over length:**
Include enough detail to be useful as reference. Prioritize practical examples (especially source references and analytical patterns) over arbitrary brevity.

**Always include source references:**
Documents are reference material for Claude when planning/executing. Always include actual file paths formatted with backticks: `vault/notes/methodology-review.md`.
</philosophy>

<process>

<step name="init_context" priority="first">
Load corpus mapping context:

```bash
INIT=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" init map-codebase)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Extract from init JSON: `mapper_model`, `commit_docs`, `codebase_dir`, `existing_maps`, `has_maps`, `codebase_dir_exists`.
</step>

<step name="check_existing">
Check if .planning/codebase/ already exists using `has_maps` from init context.

If `codebase_dir_exists` is true:
```bash
ls -la .planning/codebase/
```

**If exists:**

```
.planning/codebase/ already exists with these documents:
[List files found]

What's next?
1. Refresh - Delete existing and resurvey corpus
2. Update - Keep existing, only update specific documents
3. Skip - Use existing corpus survey as-is
```

Wait for user response.

If "Refresh": Delete .planning/codebase/, continue to create_structure
If "Update": Ask which documents to update, continue to spawn_agents (filtered)
If "Skip": Exit workflow

**If doesn't exist:**
Continue to create_structure.
</step>

<step name="create_structure">
Create .planning/codebase/ directory:

```bash
mkdir -p .planning/codebase
```

**Expected output files:**
- STACK.md (from sources mapper — sources and databases)
- INTEGRATIONS.md (from sources mapper — external connections and cross-references)
- ARCHITECTURE.md (from framework mapper — theoretical framework and analytical structure)
- STRUCTURE.md (from framework mapper — corpus organization and taxonomy)
- CONVENTIONS.md (from methodology mapper — methodological conventions and standards)
- TESTING.md (from methodology mapper — verification criteria and evidence thresholds)
- CONCERNS.md (from gaps mapper — gaps, limitations, and areas of uncertainty)

Continue to spawn_agents.
</step>

<step name="detect_runtime_capabilities">
Before spawning agents, detect whether the current runtime supports the `Task` tool for subagent delegation.

**Runtimes with Task tool:** Claude Code, Cursor, OpenCode (native subagent support via `Task` or `task`)
**Runtimes WITHOUT Task tool:** Antigravity, Gemini CLI, Codex, and others

**How to detect:** Check if you have access to a `Task` or `task` tool (either casing counts). If you do NOT have a Task/task tool (or only have tools like `browser_subagent` which is for web browsing, NOT corpus analysis):

> **Skip `spawn_agents` and `collect_confirmations`** — go directly to `sequential_mapping` instead.

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
  description="Survey corpus sources and databases",
  prompt="Focus: sources

Analyze this research project for source materials, databases, reference management tools, and dependencies.

Write these documents to .planning/codebase/:
- STACK.md - Sources, databases, reference tools, acquired materials, formats
- INTEGRATIONS.md - External connections, cross-references, citation networks, related projects

Explore thoroughly. Write documents directly using templates. Return confirmation only."
)
```

**Agent 2: Framework Focus**

```
Task(
  subagent_type="grd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  description="Survey theoretical framework and analytical structure",
  prompt="Focus: framework

Analyze this research project for theoretical framework, analytical structure, and knowledge organization.

Write these documents to .planning/codebase/:
- ARCHITECTURE.md - Theoretical framework, analytical layers, argument structure, key concepts
- STRUCTURE.md - Corpus organization, taxonomy, domain categorization, naming conventions

Explore thoroughly. Write documents directly using templates. Return confirmation only."
)
```

**Agent 3: Methodology Focus**

```
Task(
  subagent_type="grd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  description="Survey methodological conventions and evidence standards",
  prompt="Focus: methodology

Analyze this research project for methodological conventions, citation standards, and evidence thresholds.

Write these documents to .planning/codebase/:
- CONVENTIONS.md - Methodological conventions, citation standards, analytical patterns, evidence handling
- TESTING.md - Verification criteria, evidence thresholds, source validation standards

Explore thoroughly. Write documents directly using templates. Return confirmation only."
)
```

**Agent 4: Gaps Focus**

```
Task(
  subagent_type="grd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  description="Survey research gaps and limitations",
  prompt="Focus: gaps

Analyze this research project for knowledge gaps, limitations, conflicting evidence, and areas of uncertainty.

Write this document to .planning/codebase/:
- CONCERNS.md - Research gaps, limitations, conflicting evidence, areas of uncertainty, unresolved questions

Explore thoroughly. Write document directly using template. Return confirmation only."
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
- `.planning/codebase/{DOC1}.md` ({N} lines)
- `.planning/codebase/{DOC2}.md` ({N} lines)

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
- Explore research notes, source folders, reference files, acquired materials, citation databases
- Write `.planning/codebase/STACK.md` — Sources, databases, reference tools, acquired materials, formats
- Write `.planning/codebase/INTEGRATIONS.md` — External connections, cross-references, citation networks, related projects

**Pass 2: Framework Focus**
- Explore theoretical framework, analytical structure, argument flow, key concepts
- Write `.planning/codebase/ARCHITECTURE.md` — Theoretical framework, analytical layers, argument structure, key concepts
- Write `.planning/codebase/STRUCTURE.md` — Corpus organization, taxonomy, domain categorization, naming conventions

**Pass 3: Methodology Focus**
- Explore methodological conventions, citation standards, evidence handling patterns
- Write `.planning/codebase/CONVENTIONS.md` — Methodological conventions, citation standards, analytical patterns, evidence handling
- Write `.planning/codebase/TESTING.md` — Verification criteria, evidence thresholds, source validation standards

**Pass 4: Gaps Focus**
- Explore knowledge gaps, limitations, conflicting evidence, unresolved questions
- Write `.planning/codebase/CONCERNS.md` — Research gaps, limitations, conflicting evidence, areas of uncertainty

Use the same document templates as the `grd-codebase-mapper` agent. Include actual file paths formatted with backticks.

Continue to verify_output.
</step>

<step name="verify_output">
Verify all documents created successfully:

```bash
ls -la .planning/codebase/
wc -l .planning/codebase/*.md
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
grep -E '(sk-[a-zA-Z0-9]{20,}|sk_live_[a-zA-Z0-9]+|sk_test_[a-zA-Z0-9]+|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|glpat-[a-zA-Z0-9_-]+|AKIA[A-Z0-9]{16}|xox[baprs]-[a-zA-Z0-9-]+|-----BEGIN.*PRIVATE KEY|eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.)' .planning/codebase/*.md 2>/dev/null && SECRETS_FOUND=true || SECRETS_FOUND=false
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

Wait for user confirmation before continuing to commit_codebase_map.

**If SECRETS_FOUND=false:**

Continue to commit_codebase_map.
</step>

<step name="commit_codebase_map">
Commit the corpus survey:

```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" commit "docs: survey research corpus" --files .planning/codebase/*.md
```

Continue to offer_next.
</step>

<step name="offer_next">
Present completion summary and next steps.

**Get line counts:**
```bash
wc -l .planning/codebase/*.md
```

**Output format:**

```
Corpus survey complete.

Created .planning/codebase/:
- STACK.md ([N] lines) - Sources and databases
- ARCHITECTURE.md ([N] lines) - Theoretical framework and analytical structure
- STRUCTURE.md ([N] lines) - Corpus organization and taxonomy
- CONVENTIONS.md ([N] lines) - Methodological conventions and standards
- TESTING.md ([N] lines) - Verification criteria and evidence thresholds
- INTEGRATIONS.md ([N] lines) - External connections and cross-references
- CONCERNS.md ([N] lines) - Gaps, limitations, and areas of uncertainty


---

## Next Up

**Initialize project** — use corpus context for planning

`/grd:new-research`

<sub>`/clear` first -> fresh context window</sub>

---

**Also available:**
- Re-run survey: `/grd:map-corpus`
- Review specific file: `cat .planning/codebase/STACK.md`
- Edit any document before proceeding

---
```

End workflow.
</step>

</process>

<success_criteria>
- .planning/codebase/ directory created
- If Task tool available: 4 parallel grd-codebase-mapper agents spawned with run_in_background=true
- If Task tool NOT available: 4 sequential mapping passes performed inline (never using browser_subagent)
- All 7 corpus analysis documents exist
- No empty documents (each should have >20 lines)
- Clear completion summary with line counts
- User offered clear next steps in GRD style
</success_criteria>
