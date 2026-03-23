# Testing Patterns

**Analysis Date:** 2026-03-23

## Test Framework

**Runner:**
- Node.js built-in test runner (`node:test`) — no third-party test library
- Version: Node >= 18.0.0 (per `engines` in `package.json`)
- Config: `scripts/run-tests.cjs` (custom runner script, no config file)

**Assertion Library:**
- `node:assert/strict` — all assertions use strict mode

**Coverage:**
- `c8` (devDependency) for coverage instrumentation

**Run Commands:**
```bash
npm test                    # Run all tests via scripts/run-tests.cjs
node --test test/*.test.cjs # Run specific files directly
```

## Test File Organization

**Location:**
- All test files in `/test/` directory — separate from source, not co-located
- Source lives in `grd/bin/lib/*.cjs`

**Naming:**
- Pattern: `{module-name}.test.cjs` maps to `grd/bin/lib/{module-name}.cjs`
- Exception: `smoke.test.cjs` (multi-module integration), `e2e.test.cjs` (pipeline e2e), `namespace.test.cjs` (codebase hygiene), `template-vocabulary.test.cjs` (file content assertions)

**Structure:**
```
test/
├── smoke.test.cjs              # 4-layer smoke: structural, CLI, config, live e2e
├── e2e.test.cjs                # Full pipeline: vault → acquire → verify → state
├── core.test.cjs               # grd/bin/lib/core.cjs unit tests
├── vault.test.cjs              # grd/bin/lib/vault.cjs unit tests
├── state.test.cjs              # grd/bin/lib/state.cjs unit tests
├── acquire.test.cjs            # grd/bin/lib/acquire.cjs unit tests
├── verify-research.test.cjs    # grd/bin/lib/verify-research.cjs unit tests
├── verify-sufficiency.test.cjs # grd/bin/lib/verify-sufficiency.cjs unit tests
├── config-schema.test.cjs      # grd/bin/lib/config.cjs unit tests
├── model-profiles.test.cjs     # grd/bin/lib/model-profiles.cjs unit tests
├── bootstrap.test.cjs          # grd/bin/lib/bootstrap.cjs unit tests
├── synthesis.test.cjs          # grd/bin/lib/synthesis functions
├── tier-strip.test.cjs         # grd/bin/lib/tier-strip.cjs unit tests
├── plan-checker-rules.test.cjs # grd/bin/lib/plan-checker-rules.cjs unit tests
├── namespace.test.cjs          # Codebase hygiene: no old-namespace references
├── template-vocabulary.test.cjs # Template file content assertions
├── research-note-template.test.cjs
├── init-verify-config.test.cjs
├── researcher-recharter.test.cjs
├── scope-inquiry-flags.test.cjs
```

## Test Structure

**Suite Organization:**
```js
const { describe, it, afterEach, before, after } = require('node:test');
const assert = require('node:assert/strict');

describe('Suite Name', () => {
  it('does specific thing', () => {
    // arrange
    // act
    // assert
  });

  it('handles edge case', async () => {
    // async tests work naturally
  });
});
```

**Patterns:**
- Nested `describe` blocks for sub-suites (e.g., `describe('Suite: Label', () => { describe('sub-section', () => { ... }) })`)
- Test names are imperative sentences describing the behavior
- No `beforeEach` — setup is done inline or via `before()` at suite level
- `afterEach` used for temp dir cleanup at file scope

## Temp Directory Pattern

All tests that need filesystem access create isolated temp dirs via `os.tmpdir()` and clean them up afterward. This is the primary isolation mechanism — no mocking of `fs`.

**Per-test temp dir (array-based cleanup):**
```js
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
```

**Suite-level temp dir (cleaned in `after()`):**
```js
let projectDir;
before(async () => { projectDir = await makeSuiteTempDir(); });
after(async () => { await fsp.rm(projectDir, { recursive: true, force: true }).catch(() => {}); });
```

**Sync variant** (used in `state.test.cjs`):
```js
function makeTempProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'state-test-'));
  // ... scaffold files ...
  tempDirs.push(dir);
  return dir;
}
afterEach(() => { for (const dir of tempDirs) fs.rmSync(dir, { recursive: true, force: true }); tempDirs = []; });
```

## Mocking

**Framework:** No mocking library. All mocking is done via injected function parameters.

**Injected runner pattern** (primary mocking strategy):
```js
// Mock git runner that records calls
function createMockGitRunner() {
  const calls = [];
  const runner = (args, opts) => {
    calls.push({ args, opts });
    if (args[0] === 'commit') {
      return Buffer.from('[main abc1234] research(topic): add test-note\n');
    }
    return Buffer.from('');
  };
  runner.calls = calls;
  return runner;
}

// Failing git runner for rollback testing
const failingGitRunner = (args) => {
  if (args[0] === 'commit') throw new Error('git commit failed');
  return Buffer.from('');
};
```

