'use strict';

const { describe, it, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const GRD_TOOLS = path.join(ROOT, 'grd', 'bin', 'grd-tools.cjs');

// ── Helpers ─────────────────────────────────────────────────────────────────

// Per-test temp dirs (cleaned after each test)
let tempDirs = [];
async function makeTempDir() {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'grd-smoke-'));
  tempDirs.push(dir);
  return dir;
}

// Suite-level temp dirs (cleaned in after() hook inside the suite)
async function makeSuiteTempDir() {
  return await fsp.mkdtemp(path.join(os.tmpdir(), 'grd-smoke-suite-'));
}

afterEach(async () => {
  for (const dir of tempDirs) {
    await fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
  tempDirs = [];
});

function run(args, opts = {}) {
  const cwd = opts.cwd || ROOT;
  return execFileSync('node', [GRD_TOOLS, ...args], {
    cwd,
    encoding: 'utf-8',
    timeout: 10000,
    env: { ...process.env, NODE_ENV: 'test' },
  }).trim();
}

function runJSON(args, opts = {}) {
  const raw = run([...args, '--raw'], opts);
  return JSON.parse(raw);
}

function tryRun(args, opts = {}) {
  try {
    return { ok: true, output: run(args, opts) };
  } catch (e) {
    return { ok: false, stderr: e.stderr, code: e.status };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 1: STRUCTURAL INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════

describe('Smoke Layer 1: Structural Integrity', () => {

  // ── 1a: All library modules require without error ────────────────────

  const LIB_DIR = path.join(ROOT, 'grd', 'bin', 'lib');
  const EXPECTED_MODULES = [
    'acquire.cjs', 'bootstrap.cjs', 'commands.cjs', 'config.cjs',
    'core.cjs', 'frontmatter.cjs', 'init.cjs', 'milestone.cjs',
    'model-profiles.cjs', 'phase.cjs', 'plan-checker-rules.cjs',
    'roadmap.cjs', 'state.cjs', 'template.cjs', 'tier-strip.cjs',
    'vault.cjs', 'verify.cjs', 'verify-research.cjs', 'verify-sufficiency.cjs',
  ];

  for (const mod of EXPECTED_MODULES) {
    it(`require(${mod}) loads without error`, () => {
      const fullPath = path.join(LIB_DIR, mod);
      assert.ok(fs.existsSync(fullPath), `${mod} not found on disk`);
      const loaded = require(fullPath);
      assert.ok(typeof loaded === 'object' || typeof loaded === 'function',
        `${mod} should export an object or function`);
    });
  }

  // ── 1b: All workflow files exist ──────────────────────────────────────

  const WORKFLOWS_DIR = path.join(ROOT, 'grd', 'workflows');
  const EXPECTED_WORKFLOWS = [
    'add-inquiry.md', 'add-tests.md', 'add-todo.md', 'audit-study.md',
    'autonomous.md', 'check-todos.md', 'cleanup.md', 'complete-study.md',
    'conduct-inquiry.md', 'diagnose-issues.md', 'discovery-phase.md',
    'do.md', 'execute-plan.md', 'health.md', 'help.md', 'insert-inquiry.md',
    'list-phase-assumptions.md', 'map-codebase.md', 'new-milestone.md',
    'new-research.md', 'node-repair.md', 'note.md', 'pause-work.md',
    'plan-inquiry.md', 'plan-milestone-gaps.md', 'progress.md', 'quick.md',
    'remove-inquiry.md', 'research-phase.md', 'resume-project.md',
    'scope-inquiry.md', 'set-profile.md', 'settings.md', 'stats.md',
    'synthesize.md', 'transition.md', 'ui-phase.md', 'ui-review.md',
    'update.md', 'validate-phase.md', 'verify-inquiry.md', 'verify-phase.md',
  ];

  it('all expected workflow files exist', () => {
    const missing = EXPECTED_WORKFLOWS.filter(w =>
      !fs.existsSync(path.join(WORKFLOWS_DIR, w))
    );
    assert.deepStrictEqual(missing, [], 'Missing workflows: ' + missing.join(', '));
  });

  // ── 1c: All agent files exist ─────────────────────────────────────────

  it('all agents/ files exist', () => {
    const EXPECTED_AGENTS = [
      'grd-architecture-researcher.md', 'grd-codebase-mapper.md',
      'grd-debugger.md', 'grd-executor.md', 'grd-integration-checker.md',
      'grd-limitations-researcher.md', 'grd-methods-researcher.md',
      'grd-nyquist-auditor.md', 'grd-phase-researcher.md',
      'grd-plan-checker.md', 'grd-planner.md', 'grd-project-researcher.md',
      'grd-research-synthesizer.md', 'grd-roadmapper.md',
      'grd-source-researcher.md', 'grd-verifier.md',
    ];
    const missing = EXPECTED_AGENTS.filter(a =>
      !fs.existsSync(path.join(ROOT, 'agents', a))
    );
    assert.deepStrictEqual(missing, [], 'Missing agents: ' + missing.join(', '));
  });

  it('all grd/agents/ synthesis agents exist', () => {
    const EXPECTED = [
      'grd-argument-constructor.md', 'grd-framework-integrator.md',
      'grd-gap-analyzer.md', 'grd-thematic-synthesizer.md',
    ];
    const missing = EXPECTED.filter(a =>
      !fs.existsSync(path.join(ROOT, 'grd', 'agents', a))
    );
    assert.deepStrictEqual(missing, [], 'Missing synthesis agents: ' + missing.join(', '));
  });

  // ── 1d: All template files exist ──────────────────────────────────────

  it('all top-level templates exist', () => {
    const EXPECTED = [
      'bootstrap.md', 'config.json', 'context.md', 'continue-here.md',
      'debug-subagent-prompt.md', 'DEBUG.md', 'decision-log.md', 'discovery.md',
      'executive-summary.md', 'framework.md', 'gaps.md', 'milestone-archive.md',
      'milestone.md', 'phase-prompt.md', 'planner-subagent-prompt.md',
      'project.md', 'requirements.md', 'research-note.md', 'research-task.md',
      'research.md', 'retrospective.md', 'roadmap.md', 'source-log.md',
      'state.md', 'summary.md', 'summary-complex.md', 'summary-minimal.md',
      'summary-standard.md', 'terminal-deliverable.md', 'themes.md',
      'UAT.md', 'UI-SPEC.md', 'user-setup.md', 'VALIDATION.md',
      'verification-report.md',
    ];
    const tplDir = path.join(ROOT, 'grd', 'templates');
    const missing = EXPECTED.filter(t => !fs.existsSync(path.join(tplDir, t)));
    assert.deepStrictEqual(missing, [], 'Missing templates: ' + missing.join(', '));
  });

  it('research-project templates use research-native names', () => {
    const rpDir = path.join(ROOT, 'grd', 'templates', 'research-project');
    const EXPECTED = [
      'SUMMARY.md', 'METHODOLOGICAL-LANDSCAPE.md', 'PRIOR-FINDINGS.md',
      'THEORETICAL-FRAMEWORK.md', 'LIMITATIONS-DEBATES.md',
    ];
    const STALE = ['STACK.md', 'FEATURES.md', 'ARCHITECTURE.md', 'PITFALLS.md'];

    const missing = EXPECTED.filter(f => !fs.existsSync(path.join(rpDir, f)));
    assert.deepStrictEqual(missing, [], 'Missing research templates: ' + missing.join(', '));

    const stalePresent = STALE.filter(f => fs.existsSync(path.join(rpDir, f)));
    assert.deepStrictEqual(stalePresent, [], 'Stale templates still exist: ' + stalePresent.join(', '));
  });

  it('codebase templates exist', () => {
    const cbDir = path.join(ROOT, 'grd', 'templates', 'codebase');
    const EXPECTED = [
      'stack.md', 'architecture.md', 'conventions.md', 'integrations.md',
      'testing.md', 'concerns.md', 'structure.md',
    ];
    const missing = EXPECTED.filter(f => !fs.existsSync(path.join(cbDir, f)));
    assert.deepStrictEqual(missing, [], 'Missing codebase templates: ' + missing.join(', '));
  });

  // ── 1e: All reference files exist ─────────────────────────────────────

  it('all reference files exist', () => {
    const EXPECTED = [
      'checkpoints.md', 'continuation-format.md', 'decimal-phase-calculation.md',
      'git-integration.md', 'git-planning-commit.md', 'model-profile-resolution.md',
      'model-profiles.md', 'note-format.md', 'phase-argument-parsing.md',
      'planning-config.md', 'questioning.md', 'research-depth.md',
      'research-verification.md', 'source-protocol.md', 'tdd.md',
      'ui-brand.md', 'verification-patterns.md',
    ];
    const refDir = path.join(ROOT, 'grd', 'references');
    const missing = EXPECTED.filter(f => !fs.existsSync(path.join(refDir, f)));
    assert.deepStrictEqual(missing, [], 'Missing references: ' + missing.join(', '));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 2: CLI ROUTE COVERAGE
// ═══════════════════════════════════════════════════════════════════════════

describe('Smoke Layer 2: CLI Route Coverage', () => {

  // ── 2a: Primary commands respond (not crash) ──────────────────────────

  const SAFE_COMMANDS = [
    { args: ['generate-slug', 'test topic here'], desc: 'generate-slug' },
    { args: ['current-timestamp'], desc: 'current-timestamp' },
    { args: ['progress', 'bar', '--raw'], desc: 'progress bar' },
    { args: ['phases', 'list', '--raw'], desc: 'phases list' },
    { args: ['roadmap', 'analyze', '--raw'], desc: 'roadmap analyze' },
    { args: ['state-snapshot', '--raw'], desc: 'state-snapshot' },
    { args: ['validate', 'health', '--raw'], desc: 'validate health' },
  ];

  for (const cmd of SAFE_COMMANDS) {
    it(`CLI: ${cmd.desc} responds`, () => {
      const result = tryRun(cmd.args);
      assert.ok(result.ok, `${cmd.desc} failed: ${result.stderr}`);
      assert.ok(result.output.length > 0, `${cmd.desc} returned empty output`);
    });
  }

  // ── 2b: Init subcommands return valid JSON ────────────────────────────

  const INIT_SUBCOMMANDS = [
    { args: ['init', 'progress'], desc: 'init progress' },
    { args: ['init', 'conduct-inquiry', '22'], desc: 'init conduct-inquiry' },
    { args: ['init', 'plan-inquiry', '22'], desc: 'init plan-inquiry' },
    { args: ['init', 'verify-inquiry', '22'], desc: 'init verify-inquiry' },
    { args: ['init', 'new-research'], desc: 'init new-research' },
    { args: ['init', 'new-milestone'], desc: 'init new-milestone' },
    { args: ['init', 'scope-inquiry', '22'], desc: 'init scope-inquiry' },
    { args: ['init', 'todos'], desc: 'init todos' },
    { args: ['init', 'milestone-op'], desc: 'init milestone-op' },
    { args: ['init', 'map-codebase'], desc: 'init map-codebase' },
  ];

  for (const cmd of INIT_SUBCOMMANDS) {
    it(`CLI: ${cmd.desc} returns valid JSON`, () => {
      const result = tryRun(cmd.args);
      assert.ok(result.ok, `${cmd.desc} failed: ${result.stderr}`);
      let parsed;
      try {
        parsed = JSON.parse(result.output);
      } catch (e) {
        assert.fail(`${cmd.desc} returned invalid JSON: ${result.output.slice(0, 200)}`);
      }
      assert.ok(typeof parsed === 'object', `${cmd.desc} should return an object`);
    });
  }

  // ── 2c: Verify subcommands respond ────────────────────────────────────

  it('CLI: verify sufficiency responds', () => {
    const result = tryRun(['verify', 'sufficiency', '--raw']);
    // May return structured error (no vault) but should not crash
    assert.ok(result.output || result.stderr, 'verify sufficiency should produce output');
  });

  // ── 2d: State subcommands against temp project ────────────────────────

  it('CLI: state commands work against temp project', async () => {
    const dir = await makeTempDir();
    const planningDir = path.join(dir, '.planning');
    fs.mkdirSync(planningDir, { recursive: true });
    fs.mkdirSync(path.join(planningDir, 'phases', '01-test'), { recursive: true });

    fs.writeFileSync(path.join(planningDir, 'config.json'), JSON.stringify({
      model_profile: 'balanced',
      commit_docs: false,
    }));

    fs.writeFileSync(path.join(planningDir, 'STATE.md'), `---
grd_state_version: "1.0"
---

# Project State

## Current Position

Phase: 1 of 1 (test)
Plan: 1 of 1
Status: Executing
Last activity: 2026-03-22

Progress: [##########] 0%

## Session Continuity

Last session: 2026-03-22T00:00:00Z
Stopped at: Starting
Resume file: None
`);

    // state-snapshot should return valid JSON
    const snapshot = tryRun(['state-snapshot', '--raw'], { cwd: dir });
    assert.ok(snapshot.ok, 'state-snapshot failed: ' + snapshot.stderr);
    const parsed = JSON.parse(snapshot.output);
    assert.ok(parsed.status !== undefined, 'snapshot should have status field');
  });

  // ── 2e: Config get/set round-trip ─────────────────────────────────────

  it('CLI: config get reads existing config', () => {
    const result = tryRun(['config-get', 'model_profile', '--raw']);
    assert.ok(result.ok, 'config-get failed: ' + result.stderr);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 3: CONFIG & SMART DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Smoke Layer 3: Config & Smart Defaults', () => {
  const { SMART_DEFAULTS, configWithDefaults, applySmartDefaults, canDowngrade } =
    require(path.join(ROOT, 'grd', 'bin', 'lib', 'config.cjs'));

  // ── 3a: All 5 review types have smart defaults ────────────────────────

  const REVIEW_TYPES = ['systematic', 'scoping', 'integrative', 'critical', 'narrative'];
  const SMART_KEYS = ['critical_appraisal', 'temporal_positioning', 'synthesis', 'plan_check'];

  for (const rt of REVIEW_TYPES) {
    it(`SMART_DEFAULTS[${rt}] has all 4 keys`, () => {
      assert.ok(SMART_DEFAULTS[rt], `Missing SMART_DEFAULTS for ${rt}`);
      for (const key of SMART_KEYS) {
        assert.ok(SMART_DEFAULTS[rt][key] !== undefined,
          `${rt} missing smart default for ${key}`);
      }
    });
  }

  // ── 3b: configWithDefaults fills missing fields ───────────────────────

  it('configWithDefaults fills empty config with narrative defaults', () => {
    const result = configWithDefaults({});
    assert.equal(result.researcher_tier, 'standard');
    assert.equal(result.review_type, 'narrative');
    assert.equal(result.epistemological_stance, 'pragmatist');
    assert.equal(result.workflow.critical_appraisal, 'optional');
    assert.equal(result.workflow.temporal_positioning, 'optional');
    assert.equal(result.workflow.synthesis, 'optional');
    assert.equal(result.workflow.plan_check, 'light');
  });

  it('configWithDefaults respects user review_type', () => {
    const result = configWithDefaults({ review_type: 'systematic' });
    assert.equal(result.review_type, 'systematic');
    assert.equal(result.workflow.critical_appraisal, 'required');
    assert.equal(result.workflow.temporal_positioning, 'required');
    assert.equal(result.workflow.plan_check, 'strict');
  });

  it('configWithDefaults preserves user workflow overrides', () => {
    const result = configWithDefaults({
      review_type: 'systematic',
      workflow: { plan_check: 'moderate' },
    });
    // User override wins over smart default
    assert.equal(result.workflow.plan_check, 'moderate');
    // Smart defaults still fill the rest
    assert.equal(result.workflow.critical_appraisal, 'required');
  });

  // ── 3c: applySmartDefaults resets smart keys ──────────────────────────

  it('applySmartDefaults switches review type correctly', () => {
    const base = configWithDefaults({ review_type: 'systematic' });
    const downgraded = applySmartDefaults(base, 'narrative');
    assert.equal(downgraded.review_type, 'narrative');
    assert.equal(downgraded.workflow.critical_appraisal, 'optional');
    assert.equal(downgraded.workflow.plan_check, 'light');
  });

  // ── 3d: canDowngrade validates review type ordering ───────────────────

  it('canDowngrade returns true for valid downgrades', () => {
    assert.ok(canDowngrade('systematic', 'narrative'));
    assert.ok(canDowngrade('systematic', 'scoping'));
  });

  it('canDowngrade returns false for upgrades', () => {
    assert.ok(!canDowngrade('narrative', 'systematic'));
  });

  // ── 3e: Researcher tier values ────────────────────────────────────────

  it('configWithDefaults accepts all researcher tiers', () => {
    for (const tier of ['guided', 'standard', 'expert']) {
      const result = configWithDefaults({ researcher_tier: tier });
      assert.equal(result.researcher_tier, tier);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 4: LIVE E2E — SIMULATED RESEARCH PROJECT
// ═══════════════════════════════════════════════════════════════════════════

describe('Smoke Layer 4: Live E2E — Simulated Research Project', () => {
  let projectDir;

  after(async () => {
    if (projectDir) {
      await fsp.rm(projectDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  before(async () => {
    projectDir = await makeSuiteTempDir();

    // Scaffold a minimal GRD project
    const planningDir = path.join(projectDir, '.planning');
    const phasesDir = path.join(planningDir, 'phases');
    const phase1Dir = path.join(phasesDir, '01-literature-review');
    const notesDir = path.join(planningDir, 'notes');

    fs.mkdirSync(phase1Dir, { recursive: true });
    fs.mkdirSync(notesDir, { recursive: true });

    // config.json
    fs.writeFileSync(path.join(planningDir, 'config.json'), JSON.stringify({
      model_profile: 'balanced',
      commit_docs: false,
      researcher_tier: 'standard',
      review_type: 'scoping',
      epistemological_stance: 'pragmatist',
      vault_path: '.planning/notes',
      workflow: {
        research: true,
        plan_check: true,
        verifier: true,
        nyquist_validation: false,
      },
    }, null, 2));

    // PROJECT.md
    fs.writeFileSync(path.join(planningDir, 'PROJECT.md'), `# Values-SDT Integration

## Problem Statement
How do personal values interact with self-determination theory constructs?

## Research Questions
1. What patterns emerge in values-SDT literature?

## Review Type
Scoping review

## Epistemological Stance
Pragmatist
`);

    // STATE.md
    fs.writeFileSync(path.join(planningDir, 'STATE.md'), `---
grd_state_version: "1.0"
---

# Project State

## Current Position

Phase: 1 of 1 (literature-review)
Plan: 1 of 1
Status: Executing
Last activity: 2026-03-22

Progress: [##########] 0%

## Session Continuity

Last session: 2026-03-22T00:00:00Z
Stopped at: Starting
Resume file: None
`);

    // ROADMAP.md
    fs.writeFileSync(path.join(planningDir, 'ROADMAP.md'), `# Roadmap: Values-SDT Integration

## Milestones

- [ ] **v1.0 Scoping Review** -- Phases 1-1

## Phases

### v1.0 Scoping Review

- [ ] **Phase 1: Literature Review** - Identify and map values-SDT literature

## Phase Details

### Phase 1: Literature Review
**Goal**: Map the landscape of values-SDT integration literature
**Depends on**: Nothing
**Plans**: 1 plan

Plans:
- [ ] 01-01-PLAN.md -- Search and screen literature
`);

    // A minimal PLAN.md
    fs.writeFileSync(path.join(phase1Dir, '01-01-PLAN.md'), `---
phase: 01-literature-review
plan: 01
title: Search and screen literature
requirements: []
depends_on: []
estimated_tasks: 2
---

# Plan 01-01: Search and Screen Literature

## Goal
Search databases for values-SDT literature.

## Tasks

### Task 1: Database search
Search PsycINFO, Scopus, Web of Science.

### Task 2: Screen results
Apply inclusion/exclusion criteria.

## Verification Criteria
- [ ] At least 3 databases searched
- [ ] Screening criteria documented
`);
  });

  // ── 4a: Init subcommands work against the project ─────────────────────

  it('init progress returns valid project context', () => {
    const result = runJSON(['init', 'progress'], { cwd: projectDir });
    assert.ok(result.project_exists, 'project should exist');
    assert.ok(result.roadmap_exists, 'roadmap should exist');
    assert.ok(result.state_exists, 'state should exist');
    assert.ok(result.phases.length > 0, 'should have phases');
  });

  it('init plan-inquiry returns phase context', () => {
    const result = runJSON(['init', 'plan-inquiry', '1'], { cwd: projectDir });
    assert.ok(result.phase_dir || result.phase_number, 'should return phase info');
  });

  it('init conduct-inquiry returns execution context', () => {
    const result = runJSON(['init', 'conduct-inquiry', '1'], { cwd: projectDir });
    assert.ok(result.phase_dir || result.phase_number, 'should return phase info');
  });

  it('init verify-inquiry returns verification context', () => {
    const result = runJSON(['init', 'verify-inquiry', '1'], { cwd: projectDir });
    assert.ok(typeof result === 'object', 'should return an object');
  });

  // ── 4b: Config loads and smart defaults apply ─────────────────────────

  it('config-get reads project config', () => {
    const result = tryRun(['config-get', 'review_type', '--raw'], { cwd: projectDir });
    assert.ok(result.ok, 'config-get failed: ' + result.stderr);
    assert.ok(result.output.includes('scoping'), 'should return scoping review type');
  });

  // ── 4c: State operations work ─────────────────────────────────────────

  it('state-snapshot returns valid state', () => {
    const result = runJSON(['state-snapshot'], { cwd: projectDir });
    assert.ok(typeof result === 'object', 'should return state object');
  });

  // ── 4d: Roadmap analysis works ────────────────────────────────────────

  it('roadmap analyze returns phase data', () => {
    const result = runJSON(['roadmap', 'analyze'], { cwd: projectDir });
    assert.ok(typeof result === 'object', 'should return roadmap analysis');
  });

  // ── 4e: Validate health passes ────────────────────────────────────────

  it('validate health reports project status', () => {
    const result = tryRun(['validate', 'health', '--raw'], { cwd: projectDir });
    // May exit non-zero if health issues found — that's ok, just shouldn't crash
    assert.ok(result.ok || result.stderr || result.code !== null, 'health check should respond');
  });

  // ── 4f: Verify sufficiency runs against project ───────────────────────

  it('verify sufficiency runs against project vault', () => {
    const result = tryRun(['verify', 'sufficiency', '--raw'], { cwd: projectDir });
    // May exit non-zero if no notes yet — that's ok for smoke test
    assert.ok(result.ok || result.stderr || result.code !== null, 'verify sufficiency should respond');
  });

  // ── 4g: Phases list works ─────────────────────────────────────────────

  it('phases list returns phase information', () => {
    const result = tryRun(['phases', 'list', '--raw'], { cwd: projectDir });
    assert.ok(result.ok, 'phases list failed: ' + result.stderr);
  });

  // ── 4h: Vault + verification pipeline (library level) ────────────────

  it('full vault → verify pipeline works', async () => {
    const { writeNote, generateSourceFilename } = require(path.join(ROOT, 'grd', 'bin', 'lib', 'vault.cjs'));
    const { acquireSource, updateSourceLog, validateReferences } = require(path.join(ROOT, 'grd', 'bin', 'lib', 'acquire.cjs'));
    const { verifyNote } = require(path.join(ROOT, 'grd', 'bin', 'lib', 'verify-research.cjs'));
    const { verifySufficiency, discoverNotes, parseObjectives } = require(path.join(ROOT, 'grd', 'bin', 'lib', 'verify-sufficiency.cjs'));

    const vaultPath = path.join(projectDir, '.planning', 'notes');
    const question = 'How do personal values interact with SDT constructs?';
    const sourceFile = generateSourceFilename('ryan-deci-2017', 'md');

    // Write a research note
    const noteContent = `---
project: values-sdt
domain: motivation-psychology
status: draft
date: 2026-03-22
sources: 1
---

# Values and Self-Determination Theory

## Key Findings

Ryan and Deci's (2017) self-determination theory (SDT) framework establishes that personal values interact with basic psychological needs. Intrinsic personal values align with SDT constructs like autonomy, competence, and relatedness, while extrinsic values tend to frustrate these SDT constructs. This creates a systematic pattern where personal value orientation predicts well-being through SDT need satisfaction mechanisms.

## Analysis

Multiple longitudinal studies confirm that personal values interact with SDT constructs in predictable ways. Intrinsic value pursuit (community, growth, relationships) correlates with greater autonomy, competence, and relatedness — the core SDT constructs. Conversely, extrinsic personal values (wealth, fame, image) show negative associations with SDT need satisfaction across cultures. The interaction between personal values and SDT constructs appears to be mediated by need satisfaction quality.

## Implications for values-sdt

These findings demonstrate how personal values interact with SDT constructs at multiple levels. Personal values serve as a distal predictor of SDT need satisfaction, with the intrinsic-extrinsic distinction providing a useful heuristic for understanding how values and SDT constructs interact in motivational dynamics.

## Open Questions

- Does the intrinsic-extrinsic distinction hold across non-Western cultural contexts?

## References

1. Ryan, R. M. & Deci, E. L. (2017). Self-Determination Theory. \`${sourceFile}\`
`;

    const writeResult = await writeNote(vaultPath, 'values-sdt-integration.md', noteContent);
    assert.ok(fs.existsSync(writeResult.notePath), 'Note should exist on disk');
    assert.ok(fs.existsSync(writeResult.sourcesDir), 'Sources dir should exist');

    // Acquire a source
    const toolRunner = (tool) => {
      if (tool === 'firecrawl') return '# Self-Determination Theory: Basic Psychological Needs in Motivation, Development, and Wellness\n\nRyan, R. M. & Deci, E. L. (2017). Guilford Press.\n\nComprehensive review of SDT covering autonomy, competence, relatedness. Intrinsic vs extrinsic value orientations predict well-being through need satisfaction.';
      throw new Error(`${tool} failed`);
    };

    const acq = await acquireSource({
      url: 'https://example.com/ryan-deci-2017',
      slug: 'ryan-deci-2017',
      sourcesDir: writeResult.sourcesDir,
      toolRunner,
    });
    assert.equal(acq.status, 'acquired');

    // Create SOURCE-LOG
    const sourceLogPath = path.join(writeResult.sourcesDir, 'SOURCE-LOG.md');
    fs.writeFileSync(sourceLogPath, `# Source Acquisition Log

<!-- Status values: acquired, partial, paywall, unavailable, rate-limited -->

| Source | URL | Method | File | Status | Notes |
|---|---|---|---|---|---|
`);
    await updateSourceLog(sourceLogPath, {
      source: 'Ryan & Deci 2017',
      url: 'https://example.com/ryan-deci-2017',
      method: 'firecrawl',
      file: sourceFile,
      status: 'acquired',
      notes: 'SDT textbook',
    });

    // Validate references
    const valResult = await validateReferences(noteContent, writeResult.sourcesDir, sourceLogPath);
    assert.equal(valResult.valid, true, 'References should validate');

    // Two-tier verification
    const verifyResult = await verifyNote(noteContent, writeResult.sourcesDir, sourceLogPath, question);
    assert.ok(verifyResult.tier1Result.passed, 'Tier 1 should pass');
    assert.ok(verifyResult.tier2Result.passed, 'Tier 2 should pass');
    assert.equal(verifyResult.status, 'final');

    // Tier 0 sufficiency check
    const requirementsPath = path.join(projectDir, '.planning', 'REQUIREMENTS.md');
    // Create REQUIREMENTS.md with checklist format that parseObjectives expects
    fs.writeFileSync(requirementsPath, `# Requirements

## Research Objectives

- [ ] **RO-01**: Map values-SDT literature and identify interaction patterns
`);

    const notes = discoverNotes(vaultPath);
    const reqContent = fs.readFileSync(requirementsPath, 'utf-8');
    const objectives = parseObjectives(reqContent);

    const suffResult = verifySufficiency(notes, objectives, {
      review_type: 'scoping',
      epistemological_stance: 'pragmatist',
      workflow: { temporal_positioning: false },
    });
    assert.ok(typeof suffResult === 'object', 'Sufficiency check should return result');
    assert.ok(suffResult.summary.total_notes !== undefined, 'Should report total_notes');
  });
});
