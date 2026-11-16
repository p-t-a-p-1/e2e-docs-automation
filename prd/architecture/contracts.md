# 内部データ契約（Level 3）

**正本:** このファイル。実装型は `packages/docgen/src/types.ts`、シナリオは `packages/scenarios/src/`。

## シナリオ型
```ts
export type Scenario = {
  id: string; // TC-001 等の安定ID
  slug: string; // task-create
  title: string;
  description: string;
  preconditions: string[];
  steps: Array<{
    id: string;
    goal: string; // e2e agent.actで使う操作目標
    instruction: string; // マニュアル用の事実表現
    screenshotLabel?: string;
  }>;
  expectedResult: string;
};
```

## 正規化された実行結果
```ts
export type TestEvidence = {
  scenarioId: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  assertions: Array<{ description: string; passed: boolean }>;
  screenshots: Array<{ stepId: string; label: string; sourcePath: string }>;
  error?: { message: string };
};

export type NormalizedRun = {
  runId: string;
  commitSha?: string; // Git未初期化時は省略し、捏造しない
  executedAt: string; // ISO 8601 UTC
  environment: { appUrl: string; browser: string };
  tests: TestEvidence[];
};
```

## IDと検証
- `Scenario.id`の重複不可。e2eテスト名の`[TC-001]`等から一意照合する。
- 期待するシナリオそれぞれにexactly oneの結果が必要。missing/duplicateはfail-closed。
- 必須アサーションは成功、必須画像は実在・正しいメディア型が条件。
- アーティファクト参照は安全な相対パスに正規化し、パストラバーサルを拒否する。
- モデルが未設定でskipされたケースは成功とみなさない。

## 生成物・ファイル境界
| 種別 | パス例 | 備考 |
|---|---|---|
| e2eランナー出力 | `.e2e/report.json`、`.e2e/report.html` | 採用版で実出力を確認しAdapter設定に固定 |
| 元画像・トレース | `.e2e/results/` | 実際の出力パスを確認 |
| 長期診断用コピー | `.artifacts/e2e/<runId>/` | 失敗時にも保存、gitignore |
| 正規化JSON | `.generated/normalized-run.json` | ローカル中間物 |
| マニュアルMDX | `apps/docs/docs/manuals/<slug>.mdx` | 成功時のみ置換 |
| 品質MDX | `apps/docs/docs/quality/**/*.mdx` | 最新成功runのみ公開候補 |
| 公開画像 | `apps/docs/public/evidence/<runId>/` | マスク・検証済みのみ |
| Blume出力 | `apps/docs/dist/` | ローカルプレビュー。公開はMVP外 |

## ローカルのfail-closedポリシー
1. `docs:sync`は実行ごとに一意のrunIdを採番。
2. エラー時はJSON/HTML/画像/ログをローカル診断領域へ保存し、実行コマンドを非ゼロ終了させる。
3. 欠損・未知スキーマ・failed/skippedは正常ドキュメントへの確定を拒否する。
4. `docs:sync`は生成候補を検証後に確定し、Blumeのビルド・検証が失敗した場合に前回正常版のMDX・画像・distを復元する。
5. GitのSHAが取得できない場合は`commitSha`を省略し、ドキュメントに「未取得」と表示する。

## 実装で確かめる点
- e2e採用バージョンのConfig、レポートパス、スクリーンショットAPI、HTML reporter、ブラウザ導入コマンド。
- Blumeの出力/`validate`動作。MDXと画像をビルド前に検証すること。
