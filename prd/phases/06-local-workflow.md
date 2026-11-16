---
id: PH-06
status: blocked
depends_on: [PH-05]
read_with:
  - ../features/local-workflow.md
  - ../architecture/contracts.md
  - ../quality/acceptance.md
  - ../quality/risks.md
---
# PH-06 ローカル一括実行

## ゴール
`pnpm docs:sync`だけでE2E→証跡→MDX→Blumeビルド/検証を実行できる。

## タスク
- `scripts/docs-sync.mjs`で逐次実行、サブプロセスの終了コードを確実に伝播。
- Vite+サーバーの起動/再利用、タイムアウト、異常時クリーンアップを確認。
- E2E成果物を `.artifacts/e2e/<runId>/` に保存。
- MDX/画像の候補生成・検証後に置換し、Blumeエラー時は前回成功版を復元。
- ローカル連続実行の衝突防止と、ターミナルサマリーを実装。
- 成功→UI変更→再実行、故意のテスト失敗、画像欠損を検証。

## DoD
全6シナリオが成功したときMDX/Blume出力を更新。失敗したとき非ゼロ終了し、元の成功版を保持し、診断材料が残る。GitHub CIなしで成立。
