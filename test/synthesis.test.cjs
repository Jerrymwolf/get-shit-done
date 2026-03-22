'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// --- Synthesis Workflow File ---

describe('Synthesis workflow', () => {
  const workflowPath = path.join(__dirname, '..', 'grd', 'workflows', 'synthesize.md');

  it('synthesize.md exists', () => {
    assert.ok(fs.existsSync(workflowPath), 'synthesize.md does not exist');
  });

  it('contains purpose block', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('<purpose>'), 'Missing <purpose> block');
  });

  it('contains readiness validation step', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('validate_readiness'), 'Missing validate_readiness step');
  });

  it('contains TRAP-04 synthesis scope gate', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('Synthesis Scope'), 'Missing TRAP-04 gate header');
    assert.ok(content.includes('Full synthesis'), 'Missing Full synthesis option');
    assert.ok(content.includes('Themes + argument only'), 'Missing Themes + argument only option');
    assert.ok(content.includes('Skip synthesis'), 'Missing Skip synthesis option');
  });

  it('contains skip flag handling', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('--skip-themes'), 'Missing --skip-themes flag');
    assert.ok(content.includes('--skip-framework'), 'Missing --skip-framework flag');
    assert.ok(content.includes('--skip-gaps'), 'Missing --skip-gaps flag');
  });

  it('contains skip flag dependency validation', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('Cannot skip themes'), 'Missing skip-themes dependency error');
  });

  it('references all 4 synthesis agent types', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('grd-thematic-synthesizer'), 'Missing thematic synthesizer reference');
    assert.ok(content.includes('grd-framework-integrator'), 'Missing framework integrator reference');
    assert.ok(content.includes('grd-gap-analyzer'), 'Missing gap analyzer reference');
    assert.ok(content.includes('grd-argument-constructor'), 'Missing argument constructor reference');
  });

  it('enforces 4-wave dependency ordering per D-07: themes < framework < gaps < argument', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    // Find the wave assignment section (Step 6: generate_synthesis_plan)
    const themesPos = content.indexOf('grd-thematic-synthesizer');
    const frameworkPos = content.indexOf('grd-framework-integrator');
    const gapPos = content.indexOf('grd-gap-analyzer');
    const argumentPos = content.indexOf('grd-argument-constructor');
    // Themes must appear before framework in wave ordering
    assert.ok(themesPos < frameworkPos, 'Themes must appear before framework in wave ordering');
    // Framework must appear before gaps (D-07: gaps requires FRAMEWORK.md)
    assert.ok(frameworkPos < gapPos, 'Framework must appear before gaps in wave ordering (D-07: gaps requires FRAMEWORK.md)');
    // Gaps must appear before argument
    assert.ok(gapPos < argumentPos, 'Gaps must appear before argument in wave ordering');
  });

  it('gap analysis lists FRAMEWORK.md as input dependency', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    // Find the gap analysis section and verify it references FRAMEWORK.md as input
    const gapSection = content.substring(
      content.indexOf('grd-gap-analyzer'),
      content.indexOf('grd-argument-constructor')
    );
    assert.ok(
      gapSection.includes('00-FRAMEWORK.md') || gapSection.includes('FRAMEWORK.md'),
      'Gap analysis must list FRAMEWORK.md as input (D-07)'
    );
  });

  it('uses 4 waves not 3', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    // Verify wave 4 exists (argument construction)
    assert.ok(
      content.includes('Wave 4') || content.includes('wave 4') || content.includes('wave: 4'),
      'Must use 4 waves per D-07 dependency chain'
    );
  });

  it('uses 00- prefixed output paths', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('00-THEMES.md'), 'Missing 00-THEMES.md output path');
    assert.ok(content.includes('00-FRAMEWORK.md'), 'Missing 00-FRAMEWORK.md output path');
    assert.ok(content.includes('00-GAPS.md'), 'Missing 00-GAPS.md output path');
    assert.ok(content.includes('00-Executive-Summary.md'), 'Missing 00-Executive-Summary.md output path');
  });

  it('checks config.workflow.synthesis toggle', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('config.workflow.synthesis') || content.includes('workflow.synthesis'), 'Missing synthesis config toggle check');
  });

  it('includes tier-conditional blocks', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('researcher_tier'), 'Missing researcher_tier tier-conditional blocks');
  });

  it('accepts passed and human_needed verification statuses', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('passed'), 'Missing passed status acceptance');
    assert.ok(content.includes('human_needed'), 'Missing human_needed status acceptance');
  });

  it('supports --partial flag', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('--partial'), 'Missing --partial flag support');
  });
});

// --- Synthesis Agent Files ---

