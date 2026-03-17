# README and Documentation Update Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite README.md for researcher-first identity, create docs/DESIGN.md from cleaned fork plan, delete legacy docs.

**Architecture:** Four files touched. README is a full rewrite. DESIGN.md is extracted and cleaned from GSD-R-Fork-Plan.md. Two legacy files deleted. No code changes.

**Tech Stack:** Markdown only. Git for commits.

**Spec:** `docs/superpowers/specs/2026-03-17-readme-docs-update-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `README.md` | Rewrite | Project landing page — researcher-first, vision-forward |
| `docs/DESIGN.md` | Create | Technical design reference — cleaned fork plan |
| `GSD-R-Fork-Plan.md` | Delete | Content moved to docs/DESIGN.md |
| `.planning/DOCTORAL-QUALITY-COMPLETION.md` | Delete | Historical checklist, work complete |

---

### Task 1: Create docs/DESIGN.md

Create the design reference document from `GSD-R-Fork-Plan.md`. Do this first because the README will link to it.

**Files:**
- Read: `GSD-R-Fork-Plan.md` (source material)
- Create: `docs/DESIGN.md`

- [ ] **Step 1: Read GSD-R-Fork-Plan.md for source content**

Read the full file. Identify sections to keep vs. remove per spec:

**Keep:**
- "The One Change" intro concept (reframe as design philosophy intro)
- "Translation Table"
- "Source Attachment Protocol" (full: rule, folder convention, naming, acquisition table, fallback chain, SOURCE-LOG.md format)
- "What Changes in Each GSD Stage" (new-project, discuss, plan, execute, verify)
- "Vault Write Protocol" (Obsidian MCP primary, filesystem fallback, note versioning)
- "STATE.md Research Extensions" (note status tracker, source gaps)
- "File Structure" diagram
- "Decision Log Format"
- "Research Note Template"
- "What Does NOT Change" list

**Remove:**
- "Estimated Effort" section
- "Implementation: What to Actually Fork" section

**Generalize:**
- `## Implications for ValuesPrism` → `## Implications for [Project]`
- Body text "the 22-value codebook, the 6-agent pipeline, the M4 16GB constraint, or the May 2026 timeline" → `[tie back to project constraints, goals, and timeline]`
- All other ValuesPrism-specific references → generic placeholders

- [ ] **Step 2: Write docs/DESIGN.md**

Create the file at `docs/DESIGN.md` with this structure:

```markdown
# GSD-R Design

GSD-R adapts [GSD](https://github.com/glittercowboy/get-shit-done-cc)'s context engineering architecture for academic research workflows. This document describes the design decisions, protocols, and extensions that differentiate GSD-R from its upstream. GSD-R was itself built using GSD.

For installation and usage, see [README.md](../README.md).

---

## The Core Change

[Reframe "The One Change" — atomic unit shifts from git commit to research note with attached sources]

---

## Translation Table

[Keep table exactly as-is from fork plan]

---

## Source Attachment Protocol

[Keep full section: rule, folder convention, file naming, acquisition table, fallback chain, SOURCE-LOG.md format]

---

## What Changes in Each GSD Stage

[Keep all subsections: /gsd-r:new-project, /gsd-r:discuss-phase, /gsd-r:plan-phase, /gsd-r:execute-phase, /gsd-r:verify-work]

---

## Vault Write Protocol

[Keep: Obsidian MCP primary method, filesystem fallback, note versioning]

---

## STATE.md Research Extensions

[Keep: note status tracker table, source gaps table]

---

## File Structure

[Keep file tree diagram — generalize project-specific paths]

---

## Decision Log Format

[Keep table format example]

---

## Research Note Template

[Keep template — generalize: "Implications for ValuesPrism" → "Implications for [Project]", body → generic]

---

## What Does NOT Change

[Keep full list of preserved GSD mechanics]
```

The actual content for each section comes from `GSD-R-Fork-Plan.md` — copy the section content, apply generalizations described above.

