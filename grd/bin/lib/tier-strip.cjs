'use strict';

/**
 * tier-strip.cjs - Tier-conditional content stripping utility
 *
 * Strips non-matching tier blocks from content, keeping only the specified
 * tier's content. Supports two formats:
 * - XML mode (<tier-guided>...</tier-guided>) for agent prompts
 * - Comment mode (<!-- tier:guided -->...<!-- /tier:guided -->) for templates
 *
 * Core utility for GRD's adaptive communication system.
 *
 * Usage: const result = stripTierContent(content, 'guided', 'xml');
 */

const VALID_TIERS = ['guided', 'standard', 'expert'];

/**
 * Strip tier-conditional content blocks, keeping only the specified tier.
 *
 * @param {string} content - The content containing tier blocks
 * @param {string} tier - The tier to keep ('guided', 'standard', 'expert')
 * @param {'xml'|'comment'} [format='xml'] - Block format ('xml' for prompts, 'comment' for templates)
 * @returns {string} Content with only the specified tier's blocks retained
 * @throws {Error} If tier is not one of VALID_TIERS
 */
function stripTierContent(content, tier, format = 'xml') {
  if (!VALID_TIERS.includes(tier)) {
    throw new Error(`Invalid tier: ${tier}. Must be one of: ${VALID_TIERS.join(', ')}`);
  }

  let result = content;

  if (format === 'xml') {
    for (const t of VALID_TIERS) {
      if (t === tier) {
        // Keep this tier's content, remove the wrapping tags
        result = result.replace(
          new RegExp(`<tier-${t}>\\n?([\\s\\S]*?)<\\/tier-${t}>\\n?`, 'g'),
          '$1'
        );
      } else {
        // Remove this tier's entire block (content + tags)
        result = result.replace(
          new RegExp(`<tier-${t}>[\\s\\S]*?<\\/tier-${t}>\\n?`, 'g'),
          ''
        );
      }
    }
  } else if (format === 'comment') {
    for (const t of VALID_TIERS) {
      if (t === tier) {
        // Keep content, remove comment markers
        result = result.replace(
          new RegExp(`<!-- tier:${t} -->\\n?([\\s\\S]*?)<!-- \\/tier:${t} -->\\n?`, 'g'),
          '$1'
        );
      } else {
        // Remove entire block
        result = result.replace(
          new RegExp(`<!-- tier:${t} -->[\\s\\S]*?<!-- \\/tier:${t} -->\\n?`, 'g'),
          ''
        );
      }
    }
  }

  // Clean up multiple consecutive blank lines (max 2)
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

module.exports = { stripTierContent, VALID_TIERS };
