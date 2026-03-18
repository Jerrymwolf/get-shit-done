'use strict';

const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const { writeNote, atomicWrite, generateSourceFilename } = require('../grd/bin/lib/vault.cjs');
const { acquireSource, updateSourceLog, validateReferences, extractReferences } = require('../grd/bin/lib/acquire.cjs');
const { verifyTier1, verifyTier2, verifyNote, generateFixTasks } = require('../grd/bin/lib/verify-research.cjs');
const {
  ensureStateSections,
  cmdStateAddNote,
  cmdStateUpdateNoteStatus,
  cmdStateGetNotes,
  cmdStateAddGap,
  cmdStateResolveGap,
  cmdStateGetGaps,
} = require('../grd/bin/lib/state.cjs');

// Suppress process.exit and capture output for state cmd* functions
function captureCmd(fn) {
  let captured = '';
  const origWrite = process.stdout.write;
  const origExit = process.exit;
  process.stdout.write = (chunk) => { captured += chunk; return true; };
  process.exit = () => { throw new Error('__EXIT__'); };
  try {
    fn();
  } catch (e) {
    if (e.message !== '__EXIT__') throw e;
  } finally {
    process.stdout.write = origWrite;
    process.exit = origExit;
  }
  try { return JSON.parse(captured); } catch { return captured; }
}

// Helper: create a unique temp dir for each test
let tempDirs = [];
async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'e2e-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of tempDirs) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
  tempDirs = [];
});

// ── Helper: SOURCE-LOG.md template ──────────────────────────────────────────

const SOURCE_LOG_TEMPLATE = `# Source Acquisition Log

<!-- Status values: acquired, partial, paywall, unavailable, rate-limited -->

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
`;

// ── Helper: Build a well-formed research note ──────────────────────────────

function buildNote({ title, question, findings, analysis, implications, references }) {
  const today = new Date().toISOString().slice(0, 10);
  const refLines = (references || []).map((r, i) =>
    `${i + 1}. ${r.author} (${r.year}). ${r.title}. \`${r.file}\``
  ).join('\n');

  return `---
project: test-project
domain: agent-architecture
status: draft
date: ${today}
sources: ${(references || []).length}
---

# ${title}

## Key Findings

${findings || 'This research reveals significant findings about agent architecture patterns, including multi-agent orchestration and tool-use frameworks.'}

## Analysis

${analysis || 'The analysis of multiple sources confirms that agent architecture benefits from modular design. The orchestration layer should separate planning from execution. Tool-use frameworks provide the bridge between agent reasoning and external actions. This pattern is well-documented across multiple implementations.'}

## Implications for test-project

${implications || `These findings suggest that ${question || 'the research question'} can be addressed through modular agent design with clear separation of concerns.`}

## Open Questions

- Are there edge cases in concurrent agent execution that need further research?

## References

${refLines}
`;
}

// ─── Suite 1: Full pipeline -- note creation to verification ────────────────

