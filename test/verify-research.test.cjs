'use strict';

const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const {
  verifyTier1,
  verifyTier2,
  verifyNote,
  generateFixTasks,
} = require('../grd/bin/lib/verify-research.cjs');

// Helper: create a unique temp dir for each test
let tempDirs = [];
async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'verify-research-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of tempDirs) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
  tempDirs = [];
});

// ── Fixture helpers ──────────────────────────────────────────────────────────

function makeNote(overrides = {}) {
  const defaults = {
    project: 'TestProject',
    domain: 'test-domain',
    status: 'draft',
    date: '2026-03-11',
    sources: 2,
    keyFindings: 'GraphRAG outperforms naive RAG by 40% on multi-hop queries. The key advantage is the knowledge graph structure that preserves entity relationships across documents.',
    analysis: 'Our analysis of three frameworks (LightRAG, GraphRAG, NaiveRAG) shows that graph-based approaches consistently outperform flat retrieval on complex queries requiring multi-hop reasoning. The knowledge graph structure preserves entity relationships that are lost in chunk-based retrieval.',
    implications: 'This finding confirms that GraphRAG is the right choice for our multi-hop query pipeline. We should prioritize the graph construction phase in our implementation timeline.',
    openQuestions: '- How does GraphRAG scale beyond 100K documents?\n- What is the memory overhead of the knowledge graph on M4 16GB?',
    references: '1. HKUDS (2025). LightRAG README. `lightrag-readme_2026-03-10.md`\n2. Microsoft (2024). GraphRAG paper. `graphrag-paper_2026-03-10.pdf`',
  };
  const d = { ...defaults, ...overrides };
  return `---
project: ${d.project}
domain: ${d.domain}
status: ${d.status}
date: ${d.date}
sources: ${d.sources}
---

# Research Note

## Key Findings

${d.keyFindings}

## Analysis

${d.analysis}

## Implications for ${d.project}

${d.implications}

## Open Questions

${d.openQuestions}

## References

${d.references}
`;
}

// ─── Suite 1: verifyTier1 (goal-backward) ─────────────────────────────────

describe('verifyTier1 (goal-backward)', () => {
  it('note that answers its research question -> passed: true', () => {
    const note = makeNote();
    const question = 'Which RAG framework is best for multi-hop queries?';
    const result = verifyTier1(note, question);
    assert.equal(result.passed, true);
    assert.ok(Array.isArray(result.conditions));
    assert.ok(result.conditions.length > 0);
  });

  it('note that does not answer its question (missing key condition) -> passed: false', () => {
    const note = makeNote({
      keyFindings: 'We looked at some frameworks.',
      analysis: 'We need to do more research on this topic to determine the best framework.',
    });
    const question = 'Which RAG framework is best for multi-hop queries with benchmarks?';
    const result = verifyTier1(note, question);
    assert.equal(result.passed, false);
    assert.ok(result.conditions.some(c => c.status === 'failed'));
  });

  it('note with placeholder Analysis section -> fails with substantive reason', () => {
    const note = makeNote({
      analysis: 'TODO: Add analysis here',
    });
    const question = 'Which RAG framework is best?';
    const result = verifyTier1(note, question);
    assert.equal(result.passed, false);
    assert.ok(result.conditions.some(c => c.reason && c.reason.toLowerCase().includes('substantive')));
  });

  it('note with no Key Findings section -> fails', () => {
    const noteContent = `---
project: TestProject
domain: test-domain
status: draft
date: 2026-03-11
sources: 1
---

# Research Note

## Analysis

Some decent analysis that is long enough to be substantive and addresses the question about frameworks and their performance characteristics in detail.

## Implications for TestProject

Important implications here.

## Open Questions

- Something unknown

## References

1. Source. \`source_2026-03-10.md\`
`;
    const result = verifyTier1(noteContent, 'Which framework is best?');
    assert.equal(result.passed, false);
    assert.ok(result.conditions.some(c => c.condition.toLowerCase().includes('key findings')));
  });

  it('note with empty Open Questions about critical gaps -> passes but with warnings', () => {
    const note = makeNote({
      openQuestions: 'None at this time.',
    });
    const question = 'Which RAG framework is best for multi-hop queries?';
    const result = verifyTier1(note, question);
    assert.equal(result.passed, true);
    assert.ok(Array.isArray(result.warnings));
  });
});

