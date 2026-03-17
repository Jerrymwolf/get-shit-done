# Feature Research: v1.2 Research Reorientation

**Domain:** AI-assisted research methodology tool (CLI-based, LLM-powered literature review workflow)
**Researched:** 2026-03-17
**Confidence:** MEDIUM-HIGH (features well-grounded in established research methodology; no direct competitors do exactly this)

## Feature Landscape

### Table Stakes (Users Expect These)

Features that any tool claiming "research methodology support" must have. Without these, GRD is just a note-taking tool with fancy vocabulary.

| Feature | Why Expected | Complexity | Depends On | Notes |
|---------|--------------|------------|------------|-------|
| `/grd:` namespace with research-native command names | Identity. If the tool calls itself a research tool, its commands must speak research. `execute-phase` vs `conduct-inquiry` is the difference between a PM tool and a research tool. | LOW | Nothing new -- rename + alias mapping | Mechanical refactor of 36 commands. Low risk, high tedium. Every command file, workflow, agent prompt, and help text needs updating. Suggest automated renaming script + manual verification pass. |
| Review type selection (systematic/scoping/integrative/critical/narrative) | Covidence, Rayyan, and every serious SR tool ask this upfront. It determines the entire downstream workflow. A tool that doesn't differentiate between a systematic review and a narrative review is unusable for anyone trained in research methods. | MEDIUM | config.json schema extension | The selection itself is trivial. The enforcement downstream (plan-checker rules, template sections, verification depth) is where the real work lives. Covidence differentiates systematic vs. scoping workflows but does NOT enforce integrative/critical/narrative -- GRD covering all five is a genuine extension. |
| Smart defaults by review type | Once you select a review type, the tool should configure itself appropriately. Systematic reviews require critical appraisal; narrative reviews don't. Making the researcher manually toggle 6 config flags defeats the purpose. | MEDIUM | Review type selection | The smart defaults table in the spec is well-designed. Implementation is a config-cascade: review type sets defaults, researcher can override individual flags. Standard pattern. |
| Evidence Quality / Critical appraisal section in notes | Covidence has built-in CASP/RoB2 quality assessment. GRADE is standard for rating evidence bodies. Any tool producing "defense-quality" output must surface evidence quality. The section already exists in the spec with appropriate scaling by review type. | MEDIUM | Review type selection, note template | Scaling by review type is the key design decision: systematic = full CASP/GRADE table, scoping = charting only, narrative = optional. This matches established methodology (Cochrane Handbook, PRISMA-ScR). The spec gets this right. |
| Temporal positioning of sources (`era` frontmatter field) | Every literature review distinguishes foundational/seminal works from contemporary evidence. This is taught in every doctoral methods course. Seminal vs. developmental vs. contemporary vs. emerging is standard vocabulary (though the exact taxonomy varies). | LOW | Note template update | Simple frontmatter field. The four-tier taxonomy (foundational/developmental/contemporary/emerging) is clean and sufficient. Some methodologists use "classic/modern/contemporary" (3-tier) but four tiers are fine. Default to `true`, skippable via config -- correct design. |
| Revised parallel researchers (Methodological Landscape, Prior Findings, Theoretical Framework, Limitations & Debates) | The current names (Stack/Features/Architecture/Pitfalls) are PM vocabulary. Research methodology has established categories that map naturally: methods, findings, theory, critiques. Anyone with research training expects these categories. | MEDIUM | Agent prompt rewrites for 4 researchers | The mapping is sound and grounded in standard lit review structure. The scholarly functions described in the spec align with how research methodology textbooks organize literature reviews (Creswell & Creswell, 2018; Booth et al., 2008). |
| Three-tier verification (sufficiency + goal-backward + source audit) | Adding Tier 0 (sufficiency) is expected because "did you look at enough sources?" is the most basic question a methods advisor asks. The existing two tiers (goal-backward, source audit) check correctness and completeness of what exists -- Tier 0 checks whether enough exists. | MEDIUM | Verification pipeline extension | Sufficiency checking is conceptually simple but judgment-heavy. For systematic reviews, exhaustive searching is operationally defined (PRISMA). For narrative reviews, "representative coverage" is subjective. The spec's approach of scaling by review type handles this well. |

