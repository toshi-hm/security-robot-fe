# GEMINI.md - AI開発アシスタント向けガイド

## 1. プロジェクト概要

このリポジトリは、**セキュリティロボット強化学習システム**の**フロントエンド**実装です。

`instructions/`ディレクトリにある自己完結型設計書群、特に以下のドキュメントに基づいて開発されています。
- **フロントエンド詳細設計**: `instructions/03_frontend_design_standalone.md`
- **システム全体設計**: `instructions/01_system_architecture_design_standalone.md`

### 主要技術スタック
- **フレームワーク**: Nuxt v4, Vue.js 3.5
- **言語**: TypeScript 5.7 (strict mode)
- **UI**: Element Plus, Nuxt UI, SCSS (BEM記法)
- **状態管理**: Pinia
- **通信**: axios (REST), Native WebSocket (リアルタイム)
- **テスト**: Vitest (単体), Playwright (E2E)
- **パッケージ管理**: pnpm

---

## 2. 必須の作業ワークフロー

AIアシスタントとして作業を開始する前に、**必ず**以下のファイルを確認してください。

1.  **進捗の全体像を把握する:**
    ```bash
    cat report/PROGRESS.md
    ```
    - ✅ 実装済みのフェーズと機能
    - 🔧 現在実装中のタスク
    - 🎯 次のアクションアイテム

2.  **直近の作業履歴を理解する:**
    ```bash
    # Session 016以降の記録
    cat report/DIARY02.md
    ```
    - 前回のセッションで何が行われたか
    - 遭遇した問題と解決策
    - 次のセッションへの引き継ぎ事項

---

## 3. アーキテクチャと開発規約

### Domain-Driven Design (DDD)
このプロジェクトは、`03_frontend_design_standalone.md`で定義されたDDDアーキテクチャを採用しています。

-   `libs/domains/`: ビジネスロジックとルールを持つ純粋なドメインモデル。
-   `libs/entities/`: APIのDTOとドメインモデル間の変換を担当。
-   `libs/repositories/`: データアクセスとAPI通信を抽象化する層。
-   `composables/`: UIロジック。リポジトリを使用してビジネスロジックを調整する。
-   `components/`, `pages/`: 表示に特化したプレゼンテーション層。

### テスト駆動開発 (TDD)
- **方針**: `04_test_design_standalone.md`に基づき、TDDを厳守します。
- **カバレッジ目標**: 85%以上。
- **依存性注入**: Composablesのテスト容易性を確保するため、リポジトリ等は引数で注入するパターンを確立しています (`report/DIARY01.md` Session 003参照)。

---

## 4. ビルドと実行コマンド

### 依存関係のインストール
```bash
pnpm install
```

### 開発サーバーの起動
```bash
pnpm dev
```

### ビルド
```bash
pnpm build
```

### ビルド成果物のプレビュー
```bash
pnpm preview
```

### Lintとフォーマット
```bash
# Lintチェック
pnpm lint

# Lint自動修正
pnpm lint:fix
```

### 型チェック
```bash
pnpm typecheck
```

### テスト
```bash
# 全ての単体テストを実行
pnpm test

# E2Eテストを実行
pnpm e2e
```