// ─── Suite 2: verifyTier2 (source audit) ──────────────────────────────────

describe('verifyTier2 (source audit)', () => {
  it('all sources present and referenced -> passed: true', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'lightrag-readme_2026-03-10.md'), 'content');
    await fs.writeFile(path.join(sourcesDir, 'graphrag-paper_2026-03-10.pdf'), 'content');
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, `# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
| LightRAG | https://github.com/HKUDS/LightRAG | firecrawl | lightrag-readme_2026-03-10.md | acquired | |
| GraphRAG | https://arxiv.org/pdf/1234 | wget | graphrag-paper_2026-03-10.pdf | acquired | |
`);
    const note = makeNote();
    const result = await verifyTier2(note, sourcesDir, sourceLogPath);
    assert.equal(result.passed, true);
    assert.deepEqual(result.missing, []);
    assert.deepEqual(result.orphans, []);
  });

  it('missing source file -> passed: false', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'lightrag-readme_2026-03-10.md'), 'content');
    // graphrag-paper missing
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, `# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
| LightRAG | https://github.com/HKUDS/LightRAG | firecrawl | lightrag-readme_2026-03-10.md | acquired | |
`);
    const note = makeNote();
    const result = await verifyTier2(note, sourcesDir, sourceLogPath);
    assert.equal(result.passed, false);
    assert.ok(result.missing.includes('graphrag-paper_2026-03-10.pdf'));
  });

  it('orphan file in sources dir -> passed: true, orphans populated', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'lightrag-readme_2026-03-10.md'), 'content');
    await fs.writeFile(path.join(sourcesDir, 'graphrag-paper_2026-03-10.pdf'), 'content');
    await fs.writeFile(path.join(sourcesDir, 'extra-file_2026-03-10.md'), 'extra');
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, `# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
| LightRAG | https://github.com/HKUDS/LightRAG | firecrawl | lightrag-readme_2026-03-10.md | acquired | |
| GraphRAG | https://arxiv.org/pdf/1234 | wget | graphrag-paper_2026-03-10.pdf | acquired | |
`);
    const note = makeNote({ sources: 3 }); // 3 files on disk (2 referenced + 1 orphan)
    const result = await verifyTier2(note, sourcesDir, sourceLogPath);
    assert.equal(result.passed, true);
    assert.ok(result.orphans.includes('extra-file_2026-03-10.md'));
  });

  it('SOURCE-LOG.md missing -> passed: false', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'lightrag-readme_2026-03-10.md'), 'content');
    await fs.writeFile(path.join(sourcesDir, 'graphrag-paper_2026-03-10.pdf'), 'content');
    const note = makeNote();
    const result = await verifyTier2(note, sourcesDir, path.join(sourcesDir, 'SOURCE-LOG.md'));
    assert.equal(result.passed, false);
    assert.ok(result.issues.some(i => i.detail.includes('SOURCE-LOG.md')));
  });

  it('documented unavailable source -> passes (not counted as missing)', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'lightrag-readme_2026-03-10.md'), 'content');
    // graphrag-paper is unavailable but documented
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, `# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
| LightRAG | https://github.com/HKUDS/LightRAG | firecrawl | lightrag-readme_2026-03-10.md | acquired | |
| GraphRAG paper | https://arxiv.org/pdf/1234 | wget | -- | unavailable | 404 |
`);
    const note = makeNote({ sources: 1 }); // only 1 actual file on disk
    const result = await verifyTier2(note, sourcesDir, sourceLogPath);
    assert.equal(result.passed, true);
    assert.deepEqual(result.missing, []);
  });

  it('frontmatter sources count mismatch -> passed: false', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'lightrag-readme_2026-03-10.md'), 'content');
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, `# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
| LightRAG | https://github.com/HKUDS/LightRAG | firecrawl | lightrag-readme_2026-03-10.md | acquired | |
`);
    // Note says sources: 5 but only 1 file exists
    const note = makeNote({ sources: 5, references: '1. LightRAG. `lightrag-readme_2026-03-10.md`' });
    const result = await verifyTier2(note, sourcesDir, sourceLogPath);
    assert.equal(result.passed, false);
    assert.ok(result.issues.some(i => i.detail.includes('mismatch')));
  });
});

