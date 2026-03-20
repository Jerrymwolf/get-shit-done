'use strict';

const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const {
  SUFFICIENCY_CRITERIA,
  discoverNotes,
  parseObjectives,
  checkObjectiveCoverage,
  checkEraCoverage,
  checkMethodologicalDiversity,
  checkEpistemologicalConsistency,
  verifySufficiency,
} = require('../grd/bin/lib/verify-sufficiency.cjs');

// Helper: create a unique temp dir for each test
let tempDirs = [];
async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'verify-sufficiency-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of tempDirs) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
  tempDirs = [];
});

// ── Fixture helper ────────────────────────────────────────────────────────────

function makeNoteFile(dir, inquiry, overrides = {}) {
  const defaults = {
    domain: 'test-domain',
    status: 'final',
    date: '2026-03-15',
    sources: 2,
    era: 'contemporary',
    methodology: 'qualitative',
    keyFindings: 'Key finding about the topic with sufficient detail for matching.',
    analysis: 'Analysis of the findings in context of the broader literature.',
    implications: 'Implications for the research project.',
  };
  const d = { ...defaults, ...overrides };
  const slug = (overrides.slug || inquiry.replace(/\s+/g, '-').toLowerCase()).slice(0, 40);
  const content = `---
inquiry: ${inquiry}
domain: ${d.domain}
status: ${d.status}
date: ${d.date}
sources: ${d.sources}
era: ${d.era}
methodology: ${d.methodology}
---

# Research Note

## Key Findings

${d.keyFindings}

## Analysis

${d.analysis}

## Implications

${d.implications}
`;
  const subDir = path.join(dir, slug);
  const filePath = path.join(subDir, `${slug}.md`);
  return { content, subDir, filePath, slug };
}

async function writeNoteFile(dir, inquiry, overrides = {}) {
  const note = makeNoteFile(dir, inquiry, overrides);
  await fs.mkdir(note.subDir, { recursive: true });
  await fs.writeFile(note.filePath, note.content);
  return note;
}

// ── Suite 1: SUFFICIENCY_CRITERIA ─────────────────────────────────────────────

describe('SUFFICIENCY_CRITERIA', () => {
  it('has all 5 review types with correct thresholds', () => {
    assert.ok(SUFFICIENCY_CRITERIA.systematic);
    assert.ok(SUFFICIENCY_CRITERIA.scoping);
    assert.ok(SUFFICIENCY_CRITERIA.integrative);
    assert.ok(SUFFICIENCY_CRITERIA.critical);
    assert.ok(SUFFICIENCY_CRITERIA.narrative);

    // systematic: strictest
    assert.equal(SUFFICIENCY_CRITERIA.systematic.min_notes_per_objective, 3);
    assert.equal(SUFFICIENCY_CRITERIA.systematic.require_primary_sources, true);
    assert.equal(SUFFICIENCY_CRITERIA.systematic.require_methodological_diversity, true);
    assert.equal(SUFFICIENCY_CRITERIA.systematic.min_eras, 3);
    assert.equal(SUFFICIENCY_CRITERIA.systematic.eras_required, true);

    // scoping
    assert.equal(SUFFICIENCY_CRITERIA.scoping.min_notes_per_objective, 1);
    assert.equal(SUFFICIENCY_CRITERIA.scoping.min_eras, 2);
    assert.equal(SUFFICIENCY_CRITERIA.scoping.eras_required, true);

    // narrative: lightest
    assert.equal(SUFFICIENCY_CRITERIA.narrative.min_notes_per_objective, 1);
    assert.equal(SUFFICIENCY_CRITERIA.narrative.min_eras, 0);
    assert.equal(SUFFICIENCY_CRITERIA.narrative.eras_required, false);

    // integrative and critical match narrative thresholds
    assert.equal(SUFFICIENCY_CRITERIA.integrative.min_notes_per_objective, 1);
    assert.equal(SUFFICIENCY_CRITERIA.integrative.eras_required, false);
    assert.equal(SUFFICIENCY_CRITERIA.critical.min_notes_per_objective, 1);
    assert.equal(SUFFICIENCY_CRITERIA.critical.eras_required, false);
  });
});

// ── Suite 2: discoverNotes ────────────────────────────────────────────────────

describe('discoverNotes', () => {
  it('finds notes in subdirectories, skips non-note files', async () => {
    const tmp = await makeTempDir();
    await writeNoteFile(tmp, 'phase-1', { slug: 'note-a' });
    await writeNoteFile(tmp, 'phase-2', { slug: 'note-b' });

    // Create a non-note file at root level
    await fs.writeFile(path.join(tmp, 'README.md'), '# Not a note');
    // Create SOURCE-LOG file in a subdirectory
    const sourceDir = path.join(tmp, 'note-a');
    await fs.writeFile(path.join(sourceDir, 'SOURCE-LOG.md'), '# Log');

    const notes = discoverNotes(tmp);
    assert.equal(notes.length, 2);
    assert.ok(notes.every(n => n.frontmatter && n.frontmatter.inquiry));
    assert.ok(notes.every(n => n.path));
  });
});

