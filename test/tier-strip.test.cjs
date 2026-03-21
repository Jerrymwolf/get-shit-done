'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { stripTierContent, VALID_TIERS } = require('../grd/bin/lib/tier-strip.cjs');

const ROOT = path.join(__dirname, '..');
const ADAPTED_TEMPLATES = [
  'research-note.md', 'source-log.md', 'research-task.md',
  'project.md', 'bootstrap.md', 'requirements.md', 'roadmap.md',
];

describe('stripTierContent()', () => {

  describe('XML mode', () => {
    const xml = '<tier-guided>hello</tier-guided>\n<tier-standard>world</tier-standard>\n<tier-expert>!</tier-expert>';

    it('guided tier keeps guided content, removes standard and expert', () => {
      const result = stripTierContent(xml, 'guided', 'xml');
      assert.ok(result.includes('hello'), 'should keep guided content');
      assert.ok(!result.includes('world'), 'should remove standard content');
      assert.ok(!result.includes('!'), 'should remove expert content');
    });

    it('standard tier keeps standard content, removes guided and expert', () => {
      const result = stripTierContent(xml, 'standard', 'xml');
      assert.ok(!result.includes('hello'), 'should remove guided content');
      assert.ok(result.includes('world'), 'should keep standard content');
      assert.ok(!result.includes('!'), 'should remove expert content');
    });

    it('expert tier keeps expert content, removes guided and standard', () => {
      const result = stripTierContent(xml, 'expert', 'xml');
      assert.ok(!result.includes('hello'), 'should remove guided content');
      assert.ok(!result.includes('world'), 'should remove standard content');
      assert.ok(result.includes('!'), 'should keep expert content');
    });

    it('preserves unwrapped content for all tiers', () => {
      const input = 'before\n<tier-guided>G</tier-guided>\nafter';
      const result = stripTierContent(input, 'expert', 'xml');
      assert.ok(result.includes('before'), 'should keep content before tier block');
      assert.ok(result.includes('after'), 'should keep content after tier block');
      assert.ok(!result.includes('G'), 'should remove guided content');
    });

    it('preserves multiline content inside blocks', () => {
      const input = '<tier-guided>line1\nline2\nline3</tier-guided>';
      const result = stripTierContent(input, 'guided', 'xml');
      assert.ok(result.includes('line1'), 'should keep line1');
      assert.ok(result.includes('line2'), 'should keep line2');
      assert.ok(result.includes('line3'), 'should keep line3');
      assert.ok(!result.includes('<tier-guided>'), 'should remove opening tag');
      assert.ok(!result.includes('</tier-guided>'), 'should remove closing tag');
    });

    it('handles nested XML inside tier blocks', () => {
      const input = '<tier-guided>Use <src> tags for citations</tier-guided>';
      const result = stripTierContent(input, 'guided', 'xml');
      assert.equal(result.trim(), 'Use <src> tags for citations');
    });
  });

  describe('Comment mode', () => {
    it('guided tier keeps guided content, removes standard', () => {
      const input = '<!-- tier:guided -->\nhello\n<!-- /tier:guided -->\n<!-- tier:standard -->\nworld\n<!-- /tier:standard -->';
      const result = stripTierContent(input, 'guided', 'comment');
      assert.ok(result.includes('hello'), 'should keep guided content');
      assert.ok(!result.includes('world'), 'should remove standard content');
    });

    it('expert tier keeps unwrapped content, removes guided block', () => {
      const input = '## Heading\n<!-- tier:guided -->\nguidance\n<!-- /tier:guided -->';
      const result = stripTierContent(input, 'expert', 'comment');
      assert.ok(result.includes('## Heading'), 'should keep heading');
      assert.ok(!result.includes('guidance'), 'should remove guided block');
    });

    it('preserves non-tier HTML comments', () => {
      const input = '<!-- normal comment -->';
      for (const tier of VALID_TIERS) {
        const result = stripTierContent(input, tier, 'comment');
        assert.ok(result.includes('<!-- normal comment -->'),
          `non-tier comment should be preserved for ${tier} tier`);
      }
    });
  });

  describe('Validation', () => {
    it('throws Error for invalid tier', () => {
      assert.throws(
        () => stripTierContent('content', 'beginner', 'xml'),
        (err) => {
          assert.ok(err instanceof Error);
          assert.ok(err.message.includes('Invalid tier'));
          return true;
        }
      );
    });

    it('VALID_TIERS exports the three valid tiers', () => {
      assert.deepEqual(VALID_TIERS, ['guided', 'standard', 'expert']);
    });
  });

  describe('Edge cases', () => {
    it('unwrapped content preserved when no matching tier blocks exist', () => {
      const input = 'just plain text\nno tier blocks here';
      for (const tier of VALID_TIERS) {
        const result = stripTierContent(input, tier, 'xml');
        assert.equal(result, input, `plain text should be preserved for ${tier}`);
      }
    });

    it('empty tier blocks result in clean removal', () => {
      const input = '<tier-guided></tier-guided>\n<tier-standard>content</tier-standard>';
      const result = stripTierContent(input, 'standard', 'xml');
      assert.ok(result.includes('content'), 'should keep standard content');
      assert.ok(!result.includes('<tier-guided>'), 'empty guided block should be gone');
    });

    it('mixed unwrapped and wrapped content', () => {
      const input = 'Header\n<tier-guided>guide text</tier-guided>\nMiddle\n<tier-expert>expert text</tier-expert>\nFooter';
      const result = stripTierContent(input, 'guided', 'xml');
      assert.ok(result.includes('Header'), 'keep header');
      assert.ok(result.includes('guide text'), 'keep guided content');
      assert.ok(result.includes('Middle'), 'keep middle');
      assert.ok(!result.includes('expert text'), 'remove expert content');
      assert.ok(result.includes('Footer'), 'keep footer');
    });
  });

  describe('Cleanup', () => {
    it('collapses three or more consecutive newlines to two', () => {
      const input = 'before\n\n\n\nafter';
      const result = stripTierContent(input, 'guided', 'xml');
      assert.ok(!result.includes('\n\n\n'), 'should not have 3+ consecutive newlines');
      assert.ok(result.includes('before\n\nafter'), 'should have exactly 2 newlines');
    });

    it('blank lines left by removed blocks are cleaned up', () => {
      const input = 'before\n\n<tier-guided>removed</tier-guided>\n\nafter';
      const result = stripTierContent(input, 'expert', 'xml');
      const maxConsecutiveNewlines = (result.match(/\n{2,}/g) || [])
        .reduce((max, m) => Math.max(max, m.length), 0);
      assert.ok(maxConsecutiveNewlines <= 2, `max consecutive newlines should be 2, got ${maxConsecutiveNewlines}`);
    });
  });

  describe('Round-trip safety', () => {
    it('no orphaned XML tier tags in output for any tier', () => {
      const input = '<tier-guided>Guide content</tier-guided>\n<tier-standard>Standard content</tier-standard>\n<tier-expert>Expert content</tier-expert>';
      for (const tier of VALID_TIERS) {
        const result = stripTierContent(input, tier, 'xml');
        assert.ok(!/<tier-(guided|standard|expert)>/.test(result),
          `orphaned opening XML tag found for ${tier} tier`);
        assert.ok(!/<\/tier-(guided|standard|expert)>/.test(result),
          `orphaned closing XML tag found for ${tier} tier`);
      }
    });

    it('no orphaned comment tier tags in output for any tier', () => {
      const input = '<!-- tier:guided -->\nGuide\n<!-- /tier:guided -->\n<!-- tier:standard -->\nStandard\n<!-- /tier:standard -->\n<!-- tier:expert -->\nExpert\n<!-- /tier:expert -->';
      for (const tier of VALID_TIERS) {
        const result = stripTierContent(input, tier, 'comment');
        assert.ok(!/<!-- tier:(guided|standard|expert) -->/.test(result),
          `orphaned opening comment tag found for ${tier} tier`);
        assert.ok(!/<!-- \/tier:(guided|standard|expert) -->/.test(result),
          `orphaned closing comment tag found for ${tier} tier`);
      }
    });

    it('stripped output is valid markdown with no orphaned tags', () => {
      const input = '# Title\n\n<tier-guided>\nThis is **bold** and _italic_ guidance.\n</tier-guided>\n\n<tier-standard>\nBrief description.\n</tier-standard>\n\n<tier-expert>\n</tier-expert>\n\n## Next Section\n\nContent here.';
      for (const tier of VALID_TIERS) {
        const result = stripTierContent(input, tier, 'xml');
        assert.ok(result.includes('# Title'), `title preserved for ${tier}`);
        assert.ok(result.includes('## Next Section'), `next section preserved for ${tier}`);
        assert.ok(result.includes('Content here.'), `trailing content preserved for ${tier}`);
        assert.ok(!/<tier-(guided|standard|expert)>/.test(result),
          `orphaned tag in output for ${tier}`);
      }
    });
  });

});

