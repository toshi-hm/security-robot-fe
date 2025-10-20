# セキュリティロボット強化学習システム - セットアップ手順

## 現在の状況 (2025-10-21)

### ✅ 起動済みサービス

1. **バックエンドAPI**
   - URL: http://127.0.0.1:8000
   - ステータス: 正常稼働中
   - API Docs: http://127.0.0.1:8000/docs

2. **フロントエンド**
   - URL: http://localhost:3000
   - ステータス: 正常稼働中

### ✅ 動作確認済み機能

- Health Check API
- Training Sessions List API (GET)
- Environment Definitions API (GET)
- フロントエンドUI表示

### ⚠️ 学習セッション開始に必要な追加セットアップ

学習セッションを実際に作成・実行するには、以下が必要です:

#### 1. Redis のインストールと起動

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install redis-server

# または Docker で起動
docker run -d -p 6379:6379 redis:latest
```

#### 2. Celery Worker の起動

バックエンドディレクトリで:

```bash
cd /home/maya/work/security-robot-be
source .venv/bin/activate

# または uv を使用
/home/maya/.local/bin/uv run celery -A app.tasks.celery_app worker --loglevel=info
```

### 🚀 完全なセットアップ手順

#### バックエンド起動

```bash
cd /home/maya/work/security-robot-be
/home/maya/.local/bin/uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

#### フロントエンド起動

```bash
cd /home/maya/work/security-robot-fe
pnpm run dev
```

#### Redis起動 (Docker)

```bash
docker run -d --name redis-rl -p 6379:6379 redis:latest
```

#### Celery Worker起動

```bash
cd /home/maya/work/security-robot-be
/home/maya/.local/bin/uv run celery -A app.tasks.celery_app worker --loglevel=info
```

### 🧪 テスト可能な機能 (Redis/Celeryなし)

現在の状態でテスト可能:

1. **フロントエンドUI**
   - ダッシュボード表示
   - トレーニングページレイアウト
   - 環境設定ページ
   - モデル管理ページ

2. **APIエンドポイント**
   - GET /api/v1/health/
   - GET /api/v1/training/list
   - GET /api/v1/environment/definitions
   - GET /api/v1/files/list

3. **フロントエンド→バックエンド通信**
   - API接続テスト
   - セッション一覧取得
   - 環境定義取得

### 🎯 次回セッションで実施すべきこと

1. Redis + Celery Worker のセットアップ
2. 学習セッションの作成テスト
3. WebSocket接続のテスト
4. リアルタイム学習進捗表示のテスト
5. 環境可視化の動作確認