### Differentiators (Competitive Advantage)

Features that no existing tool combines in this way. These are what make GRD genuinely novel.

| Feature | Value Proposition | Complexity | Depends On | Notes |
|---------|-------------------|------------|------------|-------|
| Researcher tier adaptive communication (Guided/Standard/Expert) | No existing research tool adapts its communication style by researcher experience level. Covidence, Rayyan, DistillerSR, Elicit -- all use fixed vocabulary regardless of user. The difference between explaining "thematic analysis means looking for patterns" (Guided) and just saying "thematic analysis" (Expert) is the difference between a tool that teaches and one that assumes. This is genuinely novel. | HIGH | Pervasive -- touches every agent prompt, template, verification message, error message, and next-action routing | This is the highest-complexity feature in v1.2. It requires 3 variants of every user-facing string. Implementation approaches: (1) template interpolation with tier-conditional blocks, (2) separate template files per tier, (3) prompt engineering with tier-aware system prompts. Option 3 is most practical for agent prompts (add tier to system prompt, let LLM adapt). Options 1-2 for static templates. |
| Epistemological positioning | No CLI research tool asks "what paradigm governs your inquiry?" This is a doctoral-level concept that fundamentally shapes what counts as valid evidence. A positivist review prioritizes RCTs; a constructivist review values rich description. NVivo and ATLAS.ti are paradigm-agnostic -- they let you code data however you want but don't actively shape evidence evaluation based on your stance. | LOW-MEDIUM | config.json field, critical appraisal logic | The selection itself is simple (4 options + skip-to-pragmatist default). The downstream effect (shaping what counts as valid evidence in critical appraisal) is subtle but important. For v1.2, the pragmatist default means this can be minimally impactful -- it becomes powerful when a researcher actively chooses positivist or constructivist and the tool adjusts its evidence hierarchy. |
| Synthesis stage (`/grd:synthesize`) with 4 sub-activities | Existing tools help with screening and extraction. Almost none help with synthesis -- the intellectual heavy lifting that transforms notes into scholarship. Elicit does some automated synthesis but it's AI-generated summaries, not structured thematic analysis with gap typing. GRD's approach (THEMES.md -> FRAMEWORK.md -> GAPS.md -> Executive Summary) with explicit dependency ordering is novel. | HIGH | All investigation phases complete, verified notes as input | This is the second-highest-complexity feature. Each sub-activity needs its own agent prompt, input/output contract, and quality criteria. The dependency graph (6a before 6b/6c, all before 6d) maps well to existing wave parallelism. Muller-Bloch & Kranz (2015) gap taxonomy and Alvesson & Sandberg (2011) problematization are well-chosen theoretical grounding. |
| Recursive loops as first-class operations | Research tools treat iteration as an exception. GRD treats it as expected: investigation reveals wrong question -> revise objectives. Synthesis reveals gap -> insert inquiry. Evidence contradicts BOOTSTRAP.md -> update state-of-field. This is how research actually works but no tool operationalizes it with explicit mechanisms. | MEDIUM | insert-inquiry (exists), BOOTSTRAP.md (exists), REQUIREMENTS.md (exists), Decision Log (exists) | Most infrastructure already exists. The new work is (1) documenting the loop triggers, (2) adding `/grd:settings` for review type downgrade, (3) ensuring BOOTSTRAP.md entries can move between tiers with Decision Log justification. Low new code, high design clarity needed. |
| Plan-checker enforcement per review type | Covidence has different workflows for systematic vs. scoping but doesn't enforce methodology rules at the planning stage. GRD's plan-checker validating "databases named, keywords listed, date ranges specified" for systematic reviews -- or "diverse methodologies included" for integrative reviews -- is enforcement that happens before work is done, not after. | MEDIUM | Review type selection, existing plan-checker infrastructure | The plan-checker already exists and validates source discipline. Adding review-type-specific rules is an extension of existing infrastructure. The 7 checks in the spec map to discrete validation functions. |

