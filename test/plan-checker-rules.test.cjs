'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  validateResearchPlan,
  checkSourceDuplication,
  checkSourceLimits,
  checkAcquisitionMethods,
  checkContextBudget,
} = require('../grd/bin/lib/plan-checker-rules.cjs');

// ─── Fixtures ───────────────────────────────────────────────────────────────

const bootstrapEstablished = `
## Already Established (do not re-research)

| Finding | Source Note | Confidence | Date |
|---|---|---|---|
| RAG reduces hallucination by 40% | RAG-Overview.md | high | 2026-01-15 |
| LightRAG uses graph-based indexing | LightRAG-Arch.md | high | 2026-01-20 |

## Partially Established (extend, don't restart)

| Finding | What's Known | What's Missing | Source Note |
|---|---|---|---|
| Vector DB benchmarks vary by dataset | FAISS faster on small sets | Large-scale comparison | VectorDB-Bench.md |

## Not Yet Researched

| Topic | Why It Matters | Target Note |
|---|---|---|
| Hybrid search strategies | May outperform pure vector | Hybrid-Search.md |
`;

const bootstrapEmpty = `
## Already Established (do not re-research)

| Finding | Source Note | Confidence | Date |
|---|---|---|---|

## Partially Established (extend, don't restart)

| Finding | What's Known | What's Missing | Source Note |
|---|---|---|---|

## Not Yet Researched

| Topic | Why It Matters | Target Note |
|---|---|---|
`;

function makePlan(tasks) {
  return `---
phase: 04
plan: 01
type: research
---

<tasks>
${tasks}
</tasks>`;
}

function makeTask(name, sources) {
  return `<task type="research">
  <n>${name}</n>
  <sources>
${sources}
  </sources>
  <o>vault/Note.md</o>
  <action>Research this topic.</action>
</task>`;
}

// ─── Suite 1: checkSourceDuplication ────────────────────────────────────────

