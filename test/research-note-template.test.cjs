const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const NOTE_PATH = path.join(__dirname, '..', 'grd', 'templates', 'research-note.md');

describe('Research Note Template (Phase 18)', () => {
  const content = fs.readFileSync(NOTE_PATH, 'utf8');

  describe('NOTE-01: Evidence Quality section', () => {
    it('has Evidence Quality section', () => {
      assert.ok(content.includes('## Evidence Quality'), 'Missing ## Evidence Quality');
    });
    it('Evidence Quality is between Analysis and Implications', () => {
      const analysisIdx = content.indexOf('## Analysis');
      const eqIdx = content.indexOf('## Evidence Quality');
      const implIdx = content.indexOf('## Implications');
      assert.ok(analysisIdx < eqIdx, 'Evidence Quality should be after Analysis');
      assert.ok(eqIdx < implIdx, 'Evidence Quality should be before Implications');
    });
    it('includes systematic/scoping table format', () => {
      assert.ok(content.includes('| Source | Design | Sample | Quality | Limitations |'),
        'Missing systematic/scoping table format');
    });
    it('includes integrative/critical prose format', () => {
      assert.ok(content.includes('Integrative / Critical Format'),
        'Missing integrative/critical format guidance');
    });
    it('includes narrative brief format', () => {
      assert.ok(content.includes('Narrative Format'),
        'Missing narrative format guidance');
    });
  });

  describe('NOTE-02: era field in frontmatter', () => {
    it('has era field', () => {
      assert.ok(content.includes('era:'), 'Missing era field in frontmatter');
    });
    it('era options include foundational/developmental/contemporary/emerging', () => {
      assert.ok(content.includes('foundational'), 'Missing foundational era option');
      assert.ok(content.includes('developmental'), 'Missing developmental era option');
      assert.ok(content.includes('contemporary'), 'Missing contemporary era option');
      assert.ok(content.includes('emerging'), 'Missing emerging era option');
    });
  });

  describe('NOTE-03: new frontmatter fields', () => {
    it('has review_type field', () => {
      assert.ok(content.includes('review_type:'), 'Missing review_type field');
    });
    it('has inquiry field', () => {
      assert.ok(content.includes('inquiry:'), 'Missing inquiry field');
    });
    it('has status field with draft default', () => {
      assert.ok(content.includes('status: draft'), 'Missing status: draft');
    });
  });

  describe('Research vocabulary', () => {
    it('uses Study instead of Project in Implications', () => {
      assert.ok(content.includes('Implications for [Study]'),
        'Should say Implications for [Study] not [Project]');
    });
    it('uses Study Name in frontmatter hint', () => {
      assert.ok(content.includes('[Study Name]') || content.includes('Study Name'),
        'Frontmatter project hint should reference Study Name');
    });
  });
});
