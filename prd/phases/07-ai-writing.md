---
id: PH-07
status: planned
optional: true
depends_on: [PH-06]
read_with:
  - ../features/manual-generation.md
  - ../architecture/contracts.md
  - ../quality/risks.md
---
# PH-07 AI文章改善（MVP外）

## ゴール
証跡とシナリオに忠実なまま、マニュアルを読みやすい日本語へ整える。

## タスク
- 確認済み手順・assertionだけをAIの入力に使う。
- 構造化出力をZodで検証し、ステップ数・順序・画像・期待結果との整合を保証。
- モデル未設定/応答失敗時は決定的テンプレートへフォールバック。
- 未検証操作の混入を検出するテストを追加。

## DoD
AIを使わなくても`pnpm docs:sync`は成功し、AI改善を有効にしても未検証事項を追加しない。
