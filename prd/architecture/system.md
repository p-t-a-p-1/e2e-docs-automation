# システム構成 — ローカルMVP

## コンポーネント
| コンポーネント | 責務 |
|---|---|
| `apps/web` | Vite+ / React / TypeScript SPA。localStorage保存、`dist/`静的出力 |
| `apps/docs` | BlumeによるMDX→静的ドキュメント、`dist/`出力 |
| `packages/e2e-tests` | e2e設定・AI操作・確定的アサーション・証跡取得 |
| `packages/scenarios` | シナリオ正本。ID/手順/期待結果/スクリーンショットラベル |
| `packages/docgen` | e2e結果Adapter・Zod検証・MDX生成・画像の安全なコピー |
| `scripts/docs-sync.mjs` | 一連の処理の逐次実行、失敗の伝播、最後の正常生成物保護 |
| Turborepo | ワークスペースタスクの依存解決・キャッシュ |
| pnpm | workspaceと依存の固定 |

## 処理フロー
```
開発者: pnpm docs:sync
  ├─ e2eがVite+ dev serverを起動/再利用してテスト
  │    └─ .artifacts/e2e/<runId>/ (JSON・HTML・画像・トレース)
  ├─ docgen Adapter + Validator
  │    └─ NormalizedRun -> MDX・必要な画像（候補領域）
  ├─ 候補生成物の検査 → Blume build + validate
  └─ 正常時だけ最新のローカル生成物を確定
       ├─ apps/docs/dist/
       └─ .artifacts/runs/<runId>/summary.json
```

## ワークスペース構成
```text
e2e-living-docs/
├── apps/
│   ├── web/                # Vite+ React SPA
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── src/main.tsx
│   │   └── src/App.tsx
│   └── docs/               # Blume
│       ├── blume.config.ts
│       ├── docs/
│       └── public/evidence/
├── packages/
│   ├── scenarios/          # 共有シナリオ定義
│   ├── e2e-tests/          # e2e.config.ts, tests/*.e2e.ts
│   └── docgen/             # adapter, normalizer, generator
├── scripts/docs-sync.mjs
├── prd/                    # このドキュメント
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
├── vite.config.ts          # Vite+の共通lint/fmtチェック
├── package.json
├── AGENTS.md
└── CLAUDE.md
```

## ポリシー
- ローカルMVPではデプロイなし。Cloudflare Pagesは将来の静的ホスト候補。
- 同一入力のドキュメント生成は決定的で、失敗時は前回正常版を保護する。
- `e2e`のレポート形式変更をdocgen Adapter内で吸収する。
- 実行成果物と公開可能な画像を別管理し、Secretsやユーザー情報を持ち込まない。
