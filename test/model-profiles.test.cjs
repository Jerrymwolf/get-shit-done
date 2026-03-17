const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  MODEL_PROFILES,
  VALID_PROFILES,
  formatAgentToModelMapAsTable,
  getAgentToModelMapForProfile,
} = require('../get-shit-done-r/bin/lib/model-profiles.cjs');

// --- MODEL_PROFILES ---

describe('MODEL_PROFILES', () => {
  it('contains exactly 19 agents', () => {
    assert.equal(Object.keys(MODEL_PROFILES).length, 19);
  });

  it('every agent key starts with gsd-r-', () => {
    for (const key of Object.keys(MODEL_PROFILES)) {
      assert.ok(key.startsWith('gsd-r-'), `Expected "${key}" to start with "gsd-r-"`);
    }
  });

  it('every agent has quality, balanced, budget keys', () => {
    for (const [key, entry] of Object.entries(MODEL_PROFILES)) {
      assert.deepEqual(
        Object.keys(entry).sort(),
        ['balanced', 'budget', 'quality'],
        `Agent "${key}" missing expected keys`
      );
    }
  });

  it('every model value is opus, sonnet, or haiku', () => {
    const validModels = ['opus', 'sonnet', 'haiku'];
    for (const [key, entry] of Object.entries(MODEL_PROFILES)) {
      for (const [tier, model] of Object.entries(entry)) {
        assert.ok(
          validModels.includes(model),
          `Agent "${key}" tier "${tier}" has invalid model "${model}"`
        );
      }
    }
  });

  it('includes all 15 upstream agents renamed to gsd-r-*', () => {
    const upstreamAgents = [
      'gsd-r-planner',
      'gsd-r-roadmapper',
      'gsd-r-executor',
      'gsd-r-phase-researcher',
      'gsd-r-project-researcher',
      'gsd-r-research-synthesizer',
      'gsd-r-debugger',
      'gsd-r-codebase-mapper',
      'gsd-r-verifier',
      'gsd-r-plan-checker',
      'gsd-r-integration-checker',
      'gsd-r-nyquist-auditor',
      'gsd-r-ui-researcher',
      'gsd-r-ui-checker',
      'gsd-r-ui-auditor',
    ];
    for (const agent of upstreamAgents) {
      assert.ok(agent in MODEL_PROFILES, `Missing upstream agent: ${agent}`);
    }
  });

  it('includes 4 GSD-R research agents', () => {
    const researchAgents = [
      'gsd-r-source-researcher',
      'gsd-r-methods-researcher',
      'gsd-r-architecture-researcher',
      'gsd-r-limitations-researcher',
    ];
    for (const agent of researchAgents) {
      assert.ok(agent in MODEL_PROFILES, `Missing research agent: ${agent}`);
    }
  });

  it('research agents match phase-researcher tier', () => {
    const researchAgents = [
      'gsd-r-source-researcher',
      'gsd-r-methods-researcher',
      'gsd-r-architecture-researcher',
      'gsd-r-limitations-researcher',
    ];
    const expectedTier = { quality: 'opus', balanced: 'sonnet', budget: 'haiku' };
    for (const agent of researchAgents) {
      assert.deepEqual(
        MODEL_PROFILES[agent],
        expectedTier,
        `Research agent "${agent}" does not match phase-researcher tier`
      );
    }
  });

  it('gsd-r-planner has correct tiers', () => {
    assert.deepEqual(MODEL_PROFILES['gsd-r-planner'], {
      quality: 'opus',
      balanced: 'opus',
      budget: 'sonnet',
    });
  });
});

// --- VALID_PROFILES ---

describe('VALID_PROFILES', () => {
  it('equals quality, balanced, budget', () => {
    assert.deepEqual(VALID_PROFILES, ['quality', 'balanced', 'budget']);
  });

  it('is derived from gsd-r-planner keys', () => {
    assert.deepEqual(VALID_PROFILES, Object.keys(MODEL_PROFILES['gsd-r-planner']));
  });
});

// --- getAgentToModelMapForProfile ---

describe('getAgentToModelMapForProfile', () => {
  it('returns map with 19 entries for balanced profile', () => {
    const map = getAgentToModelMapForProfile('balanced');
    assert.equal(Object.keys(map).length, 19);
  });

  it('returns correct model for gsd-r-planner quality', () => {
    assert.equal(getAgentToModelMapForProfile('quality')['gsd-r-planner'], 'opus');
  });

  it('returns correct model for gsd-r-codebase-mapper budget', () => {
    assert.equal(getAgentToModelMapForProfile('budget')['gsd-r-codebase-mapper'], 'haiku');
  });

  it('returns undefined values for invalid profile name', () => {
    const map = getAgentToModelMapForProfile('nonexistent');
    assert.equal(map['gsd-r-planner'], undefined);
  });
});

// --- formatAgentToModelMapAsTable ---

describe('formatAgentToModelMapAsTable', () => {
  const table = formatAgentToModelMapAsTable({ 'gsd-r-planner': 'opus' });

  it('includes Agent and Model headers', () => {
    assert.ok(table.includes('Agent'));
    assert.ok(table.includes('Model'));
  });

  it('includes box-drawing separator', () => {
    assert.ok(table.includes('\u2500'));
    assert.ok(table.includes('\u253C'));
  });

  it('includes agent name and model in output', () => {
    assert.ok(table.includes('gsd-r-planner'));
    assert.ok(table.includes('opus'));
  });
});

// --- VERSION file ---

describe('VERSION file', () => {
  it('exists at get-shit-done-r/VERSION', () => {
    const versionPath = path.join(__dirname, '..', 'get-shit-done-r', 'VERSION');
    assert.ok(fs.existsSync(versionPath), 'VERSION file does not exist');
  });

  it('contains exactly 1.24.0', () => {
    const versionPath = path.join(__dirname, '..', 'get-shit-done-r', 'VERSION');
    const content = fs.readFileSync(versionPath, 'utf-8').trim();
    assert.equal(content, '1.24.0');
  });
});
