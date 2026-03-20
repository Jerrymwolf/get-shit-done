'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  RIGOR_LEVELS,
  validateResearchPlan,
  checkSourceDuplication,
  checkSourceLimits,
  checkAcquisitionMethods,
  checkContextBudget,
  checkPrimarySourceRatio,
  checkSearchStrategy,
  checkCriteria,
} = require('../grd/bin/lib/plan-checker-rules.cjs');

// ─── Fixtures ───────────────────────────────────────────────────────────────

const bootstrapEstablished = `
## Established Knowledge

| Finding | Source Note | Confidence | Date |
|---|---|---|---|
| RAG reduces hallucination by 40% | RAG-Overview.md | high | 2026-01-15 |
| LightRAG uses graph-based indexing | LightRAG-Arch.md | high | 2026-01-20 |

## Contested Claims

| Finding | What's Known | What's Missing | Source Note |
|---|---|---|---|
| Vector DB benchmarks vary by dataset | FAISS faster on small sets | Large-scale comparison | VectorDB-Bench.md |

## Knowledge Gaps

| Topic | Why It Matters | Target Note |
|---|---|---|
| Hybrid search strategies | May outperform pure vector | Hybrid-Search.md |
`;

const bootstrapEmpty = `
## Established Knowledge

| Finding | Source Note | Confidence | Date |
|---|---|---|---|

## Contested Claims

| Finding | What's Known | What's Missing | Source Note |
|---|---|---|---|

## Knowledge Gaps

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

function makePlanWithBlocks(tasks, searchStrategy, criteria) {
  let plan = `---
phase: 04
plan: 01
type: research
---

<tasks>
${tasks}
</tasks>`;
  if (searchStrategy) plan += '\n' + searchStrategy;
  if (criteria) plan += '\n' + criteria;
  return plan;
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

  it('passes when finding is in Knowledge Gaps tier', () => {
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
    const plan = makePlanWithBlocks(
      makeTask('Read about Hybrid search strategies',
        '    <src method="firecrawl" format="md" tier="primary">https://example.com</src>'
      ),
      `<search-strategy>
  <databases>PubMed</databases>
  <keywords>hybrid search</keywords>
  <date-range>2020-2026</date-range>
</search-strategy>`,
      `<criteria>
  <include>English, peer-reviewed</include>
  <exclude>Non-empirical</exclude>
</criteria>`
    );
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

// ─── Suite 7: RIGOR_LEVELS table ────────────────────────────────────────────

describe('RIGOR_LEVELS table', () => {
  it('strict: all checks are error severity', () => {
    assert.equal(RIGOR_LEVELS.strict.primary_source_ratio, 'error');
    assert.equal(RIGOR_LEVELS.strict.search_strategy, 'error');
    assert.equal(RIGOR_LEVELS.strict.criteria, 'error');
  });

  it('moderate: primary_source_ratio is warning, others error', () => {
    assert.equal(RIGOR_LEVELS.moderate.primary_source_ratio, 'warning');
    assert.equal(RIGOR_LEVELS.moderate.search_strategy, 'error');
    assert.equal(RIGOR_LEVELS.moderate.criteria, 'error');
  });

  it('light: all checks are warning severity', () => {
    assert.equal(RIGOR_LEVELS.light.primary_source_ratio, 'warning');
    assert.equal(RIGOR_LEVELS.light.search_strategy, 'warning');
    assert.equal(RIGOR_LEVELS.light.criteria, 'warning');
  });
});

// ─── Suite 8: checkPrimarySourceRatio ───────────────────────────────────────

describe('checkPrimarySourceRatio', () => {
  it('errors when below 50% at strict', () => {
    const plan = makePlan(makeTask('Research topic', [
      '    <src method="firecrawl" format="md" tier="primary">https://a.com</src>',
      '    <src method="web_fetch" format="md" tier="secondary">https://b.com</src>',
      '    <src method="wget" format="pdf" tier="tertiary">https://c.com</src>',
    ].join('\n')));
    const result = checkPrimarySourceRatio(plan, 'strict');
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('below 50%'));
    assert.equal(result.warnings.length, 0);
  });

  it('warns when below 50% at light', () => {
    const plan = makePlan(makeTask('Research topic', [
      '    <src method="firecrawl" format="md" tier="primary">https://a.com</src>',
      '    <src method="web_fetch" format="md" tier="secondary">https://b.com</src>',
      '    <src method="wget" format="pdf" tier="tertiary">https://c.com</src>',
    ].join('\n')));
    const result = checkPrimarySourceRatio(plan, 'light');
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
    assert.ok(result.warnings[0].includes('below 50%'));
  });

  it('passes when above 50% at strict', () => {
    const plan = makePlan(makeTask('Research topic', [
      '    <src method="firecrawl" format="md" tier="primary">https://a.com</src>',
      '    <src method="web_fetch" format="md" tier="primary">https://b.com</src>',
      '    <src method="wget" format="pdf" tier="secondary">https://c.com</src>',
    ].join('\n')));
    const result = checkPrimarySourceRatio(plan, 'strict');
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it('passes with 0 sources (nothing to check)', () => {
    const plan = makePlan(`<task type="auto">
  <n>Write summary</n>
  <action>Summarize.</action>
