# セキュリティロボット強化学習システム - AI実装ガイド

## 🚨 セッション開始前の必須手順

**AI実装者は、実装作業を開始する前に必ず以下の手順を実行すること:**

### 1. 進捗ファイルの確認
```bash
# 現在の実装状況を確認
cat report/PROGRESS.md
```
- ✅ 何が実装済みか (現在: Phase 7完了, Phase 8開始中)
- 🔧 何がTODOとして残っているか
- 🚧 技術的課題・検討事項
- 📊 カバレッジ状況 (現在: 48.17%, 目標: 85%)

### 2. 最新セッション日記の確認
```bash
# 過去セッション総括の確認 (Session 001-015)
cat report/summary/DIARY01.md

# 最新セッション記録の確認 (Session 016以降)
cat report/DIARY02.md
```
- 前回のセッションで実施した作業
- 遭遇した問題と解決方法
- 次回への引き継ぎ事項
- **重要**: DIARY02.mdは逆時系列順（最新が上）

### 3. 設計書の参照
以下の設計書を参照しながら作業:
- `instructions/01_system_architecture_design_standalone.md` - システム全体設計
- `instructions/02_backend_api_design_standalone.md` - バックエンドAPI詳細
- `instructions/03_frontend_design_standalone.md` - フロントエンド設計
- `instructions/04_test_design_standalone.md` - テスト設計
- `instructions/05_infrastructure_deployment_standalone.md` - インフラ設計

### 4. セッション終了時の記録
作業完了後は**必ず**以下を実行:

#### 4.1 進捗ファイルの更新
```bash
# report/PROGRESS.md を編集
# - 実装済み機能に追加
# - TODOから完了項目を削除
# - テスト数・カバレッジを更新
# - 新たな課題があれば記録
```

#### 4.2 セッション日記の追記
```bash
# report/DIARY02.md の**最上部**に新しいセッションを追加
# - 目次も更新すること
# - 逆時系列順を維持 (最新が上)
# - 過去のエントリは編集しない
```

**DIARY02.md構造 (重要)**:
- 最新エントリを**上部**に配置 (逆時系列順)
- 目次の直後、前回セッションの**前**に挿入
- 過去のエントリは編集しない

---

## 🎯 このドキュメントの目的

このガイドは、AI開発アシスタント(Claude Code, GitHub Copilot等)を活用して、セキュリティロボット強化学習システムを段階的に実装するための詳細な指示書です。

**重要:** このドキュメントと親ディレクトリの設計書を組み合わせることで、リポジトリ知識なしでも完全な実装が可能です。

## 📚 前提知識

### 🔴 実装開始前の必須作業

**IMPORTANT**: 実装作業を開始する前に、必ず以下のファイルを読んでください:

1. **`../../report/PROGRESS.md`** - 現在の実装状況
   - 何が完了し、何がTODOかを把握
   - 既知の問題や課題を確認
   - 次のアクションアイテムを確認

2. **`../../report/summary/DIARY01.md`** - 開発セッション総括 (Session 001-015)
   - Phase 1-16の完了内容の総括
   - 確立された技術パターンの確認
   - 主要な課題と解決策の確認

3. **`../../report/DIARY02.md`** - 最新セッション履歴 (Session 016以降)
   - 過去のセッションで何を実施したかを確認
   - 学んだことや気づきを把握
   - 前回のセッションからの引き継ぎ事項を確認

4. **`../../CLAUDE.md`** - プロジェクト概要と進捗管理ワークフロー
   - プロジェクト全体の方針を理解
   - 進捗管理ファイルの運用方法を確認

### 必要な設計書
実装前に以下を熟読してください:
1. `../01_system_architecture_design_standalone.md` - システム全体設計
2. `../02_backend_api_design_standalone.md` - バックエンドAPI詳細
3. `../03_frontend_design_standalone.md` - フロントエンド設計(Nuxt v4 + Vue.js 3)
4. `../04_test_design_standalone.md` - テスト設計(pytest, Vitest, Playwright)
5. `../05_infrastructure_deployment_standalone.md` - インフラ・デプロイメント設計

### 技術要件
- Python 3.12+
- Node.js 20+
- pnpm 9.12.0 (パッケージマネージャー)
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

## 🏗️ 実装フェーズ

### Phase 1: 環境準備 (Day 1-2) ✅ **完了**

#### 1.1 フロントエンドリポジトリ初期化 ✅