describe('E2E: full pipeline -- note creation to verification', () => {
  it('creates a note, acquires sources, validates references, and verifies', async () => {
    const vault = await makeTempDir();
    const today = new Date().toISOString().slice(0, 10);
    const question = 'How do multi-agent orchestration patterns compare for tool-use?';

    // Step 1: Create a research note using writeNote
    const noteSlug = 'orchestration-patterns';
    const notePath = `${noteSlug}.md`;

    // We need source filenames first to embed in note content
    const source1File = generateSourceFilename('lightrag-readme', 'md');
    const source2File = generateSourceFilename('karma-paper', 'pdf');

    const noteContent = buildNote({
      title: 'Orchestration Patterns for Multi-Agent Systems',
      question,
      references: [
        { author: 'HKUDS', year: '2025', title: 'LightRAG README', file: source1File },
        { author: 'Xie et al.', year: '2025', title: 'KARMA Paper', file: source2File },
      ],
    });

    const writeResult = await writeNote(vault, notePath, noteContent);
    assert.ok(writeResult.notePath, 'writeNote returns notePath');
    assert.ok(writeResult.sourcesDir, 'writeNote returns sourcesDir');

    // Verify note file exists
    const noteOnDisk = await fs.readFile(writeResult.notePath, 'utf8');
    assert.ok(noteOnDisk.includes('Orchestration Patterns'));

    // Verify -sources/ directory was created
    const sourcesDirStat = await fs.stat(writeResult.sourcesDir);
    assert.ok(sourcesDirStat.isDirectory());

    // Step 2: Acquire sources using mocked toolRunner
    const toolRunner = (tool, args) => {
      if (tool === 'firecrawl') return '# LightRAG README\n\nA lightweight RAG framework for graph-based retrieval.';
      if (tool === 'wget') return Buffer.from('%PDF-1.4 fake KARMA paper content with sufficient length to pass verification');
      throw new Error(`${tool} failed`);
    };

    const acq1 = await acquireSource({
      url: 'https://github.com/HKUDS/LightRAG',
      slug: 'lightrag-readme',
      sourcesDir: writeResult.sourcesDir,
      toolRunner,
    });
    assert.equal(acq1.status, 'acquired');
    assert.equal(acq1.method, 'firecrawl');

    const acq2 = await acquireSource({
      url: 'https://arxiv.org/pdf/2502.06472',
      slug: 'karma-paper',
      sourcesDir: writeResult.sourcesDir,
      toolRunner,
    });
    assert.equal(acq2.status, 'acquired');
    assert.equal(acq2.method, 'wget');

    // Verify files saved in -sources/ directory
    const sourceFiles = await fs.readdir(writeResult.sourcesDir);
    assert.ok(sourceFiles.includes(source1File), `Expected ${source1File} in sources dir`);
    assert.ok(sourceFiles.includes(source2File), `Expected ${source2File} in sources dir`);

    // Step 3: Create and update SOURCE-LOG.md
    const sourceLogPath = path.join(writeResult.sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, SOURCE_LOG_TEMPLATE, 'utf8');

    await updateSourceLog(sourceLogPath, {
      source: 'LightRAG README',
      url: 'https://github.com/HKUDS/LightRAG',
      method: 'firecrawl',
      file: source1File,
      status: 'acquired',
      notes: '',
    });

    await updateSourceLog(sourceLogPath, {
      source: 'KARMA Paper',
      url: 'https://arxiv.org/pdf/2502.06472',
      method: 'wget',
      file: source2File,
      status: 'acquired',
      notes: '28 pages',
    });

    // Verify SOURCE-LOG.md has correct rows
    const logContent = await fs.readFile(sourceLogPath, 'utf8');
    assert.ok(logContent.includes('| LightRAG README |'));
    assert.ok(logContent.includes('| KARMA Paper |'));
    assert.ok(logContent.includes('| acquired |'));

    // Step 4: Validate references
    const valResult = await validateReferences(noteContent, writeResult.sourcesDir, sourceLogPath);
    assert.equal(valResult.valid, true, 'All references should be valid');
    assert.deepEqual(valResult.missing, []);
    assert.deepEqual(valResult.orphans, []);
    assert.equal(valResult.referenced.length, 2);

    // Step 5: Run two-tier verification
    const verifyResult = await verifyNote(noteContent, writeResult.sourcesDir, sourceLogPath, question);
    assert.ok(verifyResult.tier1Result.passed, 'Tier 1 should pass');
    assert.ok(verifyResult.tier2Result.passed, 'Tier 2 should pass');
    assert.equal(verifyResult.status, 'final', 'Status should be final when both tiers pass cleanly');
  });

  it('atomicWrite creates note + sources dir + SOURCE-LOG.md in one operation', async () => {
    const vault = await makeTempDir();

    // Use atomicWrite with a mocked gitRunner
    const gitCalls = [];
    const gitRunner = (args, opts) => {
      gitCalls.push(args[0]); // track which git commands are called
      if (args[0] === 'commit') return Buffer.from('[main abc1234] research(test): add test-note');
      return Buffer.from('');
    };

    const result = await atomicWrite({
      vaultPath: vault,
      notePath: 'test-note.md',
      content: '# Test Note\n\nContent here.',
      topic: 'test-topic',
      gitRunner,
      templatePath: path.join(__dirname, '..', 'grd', 'templates', 'source-log.md'),
    });

    assert.ok(result.notePath);
    assert.ok(result.sourcesDir);
    assert.ok(result.sourceLogPath);
    assert.equal(result.commitHash, 'abc1234');

    // Verify all artifacts exist
    const noteExists = await fs.stat(result.notePath).then(() => true).catch(() => false);
    assert.ok(noteExists, 'Note file should exist');

    const sourcesExists = await fs.stat(result.sourcesDir).then(() => true).catch(() => false);
    assert.ok(sourcesExists, 'Sources dir should exist');

    const logExists = await fs.stat(result.sourceLogPath).then(() => true).catch(() => false);
    assert.ok(logExists, 'SOURCE-LOG.md should exist');

    // Verify git commands were called
    assert.ok(gitCalls.includes('add'), 'git add should have been called');
    assert.ok(gitCalls.includes('commit'), 'git commit should have been called');
  });
});