- [ ] **Step 3: Verify docs/DESIGN.md**

Check:
1. File exists at `docs/DESIGN.md`
2. No "ValuesPrism" references remain (grep for it)
3. No "22-value codebook", "6-agent pipeline", "M4 16GB", "May 2026" references remain
4. No "Estimated Effort" or "Implementation: What to Actually Fork" sections
5. Intro paragraph present with "built using GSD" mention
6. All kept sections present

```bash
# Should return zero hits:
grep -c "ValuesPrism\|22-value\|6-agent pipeline\|M4 16GB\|May 2026" docs/DESIGN.md

# Should return zero hits:
grep -c "Estimated Effort\|What to Actually Fork" docs/DESIGN.md

# Should return 1+ hits:
grep -c "built using GSD" docs/DESIGN.md
```

- [ ] **Step 4: Commit**

```bash
git add docs/DESIGN.md
git commit -m "docs: create DESIGN.md from cleaned fork plan

Extracts design reference from GSD-R-Fork-Plan.md. Removes
implementation checklists (work complete). Generalizes
project-specific references to generic placeholders."
```

---

### Task 2: Rewrite README.md

Full rewrite of the README with researcher-first framing, the author's voice, and vision-forward presentation.

**Files:**
- Rewrite: `README.md`
- Reference: `docs/DESIGN.md` (link target), current `README.md` (preserve commands/config/getting started content)

- [ ] **Step 1: Read current README.md sections to preserve**

Extract these sections verbatim from the current README for reuse (locate by `##` heading names):
- `## Commands` — all 6 tables, footnote
- `## Configuration` — core settings, model profiles, workflow agents, execution, git branching
- `## Getting Started` — install, verify, non-interactive, dev install, permissions
- `## Security` — sensitive files protection
- `## Troubleshooting` — commands not found, updating, Docker, uninstalling
- `## Community Ports` — OpenCode, Gemini, Codex

Note modifications needed:
- Commands: remove `/gsd-r:join-discord` row from Navigation table
- Configuration: replace `docs/USER-GUIDE.md` link with "See `/gsd-r:settings` for full configuration options."
- Getting Started: change "GSD evolves fast" to "GSD-R evolves fast", change "GSD is designed for" to "GSD-R is designed for"

- [ ] **Step 2: Write the new README.md**

Write the full file. Structure in order:

**1.1 Header:**
```markdown
<div align="center">

# GSD-R

**Research-grade context engineering for AI-assisted academic workflows.**

[![npm version](https://img.shields.io/npm/v/get-shit-done-r?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-shit-done-r)
[![npm downloads](https://img.shields.io/npm/dm/get-shit-done-r?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-shit-done-r)
[![Tests](https://img.shields.io/github/actions/workflow/status/glittercowboy/get-shit-done-r/test.yml?branch=main&style=for-the-badge&logo=github&label=Tests)](https://github.com/glittercowboy/get-shit-done-r/actions/workflows/test.yml)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<br>

\`\`\`bash
npx get-shit-done-r@latest
\`\`\`

**Works on Mac, Windows, and Linux.**

</div>
```

**1.2 Attribution:**
```markdown
---

## Attribution

GSD-R is a research-oriented fork of [Get Shit Done](https://github.com/glittercowboy/get-shit-done-cc) by [Lex Christopherson](https://github.com/glittercowboy) ([@gsd_foundation](https://x.com/gsd_foundation)). The original GSD system's architecture — wave parallelism, fresh subagent contexts, plan/execute/verify loop, and state management — is carried over intact. GSD-R adapts the intellectual scaffolding for academic research workflows with source attachment.

GSD-R was itself built using GSD.

Original project: [github.com/glittercowboy/get-shit-done-cc](https://github.com/glittercowboy/get-shit-done-cc)
License: MIT — see [LICENSE](LICENSE) (copyright Lex Christopherson)

---
```

**1.3 What This Is:**