### Anti-Features (Explicitly Do NOT Build)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Automated PRISMA flow diagram generation | Systematic reviews require PRISMA diagrams. Seems like a natural output. | Generating accurate flow diagrams requires tracking screening/inclusion/exclusion counts across the entire study lifecycle -- infrastructure that doesn't exist yet. SOURCE-LOG.md captures per-note data, not study-level screening metrics. Building the tracking infrastructure AND the diagram generation is scope creep for v1.2. | Defer to future milestone (already listed in spec as deferred). SOURCE-LOG.md data can be manually compiled into a PRISMA diagram. |
| Bibliometric/citation network analysis | Would help identify seminal works and intellectual lineage automatically. | Requires integration with citation databases (OpenAlex, Semantic Scholar, Crossref). Adds external dependencies to a zero-dependency tool. The ROI is low when the 4 parallel researchers already survey the field. | Defer to future milestone. Researchers can use Connected Papers / ResearchRabbit externally and feed results into GRD. |
| Real-time quality scoring of individual sources | Seems useful -- auto-rate each source as High/Medium/Low quality. | Quality assessment requires domain expertise and methodological judgment. CASP checklists are tools for human judgment, not automation targets. Auto-scoring would produce false confidence. The spec correctly makes the Evidence Quality section researcher-written, not auto-generated. | Keep researcher-authored Evidence Quality sections. The scaled depth by review type provides appropriate guidance without false automation. |
| Per-field granular epistemological enforcement | Deep integration where epistemological stance changes every template section, every validation rule, every prompt instruction. | Epistemological positioning is a framing lens, not a set of enforceable rules. Over-operationalizing it produces rigid workflows that don't match how researchers actually use paradigms (often pragmatically mixing approaches). | Light touch: capture stance in PROJECT.md, mention in critical appraisal guidance, let researcher apply judgment. The spec's approach of "shapes what counts as valid evidence" is appropriately restrained. |
| Automatic source era classification | Auto-classify sources as foundational/developmental/contemporary/emerging based on publication date or citation count. | A 2020 paper can be foundational if it establishes a new construct. A 1990 paper can be contemporary if the field hasn't moved. Era is about intellectual positioning, not chronology. Auto-classification would be wrong frequently enough to be harmful. | Keep era as researcher-assigned frontmatter. The four-tier taxonomy is the right scaffolding; the human provides the judgment. |
| Practitioner-academic source type distinction | Separating academic theory from practitioner models with different appraisal criteria. | Adds a classification axis that crosscuts review type and epistemological stance. The interaction effects are complex and the benefit is marginal for v1.2. | Already deferred in spec. Can be added later as an optional classification in Evidence Quality section. |

## Feature Dependencies

```
Review Type Selection
    |--enables--> Smart Defaults by Review Type
    |--enables--> Plan-Checker Enforcement per Review Type
    |--enables--> Evidence Quality Section (depth scaling)
    +--enables--> Tier 0 Verification (sufficiency criteria)

Researcher Tier Selection
    +--enables--> Adaptive Communication (prompts, templates, messages, routing)

Epistemological Positioning
    +--enhances--> Evidence Quality Section (what counts as valid evidence)

/grd: Namespace Rename
    +--required-before--> All new commands (synthesize, scope-inquiry, etc.)

Note Template Update (era field + Evidence Quality section)
    +--required-before--> Investigation phase can produce compliant notes

Temporal Positioning
    +--independent-- (frontmatter field, no upstream dependencies)

All Investigation Phases Verified
    +--required-before--> Synthesis Stage (/grd:synthesize)

Synthesis Sub-Activities:
    Thematic Synthesis (6a: THEMES.md)
        |--required-before--> Theoretical Integration (6b: FRAMEWORK.md)
        +--required-before--> Gap Analysis (6c: GAPS.md)

    Theoretical Integration (6b) --parallel-with-- Gap Analysis (6c)

    THEMES.md + FRAMEWORK.md + GAPS.md
        +--required-before--> Argument Construction (6d: Executive Summary)

Recursive Loops
    +--depends-on--> insert-inquiry (exists), BOOTSTRAP.md (exists), Decision Log (exists)
```

