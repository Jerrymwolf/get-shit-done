/**
 * Mapping of GRD agent to model for each profile.
 *
 * Based on upstream grd model-profiles.cjs (v1.24.0), with all agent
 * names using the grd-* prefix and 4 additional research-specific agents.
 */
const MODEL_PROFILES = {
  // --- Upstream agents (renamed gsd-* -> grd-*) ---
  'grd-planner':              { quality: 'opus',   balanced: 'opus',   budget: 'sonnet' },
  'grd-roadmapper':           { quality: 'opus',   balanced: 'sonnet', budget: 'sonnet' },
  'grd-executor':             { quality: 'opus',   balanced: 'sonnet', budget: 'sonnet' },
  'grd-phase-researcher':     { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'grd-project-researcher':   { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'grd-research-synthesizer': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'grd-debugger':             { quality: 'opus',   balanced: 'sonnet', budget: 'sonnet' },
  'grd-codebase-mapper':      { quality: 'sonnet', balanced: 'haiku',  budget: 'haiku' },
  'grd-verifier':             { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'grd-plan-checker':         { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'grd-integration-checker':  { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'grd-nyquist-auditor':      { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'grd-ui-researcher':        { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'grd-ui-checker':           { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'grd-ui-auditor':           { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  // --- GRD-only research agents (match phase-researcher tier) ---
  'grd-source-researcher':       { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'grd-methods-researcher':      { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'grd-architecture-researcher': { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'grd-limitations-researcher':  { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  // --- GRD synthesis agents (match phase-researcher tier) ---
  'grd-thematic-synthesizer':     { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'grd-framework-integrator':     { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'grd-gap-analyzer':             { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'grd-argument-constructor':     { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
};
const VALID_PROFILES = Object.keys(MODEL_PROFILES['grd-planner']);

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
  const sep = '─'.repeat(agentWidth + 2) + '┼' + '─'.repeat(modelWidth + 2);
  const header = ' ' + 'Agent'.padEnd(agentWidth) + ' │ ' + 'Model'.padEnd(modelWidth);
  let agentToModelTable = header + '\n' + sep + '\n';
  for (const [agent, model] of Object.entries(agentToModelMap)) {
    agentToModelTable += ' ' + agent.padEnd(agentWidth) + ' │ ' + model.padEnd(modelWidth) + '\n';
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
