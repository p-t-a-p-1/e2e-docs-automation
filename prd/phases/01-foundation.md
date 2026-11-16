---
id: PH-01
status: planned
read_with:
  - ../architecture/toolchain.md
  - ../architecture/system.md
  - ../architecture/decisions.md
---
# PH-01 モノレポ・ツールチェーン

## ゴール
pnpm workspace + Turborepo + Vite+とBlumeの開発土台がローカルで動く。

## タスク
- Node.js 24系、pnpmの正確なバージョンを固定し、`pnpm-workspace.yaml`を作る。
- `turbo.json`を設け、唯一のmonorepo task runnerとして使う。
- `vite-plus`を導入し、Oxlint/Oxfmt/Vitestは内蔵機能を使用。`vp check`を確認。
- `apps/web`にReact/TS SPAの雛形を用意。
- `apps/docs`にBlumeをセットアップ。Turborepo buildの独立性を確認。
- `packages/scenarios`, `packages/e2e-tests`, `packages/docgen`のworkspacesを作る。
- `.env.example`と`.gitignore`を整備。CIは作らない。

## DoD
`pnpm install`、`pnpm dev:web`、`pnpm dev:docs`、`pnpm check`、`pnpm build`がローカルで動く。手動READMEから起動できる。
