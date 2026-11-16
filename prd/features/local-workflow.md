# ローカル自動実行 — 機能仕様

**関連:** PH-06 / **要件:** FR-07, FR-08

## 目的
GitHub CIなしで、開発者が `pnpm docs:sync` を1度実行するだけでE2Eテスト→証跡→MDX→Blumeビルドと検証まで完了する。

## ローカルワークフロー
1. 環境チェック（Node / pnpm / モデル接続 / 必要ブラウザ）。
2. `packages/e2e-tests`からE2Eを実行。ランナーが `apps/web` のVite+サーバーを起動/再利用。
3. 元のJSON/HTML/画像/トレース/ログを `.artifacts/e2e/<runId>/` に保存。
4. docgen Adapterによって正規化・ID照合・証跡検証。
5. マニュアル/品質MDXを候補領域へ生成し、必要画像をマスク・コピー。
6. 候補が完全な場合のみBlumeへ反映し、`blume build`と`blume validate`を実行。
7. 最後まで成功した場合のみローカルの最新成功run情報を更新。

## エラー処理
- 必須テストの`failed`/`skipped`、未知スキーマ、画像欠損、MDXエラー、リンク切れでは非ゼロ終了。
- 失敗時も診断材料を保存し、最後の正常MDX・画像・Blume distを保持または復元する。
- `docgen`生成物はユーザーの手書きページを上書きしない。生成対象のみに限定する。
- 競合した二重実行を防ぐロックまたは実行ID別の隔離を行う。
- `pnpm docs:sync`の実行結果はターミナルに結果一覧と成果物パスを表示。

## 実行コマンド
- `pnpm dev:web`: Vite+アプリ起動。
- `pnpm dev:docs`: Blumeローカルプレビュー。
- `pnpm check`: Vite+内蔵フォーマット/Lint/型チェック。
- `pnpm test:unit`: Turborepo経由でユニットテスト。
- `pnpm test:e2e`: e2eのみ。
- `pnpm docs:sync`: 一括生成。

## 明確な非対象
GitHub Actions、GitHubのPush/PR自動トリガー、定期実行、Cloudflare Pages自動デプロイ、GitHub Artifact、GitHub Secrets。将来は静的出力をCloudflare Pagesへ公開できるが今回のDoDではない。

## 受け入れ条件
1. ローカル1コマンドでE2EからBlume検証まで完走。
2. エラーで非ゼロ終了し失敗理由を確認可能。
3. 故意に失敗させても前回成功版のドキュメントを壊さない。
4. 再実行時に検証日時と画像が更新される。
