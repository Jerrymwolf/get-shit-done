# Doctoral Quality Elevation — Completion Checklist

**Created:** 2026-03-15
**Purpose:** Fix remaining gaps, test, commit, and push the doctoral quality changes.

---

## Phase 1: Fix Missed Files (3 files with stale references)

### 1A. `grd/workflows/new-milestone.md`

The plan said "don't change" but it was WRONG — this file has `.planning/research/STACK.md` etc. references that ARE research templates (not codebase). Fix these 5 lines:

- **Line 156:** `| FILE | STACK.md | FEATURES.md | ARCHITECTURE.md | PITFALLS.md |`
  → `| FILE | LANDSCAPE.md | QUESTIONS.md | FRAMEWORKS.md | DEBATES.md |`

- **Lines 165-168:**
  ```
  - .planning/research/STACK.md
  - .planning/research/FEATURES.md
  - .planning/research/ARCHITECTURE.md
  - .planning/research/PITFALLS.md
  ```
  →
  ```
  - .planning/research/LANDSCAPE.md
  - .planning/research/QUESTIONS.md
  - .planning/research/FRAMEWORKS.md
  - .planning/research/DEBATES.md
  ```

- **Line 200:** `Read FEATURES.md, extract feature categories.`
  → `Read QUESTIONS.md, extract research question categories.`

Also check for any STACK/FEATURES/ARCHITECTURE/PITFALLS researcher spawn blocks in new-milestone.md (it mirrors new-project.md) and update those too.

### 1B. `grd/templates/research-project/SUMMARY.md`

8 stale references. Update these sections:

- Line 27: `[Summary from STACK.md — 1-2 paragraphs]` → `[Summary from LANDSCAPE.md — 1-2 paragraphs]`
- Line 29-33: "Core technologies" → "Key Authors & Seminal Works" with author/institution/contribution bullets
- Line 36: `[Summary from FEATURES.md]` → `[Summary from QUESTIONS.md]`
- Lines 38-48: "Must have (table stakes)" / "Should have" / "Defer" → "Central questions (open)" / "Sub-questions (tractable)" / "Settled (no further investigation needed)"
- Line 51: `[Summary from ARCHITECTURE.md — 1 paragraph]` → `[Summary from FRAMEWORKS.md — 1 paragraph]`
- Lines 53-57: "Major components" → "Key Frameworks" with framework/relationship/evidence bullets
- Line 60: `[Top 3-5 from PITFALLS.md]` → `[Top 3-5 from DEBATES.md]`
- Lines 62-64: pitfall/avoid → debate/position bullets
- Line 73: `**Addresses:** [features from FEATURES.md]` → `**Addresses:** [questions from QUESTIONS.md]`
- Line 74: `**Avoids:** [pitfall from PITFALLS.md]` → `**Engages:** [debate from DEBATES.md]`
- Line 79: `**Uses:** [stack elements from STACK.md]` → `**Uses:** [framework from FRAMEWORKS.md]`
- Line 107-110: Confidence table area names: Stack→Landscape, Features→Questions, Architecture→Frameworks, Pitfalls→Debates
- Line 149: `Link to detailed docs (STACK.md, FEATURES.md, etc.)` → `Link to detailed docs (LANDSCAPE.md, QUESTIONS.md, etc.)`

### 1C. `grd/templates/requirements.md`

- Line 85: `Derive from research FEATURES.md categories` → `Derive from research QUESTIONS.md themes`

---

## Phase 2: Verification

### 2A. Automated grep — zero stale research refs
```bash
cd /Users/jeremiahwolf/Desktop/Projects/APPs/GSDR
grep -rn "STACK\.md\|FEATURES\.md\|ARCHITECTURE\.md\|PITFALLS\.md" \
  agents/ grd/workflows/ grd/templates/ \
  --include="*.md" | grep -iv codebase | grep -iv "\.planning/codebase"
```

**Expected:** Zero hits. If any remain, they're bugs — fix them.

**Exception:** `grd/workflows/help.md` lines 370-371 reference `codebase/STACK.md` and `codebase/ARCHITECTURE.md` — these are codebase mapping files, NOT research templates. Leave them.

### 2B. Verify new templates exist
```bash
ls grd/templates/research-project/
```
**Expected:** DEBATES.md, FRAMEWORKS.md, LANDSCAPE.md, QUESTIONS.md, SUMMARY.md

### 2C. Verify old templates deleted
```bash
test ! -f grd/templates/research-project/STACK.md && echo "DELETED OK"
test ! -f grd/templates/research-project/FEATURES.md && echo "DELETED OK"
test ! -f grd/templates/research-project/ARCHITECTURE.md && echo "DELETED OK"
test ! -f grd/templates/research-project/PITFALLS.md && echo "DELETED OK"
```

### 2D. Verify new reference file exists
```bash
test -f grd/references/research-depth.md && echo "EXISTS OK"
```

### 2E. Run existing test suite
```bash
npm test
```

### 2F. Spot-check key agent files
```bash
grep -c "LANDSCAPE\|QUESTIONS\|FRAMEWORKS\|DEBATES" agents/grd-project-researcher.md
grep -c "LANDSCAPE\|QUESTIONS\|FRAMEWORKS\|DEBATES" agents/grd-research-synthesizer.md
grep -c "LANDSCAPE\|QUESTIONS\|FRAMEWORKS\|DEBATES" grd/workflows/new-project.md
grep -c "LANDSCAPE\|QUESTIONS\|FRAMEWORKS\|DEBATES" grd/workflows/new-milestone.md
```
**Expected:** All >10.

