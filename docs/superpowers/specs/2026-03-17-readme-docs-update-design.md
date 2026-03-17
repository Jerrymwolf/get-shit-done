# Design: README and Documentation Update for GSD-R

**Date:** 2026-03-17
**Status:** Draft
**Scope:** README.md rewrite, docs/DESIGN.md creation, cleanup of legacy docs

---

## Context

GSD-R is a research-oriented fork of GSD (Get Shit Done) by Lex Christopherson. The fork adapts GSD's context engineering architecture — wave parallelism, fresh subagent contexts, plan/execute/verify loop — for academic research workflows with source attachment.

The current README is the upstream GSD README with find-and-replace edits. It presents GSD-R as a code development tool with someone else's personal narrative. It does not reflect GSD-R's research identity, its primary audience (researchers/academics), or the author's voice.

GSD-R was itself built using GSD — the system it forked from.

### Design Decisions (from brainstorming)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary audience | Researchers / academics | GSD-R's differentiator is research workflows |
| Secondary audience | Developers who also research | GSD-R inherits full code capabilities |
| Narrative voice | Clean break | New author, new purpose, new voice |
| Upstream relationship | Graduated fork | Attribution prominent, framing forward-looking |
| Current state vs vision | Vision-forward | Present the designed system, note what's in progress |
| Tone | Academic but accessible | Clear, precise, no hype. Respects reader intelligence |
| Fork plan handling | Clean up and link | Single design doc, not docs sprawl |
| Approach | README rewrite + cleaned fork plan | Focused scope, no premature docs expansion |

---

## Deliverables

### 1. README.md — Full Rewrite

**Structure (in order):**

#### 1.1 Header
- Project name: "GSD-R"
- Subtitle: "Research-grade context engineering for AI-assisted academic workflows."
- Badges: npm version, npm downloads, tests, license
- Drop: Discord, Twitter/X, $GSD token, GitHub stars badges (upstream community assets)
- Install command: `npx get-shit-done-r@latest`
- Drop: terminal SVG animation, testimonials

#### 1.2 Attribution
- Keep current attribution section crediting Lex Christopherson and the original GSD project
- Add: "GSD-R was itself built using GSD."
- Keep: links to original repo, license note

#### 1.3 What This Is
Three paragraphs:

- **P1 — The problem:** AI coding tools degrade as context fills. GSD solved this for code. GSD-R extends the same architecture to academic research: literature reviews, systematic analysis, doctoral work. The atomic unit shifts from git commits to research notes with physically attached source material.
- **P2 — What it does:** Orchestrates AI agents through a discuss-plan-execute-verify loop, keeping each agent in a fresh context window. For research: sources are downloaded and saved locally (not just linked), notes follow a consistent template, every citation has a corresponding file, verification checks that research questions are actually answered.
- **P3 — Works for code too:** GSD-R inherits GSD's full code development capabilities. If your project involves both research and implementation, it handles the full lifecycle.

#### 1.4 How It Works
- Core workflow steps: new-project → discuss → plan → execute → verify → complete
- Each step explained through a research lens (e.g., "plan" creates tasks with `<src>` blocks specifying acquisition methods)
- Translation table from fork plan: GSD concept → GSD-R equivalent (git commit → vault write, test passes → source attachment check, build succeeds → research question answered, etc.)
- Wave execution diagram (keep from current README — genuinely useful)
- Link to docs/DESIGN.md for full design rationale

#### 1.5 The Research Workflow
New content, drawn from fork plan:

- **Source Attachment Protocol:** The rule (every cited source has a corresponding local file), folder convention (`{Note}-sources/`), file naming (`{slug}_{date}.{ext}`), acquisition methods table (arXiv, GitHub, docs, conferences), fallback chain
- **Research Note Template:** Frontmatter, Key Findings, Analysis, Implications, Open Questions, References — show the template
- **Two-Tier Verification:** Goal-backward ("can I now answer the research question?") + source audit (every reference has a file, SOURCE-LOG.md accounts for everything)
- **BOOTSTRAP.md:** Brief mention — existing research inventory to prevent re-researching known findings

