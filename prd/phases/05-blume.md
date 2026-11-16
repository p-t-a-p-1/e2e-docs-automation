---
id: PH-05
status: done
depends_on: [PH-04]
read_with:
  - ../features/docs-site.md
  - ../features/quality-report.md
  - ../architecture/system.md
---
# PH-05 Blumeでの表示

## ゴール
手動ページ＋docgenが生成したMDX・画像をBlumeで表示・検索できる。

## タスク
- `apps/docs`にトップ、マニュアル一覧、quality/latest、aboutを用意。
- 自動生成MDX/画像の配置と、Blumeのナビゲーションを設計。
- `pnpm docs:build` / `pnpm docs:validate`を用意。
- 画像パス/リンク/Frontmatterの検証。

## DoD
`apps/docs/dist/`が生成され、主要URL・検索・画像表示がローカルで確認できる。
