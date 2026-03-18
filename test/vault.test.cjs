const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const {
  expandTilde,
  generateSourceFilename,
  ensureVaultDir,
  writeNote,
  atomicWrite,
} = require('../grd/bin/lib/vault.cjs');

// Helper: create a unique temp dir for each test
let tempDirs = [];
async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'vault-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of tempDirs) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
  tempDirs = [];
});

// --- expandTilde ---

describe('expandTilde', () => {
  it('expands ~/ to home directory', () => {
    const result = expandTilde('~/research');
    assert.equal(result, path.join(os.homedir(), 'research'));
  });

  it('returns absolute path unchanged', () => {
    assert.equal(expandTilde('/absolute/path'), '/absolute/path');
  });

  it('returns relative path unchanged', () => {
    assert.equal(expandTilde('relative/path'), 'relative/path');
  });
});

// --- generateSourceFilename ---

describe('generateSourceFilename', () => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  it('generates filename with slug and date', () => {
    const result = generateSourceFilename('test-slug', 'pdf');
    assert.equal(result, `test-slug_${today}.pdf`);
  });

  it('sanitizes slug: lowercase and replace special chars with hyphens', () => {
    const result = generateSourceFilename('My Paper Title!', 'md');
    assert.equal(result, `my-paper-title-_${today}.md`);
  });

  it('replaces dots in slug with hyphens', () => {
    const result = generateSourceFilename('arXiv-2502.06472', 'pdf');
    assert.equal(result, `arxiv-2502-06472_${today}.pdf`);
  });
});

// --- ensureVaultDir ---

describe('ensureVaultDir', () => {
  it('throws error for non-absolute vault path', async () => {
    await assert.rejects(
      () => ensureVaultDir('relative/path', 'note.md'),
      { message: /absolute/i }
    );
  });

  it('creates directory tree for absolute vault path', async () => {
    const tmp = await makeTempDir();
    const vaultPath = path.join(tmp, 'vault');
    const resolved = await ensureVaultDir(vaultPath, 'sub/dir/note.md');
    // Directory should exist
    const stat = await fs.stat(path.join(vaultPath, 'sub', 'dir'));
    assert.ok(stat.isDirectory());
    assert.equal(resolved, vaultPath);
  });
});

// --- writeNote ---

describe('writeNote', () => {
  it('creates the note file with content', async () => {
    const tmp = await makeTempDir();
    const result = await writeNote(tmp, 'test-note.md', '# Content');
    const content = await fs.readFile(result.notePath, 'utf8');
    assert.equal(content, '# Content');
  });

  it('creates -sources/ sibling directory', async () => {
    const tmp = await makeTempDir();
    const result = await writeNote(tmp, 'test-note.md', '# Content');
    const stat = await fs.stat(result.sourcesDir);
    assert.ok(stat.isDirectory());
    assert.ok(result.sourcesDir.endsWith('test-note-sources'));
  });

  it('creates intermediate directories for nested note paths', async () => {
    const tmp = await makeTempDir();
    const result = await writeNote(tmp, 'sub/dir/note.md', '# Content');
    const content = await fs.readFile(result.notePath, 'utf8');
    assert.equal(content, '# Content');
    const stat = await fs.stat(result.sourcesDir);
    assert.ok(stat.isDirectory());
  });

  it('throws error for non-absolute vault_path', async () => {
    await assert.rejects(
      () => writeNote('relative/path', 'note.md', 'content'),
      { message: /absolute/i }
    );
  });
});

// --- atomicWrite ---

