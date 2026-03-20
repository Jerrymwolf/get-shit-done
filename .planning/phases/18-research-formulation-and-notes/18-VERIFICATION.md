---
phase: 18-research-formulation-and-notes
verified: 2026-03-19T00:00:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
---

# Phase 18: Research Formulation and Notes Verification Report

**Phase Goal:** Reorient project setup and note-capture from PM vocabulary to research-native workflows
**Verified:** 2026-03-19
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | PROJECT.md template serves as a research prospectus with scholarly sections | VERIFIED | `grd/templates/project.md` contains Problem Statement (line 10), Significance (15), Epistemological Stance (20), Review Type (25), Researcher Tier (30), Research Questions (35), Methodological Decisions (67). No "What This Is", "Core Value", or "Key Decisions" remain. |
| 2  | new-research scoping questions ask researcher tier, review type, and epistemological stance BEFORE deep questioning | VERIFIED | `## 3a. Research Scoping` at line 205; `## 3. Deep Questioning` at line 265. 3a precedes 3. All 3 config dimensions present with AskUserQuestion calls. |
| 3  | Config values are written to config.json immediately after scoping answers | VERIFIED | Lines 257-259: `config-set researcher_tier`, `config-set review_type`, `config-set epistemological_stance` all present and written in the same block immediately following question answers. |
| 4  | 4 researcher templates renamed to scholarly names | VERIFIED | `grd/templates/research-project/` contains METHODOLOGICAL-LANDSCAPE.md, PRIOR-FINDINGS.md, THEORETICAL-FRAMEWORK.md, LIMITATIONS-DEBATES.md. Old files LANDSCAPE.md, QUESTIONS.md, FRAMEWORKS.md, DEBATES.md deleted. |
| 5  | Researcher prompts in new-research.md use scholarly missions with citations | VERIFIED | METHODOLOGICAL-LANDSCAPE referenced 5x, PRIOR-FINDINGS 6x, THEORETICAL-FRAMEWORK 5x, LIMITATIONS-DEBATES 5x in `grd/workflows/new-research.md`. Zero residual `research/LANDSCAPE.md`, `research/QUESTIONS.md`, `research/FRAMEWORKS.md`, `research/DEBATES.md` references. |
| 6  | BOOTSTRAP.md template uses scholarly vocabulary: Established Knowledge, Contested Claims, Knowledge Gaps | VERIFIED | `grd/templates/bootstrap.md` title is "State-of-the-Field Assessment". Contains "## Established Knowledge", "## Contested Claims", "## Knowledge Gaps", cites "Arksey & O'Malley, 2005". Zero "Already Established", "Partially Established", "Not Yet Researched" remaining. |
| 7  | REQUIREMENTS.md template uses research objectives vocabulary while keeping REQ-ID format | VERIFIED | Contains "# Research Objectives", "## Primary Research Objectives", "## Secondary Research Objectives", "Research Focus:". Zero "## v1 Requirements" or "## v2 Requirements". REQ-ID pattern preserved. |
| 8  | ROADMAP.md template uses "Inquiry" instead of "Phase" and "Research Design / Study Plan" framing | VERIFIED | Contains "# Research Design", "## Lines of Inquiry", "## Inquiry Details", "### Inquiry 1:". Zero "## Phases" section headers or "### Phase 1:" patterns. |
| 9  | Research note template has Evidence Quality section between Analysis and Implications, plus new frontmatter fields | VERIFIED | `## Analysis` at line 18, `## Evidence Quality` at line 24, `## Implications for [Study]` at line 55. Frontmatter includes `inquiry:`, `era:`, `status: draft`, `review_type:`. Contains CASP/GRADE reference and all 3 format variants. |
| 10 | scope-inquiry supports --prd flag for research brief parsing | VERIFIED | `grd/workflows/scope-inquiry.md` line 408: `--prd` flag documented with inclusion criteria, search boundaries, disciplinary scope, research questions parsing. Line 423: "Write CONTEXT.md WITHOUT user interaction". Express path at line 117 references "research brief". |

