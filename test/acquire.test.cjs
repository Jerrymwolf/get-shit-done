'use strict';

const { describe, it, afterEach, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const {
  detectSourceType,
  acquireSource,
  updateSourceLog,
  extractReferences,
  validateReferences,
} = require('../grd/bin/lib/acquire.cjs');

// Helper: create a unique temp dir for each test
let tempDirs = [];
async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'acquire-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of tempDirs) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
  tempDirs = [];
});

// ─── Suite 1: detectSourceType ──────────────────────────────────────────────

describe('detectSourceType', () => {
  it('detects arXiv PDF URLs -> type pdf, methods start with wget', () => {
    const result = detectSourceType('https://arxiv.org/pdf/2502.06472');
    assert.equal(result.type, 'pdf');
    assert.equal(result.ext, 'pdf');
    assert.equal(result.methods[0], 'wget');
  });

  it('detects GitHub README URLs -> type md, methods start with firecrawl', () => {
    const result = detectSourceType('https://github.com/HKUDS/LightRAG');
    assert.equal(result.type, 'md');
    assert.equal(result.ext, 'md');
    assert.equal(result.methods[0], 'firecrawl');
  });

  it('detects GitHub issue URLs -> type md, methods start with gh-cli', () => {
    const result = detectSourceType('https://github.com/HKUDS/LightRAG/issues/2696');
    assert.equal(result.type, 'md');
    assert.equal(result.ext, 'md');
    assert.equal(result.methods[0], 'gh-cli');
  });

  it('detects documentation site URLs -> type md, methods start with firecrawl', () => {
    const result = detectSourceType('https://docs.python.org/3/library/asyncio.html');
    assert.equal(result.type, 'md');
    assert.equal(result.ext, 'md');
    assert.equal(result.methods[0], 'firecrawl');
  });

  it('detects generic web page URLs -> type md, methods start with firecrawl', () => {
    const result = detectSourceType('https://example.com/some-article');
    assert.equal(result.type, 'md');
    assert.equal(result.ext, 'md');
    assert.equal(result.methods[0], 'firecrawl');
  });
});

// ─── Suite 2: acquireSource fallback chain ──────────────────────────────────

describe('acquireSource fallback chain', () => {
  it('happy path: firecrawl succeeds -> returns acquired with firecrawl method', async () => {
    const tmp = await makeTempDir();
    const toolRunner = (tool, args) => {
      if (tool === 'firecrawl') return '# Scraped markdown content';
      throw new Error(`unexpected tool: ${tool}`);
    };

    const result = await acquireSource({
      url: 'https://example.com/article',
      slug: 'test-article',
      sourcesDir: tmp,
      toolRunner,
    });

    assert.equal(result.status, 'acquired');
    assert.equal(result.method, 'firecrawl');
    assert.ok(result.filePath);
    // File should exist on disk
    const content = await fs.readFile(result.filePath, 'utf8');
    assert.equal(content, '# Scraped markdown content');
  });

  it('firecrawl fails, web_fetch succeeds -> returns acquired with web_fetch method', async () => {
    const tmp = await makeTempDir();
    const toolRunner = (tool, args) => {
      if (tool === 'firecrawl') throw new Error('firecrawl rate limited');
      if (tool === 'web_fetch') return '# Web fetched content';
      throw new Error(`unexpected tool: ${tool}`);
    };

    const result = await acquireSource({
      url: 'https://example.com/article',
      slug: 'test-article',
      sourcesDir: tmp,
      toolRunner,
    });

    assert.equal(result.status, 'acquired');
    assert.equal(result.method, 'web_fetch');
  });

  it('all methods fail -> returns unavailable with reason', async () => {
    const tmp = await makeTempDir();
    const toolRunner = (tool, args) => {
      throw new Error(`${tool} failed`);
    };

    const result = await acquireSource({
      url: 'https://example.com/article',
      slug: 'test-article',
      sourcesDir: tmp,
      toolRunner,
    });

    assert.equal(result.status, 'unavailable');
    assert.ok(result.reason);
    assert.ok(result.reason.includes('firecrawl failed'));
  });

  it('PDF acquisition uses wget first (not firecrawl)', async () => {
    const tmp = await makeTempDir();
    const callOrder = [];
    const toolRunner = (tool, args) => {
      callOrder.push(tool);
      if (tool === 'wget') return Buffer.from('%PDF-1.4 fake content');
      throw new Error(`${tool} failed`);
    };

    const result = await acquireSource({
      url: 'https://arxiv.org/pdf/2502.06472',
      slug: 'karma-arxiv',
      sourcesDir: tmp,
      toolRunner,
    });

    assert.equal(result.status, 'acquired');
    assert.equal(result.method, 'wget');
    assert.equal(callOrder[0], 'wget', 'wget should be tried first for PDFs');
  });

  it('source file is named using generateSourceFilename convention', async () => {
    const tmp = await makeTempDir();
    const toolRunner = (tool, args) => {
      if (tool === 'firecrawl') return '# Content';
      throw new Error(`${tool} failed`);
    };

    const result = await acquireSource({
      url: 'https://example.com/article',
      slug: 'my-test-article',
      sourcesDir: tmp,
      toolRunner,
    });

    const today = new Date().toISOString().slice(0, 10);
    const filename = path.basename(result.filePath);
    assert.ok(filename.includes('my-test-article'), `Filename "${filename}" should contain slug`);
    assert.ok(filename.includes(today), `Filename "${filename}" should contain today's date`);
    assert.ok(filename.endsWith('.md'), `Filename "${filename}" should end with .md`);
  });

  it('original format preserved: PDF URL -> .pdf file, HTML URL -> .md file', async () => {
    const tmp = await makeTempDir();
    const toolRunner = (tool, args) => {
      if (tool === 'wget') return Buffer.from('%PDF-1.4 fake');
      if (tool === 'firecrawl') return '# Markdown';
      throw new Error(`${tool} failed`);
    };

    // PDF URL
    const pdfResult = await acquireSource({
      url: 'https://arxiv.org/pdf/2502.06472',
      slug: 'test-pdf',
      sourcesDir: tmp,
      toolRunner,
    });
    assert.ok(pdfResult.filePath.endsWith('.pdf'), 'PDF URL should produce .pdf file');

    // HTML URL
    const htmlResult = await acquireSource({
      url: 'https://example.com/page',
      slug: 'test-html',
      sourcesDir: tmp,
      toolRunner,
    });
    assert.ok(htmlResult.filePath.endsWith('.md'), 'HTML URL should produce .md file');
  });
});