// ─── Suite 3: verifyNote (combined) ──────────────────────────────────────────

describe('verifyNote (combined)', () => {
  it('both tiers pass -> status: final', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'lightrag-readme_2026-03-10.md'), 'content');
    await fs.writeFile(path.join(sourcesDir, 'graphrag-paper_2026-03-10.pdf'), 'content');
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, `# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
| LightRAG | https://github.com/HKUDS/LightRAG | firecrawl | lightrag-readme_2026-03-10.md | acquired | |
| GraphRAG | https://arxiv.org/pdf/1234 | wget | graphrag-paper_2026-03-10.pdf | acquired | |
`);
    const note = makeNote();
    const question = 'Which RAG framework is best for multi-hop queries?';
    const result = await verifyNote(note, sourcesDir, sourceLogPath, question);
    assert.equal(result.status, 'final');
    assert.equal(result.tier1Result.passed, true);
    assert.equal(result.tier2Result.passed, true);
  });

  it('tier 1 fails -> status: draft, tier 2 not run', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, '# Log');
    const note = makeNote({ analysis: 'TODO: fill in' });
    const question = 'Which framework is best?';
    const result = await verifyNote(note, sourcesDir, sourceLogPath, question);
    assert.equal(result.status, 'draft');
    assert.equal(result.tier1Result.passed, false);
    assert.equal(result.tier2Result, null);
  });

  it('tier 1 passes, tier 2 fails -> status: draft', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    // No source files but note references them
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, '# Log\n\n| Source | URL | Method | File | Status | Notes |\n|---|---|---|---|---|---|\n');
    const note = makeNote();
    const question = 'Which RAG framework is best for multi-hop queries?';
    const result = await verifyNote(note, sourcesDir, sourceLogPath, question);
    assert.equal(result.status, 'draft');
    assert.equal(result.tier1Result.passed, true);
    assert.equal(result.tier2Result.passed, false);
  });

  it('tier 1 passes, tier 2 minor issues (orphans only) -> status: reviewed', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'lightrag-readme_2026-03-10.md'), 'content');
    await fs.writeFile(path.join(sourcesDir, 'graphrag-paper_2026-03-10.pdf'), 'content');
    await fs.writeFile(path.join(sourcesDir, 'extra-orphan_2026-03-10.md'), 'extra');
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, `# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
| LightRAG | https://github.com/HKUDS/LightRAG | firecrawl | lightrag-readme_2026-03-10.md | acquired | |
| GraphRAG | https://arxiv.org/pdf/1234 | wget | graphrag-paper_2026-03-10.pdf | acquired | |
`);
    const note = makeNote({ sources: 3 }); // 3 files on disk (2 referenced + 1 orphan)
    const question = 'Which RAG framework is best for multi-hop queries?';
    const result = await verifyNote(note, sourcesDir, sourceLogPath, question);
    assert.equal(result.status, 'reviewed');
    assert.equal(result.tier1Result.passed, true);
    assert.equal(result.tier2Result.passed, true);
    assert.ok(result.tier2Result.orphans.length > 0);
  });
});

// ─── Suite 4: generateFixTasks ───────────────────────────────────────────────

