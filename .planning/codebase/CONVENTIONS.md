# Coding Conventions

**Analysis Date:** 2026-03-23

## Module Format

**All runtime library modules use CommonJS:**
- File extension: `.cjs` (enforced — not `.js`)
- All lib modules located in `grd/bin/lib/*.cjs`
- Required via `require('../grd/bin/lib/module.cjs')`

**`'use strict'` usage is inconsistent:**
- Newer modules use it: `vault.cjs`, `acquire.cjs`, `verify-research.cjs`, `verify-sufficiency.cjs`, `tier-strip.cjs`, `bootstrap.cjs`, `plan-checker-rules.cjs`, `security.cjs`
- Older modules do not: `core.cjs`, `state.cjs`, `commands.cjs`, `config.cjs`, `phase.cjs`
- New modules should include `'use strict';` as the first line

## Naming Patterns

**Files:**
- Library modules: `kebab-case.cjs` (e.g., `verify-research.cjs`, `model-profiles.cjs`)
- Test files: `kebab-case.test.cjs` (e.g., `vault.test.cjs`, `state.test.cjs`)
- Entry point: `grd-tools.cjs`

**Functions:**
- Commands: `cmd` prefix + camelCase (e.g., `cmdStateAddNote`, `cmdGenerateSlug`, `cmdStateUpdateProgress`)
- Internal helpers: camelCase without prefix (e.g., `stateExtractField`, `findProjectRoot`, `detectSourceType`)
- State field ops: `state` prefix (e.g., `stateExtractField`, `stateReplaceField`, `stateReplaceFieldWithFallback`)

**Variables:**
- camelCase for local variables and parameters
- UPPER_SNAKE_CASE for module-level constants (e.g., `SMART_DEFAULTS`, `VALID_CONFIG_KEYS`, `REVIEW_TYPE_ORDER`, `PLACEHOLDER_PATTERNS`)

**Types/Constants:**
- Objects used as enums: UPPER_SNAKE_CASE (e.g., `MODEL_PROFILES`, `SMART_DEFAULTS`)
- Sets used for lookups: UPPER_SNAKE_CASE (e.g., `VALID_CONFIG_KEYS`)

## Import Organization

**Order (observed pattern):**
1. Node built-in modules using `node:` prefix where applicable (newer modules: `require('node:fs')`, `require('node:path')`)
2. Node built-ins without prefix (older modules: `require('fs')`, `require('path')`)
3. Internal sibling modules (e.g., `require('./core.cjs')`, `require('./model-profiles.cjs')`)

**No path aliases** — all imports use relative paths.

**Newer modules prefer the `node:` protocol prefix:**
```js
// Preferred in new modules
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

// Older style (still present in core.cjs, state.cjs, etc.)
const fs = require('fs');
const path = require('path');
```

## Exports

**Single `module.exports` object at the bottom of each file:**
```js
module.exports = {
  functionA,
  functionB,
  CONSTANT_NAME,
};
```

No named or default ES module exports — all CommonJS only.

## JSDoc Comments

**All exported functions have JSDoc:**
```js
/**
 * Brief description of what the function does.
 * @param {string} vaultPath - Absolute path to the vault root
 * @param {string} notePath - Relative path for the note within the vault
 * @returns {Promise<string>} Resolved vault path
 * @throws {Error} If vaultPath is not absolute after tilde expansion
 */
async function ensureVaultDir(vaultPath, notePath) { ... }
```

**Internal helpers** may use shorter inline comments or section banners instead of JSDoc.

## Section Comments

**Source files use ASCII-box section banners:**
```js
// --- Section Name ---

// ─── Section Name ───────────────────────────────────────────────────────────
```

**Test files use layered banners for major/minor grouping:**
```js
// ═══════════════════════════════════════════════════════════════════════════
// LAYER 2: CLI ROUTE COVERAGE
// ═══════════════════════════════════════════════════════════════════════════

  // ── 2a: Primary commands respond (not crash) ──────────────────────────
```

## Output / Error Handling

**CLI commands use two shared helpers from `core.cjs`:**

- `output(result, raw, rawValue)` — writes JSON to stdout via `fs.writeSync(1, ...)` (not `process.stdout.write`) to guarantee synchronous delivery before process exit. Large payloads (>50KB) are written to a tmp file and returned as `@file:/path`
- `error(message)` — writes to stderr and calls `process.exit(1)`

**Library functions use `throw new Error(...)`** with descriptive messages:
```js
throw new Error(`vault_path must be absolute, got: ${vaultPath}`);
throw new Error(`Failed to read SOURCE-LOG template at ${templatePath}: ${err.message}`);
```

**Empty `catch {}` blocks** are used for non-critical failures (file cleanup, stat calls) where silent failure is acceptable. Critical failures always throw or call `error()`.

## Async Patterns

**Newer library modules** (`vault.cjs`, `acquire.cjs`) use `async/await` with `node:fs/promises`.

**Older library modules** (`core.cjs`, `state.cjs`, `commands.cjs`) use synchronous `fs` operations (`fs.readFileSync`, `fs.writeFileSync`).

**Injected `toolRunner` / `gitRunner` pattern** for external tool calls — functions accept a runner callback parameter so tests can inject mocks:
```js
async function acquireSource({ url, slug, sourcesDir, toolRunner }) { ... }
async function atomicWrite({ vaultPath, notePath, content, topic, gitRunner }) { ... }
```

## String Interpolation

Template literals used throughout. No string concatenation for multi-part strings.

## Guard Clauses

Functions use early returns/throws for invalid input rather than nested conditionals:
```js
if (!path.isAbsolute(expanded)) {
  throw new Error(`vault_path must be absolute, got: ${vaultPath}`);
}
```

---

*Convention analysis: 2026-03-23*
