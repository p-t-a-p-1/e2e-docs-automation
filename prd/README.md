# E2E Living Docs — PRD入口（Level 1）

> このファイルが唯一の入口。AIエージェントは全PRDを一括で読まない。

## プロダクト概要
Vite+（React + TypeScript）で作るTaskFlowをe2eが操作・検証し、証跡とテスト結果からMDXの操作マニュアル・品質レポートを自動生成する。Blumeがそれらをドキュメントサイトとして表示する。**MVPはローカルで `pnpm docs:sync` を実行して完結。GitHub Actionsは対象外。**

## 技術方針（確定）
- **pnpm workspaces**: パッケージ管理、`workspace:*`で内部依存を明示。
- **Turborepo**: ワークスペース全体のタスクオーケストレーションとキャッシュ。
- **Vite+**: `apps/web`の開発・ビルド・Vitest・Oxlint・Oxfmt・型検査。Oxlint/Oxfmtは追加依存不要。
- **e2e**: AIによる操作と確定的なアサーション、証跡出力。
- **Blume**: 独立した `apps/docs` でMDX→静的ドキュメント生成。
- **Cloudflare Pages**: 将来の手動公開候補。CI / CD・自動デプロイは今回作らない。

## 段階的に読む
1. **Level 1（常時）**: ここ + [`00-product.md`](00-product.md)。目的・制約のみ。
2. **Level 2（着手時）**: [`01-roadmap.md`](01-roadmap.md) から対象PHを決め、[`phases/README.md`](phases/README.md) で対応するフェーズファイルを**1つ**開く。
3. **Level 3（必要時）**: フェーズのfrontmatter `read_with` で指定された [`features/`](features/README.md)、[`architecture/`](architecture/README.md)、[`quality/`](quality/acceptance.md) の個別ファイルだけ読む。

## 参照ナビゲーション
| 知りたいこと | 正本 |
|---|---|
| 対象・非対象・価値 | [00-product.md](00-product.md) |
| 実装順・進捗 | [01-roadmap.md](01-roadmap.md) |
| pnpm/Turbo/Vite+とコマンド | [architecture/toolchain.md](architecture/toolchain.md) |
| 構成・ファイル配置 | [architecture/system.md](architecture/system.md) |
| テスト・MDXのデータ契約 | [architecture/contracts.md](architecture/contracts.md) |
| タスク管理UI | [features/taskflow-app.md](features/taskflow-app.md) |
| E2E実行・証跡 | [features/e2e-testing.md](features/e2e-testing.md) |
| 取り込み・正規化 | [features/evidence-normalization.md](features/evidence-normalization.md) |
| 操作マニュアル | [features/manual-generation.md](features/manual-generation.md) |
| 品質レポート | [features/quality-report.md](features/quality-report.md) |
| Blumeサイト | [features/docs-site.md](features/docs-site.md) |
| ローカル一括実行 | [features/local-workflow.md](features/local-workflow.md) |
| 合格基準 | [quality/acceptance.md](quality/acceptance.md) |

## 正本ルール
- 技術スタック/コマンドの正本は `architecture/toolchain.md`。機能要件は `features/`、型・実行ファイル境界は `architecture/contracts.md`。
- フェーズ文書に詳細をコピーしない。「ゴール」「read_with」「作業」「DoD」に限定する。
- 仕様変更は正本を編集し、重要な採否理由は `architecture/decisions.md` に追記する。
- GitHub CIやCloudflare自動公開は将来項目のまま保持し、MVPのDoDには含めない。