describe('checkSourceDuplication', () => {
  it('fails when plan finding is already Established in BOOTSTRAP.md', () => {
    const plan = makePlan(makeTask(
      'Read about RAG reduces hallucination by 40%',
      '    <src method="firecrawl" format="md">https://example.com</src>'
    ));
    const result = checkSourceDuplication(plan, bootstrapEstablished);
    assert.equal(result.valid, false);
    assert.ok(result.issues.length > 0);
    assert.ok(result.issues[0].toLowerCase().includes('duplicat') ||
              result.issues[0].toLowerCase().includes('already established'));
  });

  it('passes when finding is in Not Yet Researched tier', () => {
    const plan = makePlan(makeTask(
      'Read about Hybrid search strategies',
      '    <src method="firecrawl" format="md">https://example.com</src>'
    ));
    const result = checkSourceDuplication(plan, bootstrapEstablished);
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it('passes when finding is novel (not in BOOTSTRAP.md at all)', () => {
    const plan = makePlan(makeTask(
      'Read about quantum computing for search',
      '    <src method="firecrawl" format="md">https://example.com</src>'
    ));
    const result = checkSourceDuplication(plan, bootstrapEstablished);
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });
});

// ─── Suite 2: checkSourceLimits ─────────────────────────────────────────────

describe('checkSourceLimits', () => {
  it('passes with 3 sources', () => {
    const plan = makePlan(makeTask('Research topic', [
      '    <src method="firecrawl" format="md">https://a.com</src>',
      '    <src method="web_fetch" format="md">https://b.com</src>',
      '    <src method="wget" format="pdf">https://c.com/paper.pdf</src>',
    ].join('\n')));
    const result = checkSourceLimits(plan);
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it('fails with 4+ sources', () => {
    const plan = makePlan(makeTask('Research topic', [
      '    <src method="firecrawl" format="md">https://a.com</src>',
      '    <src method="web_fetch" format="md">https://b.com</src>',
      '    <src method="wget" format="pdf">https://c.com</src>',
      '    <src method="gh-cli" format="md">gh issue view 1</src>',
    ].join('\n')));
    const result = checkSourceLimits(plan);
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('max 3 sources per task'));
  });

  it('passes with 0 sources (non-research tasks)', () => {
    const plan = makePlan(`<task type="auto">
  <n>Write summary</n>
  <action>Summarize findings.</action>
</task>`);
    const result = checkSourceLimits(plan);
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });
});

// ─── Suite 3: checkAcquisitionMethods ───────────────────────────────────────

describe('checkAcquisitionMethods', () => {
  it('passes when all src blocks have method attribute', () => {
    const plan = makePlan(makeTask('Research topic', [
      '    <src method="firecrawl" format="md">https://a.com</src>',
      '    <src method="wget" format="pdf">https://b.com</src>',
    ].join('\n')));
    const result = checkAcquisitionMethods(plan);
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it('fails when src block missing method', () => {
    const plan = makePlan(makeTask('Research topic',
      '    <src format="md">https://a.com</src>'
    ));
    const result = checkAcquisitionMethods(plan);
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('acquisition method required'));
  });

  it('fails with invalid method value', () => {
    const plan = makePlan(makeTask('Research topic',
      '    <src method="selenium" format="md">https://a.com</src>'
    ));
    const result = checkAcquisitionMethods(plan);
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('invalid method'));
  });
});

// ─── Suite 4: checkContextBudget ────────────────────────────────────────────

describe('checkContextBudget', () => {
  it('passes with paper <30 pages as only source', () => {
    const plan = makePlan(makeTask('Read paper',
      '    <src method="wget" format="pdf" pages="28">https://arxiv.org/paper.pdf</src>'
    ));
    const result = checkContextBudget(plan);
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it('fails with >30 page paper plus other sources', () => {
    const plan = makePlan(makeTask('Read multiple', [
      '    <src method="wget" format="pdf" pages="45">https://arxiv.org/big-paper.pdf</src>',
      '    <src method="firecrawl" format="md">https://blog.com/summary</src>',
    ].join('\n')));
    const result = checkContextBudget(plan);
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('dedicated task required'));
  });

  it('passes with >30 page paper as only source (it IS the dedicated task)', () => {
    const plan = makePlan(makeTask('Deep read of large paper',
      '    <src method="wget" format="pdf" pages="52">https://arxiv.org/big-paper.pdf</src>'
    ));
    const result = checkContextBudget(plan);
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });
});

// ─── Suite 5: validateResearchPlan (integration) ────────────────────────────

describe('validateResearchPlan', () => {
  it('returns valid for a clean plan', () => {
    const plan = makePlan(makeTask('Read about Hybrid search strategies',
      '    <src method="firecrawl" format="md">https://example.com</src>'
    ));
    const result = validateResearchPlan(plan, bootstrapEstablished);
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it('reports multiple issues in issues array', () => {
    // Duplicates established finding AND has missing method AND has 4 sources
    const plan = makePlan(makeTask('Read about RAG reduces hallucination by 40%', [
      '    <src method="firecrawl" format="md">https://a.com</src>',
      '    <src format="md">https://b.com</src>',
      '    <src method="wget" format="pdf">https://c.com</src>',
      '    <src method="web_fetch" format="md">https://d.com</src>',
    ].join('\n')));
    const result = validateResearchPlan(plan, bootstrapEstablished);
    assert.equal(result.valid, false);
    assert.ok(result.issues.length >= 2, `Expected >=2 issues, got ${result.issues.length}`);
  });
});

// ─── Suite 6: Edge cases ────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('handles empty bootstrap (no findings)', () => {
    const plan = makePlan(makeTask('Research topic',
      '    <src method="firecrawl" format="md">https://example.com</src>'
    ));
    const result = checkSourceDuplication(plan, bootstrapEmpty);
    assert.equal(result.valid, true);
  });

  it('only validates research tasks, ignores auto tasks', () => {
    const plan = makePlan([
      makeTask('Research topic', '    <src method="firecrawl" format="md">https://a.com</src>'),
      `<task type="auto">
  <n>Write summary</n>
  <action>Summarize.</action>
</task>`
    ].join('\n'));
    const result = checkSourceLimits(plan);
    assert.equal(result.valid, true);
  });

  it('case-insensitive finding matching in duplication check', () => {
    const plan = makePlan(makeTask(
      'Read about rag REDUCES HALLUCINATION by 40%',
      '    <src method="firecrawl" format="md">https://example.com</src>'
    ));
    const result = checkSourceDuplication(plan, bootstrapEstablished);
    assert.equal(result.valid, false);
    assert.ok(result.issues.length > 0);
  });
});
