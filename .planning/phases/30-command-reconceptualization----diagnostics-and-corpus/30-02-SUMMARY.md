---
phase: 30-command-reconceptualization----diagnostics-and-corpus
plan: 02
subsystem: commands
tags: [map-corpus, add-verification, research-native, workflows, agents]

requires:
  - phase: 28-agent-and-workflow-reorientation
    provides: research-aware agent prompts and workflow examples
provides:
  - /grd:map-corpus surveys research corpus and knowledge landscape
  - /grd:add-verification adds evidence checks and source coverage assertions
  - grd-codebase-mapper agent has a minimal research-native prompt (was empty)
affects: [32-help-reorganization]

tech-stack:
  added: []
  patterns: [corpus-survey-pattern, evidence-check-classification, coverage-assertion-classification]

key-files:
  created: []
  modified:
    - commands/grd/map-codebase.md
    - grd/workflows/map-codebase.md
    - agents/grd-codebase-mapper.md
    - commands/grd/add-tests.md
    - grd/workflows/add-tests.md

key-decisions:
  - "Mapper agent documents reframed as corpus analysis (STACK.md = sources/databases, ARCHITECTURE.md = theoretical framework, etc.)"
  - "TDD/E2E classification replaced with Evidence Check/Coverage Assertion for research verification"

patterns-established:
  - "Evidence Check: verify factual claims against source materials"
  - "Coverage Assertion: assess completeness of domain/source coverage against CONTEXT.md criteria"

requirements-completed: [CMD-05, CMD-02]

duration: 4min
completed: 2026-03-23
---

# Phase 30 Plan 02: Map-Corpus and Add-Verification Reconceptualization Summary

**Rewrote map-codebase and add-tests commands as research-native tools: corpus landscape survey and evidence verification criteria**

## What Changed

### Task 1: Map-Codebase to Corpus Survey (a354752)
- **CLI route** (`commands/grd/map-codebase.md`): Description, examples, and when-to-use section now describe corpus/literature landscape survey instead of codebase analysis
- **Workflow** (`grd/workflows/map-codebase.md`): All 4 mapper agent prompts reframed (tech->sources, arch->framework, quality->methodology, concerns->gaps); document descriptions updated (STACK.md = sources/databases, ARCHITECTURE.md = theoretical framework, etc.)
- **Agent** (`agents/grd-codebase-mapper.md`): Written from scratch (was empty) as a 44-line research corpus mapper prompt

### Task 2: Add-Tests to Research Verification (1c227ea)
- **CLI route** (`commands/grd/add-tests.md`): Description reframed from "generate tests" to "add verification criteria for evidence quality and source coverage"
- **Workflow** (`grd/workflows/add-tests.md`): TDD replaced with Evidence Check (verify factual claims against sources); E2E replaced with Coverage Assertion (assess domain completeness); classification criteria entirely research-native

### Preserved Elements
All file paths (.planning/codebase/), tool names (grd-tools.cjs), agent names (grd-codebase-mapper), document filenames (STACK.md, ARCHITECTURE.md, etc.), YAML frontmatter keys, and AskUserQuestion usage unchanged.

## Deviations from Plan

None -- plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | a354752 | Rewrite map-codebase as corpus survey tool |
| 2 | 1c227ea | Rewrite add-tests as research verification tool |

## Self-Check: PASSED
