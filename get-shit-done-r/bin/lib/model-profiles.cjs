/**
 * Mapping of GSD-R agent to model for each profile.
 *
 * Based on upstream get-shit-done-r model-profiles.cjs (v1.24.0), with all agent
 * names using the gsd-r-* prefix and 4 additional research-specific agents.
 */
const MODEL_PROFILES = {
  // --- Upstream agents (renamed gsd-* -> gsd-r-*) ---
  'gsd-r-planner':              { quality: 'opus',   balanced: 'opus',   budget: 'sonnet' },
  'gsd-r-roadmapper':           { quality: 'opus',   balanced: 'sonnet', budget: 'sonnet' },
  'gsd-r-executor':             { quality: 'opus',   balanced: 'sonnet', budget: 'sonnet' },
  'gsd-r-phase-researcher':     { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-project-researcher':   { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-research-synthesizer': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-debugger':             { quality: 'opus',   balanced: 'sonnet', budget: 'sonnet' },
  'gsd-r-codebase-mapper':      { quality: 'sonnet', balanced: 'haiku',  budget: 'haiku' },
  'gsd-r-verifier':             { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-plan-checker':         { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-integration-checker':  { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-nyquist-auditor':      { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-ui-researcher':        { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-ui-checker':           { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-ui-auditor':           { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  // --- GSD-R-only research agents (match phase-researcher tier) ---
  'gsd-r-source-researcher':       { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-methods-researcher':      { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-architecture-researcher': { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'gsd-r-limitations-researcher':  { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
};
const VALID_PROFILES = Object.keys(MODEL_PROFILES['gsd-r-planner']);

/**
 * Formats the agent-to-model mapping as a human-readable table (in string format).
 *
 * @param {Object<string, string>} agentToModelMap - A mapping from agent to model
 * @returns {string} A formatted table string
 */
function formatAgentToModelMapAsTable(agentToModelMap) {
  const agentWidth = Math.max('Agent'.length, ...Object.keys(agentToModelMap).map((a) => a.length));
  const modelWidth = Math.max(
    'Model'.length,
    ...Object.values(agentToModelMap).map((m) => m.length)
  );
  const sep = '\u2500'.repeat(agentWidth + 2) + '\u253C' + '\u2500'.repeat(modelWidth + 2);
  const header = ' ' + 'Agent'.padEnd(agentWidth) + ' \u2502 ' + 'Model'.padEnd(modelWidth);
  let agentToModelTable = header + '\n' + sep + '\n';
  for (const [agent, model] of Object.entries(agentToModelMap)) {
    agentToModelTable += ' ' + agent.padEnd(agentWidth) + ' \u2502 ' + model.padEnd(modelWidth) + '\n';
  }
  return agentToModelTable;
}

/**
 * Returns a mapping from agent to model for the given model profile.
 *
 * @param {string} normalizedProfile - The normalized (lowercase and trimmed) profile name
 * @returns {Object<string, string>} A mapping from agent to model for the given profile
 */
function getAgentToModelMapForProfile(normalizedProfile) {
  const agentToModelMap = {};
  for (const [agent, profileToModelMap] of Object.entries(MODEL_PROFILES)) {
    agentToModelMap[agent] = profileToModelMap[normalizedProfile];
  }
  return agentToModelMap;
}

module.exports = {
  MODEL_PROFILES,
  VALID_PROFILES,
  formatAgentToModelMapAsTable,
  getAgentToModelMapForProfile,
};