### Dependency Notes

- **Review type selection gates most downstream features:** This must be implemented first and stored in config.json. Almost every other feature reads `review_type` to adjust behavior.
- **Researcher tier is pervasive but independent:** It doesn't depend on review type or epistemology. It can be implemented in parallel with review type work, but it touches the most files.
- **Namespace rename is foundational:** Every new command and workflow references `/grd:` names. Rename first, build features on top.
- **Synthesis depends on everything else being done:** It consumes the output of investigation phases. Build and test it last.
- **Recursive loops are mostly already built:** The mechanisms exist (insert-inquiry, BOOTSTRAP.md mutation, REQUIREMENTS.md editing). The new work is documentation and Decision Log integration.

## MVP Definition

### Must Have for v1.2 (Core Research Reorientation)

- [ ] `/grd:` namespace rename -- Without this, the tool still looks like a PM fork. Identity shift is the whole point.
- [ ] Review type selection + smart defaults -- This is the structural backbone. Every other feature scales off it.
- [ ] Plan-checker enforcement per review type -- Without enforcement, review type selection is decorative.
- [ ] Evidence Quality section in notes (scaled by review type) -- Defense-quality output requires explicit evidence evaluation.
- [ ] Temporal positioning (`era` frontmatter) -- Low cost, high signal for literature review organization.
- [ ] Revised parallel researchers (4 renamed agents) -- Research-native vocabulary for the research agents.
- [ ] Researcher tier selection + config storage -- Must capture the tier even if adaptive communication is initially limited.
- [ ] Tier 0 verification (sufficiency of evidence) -- Completes the verification triangle.

### Should Have (High Value, Add When Possible)

- [ ] Adaptive communication across agent prompts -- The highest-value differentiator but also highest complexity. Even partial implementation (agent system prompts include tier; LLM adapts) delivers most of the value.
- [ ] Synthesis stage with THEMES.md output (6a) -- Thematic synthesis is the most universally needed synthesis activity.
- [ ] Epistemological positioning in PROJECT.md -- Low implementation cost, high scholarly credibility.
- [ ] Recursive loop documentation + Decision Log integration -- Mostly exists already, needs formalization.

### Can Follow in v1.2.x Patches or v1.3

- [ ] Full synthesis pipeline (6b theoretical integration, 6c gap analysis, 6d argument construction) -- High complexity, can ship incrementally after 6a proves the pattern.
- [ ] Adaptive communication in templates, verification feedback, error messages -- Per-tier template variants are labor-intensive. Defer fine-grained adaptation after agent prompt adaptation proves the model.
- [ ] Interactive gates for new research-specific decision points (saturation question, synthesis scope, review type mismatch) -- Nice polish, not blocking.
- [ ] Trap door inventory implementation (all config toggles, all command flags) -- Implement the most-used flags first, add the rest incrementally.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Phase Suggestion |
|---------|------------|---------------------|----------|------------------|
| `/grd:` namespace rename | HIGH | LOW | P1 | Early -- foundational |
| Review type selection + config | HIGH | LOW | P1 | Early -- gates everything |
| Smart defaults by review type | HIGH | MEDIUM | P1 | Immediately after review type |
| Plan-checker rules per review type | HIGH | MEDIUM | P1 | After smart defaults |
| Revised parallel researchers (rename + prompts) | HIGH | MEDIUM | P1 | Can parallel with above |
| Note template update (Evidence Quality + era) | HIGH | LOW | P1 | Can parallel with above |
| Researcher tier selection + config | HIGH | LOW | P1 | Early -- but decouple from adaptive comms |
| Tier 0 verification (sufficiency) | MEDIUM | MEDIUM | P1 | After review type |
| Epistemological positioning | MEDIUM | LOW | P1 | During research formulation work |
| Adaptive comms in agent prompts | HIGH | HIGH | P2 | After all P1 features stable |
| Synthesis stage: thematic (6a) | HIGH | HIGH | P2 | After investigation pipeline works |
| Recursive loops formalization | MEDIUM | LOW | P2 | After core workflow works |
| Synthesis: theoretical integration (6b) | MEDIUM | HIGH | P2-P3 | After 6a |
| Synthesis: gap analysis (6c) | MEDIUM | HIGH | P2-P3 | After 6a |
| Synthesis: argument construction (6d) | MEDIUM | HIGH | P3 | After 6b + 6c |
| Adaptive comms in templates/messages | MEDIUM | HIGH | P3 | After agent prompt adaptation |
| All trap doors + interactive gates | LOW | MEDIUM | P3 | Polish phase |

