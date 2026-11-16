---
id: PH-03
status: blocked
depends_on: [PH-02]
read_with:
  - ../features/e2e-testing.md
  - ../architecture/contracts.md
---
# PH-03 e2eによる操作・証跡

## ゴール
TC-001からAI操作→アサーション→証跡→レポートを成立させ、TC-002〜006まで拡大する。

## タスク
- `packages/e2e-tests`にe2eを導入。採用バージョンのConfigとCLIを実機確認。
- Vite+アプリの起動・再利用を設定する。
- `packages/scenarios`のシナリオをE2Eテストから参照。
- 必要なステップで画像を取得し、JSON/HTML/エラー/トレースを保存。
- テストの初期状態を毎回クリアし、モデル未設定時のskipを成功としない。

## DoD
`pnpm test:e2e`で6シナリオを実行でき、失敗は非ゼロ終了し、ローカル証跡を確認できる。