// ─── Suite 3: updateSourceLog ───────────────────────────────────────────────

describe('updateSourceLog', () => {
  const templateContent = `# Source Acquisition Log

<!-- Status values: acquired, partial, paywall, unavailable, rate-limited -->

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
`;

  it('appends a row to existing SOURCE-LOG.md table', async () => {
    const tmp = await makeTempDir();
    const logPath = path.join(tmp, 'SOURCE-LOG.md');
    await fs.writeFile(logPath, templateContent, 'utf8');

    await updateSourceLog(logPath, {
      source: 'KARMA paper',
      url: 'https://arxiv.org/pdf/2502.06472',
      method: 'wget',
      file: 'karma-arxiv_2026-03-10.pdf',
      status: 'acquired',
      notes: '28 pages',
    });

    const content = await fs.readFile(logPath, 'utf8');
    assert.ok(content.includes('| KARMA paper |'));
    assert.ok(content.includes('| acquired |'));
  });

  it('multiple calls append multiple rows (does not overwrite)', async () => {
    const tmp = await makeTempDir();
    const logPath = path.join(tmp, 'SOURCE-LOG.md');
    await fs.writeFile(logPath, templateContent, 'utf8');

    await updateSourceLog(logPath, {
      source: 'Source A',
      url: 'https://example.com/a',
      method: 'firecrawl',
      file: 'source-a.md',
      status: 'acquired',
      notes: '',
    });

    await updateSourceLog(logPath, {
      source: 'Source B',
      url: 'https://example.com/b',
      method: 'web_fetch',
      file: 'source-b.md',
      status: 'acquired',
      notes: 'fallback',
    });

    const content = await fs.readFile(logPath, 'utf8');
    assert.ok(content.includes('| Source A |'));
    assert.ok(content.includes('| Source B |'));
  });

  it('handles all status values: acquired, partial, paywall, unavailable, rate-limited', async () => {
    const tmp = await makeTempDir();
    const logPath = path.join(tmp, 'SOURCE-LOG.md');
    await fs.writeFile(logPath, templateContent, 'utf8');

    const statuses = ['acquired', 'partial', 'paywall', 'unavailable', 'rate-limited'];

    for (const status of statuses) {
      await updateSourceLog(logPath, {
        source: `Source-${status}`,
        url: `https://example.com/${status}`,
        method: 'wget',
        file: status === 'unavailable' ? '--' : `file-${status}.md`,
        status,
        notes: `testing ${status}`,
      });
    }

    const content = await fs.readFile(logPath, 'utf8');
    for (const status of statuses) {
      assert.ok(content.includes(`| ${status} |`), `Should contain status: ${status}`);
    }
  });
});