Write three paragraphs per spec section 1.3. Tone: academic but accessible, no hype. Content:
- P1: Context degradation problem → GSD solved for code → GSD-R extends to research. Atomic unit = research note with physically attached source material.
- P2: How it works at a high level — discuss/plan/execute/verify loop, fresh context windows, sources saved locally, consistent note templates, citation verification.
- P3: Works for code too — inherits full GSD code development capabilities.

**1.4 How It Works:**

Six subsections matching the workflow steps, each explained through a research lens:
1. Initialize Project (`/gsd-r:new-project`)
2. Discuss Phase (`/gsd-r:discuss-phase`)
3. Plan Phase (`/gsd-r:plan-phase`) — mention research-specific agents (source, methods, architecture, limitations researchers)
4. Execute Phase (`/gsd-r:execute-phase`) — source acquisition + vault write as the atomic deliverable
5. Verify Work (`/gsd-r:verify-work`) — two-tier verification
6. Repeat → Complete → Next Milestone

Include the translation table:

```markdown
| GSD (Code) | GSD-R (Research) |
|---|---|
| Git commit | Research note + sources written to vault |
| Source code files | Source material (PDF, scraped .md, screenshot) |
| Test passes | Note passes format + citation + source-attachment check |
| `git bisect` | Note-level rollback |
| Build succeeds | Research question answered |
```

Keep the wave execution diagram from the current README (the ASCII art box, lines ~287-306).

Link to `docs/DESIGN.md`: "For the full design rationale, see [docs/DESIGN.md](docs/DESIGN.md)."

**1.5 The Research Workflow:**

Four subsections with vision-forward language ("the system is designed to", "GSD-R will"):

