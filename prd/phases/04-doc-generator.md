---
id: PH-04
status: blocked
depends_on: [PH-03]
read_with:
  - ../features/evidence-normalization.md
  - ../features/manual-generation.md
  - ../features/quality-report.md
  - ../architecture/contracts.md
---
# PH-04 docgen

## ゴール
e2e結果 + `packages/scenarios` + 画像から検証済みのMDXを自動生成する。

## タスク
- e2e出力Adapter、Zod検証、NormalizedRunを実装。
- TC-001の画像/stepId/assertionを照合し、MDXを生成。
- TC-002〜006へ拡大。マニュアルとレポートを生成。
- 破損/欠損/skip/失敗/未知版のfixtureを用意。
- 生成候補をステージングし、同一入力に対する決定性をテストする。

## DoD
成功runでマニュアルとレポートを生成でき、異常runを正常版として確定しない。`pnpm docs:generate`が利用可能。
