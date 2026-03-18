<purpose>
Analyze freeform text from the user and route to the most appropriate GRD command. This is a dispatcher — it never does the work itself. Match user intent to the best command, confirm the routing, and hand off.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>

<step name="validate">
**Check for input.**

If `$ARGUMENTS` is empty, ask via AskUserQuestion:

```
What would you like to do? Describe the task, bug, or idea and I'll route it to the right GRD command.
```

Wait for response before continuing.
</step>

<step name="check_project">
**Check if project exists.**

```bash
INIT=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" state load 2>/dev/null)
```

Track whether `.planning/` exists — some routes require it, others don't.
</step>

<step name="route">
**Match intent to command.**

Evaluate `$ARGUMENTS` against these routing rules. Apply the **first matching** rule:

| If the text describes... | Route to | Why |
|--------------------------|----------|-----|
| Starting a new project, "set up", "initialize" | `/grd:new-project` | Needs full project initialization |
| Mapping or analyzing an existing codebase | `/grd:map-codebase` | Codebase discovery |
| A bug, error, crash, failure, or something broken | `/grd:debug` | Needs systematic investigation |
| Exploring, researching, comparing, or "how does X work" | `/grd:research-phase` | Domain research before planning |
| Discussing vision, "how should X look", brainstorming | `/grd:discuss-phase` | Needs context gathering |
| A complex task: refactoring, migration, multi-file architecture, system redesign | `/grd:add-phase` | Needs a full phase with plan/build cycle |
| Planning a specific phase or "plan phase N" | `/grd:plan-phase` | Direct planning request |
| Executing a phase or "build phase N", "run phase N" | `/grd:execute-phase` | Direct execution request |
| Running all remaining phases automatically | `/grd:autonomous` | Full autonomous execution |
| A review or quality concern about existing work | `/grd:verify-work` | Needs verification |
| Checking progress, status, "where am I" | `/grd:progress` | Status check |
| Resuming work, "pick up where I left off" | `/grd:resume-work` | Session restoration |
| A note, idea, or "remember to..." | `/grd:add-todo` | Capture for later |
| Adding tests, "write tests", "test coverage" | `/grd:add-tests` | Test generation |
| Completing a milestone, shipping, releasing | `/grd:complete-milestone` | Milestone lifecycle |
| A specific, actionable, small task (add feature, fix typo, update config) | `/grd:quick` | Self-contained, single executor |

**Requires `.planning/` directory:** All routes except `/grd:new-project`, `/grd:map-codebase`, `/grd:help`, and `/grd:join-discord`. If the project doesn't exist and the route requires it, suggest `/grd:new-project` first.

**Ambiguity handling:** If the text could reasonably match multiple routes, ask the user via AskUserQuestion with the top 2-3 options. For example:

```
"Refactor the authentication system" could be:
1. /grd:add-phase — Full planning cycle (recommended for multi-file refactors)
2. /grd:quick — Quick execution (if scope is small and clear)

Which approach fits better?
```
</step>

<step name="display">
**Show the routing decision.**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GRD ► ROUTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Input:** {first 80 chars of $ARGUMENTS}
**Routing to:** {chosen command}
**Reason:** {one-line explanation}
```
</step>

<step name="dispatch">
**Invoke the chosen command.**

Run the selected `/grd:*` command, passing `$ARGUMENTS` as args.

If the chosen command expects a phase number and one wasn't provided in the text, extract it from context or ask via AskUserQuestion.

After invoking the command, stop. The dispatched command handles everything from here.
</step>

</process>

<success_criteria>
- [ ] Input validated (not empty)
- [ ] Intent matched to exactly one GRD command
- [ ] Ambiguity resolved via user question (if needed)
- [ ] Project existence checked for routes that require it
- [ ] Routing decision displayed before dispatch
- [ ] Command invoked with appropriate arguments
- [ ] No work done directly — dispatcher only
</success_criteria>
