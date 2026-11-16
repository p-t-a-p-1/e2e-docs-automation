import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { z } from 'zod';
import { scenarios } from '@living/scenarios';

const EvidenceReport = z
  .object({
    schemaVersion: z.literal('report-1'),
    run: z
      .object({
        id: z.string().uuid(),
        status: z.enum(['passed', 'failed', 'blocked', 'error', 'interrupted']),
        exitCode: z.number().int(),
        startedAt: z.string().datetime(),
        summary: z
          .object({
            selected: z.number().int().nonnegative(),
            passed: z.number().int().nonnegative(),
            failed: z.number().int().nonnegative(),
            skipped: z.number().int().nonnegative(),
            interrupted: z.number().int().nonnegative(),
          })
          .passthrough(),
        results: z.array(
          z
            .object({
              kind: z.enum(['test', 'setup']),
              selected: z.boolean().optional(),
              titlePath: z.array(z.string()),
              status: z.enum(['passed', 'flaky', 'failed', 'timed-out', 'interrupted', 'skipped']),
              attempts: z.array(
                z
                  .object({
                    durationMs: z.number().int().nonnegative(),
                    artifacts: z
                      .array(
                        z
                          .object({
                            kind: z.enum(['screenshot', 'video', 'download', 'log', 'other']),
                            mediaType: z.string(),
                            redaction: z.enum(['complete', 'incomplete']),
                            path: z.string().optional(),
                          })
                          .passthrough(),
                      )
                      .optional(),
                    steps: z
                      .array(
                        z
                          .object({
                            kind: z.string(),
                            status: z.string(),
                            label: z.string().optional(),
                          })
                          .passthrough(),
                      )
                      .optional(),
                  })
                  .passthrough(),
              ),
            })
            .passthrough(),
        ),
      })
      .passthrough(),
  })
  .strict();

const root = path.resolve(import.meta.dirname, '../../..');
const reportPath = path.resolve(root, process.argv[2] ?? 'packages/e2e-tests/.e2e/report.json');
const evidenceRoot = path.dirname(reportPath);
const outDir = path.resolve(root, process.argv[3] ?? '.generated/docs-candidate');
const fail = (message) => {
  console.error(`[docgen] ${message}`);
  process.exitCode = 1;
};

