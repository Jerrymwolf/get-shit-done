<purpose>
Display comprehensive project statistics including phases, plans, requirements, git metrics, and timeline.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>

<step name="gather_stats">
Gather project statistics:

```bash
STATS=$(node "$GSD_TOOLS" stats json)
if [[ "$STATS" == @file:* ]]; then STATS=$(cat "${STATS#@file:}"); fi
```

Extract fields from JSON: `milestone_version`, `milestone_name`, `phases`, `phases_completed`, `phases_total`, `total_plans`, `total_summaries`, `percent`, `plan_percent`, `requirements_total`, `requirements_complete`, `git_commits`, `git_first_commit_date`, `last_activity`.
</step>

<step name="gather_research_stats">
Gather research-specific statistics:

```bash
# Count research notes (project-scoped and global)
NOTE_COUNT=$(ls .planning/notes/*.md 2>/dev/null | wc -l | tr -d ' ')
PROMOTED_COUNT=$(grep -l 'promoted: true' .planning/notes/*.md 2>/dev/null | wc -l | tr -d ' ')

# Count unresolved source gaps from RESEARCH.md files
SOURCE_GAP_COUNT=$(grep -c 'status: unresolved\|gap.*unresolved\|source.*missing' .planning/phases/*/RESEARCH.md .planning/phases/*/*-RESEARCH.md 2>/dev/null | awk -F: '{s+=$NF} END {print s+0}')
```

Use these values in the Research section of the output.
</step>

<step name="present_stats">
Present to the user with this format:

```
# 📊 Project Statistics — {milestone_version} {milestone_name}

## Progress
[████████░░] X/Y phases (Z%)

## Plans
X/Y plans complete (Z%)

## Phases
| Phase | Name | Plans | Completed | Status |
|-------|------|-------|-----------|--------|
| ...   | ...  | ...   | ...       | ...    |

## Requirements
✅ X/Y requirements complete

## Git
- **Commits:** N
- **Started:** YYYY-MM-DD
- **Last activity:** YYYY-MM-DD

## Research
- **Notes:** N captured ({M} promoted)
- **Source gaps:** N unresolved

## Timeline
- **Project age:** N days
```

If no `.planning/` directory exists, inform the user to run `/grd:new-research` first.
</step>

</process>

<success_criteria>
- [ ] Statistics gathered from project state
- [ ] Results formatted clearly
- [ ] Displayed to user
</success_criteria>
