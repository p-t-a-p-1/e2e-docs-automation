import fs from 'node:fs/promises';
import path from 'node:path';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node render-e2e-html.mjs <report.json> <report.html>');
  process.exit(2);
}
const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
try {
  const report = JSON.parse(await fs.readFile(input, 'utf8'));
  if (report.schemaVersion !== 'report-1' || !report.run || !Array.isArray(report.run.results))
    throw new Error('Unsupported report schema');
  const { run } = report;
  const rows = run.results
    .map((result) => {
      const title = result.titlePath?.join(' › ') ?? result.testId;
      const detail =
        result.attempts
          ?.flatMap((attempt) => [
            attempt.error?.message,
            ...(attempt.steps
              ?.map((step) => step.error?.message ?? step.explanation)
              .filter(Boolean) ?? []),
          ])
          .filter(Boolean)
          .at(-1) ??
        result.skip?.reason ??
        '';
      return `<tr><td>${escapeHtml(title)}</td><td>${escapeHtml(result.status)}</td><td>${escapeHtml(detail)}</td></tr>`;
    })
    .join('\n');
  const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>TaskFlow E2E レポート</title><style>body{font:16px system-ui,sans-serif;max-width:960px;margin:3rem auto;padding:0 1rem;color:#172033}table{border-collapse:collapse;width:100%}th,td{text-align:left;border-bottom:1px solid #ddd;padding:.7rem}th{background:#f4f6fb}.status{font-weight:700}</style></head><body><main><h1>TaskFlow E2E レポート</h1><p>runId: ${escapeHtml(run.id)}</p><p>実行日時: ${escapeHtml(run.startedAt)}</p><p class="status">${escapeHtml(run.status)} — 成功 ${run.summary?.passed ?? 0}/${run.summary?.selected ?? 0}、失敗 ${run.summary?.failed ?? 0}、スキップ ${run.summary?.skipped ?? 0}</p><table><thead><tr><th>シナリオ</th><th>状態</th><th>詳細</th></tr></thead><tbody>${rows}</tbody></table></main></body></html>\n`;
  await fs.mkdir(path.dirname(path.resolve(output)), { recursive: true });
  await fs.writeFile(output, html);
  console.log(`[report] HTML: ${output}`);
} catch (error) {
  console.error(`[report] ${error.message}`);
  process.exitCode = 1;
}