```bash
# Nuxt v4プロジェクト初期化(pnpmを使用)
pnpm dlx nuxi@latest init . --packageManager pnpm

# 追加依存関係インストール(設計書 03_frontend_design_standalone.md 参照)
pnpm add @element-plus/nuxt@latest
pnpm add @pinia/nuxt@latest
pnpm add @vueuse/nuxt@latest
pnpm add chart.js vue-chartjs
pnpm add socket.io-client@^4.8
pnpm add axios@^1.7
pnpm add d3@^7.9

# 開発依存関係インストール
pnpm add -D @playwright/test@^1.49 vitest@^3.0
pnpm add -D @vue/test-utils happy-dom @vitest/coverage-v8
pnpm add -D @vitejs/plugin-vue  # ⚠️ 重要: Vueコンポーネントテストに必須
pnpm add -D eslint@^9.37 stylelint@^16.25 vue-tsc@^2.1
pnpm add -D sass@^1.83
```

**重要な注意事項**:
1. **@vitejs/plugin-vueは必須**: Vueコンポーネントテスト時に必要 (Session 007で追加)
2. **gitignore設定**: `.nuxt/tsconfig.json`をgit追跡対象にする必要あり (Session 008で解決)
   ```gitignore
   .nuxt/*
   !.nuxt/tsconfig.json
   ```
3. **初回準備コマンド**: `npx nuxi prepare`で`.nuxt/tsconfig.json`を生成

#### 1.2 バックエンドリポジトリ初期化 (未着手)

```bash
# バックエンドリポジトリ作成
mkdir security-robot-rl-backend
cd security-robot-rl-backend

# Python環境初期化
python -m venv venv
source venv/bin/activate  # Windowsの場合: venv\Scripts\activate

# 依存関係ファイル作成
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
redis==5.0.1
celery==5.3.4
python-multipart==0.0.6
websockets==12.0
torch==2.1.1
stable-baselines3==2.2.1
gymnasium==0.29.1
numpy==1.24.3
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
httpx==0.25.2
EOF

pip install -r requirements.txt
```

#### 1.2 Docker Compose環境構築

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
      POSTGRES_DB: ${DB_NAME:-security_robot_rl}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # バックエンド
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-password}@postgres:5432/${DB_NAME:-security_robot_rl}
      REDIS_URL: redis://redis:6379
      CELERY_BROKER_URL: redis://redis:6379
    volumes:
      - ./backend:/app
      - ./models:/app/models
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Celeryワーカー
  celery-worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    environment:
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-password}@postgres:5432/${DB_NAME:-security_robot_rl}
      CELERY_BROKER_URL: redis://redis:6379
    volumes:
      - ./backend:/app
      - ./models:/app/models
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: celery -A app.tasks.celery_app worker --loglevel=info --concurrency=2

  # フロントエンド
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      NUXT_PUBLIC_API_BASE_URL: http://localhost:8000
      NUXT_PUBLIC_WS_URL: ws://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
```

```dockerfile
# backend/Dockerfile.dev
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

```dockerfile
# frontend/Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
```

#### 1.3 環境変数設定

```bash
# backend/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/security_robot_rl
REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379
CELERY_RESULT_BACKEND=redis://localhost:6379

MODELS_DIR=./models
LOGS_DIR=./logs
CHECKPOINTS_DIR=./checkpoints

# CORS設定
CORS_ORIGINS=["http://localhost:3000"]
```

```bash
# frontend/.env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000
NUXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Phase 2: バックエンド基盤実装 (Day 3-5)

#### 2.1 ディレクトリ構造作成

```bash
cd backend
mkdir -p app/{core,api/{endpoints,websocket},services,models,ml/{environments,training,utils},tasks,utils}
mkdir -p tests/{api,services,ml}
mkdir -p migrations/versions
touch app/__init__.py
touch app/core/__init__.py
touch app/api/__init__.py
```

#### 2.2 設定管理実装

```python
# app/core/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """アプリケーション設定"""

    # API設定
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_PREFIX: str = "/api/v1"

    # データベース
    DATABASE_URL: str

    # Redis
    REDIS_URL: str

    # Celery
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # ディレクトリ
    MODELS_DIR: str = "./models"
    LOGS_DIR: str = "./logs"
    CHECKPOINTS_DIR: str = "./checkpoints"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

#### 2.3 データベース接続実装

```python
# app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# エンジン作成
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # 接続テスト
    echo=False  # 本番ではFalse
)

# セッションファクトリ
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ベースクラス
Base = declarative_base()

# 依存性注入用
def get_db():
    """データベースセッション提供"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 2.4 データベースモデル実装

設計書(`02_backend_api_design_standalone.md`の3.2節)のSQLAlchemyモデルをそのまま実装してください。

```python
# app/models/database.py
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class TrainingSession(Base):
    """学習セッションモデル"""
    __tablename__ = "training_sessions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    algorithm = Column(String(10), nullable=False)
    environment_type = Column(String(20), nullable=False)
    status = Column(String(20), default="created")

    # ... (設計書の完全なモデル定義を使用)

    # テーブル制約
    __table_args__ = (
        CheckConstraint("algorithm IN ('ppo', 'a3c')", name="check_algorithm"),
        CheckConstraint("environment_type IN ('standard', 'enhanced')", name="check_environment_type"),
        CheckConstraint("status IN ('created', 'running', 'paused', 'completed', 'failed')", name="check_status"),
    )
