# GRD v1.2 — Research Reorientation

**GRD: Get Research Done**

*A fork of [GSD](https://github.com/glittercowboy/get-shit-done-cc) (Get ~~Shit~~ Research Done) that replaces code commits with defense-quality research notes.*

---

## What I Want Built

Transform GSD-R into GRD — a research tool that uses project management discipline, not a project management tool that produces research notes. The PM backbone (atomic deliverables, verification gates, traceability, wave parallelism) stays intact. Every user-facing surface — commands, prompts, templates, agent behavior, feedback messages — shifts to research-native vocabulary grounded in established scholarly methodology.

The target audience is anyone conducting serious research: graduate students, doctoral candidates, post-doctoral researchers, coders investigating a domain, or genuinely curious people. All users produce defense-quality output regardless of experience level. The tool adapts its communication style — not its rigor — to the researcher's background.

The namespace is `/grd:`.

---

## Project Context

GSD-R (now becoming GRD) is a fork of GSD that replaces GSD's atomic unit (git commit with source code) with a research note with its source material physically attached (PDFs, scraped markdown, screenshots in a sibling -sources/ folder). v1.0 and v1.1 shipped the core infrastructure: source acquisition protocol, two-tier verification, 17 agent prompts, 36 commands, 41 workflows, 164 passing tests, zero external dependencies.

The current workflow still speaks project management: projects, phases, requirements, execution, milestones. Researchers think in different terms: research questions, lines of inquiry, specific aims, investigation, synthesis. The mapping between PM and research is nearly 1:1 — the vocabulary and defaults need to shift, and several critical research activities (synthesis, critical appraisal, epistemological positioning, review type enforcement) are missing entirely.

### Key Design Constraint

GSD's PM discipline is the backbone, not the enemy. Good research follows project management principles — scoping before committing, planning before executing, verifying before concluding. The goal is synergy: PM rigor serving scholarly methodology, not the other way around.

---

## The Research Workflow (7 Stages)

### Stage 1: Research Formulation — `/grd:new-research`

Replaces `/gsd-r:new-project`. This is where the researcher defines their study.

**Scoping questions must include:**

1. **Researcher experience tier** — Determines how GRD communicates throughout the entire workflow:
   - **Guided** — Curious non-academics, undergrads, early graduate students. Plain language, explains why each step matters, offers examples, defines terms inline. ("Now we'll map out what's already known so you don't waste time re-discovering it.")
   - **Standard** — Mid-career graduate students, doctoral candidates. Academic vocabulary with brief context. ("Conduct your state-of-the-field assessment. This prevents redundant investigation and surfaces contested findings.")
   - **Expert** — Post-docs, faculty, established researchers. Precise terminology, no explanation, maximum efficiency. ("State-of-the-field assessment. PRISMA-ScR protocol applies.")

   This setting affects agent prompts, templates, verification feedback, and error messages. It does NOT affect the underlying rigor — every tier produces defense-quality output. The difference is how much the tool teaches along the way. Stored in config.json as `researcher_tier`. Can be changed mid-study via `/grd:settings`.

2. **Review type selection** — What kind of review is this? The answer shapes rigor requirements enforced by the plan-checker at every downstream stage:
   - **Systematic review** — PRISMA 2020 protocol. Pre-defined search strategy, explicit inclusion/exclusion criteria, critical appraisal of every included study, reproducible methodology. Highest rigor. (Page et al., 2021; Cochrane Handbook.)
   - **Scoping review** — Arksey & O'Malley framework (refined by Levac et al., 2010). Maps the extent and nature of evidence on a topic. Broader inclusion, charting rather than appraising. Reported using PRISMA-ScR.
   - **Integrative review** — Whittemore & Knafl (2005). Combines diverse methodologies (experimental and non-experimental, empirical and theoretical). Five stages: problem identification, literature search, data evaluation, data analysis, presentation.
   - **Critical review** — Evaluates the quality and contribution of existing literature with the explicit aim of identifying conceptual contributions, limitations, and new directions. Less protocol-bound than systematic, more evaluative than narrative.
   - **Narrative review** — Broadest, most flexible. Suitable for exploring a wide topic, establishing context, or introducing a field. No strict protocol, but GRD still enforces source attachment and traceability.

   Stored in config.json as `review_type`. The plan-checker validates against the selected type's requirements. **Can be downgraded mid-study** (e.g., systematic → scoping) via `/grd:settings` — rigor requirements relax, no work is lost.

3. **Epistemological positioning** — What paradigm governs this inquiry?
   - **Positivist / Post-positivist** — Objective reality, testable hypotheses, quantitative evidence prioritized. (Guba & Lincoln, 1994.)
   - **Constructivist / Interpretivist** — Multiple realities, meaning is co-constructed, qualitative evidence valued. (Creswell & Creswell, 2018.)
   - **Pragmatist** — Whatever works; mixed methods; problem-centered. (Creswell & Creswell, 2018.)
   - **Critical** — Knowledge is shaped by power structures; research aims at transformation. (Guba & Lincoln, 1994.)

   This shapes what counts as valid evidence and how the critical appraisal step operates. Stored in config.json as `epistemological_stance`. **Skippable** — defaults to Pragmatist if the researcher opts out. At Guided tier, the question is framed as: "How do you think about evidence? (a) I trust numbers and measurable data, (b) I think meaning depends on context and perspective, (c) I'll use whatever evidence helps answer the question, (d) I think research should challenge power structures."

4. **Standard scoping** — Topic, significance, audience, existing knowledge, constraints (same as current questioning phase but reframed in research terms).

**Artifacts produced:**

| Artifact | Research Function |
|---|---|
| PROJECT.md | **Research prospectus** — The governing document. Contains: problem statement, significance, epistemological stance, review type, researcher tier, research questions, constraints, target audience. |
| BOOTSTRAP.md | **State-of-the-field assessment** — What is established, what is contested, what is unexplored. Three-tier structure unchanged. Equivalent to a preliminary scoping review (Arksey & O'Malley, 2005). |
| `.planning/research/` | **Preliminary literature survey** — Output of 4 parallel researchers (see below). |
| REQUIREMENTS.md | **Research objectives / specific aims** — Each REQ-ID is a research objective with acceptance criteria defining what "answered" means. |
| ROADMAP.md | **Research design / study plan** — Phases organized by line of inquiry, not administrative convenience. Natural structure for a literature review: (1) Foundational works, (2) Theoretical development, (3) Contemporary empirical evidence, (4) Cross-disciplinary integration, (5) Synthesis and gap analysis. |

**The four parallel researchers — revised:**

| Current | Revised | Scholarly Function |
|---|---|---|
| Stack | **Methodological Landscape** | What methods, instruments, datasets, and research designs have been used to study this topic? What validated scales or interview protocols exist? (Corresponds to the methods assessment in a systematic review protocol — PRISMA-P; Cochrane Handbook Ch. 3.) |
| Features | **Prior Findings & Key Themes** | What has the field established empirically? What are the recurring themes and convergent findings across studies? (Thematic analysis principles — Braun & Clarke, 2006.) |
| Architecture | **Theoretical Framework Survey** | What theories organize this domain? How do major constructs relate? Where do theoretical traditions diverge? For interdisciplinary topics: what does each discipline contribute? (Conceptual framework construction — Ravitch & Riggan, 2017. Interdisciplinary integration — Repko & Szostak, 2021.) |
| Pitfalls | **Limitations, Critiques & Debates** | Where do prominent scholars disagree? What methodological weaknesses recur? What assumptions remain untested? What findings have failed to replicate? (Critical appraisal — CASP UK, 2024. Problematization — Alvesson & Sandberg, 2011.) |

---

### Stage 2: Inquiry Scoping — `/grd:scope-inquiry N`

Replaces `/gsd-r:discuss-phase N`.

**Scholarly activity:** Define the boundaries of a specific line of inquiry before committing resources. Equivalent to protocol development in systematic review methodology (PROSPERO pre-registration; Cochrane Handbook Ch. 2).

**The researcher locks in:**
- Inclusion and exclusion criteria — What counts as relevant evidence? Date ranges, populations, methodologies, disciplines, languages.
- Disciplinary scope — Which fields will be searched? (A study crossing psychology, sociology, ethics, behavioral science, and cultural studies must name each discipline explicitly.)
- Settled decisions — What is already determined and should not be re-investigated? (Loaded from BOOTSTRAP.md.)
- Search boundaries — Databases, grey literature sources, practitioner literature.

**Artifact:** `{phase}-CONTEXT.md` (renamed internally to **Inquiry Brief**).

**Trap doors:** `--auto` (accept recommended defaults), `--batch N` (group N questions per turn). Can be skipped entirely if a PRD/brief is provided via `--prd <file>`.

---

### Stage 3: Search Protocol Development — `/grd:plan-inquiry N`

Replaces `/gsd-r:plan-phase N`.

**Scholarly activity:** Develop a reproducible search strategy with explicit sources, keywords, and acquisition methods. Each PLAN.md task already contains `<src>` blocks — in research terms, this is the search strategy section that allows another researcher to reproduce the literature search.

**Plan-checker validation — enforced per review type:**

| Check | Applies To | Basis |
|---|---|---|
| ≤3 sources per task (context budget) | All review types | GSD architectural constraint |
| No source duplication across the study | All review types | Prevents double-counting evidence |
| Primary sources prioritized over secondary | Systematic, integrative, critical | Foundational scholarly evidence principle |
| Search strategy is systematic (databases named, keywords listed, date ranges specified) | Systematic, scoping | PRISMA protocol requirements (Page et al., 2021) |
| Multiple disciplinary perspectives represented | Interdisciplinary topics (any review type) | Repko & Szostak (2021) |
| Inclusion/exclusion criteria stated | Systematic, scoping | Arksey & O'Malley (2005); PRISMA-P |
| Diverse methodologies included | Integrative | Whittemore & Knafl (2005) |

**Trap doors:** `--skip-research` (bypass research agent, plan directly), `--skip-verify` (bypass plan-checker), `--gaps` (plan only for verified gaps from a previous cycle).

---

### Stage 4: Investigation — `/grd:conduct-inquiry N`

Replaces `/gsd-r:execute-phase N`.

**Scholarly activity:** Systematic search, source acquisition, critical reading, extraction, and evidence documentation. The existing execute flow (acquire sources, read local copies, write research note, commit) is retained with two additions:

**4a. Critical appraisal embedded in every note.**

Each research note gains an **Evidence Quality** section (between Analysis and Implications):

```markdown
## Evidence Quality

| Source | Design | Sample | Quality | Limitations |
|---|---|---|---|---|
| Schwartz (1992) | Cross-cultural survey | 20 countries, N=25,863 | High — validated across populations | Self-report; WEIRD-skewed initial sample |
| Gagné & Deci (2005) | Theoretical integration | N/A (conceptual) | High — seminal SDT-workplace integration | Limited empirical validation at time of publication |
```

The depth of appraisal scales with review type:
- **Systematic:** Full critical appraisal using CASP checklists or GRADE-informed assessment.
- **Scoping:** Charting of study characteristics (design, sample, findings) without formal quality rating.
- **Integrative/Critical:** Quality evaluation proportional to how heavily the source influences conclusions.
- **Narrative:** Lighter touch — note strengths and limitations, no formal scoring.

The appraisal approach also respects the epistemological stance from Stage 1. A positivist review prioritizes RCTs and meta-analyses; a constructivist review values rich description and theoretical coherence.

**Trap door:** `config.workflow.critical_appraisal: false` skips the Evidence Quality section globally. For narrative reviews at Guided tier, this defaults to false — the researcher can enable it when ready.

**4b. Temporal and intellectual positioning.**

Each note locates its sources within the field's development:
- **Foundational** — Seminal works that established the construct or theory.
- **Developmental** — Works that refined, extended, or challenged the foundations.
- **Contemporary** — Recent empirical or theoretical work (last 5-10 years).
- **Emerging** — Preprints, working papers, conference proceedings at the current frontier.

This is standard practice in literature reviews and is captured in note frontmatter as `era: foundational | developmental | contemporary | emerging`.

**Trap door:** `config.workflow.temporal_positioning: false` skips the era field. Defaults to true for all review types.

**Trap doors (inherited from GSD):** `--gaps-only` (execute only gap-closure plans), `--auto` (auto-advance to verification if passing).

---

### Stage 5: Verification — `/grd:verify-inquiry N`

Replaces `/gsd-r:verify-work`.

**Three-tier verification (expanded from current two-tier):**

**Tier 0 — Sufficiency of evidence (new):**
- Has the search been comprehensive enough for the selected review type? (Systematic reviews require exhaustive searching; narrative reviews require representative coverage.)
- Is there evidence of saturation? Are the most recent sources adding new themes or confirming what is already documented? (Theoretical saturation — Glaser & Strauss, 1967, applied to literature review.)
- Is the epistemological stance from Stage 1 consistently applied throughout?

**Tier 1 — Goal-backward (existing, unchanged):**
- Did the research answer what it set out to answer? Extract testable conditions from the research objectives (REQUIREMENTS.md) and verify each against the notes produced.

**Tier 2 — Source audit (existing, unchanged):**
- Does every finding trace to a local source file? Frontmatter complete? SOURCE-LOG.md accounts for all sources? No orphan files?

**Trap doors:** `config.workflow.verifier: false` skips all verification. `--skip-tier0` skips sufficiency check only (useful when the researcher knows they're not done but wants to verify what exists so far).

**Verification routing (3-way, inherited from GSD):**
- **passed** → auto-continue to next inquiry or synthesis
- **human_needed** → Researcher decides: approve, skip, or run gap closure
- **gaps_found** → Researcher decides: fix gaps (`/grd:plan-inquiry N --gaps`), continue without fixing, or stop

---

### Stage 6: Synthesis — `/grd:synthesize` — NEW

This stage does not exist in current GSD-R and must be built. It runs after all investigation phases are verified and before the study is completed. This is the stage that transforms a collection of verified notes into scholarship.

**Four activities, each a separate task or phase depending on scope:**

**6a. Thematic synthesis** — Identify patterns, themes, and relationships across all notes. What recurring findings emerge? What contradictions surface?
- Grounded in reflexive thematic analysis (Braun & Clarke, 2006): themes are actively constructed through sustained engagement with evidence, not passively discovered.
- **Input:** All verified research notes from investigation phases.
- **Output:** `THEMES.md` in the vault — maps each theme to the notes and sources that support it, with cross-references.

**6b. Theoretical integration** — Test the accumulated evidence against the theoretical framework from Stage 1. Does the framework hold? Does it need modification?
- Grounded in framework synthesis (Carroll et al., 2013): use the a priori framework to organize evidence, then refine the framework based on findings.
- For interdisciplinary work: identify conflicts between disciplinary insights, create common ground, produce an integrated understanding (Repko & Szostak, 2021, steps 7-9).
- **Input:** THEMES.md + Theoretical Framework Survey from Stage 1.
- **Output:** `FRAMEWORK.md` in the vault — revised or confirmed theoretical framework with evidence mapping.

**6c. Gap analysis and problematization** — Systematically identify what is missing, contradicted, or assumed without justification.
- Six gap types (Muller-Bloch & Kranz, 2015): contradictory evidence, knowledge voids, action-knowledge conflicts, methodological gaps, evaluation voids, theory application voids.
- Beyond gap-spotting: problematization (Alvesson & Sandberg, 2011) asks not "what hasn't been studied?" but "what has been assumed without justification?" This produces more generative research questions.
- **Input:** THEMES.md + FRAMEWORK.md + all research notes.
- **Output:** `GAPS.md` in the vault — each gap typed, assessed for significance, and linked to implications.

**6d. Argument construction** — Assemble synthesis, integration, and gap analysis into a coherent scholarly argument.
- This is where the review becomes a contribution, not just a summary. What does this body of evidence, taken together, mean? What does it advance?
- **Input:** THEMES.md + FRAMEWORK.md + GAPS.md.
- **Output:** The terminal deliverable in the format specified in PROJECT.md (literature review chapter, research brief, or GSD --auto build spec for a follow-on code project). Placed at `{Study}-Research/00-Executive-Summary.md` or the path specified in PROJECT.md.

**Synthesis uses the same GSD execution machinery:** Each activity is a task in a PLAN.md, executed by a fresh subagent with the relevant input notes loaded. Wave parallelism applies — 6a must complete before 6b-6c, but 6b and 6c can run in parallel. 6d depends on all three.

**Trap doors:** `config.workflow.synthesis: false` skips synthesis entirely (useful when the researcher just wants verified notes, not a synthesized argument). Individual activities can be skipped: `--skip-themes`, `--skip-framework`, `--skip-gaps`. Argument construction (6d) always runs if synthesis is enabled.

---

### Stage 7: Completion — `/grd:complete-study`

Replaces `/gsd-r:complete-milestone`.

- **Internal peer review** — Does the body of work meet its stated research objectives? (Milestone audit via `/grd:audit-study`.)
- **Deliverable assembly** — Compile synthesis into the target format.
- **Archival** — Freeze state. All notes, sources, and synthesis are self-contained and reproducible. Another researcher (or the same researcher in two years) can reconstruct the entire evidence base from what is stored locally.

**Trap doors (inherited):** Audit can be skipped. Completion proceeds with documented gaps if the researcher chooses "continue with gaps."

---

## Revised Research Note Template

```markdown
---
project: [Study Name]
domain: [domain]
inquiry: [line of inquiry / phase name]
era: foundational | developmental | contemporary | emerging
status: draft | reviewed | final
review_type: [systematic | scoping | integrative | critical | narrative]
date: YYYY-MM-DD
sources: N
---

# [Title]

## Key Findings

[2-3 sentence summary of what this note concludes]

## Analysis

[Main body. Inline citations as (Author, Year) or [Source Title](relative-path-to-source-file).
Link to the local source file in -sources/, not the URL.]

## Evidence Quality

[Depth scales with review_type. See Stage 4a for requirements per type.]

| Source | Design | Sample | Quality | Limitations |
|---|---|---|---|---|
| Author (Year) | Study design | Sample description | Rating with justification | Key limitations |

## Implications for [Study Name]

[How this finding affects the research — always tie back to research questions, constraints, and objectives.
End with an explicit **Recommendation:** if the evidence supports one.]

## Open Questions

[What remains unresolved. If a source was unavailable, note it here.
If a finding is low-confidence, say so and say why.]

## References

[Full list. Every entry has a corresponding file in -sources/ folder.
Format: Author (Year). Title. `filename_in_sources_folder.ext`]

1. Author (Year). Title. `slug_YYYY-MM-DD.ext`
```

---

## Synthesis Output File Structure

```
{Study}-Research/
├── 00-Executive-Summary.md              # Terminal deliverable (Stage 6d output)
├── 00-THEMES.md                         # Thematic synthesis (Stage 6a output)
├── 00-FRAMEWORK.md                      # Theoretical integration (Stage 6b output)
├── 00-GAPS.md                           # Gap analysis (Stage 6c output)
├── 01-[Line-of-Inquiry]/
│   ├── [Topic].md                       # Research note
│   ├── [Topic]-sources/                 # Attached source material
│   │   ├── SOURCE-LOG.md
│   │   └── ...
│   └── ...
├── 02-[Line-of-Inquiry]/
│   └── ...
├── ...
└── Decision-Log.md
```

---

## Recursive Loops

Research is not linear. These feedback loops are first-class operations, not exceptions:

| Trigger | Returns To | Mechanism |
|---|---|---|
| Investigation reveals the research question was wrong or too broad | Stage 1 — revise research objectives | Edit REQUIREMENTS.md, add/remove REQ-IDs |
| Synthesis reveals an uninvestigated sub-topic | Stages 2-4 — scope, plan, conduct new inquiry | `/grd:insert-inquiry` (decimal phase) |
| Critical appraisal reveals a foundational assumption is contested | Stage 1 — update state of the field | Move BOOTSTRAP.md entry from "Established" to "Contested" with justification in Decision Log |
| Gap analysis reveals a productive new research question | New study | `/grd:new-milestone` |
| Evidence contradicts BOOTSTRAP.md | Stage 1 — update state of the field | Update BOOTSTRAP.md with justification |
| Review type proves wrong mid-study | Stage 1 — downgrade via `/grd:settings` | Rigor requirements relax, no work lost |

---

## Adaptive Communication (Researcher Tier)

The `researcher_tier` setting (Guided / Standard / Expert) affects every user-facing surface:

### Agent prompts
- **Guided:** Agents explain what they are doing and why at each step. Definitions provided for technical terms. ("I'm now conducting a thematic analysis — that means I'm looking across all the evidence we've gathered to find recurring patterns and themes.")
- **Standard:** Agents use academic vocabulary with brief context where non-obvious.
- **Expert:** Agents use precise terminology without elaboration. Maximum information density.

### Templates
- **Guided:** Templates include inline guidance comments explaining each section's purpose and what good output looks like. Research note template includes "What to write here" prompts under each heading.
- **Standard:** Templates include section headers with brief descriptions.
- **Expert:** Templates include section headers only.

### Verification feedback
- **Guided:** Verification explains what failed and why it matters. ("Your note on SDT cites Gagné & Deci (2005) in the References section, but there's no corresponding file in the -sources/ folder. Every citation needs a local copy of the source so your research is self-contained.")
- **Standard:** Verification states what failed with the relevant standard. ("Source audit failure: Gagné & Deci (2005) cited but no corresponding file in -sources/. Per source attachment protocol, every reference requires a local copy.")
- **Expert:** Verification states what failed. ("Source audit: Gagné & Deci (2005) — missing file.")

### Error messages and guidance
- **Guided:** Suggests next steps and explains concepts. ("Your search protocol doesn't specify which databases you'll search. For a systematic review, you need to name specific databases — like PsycINFO for psychology or Scopus for cross-disciplinary work — so another researcher could reproduce your search.")
- **Standard:** States the requirement and rationale.
- **Expert:** States the requirement.

### Next-action routing
The "Next Up" contextual guidance (inherited from GSD) adapts to tier:
- **Guided:** Explains what the next step is and why it matters before offering the command.
- **Standard:** Names the next step with the command.
- **Expert:** Shows the command only.

---

## Trap Door Inventory

GRD inherits all GSD escape hatches and adds research-specific ones. Every trap door follows the same pattern: **config toggle** for global default, **command flag** for one-off override, **interactive gate** when the situation is ambiguous.

### Config Toggles (`.planning/config.json`)

```json
{
  "researcher_tier": "guided | standard | expert",
  "review_type": "systematic | scoping | integrative | critical | narrative",
  "epistemological_stance": "positivist | constructivist | pragmatist | critical",
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "auto_advance": false,
    "critical_appraisal": true,
    "temporal_positioning": true,
    "synthesis": true,
    "nyquist_validation": true
  },
  "parallelization": {
    "enabled": true,
    "plan_level": true,
    "task_level": true,
    "skip_checkpoints": false
  }
}
```

### Command Flags

| Flag | Command(s) | Effect |
|---|---|---|
| `--auto` | new-research, scope-inquiry, plan-inquiry, conduct-inquiry | Accept defaults / auto-advance without stopping |
| `--skip-research` | plan-inquiry | Bypass research agent, plan directly |
| `--skip-verify` | plan-inquiry | Bypass plan-checker |
| `--gaps` | plan-inquiry | Plan only for verified gaps |
| `--gaps-only` | conduct-inquiry | Execute only gap-closure plans |
| `--prd <file>` | plan-inquiry | Skip scoping entirely, use file as locked context |
| `--skip-tier0` | verify-inquiry | Skip sufficiency check |
| `--skip-themes` | synthesize | Skip thematic synthesis |
| `--skip-framework` | synthesize | Skip theoretical integration |
| `--skip-gaps` | synthesize | Skip gap analysis |
| `--batch N` | scope-inquiry | Group N questions per turn |
| `--from N` | autonomous | Start from inquiry N |
| `--discuss` | quick | Enable lightweight scoping |
| `--research` | quick | Enable research before planning |
| `--full` | quick | Enable plan-checking and verification |

### Interactive Gates (Inherited + New)

| Gate | When | Options |
|---|---|---|
| Context missing | plan-inquiry without prior scoping | "Continue without context" / "Run scope-inquiry first" |
| Plans exist | plan-inquiry with existing plans | "Add more" / "View existing" / "Replan from scratch" |
| Verification result | After conduct-inquiry | "Approve" / "Skip" / "Run gap closure" |
| Gaps found | After verification | "Fix gaps" / "Continue without fixing" / "Stop" |
| Review type mismatch | Plan-checker detects rigor below review type | "Downgrade review type" / "Add rigor" / "Override" |
| Saturation question (new) | Tier 0 verification | "Evidence is sufficient" / "Continue investigating" / "Add inquiry" |
| Synthesis scope (new) | Before `/grd:synthesize` | "Full synthesis (all 4 activities)" / "Themes + argument only" / "Skip synthesis" |

### Smart Defaults by Review Type

| Setting | Systematic | Scoping | Integrative | Critical | Narrative |
|---|---|---|---|---|---|
| critical_appraisal | required | charting only | proportional | proportional | optional |
| temporal_positioning | required | recommended | recommended | recommended | optional |
| synthesis | required | recommended | required | required | optional |
| plan_check rigor | strict | moderate | moderate | moderate | light |

---

## Command Mapping Summary

| Current (v1.1) | Proposed (v1.2) | Research Function |
|---|---|---|
| `/gsd-r:new-project` | `/grd:new-research` | Research formulation and prospectus |
| `/gsd-r:discuss-phase N` | `/grd:scope-inquiry N` | Inquiry scoping and protocol boundaries |
| `/gsd-r:plan-phase N` | `/grd:plan-inquiry N` | Search protocol development |
| `/gsd-r:execute-phase N` | `/grd:conduct-inquiry N` | Investigation and evidence gathering |
| `/gsd-r:verify-work` | `/grd:verify-inquiry N` | Three-tier scholarly verification |
| *(new)* | `/grd:synthesize` | Thematic synthesis, integration, gap analysis |
| `/gsd-r:complete-milestone` | `/grd:complete-study` | Internal review and archival |
| `/gsd-r:progress` | `/grd:progress` | Status and next action |
| `/gsd-r:quick` | `/grd:quick` | Targeted fixes to individual notes |
| `/gsd-r:insert-phase` | `/grd:insert-inquiry` | Add investigation when gaps emerge |
| `/gsd-r:add-phase` | `/grd:add-inquiry` | Add line of inquiry to study plan |
| `/gsd-r:remove-phase` | `/grd:remove-inquiry` | Remove line of inquiry from study plan |
| `/gsd-r:debug` | `/grd:debug` | Systematic debugging (unchanged) |
| `/gsd-r:pause-work` | `/grd:pause-work` | Context handoff (unchanged) |
| `/gsd-r:resume-work` | `/grd:resume-work` | Context restoration (unchanged) |
| `/gsd-r:autonomous` | `/grd:autonomous` | Run remaining inquiries autonomously |
| `/gsd-r:health` | `/grd:health` | Planning directory diagnostics |
| `/gsd-r:stats` | `/grd:stats` | Study statistics |
| `/gsd-r:audit-milestone` | `/grd:audit-study` | Verify study meets stated objectives |
| `/gsd-r:settings` | `/grd:settings` | Configure toggles, tier, review type |
| `/gsd-r:help` | `/grd:help` | Show available commands and usage |
| `/gsd-r:new-milestone` | `/grd:new-milestone` | Start next study cycle |
| `/gsd-r:map-codebase` | `/grd:map-codebase` | Codebase analysis (unchanged) |

---

## Deferred to Future Milestones

The following were identified during design and explicitly deferred:

1. **Bibliometric mapping** — Citation network analysis, co-citation clusters, intellectual lineage tracing via VOSviewer/CiteSpace/OpenAlex integration.
2. **PRISMA flow diagram generation** — Visual accounting of sources identified, screened, included, excluded with reasons. SOURCE-LOG.md already captures the data; automated diagram generation deferred.
3. **Practitioner-academic reconciliation** — Distinguishing between academic theory and practitioner models as separate evidence types with different appraisal criteria.

---

## Verification Criteria

The reorientation is complete when:

1. All commands use `/grd:` namespace with research-native names as specified in the command mapping.
2. The `researcher_tier` scoping question exists and affects agent prompts, templates, verification feedback, error messages, and next-action routing across all three tiers.
4. The `review_type` scoping question exists and the plan-checker enforces the corresponding rigor requirements per the Smart Defaults table.
5. The `epistemological_stance` is captured in PROJECT.md and influences critical appraisal behavior. Skippable with Pragmatist default.
6. The four parallel researchers use the revised names and scholarly functions (Methodological Landscape, Prior Findings & Key Themes, Theoretical Framework Survey, Limitations Critiques & Debates).
7. Every research note template includes the Evidence Quality section (depth scaled by review type).
8. Every research note template includes temporal positioning in frontmatter (`era` field, skippable via config).
9. The synthesis stage (`/grd:synthesize`) exists with four sub-activities: thematic synthesis (THEMES.md), theoretical integration (FRAMEWORK.md), gap analysis (GAPS.md), argument construction (Executive Summary).
10. Verification includes Tier 0 (sufficiency of evidence) in addition to existing Tiers 1 and 2.
11. All trap doors documented in this spec are implemented: config toggles, command flags, interactive gates, and smart defaults by review type.
12. Recursive loops are supported by existing mechanisms (insert-inquiry, BOOTSTRAP.md updates, REQUIREMENTS.md edits, review type downgrade).
13. All existing tests continue to pass (164 tests).
14. New tests cover: review type enforcement in plan-checker, researcher tier template selection, critical appraisal section validation, synthesis stage workflow, config toggle behavior, namespace migration.

---

## Tool Usage

- Runtime: Claude Code with GSD workflow management
- Language: Node.js (CJS), zero external dependencies for core
- Testing: Node.js built-in `node:test` with strict assertions
- Source acquisition: firecrawl, web_fetch, wget/curl, gh-cli (existing fallback chain)
- Vault: Local filesystem (Obsidian MCP optional)

---

## Key References

- Alvesson, M. & Sandberg, J. (2011). Generating research questions through problematization. *Academy of Management Review*, 36(2), 247-271.
- Arksey, H. & O'Malley, L. (2005). Scoping studies: towards a methodological framework. *International Journal of Social Research Methodology*, 8(1), 19-32.
- Booth, W.C., Colomb, G.G. & Williams, J.M. (2008). *The Craft of Research* (3rd ed.). University of Chicago Press.
- Braun, V. & Clarke, V. (2006). Using thematic analysis in psychology. *Qualitative Research in Psychology*, 3(2), 77-101.
- Carroll, C. et al. (2013). Best fit framework synthesis. *BMC Medical Research Methodology*, 13, 37.
- Creswell, J.W. & Creswell, J.D. (2018). *Research Design* (5th ed.). Sage.
- Glaser, B.G. & Strauss, A.L. (1967). *The Discovery of Grounded Theory*. Aldine.
- Guba, E.G. & Lincoln, Y.S. (1994). Competing paradigms in qualitative research. In Denzin & Lincoln (eds.), *Handbook of Qualitative Research*.
- Guyatt, G.H. et al. (2008). GRADE: an emerging consensus on rating quality of evidence. *BMJ*, 336, 924-926.
- Levac, D., Colquhoun, H. & O'Brien, K.K. (2010). Scoping studies: advancing the methodology. *Implementation Science*, 5(69).
- Muller-Bloch, C. & Kranz, J. (2015). A framework for rigorously identifying research gaps. *ICIS 2015 Proceedings*.
- Page, M.J. et al. (2021). The PRISMA 2020 statement. *BMJ*, 372, n71.
- Ravitch, S.M. & Riggan, M. (2017). *Reason & Rigor* (2nd ed.). Sage.
- Repko, A.F. & Szostak, R. (2021). *Interdisciplinary Research* (4th ed.). Sage.
- Whittemore, R. & Knafl, K. (2005). The integrative review: updated methodology. *Journal of Advanced Nursing*, 52(5), 546-553.
