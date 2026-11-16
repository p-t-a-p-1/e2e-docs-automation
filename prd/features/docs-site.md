# Blumeドキュメントサイト — 機能仕様

**関連:** PH-05 / **要件:** FR-06

## 目的
同一のBlumeサイトで、検証済み操作マニュアルと最新成功E2Eテストレポートを表示・検索できるようにする。

## URL
- `/`: プロジェクトと手順
- `/manuals`: マニュアル一覧
- `/manuals/task-create` など: 操作マニュアル
- `/quality/latest`: 最後に成功した実行の概要
- `/quality/tests/<slug>`: 成功runのシナリオ別結果
- `/about`: 生成方式・検証範囲・制約

## 構成
- `apps/docs`をBlume専用のpnpm workspaceとして初期化し、`blume dev/build/validate`を使用。
- 手動ページと自動生成ページの配置を分け、生成対象外の手書き内容を消さない。
- `apps/docs/public/evidence/` にマスク・検証済みの画像のみコピー。
- 静的成果物は `apps/docs/dist/` に出力し、ローカルでプレビューする。
- Vite+の `vp build` ではなく **Blume CLI** がサイト生成を担当する。
- Cloudflare Pagesへの自動公開は今回非対象。

## 合格条件
Blumeビルド/検証が成功し、全主要URLの内部リンク/画像を閲覧でき、検索からマニュアルへ到達できる。