```

#### 2.5 Alembicマイグレーション初期化

```bash
# Alembic初期化
alembic init migrations

# alembic.ini編集
# sqlalchemy.url = postgresql://postgres:password@localhost:5432/security_robot_rl

# migrations/env.py編集
from app.models.database import Base
target_metadata = Base.metadata

# 初回マイグレーション作成
alembic revision --autogenerate -m "Initial schema"

# マイグレーション実行
alembic upgrade head
```

### Phase 3: API実装 (Day 6-8)

#### 3.1 FastAPIアプリケーション初期化

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import training, environment, models, playback
import logging

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# FastAPIアプリケーション
app = FastAPI(
    title="セキュリティロボット強化学習API",
    description="PPO/A3C学習制御・リアルタイム可視化API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ルーター登録
app.include_router(training.router, prefix=f"{settings.API_PREFIX}/training", tags=["training"])
app.include_router(environment.router, prefix=f"{settings.API_PREFIX}/environment", tags=["environment"])
app.include_router(models.router, prefix=f"{settings.API_PREFIX}/models", tags=["models"])
app.include_router(playback.router, prefix=f"{settings.API_PREFIX}/playback", tags=["playback"])

# ヘルスチェック
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "security-robot-rl-backend"}

# 起動イベント
@app.on_event("startup")
async def startup_event():
    logger.info("Starting Security Robot RL Backend API")
    # データベース接続確認等

# 終了イベント
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Security Robot RL Backend API")
```

#### 3.2 Pydanticスキーマ実装

設計書(`02_backend_api_design_standalone.md`の3.3節)のPydanticスキーマをそのまま実装してください。

```python
# app/models/schemas.py
from pydantic import BaseModel, Field, validator
from typing import Optional, Literal, Dict, Any, List
from datetime import datetime

class TrainingSessionCreate(BaseModel):
    """学習セッション作成リクエスト"""
    # ... (設計書の完全なスキーマ定義を使用)
```

#### 3.3 APIエンドポイント実装

設計書(`02_backend_api_design_standalone.md`の4章)のAPIエンドポイントをそのまま実装してください。

```python
# app/api/endpoints/training.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.schemas import TrainingSessionCreate, TrainingSessionResponse, TrainingMetricsResponse
from app.services.training_service import TrainingService

router = APIRouter()

@router.post("/start", response_model=TrainingSessionResponse, status_code=202)
async def start_training(
    config: TrainingSessionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # ... (設計書の完全な実装を使用)
```

### Phase 4: WebSocket・Celery実装 (Day 9-10)

設計書(`02_backend_api_design_standalone.md`の4.2節および6章)のWebSocket・Celery実装をそのまま実装してください。

### Phase 5: フロントエンド実装 (Day 11-17) 🚧 **進行中**

**現在の進捗**: Phase 7完了 (Composables層92.47%), Phase 8開始 (Components層21%)

設計書(`03_frontend_design_standalone.md`)のアーキテクチャとコンポーネント定義をそのまま実装してください。

#### 5.1 Nuxt設定 ✅ **完了**

```typescript
// nuxt.config.ts (設計書 3.1節参照)
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },
  ssr: false, // SPA mode

  css: ['~/assets/css/main.css'],

  modules: [
    '@element-plus/nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:8000'
    }
  },

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/variables" as *;'
        }
      }
    }
  },

  compatibilityDate: '2025-01-01'
})
```

#### 5.2 DDD構造実装 ✅ **完了**

設計書(`03_frontend_design_standalone.md`の2.1節)のディレクトリ構造に従ってください:

```
frontend/
├── configs/
│   ├── api.ts              # ✅ APIエンドポイント定義完了
│   └── constants.ts        # ✅ 定数定義完了
├── libs/
│   ├── domains/            # ✅ ドメインモデル(Training, Environment等)
│   ├── repositories/       # ✅ データアクセス層(API呼び出し)
│   ├── entities/           # ✅ DTO変換
│   └── utils/              # ユーティリティ
├── composables/            # ✅ Phase 7完了 (92.47%カバレッジ)
│   ├── useTraining.ts      # ✅ 95.94%カバレッジ
│   ├── useEnvironment.ts   # ✅ 100%カバレッジ
│   ├── useWebSocket.ts     # ✅ 83.33%カバレッジ
│   ├── usePlayback.ts      # ✅ 100%カバレッジ
│   └── useChart.ts         # ✅ 86.66%カバレッジ
├── stores/                 # ⚠️ 未テスト (0%カバレッジ)
├── components/             # 🚧 Phase 8進行中 (4/19完了)
│   ├── common/             # 🚧 4コンポーネント完了
│   │   ├── ErrorAlert.vue      # ✅ 100%カバレッジ (5テスト)
│   │   ├── LoadingSpinner.vue  # ✅ 100%カバレッジ (5テスト)
│   │   ├── AppHeader.vue       # ✅ 100%カバレッジ (5テスト)
│   │   └── AppSidebar.vue      # ✅ 100%カバレッジ (5テスト)
│   ├── training/           # 未着手
│   ├── visualization/      # 未着手
│   └── playback/          # 未着手
├── pages/                  # ⚠️ 未テスト (0%カバレッジ)
├── assets/
│   └── styles/            # SCSS/BEM記法スタイル
└── tests/                 # ✅ Vitest単体テスト (103テスト, 48.17%カバレッジ)
```

**実装済みレイヤー**:
- ✅ **Phase 4: Domain層** (Training: 84-100%, Environment: 94.02%)
- ✅ **Phase 5: Entity層** (100%カバレッジ)
- ✅ **Phase 6: Repository層** (80.7%カバレッジ)
- ✅ **Phase 7: Composables層** (92.47%カバレッジ) 🏆
- 🚧 **Phase 8: Components層** (21%完了, 4/19コンポーネント)

#### 5.3 主要コンポーネント実装

設計書(`03_frontend_design_standalone.md`の3.2節)に定義された以下のコンポーネントを実装:

**学習制御UI**:
- `TrainingConfigForm.vue` - 学習パラメータ設定
- `TrainingControlPanel.vue` - 開始/停止/一時停止
- `TrainingStatusDisplay.vue` - リアルタイムステータス

**可視化UI**:
- `RewardChart.vue` - Chart.js報酬グラフ
- `EnvironmentHeatmap.vue` - D3.js環境ヒートマップ
- `MetricsTable.vue` - Element Plus統計テーブル

**プレイバック機能**:
- `PlaybackPlayer.vue` - エピソード再生
- `PlaybackTimeline.vue` - タイムライン操作

```typescript
// configs/api.ts
const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  training: {
    start: `${API_BASE_URL}/api/v1/training/start`,
    stop: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/stop`,
    pause: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/pause`,
    resume: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/resume`,
    status: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/status`,
    metrics: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/metrics`,
    list: `${API_BASE_URL}/api/v1/training/sessions`
  },
  models: {
    list: `${API_BASE_URL}/api/v1/models`,
    download: (id: number) => `${API_BASE_URL}/api/v1/models/${id}/download`
  },
  playback: {
    list: `${API_BASE_URL}/api/v1/playback`,
    get: (id: number) => `${API_BASE_URL}/api/v1/playback/${id}`
  },
  websocket: `${API_BASE_URL.replace('http', 'ws')}/ws/training`
} as const
```

### Phase 6: テスト実装 (Day 18-20) 🚧 **進行中**

**現在の状況**: フロントエンドテスト実装中 (48.17%カバレッジ, 目標: 85%)

設計書(`04_test_design_standalone.md`)のテスト戦略とカバレッジ目標に従って実装してください。

#### 6.1 フロントエンドテスト実装の学び (Session 001-008より)

**重要な依存性注入パターン** (Session 003-006で確立):
```typescript
// ❌ 悪い例: モックが効かない
export const useExample = () => {
  const repository = new ExampleRepositoryImpl()  // テスト時にモック不可
  // ...
}

// ✅ 良い例: 依存性注入でモック可能
export const useExample = (
  repository: ExampleRepository = new ExampleRepositoryImpl()
) => {
  // テスト時はモックRepositoryを注入可能
}
```

**Vitestコンポーネントテスト設定** (Session 007で解決):
```typescript
// vitest.config.ts
import vue from '@vitejs/plugin-vue'  // 必須！

export default defineConfig({
  plugins: [vue()],  // Vueコンポーネントテストに必要
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85
      }
    }
  }
})
```

**Vueコンポーネントテストパターン** (Session 007-008で確立):
```typescript
// tests/unit/components/example.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExampleComponent from '~/components/example.vue'