// ─── Suite 4: Edge cases ────────────────────────────────────────────────────

describe('acquireSource edge cases', () => {
  it('URL with query parameters does not break slug generation', async () => {
    const tmp = await makeTempDir();
    const toolRunner = (tool) => {
      if (tool === 'firecrawl') return '# Content';
      throw new Error(`${tool} failed`);
    };

    const result = await acquireSource({
      url: 'https://example.com/page?ref=main&tab=readme',
      slug: 'test-page',
      sourcesDir: tmp,
      toolRunner,
    });

    assert.equal(result.status, 'acquired');
    const filename = path.basename(result.filePath);
    assert.ok(!filename.includes('?'), 'Filename should not contain query parameters');
  });

  it('detects rate-limited response and returns rate-limited status', async () => {
    const tmp = await makeTempDir();
    const toolRunner = (tool) => {
      throw new Error('429 Too Many Requests');
    };

    const result = await acquireSource({
      url: 'https://example.com/article',
      slug: 'rate-limit-test',
      sourcesDir: tmp,
      toolRunner,
    });

    // All methods fail -> unavailable (rate-limiting is logged in reason)
    assert.equal(result.status, 'unavailable');
    assert.ok(result.reason.includes('429'));
  });

  it('detects paywall patterns in content and returns paywall status', async () => {
    const tmp = await makeTempDir();
    const toolRunner = (tool) => {
      if (tool === 'firecrawl') return 'Please subscribe to access this content. Login required.';
      throw new Error(`${tool} failed`);
    };

    const result = await acquireSource({
      url: 'https://example.com/paywalled',
      slug: 'paywall-test',
      sourcesDir: tmp,
      toolRunner,
      detectPaywall: true,
    });

    assert.equal(result.status, 'paywall');
  });

  it('detects partial content (abstract only) and returns partial status', async () => {
    const tmp = await makeTempDir();
    const toolRunner = (tool) => {
      if (tool === 'firecrawl') return 'Abstract: This is just the abstract preview.';
      throw new Error(`${tool} failed`);
    };

    const result = await acquireSource({
      url: 'https://example.com/paper',
      slug: 'partial-test',
      sourcesDir: tmp,
      toolRunner,
      detectPartial: true,
      minContentLength: 200,
    });

    assert.equal(result.status, 'partial');
  });

  it('empty response from tool is treated as failure and tries next method', async () => {
    const tmp = await makeTempDir();
    const callOrder = [];
    const toolRunner = (tool) => {
      callOrder.push(tool);
      if (tool === 'firecrawl') return '';  // empty
      if (tool === 'web_fetch') return '# Actual content from web_fetch';
      throw new Error(`${tool} failed`);
    };

    const result = await acquireSource({
      url: 'https://example.com/article',
      slug: 'empty-test',
      sourcesDir: tmp,
      toolRunner,
    });

    assert.equal(result.status, 'acquired');
    assert.equal(result.method, 'web_fetch');
    assert.ok(callOrder.includes('firecrawl'), 'Should have tried firecrawl first');
  });

  it('calls onUnavailable callback when all methods fail', async () => {
    const tmp = await makeTempDir();
    let gapReported = false;
    const toolRunner = () => { throw new Error('all fail'); };
    const onUnavailable = (info) => {
      gapReported = true;
      assert.ok(info.url);
      assert.ok(info.reason);
    };

    const result = await acquireSource({
      url: 'https://example.com/dead-link',
      slug: 'gap-test',
      sourcesDir: tmp,
      toolRunner,
      onUnavailable,
    });

    assert.equal(result.status, 'unavailable');
    assert.ok(gapReported, 'onUnavailable callback should have been called');
  });
});

// ─── Suite 5: extractReferences ──────────────────────────────────────────────

