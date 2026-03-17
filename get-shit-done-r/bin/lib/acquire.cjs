'use strict';

const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const path = require('node:path');
const { generateSourceFilename } = require('./vault.cjs');

/**
 * Detect source type and preferred acquisition methods from a URL.
 *
 * @param {string} url - Source URL to analyze
 * @returns {{ type: string, ext: string, methods: string[] }}
 */
function detectSourceType(url) {
  const u = url.toLowerCase();

  // arXiv PDF
  if (u.includes('arxiv.org/pdf/') || u.includes('arxiv.org/pdf/')) {
    return { type: 'pdf', ext: 'pdf', methods: ['wget', 'web_fetch'] };
  }

  // arXiv HTML
  if (u.includes('arxiv.org/html/')) {
    return { type: 'md', ext: 'md', methods: ['firecrawl', 'web_fetch'] };
  }

  // GitHub issues
  if (/github\.com\/[^/]+\/[^/]+\/issues\/\d+/.test(u)) {
    return { type: 'md', ext: 'md', methods: ['gh-cli', 'web_fetch'] };
  }

  // GitHub repo / README (no /issues/ or /blob/ or /tree/ path)
  if (/github\.com\/[^/]+\/[^/]+\/?$/.test(u) || /github\.com\/[^/]+\/[^/]+\/?(#.*)?$/.test(u)) {
    return { type: 'md', ext: 'md', methods: ['firecrawl', 'web_fetch'] };
  }

  // Direct PDF link (ends with .pdf)
  if (u.endsWith('.pdf') || u.includes('.pdf?')) {
    return { type: 'pdf', ext: 'pdf', methods: ['wget', 'web_fetch'] };
  }

  // Default: treat as web page -> markdown
  return { type: 'md', ext: 'md', methods: ['firecrawl', 'web_fetch', 'wget'] };
}

/**
 * Try to acquire a source file using a specific method.
 *
 * @param {string} method - Acquisition method to try
 * @param {string} url - Source URL
 * @param {string} outputPath - Where to save the file
 * @param {Function} toolRunner - Injected tool runner
 * @param {{ type: string, ext: string }} typeInfo - Source type info
 * @returns {string|Buffer} Content retrieved
 * @throws {Error} If acquisition fails
 */
function tryMethod(method, url, outputPath, toolRunner, typeInfo) {
  switch (method) {
    case 'firecrawl': {
      const content = toolRunner('firecrawl', ['scrape', url, '--format', 'markdown']);
      if (!content || (typeof content === 'string' && content.trim() === '')) {
        throw new Error('firecrawl returned empty content');
      }
      return content;
    }
    case 'web_fetch': {
      const content = toolRunner('web_fetch', [url]);
      if (!content || (typeof content === 'string' && content.trim() === '')) {
        throw new Error('web_fetch returned empty content');
      }
      return content;
    }
    case 'wget': {
      const content = toolRunner('wget', ['-q', '-O', outputPath, url]);
      if (!content || (typeof content === 'string' && content.trim() === '')) {
        throw new Error('wget returned empty content');
      }
      return content;
    }
    case 'curl': {
      const content = toolRunner('curl', ['-sL', '-o', outputPath, url]);
      if (!content || (typeof content === 'string' && content.trim() === '')) {
        throw new Error('curl returned empty content');
      }
      return content;
    }
    case 'gh-cli': {
      // Extract repo and issue number from GitHub issue URL
      const match = url.match(/github\.com\/([^/]+\/[^/]+)\/issues\/(\d+)/);
      if (!match) throw new Error('Cannot parse GitHub issue URL');
      const [, repo, issueNum] = match;
      const content = toolRunner('gh', ['issue', 'view', issueNum, '--repo', repo, '--json', 'body']);
      if (!content || (typeof content === 'string' && content.trim() === '')) {
        throw new Error('gh-cli returned empty content');
      }
      return content;
    }
    default:
      throw new Error(`Unknown method: ${method}`);
  }
}

// Common paywall indicator patterns
const PAYWALL_PATTERNS = [
  /please subscribe/i,
  /login required/i,
  /sign in to (access|view|read)/i,
  /create an account/i,
  /subscribe to (access|read|view)/i,
  /premium content/i,
  /members only/i,
];

/**
 * Check if content appears to be behind a paywall.
 * @param {string} content - Content to check
 * @returns {boolean}
 */
function isPaywalled(content) {
  if (typeof content !== 'string') return false;
  return PAYWALL_PATTERNS.some(pattern => pattern.test(content));
}

/**
 * Acquire a source file with fallback chain.
 *
 * @param {Object} options
 * @param {string} options.url - Source URL
 * @param {string} options.slug - Descriptive slug for filename
 * @param {string} options.sourcesDir - Directory to save file into
 * @param {Function} [options.toolRunner] - Injected tool runner for testing
 * @param {boolean} [options.detectPaywall=false] - Check content for paywall indicators
 * @param {boolean} [options.detectPartial=false] - Check if content is too short (partial)
 * @param {number} [options.minContentLength=100] - Minimum content length for partial detection
 * @param {Function} [options.onUnavailable] - Callback when all methods fail ({url, reason})
 * @returns {Promise<{ filePath?: string, status: string, method?: string, reason?: string }>}
 */
async function acquireSource(options) {
  const {
    url,
    slug,
    sourcesDir,
    toolRunner,
    detectPaywall = false,
    detectPartial = false,
    minContentLength = 100,
    onUnavailable,
  } = options;

  if (!toolRunner) {
    throw new Error('toolRunner is required (use dependency injection for external tools)');
  }

  const typeInfo = detectSourceType(url);
  const filename = generateSourceFilename(slug, typeInfo.ext);
  const outputPath = path.join(sourcesDir, filename);

  const errors = [];

  for (const method of typeInfo.methods) {
    try {
      const content = tryMethod(method, url, outputPath, toolRunner, typeInfo);

      // Check for paywall indicators if enabled
      if (detectPaywall && typeof content === 'string' && isPaywalled(content)) {
        await fsPromises.writeFile(outputPath, content, 'utf8');
        return {
          filePath: outputPath,
          status: 'paywall',
          method,
        };
      }

      // Check for partial content if enabled
      if (detectPartial && typeof content === 'string' && content.length < minContentLength) {
        await fsPromises.writeFile(outputPath, content, 'utf8');
        return {
          filePath: outputPath,
          status: 'partial',
          method,
        };
      }

      // Write content to file
      if (Buffer.isBuffer(content)) {
        await fsPromises.writeFile(outputPath, content);
      } else {
        await fsPromises.writeFile(outputPath, content, 'utf8');
      }

      return {
        filePath: outputPath,
        status: 'acquired',
        method,
      };
    } catch (err) {
      errors.push(`${method} failed: ${err.message}`);
    }
  }

  // All methods failed
  const reason = errors.join('; ');

  // Call onUnavailable callback if provided (for gap reporting integration)
  if (typeof onUnavailable === 'function') {
    onUnavailable({ url, slug, reason });
  }

  return {
    status: 'unavailable',
    reason,
  };
}

/**
 * Append a row to SOURCE-LOG.md.
 *
 * @param {string} sourceLogPath - Path to SOURCE-LOG.md file
 * @param {Object} entry - Log entry
 * @param {string} entry.source - Source name
 * @param {string} entry.url - Source URL
 * @param {string} entry.method - Acquisition method used
 * @param {string} entry.file - Local filename (or '--' if unavailable)
 * @param {string} entry.status - Status: acquired, partial, paywall, unavailable, rate-limited
 * @param {string} entry.notes - Additional notes
 * @returns {Promise<void>}
 */
async function updateSourceLog(sourceLogPath, entry) {
  const { source, url, method, file, status, notes } = entry;
  const row = `| ${source} | ${url} | ${method} | ${file} | ${status} | ${notes} |`;

  let content = await fsPromises.readFile(sourceLogPath, 'utf8');

  // Find the last line that starts with | (table row or separator)
  const lines = content.split('\n');
  let lastTableLineIdx = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('|') && !trimmed.startsWith('<!--')) {
      lastTableLineIdx = i;
      break;
    }
  }

  if (lastTableLineIdx >= 0) {
    // Insert after last table line
    lines.splice(lastTableLineIdx + 1, 0, row);
  } else {
    // Append to end
    lines.push(row);
  }

  await fsPromises.writeFile(sourceLogPath, lines.join('\n'), 'utf8');
}

