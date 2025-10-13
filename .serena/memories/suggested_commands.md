# 推奨コマンド

## 開発コマンド

### 起動・ビルド
```bash
pnpm dev                 # 開発サーバー起動 (http://localhost:3000)
pnpm build              # プロダクションビルド
pnpm preview            # ビルド結果プレビュー
```

### テスト
```bash
pnpm test               # 単体テスト実行 (Vitest)
pnpm test:coverage      # カバレッジ付きテスト
pnpm e2e                # E2Eテスト実行 (Playwright)
```

### コード品質
```bash
pnpm lint               # ESLint実行
pnpm lint:fix           # ESLint自動修正
pnpm lintfix            # lint:fixのエイリアス
pnpm stylelint          # Stylelint実行
pnpm stylelint:fix      # Stylelint自動修正
pnpm typecheck          # TypeScript型チェック
```

## Git操作
```bash
git status              # 変更状態確認
git add .               # 全変更をステージング
git commit -m "message" # コミット
git log                 # コミット履歴
git diff                # 変更差分確認
```

## システムコマンド (Linux/WSL)
```bash
ls                      # ファイル一覧
cd <dir>                # ディレクトリ移動
pwd                     # 現在のディレクトリ
cat <file>              # ファイル内容表示
grep <pattern> <file>   # パターン検索
find <dir> -name <pattern> # ファイル検索
```

## Backend API確認
```bash
# Backend起動確認
curl -s http://127.0.0.1:8000/api/v1/health

# Environment definitions取得
curl -s http://127.0.0.1:8000/api/v1/environment/definitions
```

## よく使うワークフロー

### 開発前
```bash
pnpm dev                # 開発サーバー起動
# 別ターミナルでバックエンド起動も忘れずに
```

### コミット前
```bash
pnpm lint:fix           # Lint自動修正
pnpm typecheck          # 型チェック
pnpm test               # テスト実行
# すべてパスしたら git commit
```

### Phase完了時
```bash
pnpm test               # 全テストパス確認
pnpm lint               # Lint確認
pnpm build              # ビルド確認
git add .
git commit -m "feat: Phase XX complete"
```
