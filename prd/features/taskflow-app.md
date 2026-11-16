# TaskFlow Demo — 機能仕様

**関連:** PH-02 / **要件:** APP-01〜APP-07

## 概要
Vite+ + React + TypeScriptの単一画面SPA。利用者はタスクを登録・編集・完了・削除でき、リロード後も保存される。

| ID | 機能 | 合格条件 |
|---|---|---|
| APP-01 | 一覧表示 | 登録済みタスクを表示、0件は空状態 |
| APP-02 | 新規追加 | 入力したタイトルが一覧に現れる |
| APP-03 | 編集 | タイトルが更新される |
| APP-04 | 完了切替 | checkbox状態と完了フラグが一致 |
| APP-05 | 削除 | 対象1件のみ消える |
| APP-06 | 永続化 | localStorageに保存しリロード後に復元 |
| APP-07 | 入力検証 | 空文字/空白のみで追加しない |

## UI・開発方針
- `apps/web/index.html` + `src/main.tsx` + `src/App.tsx` でSPAを構築。ルートは`/`。
- Vite+のReact pluginを使用。Vite+標準の`vp dev`/`vp build`/`vp test`。
- input/button/checkboxに意味的roleとアクセシブルネームを設定し、e2eで文字列検索可能にする。
- viewport基準1280×800、小画面でも基本操作可。
- React stateは初回マウント時にlocalStorageから復元。ブラウザAPIへのアクセスを適切に扱う。
- data-testidへの依存は最小化。操作エラーはユーザーに示す。

## テスト可能性
- テスト開始時にlocalStorageの状態を明示的に初期化。
- 各テストを独立させ、残存データによる影響を避ける。
- 不必要な非同期タイマーや長いアニメーションを入れない。

## 対象外
Next.js、認証、外部API、DB、共有タスク、SSR。
