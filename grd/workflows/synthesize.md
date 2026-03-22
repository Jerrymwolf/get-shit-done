<purpose>
Transform verified research notes into structured scholarship through thematic synthesis, theoretical integration, gap analysis, and argument construction. Generates a synthesis plan and delegates to execute-phase machinery.

This workflow orchestrates Stage 6 of the research lifecycle. It validates readiness, presents the TRAP-04 synthesis scope gate, generates a 4-wave synthesis plan respecting the dependency chain (themes < framework < gaps < argument per D-07), and delegates execution to subagents using the same wave-based parallel execution pattern as conduct-inquiry.md.
</purpose>

<required_reading>
Read STATE.md and config before any operation.
Read ROADMAP.md to identify investigation phases and their verification status.
</required_reading>

<process>

<step name="initialize" priority="first">
Load execution context:

```bash
INIT=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" init execute-phase "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Read config to determine synthesis settings:

```bash
CONFIG=$(cat .planning/config.json 2>/dev/null)
```

Extract from config:
- `config.workflow.synthesis` -- controls whether synthesis is enabled
- `vault_path` -- where research notes live and synthesis outputs go
- `review_type` -- determines smart defaults for synthesis
- `researcher_tier` -- for tier-adapted communication

**If `config.workflow.synthesis` is `false`:**

<researcher_tier>
<tier-guided>
Synthesis is currently disabled for this review type. This means your verified research notes will be kept as-is without being combined into themes, frameworks, or an executive summary. If you'd like to enable synthesis, you can change this setting.

To enable synthesis: `/grd:settings` and set `workflow.synthesis` to `required` or `recommended`.
</tier-guided>
<tier-standard>
Synthesis disabled for this review type. Enable via `/grd:settings` (set `workflow.synthesis` to `required` or `recommended`).
</tier-standard>
<tier-expert>
Synthesis disabled. `/grd:settings` to enable.
</tier-expert>
</researcher_tier>

Exit workflow.

**Parse `$ARGUMENTS` for flags:**
- `--partial` -- synthesize from whatever is verified so far (default requires all investigation phases verified)
- `--skip-themes` -- skip thematic synthesis (requires existing 00-THEMES.md)
- `--skip-framework` -- skip framework integration
- `--skip-gaps` -- skip gap analysis
</step>

<step name="validate_readiness">
Verify that investigation phases have been completed and verified before synthesis can proceed.

**1. Find all investigation phases in ROADMAP.md:**
- Identify phases with plans that are NOT synthesis phases
- These are the investigation phases whose output feeds synthesis

**2. For each investigation phase, check verification status:**

| Status | Action |
|--------|--------|
| `passed` | OK -- phase evidence is verified |
| `human_needed` | OK -- researcher chose to proceed past human_needed items (D-05: respect that choice) |
| `gaps_found` | BLOCK -- unless `--partial` flag is set |
| Missing verification | BLOCK -- unless `--partial` flag is set |

**3. If blocked (without `--partial`):**

<researcher_tier>
<tier-guided>
Some of your investigation phases haven't been fully verified yet. Verification ensures your research notes meet quality standards before synthesis combines them into themes and arguments. Here's what needs attention:

- Unverified phase: Run `/grd:verify-inquiry {phase}` to check the evidence quality
- No notes found: Run `/grd:conduct-inquiry` first to gather research evidence
- Gaps found: Run `/grd:plan-inquiry {phase} --gaps` to address identified gaps

You can also use `--partial` to synthesize from whatever is verified so far: `/grd:synthesize --partial`
</tier-guided>
<tier-standard>
Investigation phases not fully verified. Specific next actions (D-08):

- Unverified phase: `/grd:verify-inquiry {phase}`
- No notes found: `/grd:conduct-inquiry` first
- Gaps found: `/grd:plan-inquiry {phase} --gaps`

Use `--partial` to synthesize from verified phases only.
</tier-standard>
<tier-expert>
Blocked: unverified phases. `/grd:verify-inquiry {phase}` or `--partial` to proceed.
</tier-expert>
</researcher_tier>

Exit workflow.

**4. Collect all verified research notes from vault:**
- Walk `{vault_path}/` directory structure
- Collect all `.md` files NOT in `-sources/` subdirectories and NOT `00-` prefixed
- These are the notes to pass to synthesis agents

**5. If zero notes found:**

```
Error: No verified research notes found. Run `/grd:conduct-inquiry` first.
```

Exit workflow.

<researcher_tier>
<tier-guided>
Found {N} verified research notes across {M} investigation phases. These notes will be the input for synthesis -- each synthesis activity will read all of them to identify patterns, test frameworks, find gaps, and construct arguments.
</tier-guided>
<tier-standard>
Found {N} verified notes across {M} phases. Proceeding to synthesis scope selection.
</tier-standard>
<tier-expert>
{N} notes, {M} phases verified.
</tier-expert>
</researcher_tier>
</step>

<step name="trap_04_synthesis_scope">
**TRAP-04: Synthesis Scope Interactive Gate**

Present the researcher with synthesis scope options before proceeding.

```
AskUserQuestion(
  header: "Synthesis Scope",
  question: "How would you like to synthesize your research?",
  options: [
    "Full synthesis (all 4 activities)" -- "Themes, framework, gaps, and argument construction. Recommended for systematic, integrative, and critical reviews.",
    "Themes + argument only" -- "Skip framework integration and gap analysis. Produces thematic summary and executive summary.",
    "Skip synthesis" -- "Keep verified notes without synthesis. You can run /grd:synthesize later."
  ]
)
```

**Process response:**

- **"Skip synthesis":** Exit with message:

<researcher_tier>
<tier-guided>
Synthesis skipped. Your verified research notes are preserved as-is. When you're ready to synthesize them into themes and arguments, run `/grd:synthesize`.
</tier-guided>
<tier-standard>
Synthesis skipped. Run `/grd:synthesize` when ready.
</tier-standard>
<tier-expert>
Skipped. `/grd:synthesize` when ready.
</tier-expert>
</researcher_tier>

- **"Themes + argument only":** Set internal flags:
  - `skip_framework = true`
  - `skip_gaps = true`

- **"Full synthesis (all 4 activities)":** Proceed with all activities enabled.
</step>

<step name="validate_skip_flags">
Process and validate skip flags from both CLI arguments and TRAP-04 selection.

**Combine sources:**
- CLI flags: `--skip-themes`, `--skip-framework`, `--skip-gaps`
- TRAP-04 selection: "Themes + argument only" sets skip_framework and skip_gaps

**Validate skip flag dependencies:**

1. **If `--skip-themes`:**
   - Check if `{vault_path}/00-THEMES.md` already exists
   - If NOT exists: error "Cannot skip themes -- 00-THEMES.md does not exist and is required by framework, gaps, and argument."
   - If exists: OK, themes will be read from existing file

2. **If `--skip-framework`:**
   - Check if `{vault_path}/00-FRAMEWORK.md` already exists OR if framework is not needed downstream
   - If gaps are NOT skipped and 00-FRAMEWORK.md does NOT exist: error "Cannot skip framework -- 00-FRAMEWORK.md does not exist and is required by gap analysis (D-07)."
   - If gaps ARE skipped or 00-FRAMEWORK.md exists: OK

3. **If `--skip-gaps`:**
   - No dependency issue -- argument can work without GAPS.md, it just omits that section
   - OK to skip unconditionally

**Report active activities:**

<researcher_tier>
<tier-guided>
Here's what synthesis will do:

{For each active activity:}
- **Thematic Synthesis:** Identify patterns and themes across your {N} research notes
- **Framework Integration:** Test evidence against your theoretical framework
- **Gap Analysis:** Find what's missing, contradicted, or assumed without justification
- **Argument Construction:** Assemble everything into your {deliverable_format} deliverable

{For each skipped activity:}
- ~~Framework Integration~~ -- skipped (using existing 00-FRAMEWORK.md / not required)
</tier-guided>
<tier-standard>
Active: {list of active activities}. Skipped: {list of skipped activities}.
</tier-standard>
<tier-expert>
Active: {active}. Skipped: {skipped}.
</tier-expert>
</researcher_tier>
</step>

<step name="validate_activity_prerequisites">
**Per-activity prerequisite validation (D-07).**

The full dependency chain defines what each activity needs:

**Themes:** At least 1 verified note (already checked in validate_readiness). No additional prerequisites.

**Framework:** Requires:
- `00-THEMES.md` (will exist after wave 1, or already exists if --skip-themes)
- Theoretical Framework Survey note from Stage 1 researchers -- search for notes produced by `grd-architecture-researcher` via inquiry subdirectory naming or note content
- If Theoretical Framework Survey is missing and framework is not skipped: warn "Missing theoretical framework survey. Check Stage 1 researcher output or use --skip-framework."

**Gaps:** Requires (per D-07: "Gaps requires THEMES.md + FRAMEWORK.md"):
- `00-THEMES.md` (will exist after wave 1)
- `00-FRAMEWORK.md` (will exist after wave 2, or already exists if pre-existing)
- If `--skip-framework` and no existing `00-FRAMEWORK.md`: error "Cannot run gap analysis without FRAMEWORK.md. Use --skip-gaps or generate framework first."

**Argument:** Requires at minimum:
- `00-THEMES.md` (will exist after wave 1)
- `00-FRAMEWORK.md` is optional (used if exists, omitted section if not)
- `00-GAPS.md` is optional (used if exists, omitted section if not)
- `PROJECT.md` for `deliverable_format` field

All prerequisite checks validate the dependency chain will be satisfied at execution time, accounting for what earlier waves will produce.
</step>

<step name="generate_synthesis_plan">
Generate a synthesis PLAN.md organized in **4 waves** per D-07 dependency chain.

The generated plan follows the standard PLAN.md format and is placed at `.planning/phases/synthesis/synthesis-PLAN.md` (or uses the study's existing planning structure).

**Wave 1** (unless --skip-themes):
```yaml
- task: Thematic Synthesis
  wave: 1
  agent_type: grd-thematic-synthesizer
  agent_prompt: grd/agents/grd-thematic-synthesizer.md
  input_files:
    - {all verified note paths from validate_readiness}
  output: "{vault_path}/00-THEMES.md"
  template: grd/templates/themes.md
