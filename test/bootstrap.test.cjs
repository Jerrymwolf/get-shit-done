'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  generateBootstrap,
  queryBootstrap,
  parseBootstrap,
} = require('../grd/bin/lib/bootstrap.cjs');

// ─── Fixtures ───────────────────────────────────────────────────────────────

const bootstrapFull = `# Bootstrap: Existing Research Inventory

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

const bootstrapEmpty = `# Bootstrap: Existing Research Inventory

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

// ─── Suite 1: parseBootstrap ────────────────────────────────────────────────

describe('parseBootstrap', () => {
  it('parses established findings from table', () => {
    const result = parseBootstrap(bootstrapFull);
    assert.equal(result.established.length, 2);
    assert.equal(result.established[0].finding, 'RAG reduces hallucination by 40%');
    assert.equal(result.established[0].confidence, 'high');
  });

  it('parses partially established findings', () => {
    const result = parseBootstrap(bootstrapFull);
    assert.equal(result.partial.length, 1);
    assert.equal(result.partial[0].finding, 'Vector DB benchmarks vary by dataset');
    assert.ok(result.partial[0].whatsKnown);
    assert.ok(result.partial[0].whatsMissing);
  });

  it('parses not-yet-researched topics', () => {
    const result = parseBootstrap(bootstrapFull);
    assert.equal(result.notResearched.length, 1);
    assert.equal(result.notResearched[0].topic, 'Hybrid search strategies');
  });

  it('returns empty arrays for empty tables', () => {
    const result = parseBootstrap(bootstrapEmpty);
    assert.equal(result.established.length, 0);
    assert.equal(result.partial.length, 0);
    assert.equal(result.notResearched.length, 0);
  });
});

// ─── Suite 2: generateBootstrap ─────────────────────────────────────────────

describe('generateBootstrap', () => {
  it('generates valid BOOTSTRAP.md from template', () => {
    const result = generateBootstrap({ established: [], partial: [], notResearched: [] });
    assert.ok(result.includes('## Already Established'));
    assert.ok(result.includes('## Partially Established'));
    assert.ok(result.includes('## Not Yet Researched'));
  });

  it('populates tiers from provided findings', () => {
    const findings = {
      established: [
        { finding: 'Test finding', sourceNote: 'Test.md', confidence: 'high', date: '2026-01-01' },
      ],
      partial: [
        { finding: 'Partial item', whatsKnown: 'Some info', whatsMissing: 'More info', sourceNote: 'Partial.md' },
      ],
      notResearched: [
        { topic: 'Future topic', whyItMatters: 'Important', targetNote: 'Future.md' },
      ],
    };
    const result = generateBootstrap(findings);
    assert.ok(result.includes('Test finding'));
    assert.ok(result.includes('Partial item'));
    assert.ok(result.includes('Future topic'));
  });
});

// ─── Suite 3: queryBootstrap ────────────────────────────────────────────────

describe('queryBootstrap', () => {
  it('finds established finding -> returns found true with tier', () => {
    const result = queryBootstrap(bootstrapFull, 'RAG reduces hallucination by 40%');
    assert.equal(result.found, true);
    assert.equal(result.tier, 'established');
  });

  it('returns found false for novel finding', () => {
    const result = queryBootstrap(bootstrapFull, 'quantum computing for search');
    assert.equal(result.found, false);
  });

  it('returns tier information for partial findings', () => {
    const result = queryBootstrap(bootstrapFull, 'Vector DB benchmarks vary by dataset');
    assert.equal(result.found, true);
    assert.equal(result.tier, 'partial');
    assert.ok(result.details);
  });
});

// ─── Suite 4: Edge cases ────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('parseBootstrap handles empty string', () => {
    const result = parseBootstrap('');
    assert.equal(result.established.length, 0);
    assert.equal(result.partial.length, 0);
    assert.equal(result.notResearched.length, 0);
  });

  it('parseBootstrap handles null/undefined input', () => {
    const result = parseBootstrap(null);
    assert.equal(result.established.length, 0);
  });

  it('modules can be required independently (no circular deps)', () => {
    // If this runs without throwing, there are no circular deps
    const bootstrap = require('../grd/bin/lib/bootstrap.cjs');
    assert.ok(bootstrap.parseBootstrap);
    assert.ok(bootstrap.generateBootstrap);
    assert.ok(bootstrap.queryBootstrap);
  });
});
