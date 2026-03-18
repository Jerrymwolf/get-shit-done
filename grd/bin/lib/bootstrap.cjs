'use strict';

/**
 * bootstrap.cjs - BOOTSTRAP.md generation and querying
 *
 * Manages the project's existing-knowledge registry. Three tiers:
 * - Established: high-confidence findings (do not re-research)
 * - Partially Established: known but gaps remain (extend, don't restart)
 * - Not Yet Researched: identified topics awaiting investigation
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
    if (/^## Already Established/m.test(section)) {
      established = parseTable(section, ['finding', 'sourceNote', 'confidence', 'date']);
    } else if (/^## Partially Established/m.test(section)) {
      partial = parseTable(section, ['finding', 'whatsKnown', 'whatsMissing', 'sourceNote']);
    } else if (/^## Not Yet Researched/m.test(section)) {
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

  return `# Bootstrap: Existing Research Inventory

<!-- Produced during /grd:new-project. Every subsequent phase loads this file
to avoid re-researching known findings. Update as research progresses. -->

## Already Established (do not re-research)

<!-- Findings with high confidence that should be treated as givens.
Subagents must not spend context re-evaluating these unless new
contradictory evidence emerges. -->

| Finding | Source Note | Confidence | Date |
|---|---|---|---|
${estRows}

## Partially Established (extend, don't restart)

<!-- Findings where something is known but gaps remain.
Subagents should build on existing knowledge, not start from scratch. -->

| Finding | What's Known | What's Missing | Source Note |
|---|---|---|---|
${partRows}

## Not Yet Researched

<!-- Topics identified as important but not yet investigated.
Each entry becomes a candidate for a research task in planning. -->

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
