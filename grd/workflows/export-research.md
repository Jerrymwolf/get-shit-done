<purpose>
Package completed research for delivery. Validates research completeness (notes with sources, synthesis documents), then assembles deliverables in the chosen export format: Obsidian vault structure, manuscript assembly, or shareable archive. Closes the scope -> conduct -> verify -> export loop.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>

<step name="initialize">
Parse arguments and load project state:

```bash
INIT=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" init phase-op "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse from init JSON: `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `padded_phase`, `commit_docs`.

Also load config:
```bash
CONFIG=$(node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" state load)
```

Extract: `vault_path` (target for Obsidian export).
</step>

<step name="preflight_checks">
Verify the research is ready to export:

1. **Verification passed?**
   ```bash
   VERIFICATION=$(cat ${PHASE_DIR}/*-VERIFICATION.md 2>/dev/null)
   ```
   Check for `status: passed` or `status: human_needed` (with human approval).
   If no VERIFICATION.md or status is `gaps_found`: warn and ask user to confirm.

2. **Research notes exist?**
   ```bash
   NOTES=$(find ${PHASE_DIR} -name "*-SUMMARY.md" | wc -l)
   ```
   If no SUMMARY.md files: error -- "No completed research found. Run /grd:conduct-inquiry first."

3. **Source completeness?**
   Scan for SOURCE-LOG.md files and check for `status: unavailable` entries.
   If sources are missing: warn with count and ask user to confirm.

4. **Synthesis complete?**
   Check for synthesis documents in the vault path or phase directory.
   If no synthesis: warn -- "No synthesis document found. Consider running /grd:synthesize first."
</step>

<step name="choose_export_format">
Ask user to select the export format:

```
AskUserQuestion:
  question: "How would you like to package this research?"
  options:
    - label: "Obsidian Vault"
      description: "Copy notes and sources to vault_path with proper linking and frontmatter"
    - label: "Manuscript Assembly"
      description: "Assemble findings into a single document with inline citations"
    - label: "Shareable Archive"
      description: "Create a zip/folder with notes, sources, and SOURCE-LOGs for sharing"
    - label: "All formats"
      description: "Generate all three export formats"
```
</step>

<step name="export_obsidian">
**If Obsidian Vault selected:**

1. Resolve vault path from config (`vault_path`) or ask user.
2. For each research note in the phase:
   - Copy note to vault with Obsidian-compatible frontmatter
   - Copy sibling `-sources/` folder contents to vault
   - Convert internal links to Obsidian `[[wikilink]]` format
   - Preserve SOURCE-LOG.md alongside each note
3. Create an index note linking all exported notes.

```bash
EXPORT_DIR="${VAULT_PATH}/Research/${PHASE_NAME}"
mkdir -p "${EXPORT_DIR}"
```

Report: "Exported {N} notes with {M} sources to {EXPORT_DIR}"
</step>

<step name="export_manuscript">
**If Manuscript Assembly selected:**

1. Collect all research notes in execution order (by plan number).
2. Extract findings sections from each note.
3. Assemble into a single markdown document:
   - Title and metadata header
   - Combined findings organized by theme
   - Consolidated references section from all SOURCE-LOGs
   - Methodology appendix from note frontmatter
4. Write to `{PHASE_DIR}/{PADDED_PHASE}-MANUSCRIPT.md`.

Report: "Assembled manuscript from {N} notes — {path}"
</step>

<step name="export_archive">
**If Shareable Archive selected:**

1. Create export directory: `{PHASE_DIR}/export/`
2. Copy all research notes (without .planning/ metadata).
3. Copy all `-sources/` folders.
4. Copy all SOURCE-LOG.md files.
5. Copy synthesis documents if they exist.
6. Generate a README.md with:
   - Research question / study goal
   - List of included notes
   - Source inventory
   - How to navigate the archive

Report: "Created shareable archive at {path} — {N} notes, {M} sources"
</step>

<step name="track_export">
Update STATE.md to reflect the export:

```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" state record-session \
  --stopped-at "Phase ${PHASE_NUMBER} research exported — ${FORMAT}"
```

If `commit_docs` is true:
```bash
node "/Users/jeremiahwolf/.claude/grd/bin/grd-tools.cjs" commit "docs(${padded_phase}): export research — ${FORMAT}" --files .planning/STATE.md
```
</step>

<step name="report">
```
-------------------------------------------------------------------

## Research Exported

Phase {N}: {Name}
Format: {format}
Notes: {count}
Sources: {count}
Synthesis: {yes/no}

Next steps:
- Review exported materials
- /grd:complete-study (if last phase in milestone)
- /grd:progress (to see what's next)

-------------------------------------------------------------------
```
</step>

</process>

<offer_next>
After exporting:

- /grd:complete-study -- if all phases in milestone are done
- /grd:progress -- see overall project state
- /grd:output-review -- audit quality of exported deliverables
</offer_next>

<success_criteria>
- [ ] Preflight checks passed (verification, notes exist, source completeness)
- [ ] Export format selected
- [ ] Research packaged in chosen format
- [ ] STATE.md updated with export status
- [ ] User shown export results and next steps
</success_criteria>
