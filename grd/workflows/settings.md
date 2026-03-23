<purpose>
Interactive configuration of GSD workflow agents (research, plan_check, verifier) and model profile selection via multi-question prompt. Updates .planning/config.json with user preferences. Optionally saves settings as global defaults (~/.gsd/defaults.json) for future projects.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>

<step name="ensure_and_load_config">
Ensure config exists and load current state:

```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" config-ensure-section
INIT=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Creates `.planning/config.json` with defaults if missing and loads current config values.
</step>

<step name="read_current">
```bash
cat .planning/config.json
```

Parse current values (default to `true` if not present):
- `workflow.research` — spawn researcher during plan-inquiry
- `workflow.plan_check` — spawn plan checker during plan-inquiry
- `workflow.verifier` — spawn verifier during conduct-inquiry
- `workflow.nyquist_validation` — validation architecture research during plan-inquiry (default: true if absent)
- `workflow.ui_phase` — generate UI-SPEC.md design contracts for frontend phases (default: true if absent)
- `workflow.ui_safety_gate` — prompt to run /grd:ui-phase before planning frontend phases (default: true if absent)
- `workflow.critical_appraisal` — critical appraisal requirement level (default per review_type smart defaults)
- `workflow.temporal_positioning` — temporal positioning requirement level (default per review_type smart defaults)
- `workflow.synthesis` — synthesis requirement level (default per review_type smart defaults)
- `model_profile` — which model each agent uses (default: `balanced`)
- `review_type` — study review type: systematic/scoping/integrative/critical/narrative (default: `narrative`)
- `git.branching_strategy` — branching approach (default: `"none"`)
</step>

<step name="present_settings">
Use AskUserQuestion with current values pre-selected:

```
AskUserQuestion([
  {
    question: "Which model profile for agents?",
    header: "Model",
    multiSelect: false,
    options: [
      { label: "Quality", description: "Opus everywhere except verification (highest cost)" },
      { label: "Balanced (Recommended)", description: "Opus for planning, Sonnet for research/execution/verification" },
      { label: "Budget", description: "Sonnet for writing, Haiku for research/verification (lowest cost)" },
      { label: "Inherit", description: "Use current session model for all agents (best for OpenCode /model)" }
    ]
  },
  {
    question: "Review type for this study?",
    header: "Review Type",
    multiSelect: false,
    options: [
      { label: "Systematic", description: "Exhaustive search, formal appraisal (highest rigor)" },
      { label: "Scoping", description: "Map breadth of evidence, charting approach" },
      { label: "Integrative", description: "Combine diverse methods, proportional appraisal" },
      { label: "Critical", description: "Evaluate and challenge, proportional appraisal" },
      { label: "Narrative", description: "Adequate coverage, optional appraisal (most flexible)" }
    ]
  },
  {
    question: "Spawn Plan Researcher? (researches domain before planning)",
    header: "Research",
    multiSelect: false,
    options: [
      { label: "Yes", description: "Research phase goals before planning" },
      { label: "No", description: "Skip research, plan directly" }
    ]
  },
  {
    question: "Spawn Plan Checker? (verifies plans before execution)",
    header: "Plan Check",
    multiSelect: false,
    options: [
      { label: "Yes", description: "Verify plans meet phase goals" },
      { label: "No", description: "Skip plan verification" }
    ]
  },
  {
    question: "Spawn Execution Verifier? (verifies phase completion)",
    header: "Verifier",
    multiSelect: false,
    options: [
      { label: "Yes", description: "Verify must-haves after execution" },
      { label: "No", description: "Skip post-execution verification" }
    ]
  },
  {
    question: "Auto-advance pipeline? (discuss → plan → execute automatically)",
    header: "Auto",
    multiSelect: false,
    options: [
      { label: "No (Recommended)", description: "Manual /clear + paste between stages" },
      { label: "Yes", description: "Chain stages via Task() subagents (same isolation)" }
    ]
  },
  {
    question: "Enable Nyquist Validation? (researches test coverage during planning)",
    header: "Nyquist",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Research automated test coverage during plan-inquiry. Adds validation requirements to plans. Blocks approval if tasks lack automated verify." },
      { label: "No", description: "Skip validation research. Good for rapid prototyping or no-test phases." }
    ]
  },
  // Note: Nyquist validation depends on research output. If research is disabled,
  // plan-inquiry automatically skips Nyquist steps (no RESEARCH.md to extract from).
  {
    question: "Enable UI Phase? (generates UI-SPEC.md design contracts for frontend phases)",
    header: "UI Phase",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Generate UI design contracts before planning frontend phases. Locks spacing, typography, color, and copywriting." },
      { label: "No", description: "Skip UI-SPEC generation. Good for backend-only projects or API phases." }
    ]
  },
  {
    question: "Enable UI Safety Gate? (prompts to run /grd:ui-phase before planning frontend phases)",
    header: "UI Gate",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "plan-inquiry asks to run /grd:ui-phase first when frontend indicators detected." },
      { label: "No", description: "No prompt — plan-inquiry proceeds without UI-SPEC check." }
    ]
  },
  {
    question: "Git branching strategy?",
    header: "Branching",
    multiSelect: false,
    options: [
      { label: "None (Recommended)", description: "Commit directly to current branch" },
      { label: "Per Phase", description: "Create branch for each phase (gsd/phase-{N}-{name})" },
      { label: "Per Milestone", description: "Create branch for entire milestone (gsd/{version}-{name})" }
    ]
  },
  {
    question: "Enable context window warnings? (injects advisory messages when context is getting full)",
    header: "Ctx Warnings",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Warn when context usage exceeds 65%. Helps avoid losing work." },
      { label: "No", description: "Disable warnings. Allows Claude to reach auto-compact naturally. Good for long unattended runs." }
    ]
  }
])
```
</step>

<step name="update_config">
Merge new settings into existing config.json:

```json
{
  ...existing_config,
  "model_profile": "quality" | "balanced" | "budget" | "inherit",
  "workflow": {
    "research": true/false,
    "plan_check": true/false,
    "verifier": true/false,
    "auto_advance": true/false,
    "nyquist_validation": true/false,
    "ui_phase": true/false,
    "ui_safety_gate": true/false,
    "critical_appraisal": <string from smart defaults>,
    "temporal_positioning": <string from smart defaults>,
    "synthesis": <string from smart defaults>
  },
  "git": {
    "branching_strategy": "none" | "phase" | "milestone"
  },
  "hooks": {
    "context_warnings": true/false
  }
}
```

**Review type change handling:**

If the user selected a different review_type than the current value:

1. Read current review_type from config (default: `narrative` if missing).

2. Determine direction using REVIEW_TYPE_ORDER: `['systematic', 'scoping', 'integrative', 'critical', 'narrative']`.
   Use `canDowngrade(currentType, selectedType)` -- returns true only if selectedIdx > currentIdx (moving toward less rigor).

3. **If UPGRADE attempt** (selectedIdx < currentIdx):
   Display error:
   ```
   Cannot upgrade review type mid-study. Start a new study with /grd:new-research for higher rigor.
   ```
   Do NOT change review_type. Keep current value.

4. **If valid DOWNGRADE** (canDowngrade returns true):
   Show confirmation with exact toggle changes using SMART_DEFAULTS lookup:
   ```
   Downgrading from {current} to {selected} will change:
     - critical_appraisal: {current_value} -> {new_smart_default}
     - temporal_positioning: {current_value} -> {new_smart_default}
     - synthesis: {current_value} -> {new_smart_default}
     - plan_check: {current_value} -> {new_smart_default}
   Existing notes are unaffected. Only future enforcement changes.
   Confirm? [Yes/No]
   ```

   On confirm: Apply smart defaults for the new type using `applySmartDefaults(config, newType)`:
   - Set `review_type` to selected value
   - Reset `workflow.critical_appraisal`, `workflow.temporal_positioning`, `workflow.synthesis`, `workflow.plan_check` to `SMART_DEFAULTS[selectedType]` values
   - Write all changes to config.json using config-set commands:
     ```bash
     node "...grd-tools.cjs" config-set review_type {selectedType}
     node "...grd-tools.cjs" config-set workflow.critical_appraisal {newValue}
     node "...grd-tools.cjs" config-set workflow.temporal_positioning {newValue}
     node "...grd-tools.cjs" config-set workflow.synthesis {newValue}
     node "...grd-tools.cjs" config-set workflow.plan_check {newValue}
     ```

   On reject: Keep current review_type, no changes.

5. **If same type selected**: No change needed, skip downgrade logic.

Write updated config to `.planning/config.json`.
</step>

<step name="save_as_defaults">
Ask whether to save these settings as global defaults for future projects:

```
AskUserQuestion([
  {
    question: "Save these as default settings for all new projects?",
    header: "Defaults",
    multiSelect: false,
    options: [
      { label: "Yes", description: "New projects start with these settings (saved to ~/.gsd/defaults.json)" },
      { label: "No", description: "Only apply to this project" }
    ]
  }
])
```

If "Yes": write the same config object (minus project-specific fields like `brave_search`) to `~/.gsd/defaults.json`:

```bash
mkdir -p ~/.gsd
```

Write `~/.gsd/defaults.json` with:
```json
{
  "mode": <current>,
  "granularity": <current>,
  "model_profile": <current>,
  "commit_docs": <current>,
  "parallelization": <current>,
  "branching_strategy": <current>,
  "workflow": {
    "research": <current>,
    "plan_check": <current>,
    "verifier": <current>,
    "auto_advance": <current>,
    "nyquist_validation": <current>,
    "ui_phase": <current>,
    "ui_safety_gate": <current>
  }
}
```
</step>

<step name="confirm">
Display:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► SETTINGS UPDATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Setting              | Value |
|----------------------|-------|
| Model Profile        | {quality/balanced/budget/inherit} |
| Review Type          | {systematic/scoping/integrative/critical/narrative} |
| Plan Researcher      | {On/Off} |
| Plan Checker         | {On/Off} |
| Execution Verifier   | {On/Off} |
| Auto-Advance         | {On/Off} |
| Nyquist Validation   | {On/Off} |
| UI Phase             | {On/Off} |
| UI Safety Gate       | {On/Off} |
| Git Branching        | {None/Per Phase/Per Milestone} |
| Context Warnings     | {On/Off} |
| Saved as Defaults    | {Yes/No} |

These settings apply to future /grd:plan-inquiry and /grd:conduct-inquiry runs.

Quick commands:
- /grd:settings — includes review type downgrade
- /grd:set-profile <profile> — switch model profile
- /grd:plan-inquiry --research — force research
- /grd:plan-inquiry --skip-research — skip research
- /grd:plan-inquiry --skip-verify — skip plan check
```
</step>

</process>

<success_criteria>
- [ ] Current config read
- [ ] User presented with 10 settings (profile + review type + 7 workflow toggles + git branching)
- [ ] Config updated with model_profile, workflow, and git sections
- [ ] User offered to save as global defaults (~/.gsd/defaults.json)
- [ ] Changes confirmed to user
</success_criteria>