describe('generateFixTasks', () => {
  it('tier 1 failure -> generates research task', () => {
    const verificationResult = {
      status: 'draft',
      tier1Result: {
        passed: false,
        conditions: [
          { condition: 'Key Findings substantive', status: 'passed' },
          { condition: 'Analysis substantive', status: 'failed', reason: 'Analysis is not substantive' },
        ],
      },
      tier2Result: null,
    };
    const noteMetadata = { noteName: 'Orchestration-Frameworks', domain: 'agent-architecture' };
    const tasks = generateFixTasks(verificationResult, noteMetadata);
    assert.ok(tasks.length > 0);
    assert.ok(tasks.some(t => t.type === 'research'));
    assert.ok(tasks.some(t => t.description.length > 0));
  });

  it('tier 2 missing source -> generates acquisition task', () => {
    const verificationResult = {
      status: 'draft',
      tier1Result: { passed: true, conditions: [] },
      tier2Result: {
        passed: false,
        missing: ['missing-paper_2026-03-10.pdf'],
        orphans: [],
        issues: [{ check: 'source-files', status: 'failed', detail: 'Missing: missing-paper_2026-03-10.pdf' }],
      },
    };
    const noteMetadata = { noteName: 'Orchestration-Frameworks', domain: 'agent-architecture' };
    const tasks = generateFixTasks(verificationResult, noteMetadata);
    assert.ok(tasks.length > 0);
    assert.ok(tasks.some(t => t.type === 'acquisition'));
    assert.ok(tasks.some(t => t.description.includes('missing-paper')));
  });

  it('multiple failures -> generates multiple fix tasks', () => {
    const verificationResult = {
      status: 'draft',
      tier1Result: {
        passed: false,
        conditions: [
          { condition: 'Analysis substantive', status: 'failed', reason: 'Not substantive' },
        ],
      },
      tier2Result: {
        passed: false,
        missing: ['file-a_2026-03-10.md', 'file-b_2026-03-10.pdf'],
        orphans: [],
        issues: [],
      },
    };
    const noteMetadata = { noteName: 'Test-Note', domain: 'test' };
    const tasks = generateFixTasks(verificationResult, noteMetadata);
    assert.ok(tasks.length >= 3); // 1 research + 2 acquisition
  });

  it('fix tasks include structured description for /grd:quick', () => {
    const verificationResult = {
      status: 'draft',
      tier1Result: {
        passed: false,
        conditions: [
          { condition: 'Analysis substantive', status: 'failed', reason: 'Analysis is placeholder content' },
        ],
      },
      tier2Result: null,
    };
    const noteMetadata = { noteName: 'Test-Note', domain: 'test', researchQuestion: 'What is the best approach?' };
    const tasks = generateFixTasks(verificationResult, noteMetadata);
    assert.ok(tasks.length > 0);
    const task = tasks[0];
    assert.ok(task.description);
    assert.ok(task.priority);
    assert.ok(['high', 'medium', 'low'].includes(task.priority));
  });
});

// ─── Suite 5: Integration -- full verification pipeline ──────────────────────

describe('integration: full verification pipeline', () => {
  it('end-to-end: valid note with sources passes both tiers', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'GraphRAG-Analysis-sources');
    await fs.mkdir(sourcesDir, { recursive: true });

    // Create source files
    await fs.writeFile(path.join(sourcesDir, 'lightrag-readme_2026-03-10.md'),
      '# LightRAG\n\nA lightweight RAG framework supporting knowledge graphs.\n');
    await fs.writeFile(path.join(sourcesDir, 'graphrag-paper_2026-03-10.pdf'),
      '%PDF-1.4 fake GraphRAG paper content\n');
    await fs.writeFile(path.join(sourcesDir, 'naiverag-docs_2026-03-10.md'),
      '# NaiveRAG\n\nBasic retrieval-augmented generation without graph structure.\n');

    // Create SOURCE-LOG.md
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, `# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
| LightRAG README | https://github.com/HKUDS/LightRAG | firecrawl | lightrag-readme_2026-03-10.md | acquired | |
| GraphRAG Paper | https://arxiv.org/pdf/2024.12345 | wget | graphrag-paper_2026-03-10.pdf | acquired | 15 pages |
| NaiveRAG Docs | https://example.com/naiverag | web_fetch | naiverag-docs_2026-03-10.md | acquired | |
`);

    // Create complete research note
    const note = makeNote({
      sources: 3,
      references: [
        '1. HKUDS (2025). LightRAG README. `lightrag-readme_2026-03-10.md`',
        '2. Microsoft (2024). GraphRAG Paper. `graphrag-paper_2026-03-10.pdf`',
        '3. NaiveRAG Team (2025). NaiveRAG Docs. `naiverag-docs_2026-03-10.md`',
      ].join('\n'),
    });

    const question = 'Which RAG framework is best for multi-hop queries?';
    const result = await verifyNote(note, sourcesDir, sourceLogPath, question);

    assert.equal(result.status, 'final');
    assert.equal(result.tier1Result.passed, true);
    assert.equal(result.tier2Result.passed, true);
    assert.deepEqual(result.tier2Result.missing, []);
    assert.deepEqual(result.tier2Result.orphans, []);
    assert.ok(result.tier1Result.conditions.every(c => c.status === 'passed'));
  });
});

