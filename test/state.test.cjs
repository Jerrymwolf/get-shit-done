const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const stateModule = require('../grd/bin/lib/state.cjs');
const {
  ensureStateSections,
  cmdStateAddNote,
  cmdStateUpdateNoteStatus,
  cmdStateGetNotes,
  cmdStateAddGap,
  cmdStateResolveGap,
  cmdStateGetGaps,
} = stateModule;

// Minimal STATE.md fixture with Note Status and Source Gaps sections
const STATE_FIXTURE = `---
grd_state_version: "1.0"
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-11)

**Core value:** Test project
**Current focus:** Phase 2

## Current Position

Phase: 2 of 6 (Vault Write and State)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-03-11 -- Testing

Progress: [██░░░░░░░░] 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: 22min
- Total execution time: 1.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 3/3 | 65min | 22min |

*Updated after each plan completion*

## Accumulated Context

### Decisions

None yet.

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Note Status

| Note | Status | Sources | Last Updated |
|------|--------|---------|--------------|

## Source Gaps

| Note | Missing Source | Reason | Impact |
|------|---------------|--------|--------|

## Session Continuity

Last session: 2026-03-11T00:00:00Z
Stopped at: Testing
Resume file: None
`;

// Helper: create a temp dir with a .planning dir containing STATE.md
let tempDirs = [];
function makeTempProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'state-test-'));
  const planningDir = path.join(dir, '.planning');
  fs.mkdirSync(planningDir, { recursive: true });
  // Create minimal phases dir so frontmatter sync doesn't error
  fs.mkdirSync(path.join(planningDir, 'phases'), { recursive: true });
  fs.writeFileSync(path.join(planningDir, 'STATE.md'), STATE_FIXTURE, 'utf-8');
  // Create minimal config.json for loadConfig
  fs.writeFileSync(path.join(planningDir, 'config.json'), JSON.stringify({ mode: 'yolo' }), 'utf-8');
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  tempDirs = [];
});

// Suppress process.exit and capture output for testing cmd* functions
// The cmd* functions call output() which uses fs.writeSync(1, data) for reliable stdout writes.
// We intercept both fs.writeSync and process.stdout.write to capture results.
function captureCmd(fn) {
  let captured = '';
  const origWrite = process.stdout.write;
  const origWriteSync = fs.writeSync;
  const origExit = process.exit;
  process.stdout.write = (chunk) => { captured += chunk; return true; };
  fs.writeSync = (fd, data, ...rest) => {
    if (fd === 1) { captured += data; return data.length; }
    if (fd === 2) { return data.length; } // suppress stderr too
    return origWriteSync.call(fs, fd, data, ...rest);
  };
  process.exit = () => { throw new Error('__EXIT__'); };
  try {
    fn();
  } catch (e) {
    if (e.message !== '__EXIT__') throw e;
  } finally {
    process.stdout.write = origWrite;
    fs.writeSync = origWriteSync;
    process.exit = origExit;
  }
  try { return JSON.parse(captured); } catch { return captured; }
}

// ─── Suite 1: Note Status Operations ────────────────────────────────────────