**Score:** 10/10 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `grd/templates/project.md` | Research prospectus template | VERIFIED | 7 scholarly sections, no PM vocabulary, Research focus/Current inquiry in state_reference |
| `grd/workflows/new-research.md` | Scoping questions in new-research flow | VERIFIED | Section 3a at line 205 with all 3 config writes, "What is your research problem?" in Step 3, GRD banners |
| `grd/templates/research-project/METHODOLOGICAL-LANDSCAPE.md` | Methodological Landscape template | VERIFIED | Contains PRISMA-P, Cochrane Handbook citation. Has Research Methods Inventory, Validated Instruments sections. |
| `grd/templates/research-project/PRIOR-FINDINGS.md` | Prior Findings & Key Themes template | VERIFIED | Contains Braun & Clarke (2006) citation. Thematic Clusters, Convergent/Divergent Findings sections. |
| `grd/templates/research-project/THEORETICAL-FRAMEWORK.md` | Theoretical Framework Survey template | VERIFIED | Contains Ravitch & Riggan (2017), Repko & Szostak (2021) citations. |
| `grd/templates/research-project/LIMITATIONS-DEBATES.md` | Limitations Critiques & Debates template | VERIFIED | Contains CASP UK (2024), Alvesson & Sandberg (2011) citations. Includes Replication Failures section. |
| `grd/templates/bootstrap.md` | State-of-the-field assessment template | VERIFIED | Title, 3 scholarly sections, Arksey & O'Malley citation. Zero PM vocabulary. |
| `grd/templates/requirements.md` | Research objectives template | VERIFIED | Research Objectives title, Primary/Secondary framing, Research Focus, REQ-ID format preserved. |
| `grd/templates/roadmap.md` | Research design / study plan template | VERIFIED | Research Design title, Lines of Inquiry, Inquiry Details, Inquiry N numbering. |
| `grd/templates/research-note.md` | Extended research note template | VERIFIED | Evidence Quality between Analysis and Implications. 4 new frontmatter fields (inquiry, era, status, review_type). CASP/GRADE. 3 format variants. |
| `grd/workflows/scope-inquiry.md` | scope-inquiry with --prd flag | VERIFIED | --prd documented with research-adapted parsing. WITHOUT user interaction. Express path updated. |
| `test/template-vocabulary.test.cjs` | Template vocabulary tests (FORM-03 to FORM-06) | VERIFIED | Exists. 22 tests, 0 failures. |
| `test/research-note-template.test.cjs` | Research note structure tests (NOTE-01 to NOTE-03) | VERIFIED | Exists. 12 tests, 0 failures. |
| `test/scope-inquiry-flags.test.cjs` | Scope inquiry flag tests (TRAP-01) | VERIFIED | Exists. 8 tests, 0 failures. |
| `test/researcher-recharter.test.cjs` | Researcher recharter tests (FORM-02) | VERIFIED | Exists. 16 tests, 0 failures. |

**Old templates confirmed deleted:**
- `grd/templates/research-project/LANDSCAPE.md` — does not exist
- `grd/templates/research-project/QUESTIONS.md` — does not exist
- `grd/templates/research-project/FRAMEWORKS.md` — does not exist
- `grd/templates/research-project/DEBATES.md` — does not exist

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `grd/workflows/new-research.md` | `grd/templates/project.md` | Step 4 writes PROJECT.md using template | VERIFIED | "Synthesize into `.planning/PROJECT.md` using the research prospectus template from `templates/project.md`" at line 325 |
| `grd/workflows/new-research.md` | `grd-tools.cjs config-set` | Scoping questions write tier/type/stance to config | VERIFIED | Lines 257-259 contain all 3 `config-set` calls immediately after scoping question block |
| `grd/workflows/new-research.md` | `grd/templates/research-project/METHODOLOGICAL-LANDSCAPE.md` | Task prompt references template path | VERIFIED | "METHODOLOGICAL-LANDSCAPE" appears 5 times; pattern confirmed present |
| `grd/workflows/new-research.md` | `.planning/research/METHODOLOGICAL-LANDSCAPE.md` | Task prompt output path | VERIFIED | Zero residual old output paths; all 4 new paths present |
| `grd/workflows/new-research.md` synthesizer | All 4 new research output paths | files_to_read in synthesizer Task | VERIFIED | All 4 names appear 5+ times across template paths and output paths |
| `grd/templates/research-note.md` | `grd/workflows/scope-inquiry.md` | conduct-inquiry executor uses research note template | PARTIAL | research-note.md updated with new structure. conduct-inquiry.md does not contain a direct path reference to the template file — template is applied by naming convention in the note workflow. Functionally correct; not a blocker. |
| `grd/workflows/scope-inquiry.md` | `--prd argument parsing` | ARGUMENTS regex parsing | VERIFIED | `--prd` parsed at line 408 with all research-adapted sections (inclusion criteria, search boundaries, disciplinary scope, research questions) |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| FORM-01 | 18-01 | new-research scoping includes researcher tier, review type, epistemological positioning, and topic/significance/audience questions | VERIFIED | Section 3a (lines 205-263) adds 3 config questions before Step 3. Step 3 "What is your research problem?" + research-oriented follow-ups cover topic/significance/audience. |
| FORM-02 | 18-02, 18-04 | 4 parallel researchers renamed and rechartered | VERIFIED | New templates exist with scholarly citations. new-research.md has 5+ references to each new name, zero to old names. Verified by researcher-recharter.test.cjs (16 tests pass). |
| FORM-03 | 18-01, 18-04 | PROJECT.md serves as research prospectus | VERIFIED | 7 scholarly sections verified in file. Tested by template-vocabulary.test.cjs (8 tests for FORM-03). |
| FORM-04 | 18-03, 18-04 | BOOTSTRAP.md as state-of-the-field assessment | VERIFIED | Title, 3 scholarly sections, Arksey citation, zero PM vocabulary. Tested by template-vocabulary.test.cjs. |
| FORM-05 | 18-03, 18-04 | REQUIREMENTS.md as research objectives / specific aims | VERIFIED | Research Objectives title, Primary/Secondary sections, REQ-ID preserved. Tested by template-vocabulary.test.cjs. |
| FORM-06 | 18-03, 18-04 | ROADMAP.md as research design / study plan | VERIFIED | Research Design title, Lines of Inquiry, Inquiry Details, Inquiry N numbering. Tested by template-vocabulary.test.cjs. |
| NOTE-01 | 18-04 | Research note includes Evidence Quality section scaled by review type | VERIFIED | Section exists at line 24, between Analysis (18) and Implications (55). 3 format variants present. CASP/GRADE cited. Tested by research-note-template.test.cjs. |
| NOTE-02 | 18-04 | Research note frontmatter includes era field | VERIFIED | `era: [foundational | developmental | contemporary | emerging | null]` at line 5. All 4 options present. Tested by research-note-template.test.cjs. |
| NOTE-03 | 18-04 | Research note frontmatter updated with review_type, inquiry, era, status | VERIFIED | All 4 fields present in frontmatter (lines 4-7). Tested by research-note-template.test.cjs. |
| TRAP-01 | 18-04 | --prd flag for scope-inquiry; --batch N flag | VERIFIED | --prd at line 408 with research-adapted parsing. --batch already existed. Express path updated to reference "research brief". Tested by scope-inquiry-flags.test.cjs (8 tests pass). |

