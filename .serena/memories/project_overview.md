# プロジェクト概要

## プロジェクト名
Security Robot RL Frontend - セキュリティロボット強化学習システム フロントエンド

## プロジェクト目的
セキュリティロボットの強化学習トレーニングを管理・可視化するWebフロントエンドアプリケーション。
Nuxt 4 + Vue 3 + TypeScriptで構築されたSPAで、以下の機能を提供:
- 学習セッションの作成・管理・監視
- リアルタイム学習進捗表示（WebSocket経由）
- 環境状態の可視化（ロボット位置、脅威マップ、カバレッジマップ）
- 学習済みモデルの管理（アップロード/ダウンロード）
- プレイバック機能（過去の学習セッション再生）
- メトリクス可視化（Report, Loss, Coverage, Exploration）

## 技術スタック

### コアフレームワーク
- **Vue.js**: ^3.5 (Composition API, Script Setup)
- **Nuxt**: ^4.1 (SPA mode, Auto-import)
- **TypeScript**: ^5.7 (strict mode)

### UIフレームワーク
- **Element Plus**: ^1.0 (エンタープライズグレードUIコンポーネント)
- **Nuxt UI**: ^4.0
- **SCSS**: ^1.83
- **BEM記法**: CSS命名規則

### 状態管理・通信
- **Pinia**: ^3.0 (Vue 3公式状態管理)
- **axios**: ^1.7
- **Native WebSocket**: リアルタイム通信（Socket.IOからマイグレーション完了）

### 可視化
- **Chart.js**: ^4.5
- **vue-chartjs**: ^5.3
- **D3.js**: ^7.9

### テスト・品質管理
- **Vitest**: ^3.0 (単体テスト)
- **Playwright**: ^1.49 (E2Eテスト)
- **ESLint**: ^9.37
- **Stylelint**: ^16.25
- **vue-tsc**: ^2.1

### パッケージマネージャー
- **pnpm**: 9.12.0

## アーキテクチャパターン
DDD (Domain-Driven Design) 採用

```
Presentation Layer (Components/Pages)
    ↓
Application Layer (Composables)
    ↓
Domain Layer (libs/domains)
    ↓
Infrastructure Layer (libs/repositories)
    ↓
External API (FastAPI Backend)
```

## 開発状況
- **Phase 1-21完了** (Session 021時点)
- **テスト**: 292 tests passing (100%)
- **カバレッジ**: 68.99% (実質的に全テスト可能コードの100%)
- **ビルド**: ✅ 1.97 MB production bundle
- **Lint**: ✅ 0 errors, 45 warnings (acceptable)
