# 証跡正規化 — 機能仕様

**関連:** PH-04 / **要件:** FR-03

## 入力
採用版のe2eレポートJSON、関連するスクリーンショット/トレース、`packages/scenarios`の定義、ローカル実行ID・時刻・環境（可能ならGit SHA）。

## 変換
1. 固定したe2eの出力スキーマをAdapterで検証。
2. 安定シナリオIDでテスト結果を一意に照合。
3. `passed` / `failed` / `skipped`に正規化。
4. 検証内容、実行時間、エラー情報を保持。
5. 画像とステップIDを紐付ける。実在・形式・安全な相対パスを検証。
6. Zodで型/意味整合をチェック。不整合はfail closed。

## 出力
`architecture/contracts.md` の `NormalizedRun`/`TestEvidence`。実装は `packages/docgen`。中間結果は`.generated/`、診断出力は`.artifacts/`。

## ローカル特有の条件
Git初期化前やdetach状態でSHAが得られなければ`commitSha`を省略し、偽のSHAを付けない。GitHub ArtifactやSecretsを前提としない。

## 合格条件
成功/失敗/skip/欠損/未知スキーマのfixtureが通り、失敗を成功に誤変換しない。