// ヘルパー関数で一貫性確保
const mountComponent = (props = {}, slots = {}) => {
  return mount(ExampleComponent, {
    props,
    slots,
    global: {
      stubs: {
        // Element Plus等の外部コンポーネントをstub化
      }
    }
  })
}

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.example-class').exists()).toBe(true)
  })

  it('handles slot content', () => {
    const wrapper = mountComponent({}, {
      default: '<div class="slot-content">Test</div>'
    })
    expect(wrapper.find('.slot-content').text()).toBe('Test')
  })
})
```

**現在のテスト実績**:
- 総テスト数: 103テスト (100%パス)
- カバレッジ: 48.17%
- Domain層: 84-100%カバレッジ
- Composables層: 92.47%カバレッジ 🏆
- Components層: 4/19完了 (各100%カバレッジ)

#### 6.2 バックエンドテスト (カバレッジ目標: 90%以上) - 未着手

```python
# tests/conftest.py (設計書 2.1節参照)
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.main import app
from fastapi.testclient import TestClient

# テスト用DB
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)
```

```python
# tests/api/test_training.py (設計書 2.2節参照)
def test_start_training(client):
    """学習セッション開始API統合テスト"""
    response = client.post("/api/v1/training/start", json={
        "name": "Test PPO",
        "algorithm": "ppo",
        "environment_type": "standard",
        "total_timesteps": 1000,
        "env_width": 8,
        "env_height": 8
    })
    assert response.status_code == 202
    data = response.json()
    assert data["name"] == "Test PPO"
    assert data["algorithm"] == "ppo"
    assert data["status"] == "created"

def test_get_training_metrics(client):
    """学習メトリクス取得APIテスト"""
    # 設計書の4.2.2節 統合テストシナリオを参照
    pass
```

設計書(`04_test_design_standalone.md`の2章)に定義された以下のテストカテゴリを実装:
- 単体テスト(環境、学習ロジック、API)
- 統合テスト(API統合、WebSocket通信、Celeryタスク)
- E2Eテスト(学習フロー、プレイバック)

#### 6.2 フロントエンドテスト (カバレッジ目標: 85%以上)

```typescript
// tests/unit/composables/useTraining.spec.ts (設計書 3.2節参照)
import { describe, it, expect, vi } from 'vitest'
import { useTraining } from '~/composables/useTraining'

describe('useTraining', () => {
  it('should start training session', async () => {
    const { startTraining } = useTraining()

    const config = {
      name: 'Test Session',
      algorithm: 'ppo',
      total_timesteps: 1000
    }

    const session = await startTraining(config)
    expect(session.name).toBe('Test Session')
  })

  it('should handle WebSocket updates', async () => {
    // 設計書の3.2.2節 WebSocket通信テストを参照
  })
})
```

```typescript
// tests/e2e/training-workflow.spec.ts (設計書 3.3節参照)
import { test, expect } from '@playwright/test'

test('complete training workflow', async ({ page }) => {
  // 1. 学習設定
  await page.goto('http://localhost:3000')
  await page.fill('[data-testid="training-name"]', 'E2E Test Training')
  await page.selectOption('[data-testid="algorithm"]', 'ppo')

  // 2. 学習開始
  await page.click('[data-testid="start-training"]')
  await expect(page.locator('[data-testid="status"]')).toHaveText('running')

  // 3. リアルタイム更新確認
  await expect(page.locator('[data-testid="episode-count"]')).not.toHaveText('0')

  // 4. 学習停止
  await page.click('[data-testid="stop-training"]')
  await expect(page.locator('[data-testid="status"]')).toHaveText('completed')
})
```

設計書(`04_test_design_standalone.md`の3章)に定義された以下のテストを実装:
- 単体テスト(Composables, Stores, Components)
- E2Eテスト(Playwright: 学習ワークフロー、可視化、プレイバック)

### Phase 7: デプロイメント (Day 21-22)

設計書(`05_infrastructure_deployment_standalone.md`)のインフラ構成と運用手順に従ってください。

#### 7.1 本番環境起動

```bash
# Docker Compose本番環境起動 (設計書 2.1節参照)
docker-compose -f docker-compose.prod.yml up -d

# データベースマイグレーション
docker-compose exec backend alembic upgrade head

# ヘルスチェック
curl http://localhost:8000/health
curl http://localhost:3000

# ログ確認
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f celery-worker
```

#### 7.2 モニタリング設定

設計書(`05_infrastructure_deployment_standalone.md`の4章)のモニタリング戦略を参照:

```bash
# Prometheus起動
docker-compose exec prometheus

# Grafanaダッシュボードアクセス
# http://localhost:3001

# ログ集約(Loki)
docker-compose exec loki
```

#### 7.3 バックアップ・リカバリ

設計書(`05_infrastructure_deployment_standalone.md`の5章)のバックアップ戦略を参照:

```bash
# PostgreSQLバックアップ
docker-compose exec postgres pg_dump -U postgres security_robot_rl > backup.sql

