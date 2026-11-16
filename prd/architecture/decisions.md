# Architecture Decision Records（ADR）

## ADR-001：Vite+ + React SPAを採用
- **背景:** タスク操作/E2E/MDX生成のサンプルにSSRやAPI Routeは不要。
- **選択肢:** Next.js静的出力、Vite SPA、Vite+ SPA。
- **決定:** Vite+ / React / TypeScript。localStorage永続化、`dist/`に静的ビルド。
- **理由:** 軽量な実装と統合ツールチェーン（Oxlint/Oxfmt/Vitest）を両立する。
- **見直し条件:** 認証・SSR・サーバー機能が要件化した場合。

## ADR-002：シナリオ定義をマニュアルの正本にする
- **背景:** AIだけでマニュアルを書くと未検証の操作を作りやすい。
- **決定:** `packages/scenarios`に人間がレビューできる手順・期待結果・撮影ラベルを定義する。
- **結果:** 決定的生成が可能。AI文章改善は任意の追加機能。

## ADR-003：ローカル一括実行をMVPの完了条件とする
- **背景:** GitHub CIは後回しにしたい。
- **決定:** `pnpm docs:sync`にE2E→証跡→docgen→Blumeの全処理をまとめ、失敗時に最新正常版を置換しない。
- **結果:** 手元で再現可能。Pushで自動起動する仕組みはない（将来課題）。

## ADR-004：e2eレポートを正規化Adapter経由で扱う
- **背景:** e2eのAPI・スキーマ変更に備える。
- **決定:** `NormalizedRun`へ変換し、未知スキーマを拒否する。

## ADR-005：pnpm + Turborepoを採用し、Vite Taskと二重運用しない
- **背景:** Vite+にもワークスペースタスク実行が含まれる。
- **決定:** TurborepoがDAG/キャッシュを担当、Vite+は開発/ビルド/チェック/ユニットテストの個別コマンド担当。
- **結果:** 二重のタスクグラフ/キャッシュ設定を避ける。
- **見直し条件:** Turboを使う意義がなくなり、Vite Taskへ一元化する意思決定をした場合。

## ADR-006：Oxlint/OxfmtはVite+内蔵版のみ
- **背景:** `vite-plus`に両ツールが同梱される。
- **決定:** `vp check`を品質チェックの入口にし、単独の `oxlint`/`oxfmt` を重複追加しない。
- **例外:** 必須ルールや拡張機能が内蔵版では実現できないと判明した場合。
