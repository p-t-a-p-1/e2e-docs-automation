import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const lock = path.join(root, '.docs-sync.lock');
const runId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
const diagnostics = path.join(root, '.artifacts', 'e2e', runId);
const candidate = path.join(root, '.generated', `docs-candidate-${runId}`);
const staging = path.join(root, '.generated', `docs-staging-${runId}`);
const managed = ['docs/manuals', 'docs/quality', 'public/evidence'];
let lockHandle;

function run(command, args, cwd = root) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, E2E_TELEMETRY_DISABLED: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const output = [];
    child.stdout.on('data', (chunk) => {
      process.stdout.write(chunk);
      output.push(chunk);
    });
    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk);
      output.push(chunk);
    });
    child.once('error', reject);
    child.once('close', async (code, signal) => {
      const label = `${path.basename(command)}-${args[0]?.replaceAll(/[^a-z0-9-]/gi, '_') ?? 'run'}.log`;
      await fs.writeFile(path.join(diagnostics, label), Buffer.concat(output));
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} failed (${signal ?? code})`));
    });
  });
}
async function copyIfExists(source, destination) {
  try {
    await fs.cp(source, destination, { recursive: true, force: true });
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}
async function restore() {
  for (const entry of managed) {
    const backup = path.join(staging, entry);
    const target = path.join(root, 'apps/docs', entry);
    await fs.rm(target, { recursive: true, force: true });
    if (await copyIfExists(backup, target)) continue;
  }
  const distBackup = path.join(staging, 'dist');
  const distTarget = path.join(root, 'apps/docs/dist');
  await fs.rm(distTarget, { recursive: true, force: true });
  await copyIfExists(distBackup, distTarget);
}

try {
  lockHandle = await fs.open(lock, 'wx');
  await fs.mkdir(diagnostics, { recursive: true });
  await fs.mkdir(staging, { recursive: true });
  console.log(`[docs:sync] runId=${runId}`);
  let e2eFailure;
  try {
    await run('pnpm', ['--filter', '@living/e2e-tests', 'test:e2e'], root);
  } catch (error) {
    e2eFailure = error;
  }
  const report = path.join(root, 'packages/e2e-tests/.e2e/report.json');
  const hasReport = await copyIfExists(report, path.join(diagnostics, 'report.json'));
  const packageResults = path.join(root, 'packages/e2e-tests/.e2e/results');
  await copyIfExists(packageResults, path.join(diagnostics, 'results'));
  if (hasReport)
    await run(process.execPath, [
      'scripts/render-e2e-html.mjs',
      path.join(diagnostics, 'report.json'),
      path.join(diagnostics, 'report.html'),
    ]);
  if (e2eFailure) throw e2eFailure;
  await run('pnpm', ['--filter', '@living/docgen', 'generate', '--', report, candidate], root);
  for (const entry of managed)
    await copyIfExists(path.join(root, 'apps/docs', entry), path.join(staging, entry));
  await copyIfExists(path.join(root, 'apps/docs/dist'), path.join(staging, 'dist'));
  try {
    for (const entry of managed) {
      const generatedEntry = entry === 'public/evidence' ? 'public/evidence' : entry;
      const source = path.join(candidate, generatedEntry);
      const target = path.join(root, 'apps/docs', entry);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.mkdir(target, { recursive: true });
      await fs.cp(source, target, { recursive: true, force: true });
    }
    await run('pnpm', ['docs:build'], root);
    await run('pnpm', ['docs:validate'], root);
  } catch (error) {
    await restore();
    throw error;
  }
  console.log(`[docs:sync] 完了: ${diagnostics}`);
} catch (error) {
  console.error(`[docs:sync] 失敗: ${error.message}`);
  console.error(`[docs:sync] 診断資料: ${diagnostics}`);
  process.exitCode = 1;
} finally {
  await lockHandle?.close();
  await fs.rm(lock, { force: true });
  await fs.rm(staging, { recursive: true, force: true });
  if (process.exitCode === 0) await fs.rm(candidate, { recursive: true, force: true });
}