# モデルファイルバックアップ
tar -czf models_backup.tar.gz ./models

# リストア
docker-compose exec -T postgres psql -U postgres security_robot_rl < backup.sql
```

## ✅ 実装チェックリスト

### Phase 1-2: 環境準備・バックエンド基盤
- [x] **フロントエンド環境準備完了** ✅
  - [x] pnpm 9.12.0インストール確認
  - [x] Nuxt v4プロジェクト初期化成功
  - [x] TypeScript strict mode有効化
  - [x] @vitejs/plugin-vue設定完了 (Vueコンポーネントテスト対応)
  - [x] .nuxt/tsconfig.json Git追跡設定完了
- [ ] **バックエンド環境準備** (未着手)
  - [ ] Python 3.12+ 仮想環境作成
  - [ ] FastAPIアプリケーション起動確認
  - [ ] PostgreSQL 15接続成功
  - [ ] Redis 7接続成功
  - [ ] データベースマイグレーション成功(Alembic)
  - [ ] 設計書01, 02のモデル定義完全実装

### Phase 3-4: API・非同期処理 (バックエンド - 未着手)
- [ ] APIエンドポイント動作確認(Swagger UI: http://localhost:8000/docs)
- [ ] WebSocket接続テスト(設計書02の4.2節)
- [ ] Celeryワーカー起動確認
- [ ] Celeryタスク実行確認(学習ジョブ)
- [ ] バックエンド単体テスト90%以上カバレッジ(pytest-cov)

### Phase 5: フロントエンド実装
- [x] **DDD構造実装完了** ✅
  - [x] configs/ (api.ts, constants.ts)
  - [x] libs/domains/ (Training, Environment等)
  - [x] libs/repositories/ (RepositoryImpl)
  - [x] libs/entities/ (Entity層)
- [x] **Phase 7: Composables層完了** ✅ (92.47%カバレッジ)
  - [x] useTraining (95.94%カバレッジ, 7テスト)
  - [x] useEnvironment (100%カバレッジ, 6テスト)
  - [x] useWebSocket (83.33%カバレッジ, 11テスト)
  - [x] usePlayback (100%カバレッジ, 7テスト)
  - [x] useChart (86.66%カバレッジ, 7テスト)
- [ ] **Phase 8: Components層** 🚧 (4/19完了, 21%)
  - [x] common/ErrorAlert.vue (100%カバレッジ, 5テスト)
  - [x] common/LoadingSpinner.vue (100%カバレッジ, 5テスト)
  - [x] common/AppHeader.vue (100%カバレッジ, 5テスト)
  - [x] common/AppSidebar.vue (100%カバレッジ, 5テスト)
  - [ ] training/ (0/4コンポーネント)
  - [ ] environment/ (0/4コンポーネント)
  - [ ] visualization/ (0/4コンポーネント)
  - [ ] playback/ (0/3コンポーネント)
- [ ] **Phase 9: Pages層** (0/11ページ)
- [ ] **Phase 10: Stores層** (0/6ストア)
- [ ] Chart.js/D3.js可視化コンポーネント動作確認
- [ ] API通信確認(axios)
- [ ] WebSocketリアルタイム更新確認(Socket.IO)

### Phase 6: テスト
- [x] **フロントエンド単体テスト** 🚧 (48.17%カバレッジ, 目標: 85%)
  - [x] Domain層テスト (84-100%カバレッジ)
  - [x] Composables層テスト (92.47%カバレッジ) 🏆
  - [x] Components層テスト開始 (4/19完了)
  - [x] テスト実行速度: 640ms (目標: 2分以内) ✅
  - [ ] カバレッジ85%到達
- [ ] バックエンド単体テスト: 90%以上カバレッジ(設計書04の2.1節)
- [ ] バックエンド統合テスト: 主要データフロー100%(設計書04の2.2節)
- [ ] E2Eテスト(Playwright): クリティカルパス10個以上(設計書04の3.3節)

### Phase 7: デプロイメント・統合
- [ ] Docker Compose全サービス起動(設計書05の2.1節)
- [ ] Nginx リバースプロキシ設定(設計書05の2.2節)
- [ ] 学習セッション作成→実行→完了のフロー確認
- [ ] リアルタイム可視化動作確認
- [ ] Prometheusメトリクス収集確認(設計書05の4章)
- [ ] Grafanaダッシュボード表示確認
- [ ] バックアップ・リカバリ手順確認(設計書05の5章)

### 最終確認
- [ ] 全5つの設計書との整合性確認
- [ ] リポジトリ分断後の独立動作確認
- [ ] ドキュメント整備(README.md, API仕様書)
- [ ] コード品質チェック(ESLint, Black, type hints)

## 🎓 実装のベストプラクティス

### 1. 設計書優先アプローチ
**必ず設計書を先に読んでから実装してください**:
- `01_system_architecture_design_standalone.md` - 全体像理解
- `02_backend_api_design_standalone.md` - API詳細設計
- `03_frontend_design_standalone.md` - フロントエンド設計
- `04_test_design_standalone.md` - テスト戦略
- `05_infrastructure_deployment_standalone.md` - インフラ設計

### 2. 段階的実装
一度にすべてを実装せず、**Phase単位で動作確認**しながら進めてください:
1. Phase完了時に動作確認
2. 次Phaseへ進む前にチェックリスト確認
3. 問題があれば設計書で詳細確認

### 3. テスト駆動開発(TDD) - **厳守** 🚨
**Session 001-008で確立したTDDプロセス**:

#### 3.1 Red-Green-Refactorサイクル
```bash
# 1. Red: テストファースト (必ず失敗を確認)
pnpm test tests/unit/path/to/new.spec.ts  # 失敗することを確認

