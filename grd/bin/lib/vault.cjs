'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

/**
 * Expand tilde (~/) prefix to the user's home directory.
 * Returns path unchanged if it doesn't start with ~/.
 * @param {string} p - Path that may start with ~/
 * @returns {string} Expanded path
 */
function expandTilde(p) {
  if (p.startsWith('~/')) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
}

/**
 * Validate vault path is absolute and create directory tree.
 * @param {string} vaultPath - Absolute path to the vault root
 * @param {string} notePath - Relative path for the note within the vault
 * @returns {Promise<string>} Resolved vault path
 * @throws {Error} If vaultPath is not absolute after tilde expansion
 */
async function ensureVaultDir(vaultPath, notePath) {
  const expanded = expandTilde(vaultPath);
  if (!path.isAbsolute(expanded)) {
    throw new Error(`vault_path must be absolute, got: ${vaultPath}`);
  }
  const noteDir = path.dirname(path.join(expanded, notePath));
  await fs.mkdir(noteDir, { recursive: true });
  return expanded;
}

/**
 * Write a research note and create its -sources/ sibling directory.
 * @param {string} vaultPath - Absolute path to the vault root
 * @param {string} notePath - Relative path for the note (e.g. "topic/note.md")
 * @param {string} content - Note content to write
 * @returns {Promise<{notePath: string, sourcesDir: string}>} Paths created
 */
async function writeNote(vaultPath, notePath, content) {
  const resolved = await ensureVaultDir(vaultPath, notePath);
  const fullNotePath = path.join(resolved, notePath);

  // Write the note file
  await fs.writeFile(fullNotePath, content, 'utf8');

  // Create the -sources/ sibling directory
  // e.g. "test-note.md" -> "test-note-sources/"
  const ext = path.extname(fullNotePath);
  const base = fullNotePath.slice(0, fullNotePath.length - ext.length);
  const sourcesDir = base + '-sources';
  await fs.mkdir(sourcesDir, { recursive: true });

  return { notePath: fullNotePath, sourcesDir };
}

/**
 * Generate a filename for a source file with enforced naming convention.
 * Format: {sanitized-slug}_{YYYY-MM-DD}.{ext}
 * @param {string} slug - Descriptive slug (will be sanitized)
 * @param {string} ext - File extension (without dot)
 * @returns {string} Generated filename
 */
function generateSourceFilename(slug, ext) {
  // Sanitize: lowercase, replace non-alphanumeric (except hyphens) with hyphens
  const sanitized = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(0, 10);

  return `${sanitized}_${today}.${ext}`;
}

/**
 * Default git runner using execFileSync for safe (no shell) git operations.
 * @param {string[]} args - Git command arguments (e.g. ['add', 'file.md'])
 * @param {{ cwd?: string }} opts - Options including working directory
 * @returns {Buffer} Command output
 */
function defaultGitRunner(args, opts) {
  return execFileSync('git', args, { cwd: opts.cwd, stdio: 'pipe' });
}

/**
 * Default path to the SOURCE-LOG.md template.
 * Resolved relative to this file: ../../templates/source-log.md
 */
const DEFAULT_TEMPLATE_PATH = path.join(__dirname, '..', '..', 'templates', 'source-log.md');

/**
 * Atomic vault write: creates note, sources dir, SOURCE-LOG.md, and git commit
 * as a single atomic operation. If any step fails, all created artifacts are
 * rolled back (deleted).
 *
 * @param {Object} opts
 * @param {string} opts.vaultPath - Absolute path to the vault root
 * @param {string} opts.notePath - Relative path for the note (e.g. "topic/note.md")
 * @param {string} opts.content - Note content to write
 * @param {string} opts.topic - Research topic (used in commit message)
 * @param {Function} [opts.gitRunner] - Injected git runner for testing (default: execFileSync)
 * @param {string} [opts.templatePath] - Path to SOURCE-LOG.md template (default: built-in)
 * @returns {Promise<{notePath: string, sourcesDir: string, sourceLogPath: string, commitHash: string}>}
 */
async function atomicWrite(opts) {
  const {
    vaultPath,
    notePath,
    content,
    topic,
    gitRunner = defaultGitRunner,
    templatePath = DEFAULT_TEMPLATE_PATH,
  } = opts;

  // Track created artifacts for rollback (in creation order)
  const artifacts = [];

  try {
    // Step 1: Write note file + create sources dir (via writeNote)
    const writeResult = await writeNote(vaultPath, notePath, content);
    artifacts.push({ type: 'file', path: writeResult.notePath });
    artifacts.push({ type: 'dir', path: writeResult.sourcesDir });

    // Step 2: Read SOURCE-LOG.md template and write into sources dir
    let templateContent;
    try {
      templateContent = await fs.readFile(templatePath, 'utf8');
    } catch (err) {
      throw new Error(`Failed to read SOURCE-LOG template at ${templatePath}: ${err.message}`);
    }

    const sourceLogPath = path.join(writeResult.sourcesDir, 'SOURCE-LOG.md');
    await fs.writeFile(sourceLogPath, templateContent, 'utf8');
    artifacts.push({ type: 'file', path: sourceLogPath });

    // Step 3: Git add + commit
    const filesToAdd = [
      writeResult.notePath,
      sourceLogPath,
    ];

    const cwd = expandTilde(vaultPath);

    gitRunner(['add', ...filesToAdd], { cwd });

    // Build commit message: research(topic): add slug
    const slug = path.basename(notePath, path.extname(notePath));
    const commitMessage = `research(${topic}): add ${slug}`;

    const commitOutput = gitRunner(['commit', '-m', commitMessage], { cwd });

    // Extract commit hash from output (e.g. "[main abc1234] ...")
    const hashMatch = commitOutput.toString().match(/\[[\w\s]+\s+([a-f0-9]+)\]/);
    const commitHash = hashMatch ? hashMatch[1] : 'unknown';

    return {
      notePath: writeResult.notePath,
      sourcesDir: writeResult.sourcesDir,
      sourceLogPath,
      commitHash,
    };
  } catch (err) {
    // Rollback: delete artifacts in reverse order
    for (let i = artifacts.length - 1; i >= 0; i--) {
      const artifact = artifacts[i];
      try {
        if (artifact.type === 'dir') {
          await fs.rm(artifact.path, { recursive: true, force: true });
        } else {
          await fs.unlink(artifact.path);
        }
      } catch {
        // Best-effort cleanup; ignore errors during rollback
      }
    }
    throw err;
  }
}

module.exports = {
  writeNote,
  ensureVaultDir,
  generateSourceFilename,
  expandTilde,
  atomicWrite,
};