## Competitor Feature Analysis

| Feature | Covidence | Rayyan | Elicit | NVivo/ATLAS.ti | GRD Approach |
|---------|-----------|--------|--------|----------------|--------------|
| Review type awareness | Systematic + scoping workflows | Systematic focus | Literature review focus | N/A (general QDA) | 5 review types with enforced rigor scaling |
| Critical appraisal | Built-in RoB2, CASP templates | Basic quality assessment | AI-assisted extraction | Manual coding | Researcher-authored, scaled by review type |
| Source management | Screening pipeline | Screening + dedup | Paper discovery | Data import | Physical source attachment + SOURCE-LOG.md |
| Synthesis support | Data extraction tables | None | AI summaries | Thematic coding | Structured 4-activity pipeline (themes -> framework -> gaps -> argument) |
| Adaptive UX by experience | None | None | None | None | 3-tier communication adaptation |
| Epistemological framing | None | None | None | Methodology-agnostic | Explicit paradigm selection affecting evidence evaluation |
| Temporal source positioning | None | None | Citation context | None | 4-tier era classification in frontmatter |
| Reproducibility | PRISMA flow tracking | Export features | Paper trails | Project files | Self-contained vault with all sources physically attached |

**Key insight:** Existing tools are strongest at screening/extraction (Covidence, Rayyan) or discovery (Elicit, ResearchRabbit). None meaningfully help with synthesis, none adapt to researcher experience, and none enforce methodology rules at the planning stage. GRD occupies a genuinely empty niche: methodology-aware, synthesis-capable, experience-adaptive research workflow management.

## Sources

- Covidence review type documentation: https://support.covidence.org/help/types-of-review-explained
- Covidence scoping review protocol guide (2025): https://www.covidence.org/wp-content/uploads/2025/11/a_practical_guide_protocol_scoping_reviews_covidence.pdf
- Rayyan systematic review platform: https://www.rayyan.ai/
- Elicit evidence synthesis: https://elicit.com/
- Tools for SR automation scoping review: https://www.sciencedirect.com/science/article/abs/pii/S0895435621004029
- PRISMA 2020 statement: https://www.prisma-statement.org/
- PRISMA guideline updates 2025: https://pmc.ncbi.nlm.nih.gov/articles/PMC11892999/
- Digital tools for systematic review process: https://pmc.ncbi.nlm.nih.gov/articles/PMC12035789/
- AI tools for systematic review (2026): https://paperguide.ai/blog/ai-tools-for-systematic-review/
- Literature review software comparison (2026): https://www.atlasworkspace.ai/blog/literature-review-software
- CAQDAS comparison (NVivo/ATLAS.ti): https://lumivero.com/resources/blog/top-caqdas-tools-for-qualitative-research/
- Finding seminal works methodology: https://resources.nu.edu/researchprocess/seminalworks
- Temporal citation representations: https://www.frontiersin.org/journals/research-metrics-and-analytics/articles/10.3389/frma.2018.00027/full

---
*Feature research for: GRD v1.2 Research Reorientation*
*Researched: 2026-03-17*
