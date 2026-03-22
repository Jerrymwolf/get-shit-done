const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  MODEL_PROFILES,
  VALID_PROFILES,
  formatAgentToModelMapAsTable,
  getAgentToModelMapForProfile,
} = require('../grd/bin/lib/model-profiles.cjs');

// --- MODEL_PROFILES ---

describe('MODEL_PROFILES', () => {
  it('contains exactly 23 agents', () => {
    assert.equal(Object.keys(MODEL_PROFILES).length, 23);
  });

  it('every agent key starts with grd-', () => {
    for (const key of Object.keys(MODEL_PROFILES)) {
      assert.ok(key.startsWith('grd-'), `Expected "${key}" to start with "grd-"`);
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

  it('includes all 15 upstream agents renamed to grd-*', () => {
    const upstreamAgents = [
      'grd-planner',
      'grd-roadmapper',
      'grd-executor',
      'grd-phase-researcher',
      'grd-project-researcher',
      'grd-research-synthesizer',
      'grd-debugger',
      'grd-codebase-mapper',
      'grd-verifier',
      'grd-plan-checker',
      'grd-integration-checker',
      'grd-nyquist-auditor',
      'grd-ui-researcher',
      'grd-ui-checker',
      'grd-ui-auditor',
    ];
    for (const agent of upstreamAgents) {
      assert.ok(agent in MODEL_PROFILES, `Missing upstream agent: ${agent}`);
    }
  });

  it('includes 4 GRD research agents', () => {
    const researchAgents = [
      'grd-source-researcher',
      'grd-methods-researcher',
      'grd-architecture-researcher',
      'grd-limitations-researcher',
    ];
    for (const agent of researchAgents) {
      assert.ok(agent in MODEL_PROFILES, `Missing research agent: ${agent}`);
    }
  });

  it('research agents match phase-researcher tier', () => {
    const researchAgents = [
      'grd-source-researcher',
      'grd-methods-researcher',
      'grd-architecture-researcher',
      'grd-limitations-researcher',
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

  it('includes 4 GRD synthesis agents', () => {
    const synthesisAgents = [
      'grd-thematic-synthesizer',
      'grd-framework-integrator',
      'grd-gap-analyzer',
      'grd-argument-constructor',
    ];
    for (const agent of synthesisAgents) {
      assert.ok(agent in MODEL_PROFILES, `Missing synthesis agent: ${agent}`);
    }
  });

  it('synthesis agents match phase-researcher tier', () => {
    const synthesisAgents = [
      'grd-thematic-synthesizer',
      'grd-framework-integrator',
      'grd-gap-analyzer',
      'grd-argument-constructor',
    ];
    const expectedTier = { quality: 'opus', balanced: 'sonnet', budget: 'haiku' };
    for (const agent of synthesisAgents) {
      assert.deepEqual(
        MODEL_PROFILES[agent],
        expectedTier,
        `Synthesis agent "${agent}" does not match phase-researcher tier`
      );
    }
  });

  it('grd-planner has correct tiers', () => {
    assert.deepEqual(MODEL_PROFILES['grd-planner'], {
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

  it('is derived from grd-planner keys', () => {
    assert.deepEqual(VALID_PROFILES, Object.keys(MODEL_PROFILES['grd-planner']));
  });
});

// --- getAgentToModelMapForProfile ---

describe('getAgentToModelMapForProfile', () => {
  it('returns map with 23 entries for balanced profile', () => {
    const map = getAgentToModelMapForProfile('balanced');
    assert.equal(Object.keys(map).length, 23);
  });

  it('returns correct model for grd-planner quality', () => {
    assert.equal(getAgentToModelMapForProfile('quality')['grd-planner'], 'opus');
  });

  it('returns correct model for grd-codebase-mapper budget', () => {
    assert.equal(getAgentToModelMapForProfile('budget')['grd-codebase-mapper'], 'haiku');
  });

  it('returns undefined values for invalid profile name', () => {
    const map = getAgentToModelMapForProfile('nonexistent');
    assert.equal(map['grd-planner'], undefined);
  });
});

// --- formatAgentToModelMapAsTable ---

describe('formatAgentToModelMapAsTable', () => {
  const table = formatAgentToModelMapAsTable({ 'grd-planner': 'opus' });

  it('includes Agent and Model headers', () => {
    assert.ok(table.includes('Agent'));
    assert.ok(table.includes('Model'));
  });

  it('includes box-drawing separator', () => {
    assert.ok(table.includes('\u2500'));
    assert.ok(table.includes('\u253C'));
  });

  it('includes agent name and model in output', () => {
    assert.ok(table.includes('grd-planner'));
    assert.ok(table.includes('opus'));
  });
});

// --- VERSION file ---

describe('VERSION file', () => {
  it('exists at grd/VERSION', () => {
    const versionPath = path.join(__dirname, '..', 'grd', 'VERSION');
    assert.ok(fs.existsSync(versionPath), 'VERSION file does not exist');
  });

  it('contains exactly 1.25.1', () => {
    const versionPath = path.join(__dirname, '..', 'grd', 'VERSION');
    const content = fs.readFileSync(versionPath, 'utf-8').trim();
    assert.equal(content, '1.25.1');
  });
});
