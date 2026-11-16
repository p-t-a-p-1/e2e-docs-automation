# 実装ロードマップ（Level 2）

`status`: planned / in_progress / blocked / done。着手時に1フェーズを選ぶ。

| フェーズ | 内容 | 依存 | 状態 | 詳細 |
|---|---|---|---|---|
| PH-01 | pnpm/Turborepo/Vite+モノレポ基盤 | — | done | [01-foundation](phases/01-foundation.md) |
| PH-02 | Vite+ React TaskFlow | PH-01 | done | [02-taskflow-app](phases/02-taskflow-app.md) |
| PH-03 | e2eテスト・証跡 | PH-02 | blocked | [03-e2e-testing](phases/03-e2e-testing.md) |
| PH-04 | docgen（正規化・MDX生成） | PH-03 | blocked | [04-doc-generator](phases/04-doc-generator.md) |
| PH-05 | Blume文書サイト | PH-04 | done | [05-blume](phases/05-blume.md) |
| PH-06 | ローカル一括実行・品質ゲート | PH-05 | blocked | [06-local-workflow](phases/06-local-workflow.md) |
| PH-07 | AIによる文章改善（任意） | PH-06 | planned | [07-ai-writing](phases/07-ai-writing.md) |

## 最短縦断スライス
**TC-001「タスク追加」**で、Vite+アプリ起動 → e2e操作 → 証跡 → MDX → Blume → `pnpm docs:sync` の1コマンドまで先に通す。次にTC-002〜006へ拡大。

## 今回は実装しないこと
- `.github/workflows/` 配下の自動化・GitHub CI。
- Cloudflare Pages自動デプロイ。静的成果物の生成とローカル確認まで。

## 完了時の記録
- 実装コミット/PR: 未作成（このリポジトリにコミット履歴なし）
- ローカル検証日時・対象SHA: 2026-11-16 15:19 JST / 対象SHAなし
- 進捗: PH-02完了。PH-03のE2E/証跡出力、PH-04のfail-closed docgen、PH-05のBlumeサイト、PH-06の一括同期を実装。docgenには正常・失敗・skip・assertion欠落・パス不正のオフライン契約テストを追加し、スクリーンショット名の衝突、run IDのパストラバーサル、コミット値のMDX混入を防止。PH-04の7テスト、TaskFlowの6テスト、web/Blume build・validateは成功。以前の `json renderer cannot be combined with list` は現行CLIの同条件テストでは再現せず。ChatGPT Plus/ProのCodexログインはユーザー指示で中断中のため、PH-03/PH-04/PH-06の成功runによる通し検証は未完了。
