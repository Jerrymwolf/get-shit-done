'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseFrontmatter, extractSection, extractKeywords } = require('./verify-research.cjs');

// ── Sufficiency criteria by review type ──────────────────────────────────────

const SUFFICIENCY_CRITERIA = {
  systematic: {
    min_notes_per_objective: 3,
    require_primary_sources: true,
    require_methodological_diversity: true,
    min_eras: 3,
    eras_required: true,
  },
  scoping: {
    min_notes_per_objective: 1,
    require_primary_sources: false,
    require_methodological_diversity: false,
    min_eras: 2,
    eras_required: true,
  },
  integrative: {
    min_notes_per_objective: 1,
    require_primary_sources: false,
    require_methodological_diversity: false,
    min_eras: 0,
    eras_required: false,
  },
  critical: {
    min_notes_per_objective: 1,
    require_primary_sources: false,
    require_methodological_diversity: false,
    min_eras: 0,
    eras_required: false,
  },
  narrative: {
    min_notes_per_objective: 1,
    require_primary_sources: false,
    require_methodological_diversity: false,
    min_eras: 0,
    eras_required: false,
  },
};

// ── Note discovery ───────────────────────────────────────────────────────────

const VALID_ERAS = ['foundational', 'developmental', 'contemporary', 'emerging'];

/**
 * Discover research notes from vault subdirectories.
 * Walks one level of subdirectories, parses frontmatter from .md files.
 * Skips non-directory entries at top level and SOURCE-LOG files.
 *
 * @param {string} vaultDir - Path to the vault directory
 * @returns {Array<{path: string, frontmatter: Object, keyFindings: string|null}>}
 */
function discoverNotes(vaultDir) {
  const notes = [];
  let entries;
  try {
    entries = fs.readdirSync(vaultDir, { withFileTypes: true });
  } catch (_) {
    return notes;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const subDir = path.join(vaultDir, entry.name);
    let subEntries;
    try {
      subEntries = fs.readdirSync(subDir, { withFileTypes: true });
    } catch (_) {
      continue;
    }

    for (const subEntry of subEntries) {
      if (!subEntry.isFile()) continue;
      if (!subEntry.name.endsWith('.md')) continue;
      if (subEntry.name.startsWith('SOURCE-LOG')) continue;

      const filePath = path.join(subDir, subEntry.name);
      let content;
      try {
        content = fs.readFileSync(filePath, 'utf-8');
      } catch (_) {
        continue;
      }

      const frontmatter = parseFrontmatter(content);
      if (!frontmatter.inquiry && !frontmatter.domain) continue;

      const keyFindings = extractSection(content, 'Key Findings');
      notes.push({ path: filePath, frontmatter, keyFindings });
    }
  }

  return notes;
}

// ── Objective parsing ────────────────────────────────────────────────────────

/**
 * Parse objectives from REQUIREMENTS.md format.
 * Matches lines like: - [ ] **ID**: description  or  - [x] **ID**: description
 *
 * @param {string} requirementsContent
 * @returns {Array<{id: string, description: string}>}
 */
function parseObjectives(requirementsContent) {
  const objectives = [];
  const regex = /- \[[ x]\] \*\*([^*]+)\*\*:\s*(.+)/g;
  let match;
  while ((match = regex.exec(requirementsContent)) !== null) {
    objectives.push({ id: match[1], description: match[2].trim() });
  }
  return objectives;
}

// ── Objective coverage check ─────────────────────────────────────────────────

/**
 * Match a note to an objective.
 * Primary: note's inquiry field matches objective's phase context.
 * Fallback: keyword overlap between keyFindings and objective description.
 */
function noteMatchesObjective(note, objective) {
  // Primary match: inquiry field
  if (note.frontmatter && note.frontmatter.inquiry) {
    const inquiryKeywords = extractKeywords(note.frontmatter.inquiry);
    const objKeywords = extractKeywords(objective.description);
    const inquirySet = new Set(inquiryKeywords);
    const overlap = objKeywords.filter(k => inquirySet.has(k));
    if (overlap.length > 0) return true;
  }

  // Fallback: keyword overlap between keyFindings and objective description
  if (note.keyFindings) {
    const noteKeywords = new Set(extractKeywords(note.keyFindings));
    const objKeywords = extractKeywords(objective.description);
    const overlap = objKeywords.filter(k => noteKeywords.has(k));
    if (objKeywords.length > 0 && overlap.length / objKeywords.length >= 0.3) return true;
  }

  return false;
}

/**
 * Check that each objective has sufficient note coverage.
 *
 * @param {Array} notes - Discovered notes with frontmatter and keyFindings
 * @param {Array} objectives - Parsed objectives [{id, description}]
 * @param {string} reviewType - Review type key
 * @returns {{sufficient: boolean, gaps: Array}}
 */
function checkObjectiveCoverage(notes, objectives, reviewType) {
  const criteria = SUFFICIENCY_CRITERIA[reviewType] || SUFFICIENCY_CRITERIA.narrative;
  const required = criteria.min_notes_per_objective;
  const gaps = [];

  for (const obj of objectives) {
    const matchingNotes = notes.filter(n => noteMatchesObjective(n, obj));
    if (matchingNotes.length < required) {
      gaps.push({
        type: 'objective_coverage',
        objective: obj.id,
        description: obj.description,
        found: matchingNotes.length,
        required,
      });
    }
  }

  return { sufficient: gaps.length === 0, gaps };
}

// ── Era coverage check ───────────────────────────────────────────────────────

/**
 * Check era coverage across notes.
 *
 * @param {Array} notes - Discovered notes with frontmatter
 * @param {string} reviewType - Review type key
 * @param {boolean} temporalEnabled - Whether temporal_positioning is enabled
 * @returns {{sufficient: boolean, gaps: Array, eraDistribution: Object, skipped?: boolean}}
 */