try {
  const parsed = EvidenceReport.safeParse(JSON.parse(await fs.readFile(reportPath, 'utf8')));
  if (!parsed.success) throw new Error(`不正なe2e report: ${parsed.error.message}`);
  const { run } = parsed.data;
  if (run.status !== 'passed' || run.exitCode !== 0)
    throw new Error(`E2E run が成功していません (${run.status}/${run.exitCode})`);
  if (
    run.summary?.selected !== scenarios.length ||
    run.summary?.passed !== scenarios.length ||
    run.summary?.failed ||
    run.summary?.skipped ||
    run.summary?.interrupted
  )
    throw new Error('6件すべての必須テストが成功していません');
  const byId = new Map();
  for (const result of run.results.filter(
    (item) => item.selected !== false && item.kind === 'test',
  )) {
    const title = result.titlePath?.join(' ') ?? '';
    const id = title.match(/\[(TC-\d{3})\]/)?.[1];
    if (!id) continue;
    if (byId.has(id)) throw new Error(`${id} の結果が重複しています`);
    if (result.status !== 'passed')
      throw new Error(`${id} は成功状態ではありません (${result.status})`);
    byId.set(id, result);
  }
  if (byId.size !== scenarios.length || scenarios.some((scenario) => !byId.has(scenario.id)))
    throw new Error('必須シナリオの欠損があります');
  const docs = [];
  for (const scenario of scenarios) {
    const result = byId.get(scenario.id);
    const finalAttempt = result.attempts.at(-1);
    if (!finalAttempt?.steps?.some((step) => step.kind === 'assertion' && step.status === 'passed'))
      throw new Error(`${scenario.id} に成功した明示的アサーションがありません`);
    const screenshots = (finalAttempt?.artifacts ?? []).filter(
      (artifact) =>
        artifact.kind === 'screenshot' &&
        artifact.path &&
        artifact.mediaType === 'image/png' &&
        artifact.redaction === 'complete',
    );
    if (!screenshots.length)
      throw new Error(`${scenario.id} の検証済みスクリーンショットがありません`);
    const artifact = screenshots[0];
    if (artifact.path.startsWith('/') || artifact.path.split('/').some((part) => part === '..'))
      throw new Error(`${scenario.id}: 不正な証跡パス`);
    const source = path.resolve(evidenceRoot, 'results', artifact.path);
    const artifactRoot = path.resolve(evidenceRoot, 'results') + path.sep;
    if (!source.startsWith(artifactRoot)) throw new Error(`${scenario.id}: 証跡パスが範囲外です`);
    const bytes = await fs.readFile(source);
    if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a')
      throw new Error(`${scenario.id}: PNG証跡が不正です`);
    docs.push({ scenario, result, artifact, source });
  }
  await fs.rm(outDir, { recursive: true, force: true });
  for (const { scenario, source } of docs) {
    const evidenceName = `${scenario.slug}.png`;
    const body = [
      '---',
      `title: "${scenario.title}"`,
      `description: "${scenario.description}"`,
      '---',
      '',
      `# ${scenario.title}`,
      '',
      scenario.description,
      '',
      '## 前提条件',
      ...scenario.preconditions.map((item) => `- ${item}`),
      '',
      '## 操作手順',
      ...scenario.steps.flatMap((step, i) => [
        `${i + 1}. ${step.instruction}`,
        `   ![${step.screenshotLabel}](/evidence/${run.id}/${evidenceName})`,
      ]),
      '',
      '## 確認結果',
      scenario.expectedResult,
      '',
      `検証シナリオ: ${scenario.id} / 実行日時: ${run.startedAt} / 検証状態: passed`,
      '',
    ].join('\n');
    const file = path.join(outDir, 'manuals', `${scenario.slug}.mdx`);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body);
    const image = path.join(outDir, 'public', 'evidence', run.id, evidenceName);
    await fs.mkdir(path.dirname(image), { recursive: true });
    await fs.copyFile(source, image);
  }
  const summary = run.summary;
  const rawCommit = run.vcs?.commit;
  const commit =
    typeof rawCommit === 'string' && /^[0-9a-f]{7,64}$/i.test(rawCommit) ? rawCommit : '未取得';
  const quality = [
    '---',
    'title: "最新の品質レポート"',
    'description: "TaskFlow E2E品質レポート"',
    '---',
    '',
    '# 最新の品質レポート',
    '',
    `- Run ID: ${run.id}`,
    `- 実行日時: ${run.startedAt}`,
    `- 結果: ${run.status}`,
    `- 成功: ${summary.passed} / ${summary.selected}`,
    `- 失敗: ${summary.failed}`,
    `- スキップ: ${summary.skipped}`,
    `- コミット: ${commit}`,
    '',
    '## シナリオ別結果',
    ...docs.map(
      ({ scenario, result }) =>
        `- [${scenario.id} ${scenario.title}](/quality/tests/${scenario.slug}) — ${result.status}`,
    ),
    '',
  ].join('\n');
  const qualityPath = path.join(outDir, 'quality', 'latest.mdx');
  await fs.mkdir(path.dirname(qualityPath), { recursive: true });
  await fs.writeFile(qualityPath, quality);
  for (const { scenario, result } of docs) {
    const file = path.join(outDir, 'quality', 'tests', `${scenario.slug}.mdx`);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(
      file,
      `---\ntitle: "${scenario.id}: ${scenario.title}"\ndescription: "${scenario.expectedResult}"\n---\n\n# ${scenario.id}: ${scenario.title}\n\n状態: ${result.status}\n\n${scenario.expectedResult}\n`,
    );
  }
  await fs.writeFile(
    path.join(outDir, 'normalized-run.json'),
    `${JSON.stringify({ runId: run.id, executedAt: run.startedAt, status: run.status, summary, scenarioIds: docs.map(({ scenario }) => scenario.id) }, null, 2)}\n`,
  );
  await fs.writeFile(
    path.join(outDir, 'report.html'),
    `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>TaskFlow E2E ${run.id}</title><main><h1>TaskFlow E2E 実行レポート</h1><p>実行ID: ${run.id}</p><p>実行日時: ${run.startedAt}</p><p>状態: ${run.status} — 成功 ${summary.passed}/${summary.selected}、失敗 ${summary.failed}、スキップ ${summary.skipped}</p><ul>${docs.map(({ scenario }) => `<li>${scenario.id} ${scenario.title}: passed</li>`).join('')}</ul></main></html>`,
  );
  console.log(
    `[docgen] 成功: ${scenarios.length}件のマニュアルと品質レポートを生成しました (${outDir})`,
  );
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
