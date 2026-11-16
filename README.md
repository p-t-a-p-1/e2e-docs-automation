# E2E Living Docs

ローカルで動くTaskFlowをE2Eで検証し、検証済みの操作マニュアルと品質レポートを生成するプロジェクトです。GitHub Actionsや自動デプロイはMVPの対象外です。

## 開発環境

- Node.js 24.22.3（miseで固定）
- pnpm 12.6.0（miseで固定）

miseをインストール済みの環境では、リポジトリ直下で `mise install` を実行して固定バージョンを準備します。その後:

```sh
pnpm install
pnpm dev:web
pnpm dev:docs
pnpm check
pnpm build
```

`.env.example`を参考に`.env.local`を作成し、AIを使うE2E実行時のみ必要な認証情報を設定してください。秘密情報や実行証跡はコミットしないでください。

詳細な仕様と段階的な読み方は [`prd/README.md`](prd/README.md) を参照してください。

## UIデザインシステム

TaskFlowの画面は [Astryx](https://github.com/meta/astryx) のCoreコンポーネントとNeutralテーマを使っています。画面を追加・変更するときは、まずアプリ固有の [`apps/web/AGENTS.md`](apps/web/AGENTS.md) とAstryx CLIのコンポーネント資料を確認してください。

```sh
pnpm --filter @living/web exec astryx component Button
pnpm --filter @living/web exec astryx docs tokens
```

## E2Eとドキュメント同期

E2EはChatGPT Plus/ProのCodexサインインを利用します。初回は次のコマンドを実行し、ブラウザで許可してください（APIキーは不要です）。ChatGPTのプランとAPI利用は別枠です。`.env.example`を`.env.local`に複製し、必要なら利用可能なモデルIDを`E2E_MODEL`で指定してください。`.env.local`とサインイン情報はコミットしないでください。

```sh
pnpm --filter @living/e2e-tests exec e2e login openai
pnpm test:e2e       # 6件のAI操作E2E、画面アサーション、スクリーンショット/トレース
pnpm docs:sync      # E2E → 証跡検証・MDX/HTML生成 → Blume build/validate
```

E2E操作が失敗またはスキップされた場合、同期は非ゼロ終了し、検証済みページを更新しません。JSON/HTMLレポートと診断用証跡は `.artifacts/e2e/<runId>/` に保存します。手順ページはE2Eが正常に成功するまでは未検証の案内を表示します。