</task>`);
    const result = checkPrimarySourceRatio(plan, 'strict');
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it('ignores non-research tasks', () => {
    const plan = makePlan(`<task type="auto">
  <n>Build thing</n>
  <sources>
    <src method="firecrawl" format="md" tier="tertiary">https://a.com</src>
  </sources>
</task>`);
    const result = checkPrimarySourceRatio(plan, 'strict');
    assert.equal(result.valid, true);
  });
});

// ─── Suite 9: checkSearchStrategy ───────────────────────────────────────────

describe('checkSearchStrategy', () => {
  it('errors when block missing at strict', () => {
    const plan = makePlan(makeTask('Research topic',
      '    <src method="firecrawl" format="md">https://a.com</src>'
    ));
    const result = checkSearchStrategy(plan, 'strict');
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('Missing <search-strategy>'));
  });

  it('warns when block missing at light', () => {
    const plan = makePlan(makeTask('Research topic',
      '    <src method="firecrawl" format="md">https://a.com</src>'
    ));
    const result = checkSearchStrategy(plan, 'light');
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
    assert.ok(result.warnings[0].includes('Missing'));
  });

  it('passes with complete block at strict', () => {
    const plan = makePlanWithBlocks(
      makeTask('Research topic', '    <src method="firecrawl" format="md">https://a.com</src>'),
      `<search-strategy>
  <databases>PubMed, Scopus</databases>
  <keywords>SDT, motivation</keywords>
  <date-range>2020-2026</date-range>
</search-strategy>`,
      null
    );
    const result = checkSearchStrategy(plan, 'strict');
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it('errors when missing keywords at strict', () => {
    const plan = makePlanWithBlocks(
      makeTask('Research topic', '    <src method="firecrawl" format="md">https://a.com</src>'),
      `<search-strategy>
  <databases>PubMed</databases>
  <date-range>2020-2026</date-range>
</search-strategy>`,
      null
    );
    const result = checkSearchStrategy(plan, 'strict');
    assert.equal(result.valid, false);
    assert.ok(result.issues.some(i => i.includes('missing required field: <keywords>')));
  });
});

// ─── Suite 10: checkCriteria ────────────────────────────────────────────────

describe('checkCriteria', () => {
  it('errors when block missing at strict', () => {
    const plan = makePlan(makeTask('Research topic',
      '    <src method="firecrawl" format="md">https://a.com</src>'
    ));
    const result = checkCriteria(plan, 'strict');
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('Missing <criteria>'));
  });

  it('warns when block missing at light', () => {
    const plan = makePlan(makeTask('Research topic',
      '    <src method="firecrawl" format="md">https://a.com</src>'
    ));
    const result = checkCriteria(plan, 'light');
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
    assert.ok(result.warnings[0].includes('Missing'));
  });

  it('passes with complete block at strict', () => {
    const plan = makePlanWithBlocks(
      makeTask('Research topic', '    <src method="firecrawl" format="md">https://a.com</src>'),
      null,
      `<criteria>
  <include>English language, peer-reviewed, 2020-2026</include>
  <exclude>Conference abstracts, non-empirical</exclude>
</criteria>`
    );
    const result = checkCriteria(plan, 'strict');
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it('errors when missing exclude sub-element at strict', () => {
    const plan = makePlanWithBlocks(
      makeTask('Research topic', '    <src method="firecrawl" format="md">https://a.com</src>'),
      null,
      `<criteria>
  <include>English language, peer-reviewed</include>
