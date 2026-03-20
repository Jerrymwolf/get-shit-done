const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RESEARCH_TEMPLATES_DIR = path.join(__dirname, '..', 'grd', 'templates', 'research-project');
const NEW_RESEARCH_PATH = path.join(__dirname, '..', 'grd', 'workflows', 'new-research.md');

describe('Researcher Recharter (FORM-02)', () => {

  describe('New template files exist', () => {
    it('METHODOLOGICAL-LANDSCAPE.md exists', () => {
      assert.ok(fs.existsSync(path.join(RESEARCH_TEMPLATES_DIR, 'METHODOLOGICAL-LANDSCAPE.md')),
        'Missing METHODOLOGICAL-LANDSCAPE.md');
    });
    it('PRIOR-FINDINGS.md exists', () => {
      assert.ok(fs.existsSync(path.join(RESEARCH_TEMPLATES_DIR, 'PRIOR-FINDINGS.md')),
        'Missing PRIOR-FINDINGS.md');
    });
    it('THEORETICAL-FRAMEWORK.md exists', () => {
      assert.ok(fs.existsSync(path.join(RESEARCH_TEMPLATES_DIR, 'THEORETICAL-FRAMEWORK.md')),
        'Missing THEORETICAL-FRAMEWORK.md');
    });
    it('LIMITATIONS-DEBATES.md exists', () => {
      assert.ok(fs.existsSync(path.join(RESEARCH_TEMPLATES_DIR, 'LIMITATIONS-DEBATES.md')),
        'Missing LIMITATIONS-DEBATES.md');
    });
  });

  describe('Old template files removed', () => {
    it('LANDSCAPE.md does not exist', () => {
      assert.ok(!fs.existsSync(path.join(RESEARCH_TEMPLATES_DIR, 'LANDSCAPE.md')),
        'LANDSCAPE.md should be deleted');
    });
    it('QUESTIONS.md does not exist', () => {
      assert.ok(!fs.existsSync(path.join(RESEARCH_TEMPLATES_DIR, 'QUESTIONS.md')),
        'QUESTIONS.md should be deleted');
    });
    it('FRAMEWORKS.md does not exist', () => {
      assert.ok(!fs.existsSync(path.join(RESEARCH_TEMPLATES_DIR, 'FRAMEWORKS.md')),
        'FRAMEWORKS.md should be deleted');
    });
    it('DEBATES.md does not exist', () => {
      assert.ok(!fs.existsSync(path.join(RESEARCH_TEMPLATES_DIR, 'DEBATES.md')),
        'DEBATES.md should be deleted');
    });
  });

  describe('new-research.md references new names', () => {
    const content = fs.readFileSync(NEW_RESEARCH_PATH, 'utf8');

    it('references METHODOLOGICAL-LANDSCAPE in output paths', () => {
      assert.ok(content.includes('METHODOLOGICAL-LANDSCAPE'),
        'new-research.md should reference METHODOLOGICAL-LANDSCAPE');
    });
    it('references PRIOR-FINDINGS in output paths', () => {
      assert.ok(content.includes('PRIOR-FINDINGS'),
        'new-research.md should reference PRIOR-FINDINGS');
    });
    it('references THEORETICAL-FRAMEWORK in output paths', () => {
      assert.ok(content.includes('THEORETICAL-FRAMEWORK'),
        'new-research.md should reference THEORETICAL-FRAMEWORK');
    });
    it('references LIMITATIONS-DEBATES in output paths', () => {
      assert.ok(content.includes('LIMITATIONS-DEBATES'),
        'new-research.md should reference LIMITATIONS-DEBATES');
    });
    it('does not reference old output path research/LANDSCAPE.md', () => {
      assert.ok(!content.includes('research/LANDSCAPE.md'),
        'Still references old research/LANDSCAPE.md path');
    });
    it('does not reference old output path research/QUESTIONS.md', () => {
      assert.ok(!content.includes('research/QUESTIONS.md'),
        'Still references old research/QUESTIONS.md path');
    });
    it('does not reference old output path research/FRAMEWORKS.md', () => {
      assert.ok(!content.includes('research/FRAMEWORKS.md'),
        'Still references old research/FRAMEWORKS.md path');
    });
    it('does not reference old output path research/DEBATES.md', () => {
      assert.ok(!content.includes('research/DEBATES.md'),
        'Still references old research/DEBATES.md path');
    });
  });
});