// ─── Suite 2: Full pipeline -- failure and fix task generation ──────────────

describe('E2E: failure pipeline -- verification failure and fix tasks', () => {
  it('note with missing sources fails Tier 2 and generates acquisition fix tasks', async () => {
    const vault = await makeTempDir();
    const question = 'What are the best practices for RAG pipeline design?';

    // Create a note that references sources we will NOT provide
    const missingFile = generateSourceFilename('missing-paper', 'pdf');
    const presentFile = generateSourceFilename('present-article', 'md');

    const noteContent = buildNote({
      title: 'RAG Pipeline Design Patterns',
      question,
      references: [
        { author: 'Smith', year: '2025', title: 'Missing Paper', file: missingFile },
        { author: 'Jones', year: '2025', title: 'Present Article', file: presentFile },
      ],
    });

    // Write the note
    const writeResult = await writeNote(vault, 'rag-patterns.md', noteContent);

    // Only provide one of the two sources
    const toolRunner = (tool) => {
      if (tool === 'firecrawl') return '# Present article content with sufficient detail for verification.';
      throw new Error(`${tool} failed`);
    };

    await acquireSource({
      url: 'https://example.com/present',
      slug: 'present-article',
      sourcesDir: writeResult.sourcesDir,
      toolRunner,
    });

    // Create SOURCE-LOG.md
    const sourceLogPath = path.join(writeResult.sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, SOURCE_LOG_TEMPLATE, 'utf8');

    // Run verification -- should fail at Tier 2 (missing source)
    const verifyResult = await verifyNote(noteContent, writeResult.sourcesDir, sourceLogPath, question);
    assert.ok(verifyResult.tier1Result.passed, 'Tier 1 should pass (note content is good)');
    assert.ok(!verifyResult.tier2Result.passed, 'Tier 2 should fail (missing source)');
    assert.equal(verifyResult.status, 'draft', 'Status should be draft when Tier 2 fails');
    assert.ok(verifyResult.tier2Result.missing.includes(missingFile));

    // Generate fix tasks
    const fixTasks = generateFixTasks(verifyResult, {
      noteName: 'rag-patterns',
      domain: 'rag-pipelines',
    });

    assert.ok(fixTasks.length > 0, 'Should generate at least one fix task');
    const acquisitionTasks = fixTasks.filter(t => t.type === 'acquisition');
    assert.ok(acquisitionTasks.length > 0, 'Should have acquisition fix tasks');
    assert.ok(acquisitionTasks[0].description.includes(missingFile), 'Fix task should mention missing file');
    assert.equal(acquisitionTasks[0].priority, 'high');
  });

  it('note with placeholder content fails Tier 1 and generates research fix tasks', async () => {
    const vault = await makeTempDir();
    const question = 'How does vector search scale?';

    const noteContent = `---
project: test-project
domain: vector-search
status: draft
date: 2026-03-11
sources: 0
---

# Vector Search Scaling

## Key Findings

TODO: Fill in findings after research.

## Analysis

TBD - need to complete analysis.

## Implications for test-project

TODO: add implications here.

## Open Questions

- Everything is still open.

## References

`;

    const writeResult = await writeNote(vault, 'vector-scaling.md', noteContent);
    const sourceLogPath = path.join(writeResult.sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, SOURCE_LOG_TEMPLATE, 'utf8');

    const verifyResult = await verifyNote(noteContent, writeResult.sourcesDir, sourceLogPath, question);
    assert.ok(!verifyResult.tier1Result.passed, 'Tier 1 should fail (placeholder content)');
    assert.equal(verifyResult.tier2Result, null, 'Tier 2 should be skipped when Tier 1 fails');
    assert.equal(verifyResult.status, 'draft');

    // Generate fix tasks
    const fixTasks = generateFixTasks(verifyResult, {
      noteName: 'vector-scaling',
      domain: 'vector-search',
      researchQuestion: question,
    });

    assert.ok(fixTasks.length > 0, 'Should generate fix tasks for Tier 1 failures');
    const researchTasks = fixTasks.filter(t => t.type === 'research');
    assert.ok(researchTasks.length > 0, 'Should have research fix tasks');
    assert.equal(researchTasks[0].priority, 'high');
    assert.ok(researchTasks[0].description.includes('vector-scaling'));
  });
});