describe('Note Status Operations', () => {
  it('cmdStateAddNote adds a note entry to the Note Status table', () => {
    const cwd = makeTempProject();
    captureCmd(() => cmdStateAddNote(cwd, {
      note: 'cognitive-load',
      status: 'draft',
      sources: '2',
      date: '2026-03-11',
    }));
    const content = fs.readFileSync(path.join(cwd, '.planning', 'STATE.md'), 'utf-8');
    assert.ok(content.includes('cognitive-load'), 'Note name should appear in STATE.md');
    assert.ok(content.includes('draft'), 'Status should appear in STATE.md');
  });

  it('cmdStateUpdateNoteStatus updates an existing note status', () => {
    const cwd = makeTempProject();
    // First add the note
    captureCmd(() => cmdStateAddNote(cwd, {
      note: 'cognitive-load',
      status: 'draft',
      sources: '2',
      date: '2026-03-11',
    }));
    // Then update its status
    captureCmd(() => cmdStateUpdateNoteStatus(cwd, 'cognitive-load', 'reviewed'));
    const content = fs.readFileSync(path.join(cwd, '.planning', 'STATE.md'), 'utf-8');
    assert.ok(content.includes('reviewed'), 'Updated status should appear');
    // Should not still have draft in the note row (but might appear elsewhere)
    const noteStatusSection = content.split('## Note Status')[1].split('## Source Gaps')[0];
    assert.ok(!noteStatusSection.includes('draft'), 'Old status should be replaced');
  });

  it('cmdStateGetNotes returns all notes with their statuses', () => {
    const cwd = makeTempProject();
    captureCmd(() => cmdStateAddNote(cwd, {
      note: 'note-a',
      status: 'draft',
      sources: '1',
      date: '2026-03-11',
    }));
    captureCmd(() => cmdStateAddNote(cwd, {
      note: 'note-b',
      status: 'final',
      sources: '3',
      date: '2026-03-11',
    }));
    const result = captureCmd(() => cmdStateGetNotes(cwd));
    assert.ok(Array.isArray(result.notes), 'Should return notes array');
    assert.equal(result.notes.length, 2, 'Should have 2 notes');
    assert.equal(result.notes[0].note, 'note-a');
    assert.equal(result.notes[1].note, 'note-b');
  });

  it('cmdStateAddNote tracks source count per note', () => {
    const cwd = makeTempProject();
    captureCmd(() => cmdStateAddNote(cwd, {
      note: 'deep-work',
      status: 'draft',
      sources: '5',
      date: '2026-03-11',
    }));
    const result = captureCmd(() => cmdStateGetNotes(cwd));
    const note = result.notes.find(n => n.note === 'deep-work');
    assert.ok(note, 'Note should exist');
    assert.equal(note.sources, '5', 'Sources count should be tracked');
  });

  it('duplicate note handling: updating existing note does not create duplicate row', () => {
    const cwd = makeTempProject();
    captureCmd(() => cmdStateAddNote(cwd, {
      note: 'cognitive-load',
      status: 'draft',
      sources: '2',
      date: '2026-03-11',
    }));
    // Add same note again with different status
    captureCmd(() => cmdStateAddNote(cwd, {
      note: 'cognitive-load',
      status: 'reviewed',
      sources: '3',
      date: '2026-03-12',
    }));
    const result = captureCmd(() => cmdStateGetNotes(cwd));
    const matches = result.notes.filter(n => n.note === 'cognitive-load');
    assert.equal(matches.length, 1, 'Should not duplicate note');
    assert.equal(matches[0].status, 'reviewed', 'Should have updated status');
  });
});

// ─── Suite 2: Source Gap Operations ─────────────────────────────────────────

