# セキュリティロボット強化学習フロントエンド

このリポジトリは、セキュリティロボット強化学習システムの**Nuxt 4 + Vue 3 + TypeScript**製フロントエンド単体プロジェクトです。Element Plus、Pinia、Chart.js、Socket.IO を組み合わせて、学習セッションの操作・可視化・プレイバックをリアルタイムに行う管理コンソールを提供します。バックエンド(API・学習エンジン)は別リポジトリで稼働し、本プロジェクトはフロントエンド層に特化しています。

## プロジェクト概要

- 強化学習セッションの開始/停止、ハイパーパラメータ編集、進捗モニタリングをブラウザから制御
- WebSocket/フォールバックポーリングで取得したメトリクス(報酬、探索率、損失など)をチャート表示
- 環境内ロボット位置や脅威分布の2D可視化、プレイバック機能、モデル管理画面を実装予定
- DDDライクなレイヤ構成(`libs`, `composables`, `stores`)とテスト駆動開発方針を採用

設計・運用・テスト方針は `instructions/` 配下の自己完結型ドキュメントセット(例: `01_system_architecture_design_standalone.md`, `02_backend_api_design_standalone.md`)に記載されています。進捗やセッションログは `report/` 以下(`PROGRESS.md`, `DIARY*.md`)で追跡しています。

## セットアップ & 実行

1. 依存関係のインストール
   ```bash
   pnpm install
   ```
2. 開発サーバー起動
   ```bash
   pnpm dev
   ```
3. よく使うスクリプト
   - `pnpm build` : 本番ビルド
   - `pnpm preview` : ビルド済み資産のローカル確認
   - `pnpm lint` : ESLint + Stylelint
   - `pnpm typecheck` : TypeScript単体型チェック
   - `pnpm test` : Vitest(ユニット) + @vitest/coverage-v8
   - `pnpm e2e` : Playwrightシナリオ実行 (`tests/e2e/playwright.config.ts`)

推奨ランタイム: Node.js 20系 / pnpm 9系。Nuxt 4のNitroプリセットは `node-server` に設定済みです。

## ディレクトリガイド

- `app.vue` / `layouts/` / `pages/` : 画面構成。パラメータ化されたページ(`training/[sessionId]` 等)でセッション単位の可視化を提供。
- `components/` : UIコンポーネント。Element PlusとカスタムSVG/Canvas描画を併用。
- `composables/` : ドメイン固有ロジック(学習制御、環境取得、チャート管理、WebSocket接続)をフック化。
- `configs/` : APIエンドポイント、ランタイム定数、環境変数リゾルバ。
- `libs/` : DDD準拠の `domains/`, `entities/`, `repositories/` を集約。
- `stores/` : Piniaストア。セッション、環境、再生、WebSocket、UI状態、モデル管理を分離。
- `types/`, `utils/` : 共有型定義・フォーマッタ・バリデータなどのユーティリティ。
- `tests/` : Vitest/Playwright両テストを格納。`coverage/` にV8レポートが出力されます。

詳細な設計・API契約・テスト方針は `instructions/03_frontend_design_standalone.md` と `instructions/04_test_design_standalone.md` を参照してください。

## 品質・テスト状況

`report/PROGRESS.md` (2025-11-07更新) 時点の指標:
- ユニットテスト 502件 / 成功率 100%
- カバレッジ: Statements 98.14%, Branches 92.90%, Functions 87.09%, Lines 98.14% (目標85%超)
- Lint/TypeCheck は strict モードでパス済み
- Components/Pages/Stores/Utils 層は全テスト済み。Composables層も 92% 以上カバー

CIでは Vitest + Coverage, ESLint, TypeScript を同一パイプラインで実行する前提です。PlaywrightによるE2Eテストは主要フロー(学習開始、メトリクス視覚化、プレイバック)を順次追加しています。

## ドキュメント / レポート

- 設計資料: `instructions/` ディレクトリに自己完結型の設計書を格納 (システムアーキテクチャ、バックエンドAPI、フロントエンド設計、テスト設計など)。
- 進捗記録: `report/PROGRESS.md` でフェーズ別TODO/達成状況を管理。詳細ログは `report/DIARY*.md`。
- 追加資料: `report/00_implementation_guide_update_summary.md`, `report/conversation_summary_session_009.md` などでセッション履歴を振り返れます。

新規参加者は以下の順序で把握することを推奨します:
1. `instructions/00_SUMMARY.md` で全体像を把握
2. `instructions/01_system_architecture_design_standalone.md` でシステム全体とバックエンド連携を確認
3. `instructions/03_frontend_design_standalone.md` / `04_test_design_standalone.md` で実装ルールを確認
4. `report/PROGRESS.md` で現在のタスクと残項目を確認

## 今後の進め方

- Phase 13 以降: 環境リプレイ系エンティティのテスト補完、可視化コンポーネントの最適化、E2Eシナリオ拡張
- 追加ドキュメント: フロントエンド詳細設計書・デプロイガイドの整備 (instructions ディレクトリ参照)
- コントリビュート時は `report/DIARYxx.md` にセッションログを追記し、`report/PROGRESS.md` を更新してください

バグ報告・改善提案は Issue で受け付けています。ドキュメントに関する質問は `instructions/README.md` の指針に従ってください。