```

**Wave 2** (unless --skip-framework or "Themes + argument only"):
```yaml
- task: Theoretical Integration
  wave: 2
  agent_type: grd-framework-integrator
  agent_prompt: grd/agents/grd-framework-integrator.md
  input_files:
    - "{vault_path}/00-THEMES.md"
    - "{theoretical_framework_survey_note_path}"
    - {all verified note paths}
  output: "{vault_path}/00-FRAMEWORK.md"
  template: grd/templates/framework.md
```

**Wave 3** (unless --skip-gaps or "Themes + argument only"):
```yaml
- task: Gap Analysis
  wave: 3
  agent_type: grd-gap-analyzer
  agent_prompt: grd/agents/grd-gap-analyzer.md
  input_files:
    - "{vault_path}/00-THEMES.md"
    - "{vault_path}/00-FRAMEWORK.md"
    - {all verified note paths}
  output: "{vault_path}/00-GAPS.md"
  template: grd/templates/gaps.md
```

**Wave 4** (always runs if synthesis is enabled):
```yaml
- task: Argument Construction
  wave: 4
  agent_type: grd-argument-constructor
  agent_prompt: grd/agents/grd-argument-constructor.md
  input_files:
    - "{vault_path}/00-THEMES.md"
    - "{vault_path}/00-FRAMEWORK.md"  # if exists
    - "{vault_path}/00-GAPS.md"       # if exists
    - ".planning/PROJECT.md"          # for deliverable_format
  output: "{vault_path}/00-Executive-Summary.md"
  template: grd/templates/executive-summary.md