// ── Suite 3: parseObjectives ──────────────────────────────────────────────────

describe('parseObjectives', () => {
  it('extracts IDs and descriptions from REQUIREMENTS.md format', () => {
    const content = `## Objectives

- [ ] **OBJ-01**: Understand self-determination theory foundations
- [x] **OBJ-02**: Map values integration mechanisms
- [ ] **OBJ-03**: Identify measurement approaches
`;
    const objectives = parseObjectives(content);
    assert.equal(objectives.length, 3);
    assert.equal(objectives[0].id, 'OBJ-01');
    assert.ok(objectives[0].description.includes('self-determination'));
    assert.equal(objectives[1].id, 'OBJ-02');
    assert.equal(objectives[2].id, 'OBJ-03');
  });
});

// ── Suite 4: checkObjectiveCoverage ───────────────────────────────────────────

describe('checkObjectiveCoverage', () => {
  it('systematic with 3 notes per objective passes', () => {
    const notes = [
      { frontmatter: { inquiry: 'phase-1' }, keyFindings: 'SDT autonomy competence relatedness' },
      { frontmatter: { inquiry: 'phase-1' }, keyFindings: 'SDT intrinsic motivation autonomy' },
      { frontmatter: { inquiry: 'phase-1' }, keyFindings: 'SDT basic needs satisfaction autonomy' },
    ];
    const objectives = [{ id: 'OBJ-01', description: 'Understand SDT autonomy and motivation' }];
    const result = checkObjectiveCoverage(notes, objectives, 'systematic');
    assert.equal(result.sufficient, true);
    assert.equal(result.gaps.length, 0);
  });

  it('systematic with 2 notes per objective fails', () => {
    const notes = [
      { frontmatter: { inquiry: 'phase-1' }, keyFindings: 'SDT autonomy competence' },
      { frontmatter: { inquiry: 'phase-1' }, keyFindings: 'SDT intrinsic motivation' },
    ];
    const objectives = [{ id: 'OBJ-01', description: 'Understand SDT autonomy and motivation' }];
    const result = checkObjectiveCoverage(notes, objectives, 'systematic');
    assert.equal(result.sufficient, false);
    assert.ok(result.gaps.length > 0);
    assert.equal(result.gaps[0].found, 2);
    assert.equal(result.gaps[0].required, 3);
  });

  it('narrative with 1 note passes', () => {
    const notes = [
      { frontmatter: { inquiry: 'phase-1' }, keyFindings: 'values integration theory' },
    ];
    const objectives = [{ id: 'OBJ-01', description: 'Understand values integration' }];
    const result = checkObjectiveCoverage(notes, objectives, 'narrative');
    assert.equal(result.sufficient, true);
  });

  it('narrative with 0 notes fails', () => {
    const notes = [];
    const objectives = [{ id: 'OBJ-01', description: 'Understand values integration' }];
    const result = checkObjectiveCoverage(notes, objectives, 'narrative');
    assert.equal(result.sufficient, false);
    assert.ok(result.gaps.length > 0);
  });
});

// ── Suite 5: checkEraCoverage ─────────────────────────────────────────────────

describe('checkEraCoverage', () => {
  it('systematic with 3 eras passes', () => {
    const notes = [
      { frontmatter: { era: 'foundational' } },
      { frontmatter: { era: 'developmental' } },
      { frontmatter: { era: 'contemporary' } },
    ];
    const result = checkEraCoverage(notes, 'systematic', true);
    assert.equal(result.sufficient, true);
    assert.equal(result.gaps.length, 0);
  });

  it('systematic with 2 eras fails', () => {
    const notes = [
      { frontmatter: { era: 'foundational' } },
      { frontmatter: { era: 'contemporary' } },
    ];
    const result = checkEraCoverage(notes, 'systematic', true);
    assert.equal(result.sufficient, false);
    assert.ok(result.gaps.length > 0);
  });

  it('scoping with 2 eras passes', () => {
    const notes = [
      { frontmatter: { era: 'foundational' } },
      { frontmatter: { era: 'contemporary' } },
    ];
    const result = checkEraCoverage(notes, 'scoping', true);
    assert.equal(result.sufficient, true);
  });

  it('scoping with 1 era fails', () => {
    const notes = [
      { frontmatter: { era: 'contemporary' } },
    ];
    const result = checkEraCoverage(notes, 'scoping', true);
    assert.equal(result.sufficient, false);
  });

  it('narrative skips era check (eras_required=false)', () => {
    const notes = [
      { frontmatter: { era: 'contemporary' } },
    ];
    const result = checkEraCoverage(notes, 'narrative', true);
    assert.equal(result.sufficient, true);
  });

  it('temporal_positioning disabled returns skipped:true', () => {
    const notes = [
      { frontmatter: { era: 'contemporary' } },
    ];
    const result = checkEraCoverage(notes, 'systematic', false);
    assert.equal(result.sufficient, true);
    assert.equal(result.skipped, true);
  });
});

