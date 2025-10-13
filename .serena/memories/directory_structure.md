# ディレクトリ構造

## 概要
Nuxt 4 + Vue 3プロジェクト構造（DDD採用）

```
security-robot-fe/
├── configs/              # 設定層
│   ├── api.ts           # APIエンドポイント定義
│   ├── constants.ts     # 定数
│   └── environment.ts   # 環境変数
│
├── libs/                # DDDコアレイヤー
│   ├── domains/         # ドメイン層（ビジネスロジック）
│   │   ├── training/    # 学習関連
│   │   ├── environment/ # 環境関連
│   │   ├── playback/    # プレイバック関連
│   │   └── model/       # モデル関連
│   ├── entities/        # エンティティ層（DTO変換）
│   │   ├── training/
│   │   ├── environment/
│   │   └── model/
│   └── repositories/    # リポジトリ層（データアクセス）
│       ├── training/
│       ├── environment/
│       ├── playback/
│       └── model/
│
├── components/          # プレゼンテーション層
│   ├── common/          # 共通コンポーネント
│   ├── training/        # 学習UI
│   ├── environment/     # 環境UI
│   ├── visualization/   # チャート
│   └── playback/        # プレイバック
│
├── composables/         # アプリケーション層
│   ├── useWebSocket.ts  # WebSocket管理
│   ├── useTraining.ts   # 学習管理
│   ├── useEnvironment.ts # 環境管理
│   ├── usePlayback.ts   # プレイバック管理
│   └── useChart.ts      # チャート管理
│
├── layouts/             # レイアウト
│   ├── default.vue
│   └── fullscreen.vue
│
├── pages/               # ページコンポーネント（自動ルーティング）
│   ├── index.vue        # ダッシュボード
│   ├── training/        # 学習ページ
│   ├── playback/        # プレイバック
│   ├── models/          # モデル管理
│   └── settings/        # 設定
│
├── stores/              # グローバル状態管理（Pinia）
│   ├── ui.ts
│   ├── training.ts
│   ├── environment.ts
│   ├── playback.ts
│   ├── websocket.ts
│   └── models.ts
│
├── types/               # 型定義
│   ├── api.ts
│   ├── training.ts
│   ├── environment.ts
│   └── websocket.ts
│
├── utils/               # ユーティリティ
│   ├── constants.ts
│   ├── formatters.ts
│   └── validators.ts
│
├── plugins/             # プラグイン
│   ├── element-plus.client.ts
│   ├── chart.client.ts
│   └── socket.client.ts
│
├── tests/               # テスト
│   ├── unit/            # 単体テスト（Vitest）
│   ├── e2e/             # E2Eテスト（Playwright）
│   └── setup.ts         # テスト初期設定
│
├── report/              # プロジェクト記録
│   ├── PROGRESS.md      # 進捗管理
│   ├── DIARY01.md       # Session 1-15記録
│   └── DIARY02.md       # Session 16以降記録
│
├── instructions/        # 設計書・プロンプト
│   ├── 01_system_architecture_design_standalone.md
│   ├── 02_backend_api_design_standalone.md
│   ├── 03_frontend_design_standalone.md
│   ├── 04_test_design_standalone.md
│   └── prompts/         # 実装プロンプト
│
├── assets/              # 静的アセット
│   └── css/
│       └── main.scss
│
├── nuxt.config.ts       # Nuxt設定
├── vitest.config.ts     # Vitest設定
├── tsconfig.json        # TypeScript設定
├── eslint.config.mjs    # ESLint設定
├── stylelint.config.mjs # Stylelint設定
└── package.json         # 依存関係
```

## レイヤーごとの責務

### configs/
- APIエンドポイントURL一元管理
- 定数定義
- 環境変数アクセス

### libs/domains/
- ビジネスロジック
- ドメインモデル定義
- **外部依存なし**（純粋関数）

### libs/repositories/
- データアクセス抽象化
- インターフェース + 実装分離
- API通信実装

### composables/
- Repositoryを使用
- ビジネスロジック調整
- **直接$fetch禁止**

### components/
- UIコンポーネント（表示のみ）
- ロジックはcomposables/storesに委譲
- **薄いコンポーネント**

### stores/
- グローバル状態管理（Pinia）
- Composables経由でロジック実行

### pages/
- ページコンポーネント
- 自動ルーティング
- Composables/Stores使用

## 重要なファイル

### 設定ファイル
- `nuxt.config.ts`: Nuxt設定（SPA mode, modules等）
- `vitest.config.ts`: テスト設定（coverage閾値85%）
- `tsconfig.json`: TypeScript設定（strict mode）
- `eslint.config.mjs`: Lint設定（import順序等）

### ドキュメント
- `report/PROGRESS.md`: 最新の進捗状況
- `report/DIARY02.md`: Session 16以降の記録
- `instructions/03_frontend_design_standalone.md`: フロントエンド設計書
- `instructions/04_test_design_standalone.md`: テスト設計書

### エントリーポイント
- `app.vue`: ルートコンポーネント
- `pages/index.vue`: ダッシュボード
