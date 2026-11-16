# ツールチェーン仕様 — 技術構成の正本

**Status:** accepted / **対象:** PH-01, PH-02, PH-06

## 選定と責務
| 技術 | 採用 | 責務 | 境界 |
|---|---|---|---|
| Node.js 24 LTS | 必須 | 共通ランタイム（BlumeのNode 22.19+に適合） | 開発環境は固定 |
| pnpm | 必須 | lockfile・workspace依存・インストール | npm workspacesは使わない |
| Turborepo (`turbo`) | 必須 | ワークスペースタスクのDAG・キャッシュ | **唯一のタスクオーケストレーター** |
| `vite-plus` | 必須 | `apps/web`のdev/build/test/check | `vp run`による別オーケストレーションは不使用 |
| React + TypeScript | 必須 | TaskFlow SPA | Next.js/SSR/API routesは使わない |
| Oxlint / Oxfmt | 同梱 | `vp lint` / `vp fmt` / `vp check` | **個別install不要** |
| Vitest | 同梱 | UI/ロジックの単体テスト | e2eとは別 |
| `e2e` / `@e2e-dev/web` | 必須 | ブラウザ操作とE2E証跡 | Vite+のVitestでは置換しない |
| Blume | 必須 | MDX静的ドキュメント生成 | `apps/docs`専用CLI |
| TypeScript + Zod | 必須 | docgen構造化データ検証 | e2eレポートアダプターを分離 |

## Oxlint / Oxfmtは必要か
**品質チェックとしては必要。ただしパッケージ追加は不要。** Vite+に同梱されるため、`vite-plus`から`vp check`を実行する。高度な独自ESLintプラグインが必須になった時のみ別途評価する。

## モノレポと依存グラフ
```
apps/web           : Vite+ React SPA → dist/
apps/docs          : Blume Docs → dist/
packages/docgen    : report→NormalizedRun→MDX
packages/scenarios : シナリオID・操作・期待結果の正本
packages/e2e-tests : e2e設定・テスト（アプリ起動を管理）
prd/               : 段階的開示PRD
```
- 内部依存は `workspace:*` とし、import時に相対パスで他パッケージの内部実装を参照しない。
- e2eはTaskFlowのブラウザを実行し、Blumeのビルドはdocgenの正常な生成後にのみ実行する。
- `packages/scenarios` を双方から参照して重複した操作説明を避ける。

## 設定の最小例（実装時にlockfileへ採用版を固定）
ルート `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

ルート `package.json`（依存バージョンは実装時に固定）:
```json
{
  "name": "e2e-living-docs",
  "private": true,
  "packageManager": "pnpm@12.6.0",
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "pnpm --filter @living/web dev",
    "dev:docs": "pnpm --filter @living/docs dev",
    "build": "turbo run build",
    "check": "vp check",
    "test:unit": "turbo run test:unit",
    "test:e2e": "pnpm --filter @living/e2e-tests test:e2e",
    "docs:generate": "pnpm --filter @living/docgen generate",
    "docs:build": "pnpm --filter @living/docs build",
    "docs:validate": "pnpm --filter @living/docs validate",
    "docs:sync": "node scripts/docs-sync.mjs"
  }
}
```
> `vp` はルートのdevDependency `vite-plus`が提供するローカルCLI。Node.jsとpnpmを用意すれば、グローバル`vp`は必須ではない。`@living/*`は本リポジトリで統一する仮の内部パッケージ名。

ルート `turbo.json`（概念例）:
```json
{
  "$schema": "https://turborepo.com/schema.json",
  "tasks": {
    "dev": { "cache": false, "persistent": true },
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test:unit": { "dependsOn": ["^build"], "outputs": [] },
    "check": { "outputs": [] }
  }
}
```
`build`に `dist/**` を指定しても、docgenのMDX生成を自動で保証するわけではない。**E2E→docgen→Blumeの順序は `scripts/docs-sync.mjs` が明示的に保証する。** 個別ワークスペースにないタスクはスキップする。

`apps/web/package.json` のscripts例:
```json
{
  "name": "@living/web",
  "private": true,
  "scripts": {
    "dev": "vp dev --host 127.0.0.1 --port 5173",
    "build": "vp build",
    "test:unit": "vp test --run"
  }
}
```
Vite+のReact pluginを使う。`index.html` / `src/main.tsx` が入口、静的出力は `apps/web/dist/`。

`apps/docs/package.json` のscripts例:
```json
{
  "name": "@living/docs",
  "private": true,
  "scripts": {
    "dev": "blume dev",
    "build": "blume build",
    "validate": "blume validate"
  }
}
```
BlumeはVite+のアプリビルドを使わず、専用CLIで起動・ビルドする。

## 主要ローカルコマンド
```bash
pnpm install
pnpm dev:web                 # Vite+ TaskFlow
pnpm dev:docs                # Blume
pnpm check                   # Vite+内蔵 Oxlint + Oxfmt + 型検査
pnpm test:unit               # Turbo経由の単体テスト
pnpm test:e2e                # e2e（Webサーバーを自動起動/再利用）
pnpm docs:sync               # E2E→docgen→Blumeビルド→検証
```

## 制約・確認事項
- Vite+のルート `vite.config.ts` に `lint` / `fmt` / `typeCheck` 設定を集約し、アプリ側のVite設定はReact pluginとビルドに限定。
- `vp check` がルートから各対象ファイルを適切に検査することをPH-01で実機検証する。BlumeのMDXまで一律にLint対象へ入れない。
- `pnpm` / `vite-plus` / `turbo` / `blume` / `e2e` は互換性を確認して正確なバージョンを固定する。
- e2eのセットアップでAIモデル認証が必要。モデル未設定時のskipを成功扱いしない。
- `.env.local`, `.artifacts/`, `.generated/`, `apps/*/dist/`は原則ignore。サンプル機密データは使用しない。

## 参考URL
- https://viteplus.dev/guide
- https://viteplus.dev/guide/check
- https://pnpm.io/workspaces
- https://useblume.dev/guides/monorepo-documentation-site
