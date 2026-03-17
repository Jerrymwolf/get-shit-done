'use strict';

/**
 * plan-checker-rules.cjs - Research-specific plan validation rules
 *
 * Enforces source discipline in research plans:
 * - No duplication of BOOTSTRAP.md findings
 * - Max 3 sources per task
 * - Acquisition method required for every source
 * - >30 page papers get dedicated tasks
 */

const { parseBootstrap } = require('./bootstrap.cjs');

const VALID_METHODS = ['firecrawl', 'web_fetch', 'wget', 'gh-cli'];

/**
 * Extract task blocks from plan content.
 * @param {string} planContent
 * @returns {Array<{ name: string, type: string, sources: string[], fullText: string }>}
 */
function extractTasks(planContent) {
  const taskRegex = /<task\s+type="([^"]*)">([\s\S]*?)<\/task>/g;
  const tasks = [];
  let match;
  while ((match = taskRegex.exec(planContent)) !== null) {
    const type = match[1];
    const body = match[2];
    const nameMatch = body.match(/<n>(.*?)<\/n>/);
    const name = nameMatch ? nameMatch[1] : 'unnamed';

    // Extract src blocks
    const srcRegex = /<src([^>]*)>([\s\S]*?)<\/src>/g;
    const sources = [];
    let srcMatch;
    while ((srcMatch = srcRegex.exec(body)) !== null) {
      sources.push({ attrs: srcMatch[1], url: srcMatch[2].trim() });
    }

    tasks.push({ name, type, sources, fullText: body });
  }
  return tasks;
}

/**
 * Parse attributes from a src tag attribute string.
 * @param {string} attrStr - e.g., ' method="firecrawl" format="md" pages="28"'
 * @returns {object}
 */
function parseAttrs(attrStr) {
  const attrs = {};
  const re = /(\w+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(attrStr)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

/**
 * Check if plan duplicates findings already established in BOOTSTRAP.md.
 * @param {string} planContent
 * @param {string} bootstrapContent
 * @returns {{ valid: boolean, issues: string[] }}
 */
function checkSourceDuplication(planContent, bootstrapContent) {
  const issues = [];
  const bootstrap = parseBootstrap(bootstrapContent);
  const tasks = extractTasks(planContent);

  const establishedFindings = bootstrap.established.map(f => f.finding.toLowerCase());

  for (const task of tasks) {
    if (task.type !== 'research') continue;
    const taskNameLower = task.name.toLowerCase();
    for (const finding of establishedFindings) {
      if (taskNameLower.includes(finding)) {
        issues.push(
          `Task "${task.name}" duplicates already-established finding: "${finding}"`
        );
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Enforce max 3 sources per research task.
 * @param {string} planContent
 * @returns {{ valid: boolean, issues: string[] }}
 */
function checkSourceLimits(planContent) {
  const issues = [];
  const tasks = extractTasks(planContent);

  for (const task of tasks) {
    if (task.type !== 'research') continue;
    if (task.sources.length > 3) {
      issues.push(
        `Task "${task.name}": max 3 sources per task (has ${task.sources.length})`
      );
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Verify all src blocks have valid acquisition methods.
 * @param {string} planContent
 * @returns {{ valid: boolean, issues: string[] }}
 */
function checkAcquisitionMethods(planContent) {
  const issues = [];
  const tasks = extractTasks(planContent);

  for (const task of tasks) {
    for (const src of task.sources) {
      const attrs = parseAttrs(src.attrs);
      if (!attrs.method) {
        issues.push(
          `Task "${task.name}": acquisition method required for source "${src.url}"`
        );
      } else if (!VALID_METHODS.includes(attrs.method)) {
        issues.push(
          `Task "${task.name}": invalid method "${attrs.method}" for source "${src.url}" (valid: ${VALID_METHODS.join(', ')})`
        );
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Verify >30 page papers get dedicated tasks (no other sources).
 * @param {string} planContent
 * @returns {{ valid: boolean, issues: string[] }}
 */
function checkContextBudget(planContent) {
  const issues = [];
  const tasks = extractTasks(planContent);

  for (const task of tasks) {
    if (task.type !== 'research') continue;
    if (task.sources.length <= 1) continue; // single source is fine regardless

    for (const src of task.sources) {
      const attrs = parseAttrs(src.attrs);
      const pages = parseInt(attrs.pages, 10);
      if (pages > 30) {
        issues.push(
          `Task "${task.name}": paper with ${pages} pages requires dedicated task required (has ${task.sources.length} sources)`
        );
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Run all research plan validation checks.
 * @param {string} planContent
 * @param {string} bootstrapContent
 * @returns {{ valid: boolean, issues: string[] }}
 */
function validateResearchPlan(planContent, bootstrapContent) {
  const allIssues = [];

  const checks = [
    checkSourceDuplication(planContent, bootstrapContent),
    checkSourceLimits(planContent),
    checkAcquisitionMethods(planContent),
    checkContextBudget(planContent),
  ];

  for (const check of checks) {
    allIssues.push(...check.issues);
  }

  return { valid: allIssues.length === 0, issues: allIssues };
}

module.exports = {
  validateResearchPlan,
  checkSourceDuplication,
  checkSourceLimits,
  checkAcquisitionMethods,
  checkContextBudget,
};