# 2. Green: 最小限の実装でテストを通す
# コードを実装してテストをパスさせる
pnpm test tests/unit/path/to/new.spec.ts  # 成功を確認

# 3. Refactor: コードをきれいにする (任意)
# テストが通った状態でリファクタリング
```

#### 3.2 依存性注入パターン (重要！)
**Composables実装時の必須パターン** (Session 003-006で確立):
```typescript
// ✅ 正しいパターン: モック可能
export const useExample = (
  repository: ExampleRepository = new ExampleRepositoryImpl()
) => {
  // テスト時はモックを注入可能
}

// ❌ 間違いパターン: モック不可
export const useExample = () => {
  const repository = new ExampleRepositoryImpl()  // モック不可！
}
```

#### 3.3 カバレッジ目標
- **バックエンド**: pytest-cov で90%以上カバレッジ
- **フロントエンド**: Vitest で85%以上カバレッジ
  - Domain層: 85%以上 ✅ (達成済み: 84-100%)
  - Composables層: 85%以上 ✅ (達成済み: 92.47%)
  - Components層: 85%以上 🚧 (進行中)
- **E2E**: Playwright でクリティカルパス網羅

### 4. コード品質管理
- **TypeScript**: strict mode有効化、型安全性確保
- **Python**: type hints必須、Black自動フォーマット
- **Linter**: ESLint 9.37+, Stylelint 16.25+適用
- **コミット前**: 必ずテスト実行、カバレッジ確認

### 5. 設計書との整合性維持
実装時に以下を常に確認:
- モデル定義が設計書と一致しているか
- APIエンドポイント仕様が設計書通りか
- コンポーネント構造がDDD設計に従っているか
- テストカバレッジが目標値を満たしているか

### 6. リポジトリ分断対応
このガイドと5つの設計書があれば、**現在のリポジトリ知識なしで完全実装可能**です:
- 設計書は自己完結型(standalone)
- すべての技術仕様・データモデル・API定義を含む
- コード例とテストケースが完備

### 7. よくある問題と解決策 (Session 001-008より)

#### 問題1: Composablesでモックが効かない
**原因**: Composable内でRepositoryを直接インスタンス化
**解決**: 依存性注入パターンを使用 (上記3.2参照)

#### 問題2: Vueコンポーネントテストでエラー
**原因**: @vitejs/plugin-vueが未設定
**解決**: vitest.config.tsに`plugins: [vue()]`を追加

#### 問題3: .nuxt/tsconfig.jsonが見つからない
**原因**: .nuxt/ディレクトリ全体がgitignore対象
**解決**:
```gitignore
.nuxt/*
!.nuxt/tsconfig.json
```
その後、`npx nuxi prepare`を実行

## 📋 実装完了基準

以下をすべて満たした時点で実装完了とみなします:

### フロントエンド (現在の進捗)
1. [ ] **Phase 1-2: 環境準備** ✅ 完了
2. [ ] **Phase 7: Composables層** ✅ 完了 (92.47%カバレッジ)
3. [ ] **Phase 8: Components層** 🚧 進行中 (4/19完了, 21%)
4. [ ] **Phase 9: Pages層** (未着手)
5. [ ] **Phase 10: Stores層** (未着手)
6. [ ] **フロントエンドカバレッジ85%以上** (現在: 48.17%)
7. [ ] **E2Eテスト10個以上成功** (Playwright)

### バックエンド (未着手)
1. [ ] **Phase 1-2: 環境準備・基盤構築**
2. [ ] **Phase 3-4: API・非同期処理実装**
3. [ ] **バックエンドカバレッジ90%以上** (pytest-cov)
4. [ ] **統合テスト完了**

### 統合・デプロイメント
1. [ ] **Phase 7: デプロイメント**
   - [ ] Docker Compose全サービス正常起動
   - [ ] Nginx リバースプロキシ設定
   - [ ] Prometheusメトリクス収集確認
   - [ ] Grafanaダッシュボード表示確認
2. [ ] **学習→可視化→プレイバックの完全フロー動作確認**
3. [ ] **5つの設計書との整合性100%**

### 現在の到達点 (2025-10-08時点)
- ✅ フロントエンド環境準備完了
- ✅ DDD構造実装完了
- ✅ Domain層完成 (84-100%カバレッジ)
- ✅ Composables層完成 (92.47%カバレッジ) 🏆
- 🚧 Components層開始 (4/19完了)
- 📊 総テスト数: 103テスト (100%パス)
- 📊 カバレッジ: 48.17% (目標: 85%)

このガイドと設計書を組み合わせることで、**リポジトリ知識なしで完全なシステムを実装できます**。

---

## 📈 現在のプロジェクト状況 (2025-10-08更新)

### Session 001-008の成果サマリー

**実装済みPhase**:
- ✅ **Phase 1-2: 環境準備** - Nuxt v4, pnpm, Vitest, DDD構造完成
- ✅ **Phase 4: Domain層** - Training/Environment完全実装 (84-100%カバレッジ)
- ✅ **Phase 5: Entity層** - DTO変換完成 (100%カバレッジ)
- ✅ **Phase 6: Repository層** - API通信層完成 (80.7%カバレッジ)
- ✅ **Phase 7: Composables層** - ビジネスロジック完成 (92.47%カバレッジ) 🏆
- 🚧 **Phase 8: Components層** - UI層開始 (4/19完了, 21%)

**テスト実績**:
```
Total Tests:    103 passed (100%)
Test Duration:  ~640ms
Coverage:       48.17% (Lines)
                77.23% (Functions)
                76.32% (Branches)
                48.17% (Statements)
```

**カバレッジ進捗**:
- 初期値: 26.99%
- 現在値: 48.17%
- 改善: +21.18ポイント
- 目標: 85% (残り: 36.83ポイント)

**主要な技術的解決**:
1. **依存性注入パターン確立** (Session 003) - Composablesのモック問題解決
2. **Vitest Vue設定** (Session 007) - @vitejs/plugin-vue導入
3. **tsconfig.json追跡** (Session 008) - gitignore設定修正

**次のマイルストーン**:
- Components層完成 (残り15コンポーネント)
- カバレッジ60%到達
- Pages層・Stores層のテスト実装開始

---

## 📊 進捗管理ファイル

実装作業中は、以下のファイルで進捗を管理してください:

### PROGRESS.md の構造
- **目次とアンカーリンク**: 上部に配置し、各セクションへ移動可能に
- **フェーズごとにセクション作成**: アンカーリンクで移動可能
- **状態管理**: 完了/進行中/未着手の状態を明確に管理
- **自由に編集可能**: 現在の状態を反映するよう随時更新
- **マシン固有の情報**: 環境構築に関する情報は、マシン固有のものを含めないか、明確に区別する

### DIARY02.md の構造 (Session 016以降)
- **最新エントリを上部に配置** (逆時系列順)
- **目次とアンカーリンク**: 上部に配置
- **新しいセッション**: 目次の直後、前回セッションの前に挿入
- **過去のエントリは編集しない**: 新しいエントリのみ追記
- **マシン固有の情報**: 環境構築に関する情報は、マシン固有のものを含めないか、明確に区別する
- **注意**: Session 001-015は`DIARY01.md`に記録済み。総括は`summary/DIARY01.md`を参照。

**DIARY02.md 構造例:**
```markdown
# Development Diary

## 📑 Table of Contents
- [2025-10-07 - Session 3: Latest Work](#session-3-anchor)
- [2025-10-06 - Session 2: Previous Work](#session-2-anchor)
- [2025-10-06 - Session 1: Initial Work](#session-1-anchor)

---

## 2025-10-07 - Session 3: Latest Work
[Latest session content here]

---

## 2025-10-06 - Session 2: Previous Work
[Previous session content here]

---

## 2025-10-06 - Session 1: Initial Work
[First session content here]
```

### 環境構築と進捗管理の注意点
- **環境構築は複数マシン・サーバで実施される可能性がある**
- マシン固有の情報（ローカルパス、IP、ホスト名など）は進捗ファイルに含めない
- または、マシン固有の情報を記載する場合は、セクションを分けて明確に区別する
- 汎用的な手順や完了状態のみを記録する

詳細は `../../CLAUDE.md` を参照してください。