describe('Source Gap Operations', () => {
  it('cmdStateAddGap adds a source gap entry to the Source Gaps table', () => {
    const cwd = makeTempProject();
    captureCmd(() => cmdStateAddGap(cwd, {
      note: 'cognitive-load',
      source: 'Sweller 1988 paper',
      reason: 'Not available online',
      impact: 'Core theory reference missing',
    }));
    const content = fs.readFileSync(path.join(cwd, '.planning', 'STATE.md'), 'utf-8');
    assert.ok(content.includes('Sweller 1988 paper'), 'Source name should appear');
    assert.ok(content.includes('Not available online'), 'Reason should appear');
  });

  it('cmdStateResolveGap removes a resolved gap from the table', () => {
    const cwd = makeTempProject();
    captureCmd(() => cmdStateAddGap(cwd, {
      note: 'cognitive-load',
      source: 'Sweller 1988 paper',
      reason: 'Not available online',
      impact: 'Core theory reference missing',
    }));
    captureCmd(() => cmdStateResolveGap(cwd, 'cognitive-load', 'Sweller 1988 paper'));
    const result = captureCmd(() => cmdStateGetGaps(cwd));
    assert.equal(result.gaps.length, 0, 'Gap should be removed after resolution');
  });

  it('cmdStateGetGaps returns all current gaps', () => {
    const cwd = makeTempProject();
    captureCmd(() => cmdStateAddGap(cwd, {
      note: 'note-a',
      source: 'source-1',
      reason: 'reason-1',
      impact: 'impact-1',
    }));
    captureCmd(() => cmdStateAddGap(cwd, {
      note: 'note-b',
      source: 'source-2',
      reason: 'reason-2',
      impact: 'impact-2',
    }));
    const result = captureCmd(() => cmdStateGetGaps(cwd));
    assert.ok(Array.isArray(result.gaps), 'Should return gaps array');
    assert.equal(result.gaps.length, 2, 'Should have 2 gaps');
  });

  it('multiple gaps per note: a single note can have multiple missing sources', () => {
    const cwd = makeTempProject();
    captureCmd(() => cmdStateAddGap(cwd, {
      note: 'cognitive-load',
      source: 'source-a',
      reason: 'reason-a',
      impact: 'impact-a',
    }));
    captureCmd(() => cmdStateAddGap(cwd, {
      note: 'cognitive-load',
      source: 'source-b',
      reason: 'reason-b',
      impact: 'impact-b',
    }));
    const result = captureCmd(() => cmdStateGetGaps(cwd));
    const cogGaps = result.gaps.filter(g => g.note === 'cognitive-load');
    assert.equal(cogGaps.length, 2, 'Should allow multiple gaps per note');
  });

  it('gap with impact: impact field captures why the missing source matters', () => {
    const cwd = makeTempProject();
    captureCmd(() => cmdStateAddGap(cwd, {
      note: 'deep-work',
      source: 'Newport 2016',
      reason: 'Library copy unavailable',
      impact: 'Cannot verify chapter 3 claims',
    }));
    const result = captureCmd(() => cmdStateGetGaps(cwd));
    const gap = result.gaps.find(g => g.source === 'Newport 2016');
    assert.ok(gap, 'Gap should exist');
    assert.equal(gap.impact, 'Cannot verify chapter 3 claims', 'Impact should be preserved');
  });
});

// ─── Suite 3: ensureStateSections ───────────────────────────────────────────

// Old-format STATE.md without Note Status or Source Gaps sections
const OLD_FORMAT_STATE = `---
grd_state_version: "1.0"
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-11)

**Core value:** Test project
**Current focus:** Phase 1

## Current Position

Phase: 1 of 6 (Fork and Foundation)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-03-11 -- Testing

Progress: [██░░░░░░░░] 17%

## Performance Metrics

*Updated after each plan completion*

## Accumulated Context

### Decisions

None yet.

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-03-11T00:00:00Z
Stopped at: Testing
Resume file: None
`;

describe('ensureStateSections', () => {
  it('adds missing Note Status and Source Gaps sections to old-format STATE.md', () => {
    const result = ensureStateSections(OLD_FORMAT_STATE);
    assert.ok(result.modified, 'Should indicate modifications were made');
    assert.ok(result.content.includes('## Note Status'), 'Should add Note Status section');
    assert.ok(result.content.includes('## Source Gaps'), 'Should add Source Gaps section');
    // Sections should appear before Session Continuity
    const noteIdx = result.content.indexOf('## Note Status');
    const gapIdx = result.content.indexOf('## Source Gaps');
    const sessionIdx = result.content.indexOf('## Session Continuity');
    assert.ok(noteIdx < sessionIdx, 'Note Status should be before Session Continuity');
    assert.ok(gapIdx < sessionIdx, 'Source Gaps should be before Session Continuity');
  });

  it('does not modify STATE.md that already has both sections', () => {
    const result = ensureStateSections(STATE_FIXTURE);
    assert.ok(!result.modified, 'Should not modify when sections exist');
  });
});