- Source Attachment Protocol: the rule, folder convention example, file naming, acquisition methods table, fallback chain
- Research Note Template: show the template with generic placeholders
- Two-Tier Verification: goal-backward + source audit
- BOOTSTRAP.md: one sentence defining the concept in prose (not a hyperlink to a file — `BOOTSTRAP.md` doesn't exist yet) + link to `docs/DESIGN.md` for full detail

**1.6 Quick Mode:**

Brief section on `/gsd-r:quick` — same as current README's Quick Mode section but shorter.

**1.7 Commands:**

All 6 tables from current README. Modifications:
- Remove `/gsd-r:join-discord` row from Navigation table
- Keep `/gsd-r:update` row (command file exists at `commands/gsd-r/update.md`)

**1.8 Configuration:**

Current README Configuration section. Replace the `docs/USER-GUIDE.md` link sentence with: "GSD-R stores project settings in `.planning/config.json`. Configure during `/gsd-r:new-project` or update later with `/gsd-r:settings`."

**1.9 Getting Started:**

Current README Getting Started section. Fix "GSD" → "GSD-R" in prose (not in tool names). Keep all install details, permissions.

**1.10 Security:**

Current README Security section, unchanged.

**1.11 Troubleshooting:**

Current README Troubleshooting section, unchanged.

**1.12 Community Ports:**

Current README Community Ports section, unchanged.

**1.13 License + Closing (drop Star History chart):**

```markdown
---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**AI makes research faster. GSD-R makes it rigorous.**

</div>
```

- [ ] **Step 3: Verify README.md**

Check:
1. No "Why I Built This" section
2. No "Who This Is For" section
3. No vibecoding paragraph
4. No testimonials
5. No star history chart
6. No Discord/Twitter/$GSD badges
7. No `assets/terminal.svg` reference
8. No `docs/USER-GUIDE.md` link
9. No `/gsd-r:join-discord` in command tables
10. Attribution section present with "built using GSD"
11. Translation table present
12. Wave execution diagram present
13. Link to `docs/DESIGN.md` present
14. Research Note Template shown
15. Source Attachment Protocol explained
16. All 6 command tables present
17. Configuration section present
18. Getting Started section present
19. Vision-forward language for research-specific features

```bash
# Should return zero hits:
grep -c "Why I Built This\|Who This Is For\|vibecoding\|star-history\|terminal.svg\|USER-GUIDE\|join-discord\|dexscreener" README.md
# Note: gsd_foundation intentionally kept in Attribution section — do not check for it

# Should return 1+ hits:
grep -c "built using GSD" README.md
grep -c "DESIGN.md" README.md
grep -c "Source Attachment Protocol\|source attachment" README.md
grep -c "BOOTSTRAP.md" README.md
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for GSD-R research-first identity

Replace upstream GSD narrative with researcher-first framing.
Add source attachment protocol, research note template, two-tier
verification, and translation table. Preserve all commands,
configuration, and getting started content. Remove broken links
and upstream community assets."
```

---

### Task 3: Delete Legacy Files

Remove files that have been superseded.

**Files:**
- Delete: `GSD-R-Fork-Plan.md`
- Delete: `.planning/DOCTORAL-QUALITY-COMPLETION.md`

- [ ] **Step 1: Verify content has been moved**

Before deleting, confirm:
1. `docs/DESIGN.md` exists and contains the fork plan content
2. `README.md` exists and has been rewritten

```bash
test -f docs/DESIGN.md && echo "DESIGN.md exists"
test -f README.md && echo "README.md exists"
```

- [ ] **Step 2: Delete legacy files**

```bash
git rm GSD-R-Fork-Plan.md
git rm .planning/DOCTORAL-QUALITY-COMPLETION.md
```

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove legacy docs superseded by DESIGN.md

GSD-R-Fork-Plan.md content moved to docs/DESIGN.md.
DOCTORAL-QUALITY-COMPLETION.md was a historical checklist (work complete)."
```

---

### Task 4: Final Verification

Run all success criteria checks from the spec.

**Files:**
- Read: `README.md`, `docs/DESIGN.md`

- [ ] **Step 1: Run success criteria checks**

```bash
# SC1: Research-first identity (manual read — check "What This Is" section)
# SC2: Attribution present
grep -c "Lex Christopherson" README.md  # Expected: 1+

# SC3: Built using GSD
grep -c "built using GSD" README.md  # Expected: 1+

# SC4: Source attachment protocol explained
grep -c "Source Attachment Protocol\|source attachment" README.md  # Expected: 1+

# SC5: Commands preserved (check all 6 table headers exist)
grep -c "Core Workflow\|Navigation\|Brownfield\|Phase Management\|Session\|Utilities" README.md  # Expected: 6+

# SC6: DESIGN.md has no implementation checklists
grep -c "Estimated Effort\|What to Actually Fork\|Day 1\|Day 2" docs/DESIGN.md  # Expected: 0

# SC7: No orphaned files
test ! -f GSD-R-Fork-Plan.md && echo "Fork plan deleted OK"
test ! -f .planning/DOCTORAL-QUALITY-COMPLETION.md && echo "Completion doc deleted OK"

# SC8: Tone check (manual read — no "bullshit", "garbage", marketing hype)
grep -ic "bullshit\|garbage\|incredible\|amazing\|revolutionary" README.md  # Expected: 0

# SC9: BOOTSTRAP.md mentioned with link
grep -c "BOOTSTRAP.md" README.md  # Expected: 1+

# SC10: Vision-forward language for research features
grep -c "designed to\|the system will\|GSD-R will" README.md  # Expected: 1+

# SC11: No broken links
grep -c "terminal.svg\|USER-GUIDE" README.md  # Expected: 0
grep -c "join-discord" README.md  # Expected: 0
```

- [ ] **Step 2: Verify no ValuesPrism references in DESIGN.md**

```bash
grep -ic "ValuesPrism\|22-value\|6-agent pipeline\|M4 16GB\|May 2026" docs/DESIGN.md  # Expected: 0
```

- [ ] **Step 3: Review complete — report results**

Report pass/fail for each criterion. If any fail, fix and re-commit.