describe('Template completeness scan', () => {
  for (const template of ADAPTED_TEMPLATES) {
    it(`${template} has guided tier blocks`, () => {
      const content = fs.readFileSync(
        path.join(ROOT, 'grd', 'templates', template), 'utf-8'
      );
      assert.ok(
        content.includes('<!-- tier:guided -->'),
        `${template} missing <!-- tier:guided --> block`
      );
      assert.ok(
        content.includes('<!-- /tier:guided -->'),
        `${template} missing <!-- /tier:guided --> closing tag`
      );
    });

    it(`${template} has no orphaned tier tags after stripping`, () => {
      const content = fs.readFileSync(
        path.join(ROOT, 'grd', 'templates', template), 'utf-8'
      );
      for (const tier of VALID_TIERS) {
        const result = stripTierContent(content, tier, 'comment');
        assert.ok(
          !/<!-- tier:(guided|standard|expert) -->/.test(result),
          `${template} has orphaned opening tier tag after stripping for ${tier}`
        );
        assert.ok(
          !/<!-- \/tier:(guided|standard|expert) -->/.test(result),
          `${template} has orphaned closing tier tag after stripping for ${tier}`
        );
      }
    });
  }
});

describe('Template round-trip safety', () => {
  for (const template of ADAPTED_TEMPLATES) {
    for (const tier of VALID_TIERS) {
      it(`${template} stripped for ${tier} produces clean output`, () => {
        const content = fs.readFileSync(
          path.join(ROOT, 'grd', 'templates', template), 'utf-8'
        );
        const result = stripTierContent(content, tier, 'comment');

        // No orphaned tier tags
        assert.ok(
          !/<!-- tier:(guided|standard|expert) -->/.test(result),
          `orphaned opening tier tag in ${template} for ${tier}`
        );
        assert.ok(
          !/<!-- \/tier:(guided|standard|expert) -->/.test(result),
          `orphaned closing tier tag in ${template} for ${tier}`
        );

        // Non-empty output
        assert.ok(
          result.trim().length > 0,
          `${template} stripped for ${tier} should not be empty`
        );

        // Section headers preserved (# or ## or deeper)
        assert.ok(
          /^#{1,6}\s/m.test(result),
          `${template} stripped for ${tier} should preserve section headers`
        );
      });
    }
  }
});