**No orphaned requirements.** REQUIREMENTS.md shows TRAP-02, TRAP-03, TRAP-04 deferred to Phases 19, 20, 22. TRAP-05 (Phase 16) was already complete before Phase 18.

---

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| (none) | — | — | — |

No TODO, FIXME, placeholder, or stub patterns found in any Phase 18 modified files.

---

### Pre-existing Test Failure (Not Phase 18)

The full test suite reports **1 failure** in `test/namespace.test.cjs`: "no old long path in .planning/ tree" fails because `.planning/phases/17-namespace-migration/17-VERIFICATION.md` contains an old namespace reference. This is a Phase 17 artifact documented in `deferred-items.md`. It is not caused by Phase 18 changes and was pre-existing before this phase.

All **4 Phase 18 test suites pass** with zero failures:
- `test/template-vocabulary.test.cjs`: 22 tests, 0 failures
- `test/research-note-template.test.cjs`: 12 tests, 0 failures
- `test/scope-inquiry-flags.test.cjs`: 8 tests, 0 failures
- `test/researcher-recharter.test.cjs`: 16 tests, 0 failures

---

### Human Verification Required

None. All Phase 18 changes are markdown template and workflow document edits verifiable programmatically. The automated test suite (58 Phase 18 tests) covers all requirement acceptance criteria.

---

### Summary

Phase 18 fully achieves its goal. All PM vocabulary has been replaced with research-native language across every affected file:

- The project setup chain (PROJECT.md, BOOTSTRAP.md, REQUIREMENTS.md, ROADMAP.md) now speaks research vocabulary: prospectus, state-of-the-field, objectives, design, inquiries.
- The new-research workflow asks the 3 config-writing scoping questions (researcher tier, review type, epistemological stance) before deep questioning, and uses "What is your research problem?" as the entry prompt.
- The 4 parallel researchers have been rechartered with scholarly missions, citations from canonical methodological literature, and renamed files. All references in new-research.md updated; zero residual old names remain.
- Research notes now include Evidence Quality (scaled by review type with CASP/GRADE reference) and 4 new frontmatter fields.
- scope-inquiry now supports --prd for importing research briefs without interactive scoping.
- All changes are protected by 58 automated tests across 4 dedicated test files.

All 10 requirement IDs (FORM-01 through FORM-06, NOTE-01 through NOTE-03, TRAP-01) are satisfied.

---

_Verified: 2026-03-19_
_Verifier: Claude (gsd-verifier)_