// ─── Suite 6: Edge cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('note with inline backticks in Analysis (not References) -> Tier 2 ignores them', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'real-source_2026-03-10.md'), 'content');
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, `# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
| Real Source | https://example.com/real | firecrawl | real-source_2026-03-10.md | acquired | |
`);

    // Note has backtick filenames in Analysis but only one in References
    const note = makeNote({
      sources: 1,
      analysis: 'Check `fake-file_2026-03-10.md` in the code. Also see `another-file.pdf` for reference. ' +
        'Our detailed analysis of the framework shows significant improvements over baseline approaches in multi-hop query performance.',
      references: '1. Real Source. `real-source_2026-03-10.md`',
    });
    const result = await verifyTier2(note, sourcesDir, sourceLogPath);
    assert.equal(result.passed, true);
    assert.deepEqual(result.missing, []);
  });

  it('research question with special characters -> Tier 1 handles gracefully', () => {
    const note = makeNote();
    const question = 'What is the "best" framework (for RAG) -- with M4/16GB & local inference?';
    const result = verifyTier1(note, question);
    // Should not throw; should process normally
    assert.ok(typeof result.passed === 'boolean');
    assert.ok(Array.isArray(result.conditions));
  });

  it('empty sources directory -> Tier 2 reports all references as missing', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'empty-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, `# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
`);

    const note = makeNote({ sources: 0 });
    const result = await verifyTier2(note, sourcesDir, sourceLogPath);
    assert.equal(result.passed, false);
    assert.equal(result.missing.length, 2); // both referenced files missing
  });

  it('fix task generation with mixed Tier 1 and Tier 2 failures', () => {
    const verificationResult = {
      status: 'draft',
      tier1Result: {
        passed: false,
        conditions: [
          { condition: 'Key Findings section is substantive', status: 'passed' },
          { condition: 'Analysis section is substantive', status: 'failed', reason: 'Analysis is not substantive' },
          { condition: 'Content addresses the research question', status: 'failed', reason: 'Low keyword overlap (10%)' },
        ],
      },
      tier2Result: {
        passed: false,
        missing: ['missing-source_2026-03-10.pdf'],
        orphans: ['orphan-file_2026-03-10.md'],
        issues: [
          { check: 'source-files', status: 'failed', detail: 'Missing: missing-source_2026-03-10.pdf' },
          { check: 'sources-count', status: 'failed', detail: 'Frontmatter sources count mismatch: declared 3, actual 1' },
        ],
      },
    };
    const noteMetadata = { noteName: 'Mixed-Failures', domain: 'test', researchQuestion: 'What went wrong?' };
    const tasks = generateFixTasks(verificationResult, noteMetadata);
    // 2 research tasks (Analysis + keyword) + 1 acquisition + 1 cleanup (sources-count)
    assert.ok(tasks.length >= 4);
    assert.ok(tasks.filter(t => t.type === 'research').length >= 2);
    assert.ok(tasks.filter(t => t.type === 'acquisition').length >= 1);
    assert.ok(tasks.filter(t => t.type === 'cleanup').length >= 1);
  });
});