```

The dependency chain enforced by wave ordering:
- Wave 1 (themes) must complete before Wave 2 (framework) starts
- Wave 2 (framework) must complete before Wave 3 (gaps) starts -- D-07: gaps requires FRAMEWORK.md
- Wave 3 (gaps) must complete before Wave 4 (argument) starts
- This is a strict 4-wave sequence, not 3 waves with parallel framework+gaps

<researcher_tier>
<tier-guided>
Generated a synthesis plan with {N} activities across {M} waves. Each wave must complete before the next begins because later activities build on earlier outputs:

1. **Themes** (Wave 1) -- identifies patterns across all your notes
2. **Framework** (Wave 2) -- tests those patterns against theory
3. **Gaps** (Wave 3) -- finds what's missing using themes AND framework
4. **Argument** (Wave 4) -- assembles everything into your final deliverable

Starting execution...
</tier-guided>
<tier-standard>
Synthesis plan: {N} activities, {M} waves. Dependency chain: themes -> framework -> gaps -> argument.
</tier-standard>
<tier-expert>
{N} activities, {M} waves. Executing.
</tier-expert>
</researcher_tier>
</step>

<step name="execute_synthesis">
Delegate the generated plan to execute-phase machinery.

**For each wave in sequence:**

1. **Spawn subagent** for the wave's task:
   ```
   Task(
     subagent_type="{agent_type from plan}",
     model="{model from model-profiles.cjs for agent_type}",
     prompt="
       <objective>
       Execute {activity_name} synthesis activity.
       </objective>

       <execution_context>
       @{agent_prompt_path}
       </execution_context>

       <files_to_read>
       {input_files from plan -- all verified note paths plus any prerequisite synthesis outputs}
       </files_to_read>

       <output>
       Write output to: {output_path from plan}
       Use template: {template_path from plan}
       </output>

       <researcher_tier>
       {Current researcher_tier block from config}
       </researcher_tier>
     "
   )
   ```

2. **Wait for subagent to complete.**

3. **Verify output exists:**
   ```bash
   test -f "{output_path}" && echo "PASS" || echo "FAIL"
   ```

4. **Git commit after each wave:**
   ```bash
   git add "{output_path}"
   git commit -m "feat(synthesis): complete {activity_name}

   - Output: {output_path}
   - Agent: {agent_type}
   - Input notes: {N}"
   ```

5. **Proceed to next wave.**

If any wave fails, report the failure and stop:

<researcher_tier>
<tier-guided>
The {activity_name} activity encountered an error. This means later activities that depend on its output cannot proceed. You can:

- Review the error and retry: `/grd:synthesize --skip-{previous_activities}`
- Check the agent output for partial results in `{output_path}`
</tier-guided>
<tier-standard>
{activity_name} failed. Downstream activities blocked. Retry with `--skip-{previous}` flags or check `{output_path}`.
</tier-standard>
<tier-expert>
{activity_name} failed. Check {output_path}. Retry with skip flags.
</tier-expert>
</researcher_tier>
</step>

<step name="report_completion">
Report synthesis results after all waves complete.

<researcher_tier>
<tier-guided>
Your research synthesis is complete. Here's what was produced:

- **Themes:** `{vault_path}/00-THEMES.md` -- {N} themes identified across your research notes. This maps the major patterns in your evidence.
- **Framework:** `{vault_path}/00-FRAMEWORK.md` -- Your theoretical framework tested against the evidence, with modifications where the data diverged from theory.
- **Gaps:** `{vault_path}/00-GAPS.md` -- {M} gaps identified, including both missing evidence and challenged assumptions.
- **Executive Summary:** `{vault_path}/00-Executive-Summary.md` -- Your complete {deliverable_format} deliverable, ready for review and refinement.

All synthesis outputs use inline citations (`[Note: {note-name}]`) so you can trace every claim back to its source evidence.

**Next step:** `/grd:complete-study` -- validates all outputs and archives the study.
</tier-guided>
<tier-standard>
Synthesis complete:
- Themes: `{vault_path}/00-THEMES.md` ({N} themes identified)
- Framework: `{vault_path}/00-FRAMEWORK.md` (if generated)
- Gaps: `{vault_path}/00-GAPS.md` ({M} gaps identified) (if generated)
- Executive Summary: `{vault_path}/00-Executive-Summary.md`

Next: `/grd:complete-study`
</tier-standard>
<tier-expert>
Done. Outputs: 00-THEMES.md, 00-FRAMEWORK.md, 00-GAPS.md, 00-Executive-Summary.md. `/grd:complete-study`.
</tier-expert>
</researcher_tier>
</step>

</process>

<error_handling>
- **Config missing:** Use smart defaults from config.cjs based on review_type
- **Vault path not set:** Error with "Set vault_path in config: `/grd:settings`"
- **Agent spawn failure:** Report which activity failed, suggest retry with skip flags for completed activities
- **Partial synthesis:** If --partial and some phases unverified, note which phases were excluded in the completion report
</error_handling>

<context_efficiency>
Orchestrator stays lean -- each synthesis agent gets a fresh context with only its required input files. The orchestrator coordinates wave execution and validates outputs, matching the conduct-inquiry.md pattern.
</context_efficiency>