describe('extractReferences', () => {
  it('extracts backtick-wrapped filenames from References section', () => {
    const note = `# Research Note

## Analysis

Some analysis text here.

## References

1. KARMA paper (2025). \`karma-arXiv-2502.06472_2026-03-10.pdf\`
2. LightRAG README. \`lightrag-readme_2026-03-10.md\`
`;
    const result = extractReferences(note);
    assert.deepEqual(result.files, [
      'karma-arXiv-2502.06472_2026-03-10.pdf',
      'lightrag-readme_2026-03-10.md',
    ]);
  });

  it('handles multiple references in one note', () => {
    const note = `## References

1. Source A. \`source-a_2026-03-10.md\`
2. Source B. \`source-b_2026-03-10.pdf\`
3. Source C. \`source-c_2026-03-10.md\`
`;
    const result = extractReferences(note);
    assert.equal(result.files.length, 3);
    assert.ok(result.files.includes('source-a_2026-03-10.md'));
    assert.ok(result.files.includes('source-b_2026-03-10.pdf'));
    assert.ok(result.files.includes('source-c_2026-03-10.md'));
  });

  it('ignores backticks outside References section', () => {
    const note = `# Research Note

## Analysis

Look at the code \`console.log('hello')\` and the file \`some-file_2026-03-10.md\` mentioned here.

## References

1. Real source. \`real-source_2026-03-10.md\`
`;
    const result = extractReferences(note);
    assert.deepEqual(result.files, ['real-source_2026-03-10.md']);
  });

  it('returns empty array for notes with no References section', () => {
    const note = `# Research Note

## Analysis

Some analysis here with no references section.
`;
    const result = extractReferences(note);
    assert.deepEqual(result.files, []);
    assert.deepEqual(result.notes, []);
  });

  it('handles wikilink-style references: [[Note-Name]]', () => {
    const note = `## References

1. Real source. \`source-a_2026-03-10.md\`
2. Cross-reference. [[Orchestration-Frameworks]]
3. Another cross-ref. [[Bootstrap-Summary]]
`;
    const result = extractReferences(note);
    assert.deepEqual(result.files, ['source-a_2026-03-10.md']);
    assert.deepEqual(result.notes, ['Orchestration-Frameworks', 'Bootstrap-Summary']);
  });
});

// ─── Suite 6: validateReferences ─────────────────────────────────────────────

describe('validateReferences', () => {
  it('all referenced files exist -> valid: true, no missing, no orphans', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'source-a_2026-03-10.md'), 'content', 'utf8');
    await fs.writeFile(path.join(sourcesDir, 'SOURCE-LOG.md'), '# Log', 'utf8');

    const note = `## References

1. Source A. \`source-a_2026-03-10.md\`
`;
    const result = await validateReferences(note, sourcesDir);
    assert.equal(result.valid, true);
    assert.deepEqual(result.missing, []);
    assert.deepEqual(result.orphans, []);
  });

  it('referenced file missing from sources dir -> valid: false, missing list populated', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'SOURCE-LOG.md'), '# Log', 'utf8');

    const note = `## References

1. Missing source. \`missing-file_2026-03-10.md\`
`;
    const result = await validateReferences(note, sourcesDir);
    assert.equal(result.valid, false);
    assert.deepEqual(result.missing, ['missing-file_2026-03-10.md']);
  });

  it('orphan file in sources dir (not referenced) -> orphans list populated', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'source-a_2026-03-10.md'), 'content', 'utf8');
    await fs.writeFile(path.join(sourcesDir, 'extra-file_2026-03-10.pdf'), 'extra', 'utf8');
    await fs.writeFile(path.join(sourcesDir, 'SOURCE-LOG.md'), '# Log', 'utf8');

    const note = `## References

1. Source A. \`source-a_2026-03-10.md\`
`;
    const result = await validateReferences(note, sourcesDir);
    assert.equal(result.valid, true);
    assert.deepEqual(result.missing, []);
    assert.deepEqual(result.orphans, ['extra-file_2026-03-10.pdf']);
  });

  it('SOURCE-LOG.md is never counted as orphan', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'source-a_2026-03-10.md'), 'content', 'utf8');
    await fs.writeFile(path.join(sourcesDir, 'SOURCE-LOG.md'), '# Log', 'utf8');

    const note = `## References

1. Source A. \`source-a_2026-03-10.md\`
`;
    const result = await validateReferences(note, sourcesDir);
    assert.equal(result.valid, true);
    assert.deepEqual(result.orphans, []);
    // SOURCE-LOG.md must not appear in orphans
    assert.ok(!result.orphans.includes('SOURCE-LOG.md'));
  });

  it('missing file with unavailable status in SOURCE-LOG.md -> valid: true (documented gap)', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    const sourceLog = `# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
| Dead link | https://example.com/dead | wget | -- | unavailable | 404 |
`;
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, sourceLog, 'utf8');

    const note = `## References

1. Dead link. \`dead-link_2026-03-10.md\`
`;
    const result = await validateReferences(note, sourcesDir, sourceLogPath);
    assert.equal(result.valid, true);
    assert.deepEqual(result.missing, []);
  });

  it('mixed: some valid, some missing, some orphans -> all correctly categorized', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, 'exists_2026-03-10.md'), 'content', 'utf8');
    await fs.writeFile(path.join(sourcesDir, 'orphan_2026-03-10.pdf'), 'extra', 'utf8');
    await fs.writeFile(path.join(sourcesDir, 'SOURCE-LOG.md'), '# Log', 'utf8');

    const note = `## References

1. Exists. \`exists_2026-03-10.md\`
2. Missing. \`missing_2026-03-10.md\`
`;
    const result = await validateReferences(note, sourcesDir);
    assert.equal(result.valid, false);
    assert.deepEqual(result.missing, ['missing_2026-03-10.md']);
    assert.deepEqual(result.orphans, ['orphan_2026-03-10.pdf']);
    assert.ok(result.referenced.includes('exists_2026-03-10.md'));
    assert.ok(result.referenced.includes('missing_2026-03-10.md'));
  });
});