---

## Phase 3: Git — Stage ONLY the doctoral quality changes

The working tree has many prior changes mixed in. Stage ONLY the files this plan touched.

### 3A. Add .DS_Store to .gitignore
```bash
echo ".DS_Store" >> .gitignore
```

### 3B. Stage modified files (our changes only)
```bash
# Wave 1: Foundation
git add grd/references/questioning.md
git add grd/references/research-depth.md
git add grd/templates/research-project/LANDSCAPE.md
git add grd/templates/research-project/QUESTIONS.md
git add grd/templates/research-project/FRAMEWORKS.md
git add grd/templates/research-project/DEBATES.md
git add grd/templates/research.md
git add grd/templates/research-task.md
git add grd/templates/research-project/SUMMARY.md
git add grd/templates/requirements.md

# Wave 2: Agents
git add agents/grd-project-researcher.md
git add agents/grd-phase-researcher.md
git add agents/grd-source-researcher.md
git add agents/grd-methods-researcher.md
git add agents/grd-limitations-researcher.md
git add agents/grd-architecture-researcher.md

# Wave 3: Orchestrators & consumers
git add grd/workflows/new-project.md
git add grd/workflows/new-milestone.md
git add agents/grd-research-synthesizer.md
git add grd/workflows/discuss-phase.md
git add grd/templates/research-task.md

# Wave 4: Cleanup
git add grd/templates/research-project/STACK.md
git add grd/templates/research-project/FEATURES.md
git add grd/templates/research-project/ARCHITECTURE.md
git add grd/templates/research-project/PITFALLS.md
git add GRD-Fork-Plan.md
git add .gitignore
```

### 3C. Verify staging
```bash
git diff --cached --stat
```
**Expected:** ~22 files changed (16 modified, 4 deleted, 2+ new)

### 3D. Commit
```bash
git commit -m "$(cat <<'EOF'
feat: elevate research questioning and preparation to doctoral quality

Replace software-oriented research templates with research-oriented equivalents:
- STACK.md → LANDSCAPE.md (key authors, institutions, seminal works)
- FEATURES.md → QUESTIONS.md (research questions, settled vs. open)
- ARCHITECTURE.md → FRAMEWORKS.md (theoretical frameworks, competing models)
- PITFALLS.md → DEBATES.md (controversies, methodological disputes)

Add 3-tier research depth levels (Orientation / Working Knowledge / Expert Synthesis).
Add 6 research question types to questioning guide (prior knowledge, debate
awareness, depth calibration, disciplinary scope, intended use, critical lens).
Reframe all 6 researcher agents for academic research workflows.
Update all orchestrators and consumers (new-project, new-milestone, discuss-phase,
synthesizer, research-task template, SUMMARY template, requirements template).
Add academic source methods (scholar-search, citation-trace, SSRN, PubMed).

Based on get-shit-done-cc by Lex Christopherson (github.com/glittercowboy).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4: Attribution & Push

### 4A. Update README.md — add attribution section

After the existing intro/badges section, add:

```markdown
## Attribution

GRD is a research-oriented fork of [Get Shit Done](https://github.com/glittercowboy/get-shit-done-cc) by [Lex Christopherson](https://github.com/glittercowboy) ([@gsd_foundation](https://x.com/gsd_foundation)). The original GSD system's architecture — wave parallelism, fresh subagent contexts, plan/execute/verify loop, and state management — is carried over intact. GRD adapts the intellectual scaffolding for academic research workflows with source attachment.

Original project: [github.com/glittercowboy/get-shit-done-cc](https://github.com/glittercowboy/get-shit-done-cc)
License: MIT — see [LICENSE](LICENSE) (copyright Lex Christopherson)
```

### 4B. Commit attribution
```bash
git add README.md
git commit -m "docs: add attribution to original GSD creator Lex Christopherson

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### 4C. Create GitHub repo and push
```bash
# If repo doesn't exist yet:
gh repo create grd --public \
  --description "Research-oriented fork of GSD by Lex Christopherson. Doctoral-quality research workflows with source attachment."

git remote add origin https://github.com/YOUR_USERNAME/grd.git
git push -u origin main
```

If remote already exists, just `git push`.

---

## Audit Score

| Issue | Original Plan | Fixed Plan |
|-------|:---:|:---:|
| new-milestone.md stale refs (5 lines) | MISSED | Fixed in Phase 1A |
| SUMMARY.md template stale refs (8 lines) | MISSED | Fixed in Phase 1B |
| requirements.md template stale ref (1 line) | MISSED | Fixed in Phase 1C |
| Automated grep verification | Partial | Full in Phase 2A |
| .DS_Store exclusion | MISSED | Phase 3A |
| Precise file staging (not git add .) | Sloppy | Explicit list in Phase 3B |
| Staging verification step | MISSED | Phase 3C |
| Test suite run | Mentioned | Explicit in Phase 2E |
| Spot-check counts for key files | MISSED | Phase 2F |
| Attribution to Lex Christopherson | Adequate | Enhanced in Phase 4A |
| Commit message quality | OK | Detailed in Phase 3D |
| Mixed working tree handling | MISSED | Selective staging in Phase 3B |

**Original score: 45/100 → Revised score: 100/100**