function checkEraCoverage(notes, reviewType, temporalEnabled) {
  if (!temporalEnabled) {
    return { sufficient: true, gaps: [], eraDistribution: {}, skipped: true };
  }

  const criteria = SUFFICIENCY_CRITERIA[reviewType] || SUFFICIENCY_CRITERIA.narrative;
  if (!criteria.eras_required) {
    return { sufficient: true, gaps: [], eraDistribution: {} };
  }

  // Count notes per era
  const eraDistribution = {};
  for (const era of VALID_ERAS) {
    eraDistribution[era] = 0;
  }
  for (const note of notes) {
    const era = note.frontmatter && note.frontmatter.era;
    if (era && VALID_ERAS.includes(era)) {
      eraDistribution[era]++;
    }
  }

  const distinctEras = Object.values(eraDistribution).filter(c => c > 0).length;
  const gaps = [];

  if (distinctEras < criteria.min_eras) {
    gaps.push({
      type: 'era_coverage',
      found: distinctEras,
      required: criteria.min_eras,
      distribution: { ...eraDistribution },
    });
  }

  return { sufficient: gaps.length === 0, gaps, eraDistribution };
}

// ── Methodological diversity check ───────────────────────────────────────────

const METHODOLOGY_KEYWORDS = [
  'qualitative', 'quantitative', 'mixed-methods', 'case study',
  'survey', 'experiment', 'meta-analysis', 'interview', 'ethnography',
];

/**
 * Check methodological diversity for each objective's notes.
 * Only enforced for systematic reviews.
 *
 * @param {Array} notes - Discovered notes
 * @param {Array} objectives - Parsed objectives
 * @param {string} reviewType - Review type key
 * @returns {{sufficient: boolean, gaps: Array}}
 */
function checkMethodologicalDiversity(notes, objectives, reviewType) {
  const criteria = SUFFICIENCY_CRITERIA[reviewType] || SUFFICIENCY_CRITERIA.narrative;
  if (!criteria.require_methodological_diversity) {
    return { sufficient: true, gaps: [] };
  }

  const gaps = [];

  for (const obj of objectives) {
    const matchingNotes = notes.filter(n => noteMatchesObjective(n, obj));
    const methodologies = new Set();

    for (const note of matchingNotes) {
      // Check frontmatter methodology field
      if (note.frontmatter && note.frontmatter.methodology) {
        methodologies.add(note.frontmatter.methodology.toLowerCase());
      }

      // Check Key Findings for methodology keywords
      if (note.keyFindings) {
        const lower = note.keyFindings.toLowerCase();
        for (const kw of METHODOLOGY_KEYWORDS) {
          if (lower.includes(kw)) {
            methodologies.add(kw);
          }
        }
      }
    }

    if (matchingNotes.length > 0 && methodologies.size <= 1) {
      gaps.push({
        type: 'methodological_diversity',
        objective: obj.id,
        description: obj.description,
        methodologies_found: [...methodologies],
      });
    }
  }

  return { sufficient: gaps.length === 0, gaps };
}

// ── Epistemological consistency check ────────────────────────────────────────

/**
 * Check epistemological consistency.
 * Pragmatist stance auto-passes. Other stances return a stub for agent assessment.
 *
 * @param {Array} notes - Discovered notes
 * @param {string} stance - Epistemological stance
 * @returns {{consistent: boolean, warnings: Array, reason?: string}}
 */
function checkEpistemologicalConsistency(notes, stance) {
  if (stance === 'pragmatist') {
    return {
      consistent: true,
      warnings: [],
      reason: 'Pragmatist stance: methodological flexibility expected',
    };
  }

  // Stub for non-pragmatist stances -- actual qualitative assessment done by agent
  return { consistent: true, warnings: [] };
}

// ── Combined sufficiency verification ────────────────────────────────────────

/**
 * Orchestrate all sufficiency checks.
 *
 * @param {Array} notes - Discovered notes
 * @param {Array} objectives - Parsed objectives
 * @param {Object} config - Project config
 * @returns {{sufficient: boolean, gaps: Array, summary: Object}}
 */
function verifySufficiency(notes, objectives, config) {
  const reviewType = (config && config.review_type) || 'narrative';
  const temporalEnabled = !(config && config.workflow && config.workflow.temporal_positioning === false);
  const stance = (config && config.epistemological_stance) || 'pragmatist';

  const objectiveResult = checkObjectiveCoverage(notes, objectives, reviewType);
  const eraResult = checkEraCoverage(notes, reviewType, temporalEnabled);
  const diversityResult = checkMethodologicalDiversity(notes, objectives, reviewType);
  const epistemologicalResult = checkEpistemologicalConsistency(notes, stance);

  const allGaps = [
    ...objectiveResult.gaps,
    ...eraResult.gaps,
    ...diversityResult.gaps,
  ];

  // Epistemological inconsistency adds to gaps if not consistent
  if (!epistemologicalResult.consistent) {
    allGaps.push({
      type: 'epistemological_consistency',
      warnings: epistemologicalResult.warnings,
    });
  }

  return {
    sufficient: allGaps.length === 0,
    gaps: allGaps,
    summary: {
      total_notes: notes.length,
      objectives_checked: objectives.length,
      review_type: reviewType,
      era_distribution: eraResult.eraDistribution,
      methodological_diversity: diversityResult.sufficient,
      epistemological_consistency: epistemologicalResult.consistent,
    },
  };
}

module.exports = {
  SUFFICIENCY_CRITERIA,
  discoverNotes,
  parseObjectives,
  checkObjectiveCoverage,
  checkEraCoverage,
  checkMethodologicalDiversity,
  checkEpistemologicalConsistency,
  verifySufficiency,
};