describe('Synthesis agent prompts', () => {
  const agents = [
    { name: 'grd-thematic-synthesizer', methodology: 'Braun & Clarke' },
    { name: 'grd-framework-integrator', methodology: 'Carroll et al.' },
    { name: 'grd-gap-analyzer', methodology: 'Muller-Bloch' },
    { name: 'grd-argument-constructor', methodology: 'deliverable_format' },
  ];

  for (const agent of agents) {
    it(`${agent.name}.md exists`, () => {
      const agentPath = path.join(__dirname, '..', 'grd', 'agents', `${agent.name}.md`);
      assert.ok(fs.existsSync(agentPath), `${agent.name}.md does not exist`);
    });

    it(`${agent.name}.md contains methodology reference`, () => {
      const agentPath = path.join(__dirname, '..', 'grd', 'agents', `${agent.name}.md`);
      const content = fs.readFileSync(agentPath, 'utf-8');
      assert.ok(content.includes(agent.methodology), `${agent.name}.md missing ${agent.methodology}`);
    });

    it(`${agent.name}.md contains purpose block`, () => {
      const agentPath = path.join(__dirname, '..', 'grd', 'agents', `${agent.name}.md`);
      const content = fs.readFileSync(agentPath, 'utf-8');
      assert.ok(content.includes('<purpose>'), `${agent.name}.md missing <purpose> block`);
    });
  }
});

// --- Synthesis Output Templates ---

describe('Synthesis output templates', () => {
  const templates = [
    { name: 'themes.md', required: ['## Themes', 'Coverage Map'] },
    { name: 'framework.md', required: ['## Evidence Mapping', 'Framework Modifications'] },
    { name: 'gaps.md', required: ['## Identified Gaps', 'Problematization'] },
    { name: 'executive-summary.md', required: ['## Key Themes', '## Conclusion'] },
  ];

  for (const tmpl of templates) {
    it(`${tmpl.name} exists`, () => {
      const tmplPath = path.join(__dirname, '..', 'grd', 'templates', tmpl.name);
      assert.ok(fs.existsSync(tmplPath), `${tmpl.name} does not exist`);
    });

    for (const req of tmpl.required) {
      it(`${tmpl.name} contains "${req}"`, () => {
        const tmplPath = path.join(__dirname, '..', 'grd', 'templates', tmpl.name);
        const content = fs.readFileSync(tmplPath, 'utf-8');
        assert.ok(content.includes(req), `${tmpl.name} missing "${req}"`);
      });
    }
  }
});

// --- Complete-Study Synthesis Validation ---

describe('Complete-study synthesis validation', () => {
  const completePath = path.join(__dirname, '..', 'grd', 'workflows', 'complete-study.md');

  it('complete-study.md contains validate_synthesis step', () => {
    const content = fs.readFileSync(completePath, 'utf-8');
    assert.ok(content.includes('validate_synthesis'), 'Missing validate_synthesis step');
  });

  it('checks for 00-THEMES.md existence', () => {
    const content = fs.readFileSync(completePath, 'utf-8');
    assert.ok(content.includes('00-THEMES.md'), 'Missing 00-THEMES.md check');
  });

  it('checks for 00-Executive-Summary.md existence', () => {
    const content = fs.readFileSync(completePath, 'utf-8');
    assert.ok(content.includes('00-Executive-Summary.md'), 'Missing 00-Executive-Summary.md check');
  });

  it('respects config.workflow.synthesis toggle', () => {
    const content = fs.readFileSync(completePath, 'utf-8');
    assert.ok(
      content.includes('workflow.synthesis') || content.includes('config.workflow.synthesis'),
      'Missing synthesis config toggle reference'
    );
  });
});

// --- Deliverable Format in PROJECT.md Template ---

describe('Deliverable format integration', () => {
  it('project.md template contains deliverable_format section', () => {
    const tmplPath = path.join(__dirname, '..', 'grd', 'templates', 'project.md');
    const content = fs.readFileSync(tmplPath, 'utf-8');
    assert.ok(content.includes('Deliverable Format'), 'Missing Deliverable Format section');
    assert.ok(content.includes('literature_review'), 'Missing literature_review option');
  });

  it('new-research.md asks deliverable_format during scoping', () => {
    const workflowPath = path.join(__dirname, '..', 'grd', 'workflows', 'new-research.md');
    const content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(
      content.includes('deliverable_format') || content.includes('Output Format') || content.includes('Deliverable'),
      'Missing deliverable_format question in new-research.md'
    );
  });
});

// --- SMART_DEFAULTS synthesis toggle ---

describe('SMART_DEFAULTS synthesis configuration', () => {
  const { SMART_DEFAULTS } = require('../grd/bin/lib/config.cjs');

  it('systematic requires synthesis', () => {
    assert.equal(SMART_DEFAULTS.systematic.synthesis, 'required');
  });

  it('scoping recommends synthesis', () => {
    assert.equal(SMART_DEFAULTS.scoping.synthesis, 'recommended');
  });

  it('narrative has optional synthesis', () => {
    assert.equal(SMART_DEFAULTS.narrative.synthesis, 'optional');
  });
});
