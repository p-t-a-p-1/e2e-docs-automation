import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, test } from 'node:test';
import { scenarios } from '@living/scenarios';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
const generator = path.join(repoRoot, 'packages/docgen/src/generate.mjs');
const fixtureRunId = '01a1e2f4-ed1b-77af-b4c1-e4ece433675d';
const scratchRoot = process.env.TMPDIR || path.join(repoRoot, '.generated', 'docgen-test-temp');
const temporaryRoots = [];

async function createFixture(report) {
  await fs.mkdir(scratchRoot, { recursive: true });
  const root = await fs.mkdtemp(path.join(scratchRoot, 'docgen-contract-'));
  temporaryRoots.push(root);
  const reportPath = path.join(root, 'report.json');
  const outputPath = path.join(root, 'candidate');
  await fs.mkdir(path.join(root, 'results'), { recursive: true });
  for (const result of report.run.results ?? []) {
    for (const artifact of result.attempts?.at(-1)?.artifacts ?? []) {
      if (
        !artifact.path ||
        path.isAbsolute(artifact.path) ||
        artifact.path.split('/').includes('..')
      )
        continue;
      const artifactPath = path.resolve(root, 'results', artifact.path);
      await fs.mkdir(path.dirname(artifactPath), { recursive: true });
      await fs.writeFile(artifactPath, Buffer.from('89504e470d0a1a0a', 'hex'));
    }
  }
  await fs.writeFile(reportPath, JSON.stringify(report));
  return { root, reportPath, outputPath };
}

function passingReport() {
  return {
    schemaVersion: 'report-1',
    run: {
      id: fixtureRunId,
      status: 'passed',
      exitCode: 0,
      startedAt: '2026-01-01T00:00:00.000Z',
      summary: {
        selected: scenarios.length,
        passed: scenarios.length,
        failed: 0,
        skipped: 0,
        interrupted: 0,
      },
      results: scenarios.map((scenario) => ({
        kind: 'test',
        selected: true,
        titlePath: ['TaskFlow', `[${scenario.id}] ${scenario.title}`],
        status: 'passed',
        attempts: [
          {
            durationMs: 1,
            artifacts: [
              {
                kind: 'screenshot',
                mediaType: 'image/png',
                redaction: 'complete',
                path: `${scenario.id}/final.png`,
              },
            ],
            steps: [{ kind: 'assertion', status: 'passed', label: 'visible result' }],
          },
        ],
      })),
    },
  };
}

function runGenerator(reportPath, outputPath) {
  return spawnSync(process.execPath, [generator, reportPath, outputPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

void test('generates manuals and quality evidence only for a complete passing report', async () => {
  const fixture = await createFixture(passingReport());
  const result = runGenerator(fixture.reportPath, fixture.outputPath);

  assert.equal(result.status, 0, result.stderr);
  const manuals = await fs.readdir(path.join(fixture.outputPath, 'manuals'));
  assert.equal(manuals.length, scenarios.length);
  assert.equal(
    await fs
      .readFile(path.join(fixture.outputPath, 'normalized-run.json'), 'utf8')
      .then(JSON.parse)
      .then((run) => run.scenarioIds.length),
    scenarios.length,
  );
  assert.equal(
    await fs.stat(path.join(fixture.outputPath, 'report.html')).then((stat) => stat.isFile()),
    true,
  );
  const evidenceDirectory = path.join(fixture.outputPath, 'public/evidence', fixtureRunId);
  const evidenceFiles = await fs.readdir(evidenceDirectory);
  assert.equal(evidenceFiles.length, scenarios.length);
  for (const scenario of scenarios) {
    const manual = await fs.readFile(
      path.join(fixture.outputPath, 'manuals', `${scenario.slug}.mdx`),
      'utf8',
    );
    assert.ok(
      manual.includes(`/evidence/${fixtureRunId}/${scenario.slug}.png`),
      `${scenario.slug} links to its own evidence image`,
    );
  }
});

void test('rejects a run that marks a required scenario as skipped', async () => {
  const report = passingReport();
  report.run.summary.passed = scenarios.length - 1;
  report.run.summary.skipped = 1;
  report.run.results[0].status = 'skipped';
  report.run.results[0].attempts = [];
  const fixture = await createFixture(report);

  const result = runGenerator(fixture.reportPath, fixture.outputPath);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /6件すべての必須テストが成功していません/);
  await assert.rejects(fs.access(fixture.outputPath));
});

void test('preserves the prior candidate when a required E2E test failed', async () => {
  const report = passingReport();
  report.run.status = 'error';
  report.run.exitCode = 2;
  report.run.summary.failed = scenarios.length;
  report.run.summary.passed = 0;
  report.run.results = [];
  const fixture = await createFixture(report);
  await fs.mkdir(fixture.outputPath, { recursive: true });
  await fs.writeFile(path.join(fixture.outputPath, 'keep.txt'), 'previous candidate');

  const result = runGenerator(fixture.reportPath, fixture.outputPath);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /E2E run が成功していません/);
  assert.equal(
    await fs.readFile(path.join(fixture.outputPath, 'keep.txt'), 'utf8'),
    'previous candidate',
  );
});

void test('rejects a passed report without an explicit successful assertion', async () => {
  const report = passingReport();
  report.run.results[0].attempts[0].steps = [];
  const fixture = await createFixture(report);

  const result = runGenerator(fixture.reportPath, fixture.outputPath);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /成功した明示的アサーションがありません/);
  await assert.rejects(fs.access(fixture.outputPath));
});

void test('omits non-SHA VCS metadata from generated MDX', async () => {
  const report = passingReport();
  report.run.vcs = { commit: '<script>alert(1)</script>' };
  const fixture = await createFixture(report);

  const result = runGenerator(fixture.reportPath, fixture.outputPath);

  assert.equal(result.status, 0, result.stderr);
  const quality = await fs.readFile(path.join(fixture.outputPath, 'quality/latest.mdx'), 'utf8');
  assert.ok(quality.includes('- コミット: 未取得'));
  assert.ok(!quality.includes('<script>'));
});

void test('rejects run IDs that contain path separators before emitting output', async () => {
  const report = passingReport();
  report.run.id = '../../escape';
  const fixture = await createFixture(report);

  const result = runGenerator(fixture.reportPath, fixture.outputPath);

  assert.equal(result.status, 1);
  await assert.rejects(fs.access(fixture.outputPath));
});

void test('rejects evidence paths that escape the report results directory', async () => {
  const report = passingReport();
  report.run.results[0].attempts[0].artifacts[0].path = '../../outside.png';
  const fixture = await createFixture(report);

  const result = runGenerator(fixture.reportPath, fixture.outputPath);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /不正な証跡パス/);
  await assert.rejects(fs.access(fixture.outputPath));
});
