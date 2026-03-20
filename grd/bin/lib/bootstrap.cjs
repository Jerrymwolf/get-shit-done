'use strict';

/**
 * bootstrap.cjs - BOOTSTRAP.md generation and querying
 *
 * Manages the project's state-of-the-field assessment. Three tiers:
 * - Established Knowledge: strong consensus findings in the field
 * - Contested Claims: evidence exists but consensus is lacking
 * - Knowledge Gaps: identified topics awaiting investigation
 */

/**
 * Parse a markdown table into rows of objects.
 * @param {string} section - Markdown text containing one table
 * @param {string[]} columns - Column names to map
 * @returns {object[]}
 */
function parseTable(section, columns) {
  const lines = section.split('\n');
  const rows = [];
  let inTable = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      if (inTable) break; // end of table
      continue;
    }
    // Skip header and separator rows
    if (!inTable) {
      inTable = true;
      continue; // skip header
    }
    if (/^\|[\s-|]+\|$/.test(trimmed)) {
      continue; // skip separator
    }
    const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length === 0 || cells.every(c => c === '')) continue;
    const row = {};
    for (let i = 0; i < columns.length; i++) {
      row[columns[i]] = cells[i] || '';
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Parse BOOTSTRAP.md content into structured tiers.
 * @param {string} content - BOOTSTRAP.md markdown content
 * @returns {{ established: object[], partial: object[], notResearched: object[] }}
 */
function parseBootstrap(content) {
  if (!content || typeof content !== 'string') {
    return { established: [], partial: [], notResearched: [] };
  }

  // Split by ## headings
  const sections = content.split(/(?=^## )/m);

  let established = [];
  let partial = [];
  let notResearched = [];

  for (const section of sections) {
    if (/^## Established Knowledge/m.test(section) || /^## Already Established/m.test(section)) {
      established = parseTable(section, ['finding', 'sourceNote', 'confidence', 'date']);
    } else if (/^## Contested Claims/m.test(section) || /^## Partially Established/m.test(section)) {
      partial = parseTable(section, ['finding', 'whatsKnown', 'whatsMissing', 'sourceNote']);
    } else if (/^## Knowledge Gaps/m.test(section) || /^## Not Yet Researched/m.test(section)) {
      notResearched = parseTable(section, ['topic', 'whyItMatters', 'targetNote']);
    }
  }

  return { established, partial, notResearched };
}

/**
 * Generate BOOTSTRAP.md content from findings.
 * @param {{ established?: object[], partial?: object[], notResearched?: object[] }} findings
 * @returns {string}
 */
function generateBootstrap(findings) {
  const { established = [], partial = [], notResearched = [] } = findings;

  const estRows = established.map(f =>
    `| ${f.finding} | ${f.sourceNote} | ${f.confidence} | ${f.date} |`
  ).join('\n');

  const partRows = partial.map(f =>
    `| ${f.finding} | ${f.whatsKnown} | ${f.whatsMissing} | ${f.sourceNote} |`
  ).join('\n');

  const nrRows = notResearched.map(f =>
    `| ${f.topic} | ${f.whyItMatters} | ${f.targetNote} |`
  ).join('\n');

  return `# State-of-the-Field Assessment

<!-- Produced during /grd:new-research. Every subsequent inquiry loads this file
to avoid re-investigating established findings. Update as research progresses.
Equivalent to a preliminary scoping review (Arksey & O'Malley, 2005). -->

## Established Knowledge

<!-- Findings with strong consensus in the field. Treat as established knowledge.
Do not re-investigate unless new contradictory evidence emerges.
Maps to: known / settled in the literature. -->

| Finding | Source Note | Confidence | Date |
|---|---|---|---|
${estRows}

## Contested Claims

<!-- Findings where evidence exists but consensus is lacking.
Build on existing knowledge, investigate opposing positions.
Maps to: debated / contested in the literature. -->

| Finding | What's Known | What's Missing | Source Note |
|---|---|---|---|
${partRows}

## Knowledge Gaps

<!-- Topics identified as important but not yet investigated.
Each entry becomes a candidate for an inquiry task in the research design.
Maps to: gap / unexplored in the literature. -->

| Topic | Why It Matters | Target Note |
|---|---|---|
${nrRows}
`;
}

/**
 * Query BOOTSTRAP.md for a specific finding or topic.
 * @param {string} content - BOOTSTRAP.md markdown content
 * @param {string} query - Finding text to search for
 * @returns {{ found: boolean, tier?: string, details?: object }}
 */
function queryBootstrap(content, query) {
  const data = parseBootstrap(content);
  const q = query.toLowerCase();

  for (const item of data.established) {
    if (item.finding.toLowerCase() === q) {
      return { found: true, tier: 'established', details: item };
    }
  }

  for (const item of data.partial) {
    if (item.finding.toLowerCase() === q) {
      return { found: true, tier: 'partial', details: item };
    }
  }

  for (const item of data.notResearched) {
    if (item.topic.toLowerCase() === q) {
      return { found: true, tier: 'notResearched', details: item };
    }
  }

  return { found: false };
}

module.exports = {
  parseBootstrap,
  generateBootstrap,
  queryBootstrap,
};