#### 1.6 Commands
- Keep current command tables — they are accurate with `/gsd-r:` prefixes
- Tables: Core Workflow, Navigation, Brownfield, Phase Management, Session, Utilities
- Keep footnote crediting OracleGreyBeard for verify-work

#### 1.7 Configuration
- Keep current content: core settings, model profiles, workflow agents, execution, git branching
- Already accurate for GSD-R

#### 1.8 Getting Started
- Move down from current position (researchers want to understand what it is before installing)
- Keep: install command, runtime selection, location selection, verify commands
- Keep: non-interactive install details, development installation details
- Keep: skip permissions recommendation with granular alternative
- Keep: staying updated section

#### 1.9 Security
- Keep current sensitive files protection section unchanged

#### 1.10 Troubleshooting
- Keep current content unchanged
- Keep: uninstalling section

#### 1.11 Community Ports
- Keep current section (OpenCode, Gemini, Codex support)

#### 1.12 License
- MIT, link to LICENSE file
- Drop: star history chart

#### 1.13 Closing
- Replace "Claude Code is powerful. GSD makes it reliable." with something research-appropriate, e.g.: "AI makes research faster. GSD-R makes it rigorous."

**What gets removed from current README:**
- "Why I Built This" personal narrative (Lex's voice)
- "Who This Is For" section (replaced by "What This Is")
- Vibecoding paragraph
- Testimonials
- Star History chart
- "Why It Works" section (context engineering, XML, multi-agent internals folded into "How It Works" more concisely)
- Discord/Twitter/$GSD badges

### 2. docs/DESIGN.md — Design Reference

**Source:** `GSD-R-Fork-Plan.md` cleaned up.

**Keep (the design reference material):**
- Translation table (GSD → GSD-R concepts)
- Source Attachment Protocol (full detail: rule, folder convention, naming, acquisition table, fallback chain, SOURCE-LOG.md format)
- What changes in each GSD stage (new-project, discuss, plan, execute, verify modifications)
- Vault Write Protocol (Obsidian MCP primary, filesystem fallback, note versioning)
- STATE.md Research Extensions (note status tracker, source gaps)
- File structure diagram
- Decision Log format
- Research Note Template
- "What Does NOT Change" list

**Remove (historical/implementation work that's done):**
- "Estimated Effort" section ("Weekend fork", Day 1/Day 2 plan)
- "Implementation: What to Actually Fork" section (file-by-file instructions — work is complete)

**Add:**
- Brief intro paragraph framing this as the design philosophy document
- Note that GSD-R was built using GSD

### 3. Delete: GSD-R-Fork-Plan.md

Content moved to `docs/DESIGN.md`. No longer needed at repo root.

### 4. Delete: .planning/DOCTORAL-QUALITY-COMPLETION.md

Historical checklist. Work is complete. No ongoing value.

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `README.md` | Rewrite | Researcher-first, author's voice, vision-forward |
| `docs/DESIGN.md` | Create | Cleaned fork plan as design reference |
| `GSD-R-Fork-Plan.md` | Delete | Content moved to docs/DESIGN.md |
| `.planning/DOCTORAL-QUALITY-COMPLETION.md` | Delete | Historical, work complete |

---

## Out of Scope

- No changes to commands, agents, workflows, templates, or code
- No new documentation files beyond docs/DESIGN.md
- No CLAUDE.md or .planning/PROJECT.md creation
- No changes to package.json, LICENSE, or other config files
- No docs/USER-GUIDE.md (referenced in current README commands table — can be created in a future milestone)

---

## Success Criteria

1. README clearly communicates GSD-R's research-first identity to an academic audience
2. Attribution to Lex Christopherson and original GSD is prominent and accurate
3. "Built using GSD" is mentioned
4. Source attachment protocol is explained clearly enough for a researcher to understand the value proposition
5. All current commands and configuration documentation is preserved
6. docs/DESIGN.md contains the full technical design without implementation-complete checklists
7. No orphaned files (fork plan and completion doc removed)
8. Tone is academic but accessible — no hype, no marketing language