/**
 * Extract referenced source files and cross-note links from a note's References section.
 *
 * Parses only the ## References section (ignores backticks elsewhere).
 * Backtick-wrapped filenames become file references; [[WikiLinks]] become note references.
 *
 * @param {string} noteContent - Full markdown content of a research note
 * @returns {{ files: string[], notes: string[] }}
 */
function extractReferences(noteContent) {
  const files = [];
  const notes = [];

  // Find the ## References section
  const refMatch = noteContent.match(/^## References\s*$/m);
  if (!refMatch) {
    return { files, notes };
  }

  // Extract text from References section to next ## heading or end of file
  const startIdx = refMatch.index + refMatch[0].length;
  const restContent = noteContent.slice(startIdx);
  const nextHeadingMatch = restContent.match(/^## /m);
  const referencesText = nextHeadingMatch
    ? restContent.slice(0, nextHeadingMatch.index)
    : restContent;

  // Extract backtick-wrapped filenames (source file references)
  const backtickPattern = /`([^`]+\.\w+)`/g;
  let match;
  while ((match = backtickPattern.exec(referencesText)) !== null) {
    files.push(match[1]);
  }

  // Extract wikilink references [[Note-Name]]
  const wikilinkPattern = /\[\[([^\]]+)\]\]/g;
  while ((match = wikilinkPattern.exec(referencesText)) !== null) {
    notes.push(match[1]);
  }

  return { files, notes };
}

/**
 * Validate that every referenced source file exists in the sources directory.
 *
 * Checks for:
 * - Missing files (referenced but not in sourcesDir)
 * - Orphan files (in sourcesDir but not referenced, excluding SOURCE-LOG.md)
 * - Documented gaps (missing files with 'unavailable' status in SOURCE-LOG.md)
 *
 * @param {string} noteContent - Full markdown content of a research note
 * @param {string} sourcesDir - Path to the note's -sources/ directory
 * @param {string} [sourceLogPath] - Optional path to SOURCE-LOG.md (defaults to sourcesDir/SOURCE-LOG.md)
 * @returns {Promise<{ valid: boolean, missing: string[], orphans: string[], referenced: string[], noteRefs: string[] }>}
 */
async function validateReferences(noteContent, sourcesDir, sourceLogPath) {
  const refs = extractReferences(noteContent);
  const referenced = refs.files;
  const noteRefs = refs.notes;

  const missing = [];
  const logPath = sourceLogPath || path.join(sourcesDir, 'SOURCE-LOG.md');

  // Read SOURCE-LOG.md for documented unavailable sources
  let sourceLogContent = '';
  try {
    sourceLogContent = await fsPromises.readFile(logPath, 'utf8');
  } catch (_) {
    // No SOURCE-LOG.md -- that's okay
  }

  // Check each referenced file
  for (const filename of referenced) {
    const filePath = path.join(sourcesDir, filename);
    try {
      await fsPromises.access(filePath);
    } catch (_) {
      // File doesn't exist -- check if it's a documented unavailable source
      if (isDocumentedUnavailable(filename, sourceLogContent)) {
        // Documented gap -- not a real missing file
        continue;
      }
      missing.push(filename);
    }
  }

  // Scan for orphan files (exist in sourcesDir but not referenced)
  const orphans = [];
  try {
    const dirEntries = await fsPromises.readdir(sourcesDir);
    for (const entry of dirEntries) {
      // Skip SOURCE-LOG.md -- never counted as orphan
      if (entry === 'SOURCE-LOG.md') continue;
      if (!referenced.includes(entry)) {
        orphans.push(entry);
      }
    }
  } catch (_) {
    // sourcesDir doesn't exist or can't be read
  }

  const valid = missing.length === 0;
  return { valid, missing, orphans, referenced, noteRefs };
}

/**
 * Check if a filename corresponds to a documented unavailable source in SOURCE-LOG.md.
 *
 * Looks for rows with 'unavailable' status where the URL/source name suggests
 * the same resource as the referenced filename.
 *
 * @param {string} filename - The missing filename to check
 * @param {string} sourceLogContent - Content of SOURCE-LOG.md
 * @returns {boolean}
 */
function isDocumentedUnavailable(filename, sourceLogContent) {
  if (!sourceLogContent) return false;

  // Parse table rows from SOURCE-LOG.md
  const lines = sourceLogContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || trimmed.startsWith('|---') || trimmed.startsWith('| Source')) continue;

    const cells = trimmed.split('|').map(c => c.trim()).filter(c => c);
    // Cells: Source, URL, Method, File, Status, Notes
    if (cells.length >= 5) {
      const status = cells[4].toLowerCase();
      if (status === 'unavailable') {
        // Check if the slug from the filename matches the source name
        // Extract slug portion before the date stamp
        const slugMatch = filename.match(/^(.+?)_\d{4}-\d{2}-\d{2}\.\w+$/);
        const slug = slugMatch ? slugMatch[1].toLowerCase() : filename.toLowerCase();
        const sourceName = cells[0].toLowerCase();

        // Fuzzy match: check if slug words appear in source name or vice versa
        const slugWords = slug.replace(/[-_]/g, ' ').split(/\s+/);
        const sourceWords = sourceName.replace(/[-_]/g, ' ').split(/\s+/);
        const overlap = slugWords.some(w => sourceWords.some(sw => sw.includes(w) || w.includes(sw)));

        if (overlap) return true;
      }
    }
  }
  return false;
}

module.exports = {
  detectSourceType,
  acquireSource,
  updateSourceLog,
  extractReferences,
  validateReferences,
};