describe('Template content verification', () => {
  it('research-note.md guided tier has Key Findings guidance', () => {
    const content = fs.readFileSync(
      path.join(ROOT, 'grd', 'templates', 'research-note.md'), 'utf-8'
    );
    const result = stripTierContent(content, 'guided', 'comment');
    assert.ok(
      result.includes('single most important thing someone should take away'),
      'guided tier should include Key Findings guidance text'
    );
  });

  it('research-note.md expert tier has no description comments', () => {
    const content = fs.readFileSync(
      path.join(ROOT, 'grd', 'templates', 'research-note.md'), 'utf-8'
    );
    const result = stripTierContent(content, 'expert', 'comment');
    // Expert should have no guidance comments (only structural content)
    // Check that the guided and standard guidance text is absent
    assert.ok(
      !result.includes('single most important thing'),
      'expert tier should not include guided Key Findings guidance'
    );
    assert.ok(
      !result.includes('2-3 sentence summary of what this note concludes'),
      'expert tier should not include standard Key Findings description'
    );
  });

  it('research-note.md standard tier preserves baseline descriptions', () => {
    const content = fs.readFileSync(
      path.join(ROOT, 'grd', 'templates', 'research-note.md'), 'utf-8'
    );
    const result = stripTierContent(content, 'standard', 'comment');
    // Standard tier should preserve the existing description comments
    assert.ok(
      result.includes('2-3 sentence summary of what this note concludes'),
      'standard tier should preserve Key Findings description'
    );
    assert.ok(
      result.includes('Main body of the research note'),
      'standard tier should preserve Analysis description'
    );
    // Standard tier should NOT include guided-only guidance
    assert.ok(
      !result.includes('single most important thing someone should take away'),
      'standard tier should not include guided-only Key Findings guidance'
    );
  });
});
