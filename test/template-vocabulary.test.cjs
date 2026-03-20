const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'grd', 'templates');

describe('Template Vocabulary (Phase 18)', () => {

  describe('FORM-03: PROJECT.md as research prospectus', () => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, 'project.md'), 'utf8');

    it('contains Problem Statement section', () => {
      assert.ok(content.includes('## Problem Statement'), 'Missing ## Problem Statement');
    });
    it('contains Significance section', () => {
      assert.ok(content.includes('## Significance'), 'Missing ## Significance');
    });
    it('contains Epistemological Stance section', () => {
      assert.ok(content.includes('## Epistemological Stance'), 'Missing ## Epistemological Stance');
    });
    it('contains Review Type section', () => {
      assert.ok(content.includes('## Review Type'), 'Missing ## Review Type');
    });
    it('contains Researcher Tier section', () => {
      assert.ok(content.includes('## Researcher Tier'), 'Missing ## Researcher Tier');
    });
    it('contains Research Questions section', () => {
      assert.ok(content.includes('## Research Questions'), 'Missing ## Research Questions');
    });
    it('contains Methodological Decisions section', () => {
      assert.ok(content.includes('## Methodological Decisions'), 'Missing ## Methodological Decisions');
    });
    it('does not contain old PM vocabulary', () => {
      assert.ok(!content.includes('## What This Is'), 'Still contains ## What This Is');
      assert.ok(!content.includes('## Core Value'), 'Still contains ## Core Value');
      assert.ok(!content.includes('## Key Decisions'), 'Still contains ## Key Decisions');
    });
  });

  describe('FORM-04: BOOTSTRAP.md as state-of-the-field', () => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, 'bootstrap.md'), 'utf8');

    it('has scholarly title', () => {
      assert.ok(content.includes('State-of-the-Field Assessment'), 'Missing State-of-the-Field Assessment');
    });
    it('has Established Knowledge section', () => {
      assert.ok(content.includes('## Established Knowledge'), 'Missing ## Established Knowledge');
    });
    it('has Contested Claims section', () => {
      assert.ok(content.includes('## Contested Claims'), 'Missing ## Contested Claims');
    });
    it('has Knowledge Gaps section', () => {
      assert.ok(content.includes('## Knowledge Gaps'), 'Missing ## Knowledge Gaps');
    });
    it('does not contain old vocabulary', () => {
      assert.ok(!content.includes('Already Established'), 'Still contains Already Established');
      assert.ok(!content.includes('Not Yet Researched'), 'Still contains Not Yet Researched');
    });
  });

  describe('FORM-05: REQUIREMENTS.md as research objectives', () => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, 'requirements.md'), 'utf8');

    it('has scholarly title', () => {
      assert.ok(content.includes('Research Objectives'), 'Missing Research Objectives');
    });
    it('has Primary Research Objectives section', () => {
      assert.ok(content.includes('Primary Research Objectives'), 'Missing Primary Research Objectives');
    });
    it('has Secondary Research Objectives section', () => {
      assert.ok(content.includes('Secondary Research Objectives'), 'Missing Secondary Research Objectives');
    });
    it('preserves REQ-ID format', () => {
      // Must still have the [CATEGORY]-NN pattern
      assert.ok(/\*\*\[?\w+\]?-\d+\*\*/.test(content), 'REQ-ID format not preserved');
    });
    it('does not contain old vocabulary', () => {
      assert.ok(!content.includes('## v1 Requirements'), 'Still contains ## v1 Requirements');
      assert.ok(!content.includes('## v2 Requirements'), 'Still contains ## v2 Requirements');
    });
  });

  describe('FORM-06: ROADMAP.md as research design', () => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, 'roadmap.md'), 'utf8');

    it('has scholarly title', () => {
      assert.ok(content.includes('Research Design'), 'Missing Research Design');
    });
    it('uses Inquiry instead of Phase in headings', () => {
      assert.ok(content.includes('### Inquiry 1:'), 'Missing ### Inquiry 1:');
    });
    it('has Lines of Inquiry section', () => {
      assert.ok(content.includes('Lines of Inquiry'), 'Missing Lines of Inquiry');
    });
    it('has Inquiry Details section', () => {
      assert.ok(content.includes('Inquiry Details'), 'Missing Inquiry Details');
    });
  });
});
