<purpose>
Create a clean research package by filtering out .planning/ artifacts. The export contains only
research deliverables -- notes, sources, synthesis documents, and SOURCE-LOGs -- ready for
sharing with collaborators or submission to a repository.

Uses selective copying to rebuild a clean directory structure without GRD planning metadata.
</purpose>

<process>

<step name="detect_state">
Parse `$ARGUMENTS` for target directory (default: `./export/`).

```bash
TARGET_DIR=${1:-./export}
PROJECT_ROOT=$(pwd)
```

Check preconditions:
- Must have research notes in the vault or project directory
- Must have at least one completed phase with SUMMARY.md

```bash
NOTES=$(find . -name "*.md" -path "*/vault/*" -o -name "*-sources" -type d | wc -l)
if [ "$NOTES" = "0" ]; then
  echo "No research notes found -- nothing to export."
  exit 0
fi
```

Display:
```
-------------------------------------------
 GRD > CLEAN RESEARCH EXPORT
-------------------------------------------

Project: {PROJECT_NAME}
Target: {TARGET_DIR}
```
</step>

<step name="analyze_content">
Classify project contents:

```bash
# Scan for research artifacts vs planning artifacts
find . -type f -name "*.md" -o -name "*.pdf" -o -name "*.html" -o -name "*.txt" | sort
```

Classify:
- **Research artifacts**: Notes, synthesis documents, SOURCE-LOGs, acquired sources -> INCLUDE
- **Planning artifacts**: .planning/ directory contents (STATE.md, PLAN.md, SUMMARY.md, CONTEXT.md, ROADMAP.md, REQUIREMENTS.md) -> EXCLUDE
- **GRD internals**: grd/, commands/, agents/, bin/, hooks/, scripts/, test/ -> EXCLUDE
- **Project metadata**: README.md, package.json, LICENSE -> INCLUDE (user-facing)

Display analysis:
```
Research notes to include: {N}
Source folders to include: {N}
Synthesis documents: {N}
Planning artifacts to exclude: {N}
GRD internals to exclude: {N}
```
</step>

<step name="create_clean_export">
```bash
mkdir -p "${TARGET_DIR}"
```

Copy research artifacts in order:

1. **Research notes** -- all markdown files from the vault path
2. **Source folders** -- all `-sources/` directories with their contents
3. **SOURCE-LOGs** -- preserved alongside their notes
4. **Synthesis documents** -- any synthesis or manuscript files
5. **Project README** -- if it describes the research (not GRD tooling)

```bash
# Copy vault contents (research notes + sources)
if [ -d "vault" ]; then
  cp -r vault/* "${TARGET_DIR}/"
fi

# Remove any .planning/ artifacts that may have been nested
rm -rf "${TARGET_DIR}/.planning" 2>/dev/null
```
</step>

<step name="generate_manifest">
Create a MANIFEST.md in the export directory:

```markdown
# Research Export Manifest

Exported: {date}
Project: {name}

## Contents

### Research Notes
{list of notes with their topics}

### Sources
{count of source files by type: PDF, HTML, MD, etc.}

### Synthesis
{list of synthesis documents}

## Source Coverage
{summary from SOURCE-LOGs: acquired vs unavailable}
```

Write to `${TARGET_DIR}/MANIFEST.md`.
</step>

<step name="verify">
```bash
# Verify no .planning/ files in export
PLANNING_FILES=$(find "${TARGET_DIR}" -path "*/.planning/*" | wc -l)
TOTAL_FILES=$(find "${TARGET_DIR}" -type f | wc -l)
NOTE_COUNT=$(find "${TARGET_DIR}" -name "*.md" -not -name "MANIFEST.md" | wc -l)
SOURCE_COUNT=$(find "${TARGET_DIR}" -type d -name "*-sources" | wc -l)
```

Display results:
```
Clean export created: {TARGET_DIR}

Research notes: {NOTE_COUNT}
Source folders: {SOURCE_COUNT}
Total files: {TOTAL_FILES}
Planning artifacts: {PLANNING_FILES} (should be 0)

The export contains only research deliverables --
ready for sharing or submission.

Or use /grd:export-research for format-specific packaging.
```
</step>

</process>

<success_criteria>
- [ ] Export directory created
- [ ] Research notes and sources copied
- [ ] No .planning/ artifacts in export
- [ ] MANIFEST.md generated with contents summary
- [ ] User shown export statistics and location
</success_criteria>
