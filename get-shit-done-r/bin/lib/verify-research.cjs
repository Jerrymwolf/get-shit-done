'use strict';

const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const path = require('node:path');
const { validateReferences, extractReferences } = require('./acquire.cjs');

// ── Frontmatter parsing ────────────────────────────────────────────────────

/**
 * Parse YAML frontmatter from note content.
 * @param {string} noteContent
 * @returns {Object} Parsed frontmatter fields
 */
function parseFrontmatter(noteContent) {
  const match = noteContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      fields[key] = val;
    }
  }
  return fields;
}

// ── Section extraction ─────────────────────────────────────────────────────

/**
 * Extract the content of a markdown section by heading text.
 * Matches ## Heading or ## Heading prefix (e.g., "## Implications for X").
 * @param {string} noteContent
 * @param {string} headingPrefix - Start of the heading text (case-insensitive)
 * @returns {string|null} Section content or null if not found
 */
function extractSection(noteContent, headingPrefix) {
  const escapedPrefix = headingPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^## ${escapedPrefix}[^\\n]*\\n`, 'im');
  const match = noteContent.match(pattern);
  if (!match) return null;

  const startIdx = match.index + match[0].length;
  const rest = noteContent.slice(startIdx);
  const nextHeading = rest.match(/^## /m);
  const sectionContent = nextHeading ? rest.slice(0, nextHeading.index) : rest;
  return sectionContent.trim();
}

// ── Placeholder detection ──────────────────────────────────────────────────

const PLACEHOLDER_PATTERNS = [
  /^TODO/i,
  /^TBD/i,
  /^FIXME/i,
  /\bplaceholder\b/i,
  /\bfill in\b/i,
  /\badd .+ here\b/i,
  /\binsert .+ here\b/i,
  /\blorem ipsum\b/i,
];

/**
 * Check if text appears to be placeholder content.
 * @param {string} text
 * @returns {boolean}
 */
function isPlaceholder(text) {
  if (!text) return true;
  return PLACEHOLDER_PATTERNS.some(p => p.test(text.trim()));
}

// ── Keyword overlap ────────────────────────────────────────────────────────

/**
 * Extract meaningful keywords from a string (skip common stop words).
 * @param {string} text
 * @returns {string[]}
 */
function extractKeywords(text) {
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
    'should', 'may', 'might', 'must', 'can', 'could', 'of', 'in', 'to',
    'for', 'with', 'on', 'at', 'from', 'by', 'about', 'as', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
    'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than',
    'too', 'very', 'just', 'because', 'if', 'when', 'where', 'how',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
    'it', 'its', 'i', 'we', 'they', 'our', 'my', 'your', 'their',
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

// ── Tier 1: Goal-backward verification ─────────────────────────────────────

/**
 * Verify a research note answers its research question (Tier 1).
 *
 * Checks:
 * - Key Findings section exists and is substantive
 * - Analysis section exists and is substantive (>100 chars, not placeholder)
 * - Implications section exists
 * - Content addresses the research question (keyword overlap)
 *
 * @param {string} noteContent - Full markdown content of the research note
 * @param {string} researchQuestion - The question this note should answer
 * @returns {{ passed: boolean, conditions: Array<{condition: string, status: string, reason?: string}>, warnings: string[] }}
 */
function verifyTier1(noteContent, researchQuestion) {
  const conditions = [];
  const warnings = [];

  // Check Key Findings section
  const keyFindings = extractSection(noteContent, 'Key Findings');
  if (keyFindings === null) {
    conditions.push({
      condition: 'Key Findings section exists',
      status: 'failed',
      reason: 'Key Findings section not found',
    });
  } else if (keyFindings.length < 50 || isPlaceholder(keyFindings)) {
    conditions.push({
      condition: 'Key Findings section is substantive',
      status: 'failed',
      reason: 'Key Findings is not substantive (too short or placeholder)',
    });
  } else {
    conditions.push({
      condition: 'Key Findings section is substantive',
      status: 'passed',
    });
  }

  // Check Analysis section
  const analysis = extractSection(noteContent, 'Analysis');
  if (analysis === null) {
    conditions.push({
      condition: 'Analysis section exists',
      status: 'failed',
      reason: 'Analysis section not found',
    });
  } else if (analysis.length < 100 || isPlaceholder(analysis)) {
    conditions.push({
      condition: 'Analysis section is substantive',
      status: 'failed',
      reason: 'Analysis is not substantive (too short or placeholder)',
    });
  } else {
    conditions.push({
      condition: 'Analysis section is substantive',
      status: 'passed',
    });
  }

  // Check Implications section
  const implications = extractSection(noteContent, 'Implications');
  if (implications === null) {
    conditions.push({
      condition: 'Implications section exists',
      status: 'failed',
      reason: 'Implications section not found',
    });
  } else {
    conditions.push({
      condition: 'Implications section exists',
      status: 'passed',
    });
  }

  // Check keyword overlap between question and note content
  const questionKeywords = extractKeywords(researchQuestion);
  const bodyText = [keyFindings, analysis, implications].filter(Boolean).join(' ');
  const bodyKeywords = new Set(extractKeywords(bodyText));
  const matchedKeywords = questionKeywords.filter(k => bodyKeywords.has(k));
  const overlapRatio = questionKeywords.length > 0
    ? matchedKeywords.length / questionKeywords.length
    : 0;

  if (overlapRatio < 0.3) {
    conditions.push({
      condition: 'Content addresses the research question',
      status: 'failed',
      reason: `Low keyword overlap (${Math.round(overlapRatio * 100)}%) between question and note content`,
    });
  } else {
    conditions.push({
      condition: 'Content addresses the research question',
      status: 'passed',
    });
  }

  // Check Open Questions section for warnings
  const openQuestions = extractSection(noteContent, 'Open Questions');
  if (openQuestions !== null) {
    const trimmed = openQuestions.trim().toLowerCase();
    if (trimmed === '' || trimmed === 'none' || trimmed === 'none at this time.' || trimmed === 'n/a') {
      warnings.push('Open Questions section is empty or trivial -- consider if there are truly no unknowns');
    }
  }

  const passed = conditions.every(c => c.status === 'passed');

  return { passed, conditions, warnings };
}

// ── Tier 2: Source audit ───────────────────────────────────────────────────

/**
 * Audit source attachment for a research note (Tier 2).
 *
 * Checks:
 * - All referenced sources exist in sourcesDir (via validateReferences)
 * - SOURCE-LOG.md exists
 * - Frontmatter sources count matches actual file count
 * - No orphan files (warnings, not failures)
 *
 * @param {string} noteContent - Full markdown content of the research note
 * @param {string} sourcesDir - Path to the note's -sources/ directory
 * @param {string} sourceLogPath - Path to SOURCE-LOG.md
 * @returns {Promise<{ passed: boolean, missing: string[], orphans: string[], issues: Array<{check: string, status: string, detail: string}> }>}
 */
async function verifyTier2(noteContent, sourcesDir, sourceLogPath) {
  const issues = [];
  let missing = [];
  let orphans = [];

  // Check SOURCE-LOG.md exists
  let sourceLogExists = false;
  try {
    await fsPromises.access(sourceLogPath);
    sourceLogExists = true;
  } catch (_) {
    // Does not exist
  }

  if (!sourceLogExists) {
    issues.push({
      check: 'source-log',
      status: 'failed',
      detail: 'SOURCE-LOG.md not found',
    });
  } else {
    issues.push({
      check: 'source-log',
      status: 'passed',
      detail: 'SOURCE-LOG.md exists',
    });
  }

  // Run validateReferences from acquire.cjs
  const valResult = await validateReferences(noteContent, sourcesDir, sourceLogPath);
  missing = valResult.missing;
  orphans = valResult.orphans;

  if (missing.length > 0) {
    issues.push({
      check: 'source-files',
      status: 'failed',
      detail: `Missing: ${missing.join(', ')}`,
    });
  } else {
    issues.push({
      check: 'source-files',
      status: 'passed',
      detail: 'All referenced sources present',
    });
  }

  // Check frontmatter sources count
  const frontmatter = parseFrontmatter(noteContent);
  const declaredCount = parseInt(frontmatter.sources, 10);
  if (!isNaN(declaredCount)) {
    // Count actual files in sourcesDir (excluding SOURCE-LOG.md)
    let actualCount = 0;
    try {
      const dirEntries = await fsPromises.readdir(sourcesDir);
      actualCount = dirEntries.filter(e => e !== 'SOURCE-LOG.md').length;
    } catch (_) {
      // Can't read dir
    }

    if (declaredCount !== actualCount) {
      issues.push({
        check: 'sources-count',
        status: 'failed',
        detail: `Frontmatter sources count mismatch: declared ${declaredCount}, actual ${actualCount}`,
      });
    } else {
      issues.push({
        check: 'sources-count',
        status: 'passed',
        detail: `Sources count matches: ${actualCount}`,
      });
    }
  }

  // Orphans are warnings, not failures
  if (orphans.length > 0) {
    issues.push({
      check: 'orphan-files',
      status: 'warning',
      detail: `Orphan files: ${orphans.join(', ')}`,
    });
  }

  // Determine overall pass/fail: fail if any issue has status 'failed'
  const passed = issues.every(i => i.status !== 'failed');

  return { passed, missing, orphans, issues };
}

// ── Combined verification ──────────────────────────────────────────────────

/**
 * Run full two-tier verification on a research note.
 *
 * Tier 1 runs first. If it fails, Tier 2 is skipped (returns null).
 * Status mapping:
 *   - Both pass, no warnings: 'final'
 *   - Tier 1 passes, Tier 2 passes but has orphans/warnings: 'reviewed'
 *   - Any tier fails: 'draft'
 *
 * @param {string} noteContent - Full markdown content of the research note
 * @param {string} sourcesDir - Path to the note's -sources/ directory
 * @param {string} sourceLogPath - Path to SOURCE-LOG.md
 * @param {string} researchQuestion - The question this note should answer
 * @returns {Promise<{ status: string, tier1Result: Object, tier2Result: Object|null }>}
 */
async function verifyNote(noteContent, sourcesDir, sourceLogPath, researchQuestion) {
  // Tier 1 first
  const tier1Result = verifyTier1(noteContent, researchQuestion);

  if (!tier1Result.passed) {
    return {
      status: 'draft',
      tier1Result,
      tier2Result: null,
    };
  }

  // Tier 2 only if Tier 1 passes
  const tier2Result = await verifyTier2(noteContent, sourcesDir, sourceLogPath);

  if (!tier2Result.passed) {
    return {
      status: 'draft',
      tier1Result,
      tier2Result,
    };
  }

  // Both pass -- check for minor issues (orphans, warnings)
  const hasMinorIssues = tier2Result.orphans.length > 0 ||
    tier2Result.issues.some(i => i.status === 'warning') ||
    tier1Result.warnings.length > 0;

  return {
    status: hasMinorIssues ? 'reviewed' : 'final',
    tier1Result,
    tier2Result,
  };
}

// ── Fix task generation ────────────────────────────────────────────────────

/**
 * Generate structured fix task descriptions from verification results.
 *
 * @param {Object} verificationResult - Result from verifyNote()
 * @param {Object} noteMetadata - { noteName, domain, researchQuestion? }
 * @returns {Array<{ type: string, description: string, priority: string }>}
 */
function generateFixTasks(verificationResult, noteMetadata) {
  const tasks = [];
  const { tier1Result, tier2Result } = verificationResult;
  const { noteName, domain, researchQuestion } = noteMetadata;

  // Tier 1 failures -> research tasks
  if (tier1Result && !tier1Result.passed) {
    const failedConditions = tier1Result.conditions.filter(c => c.status === 'failed');
    for (const fc of failedConditions) {
      tasks.push({
        type: 'research',
        description: `[${noteName}] ${fc.condition}: ${fc.reason}. ` +
          `Re-research to address this gap in domain "${domain}".` +
          (researchQuestion ? ` Original question: "${researchQuestion}"` : ''),
        priority: 'high',
      });
    }
  }

  // Tier 2 failures -> acquisition or cleanup tasks
  if (tier2Result) {
    // Missing sources -> acquisition tasks
    if (tier2Result.missing && tier2Result.missing.length > 0) {
      for (const file of tier2Result.missing) {
        tasks.push({
          type: 'acquisition',
          description: `[${noteName}] Acquire missing source: ${file}. ` +
            `Use the fallback chain (firecrawl -> web_fetch -> wget) to obtain this source.`,
          priority: 'high',
        });
      }
    }

    // Other issues -> cleanup tasks
    const failedIssues = (tier2Result.issues || []).filter(
      i => i.status === 'failed' && i.check !== 'source-files'
    );
    for (const issue of failedIssues) {
      tasks.push({
        type: 'cleanup',
        description: `[${noteName}] Fix: ${issue.detail}`,
        priority: 'medium',
      });
    }
  }

  return tasks;
}

module.exports = {
  verifyTier1,
  verifyTier2,
  verifyNote,
  generateFixTasks,
};
