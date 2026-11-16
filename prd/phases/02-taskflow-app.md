---
id: PH-02
status: done
depends_on: [PH-01]
read_with:
  - ../features/taskflow-app.md
  - ../architecture/toolchain.md
---
# PH-02 TaskFlowアプリ

## ゴール
Vite+ / React / TypeScript のSPAでタスク管理を実装する。

## タスク
- APP-01〜07: 一覧、追加、編集、完了、削除、保存、入力検証。
- アクセシビリティに配慮した画面と意味的セレクター。
- localStorageの状態復元/テスト初期化。
- Vitestによる主要なコンポーネントと状態管理の単体テスト。

## DoD
`pnpm dev:web`で全機能を操作でき、`pnpm --filter @living/web build`で`apps/web/dist/`が生成される。単体テストも成功。