// ── Suite 6: checkMethodologicalDiversity ──────────────────────────────────────

describe('checkMethodologicalDiversity', () => {
  it('systematic with single methodology fails', () => {
    const notes = [
      { frontmatter: { inquiry: 'phase-1', methodology: 'qualitative' }, keyFindings: 'SDT autonomy' },
      { frontmatter: { inquiry: 'phase-1', methodology: 'qualitative' }, keyFindings: 'SDT motivation' },
      { frontmatter: { inquiry: 'phase-1', methodology: 'qualitative' }, keyFindings: 'SDT needs' },
    ];
    const objectives = [{ id: 'OBJ-01', description: 'Understand SDT autonomy' }];
    const result = checkMethodologicalDiversity(notes, objectives, 'systematic');
    assert.equal(result.sufficient, false);
    assert.ok(result.gaps.length > 0);
  });

  it('systematic with diverse methodologies passes', () => {
    const notes = [
      { frontmatter: { inquiry: 'phase-1', methodology: 'qualitative' }, keyFindings: 'SDT autonomy' },
      { frontmatter: { inquiry: 'phase-1', methodology: 'quantitative' }, keyFindings: 'SDT motivation' },
      { frontmatter: { inquiry: 'phase-1', methodology: 'mixed-methods' }, keyFindings: 'SDT needs' },
    ];
    const objectives = [{ id: 'OBJ-01', description: 'Understand SDT autonomy' }];
    const result = checkMethodologicalDiversity(notes, objectives, 'systematic');
    assert.equal(result.sufficient, true);
  });

  it('narrative skips diversity check', () => {
    const notes = [
      { frontmatter: { inquiry: 'phase-1', methodology: 'qualitative' }, keyFindings: 'SDT autonomy' },
    ];
    const objectives = [{ id: 'OBJ-01', description: 'Understand SDT autonomy' }];
    const result = checkMethodologicalDiversity(notes, objectives, 'narrative');
    assert.equal(result.sufficient, true);
  });
});

// ── Suite 7: checkEpistemologicalConsistency ───────────────────────────────────

describe('checkEpistemologicalConsistency', () => {
  it('pragmatist auto-passes', () => {
    const notes = [
      { frontmatter: { methodology: 'qualitative' } },
      { frontmatter: { methodology: 'quantitative' } },
    ];
    const result = checkEpistemologicalConsistency(notes, 'pragmatist');
    assert.equal(result.consistent, true);
    assert.ok(result.reason.includes('Pragmatist stance'));
  });

  it('other stance returns consistent:true as stub', () => {
    const notes = [
      { frontmatter: { methodology: 'qualitative' } },
    ];
    const result = checkEpistemologicalConsistency(notes, 'positivist');
    assert.equal(result.consistent, true);
    assert.ok(Array.isArray(result.warnings));
  });
});

// ── Suite 8: verifySufficiency ────────────────────────────────────────────────

describe('verifySufficiency', () => {
  it('combines all checks, returns sufficient:false when any gap exists', () => {
    // Only 1 note for systematic (needs 3)
    const notes = [
      { frontmatter: { inquiry: 'phase-1', era: 'contemporary', methodology: 'qualitative' }, keyFindings: 'SDT autonomy motivation' },
    ];
    const objectives = [{ id: 'OBJ-01', description: 'Understand SDT autonomy and motivation' }];
    const config = {
      review_type: 'systematic',
      workflow: { temporal_positioning: 'required' },
      epistemological_stance: 'pragmatist',
    };
    const result = verifySufficiency(notes, objectives, config);
    assert.equal(result.sufficient, false);
    assert.ok(result.gaps.length > 0);
    assert.ok(result.summary);
    assert.equal(result.summary.review_type, 'systematic');
  });

  it('sufficient narrative with 1 note per objective passes', () => {
    const notes = [
      { frontmatter: { inquiry: 'phase-1', era: 'contemporary', methodology: 'qualitative' }, keyFindings: 'values integration theory' },
    ];
    const objectives = [{ id: 'OBJ-01', description: 'Understand values integration' }];
    const config = {
      review_type: 'narrative',
      workflow: { temporal_positioning: 'optional' },
      epistemological_stance: 'pragmatist',
    };
    const result = verifySufficiency(notes, objectives, config);
    assert.equal(result.sufficient, true);
    assert.equal(result.gaps.length, 0);
  });
});