describe('atomicWrite', () => {
  // Mock gitRunner that records calls and returns a fake commit hash
  function createMockGitRunner() {
    const calls = [];
    const runner = (args, opts) => {
      calls.push({ args, opts });
      // Return fake commit hash for commit commands
      if (args[0] === 'commit') {
        return Buffer.from('[main abc1234] research(topic): add test-note\n');
      }
      return Buffer.from('');
    };
    runner.calls = calls;
    return runner;
  }

  it('creates note.md, sources dir, and SOURCE-LOG.md', async () => {
    const tmp = await makeTempDir();
    const gitRunner = createMockGitRunner();

    const result = await atomicWrite({
      vaultPath: tmp,
      notePath: 'test-note.md',
      content: '# My Research',
      topic: 'ai-safety',
      gitRunner,
    });

    // Note file exists
    const noteContent = await fs.readFile(result.notePath, 'utf8');
    assert.equal(noteContent, '# My Research');

    // Sources dir exists
    const sourcesStat = await fs.stat(result.sourcesDir);
    assert.ok(sourcesStat.isDirectory());

    // SOURCE-LOG.md exists inside sources dir
    const sourceLogStat = await fs.stat(result.sourceLogPath);
    assert.ok(sourceLogStat.isFile());
  });

  it('SOURCE-LOG.md contains template header with empty table', async () => {
    const tmp = await makeTempDir();
    const gitRunner = createMockGitRunner();

    const result = await atomicWrite({
      vaultPath: tmp,
      notePath: 'test-note.md',
      content: '# Research',
      topic: 'topic',
      gitRunner,
    });

    const logContent = await fs.readFile(result.sourceLogPath, 'utf8');
    assert.ok(logContent.includes('Source Acquisition Log'), 'Should contain header');
    assert.ok(logContent.includes('| Source | URL |'), 'Should contain table header');
  });

  it('calls git operations with correct arguments', async () => {
    const tmp = await makeTempDir();
    const gitRunner = createMockGitRunner();

    await atomicWrite({
      vaultPath: tmp,
      notePath: 'test-note.md',
      content: '# Research',
      topic: 'ai-safety',
      gitRunner,
    });

    // Should have called git add and git commit
    assert.ok(gitRunner.calls.length >= 2, 'Should call git at least twice (add + commit)');

    const addCall = gitRunner.calls.find(c => c.args[0] === 'add');
    assert.ok(addCall, 'Should call git add');

    const commitCall = gitRunner.calls.find(c => c.args[0] === 'commit');
    assert.ok(commitCall, 'Should call git commit');
  });

  it('rolls back all artifacts when git commit fails', async () => {
    const tmp = await makeTempDir();

    // Git runner that fails on commit
    const failingGitRunner = (args) => {
      if (args[0] === 'commit') {
        throw new Error('git commit failed');
      }
      return Buffer.from('');
    };

    await assert.rejects(
      () => atomicWrite({
        vaultPath: tmp,
        notePath: 'test-note.md',
        content: '# Research',
        topic: 'topic',
        gitRunner: failingGitRunner,
      }),
      { message: /git commit failed/ }
    );

    // Verify no artifacts remain
    const entries = await fs.readdir(tmp);
    assert.equal(entries.length, 0, 'All artifacts should be cleaned up after git failure');
  });

  it('rolls back artifacts when SOURCE-LOG write fails', async () => {
    const tmp = await makeTempDir();
    const gitRunner = createMockGitRunner();

    // Provide a templatePath that doesn't exist to cause failure
    await assert.rejects(
      () => atomicWrite({
        vaultPath: tmp,
        notePath: 'test-note.md',
        content: '# Research',
        topic: 'topic',
        gitRunner,
        templatePath: '/nonexistent/path/source-log.md',
      }),
    );

    // Verify cleanup happened
    const entries = await fs.readdir(tmp);
    assert.equal(entries.length, 0, 'All artifacts should be cleaned up after write failure');
  });

  it('commit message follows research(topic): add slug format', async () => {
    const tmp = await makeTempDir();
    const gitRunner = createMockGitRunner();

    await atomicWrite({
      vaultPath: tmp,
      notePath: 'my-cool-note.md',
      content: '# Research',
      topic: 'ai-safety',
      gitRunner,
    });

    const commitCall = gitRunner.calls.find(c => c.args[0] === 'commit');
    const msgIdx = commitCall.args.indexOf('-m');
    const message = commitCall.args[msgIdx + 1];
    assert.match(message, /^research\(ai-safety\): add my-cool-note$/);
  });

  it('returns notePath, sourcesDir, sourceLogPath, and commitHash', async () => {
    const tmp = await makeTempDir();
    const gitRunner = createMockGitRunner();

    const result = await atomicWrite({
      vaultPath: tmp,
      notePath: 'test-note.md',
      content: '# Research',
      topic: 'topic',
      gitRunner,
    });

    assert.ok(result.notePath, 'Should return notePath');
    assert.ok(result.sourcesDir, 'Should return sourcesDir');
    assert.ok(result.sourceLogPath, 'Should return sourceLogPath');
    assert.ok(result.commitHash, 'Should return commitHash');
    assert.equal(result.commitHash, 'abc1234');
  });

  it('overwrites existing note file without error', async () => {
    const tmp = await makeTempDir();
    const gitRunner = createMockGitRunner();

    // Write initial note
    await atomicWrite({
      vaultPath: tmp,
      notePath: 'test-note.md',
      content: '# Original',
      topic: 'topic',
      gitRunner,
    });

    // Overwrite with new content
    const result = await atomicWrite({
      vaultPath: tmp,
      notePath: 'test-note.md',
      content: '# Updated',
      topic: 'topic',
      gitRunner,
    });

    const content = await fs.readFile(result.notePath, 'utf8');
    assert.equal(content, '# Updated');
  });

  it('throws clear error when SOURCE-LOG template is missing', async () => {
    const tmp = await makeTempDir();
    const gitRunner = createMockGitRunner();

    await assert.rejects(
      () => atomicWrite({
        vaultPath: tmp,
        notePath: 'test-note.md',
        content: '# Research',
        topic: 'topic',
        gitRunner,
        templatePath: '/nonexistent/source-log.md',
      }),
      { message: /SOURCE-LOG template/ }
    );
  });

  it('works with nested note paths', async () => {
    const tmp = await makeTempDir();
    const gitRunner = createMockGitRunner();

    const result = await atomicWrite({
      vaultPath: tmp,
      notePath: 'deep/nested/research-note.md',
      content: '# Nested Research',
      topic: 'nested-topic',
      gitRunner,
    });

    const content = await fs.readFile(result.notePath, 'utf8');
    assert.equal(content, '# Nested Research');
    assert.ok(result.sourcesDir.endsWith('research-note-sources'));
    const logStat = await fs.stat(result.sourceLogPath);
    assert.ok(logStat.isFile());
  });
});