// ─── Suite 3: State tracking across the pipeline ────────────────────────────

describe('E2E: state tracking across the pipeline', () => {
  // The state.cjs functions work on STATE.md at cwd/.planning/STATE.md.
  // We create a minimal fake project with a .planning/STATE.md to test with.

  async function createFakeProject() {
    const projectDir = await makeTempDir();
    const planningDir = path.join(projectDir, '.planning');
    await fs.mkdir(planningDir, { recursive: true });
    // Also need phases dir for progress updates
    const phasesDir = path.join(planningDir, 'phases', '01-test');
    await fs.mkdir(phasesDir, { recursive: true });

    // Create a config.json (needed by some state functions)
    await fs.writeFile(path.join(planningDir, 'config.json'), JSON.stringify({
      model_profile: 'opus',
      commit_docs: true,
      branching_strategy: 'none',
      phase_branch_template: '',
      milestone_branch_template: '',
      parallelization: 'sequential',
      research: true,
      plan_checker: true,
      verifier: true,
    }), 'utf8');

    // Create a minimal STATE.md with the sections state.cjs expects
    const stateContent = `---
grd_state_version: "1.0"
---

# Project State

## Current Position

Phase: 1 of 1 (test-phase)
Plan: 1 of 1
Status: Executing
Last activity: 2026-03-11

Progress: [##########] 0%

## Session Continuity

Last session: 2026-03-11T00:00:00Z
Stopped at: Starting
Resume file: None
`;
    await fs.writeFile(path.join(planningDir, 'STATE.md'), stateContent, 'utf8');

    return projectDir;
  }

  it('tracks note through draft -> reviewed -> final lifecycle', async () => {
    const projectDir = await createFakeProject();

    // Step 1: Add a note in draft status
    captureCmd(() => cmdStateAddNote(projectDir, {
      note: 'orchestration-patterns',
      status: 'draft',
      sources: '0',
    }));

    let stateContent = await fs.readFile(path.join(projectDir, '.planning', 'STATE.md'), 'utf8');
    assert.ok(stateContent.includes('orchestration-patterns'), 'Note should appear in STATE.md');
    assert.ok(stateContent.includes('draft'), 'Note should have draft status');

    // Step 2: Update to reviewed
    captureCmd(() => cmdStateUpdateNoteStatus(projectDir, 'orchestration-patterns', 'reviewed'));
    stateContent = await fs.readFile(path.join(projectDir, '.planning', 'STATE.md'), 'utf8');
    assert.ok(stateContent.includes('reviewed'), 'Note should have reviewed status');

    // Step 3: Update to final
    captureCmd(() => cmdStateUpdateNoteStatus(projectDir, 'orchestration-patterns', 'final'));
    stateContent = await fs.readFile(path.join(projectDir, '.planning', 'STATE.md'), 'utf8');
    assert.ok(stateContent.includes('final'), 'Note should have final status');
  });

  it('tracks source gaps and their resolution', async () => {
    const projectDir = await createFakeProject();

    // Step 1: Add a source gap
    captureCmd(() => cmdStateAddGap(projectDir, {
      note: 'orchestration-patterns',
      source: 'karma-paper.pdf',
      reason: '404 not found',
      impact: 'Cannot verify KARMA architecture claims',
    }));

    let stateContent = await fs.readFile(path.join(projectDir, '.planning', 'STATE.md'), 'utf8');
    assert.ok(stateContent.includes('karma-paper.pdf'), 'Gap should appear in STATE.md');
    assert.ok(stateContent.includes('404 not found'), 'Gap reason should appear');

    // Step 2: Resolve the gap
    captureCmd(() => cmdStateResolveGap(projectDir, 'orchestration-patterns', 'karma-paper.pdf'));
    stateContent = await fs.readFile(path.join(projectDir, '.planning', 'STATE.md'), 'utf8');
    assert.ok(!stateContent.includes('karma-paper.pdf'), 'Resolved gap should be removed from STATE.md');
  });

  it('ensureStateSections adds missing sections idempotently', async () => {
    const minimal = `# Project State

## Session Continuity

Last session: now
`;
    // First call adds sections
    const result1 = ensureStateSections(minimal);
    assert.ok(result1.modified, 'Should have modified content');
    assert.ok(result1.content.includes('## Note Status'), 'Should add Note Status section');
    assert.ok(result1.content.includes('## Source Gaps'), 'Should add Source Gaps section');

    // Second call is idempotent
    const result2 = ensureStateSections(result1.content);
    assert.ok(!result2.modified, 'Should not modify content again');
  });

  it('full pipeline: create note -> add to state -> add gap -> resolve gap -> update status', async () => {
    const projectDir = await createFakeProject();
    const vault = path.join(projectDir, 'vault');
    await fs.mkdir(vault, { recursive: true });

    const question = 'How do multi-agent systems coordinate?';

    // Create note in vault
    const source1File = generateSourceFilename('source-a', 'md');
    const noteContent = buildNote({
      title: 'Agent Coordination',
      question,
      references: [
        { author: 'Doe', year: '2025', title: 'Source A', file: source1File },
      ],
    });

    const writeResult = await writeNote(vault, 'agent-coordination.md', noteContent);

    // Track note in state
    captureCmd(() => cmdStateAddNote(projectDir, { note: 'agent-coordination', status: 'draft', sources: '0' }));

    // Try to acquire source -- fails
    const failRunner = () => { throw new Error('network error'); };
    const acqResult = await acquireSource({
      url: 'https://example.com/source-a',
      slug: 'source-a',
      sourcesDir: writeResult.sourcesDir,
      toolRunner: failRunner,
      onUnavailable: ({ url, reason }) => {
        // Report gap to state
        captureCmd(() => cmdStateAddGap(projectDir, {
          note: 'agent-coordination',
          source: 'source-a',
          reason: 'network error',
          impact: 'Cannot verify claims',
        }));
      },
    });
    assert.equal(acqResult.status, 'unavailable');

    // Verify gap is tracked
    let state = await fs.readFile(path.join(projectDir, '.planning', 'STATE.md'), 'utf8');
    assert.ok(state.includes('source-a'), 'Gap should be tracked in state');

    // Now source becomes available -- retry and succeed
    const successRunner = (tool) => {
      if (tool === 'firecrawl') return '# Source A content with enough detail for verification of agent coordination patterns and multi-agent systems.';
      throw new Error(`${tool} failed`);
    };

    const acq2 = await acquireSource({
      url: 'https://example.com/source-a',
      slug: 'source-a',
      sourcesDir: writeResult.sourcesDir,
      toolRunner: successRunner,
    });
    assert.equal(acq2.status, 'acquired');

    // Resolve gap and update status
    captureCmd(() => cmdStateResolveGap(projectDir, 'agent-coordination', 'source-a'));
    captureCmd(() => cmdStateUpdateNoteStatus(projectDir, 'agent-coordination', 'reviewed'));

    state = await fs.readFile(path.join(projectDir, '.planning', 'STATE.md'), 'utf8');
    assert.ok(!state.includes('| source-a |'), 'Gap should be resolved');
    assert.ok(state.includes('reviewed'), 'Note status should be updated');

    // Create SOURCE-LOG and run verification
    const sourceLogPath = path.join(writeResult.sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, SOURCE_LOG_TEMPLATE, 'utf8');
    await updateSourceLog(sourceLogPath, {
      source: 'Source A',
      url: 'https://example.com/source-a',
      method: 'firecrawl',
      file: path.basename(acq2.filePath),
      status: 'acquired',
      notes: '',
    });

    const verifyResult = await verifyNote(noteContent, writeResult.sourcesDir, sourceLogPath, question);
    assert.ok(verifyResult.tier1Result.passed, 'Tier 1 should pass');
    assert.ok(verifyResult.tier2Result.passed, 'Tier 2 should pass');

    // Update status to final
    captureCmd(() => cmdStateUpdateNoteStatus(projectDir, 'agent-coordination', 'final'));
    state = await fs.readFile(path.join(projectDir, '.planning', 'STATE.md'), 'utf8');
    assert.ok(state.includes('final'), 'Note should be final');
  });
});