**Tool runner mock** (for external tool acquisition):
```js
const toolRunner = (tool, args) => {
  if (tool === 'firecrawl') return '# Scraped markdown content';
  throw new Error(`unexpected tool: ${tool}`);
};
```

**stdout/exit capture** (for `cmd*` functions that write to stdout and call `process.exit`):
```js
function captureCmd(fn) {
  let captured = '';
  const origWrite = process.stdout.write;
  const origWriteSync = fs.writeSync;
  const origExit = process.exit;
  process.stdout.write = (chunk) => { captured += chunk; return true; };
  fs.writeSync = (fd, data, ...rest) => {
    if (fd === 1) { captured += data; return data.length; }
    if (fd === 2) { return data.length; } // suppress stderr
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
```

**What to mock:**
- External tools (`firecrawl`, `wget`, `gh-cli`) via injected `toolRunner`
- Git operations via injected `gitRunner`
- stdout/exit for `cmd*` functions via `captureCmd`

**What NOT to mock:**
- The real filesystem — use real temp dirs instead
- Node built-in modules (`fs`, `path`, `os`)
- Internal library functions — test them through their public API

## Fixtures

**Inline string fixtures** for markdown/frontmatter content:
```js
const STATE_FIXTURE = `---
grd_state_version: "1.0"
---
# Project State
...
`;
```

**Factory functions** for complex note content:
```js
function makeNote(overrides = {}) {
  const defaults = { project: 'TestProject', domain: 'test-domain', ... };
  const d = { ...defaults, ...overrides };
  return `---\nproject: ${d.project}\n...\n`;
}
```

**Scaffolded temp project** used in `smoke.test.cjs` Layer 4 — creates a full `.planning/` directory tree with config, STATE.md, ROADMAP.md, and a PLAN.md, then runs real CLI commands against it.

## CLI Testing Pattern

Tests that exercise the CLI use `execFileSync` via a `run()` helper:
```js
const GRD_TOOLS = path.join(ROOT, 'grd', 'bin', 'grd-tools.cjs');

function run(args, opts = {}) {
  return execFileSync('node', [GRD_TOOLS, ...args], {
    cwd: opts.cwd || ROOT,
    encoding: 'utf-8',
    timeout: 10000,
    env: { ...process.env, NODE_ENV: 'test' },
  }).trim();
}

function runJSON(args, opts = {}) {
  const raw = run([...args, '--raw'], opts);
  return JSON.parse(raw);
}

function tryRun(args, opts = {}) {
  try { return { ok: true, output: run(args, opts) }; }
  catch (e) { return { ok: false, stderr: e.stderr, code: e.status }; }
}
```

`tryRun` is used when the command may exit non-zero (verify commands with no data, health checks). `runJSON` is used when structured data is expected.

## Async Testing

```js
it('creates note file and sources dir', async () => {
  const tmp = await makeTempDir();
  const result = await writeNote(tmp, 'test-note.md', '# Content');
  const content = await fs.readFile(result.notePath, 'utf8');
  assert.equal(content, '# Content');
});
```

## Error / Rejection Testing

```js
it('throws error for non-absolute vault path', async () => {
  await assert.rejects(
    () => ensureVaultDir('relative/path', 'note.md'),
    { message: /absolute/i }
  );
});

it('rolls back when git commit fails', async () => {
  await assert.rejects(
    () => atomicWrite({ ... gitRunner: failingGitRunner }),
    { message: /git commit failed/ }
  );
  // Verify filesystem state after rollback
  const entries = await fs.readdir(tmp);
  assert.equal(entries.length, 0, 'All artifacts should be cleaned up');
});
```

## Test Types

**Unit Tests:**
- One-to-one with library modules: `vault.test.cjs` → `vault.cjs`, `state.test.cjs` → `state.cjs`
- Test pure logic functions directly (no I/O stubs)
- Use real filesystem via temp dirs

**Integration Tests:**
- `e2e.test.cjs` — tests the full vault → acquire → verify-research → verify-sufficiency → state pipeline using real filesystem and injected mock runners
- `smoke.test.cjs` Layer 4 — scaffolds a full research project and runs real CLI commands

**Structural / Hygiene Tests:**
- `smoke.test.cjs` Layer 1 — asserts all expected `.cjs` modules, workflow `.md` files, agent files, template files, and reference files exist on disk
- `namespace.test.cjs` — scans the entire `grd/` and `test/` tree for old-namespace string patterns to prevent regressions
- `template-vocabulary.test.cjs` — reads template files and asserts specific section headings exist or don't exist

## Coverage

**Requirements:** No coverage threshold enforced.

**Run Coverage:**
```bash
npx c8 npm test
```

---

*Testing analysis: 2026-03-23*