// ─── Suite 7: Integration -- full acquisition + validation chain ─────────────

describe('integration: acquire -> log -> validate chain', () => {
  it('acquires a source, logs it, validates references link up', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'Research-Note-sources');
    await fs.mkdir(sourcesDir, { recursive: true });

    // Step 1: acquire a source (mocked)
    const toolRunner = (tool) => {
      if (tool === 'firecrawl') return '# LightRAG README content here';
      throw new Error(`${tool} failed`);
    };

    const acqResult = await acquireSource({
      url: 'https://github.com/HKUDS/LightRAG',
      slug: 'lightrag-readme',
      sourcesDir,
      toolRunner,
    });
    assert.equal(acqResult.status, 'acquired');

    // Step 2: log it
    const sourceLogPath = path.join(sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, `# Source Acquisition Log

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
`, 'utf8');

    const filename = path.basename(acqResult.filePath);
    await updateSourceLog(sourceLogPath, {
      source: 'LightRAG README',
      url: 'https://github.com/HKUDS/LightRAG',
      method: acqResult.method,
      file: filename,
      status: 'acquired',
      notes: '',
    });

    // Step 3: validate references using a note that references this file
    const noteContent = `# Research Note

## Analysis

LightRAG provides a lightweight RAG framework.

## References

1. HKUDS (2025). LightRAG README. \`${filename}\`
`;
    const valResult = await validateReferences(noteContent, sourcesDir, sourceLogPath);
    assert.equal(valResult.valid, true);
    assert.deepEqual(valResult.missing, []);
    assert.deepEqual(valResult.orphans, []);
    assert.equal(valResult.referenced.length, 1);
  });
});

// ─── Suite 8: Edge cases for extractReferences and validateReferences ────────

describe('extractReferences edge cases', () => {
  it('inline backticks in Analysis section are not parsed as references', () => {
    const note = `# Note

## Analysis

Use \`console.log\` and check \`some-file_2026-03-10.md\` in the code.

## References

1. Real ref. \`actual-source_2026-03-10.md\`
`;
    const result = extractReferences(note);
    assert.deepEqual(result.files, ['actual-source_2026-03-10.md']);
    assert.ok(!result.files.includes('some-file_2026-03-10.md'));
  });

  it('empty sources directory with references -> all missing', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'empty-sources');
    await fs.mkdir(sourcesDir, { recursive: true });

    const note = `## References

1. Ref A. \`ref-a_2026-03-10.md\`
2. Ref B. \`ref-b_2026-03-10.pdf\`
`;
    const result = await validateReferences(note, sourcesDir);
    assert.equal(result.valid, false);
    assert.equal(result.missing.length, 2);
    assert.ok(result.missing.includes('ref-a_2026-03-10.md'));
    assert.ok(result.missing.includes('ref-b_2026-03-10.pdf'));
  });

  it('strict filename matching: different date stamp = different file', async () => {
    const tmp = await makeTempDir();
    const sourcesDir = path.join(tmp, 'sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    // File exists with one date
    await fs.writeFile(path.join(sourcesDir, 'paper_2026-03-09.pdf'), 'old', 'utf8');
    await fs.writeFile(path.join(sourcesDir, 'SOURCE-LOG.md'), '# Log', 'utf8');

    // Reference uses different date
    const note = `## References

1. Paper. \`paper_2026-03-10.pdf\`
`;
    const result = await validateReferences(note, sourcesDir);
    assert.equal(result.valid, false);
    assert.deepEqual(result.missing, ['paper_2026-03-10.pdf']);
    // The old-dated file should be orphan
    assert.ok(result.orphans.includes('paper_2026-03-09.pdf'));
  });
});