describe('Functions work with old-format STATE.md (auto-create sections)', () => {
  it('cmdStateAddNote auto-creates Note Status section if missing', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'state-test-'));
    const planningDir = path.join(dir, '.planning');
    fs.mkdirSync(planningDir, { recursive: true });
    fs.mkdirSync(path.join(planningDir, 'phases'), { recursive: true });
    fs.writeFileSync(path.join(planningDir, 'STATE.md'), OLD_FORMAT_STATE, 'utf-8');
    fs.writeFileSync(path.join(planningDir, 'config.json'), JSON.stringify({ mode: 'yolo' }), 'utf-8');
    tempDirs.push(dir);

    captureCmd(() => cmdStateAddNote(dir, {
      note: 'test-note',
      status: 'draft',
      sources: '1',
      date: '2026-03-11',
    }));
    const content = fs.readFileSync(path.join(dir, '.planning', 'STATE.md'), 'utf-8');
    assert.ok(content.includes('## Note Status'), 'Note Status section should be created');
    assert.ok(content.includes('test-note'), 'Note should be added');
  });

  it('cmdStateAddGap auto-creates Source Gaps section if missing', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'state-test-'));
    const planningDir = path.join(dir, '.planning');
    fs.mkdirSync(planningDir, { recursive: true });
    fs.mkdirSync(path.join(planningDir, 'phases'), { recursive: true });
    fs.writeFileSync(path.join(planningDir, 'STATE.md'), OLD_FORMAT_STATE, 'utf-8');
    fs.writeFileSync(path.join(planningDir, 'config.json'), JSON.stringify({ mode: 'yolo' }), 'utf-8');
    tempDirs.push(dir);

    captureCmd(() => cmdStateAddGap(dir, {
      note: 'test-note',
      source: 'test-source',
      reason: 'unavailable',
      impact: 'minor',
    }));
    const content = fs.readFileSync(path.join(dir, '.planning', 'STATE.md'), 'utf-8');
    assert.ok(content.includes('## Source Gaps'), 'Source Gaps section should be created');
    assert.ok(content.includes('test-source'), 'Gap should be added');
  });
});

// ─── Suite 4: Export Count and Upstream Feature Tests ────────────────────────

describe('state.cjs exports', () => {
  it('exports all upstream + research functions', () => {
    const exportedKeys = Object.keys(stateModule);
    assert.ok(exportedKeys.length >= 21, `Expected at least 21 exports, got ${exportedKeys.length}`);
    // Verify key upstream exports exist
    assert.ok(typeof stateModule.cmdStateUpdateProgress === 'function', 'cmdStateUpdateProgress should be a function');
    assert.ok(typeof stateModule.cmdStateSnapshot === 'function', 'cmdStateSnapshot should be a function');
    assert.ok(typeof stateModule.cmdStateJson === 'function', 'cmdStateJson should be a function');
    assert.ok(typeof stateModule.stateExtractField === 'function', 'stateExtractField should be a function');
    assert.ok(typeof stateModule.stateReplaceField === 'function', 'stateReplaceField should be a function');
    assert.ok(typeof stateModule.writeStateMd === 'function', 'writeStateMd should be a function');
    assert.ok(typeof stateModule.cmdStateLoad === 'function', 'cmdStateLoad should be a function');
    assert.ok(typeof stateModule.cmdStateGet === 'function', 'cmdStateGet should be a function');
    assert.ok(typeof stateModule.cmdStatePatch === 'function', 'cmdStatePatch should be a function');
    assert.ok(typeof stateModule.cmdStateUpdate === 'function', 'cmdStateUpdate should be a function');
    assert.ok(typeof stateModule.cmdStateAdvancePlan === 'function', 'cmdStateAdvancePlan should be a function');
    assert.ok(typeof stateModule.cmdStateRecordMetric === 'function', 'cmdStateRecordMetric should be a function');
    assert.ok(typeof stateModule.cmdStateAddDecision === 'function', 'cmdStateAddDecision should be a function');
    assert.ok(typeof stateModule.cmdStateAddBlocker === 'function', 'cmdStateAddBlocker should be a function');
    assert.ok(typeof stateModule.cmdStateResolveBlocker === 'function', 'cmdStateResolveBlocker should be a function');
    assert.ok(typeof stateModule.cmdStateRecordSession === 'function', 'cmdStateRecordSession should be a function');
    // Verify research exports exist
    assert.ok(typeof stateModule.ensureStateSections === 'function', 'ensureStateSections should be a function');
    assert.ok(typeof stateModule.cmdStateAddNote === 'function', 'cmdStateAddNote should be a function');
    assert.ok(typeof stateModule.cmdStateUpdateNoteStatus === 'function', 'cmdStateUpdateNoteStatus should be a function');
    assert.ok(typeof stateModule.cmdStateGetNotes === 'function', 'cmdStateGetNotes should be a function');
    assert.ok(typeof stateModule.cmdStateAddGap === 'function', 'cmdStateAddGap should be a function');
    assert.ok(typeof stateModule.cmdStateResolveGap === 'function', 'cmdStateResolveGap should be a function');
    assert.ok(typeof stateModule.cmdStateGetGaps === 'function', 'cmdStateGetGaps should be a function');
  });
});

