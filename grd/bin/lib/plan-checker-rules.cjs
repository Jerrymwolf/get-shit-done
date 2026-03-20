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

const RIGOR_LEVELS = {
  strict: {
    primary_source_ratio: 'error',
    search_strategy: 'error',
    criteria: 'error',
  },
  moderate: {
    primary_source_ratio: 'warning',
    search_strategy: 'error',
    criteria: 'error',
  },
  light: {
    primary_source_ratio: 'warning',
    search_strategy: 'warning',
    criteria: 'warning',
  },
};

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
 * Check primary source ratio meets 50% threshold.
 * @param {string} planContent
 * @param {string} rigorLevel - 'strict' | 'moderate' | 'light'
 * @returns {{ valid: boolean, issues: string[], warnings: string[] }}
 */
function checkPrimarySourceRatio(planContent, rigorLevel) {
  const issues = [];
  const warnings = [];
  const tasks = extractTasks(planContent);
  const severity = (RIGOR_LEVELS[rigorLevel] || RIGOR_LEVELS.moderate).primary_source_ratio;

  let totalSources = 0;
  let primarySources = 0;

  for (const task of tasks) {
    if (task.type !== 'research') continue;
    for (const src of task.sources) {
      const attrs = parseAttrs(src.attrs);
      totalSources++;
      if (attrs.tier === 'primary') primarySources++;
    }
  }

  if (totalSources > 0 && primarySources / totalSources < 0.5) {
    const percent = Math.round((primarySources / totalSources) * 100);
    const msg = `Primary source ratio ${primarySources}/${totalSources} (${percent}%) is below 50% threshold`;
    if (severity === 'error') {
      issues.push(msg);
    } else {
      warnings.push(msg);
    }
  }

  return { valid: issues.length === 0, issues, warnings };
}

/**
 * Check for search-strategy block with required sub-elements.
 * @param {string} planContent
 * @param {string} rigorLevel - 'strict' | 'moderate' | 'light'
 * @returns {{ valid: boolean, issues: string[], warnings: string[] }}
 */
function checkSearchStrategy(planContent, rigorLevel) {
  const issues = [];
  const warnings = [];
  const severity = (RIGOR_LEVELS[rigorLevel] || RIGOR_LEVELS.moderate).search_strategy;

  const blockMatch = planContent.match(/<search-strategy>[\s\S]*?<\/search-strategy>/);
  if (!blockMatch) {
    const msg = 'Missing <search-strategy> block (databases, keywords, date-range required)';
    if (severity === 'error') {
      issues.push(msg);
    } else {
      warnings.push(msg);
    }
    return { valid: issues.length === 0, issues, warnings };
  }

  const content = blockMatch[0];
  const requiredFields = ['databases', 'keywords', 'date-range'];
  for (const field of requiredFields) {
    const fieldRegex = new RegExp('<' + field + '>[\\s\\S]*?<\\/' + field + '>');
    if (!fieldRegex.test(content)) {
      const msg = `<search-strategy> missing required field: <${field}>`;
      if (severity === 'error') {
        issues.push(msg);
      } else {
        warnings.push(msg);
      }
    }
  }

  return { valid: issues.length === 0, issues, warnings };
}

/**
 * Check for criteria block with include/exclude sub-elements.
 * @param {string} planContent
 * @param {string} rigorLevel - 'strict' | 'moderate' | 'light'
 * @returns {{ valid: boolean, issues: string[], warnings: string[] }}
 */
function checkCriteria(planContent, rigorLevel) {
  const issues = [];
  const warnings = [];
  const severity = (RIGOR_LEVELS[rigorLevel] || RIGOR_LEVELS.moderate).criteria;

  const blockMatch = planContent.match(/<criteria>[\s\S]*?<\/criteria>/);
  if (!blockMatch) {
    const msg = 'Missing <criteria> block (inclusion/exclusion criteria required)';
    if (severity === 'error') {
      issues.push(msg);
    } else {
      warnings.push(msg);
    }
    return { valid: issues.length === 0, issues, warnings };
  }

  const content = blockMatch[0];
  const subElements = ['include', 'exclude'];
  for (const el of subElements) {
    const elRegex = new RegExp('<' + el + '>[\\s\\S]*?<\\/' + el + '>');
    if (!elRegex.test(content)) {
      const msg = `<criteria> missing <${el}> sub-element`;
      if (severity === 'error') {
        issues.push(msg);
      } else {
        warnings.push(msg);
      }
    }
  }

  return { valid: issues.length === 0, issues, warnings };
}

/**
 * Run all research plan validation checks.
 * @param {string} planContent
 * @param {string} bootstrapContent
 * @param {object} [options={}]
 * @param {string} [options.rigorLevel='moderate'] - 'strict' | 'moderate' | 'light'
 * @param {number} [options.phaseNumber] - Current phase number
 * @param {number} [options.totalPhases] - Total phases in project
 * @returns {{ valid: boolean, issues: string[], warnings: string[] }}
 */
function validateResearchPlan(planContent, bootstrapContent, options = {}) {
  const { rigorLevel = 'moderate', phaseNumber, totalPhases } = options;
  const allIssues = [];
  const allWarnings = [];

  // Universal checks — always blocking, never downgraded
  const universalChecks = [
    checkSourceDuplication(planContent, bootstrapContent),
    checkSourceLimits(planContent),
    checkAcquisitionMethods(planContent),
    checkContextBudget(planContent),
  ];

  for (const check of universalChecks) {
    allIssues.push(...check.issues);
  }

  // Graduated enforcement: early phases downgrade new checks to warnings
  let effectiveRigor = rigorLevel;
  if (phaseNumber != null && totalPhases != null) {
    const earlyThreshold = Math.ceil(totalPhases / 3);
    if (phaseNumber <= earlyThreshold) {
      effectiveRigor = 'light';
    }
  }

  // New rigor-aware checks
  const rigorChecks = [
    checkPrimarySourceRatio(planContent, effectiveRigor),
    checkSearchStrategy(planContent, effectiveRigor),
    checkCriteria(planContent, effectiveRigor),
  ];

  for (const check of rigorChecks) {
    allIssues.push(...check.issues);
    allWarnings.push(...(check.warnings || []));
  }

  return { valid: allIssues.length === 0, issues: allIssues, warnings: allWarnings };
}

module.exports = {
  RIGOR_LEVELS,
  validateResearchPlan,
  checkSourceDuplication,
  checkSourceLimits,
  checkAcquisitionMethods,
  checkContextBudget,
  checkPrimarySourceRatio,
  checkSearchStrategy,
  checkCriteria,
};
