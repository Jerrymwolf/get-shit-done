---
phase: 18
slug: research-formulation-and-notes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x / vitest (existing) |
| **Config file** | vitest.config.ts or jest.config.js (existing) |
| **Quick run command** | `npm test -- --changed` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --changed`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | FORM-01 | manual | grep verification | N/A | ⬜ pending |
| 18-01-02 | 01 | 1 | FORM-02 | manual | grep verification | N/A | ⬜ pending |
| 18-01-03 | 01 | 1 | FORM-03 | manual | grep verification | N/A | ⬜ pending |
| 18-01-04 | 01 | 1 | FORM-04 | manual | grep verification | N/A | ⬜ pending |
| 18-01-05 | 01 | 1 | FORM-05 | manual | grep verification | N/A | ⬜ pending |
| 18-01-06 | 01 | 1 | FORM-06 | manual | grep verification | N/A | ⬜ pending |
| 18-02-01 | 02 | 1 | NOTE-01 | manual | grep verification | N/A | ⬜ pending |
| 18-02-02 | 02 | 1 | NOTE-02 | manual | grep verification | N/A | ⬜ pending |
| 18-02-03 | 02 | 1 | NOTE-03 | manual | grep verification | N/A | ⬜ pending |
| 18-02-04 | 02 | 2 | TRAP-01 | manual | grep verification | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. This phase modifies templates and prompts — verification is grep-based content checking, not unit testing.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PROJECT.md prospectus format | FORM-01 | Template output — needs content review | Run `/grd:new-research` and verify PROJECT.md contains problem statement, significance, epistemological stance, review type, researcher tier, research questions, constraints |
| Researcher recharter output | FORM-02 | Agent prompt output | Verify 4 researchers produce renamed output files with research-native content |
| BOOTSTRAP.md scholarly vocab | FORM-03 | Template wording review | Grep for "state-of-the-field" vocabulary in bootstrap template |
| REQUIREMENTS.md objectives vocab | FORM-04 | Template wording review | Grep for "research objectives" / "specific aims" vocabulary |
| ROADMAP.md study plan vocab | FORM-05 | Template wording review | Grep for "research design" / "study plan" / "lines of inquiry" vocabulary |
| Evidence Quality section | NOTE-01 | Template structure review | Verify note template contains Evidence Quality section with review-type scaling |
| Note frontmatter fields | NOTE-02 | Template structure review | Grep for `era`, `review_type`, `inquiry`, `status` in note frontmatter |
| --prd and --batch flags | FORM-06 | CLI behavior testing | Run scope-inquiry with `--prd` and `--batch` flags, verify behavior |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