</criteria>`
    );
    const result = checkCriteria(plan, 'strict');
    assert.equal(result.valid, false);
    assert.ok(result.issues.some(i => i.includes('missing <exclude>')));
  });
});

// ─── Suite 11: Graduated enforcement ────────────────────────────────────────

describe('Graduated enforcement', () => {
  const planWithIssues = makePlan(makeTask('Research topic', [
    '    <src method="firecrawl" format="md" tier="secondary">https://a.com</src>',
    '    <src method="web_fetch" format="md" tier="tertiary">https://b.com</src>',
  ].join('\n')));

  it('early phase downgrades new checks to warnings even at strict rigor', () => {
    const result = validateResearchPlan(planWithIssues, bootstrapEmpty, {
      rigorLevel: 'strict',
      phaseNumber: 1,
      totalPhases: 9,
    });
    // New checks should be warnings (downgraded), not errors
    // primary_source_ratio at light -> warning, search_strategy at light -> warning, criteria at light -> warning
    assert.equal(result.warnings.length > 0, true, 'should have warnings');
    // The new checks should not produce errors since they are downgraded to light
    // (Only universal checks would produce issues, and this plan has none)
    const newCheckIssues = result.issues.filter(i =>
      i.includes('Primary source') || i.includes('search-strategy') || i.includes('criteria')
    );
    assert.equal(newCheckIssues.length, 0, 'new checks should be warnings in early phase');
  });

  it('late phase uses configured severity', () => {
    const result = validateResearchPlan(planWithIssues, bootstrapEmpty, {
      rigorLevel: 'strict',
      phaseNumber: 5,
      totalPhases: 9,
    });
    // At strict with late phase: primary_source_ratio=error, search_strategy=error, criteria=error
    assert.ok(result.issues.some(i => i.includes('below 50%')), 'primary source ratio should be error');
    assert.ok(result.issues.some(i => i.includes('search-strategy')), 'search strategy should be error');
    assert.ok(result.issues.some(i => i.includes('criteria')), 'criteria should be error');
  });

  it('universal checks are not affected by phase position', () => {
    // Plan with 4+ sources to trigger checkSourceLimits
    const plan = makePlan(makeTask('Research topic', [
      '    <src method="firecrawl" format="md" tier="primary">https://a.com</src>',
      '    <src method="web_fetch" format="md" tier="primary">https://b.com</src>',
      '    <src method="wget" format="pdf" tier="primary">https://c.com</src>',
      '    <src method="gh-cli" format="md" tier="primary">gh issue view 1</src>',
    ].join('\n')));
    const result = validateResearchPlan(plan, bootstrapEmpty, {
      rigorLevel: 'light',
      phaseNumber: 1,
      totalPhases: 9,
    });
    assert.ok(result.issues.some(i => i.includes('max 3 sources')), 'universal check still blocks');
  });
});

// ─── Suite 12: validateResearchPlan with rigor ──────────────────────────────

describe('validateResearchPlan with rigor', () => {
  it('backward compat: no options arg works', () => {
    const plan = makePlan(makeTask('Read about Hybrid search strategies',
      '    <src method="firecrawl" format="md">https://example.com</src>'
    ));
    const result = validateResearchPlan(plan, bootstrapEstablished);
    assert.equal(result.valid, false); // will have search-strategy/criteria issues at moderate defaults
    assert.ok(Array.isArray(result.issues));
    assert.ok(Array.isArray(result.warnings));
  });

  it('rigorLevel is passed through to new checks', () => {
    const plan = makePlan(makeTask('Research topic',
      '    <src method="firecrawl" format="md" tier="secondary">https://a.com</src>'
    ));
    // At light, all new checks produce warnings not errors
    const result = validateResearchPlan(plan, bootstrapEmpty, { rigorLevel: 'light' });
    assert.ok(result.warnings.length > 0, 'should have warnings at light level');
  });

  it('warnings array is present in return value', () => {
    const plan = makePlan(makeTask('Research topic',
      '    <src method="firecrawl" format="md">https://a.com</src>'
    ));
    const result = validateResearchPlan(plan, bootstrapEmpty);
    assert.ok('warnings' in result, 'result must have warnings field');
    assert.ok(Array.isArray(result.warnings));
  });
});