describe('grd_state_version frontmatter', () => {
  it('uses grd_state_version key in built frontmatter', () => {
    const cwd = makeTempProject();
    // cmdStateJson triggers buildStateFrontmatter when frontmatter is missing/empty
    // Create a STATE.md without frontmatter to force buildStateFrontmatter
    const statePath = path.join(cwd, '.planning', 'STATE.md');
    const bodyOnly = STATE_FIXTURE.replace(/^---\n[\s\S]*?\n---\n*/, '');
    fs.writeFileSync(statePath, bodyOnly, 'utf-8');

    const result = captureCmd(() => stateModule.cmdStateJson(cwd));
    assert.ok(result.grd_state_version, 'Should have grd_state_version key');
    assert.equal(result.grd_state_version, '1.0', 'Version should be 1.0');
    assert.ok(!result.gsd_state_version, 'Should NOT have old gsd_state_version key');
  });

  it('writeStateMd syncs frontmatter with grd_state_version', () => {
    const cwd = makeTempProject();
    const statePath = path.join(cwd, '.planning', 'STATE.md');
    // Write through the writeStateMd function
    const content = fs.readFileSync(statePath, 'utf-8');
    stateModule.writeStateMd(statePath, content, cwd);
    // Read back and check frontmatter
    const written = fs.readFileSync(statePath, 'utf-8');
    assert.ok(written.includes('grd_state_version'), 'Frontmatter should contain grd_state_version');
    assert.ok(!written.includes('gsd_state_version'), 'Should not contain old gsd_state_version');
  });
});

describe('cmdStateUpdateProgress milestone scoping', () => {
  it('counts only current milestone phases when milestone config exists', () => {
    const cwd = makeTempProject();
    const phasesDir = path.join(cwd, '.planning', 'phases');

    // Create milestone-scoped phases (09-14 for v1.1) and non-milestone phases (01-06 for v1.0)
    // The milestone filter is driven by ROADMAP.md milestone ranges
    fs.mkdirSync(path.join(phasesDir, '01-foundation'), { recursive: true });
    fs.writeFileSync(path.join(phasesDir, '01-foundation', '01-01-PLAN.md'), '# plan', 'utf-8');
    fs.writeFileSync(path.join(phasesDir, '01-foundation', '01-01-SUMMARY.md'), '# summary', 'utf-8');

    fs.mkdirSync(path.join(phasesDir, '02-state'), { recursive: true });
    fs.writeFileSync(path.join(phasesDir, '02-state', '02-01-PLAN.md'), '# plan', 'utf-8');
    // No summary for phase 02 -- incomplete

    // Run cmdStateUpdateProgress -- it should count plans/summaries
    captureCmd(() => stateModule.cmdStateUpdateProgress(cwd));

    // Read back STATE.md and check progress was updated
    const content = fs.readFileSync(path.join(cwd, '.planning', 'STATE.md'), 'utf-8');
    // Should reflect 1 summary out of 2 plans = 50%
    assert.ok(content.includes('50%'), 'Progress should show 50% (1 summary / 2 plans)');
  });
});
