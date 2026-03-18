const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  VALID_CONFIG_KEYS,
  SMART_DEFAULTS,
  REVIEW_TYPE_ORDER,
  configWithDefaults,
  applySmartDefaults,
  canDowngrade,
} = require('../get-shit-done-r/bin/lib/config.cjs');

// --- VALID_CONFIG_KEYS ---

describe('VALID_CONFIG_KEYS', () => {
  it('contains researcher_tier', () => {
    assert.ok(VALID_CONFIG_KEYS.has('researcher_tier'));
  });

  it('contains review_type', () => {
    assert.ok(VALID_CONFIG_KEYS.has('review_type'));
  });

  it('contains epistemological_stance', () => {
    assert.ok(VALID_CONFIG_KEYS.has('epistemological_stance'));
  });

  it('contains workflow.critical_appraisal', () => {
    assert.ok(VALID_CONFIG_KEYS.has('workflow.critical_appraisal'));
  });

  it('contains workflow.temporal_positioning', () => {
    assert.ok(VALID_CONFIG_KEYS.has('workflow.temporal_positioning'));
  });

  it('contains workflow.synthesis', () => {
    assert.ok(VALID_CONFIG_KEYS.has('workflow.synthesis'));
  });
});

// --- SMART_DEFAULTS ---

describe('SMART_DEFAULTS', () => {
  it('systematic has correct 4-field values', () => {
    assert.deepStrictEqual(SMART_DEFAULTS.systematic, {
      critical_appraisal: 'required',
      temporal_positioning: 'required',
      synthesis: 'required',
      plan_check: 'strict',
    });
  });

  it('scoping has correct 4-field values', () => {
    assert.deepStrictEqual(SMART_DEFAULTS.scoping, {
      critical_appraisal: 'charting',
      temporal_positioning: 'recommended',
      synthesis: 'recommended',
      plan_check: 'moderate',
    });
  });

  it('integrative has correct 4-field values', () => {
    assert.deepStrictEqual(SMART_DEFAULTS.integrative, {
      critical_appraisal: 'proportional',
      temporal_positioning: 'recommended',
      synthesis: 'required',
      plan_check: 'moderate',
    });
  });

  it('critical has correct 4-field values', () => {
    assert.deepStrictEqual(SMART_DEFAULTS.critical, {
      critical_appraisal: 'proportional',
      temporal_positioning: 'recommended',
      synthesis: 'required',
      plan_check: 'moderate',
    });
  });

  it('narrative has correct 4-field values', () => {
    assert.deepStrictEqual(SMART_DEFAULTS.narrative, {
      critical_appraisal: 'optional',
      temporal_positioning: 'optional',
      synthesis: 'optional',
      plan_check: 'light',
    });
  });
});

// --- configWithDefaults() ---

describe('configWithDefaults', () => {
  it('empty config returns correct top-level defaults', () => {
    const result = configWithDefaults({});
    assert.equal(result.researcher_tier, 'standard');
    assert.equal(result.review_type, 'narrative');
    assert.equal(result.epistemological_stance, 'pragmatist');
  });

  it('empty config returns narrative smart defaults for workflow', () => {
    const result = configWithDefaults({});
    assert.equal(result.workflow.critical_appraisal, 'optional');
    assert.equal(result.workflow.temporal_positioning, 'optional');
    assert.equal(result.workflow.synthesis, 'optional');
    assert.equal(result.workflow.plan_check, 'light');
  });

  it('review_type systematic returns systematic smart defaults', () => {
    const result = configWithDefaults({ review_type: 'systematic' });
    assert.equal(result.workflow.critical_appraisal, 'required');
  });

  it('preserves user override of smart default key', () => {
    const result = configWithDefaults({
      review_type: 'systematic',
      workflow: { critical_appraisal: 'charting' },
    });
    assert.equal(result.workflow.critical_appraisal, 'charting');
  });

  it('preserves existing workflow keys while adding missing defaults', () => {
    const result = configWithDefaults({ workflow: { research: true } });
    assert.equal(result.workflow.research, true);
    assert.equal(result.workflow.critical_appraisal, 'optional');
    assert.equal(result.workflow.temporal_positioning, 'optional');
  });

  it('preserves existing top-level keys', () => {
    const result = configWithDefaults({ mode: 'yolo', granularity: 'fine' });
    assert.equal(result.mode, 'yolo');
    assert.equal(result.granularity, 'fine');
    assert.equal(result.researcher_tier, 'standard');
  });

  it('boolean plan_check true converts to moderate for backward compat', () => {
    const result = configWithDefaults({ workflow: { plan_check: true } });
    assert.equal(result.workflow.plan_check, 'moderate');
  });

  it('boolean plan_check false keeps as false (disabled)', () => {
    const result = configWithDefaults({ workflow: { plan_check: false } });
    assert.equal(result.workflow.plan_check, false);
  });
});

// --- applySmartDefaults() ---

describe('applySmartDefaults', () => {
  it('resets workflow toggles to new review type smart defaults', () => {
    const config = {
      review_type: 'systematic',
      workflow: {
        research: true,
        critical_appraisal: 'required',
        temporal_positioning: 'required',
        synthesis: 'required',
        plan_check: 'strict',
      },
    };
    const result = applySmartDefaults(config, 'scoping');
    assert.equal(result.review_type, 'scoping');
    assert.equal(result.workflow.critical_appraisal, 'charting');
    assert.equal(result.workflow.temporal_positioning, 'recommended');
    assert.equal(result.workflow.synthesis, 'recommended');
    assert.equal(result.workflow.plan_check, 'moderate');
  });

  it('preserves non-smart-default workflow keys', () => {
    const config = {
      review_type: 'systematic',
      workflow: {
        research: true,
        verifier: true,
        nyquist_validation: true,
        critical_appraisal: 'required',
        temporal_positioning: 'required',
        synthesis: 'required',
        plan_check: 'strict',
      },
    };
    const result = applySmartDefaults(config, 'narrative');
    assert.equal(result.workflow.research, true);
    assert.equal(result.workflow.verifier, true);
    assert.equal(result.workflow.nyquist_validation, true);
  });

  it('does not mutate the input config', () => {
    const config = {
      review_type: 'systematic',
      workflow: { critical_appraisal: 'required', plan_check: 'strict' },
    };
    applySmartDefaults(config, 'narrative');
    assert.equal(config.review_type, 'systematic');
    assert.equal(config.workflow.critical_appraisal, 'required');
  });
});

// --- canDowngrade() and REVIEW_TYPE_ORDER ---

describe('canDowngrade() and REVIEW_TYPE_ORDER', () => {
  it('REVIEW_TYPE_ORDER is the correct ordered array', () => {
    assert.deepStrictEqual(REVIEW_TYPE_ORDER, [
      'systematic', 'scoping', 'integrative', 'critical', 'narrative',
    ]);
  });

  it('allows downgrade from systematic to scoping', () => {
    assert.equal(canDowngrade('systematic', 'scoping'), true);
  });

  it('allows downgrade from systematic to narrative', () => {
    assert.equal(canDowngrade('systematic', 'narrative'), true);
  });

  it('blocks upgrade from narrative to systematic', () => {
    assert.equal(canDowngrade('narrative', 'systematic'), false);
  });

  it('blocks upgrade from narrative to scoping', () => {
    assert.equal(canDowngrade('narrative', 'scoping'), false);
  });

  it('same type is not a downgrade', () => {
    assert.equal(canDowngrade('scoping', 'scoping'), false);
  });
});
